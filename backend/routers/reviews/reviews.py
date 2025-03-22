from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from typing import List

from database import get_db
from models import User, Review, FreelancerDetails
from schemas import ReviewCreate, ReviewResponse

router = APIRouter()

@router.post("/", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
async def create_review(review_data: ReviewCreate, db: AsyncSession = Depends(get_db)):
    """
    Create a new review for a freelancer.
    Only employers can leave reviews for freelancers.
    Updates the freelancer's average rating.
    """
    # Validate rating is between 1 and 5
    if not 1 <= review_data.rating <= 5:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Rating must be between 1 and 5"
        )
    
    # Check if employer exists and is actually an employer
    result = await db.execute(select(User).filter(User.clerkId == review_data.employer_clerk_id))
    employer = result.scalar_one_or_none()
    
    if not employer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Employer with clerkId {review_data.employer_clerk_id} not found"
        )
    
    if employer.role != "EMPLOYER":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only employers can leave reviews"
        )
    
    # Check if freelancer exists and is actually a freelancer
    result = await db.execute(select(User).filter(User.clerkId == review_data.freelancer_clerk_id))
    freelancer = result.scalar_one_or_none()
    
    if not freelancer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Freelancer with clerkId {review_data.freelancer_clerk_id} not found"
        )
    
    if freelancer.role != "FREELANCER":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Reviews can only be left for freelancers"
        )
    
    # Create new review
    new_review = Review(
        rating=review_data.rating,
        employer_clerk_id=review_data.employer_clerk_id,
        freelancer_clerk_id=review_data.freelancer_clerk_id
    )
    
    db.add(new_review)
    await db.commit()
    await db.refresh(new_review)
    
    # Update the freelancer's average rating
    # First, get all reviews for this freelancer
    result = await db.execute(
        select(func.avg(Review.rating))
        .filter(Review.freelancer_clerk_id == review_data.freelancer_clerk_id)
    )
    avg_rating = result.scalar_one_or_none()
    
    # Update freelancer's average rating in the freelancer details
    if avg_rating:
        result = await db.execute(
            select(FreelancerDetails)
            .filter(FreelancerDetails.clerkId == review_data.freelancer_clerk_id)
        )
        freelancer_details = result.scalar_one_or_none()
        
        if freelancer_details:
            # Update the average rating, rounded to 1 decimal place
            freelancer_details.averageRating = round(avg_rating, 1)
            await db.commit()
    
    return new_review 