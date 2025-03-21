from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

from database import get_db
from models import User, UserDetails, FreelancerDetails, EmployerDetails
from schemas import (
    UserDetailsCreate, UserDetailsResponse, UserDetailsBase,
    FreelancerDetailsCreate, FreelancerDetailsResponse, FreelancerDetailsBase,
    EmployerDetailsCreate, EmployerDetailsResponse, EmployerDetailsBase
)

router = APIRouter()

# UserDetails routes

@router.post("/basic", response_model=UserDetailsResponse, status_code=status.HTTP_201_CREATED)
async def create_user_details(user_details_data: UserDetailsCreate, db: AsyncSession = Depends(get_db)):
    """
    Create basic user details for a user.
    """
    # Check if user exists
    result = await db.execute(select(User).filter(User.clerkId == user_details_data.clerkId))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with clerkId {user_details_data.clerkId} not found"
        )
    
    # Check if user details already exist
    result = await db.execute(
        select(UserDetails).filter(UserDetails.clerkId == user_details_data.clerkId)
    )
    existing_details = result.scalar_one_or_none()
    
    if existing_details:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"User details for clerkId {user_details_data.clerkId} already exist"
        )
    
    # Create new user details
    new_user_details = UserDetails(
        clerkId=user_details_data.clerkId,
        phone=user_details_data.phone,
        address=user_details_data.address,
        bio=user_details_data.bio,
        profilePicture=user_details_data.profilePicture
    )
    
    # Add to database and commit
    db.add(new_user_details)
    await db.commit()
    await db.refresh(new_user_details)
    
    return new_user_details

@router.put("/basic/{clerk_id}", response_model=UserDetailsResponse)
async def update_user_details(
    clerk_id: str, 
    user_details_data: UserDetailsBase, 
    db: AsyncSession = Depends(get_db)
):
    """
    Update basic user details for a user.
    """
    # Check if user details exist
    result = await db.execute(select(UserDetails).filter(UserDetails.clerkId == clerk_id))
    user_details = result.scalar_one_or_none()
    
    if not user_details:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User details for clerkId {clerk_id} not found"
        )
    
    # Update fields
    for field, value in user_details_data.dict(exclude_unset=True).items():
        setattr(user_details, field, value)
    
    # Commit changes
    await db.commit()
    await db.refresh(user_details)
    
    return user_details

@router.get("/basic/{clerk_id}", response_model=UserDetailsResponse)
async def get_user_details(clerk_id: str, db: AsyncSession = Depends(get_db)):
    """
    Get basic user details for a user.
    """
    result = await db.execute(select(UserDetails).filter(UserDetails.clerkId == clerk_id))
    user_details = result.scalar_one_or_none()
    
    if not user_details:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User details for clerkId {clerk_id} not found"
        )
    
    return user_details

@router.delete("/basic/{clerk_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user_details(clerk_id: str, db: AsyncSession = Depends(get_db)):
    """
    Delete basic user details for a user.
    """
    result = await db.execute(select(UserDetails).filter(UserDetails.clerkId == clerk_id))
    user_details = result.scalar_one_or_none()
    
    if not user_details:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User details for clerkId {clerk_id} not found"
        )
    
    # Delete user details
    await db.delete(user_details)
    await db.commit()
    
    return {"message": "User details deleted successfully"}

# FreelancerDetails routes

@router.post("/freelancer", response_model=FreelancerDetailsResponse, status_code=status.HTTP_201_CREATED)
async def create_freelancer_details(
    freelancer_data: FreelancerDetailsCreate, 
    db: AsyncSession = Depends(get_db)
):
    """
    Create freelancer details for a user.
    """
    # Check if user exists
    result = await db.execute(select(User).filter(User.clerkId == freelancer_data.clerkId))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with clerkId {freelancer_data.clerkId} not found"
        )
    
    # Check if user is a freelancer
    if user.role != "FREELANCER":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"User with clerkId {freelancer_data.clerkId} is not a freelancer"
        )
    
    # Check if freelancer details already exist
    result = await db.execute(select(FreelancerDetails).filter(FreelancerDetails.clerkId == freelancer_data.clerkId))
    existing_details = result.scalar_one_or_none()
    
    if existing_details:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Freelancer details for clerkId {freelancer_data.clerkId} already exist"
        )
    
    # Create new freelancer details
    new_freelancer_details = FreelancerDetails(
        clerkId=freelancer_data.clerkId,
        occupation=freelancer_data.occupation,
        skills=freelancer_data.skills,
        portfolioLinks=freelancer_data.portfolioLinks or []
    )
    
    # Add to database and commit
    db.add(new_freelancer_details)
    await db.commit()
    await db.refresh(new_freelancer_details)
    
    return new_freelancer_details

@router.put("/freelancer/{clerk_id}", response_model=FreelancerDetailsResponse)
async def update_freelancer_details(
    clerk_id: str, 
    freelancer_data: FreelancerDetailsBase, 
    db: AsyncSession = Depends(get_db)
):
    """
    Update freelancer details for a user.
    """
    # Check if freelancer details exist
    result = await db.execute(select(FreelancerDetails).filter(FreelancerDetails.clerkId == clerk_id))
    freelancer_details = result.scalar_one_or_none()
    
    if not freelancer_details:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Freelancer details for clerkId {clerk_id} not found"
        )
    
    # Update fields
    for field, value in freelancer_data.dict(exclude_unset=True).items():
        setattr(freelancer_details, field, value)
    
    # Commit changes
    await db.commit()
    await db.refresh(freelancer_details)
    
    return freelancer_details

@router.get("/freelancer/{clerk_id}", response_model=FreelancerDetailsResponse)
async def get_freelancer_details(clerk_id: str, db: AsyncSession = Depends(get_db)):
    """
    Get freelancer details for a user.
    """
    result = await db.execute(select(FreelancerDetails).filter(FreelancerDetails.clerkId == clerk_id))
    freelancer_details = result.scalar_one_or_none()
    
    if not freelancer_details:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Freelancer details for clerkId {clerk_id} not found"
        )
    
    return freelancer_details

@router.delete("/freelancer/{clerk_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_freelancer_details(clerk_id: str, db: AsyncSession = Depends(get_db)):
    """
    Delete freelancer details for a user.
    """
    result = await db.execute(select(FreelancerDetails).filter(FreelancerDetails.clerkId == clerk_id))
    freelancer_details = result.scalar_one_or_none()
    
    if not freelancer_details:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Freelancer details for clerkId {clerk_id} not found"
        )
    
    # Delete freelancer details
    await db.delete(freelancer_details)
    await db.commit()
    
    return {"message": "Freelancer details deleted successfully"}

# EmployerDetails routes

@router.post("/employer", response_model=EmployerDetailsResponse, status_code=status.HTTP_201_CREATED)
async def create_employer_details(
    employer_data: EmployerDetailsCreate, 
    db: AsyncSession = Depends(get_db)
):
    """
    Create employer details for a user.
    """
    # Check if user exists
    result = await db.execute(select(User).filter(User.clerkId == employer_data.clerkId))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with clerkId {employer_data.clerkId} not found"
        )
    
    # Check if user is an employer
    if user.role != "EMPLOYER":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"User with clerkId {employer_data.clerkId} is not an employer"
        )
    
    # Check if employer details already exist
    result = await db.execute(select(EmployerDetails).filter(EmployerDetails.clerkId == employer_data.clerkId))
    existing_details = result.scalar_one_or_none()
    
    if existing_details:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Employer details for clerkId {employer_data.clerkId} already exist"
        )
    
    # Create new employer details
    new_employer_details = EmployerDetails(
        clerkId=employer_data.clerkId,
        worksNeeded=employer_data.worksNeeded
    )
    
    # Add to database and commit
    db.add(new_employer_details)
    await db.commit()
    await db.refresh(new_employer_details)
    
    return new_employer_details

@router.put("/employer/{clerk_id}", response_model=EmployerDetailsResponse)
async def update_employer_details(
    clerk_id: str, 
    employer_data: EmployerDetailsBase, 
    db: AsyncSession = Depends(get_db)
):
    """
    Update employer details for a user.
    """
    # Check if employer details exist
    result = await db.execute(select(EmployerDetails).filter(EmployerDetails.clerkId == clerk_id))
    employer_details = result.scalar_one_or_none()
    
    if not employer_details:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Employer details for clerkId {clerk_id} not found"
        )
    
    # Update fields
    for field, value in employer_data.dict(exclude_unset=True).items():
        setattr(employer_details, field, value)
    
    # Commit changes
    await db.commit()
    await db.refresh(employer_details)
    
    return employer_details

@router.get("/employer/{clerk_id}", response_model=EmployerDetailsResponse)
async def get_employer_details(clerk_id: str, db: AsyncSession = Depends(get_db)):
    """
    Get employer details for a user.
    """
    result = await db.execute(select(EmployerDetails).filter(EmployerDetails.clerkId == clerk_id))
    employer_details = result.scalar_one_or_none()
    
    if not employer_details:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Employer details for clerkId {clerk_id} not found"
        )
    
    return employer_details

@router.delete("/employer/{clerk_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_employer_details(clerk_id: str, db: AsyncSession = Depends(get_db)):
    """
    Delete employer details for a user.
    """
    result = await db.execute(select(EmployerDetails).filter(EmployerDetails.clerkId == clerk_id))
    employer_details = result.scalar_one_or_none()
    
    if not employer_details:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Employer details for clerkId {clerk_id} not found"
        )
    
    # Delete employer details
    await db.delete(employer_details)
    await db.commit()
    
    return {"message": "Employer details deleted successfully"} 