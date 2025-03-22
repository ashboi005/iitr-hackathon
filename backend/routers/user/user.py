from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

from database import get_db
from models import User
from schemas import UserCreate, UserResponse

router = APIRouter()

@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(user_data: UserCreate, db: AsyncSession = Depends(get_db)):
    """
    Create a new user in the database.
    This endpoint is intended for backend use to create a user after Clerk authentication.
    """
    # Check if user with this clerk_id already exists
    result = await db.execute(select(User).filter(User.clerkId == user_data.clerkId))
    existing_user = result.scalar_one_or_none()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"User with clerkId {user_data.clerkId} already exists"
        )
    
    # Check if user with this email already exists
    result = await db.execute(select(User).filter(User.email == user_data.email))
    existing_email = result.scalar_one_or_none()
    
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"User with email {user_data.email} already exists"
        )
    
    if user_data.role not in ["FREELANCER", "EMPLOYER", "ADMIN"]:
        raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Invalid role"
    )

    
    # Create new user object
    new_user = User(
        clerkId=user_data.clerkId,
        email=user_data.email,
        firstName=user_data.firstName,
        lastName=user_data.lastName,
        role=user_data.role
    )
    
    # Add to database and commit
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    
    return new_user

@router.delete("/{clerk_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(clerk_id: str, db: AsyncSession = Depends(get_db)):
    """
    Delete a user from the database.
    """
    # Find user
    result = await db.execute(select(User).filter(User.clerkId == clerk_id))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with clerkId {clerk_id} not found"
        )
    
    # Delete user
    await db.delete(user)
    await db.commit()
    
    return {"message": "User deleted successfully"}

@router.get("/{clerk_id}", response_model=UserResponse)
async def get_user(clerk_id: str, db: AsyncSession = Depends(get_db)):
    """
    Get a user by clerk_id.
    """
    result = await db.execute(select(User).filter(User.clerkId == clerk_id))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with clerkId {clerk_id} not found"
        )
    
    return user

@router.get("/", response_model=List[UserResponse])
async def get_all_users(db: AsyncSession = Depends(get_db)):
    """
    Get all users.
    """
    result = await db.execute(select(User))
    users = result.scalars().all()
    
    return users 