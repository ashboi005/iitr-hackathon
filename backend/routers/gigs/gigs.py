from fastapi import APIRouter, Depends, HTTPException, status, Query, File, UploadFile, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import and_, or_, func, any_, text, update
from typing import List, Optional, Dict, Any
from datetime import datetime
import json

from database import get_db
from models import Gig, User, GigRequest, ActiveGig, Balance, CompanyBalance
from schemas import (
    GigCreate, 
    GigResponse, 
    GigFilter, 
    GigRequestCreate, 
    GigRequestResponse, 
    ActiveGigCreate, 
    ActiveGigResponse, 
    MilestoneSubmission,
    PaymentVerification,
    GigWithRequests,
    GigWithActiveGig,
    StatusResponse,
    MilestoneLinksResponse,
    MilestoneSubmitResponse,
    MilestoneApproveResponse
)
from utils.twilio import (
    notify_employer_new_gig_request,
    notify_freelancer_gig_request_accepted,
    notify_freelancer_gig_request_rejected,
    notify_employer_milestone_submitted,
    notify_freelancer_milestone_approved,
    notify_freelancer_milestone_rejected,
    notify_freelancer_gig_completed,
    notify_employer_gig_completed
)
from utils.aws import upload_image_to_s3, is_url

router = APIRouter()

# Create a gig (employer only)
@router.post("/", response_model=GigResponse, status_code=status.HTTP_201_CREATED)
async def create_gig(gig_data: GigCreate, db: AsyncSession = Depends(get_db)):
    """
    Create a new gig post by an employer.
    """
    # Verify that the user is an employer
    result = await db.execute(select(User).filter(User.clerkId == gig_data.employerClerkId))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with clerkId {gig_data.employerClerkId} not found"
        )
        
    if user.role != "EMPLOYER":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only employers can create gigs"
        )
    
    # Validate milestone data
    if len(gig_data.milestones) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one milestone is required"
        )
        
    if len(gig_data.milestones) != len(gig_data.milestone_payments):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Number of milestones must match number of milestone payments"
        )
    
    # Verify that total payment is the sum of milestone payments
    calculated_total = sum(gig_data.milestone_payments)
    if abs(calculated_total - gig_data.total_payment) > 0.01:  # Allow small float imprecision
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Total payment ({gig_data.total_payment}) does not match sum of milestone payments ({calculated_total})"
        )
    
    # Create new gig
    new_gig = Gig(
        title=gig_data.title,
        description=gig_data.description,
        skills_needed=gig_data.skills_needed,
        project_deadline=gig_data.project_deadline.replace(tzinfo=None) if gig_data.project_deadline.tzinfo else gig_data.project_deadline,
        milestones=gig_data.milestones,
        milestone_payments=gig_data.milestone_payments,
        total_payment=gig_data.total_payment,
        employerClerkId=gig_data.employerClerkId
    )
    
    db.add(new_gig)
    await db.commit()
    await db.refresh(new_gig)
    
    return new_gig

# Get all gigs with optional filtering
@router.get("/", response_model=List[GigResponse])
async def get_gigs(
    title: Optional[str] = None,
    skills: Optional[List[str]] = Query(None),
    min_payment: Optional[float] = None,
    max_payment: Optional[float] = None,
    status: Optional[str] = "OPEN",
    db: AsyncSession = Depends(get_db)
):
    """
    Get all available gigs with optional filtering.
    """
    query = select(Gig)
    
    # Apply filters if provided
    if title:
        query = query.filter(Gig.title.ilike(f"%{title}%"))
    
    if skills:
        # For PostgreSQL ARRAY type, we need to use the any operator
        # to check if any element of the skills_needed array matches any of our skills
        for skill in skills:
            # Use PostgreSQL's ANY operator for array element matching
            query = query.filter(skill == any_(Gig.skills_needed))
    
    if min_payment is not None:
        query = query.filter(Gig.total_payment >= min_payment)
    
    if max_payment is not None:
        query = query.filter(Gig.total_payment <= max_payment)
    
    if status:
        query = query.filter(Gig.status == status)
    
    result = await db.execute(query)
    gigs = result.scalars().all()
    
    return gigs

# Get a specific gig by ID
@router.get("/{gig_id}", response_model=GigResponse)
async def get_gig(gig_id: int, db: AsyncSession = Depends(get_db)):
    """
    Get a specific gig by its ID.
    """
    result = await db.execute(select(Gig).filter(Gig.id == gig_id))
    gig = result.scalar_one_or_none()
    
    if not gig:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Gig with ID {gig_id} not found"
        )
    
    return gig

# Get gigs by employer
@router.get("/employer/{clerk_id}", response_model=List[GigResponse])
async def get_employer_gigs(clerk_id: str, db: AsyncSession = Depends(get_db)):
    """
    Get all gigs posted by a specific employer.
    """
    result = await db.execute(select(Gig).filter(Gig.employerClerkId == clerk_id))
    gigs = result.scalars().all()
    
    return gigs

# Create a gig request (freelancer applies for a gig)
@router.post("/request", response_model=GigRequestResponse, status_code=status.HTTP_201_CREATED)
async def create_gig_request(request_data: GigRequestCreate, db: AsyncSession = Depends(get_db)):
    """
    Create a new gig request (freelancer application).
    """
    # Verify that the gig exists and is OPEN
    result = await db.execute(select(Gig).filter(Gig.id == request_data.gig_id))
    gig = result.scalar_one_or_none()
    
    if not gig:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Gig with ID {request_data.gig_id} not found"
        )
    
    if gig.status != "OPEN":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This gig is not open for applications"
        )
    
    # Verify that the user is a freelancer
    result = await db.execute(select(User).filter(User.clerkId == request_data.freelancerClerkId))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with clerkId {request_data.freelancerClerkId} not found"
        )
        
    if user.role != "FREELANCER":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only freelancers can apply for gigs"
        )
    
    # Check if user has already applied for this gig
    result = await db.execute(
        select(GigRequest).filter(
            and_(
                GigRequest.gig_id == request_data.gig_id,
                GigRequest.freelancerClerkId == request_data.freelancerClerkId
            )
        )
    )
    existing_request = result.scalar_one_or_none()
    
    if existing_request:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="You have already applied for this gig"
        )
    
    # Create the gig request
    new_request = GigRequest(
        gig_id=request_data.gig_id,
        freelancerClerkId=request_data.freelancerClerkId,
        employerClerkId=gig.employerClerkId
    )
    
    db.add(new_request)
    await db.commit()
    await db.refresh(new_request)
    
    # Send Twilio notification to employer about new request
    # Get user names for the notification
    employer_result = await db.execute(select(User).filter(User.clerkId == gig.employerClerkId))
    employer = employer_result.scalar_one_or_none()
    
    freelancer_result = await db.execute(select(User).filter(User.clerkId == request_data.freelancerClerkId))
    freelancer = freelancer_result.scalar_one_or_none()
    
    if employer and freelancer:
        await notify_employer_new_gig_request(
            employer_phone="+917009023965",
            freelancer_name=freelancer.firstName + " " + freelancer.lastName,
            gig_title=gig.title
        )
    
    return new_request

# Get requests for a specific gig
@router.get("/gig/{gig_id}/requests", response_model=List[GigRequestResponse])
async def get_requests_by_gig(
    gig_id: int,
    clerk_id: Optional[str] = None,
    request_status: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """
    Get all requests for a specific gig.
    If clerk_id is provided, only return requests for that user.
    If status is provided, only return requests with that status.
    """
    # Verify the gig exists
    result = await db.execute(select(Gig).filter(Gig.id == gig_id))
    gig = result.scalar_one_or_none()
    
    if not gig:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Gig with ID {gig_id} not found"
        )
    
    # Build the query
    query = select(GigRequest).filter(GigRequest.gig_id == gig_id)
    
    if clerk_id:
        # Check if user is employer or freelancer
        result = await db.execute(select(User).filter(User.clerkId == clerk_id))
        user = result.scalar_one_or_none()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"User with clerkId {clerk_id} not found"
            )
        
        if user.role == "EMPLOYER":
            query = query.filter(GigRequest.employerClerkId == clerk_id)
        elif user.role == "FREELANCER":
            query = query.filter(GigRequest.freelancerClerkId == clerk_id)
    
    if request_status:
        query = query.filter(GigRequest.status == request_status)
    
    result = await db.execute(query)
    requests = result.scalars().all()
    
    return requests

# Get active gig for a specific gig (if exists)
@router.get("/gig/{gig_id}/active", response_model=Optional[ActiveGigResponse])
async def get_active_gig_by_gig_id(
    gig_id: int,
    clerk_id: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """
    Get the active gig for a specific gig if it exists.
    If clerk_id is provided, verify that the user is part of this active gig.
    """
    # Verify the gig exists
    result = await db.execute(select(Gig).filter(Gig.id == gig_id))
    gig = result.scalar_one_or_none()
    
    if not gig:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Gig with ID {gig_id} not found"
        )
    
    # Build the query
    query = select(ActiveGig).filter(ActiveGig.gig_id == gig_id)
    
    if clerk_id:
        # Check if user is involved in this active gig
        query = query.filter(
            or_(
                ActiveGig.employerClerkId == clerk_id,
                ActiveGig.freelancerClerkId == clerk_id
            )
        )
    
    result = await db.execute(query)
    active_gig = result.scalar_one_or_none()
    
    if not active_gig:
        return None
    
    # Parse milestone_links if it's a JSON string
    if isinstance(active_gig.milestone_links, str):
        try:
            active_gig.milestone_links = json.loads(active_gig.milestone_links)
        except (ValueError, TypeError):
            # If parsing fails, use empty dict
            active_gig.milestone_links = {}
    
    return active_gig

# Get pending requests for a specific employer
@router.get("/requests/employer/{clerk_id}", response_model=List[GigRequestResponse])
async def get_employer_pending_requests(
    clerk_id: str, 
    status: str = "PENDING", 
    db: AsyncSession = Depends(get_db)
):
    """
    Get all pending gig requests for a specific employer.
    """
    result = await db.execute(
        select(GigRequest).filter(
            and_(
                GigRequest.employerClerkId == clerk_id,
                GigRequest.status == status
            )
        )
    )
    requests = result.scalars().all()
    
    return requests

# Get requests for a specific freelancer
@router.get("/requests/freelancer/{clerk_id}", response_model=List[GigRequestResponse])
async def get_freelancer_requests(clerk_id: str, db: AsyncSession = Depends(get_db)):
    """
    Get all gig requests made by a specific freelancer.
    """
    result = await db.execute(select(GigRequest).filter(GigRequest.freelancerClerkId == clerk_id))
    requests = result.scalars().all()
    
    return requests

# Accept or reject a gig request
@router.put("/request/{request_id}", response_model=GigRequestResponse)
async def update_gig_request(
    request_id: int, 
    request_status: str,
    payment_verified: bool = False,
    db: AsyncSession = Depends(get_db)
):
    """
    Accept or reject a gig request.
    """
    if request_status not in ["ACCEPTED", "REJECTED"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Status must be ACCEPTED or REJECTED"
        )
    
    # Get the request
    result = await db.execute(select(GigRequest).filter(GigRequest.id == request_id))
    request = result.scalar_one_or_none()
    
    if not request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Gig request with ID {request_id} not found"
        )
    
    if request.status != "PENDING":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"This request has already been {request.status.lower()}"
        )
    
    # Update the request status
    request.status = request_status
    
    # If accepting, need to handle payment and create ActiveGig
    if request_status == "ACCEPTED":
        # Payment verification is required for accepting
        if not payment_verified:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Payment verification is required to accept a request"
            )
        
        # Get the gig details
        result = await db.execute(select(Gig).filter(Gig.id == request.gig_id))
        gig = result.scalar_one_or_none()
        
        # Update gig status to CLOSED
        gig.status = "CLOSED"
        
        # Get employer's balance
        result = await db.execute(
            select(Balance).filter(Balance.clerkId == request.employerClerkId)
        )
        employer_balance = result.scalar_one_or_none()
        
        if not employer_balance:
            # Create employer balance if it doesn't exist
            employer_balance = Balance(clerkId=request.employerClerkId, amount=0)
            db.add(employer_balance)
            await db.commit()
            await db.refresh(employer_balance)
        
        # Check if employer has enough balance for first milestone
        first_milestone_payment = gig.milestone_payments[0]
        if employer_balance.amount < first_milestone_payment:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient balance to pay for the first milestone (${first_milestone_payment})"
            )
        
        # Deduct amount from employer balance
        employer_balance.amount -= first_milestone_payment
        
        # Add to company balance
        result = await db.execute(select(CompanyBalance))
        company_balance = result.scalar_one_or_none()
        
        if not company_balance:
            company_balance = CompanyBalance(amount=0)
            db.add(company_balance)
        
        company_balance.amount += first_milestone_payment
        
        # Create an ActiveGig entry
        new_active_gig = ActiveGig(
            gig_id=request.gig_id,
            freelancerClerkId=request.freelancerClerkId,
            employerClerkId=request.employerClerkId,
            milestone_status=["PENDING"] * len(gig.milestones),
            milestone_links={}
        )
        
        db.add(new_active_gig)
    
    # For both accept and reject, send Twilio notification
    # Get user details
    employer_result = await db.execute(select(User).filter(User.clerkId == request.employerClerkId))
    employer = employer_result.scalar_one_or_none()
    
    freelancer_result = await db.execute(select(User).filter(User.clerkId == request.freelancerClerkId))
    freelancer = freelancer_result.scalar_one_or_none()
    
    # Get gig details
    gig_result = await db.execute(select(Gig).filter(Gig.id == request.gig_id))
    gig = gig_result.scalar_one_or_none()
    
    if employer and freelancer and gig:
        if request_status == "ACCEPTED":
            await notify_freelancer_gig_request_accepted(
                freelancer_phone="+917009023965",
                gig_title=gig.title,
                employer_name=employer.firstName + " " + employer.lastName
            )
        elif request_status == "REJECTED":
            await notify_freelancer_gig_request_rejected(
                freelancer_phone="+917009023965",
                gig_title=gig.title,
                employer_name=employer.firstName + " " + employer.lastName
            )
    
    await db.commit()
    await db.refresh(request)
    
    return request


# Get active gigs for an employer
@router.get("/active/employer/{clerk_id}", response_model=List[ActiveGigResponse])
async def get_employer_active_gigs(clerk_id: str, db: AsyncSession = Depends(get_db)):
    """
    Get all active gigs for a specific employer.
    """
    result = await db.execute(select(ActiveGig).filter(ActiveGig.employerClerkId == clerk_id))
    active_gigs = result.scalars().all()
    
    # Process the active gigs to ensure milestone_links is properly formatted
    processed_gigs = []
    for gig in active_gigs:
        # Make a copy of the gig to avoid modifying the original
        processed_gig = gig
        
        # Parse milestone_links if it's a JSON string
        milestone_links = gig.milestone_links
        if isinstance(milestone_links, str):
            try:
                processed_gig.milestone_links = json.loads(milestone_links)
            except (ValueError, TypeError):
                processed_gig.milestone_links = {}
        
        processed_gigs.append(processed_gig)
    
    return processed_gigs

# Get active gigs for a freelancer
@router.get("/active/freelancer/{clerk_id}", response_model=List[ActiveGigResponse])
async def get_freelancer_active_gigs(clerk_id: str, db: AsyncSession = Depends(get_db)):
    """
    Get all active gigs for a specific freelancer.
    """
    result = await db.execute(select(ActiveGig).filter(ActiveGig.freelancerClerkId == clerk_id))
    active_gigs = result.scalars().all()
    
    # Process the active gigs to ensure milestone_links is properly formatted
    processed_gigs = []
    for gig in active_gigs:
        # Make a copy of the gig to avoid modifying the original
        processed_gig = gig
        
        # Parse milestone_links if it's a JSON string
        milestone_links = gig.milestone_links
        if isinstance(milestone_links, str):
            try:
                processed_gig.milestone_links = json.loads(milestone_links)
            except (ValueError, TypeError):
                processed_gig.milestone_links = {}
        
        processed_gigs.append(processed_gig)
    
    return processed_gigs

# Submit milestone
@router.post("/active/{active_gig_id}/milestone", response_model=MilestoneSubmitResponse,
          summary="Submit milestone with links and files",
          description="Submit a milestone with both links and file uploads for a gig.",
          openapi_extra={
              "requestBody": {
                  "content": {
                      "multipart/form-data": {
                          "schema": {
                              "type": "object",
                              "properties": {
                                  "milestone_index": {"type": "integer"},
                                  "links": {
                                      "type": "string", 
                                      "description": "JSON string array of links"
                                  },
                                  "files": {
                                      "type": "array",
                                      "items": {
                                          "type": "string",
                                          "format": "binary"
                                      }
                                  }
                              },
                              "required": ["milestone_index", "links"]
                          }
                      }
                  }
              }
          })
async def submit_milestone(
    active_gig_id: int,
    milestone_index: int = Form(...),
    links: str = Form(...),
    files: List[UploadFile] = File([]),
    db: AsyncSession = Depends(get_db)
):
    """
    Submit links and/or files for a milestone.
    
    Args:
        active_gig_id: The ID of the active gig (path parameter)
        milestone_index: The index of the milestone to submit
        links: A JSON string containing an array of links (e.g., ["https://example.com", "https://example2.com"])
        files: Optional list of image files to upload
    """
    # Get the active gig
    result = await db.execute(select(ActiveGig).filter(ActiveGig.id == active_gig_id))
    active_gig = result.scalar_one_or_none()
    
    if not active_gig:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Active gig with ID {active_gig_id} not found"
        )
    
    if active_gig.status != "ACTIVE":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"This gig is not active (current status: {active_gig.status})"
        )
    
    # Parse the links from JSON string
    try:
        submission_links = json.loads(links)
        if not isinstance(submission_links, list):
            submission_links = []
    except (json.JSONDecodeError, TypeError):
        # If the link is not a valid JSON array, try treating it as a single URL
        if isinstance(links, str) and links.strip():
            submission_links = [links.strip()]
        else:
            submission_links = []
    
    # Upload any files to S3 and add their URLs to the links
    for file in files:
        if file and file.filename:  # Check if file is not None and not empty
            try:
                file_url = upload_image_to_s3(file, folder="milestones")
                submission_links.append(file_url)
            except Exception as e:
                print(f"Error uploading file {file.filename}: {str(e)}")
                # Continue with other files even if one fails
    
    # Create submission object
    submission = MilestoneSubmission(
        milestone_index=milestone_index,
        links=submission_links
    )
    
    # Check milestone index is valid
    if submission.milestone_index < 0 or submission.milestone_index >= len(active_gig.milestone_status):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid milestone index. Must be between 0 and {len(active_gig.milestone_status) - 1}"
        )
    
    # Check if previous milestones are completed
    for i in range(submission.milestone_index):
        if active_gig.milestone_status[i] != "APPROVED":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Previous milestone (index {i}) must be approved before submitting milestone {submission.milestone_index}"
            )
    
    print(f"Before update - milestone_links: {active_gig.milestone_links}")
    print(f"Submission: {submission}")
    
    # Ensure milestone_links is initialized
    if active_gig.milestone_links is None:
        active_gig.milestone_links = {}
    
    # Convert milestone_links to a fresh dictionary
    # Handle different possible formats safely
    if isinstance(active_gig.milestone_links, dict):
        current_links = dict(active_gig.milestone_links)
    else:
        try:
            # Try to load it as JSON string
            current_links = json.loads(active_gig.milestone_links) if active_gig.milestone_links else {}
        except (TypeError, ValueError):
            # If all else fails, start with empty dict
            print("Could not parse milestone_links, initializing empty dict")
            current_links = {}
    
    # Update the dictionary
    milestone_key = str(submission.milestone_index)
    current_links[milestone_key] = submission.links
    
    # Assign back to the model
    active_gig.milestone_links = current_links
    print(f"After setting - milestone_links: {active_gig.milestone_links}")
    
    # Update milestone status to PENDING
    active_gig.milestone_status[submission.milestone_index] = "PENDING"
    
    # Execute a direct SQL update for milestone_links to ensure it's properly stored
    
    milestone_links_json = json.dumps(current_links)
    
    # Use the update method from SQLAlchemy instead of direct text SQL
    await db.execute(
        update(ActiveGig)
        .where(ActiveGig.id == active_gig_id)
        .values(
            milestone_links=milestone_links_json,
            milestone_status=active_gig.milestone_status
        )
    )
    
    await db.commit()
    print("After commit")
    
    # Re-fetch the gig to ensure we have the latest data
    result = await db.execute(select(ActiveGig).filter(ActiveGig.id == active_gig_id))
    active_gig = result.scalar_one_or_none()
    print(f"After refresh - milestone_links: {active_gig.milestone_links}")
    
    # Send notification to employer about milestone submission
    # Get gig details
    gig_result = await db.execute(select(Gig).filter(Gig.id == active_gig.gig_id))
    gig = gig_result.scalar_one_or_none()
    
    # Get user details
    employer_result = await db.execute(select(User).filter(User.clerkId == active_gig.employerClerkId))
    employer = employer_result.scalar_one_or_none()
    
    freelancer_result = await db.execute(select(User).filter(User.clerkId == active_gig.freelancerClerkId))
    freelancer = freelancer_result.scalar_one_or_none()
    
    if employer and freelancer and gig:
        await notify_employer_milestone_submitted(
            employer_phone="+917009023965",
            freelancer_name=freelancer.firstName + " " + freelancer.lastName,
            gig_title=gig.title,
            milestone_number=submission.milestone_index + 1  # Convert 0-index to human-readable 1-index
        )
    
    # Parse milestone_links if it's a JSON string
    milestone_links_data = active_gig.milestone_links
    if isinstance(milestone_links_data, str):
        try:
            milestone_links_data = json.loads(milestone_links_data)
        except (ValueError, TypeError):
            # If parsing fails, use empty dict
            milestone_links_data = {}
    
    # Return a consistent response with all fields
    response = {
        "success": True,
        "message": f"Milestone {submission.milestone_index} submitted successfully",
        "active_gig_id": active_gig.id,
        "gig_id": active_gig.gig_id,
        "milestone_index": submission.milestone_index,
        "links": submission.links,
        "milestone_links": milestone_links_data or {milestone_key: submission.links},
        "milestone_status": active_gig.milestone_status
    }
    
    print(f"Response: {response}")
    return response

# Approve milestone
@router.put("/active/{active_gig_id}/milestone/{milestone_index}/approve", response_model=MilestoneApproveResponse)
async def approve_milestone(
    active_gig_id: int,
    milestone_index: int,
    payment_verified: bool = False,
    db: AsyncSession = Depends(get_db)
):
    """
    Approve a milestone submission.
    """
    # Get the active gig
    result = await db.execute(select(ActiveGig).filter(ActiveGig.id == active_gig_id))
    active_gig = result.scalar_one_or_none()
    
    if not active_gig:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Active gig with ID {active_gig_id} not found"
        )
    
    if active_gig.status != "ACTIVE":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"This gig is not active (current status: {active_gig.status})"
        )
    
    # Check milestone index is valid
    if milestone_index < 0 or milestone_index >= len(active_gig.milestone_status):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid milestone index. Must be between 0 and {len(active_gig.milestone_status) - 1}"
        )
    
    # Ensure milestone_links is initialized
    if active_gig.milestone_links is None:
        active_gig.milestone_links = {}
    
    # Convert milestone_links to a fresh dictionary
    # Handle different possible formats safely
    if isinstance(active_gig.milestone_links, dict):
        milestone_links = dict(active_gig.milestone_links)
    else:
        try:
            # Try to load it as JSON string
            milestone_links = json.loads(active_gig.milestone_links) if active_gig.milestone_links else {}
        except (TypeError, ValueError):
            # If all else fails, start with empty dict
            print("Could not parse milestone_links, initializing empty dict")
            milestone_links = {}
    
    milestone_key = str(milestone_index)
    
    # Check if milestone has been submitted
    if milestone_key not in milestone_links:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Milestone {milestone_index} has not been submitted yet"
        )
    
    # Check if milestone is already approved
    if active_gig.milestone_status[milestone_index] == "APPROVED":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Milestone {milestone_index} is already approved"
        )
    
    # Get the gig details
    result = await db.execute(select(Gig).filter(Gig.id == active_gig.gig_id))
    gig = result.scalar_one_or_none()
    
    # Process payment for the completed milestone
    current_milestone_payment = gig.milestone_payments[milestone_index]
    
    # Get company balance
    result = await db.execute(select(CompanyBalance))
    company_balance = result.scalar_one_or_none()
    
    if not company_balance:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Company balance not found"
        )
    
    # Check if company has enough balance
    if company_balance.amount < current_milestone_payment:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Insufficient company balance to pay for the milestone (${current_milestone_payment})"
        )
    
    # Get freelancer's balance
    result = await db.execute(select(Balance).filter(Balance.clerkId == active_gig.freelancerClerkId))
    freelancer_balance = result.scalar_one_or_none()
    
    if not freelancer_balance:
        # Create freelancer balance if it doesn't exist
        freelancer_balance = Balance(clerkId=active_gig.freelancerClerkId, amount=0)
        db.add(freelancer_balance)
        await db.commit()
        await db.refresh(freelancer_balance)
    
    # Transfer amount from company to freelancer
    company_balance.amount -= current_milestone_payment
    freelancer_balance.amount += current_milestone_payment
    
    # Update milestone status to APPROVED
    active_gig.milestone_status[milestone_index] = "APPROVED"
    
    # If there are more milestones, require payment for the next one
    if milestone_index < len(active_gig.milestone_status) - 1:
        if not payment_verified:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Payment verification for next milestone is required"
            )
        
        # Process payment for next milestone
        next_milestone_payment = gig.milestone_payments[milestone_index + 1]
        
        # Get employer's balance
        result = await db.execute(select(Balance).filter(Balance.clerkId == active_gig.employerClerkId))
        employer_balance = result.scalar_one_or_none()
        
        if not employer_balance:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Employer balance not found"
            )
        
        # Check if employer has enough balance
        if employer_balance.amount < next_milestone_payment:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient employer balance to pay for the next milestone (${next_milestone_payment})"
            )
        
        # Transfer from employer to company
        employer_balance.amount -= next_milestone_payment
        company_balance.amount += next_milestone_payment
    
    # If this was the last milestone, mark the gig as completed
    if milestone_index == len(active_gig.milestone_status) - 1:
        active_gig.status = "COMPLETED"
    
    # Execute a direct SQL update for milestone_links and status to ensure it's properly stored
    
    # Use the update method from SQLAlchemy instead of direct text SQL
    await db.execute(
        update(ActiveGig)
        .where(ActiveGig.id == active_gig_id)
        .values(
            milestone_status=active_gig.milestone_status,
            status=active_gig.status
        )
    )
    
    await db.commit()
    
    # Re-fetch the gig to ensure we have the latest data
    result = await db.execute(select(ActiveGig).filter(ActiveGig.id == active_gig_id))
    active_gig = result.scalar_one_or_none()
    
    print(f"After refresh - active_gig.milestone_links: {active_gig.milestone_links}")
    
    # Send notification to freelancer about milestone approval
    # Get gig details
    gig_result = await db.execute(select(Gig).filter(Gig.id == active_gig.gig_id))
    gig = gig_result.scalar_one_or_none()
    
    # Get user details
    freelancer_result = await db.execute(select(User).filter(User.clerkId == active_gig.freelancerClerkId))
    freelancer = freelancer_result.scalar_one_or_none()
    
    if freelancer and gig:
        current_milestone_payment = gig.milestone_payments[milestone_index]
        await notify_freelancer_milestone_approved(
            freelancer_phone="+917009023965",
            gig_title=gig.title,
            milestone_number=milestone_index + 1,  # Convert 0-index to human-readable 1-index
            payment_amount=current_milestone_payment
        )
        
        # If gig is completed, send completion notifications to both parties
        if active_gig.status == "COMPLETED":
            # Get employer details
            employer_result = await db.execute(select(User).filter(User.clerkId == active_gig.employerClerkId))
            employer = employer_result.scalar_one_or_none()
            
            if employer:
                # Notify freelancer about gig completion
                await notify_freelancer_gig_completed(
                    freelancer_phone="+917009023965",
                    gig_title=gig.title,
                    total_payment=gig.total_payment
                )
                
                # Notify employer about gig completion
                await notify_employer_gig_completed(
                    employer_phone="+917009023965",
                    gig_title=gig.title,
                    freelancer_name=freelancer.firstName + " " + freelancer.lastName
                )
    
    # Parse milestone_links if it's a JSON string
    milestone_links_data = active_gig.milestone_links
    if isinstance(milestone_links_data, str):
        try:
            milestone_links_data = json.loads(milestone_links_data)
        except (ValueError, TypeError):
            # If parsing fails, use empty dict
            milestone_links_data = {}
    
    # Return a response with all relevant information
    return {
        "success": True,
        "message": f"Milestone {milestone_index} approved successfully",
        "active_gig_id": active_gig.id,
        "gig_id": active_gig.gig_id,
        "milestone_index": milestone_index,
        "milestone_links": milestone_links_data,
        "milestone_status": active_gig.milestone_status,
        "payment_amount": current_milestone_payment,
        "status": active_gig.status
    }

# Reject milestone (terminate gig)
@router.put("/active/{active_gig_id}/milestone/{milestone_index}/reject", response_model=ActiveGigResponse)
async def reject_milestone(
    active_gig_id: int,
    milestone_index: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Reject a milestone submission and terminate the gig.
    """
    # Get the active gig
    result = await db.execute(select(ActiveGig).filter(ActiveGig.id == active_gig_id))
    active_gig = result.scalar_one_or_none()
    
    if not active_gig:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Active gig with ID {active_gig_id} not found"
        )
    
    if active_gig.status != "ACTIVE":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"This gig is not active (current status: {active_gig.status})"
        )
    
    # Check milestone index is valid
    if milestone_index < 0 or milestone_index >= len(active_gig.milestone_status):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid milestone index. Must be between 0 and {len(active_gig.milestone_status) - 1}"
        )
    
    # Check if milestone has been submitted
    if active_gig.milestone_links is None:
        active_gig.milestone_links = {}
        
    # Convert to a fresh dictionary
    # Handle different possible formats safely
    if isinstance(active_gig.milestone_links, dict):
        milestone_links = dict(active_gig.milestone_links)
    else:
        try:
            # Try to load it as JSON string
            milestone_links = json.loads(active_gig.milestone_links) if active_gig.milestone_links else {}
        except (TypeError, ValueError):
            # If all else fails, start with empty dict
            print("Could not parse milestone_links, initializing empty dict")
            milestone_links = {}
    
    milestone_key = str(milestone_index)
    
    if milestone_key not in milestone_links:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Milestone {milestone_index} has not been submitted yet"
        )
    
    # Check if milestone is already approved
    if active_gig.milestone_status[milestone_index] == "APPROVED":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Milestone {milestone_index} is already approved and cannot be rejected"
        )
    
    # Get the gig details
    result = await db.execute(select(Gig).filter(Gig.id == active_gig.gig_id))
    gig = result.scalar_one_or_none()
    
    # Update gig status back to OPEN
    gig.status = "OPEN"
    
    # Update active gig status to TERMINATED
    active_gig.status = "TERMINATED"
    
    # Execute SQL update to ensure changes are properly stored
    
    # Use the update method from SQLAlchemy instead of direct text SQL
    await db.execute(
        update(ActiveGig)
        .where(ActiveGig.id == active_gig_id)
        .values(
            status=active_gig.status
        )
    )
    
    # For all approved milestones, pay the freelancer
    # This is already handled in the approve_milestone endpoint
    
    await db.commit()
    
    # Re-fetch the gig to ensure we have the latest data
    result = await db.execute(select(ActiveGig).filter(ActiveGig.id == active_gig_id))
    active_gig = result.scalar_one_or_none()
    
    # Send Twilio notification to freelancer about gig termination
    # Get gig details
    gig_result = await db.execute(select(Gig).filter(Gig.id == active_gig.gig_id))
    gig = gig_result.scalar_one_or_none()
    
    # Get user details
    freelancer_result = await db.execute(select(User).filter(User.clerkId == active_gig.freelancerClerkId))
    freelancer = freelancer_result.scalar_one_or_none()
    
    if freelancer and gig:
        await notify_freelancer_milestone_rejected(
            freelancer_phone="+917009023965",
            gig_title=gig.title
        )
    
    # Parse milestone_links if it's a JSON string
    if isinstance(active_gig.milestone_links, str):
        try:
            active_gig.milestone_links = json.loads(active_gig.milestone_links)
        except (ValueError, TypeError):
            # If parsing fails, use empty dict
            active_gig.milestone_links = {}
    
    return active_gig

@router.get("/active/{active_gig_id}/milestone-links", response_model=MilestoneLinksResponse)
async def get_milestone_links(
    active_gig_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Get milestone links for an active gig.
    This is a helper endpoint to debug and ensure milestone links are correctly stored.
    """
    # Get the active gig
    result = await db.execute(select(ActiveGig).filter(ActiveGig.id == active_gig_id))
    active_gig = result.scalar_one_or_none()
    
    if not active_gig:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Active gig with ID {active_gig_id} not found"
        )
    
    # Get the gig details
    result = await db.execute(select(Gig).filter(Gig.id == active_gig.gig_id))
    gig = result.scalar_one_or_none()
    
    # Print for debugging
    print(f"Active Gig ID: {active_gig.id}")
    print(f"Milestone Links: {active_gig.milestone_links}")
    print(f"Milestone Status: {active_gig.milestone_status}")
    
    # Parse milestone_links if it's a JSON string
    milestone_links_data = active_gig.milestone_links
    if isinstance(milestone_links_data, str):
        try:
            milestone_links_data = json.loads(milestone_links_data)
        except (ValueError, TypeError):
            # If parsing fails, use empty dict
            milestone_links_data = {}
    
    # Return detailed information
    return {
        "active_gig_id": active_gig.id,
        "gig_id": active_gig.gig_id,
        "milestone_links": milestone_links_data if milestone_links_data else {},
        "milestone_status": active_gig.milestone_status,
        "milestone_count": len(active_gig.milestone_status),
        "gig_title": gig.title,
        "gig_milestones": gig.milestones
    }

