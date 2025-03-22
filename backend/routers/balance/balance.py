from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import update
from typing import List, Optional
import json

from database import get_db
from models import Balance, CompanyBalance, User
from schemas import BalanceResponse, CompanyBalanceResponse

router = APIRouter()

# Get user balance by clerk ID
@router.get("/user/{clerk_id}", response_model=BalanceResponse)
async def get_user_balance(clerk_id: str, db: AsyncSession = Depends(get_db)):
    """
    Get a user's balance by their clerk ID.
    Creates a balance with 0 amount if it doesn't exist yet.
    """
    # First check if the user exists
    result = await db.execute(select(User).filter(User.clerkId == clerk_id))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with clerkId {clerk_id} not found"
        )
    
    # Get the user's balance
    result = await db.execute(select(Balance).filter(Balance.clerkId == clerk_id))
    balance = result.scalar_one_or_none()
    
    # If balance doesn't exist, create one with 0 amount
    if not balance:
        balance = Balance(clerkId=clerk_id, amount=0.0)
        db.add(balance)
        await db.commit()
        await db.refresh(balance)
    
    return balance

# Update user balance (for admin or testing)
@router.put("/user/{clerk_id}", response_model=BalanceResponse)
async def update_user_balance(clerk_id: str, amount: float, db: AsyncSession = Depends(get_db)):
    """
    Update a user's balance. This endpoint is primarily for admin use or testing.
    """
    # First check if the user exists
    result = await db.execute(select(User).filter(User.clerkId == clerk_id))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with clerkId {clerk_id} not found"
        )
    
    # Get the user's balance
    result = await db.execute(select(Balance).filter(Balance.clerkId == clerk_id))
    balance = result.scalar_one_or_none()
    
    # If balance doesn't exist, create one
    if not balance:
        balance = Balance(clerkId=clerk_id, amount=amount)
        db.add(balance)
    else:
        # Update the balance
        balance.amount = amount
    
    await db.commit()
    await db.refresh(balance)
    
    return balance

# Add funds to user balance
@router.post("/user/{clerk_id}/add", response_model=BalanceResponse)
async def add_funds_to_balance(clerk_id: str, amount: float, db: AsyncSession = Depends(get_db)):
    """
    Add funds to a user's balance.
    """
    if amount <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Amount must be greater than 0"
        )
    
    # First check if the user exists
    result = await db.execute(select(User).filter(User.clerkId == clerk_id))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with clerkId {clerk_id} not found"
        )
    
    # Get the user's balance
    result = await db.execute(select(Balance).filter(Balance.clerkId == clerk_id))
    balance = result.scalar_one_or_none()
    
    # If balance doesn't exist, create one
    if not balance:
        balance = Balance(clerkId=clerk_id, amount=amount)
        db.add(balance)
    else:
        # Add to the balance
        balance.amount += amount
    
    await db.commit()
    await db.refresh(balance)
    
    return balance

# Withdraw funds from user balance
@router.post("/user/{clerk_id}/withdraw", response_model=BalanceResponse)
async def withdraw_funds_from_balance(clerk_id: str, amount: float, db: AsyncSession = Depends(get_db)):
    """
    Withdraw funds from a user's balance.
    """
    if amount <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Amount must be greater than 0"
        )
    
    # First check if the user exists
    result = await db.execute(select(User).filter(User.clerkId == clerk_id))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with clerkId {clerk_id} not found"
        )
    
    # Get the user's balance
    result = await db.execute(select(Balance).filter(Balance.clerkId == clerk_id))
    balance = result.scalar_one_or_none()
    
    # Check if balance exists and has sufficient funds
    if not balance:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Balance for user with clerkId {clerk_id} not found"
        )
    
    if balance.amount < amount:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Insufficient funds. Current balance: ${balance.amount}, Requested withdrawal: ${amount}"
        )
    
    # Subtract from the balance
    balance.amount -= amount
    
    await db.commit()
    await db.refresh(balance)
    
    return balance

# Get company balance
@router.get("/company", response_model=CompanyBalanceResponse)
async def get_company_balance(db: AsyncSession = Depends(get_db)):
    """
    Get the company's balance.
    Creates a balance with 0 amount if it doesn't exist yet.
    """
    # Get the company balance
    result = await db.execute(select(CompanyBalance))
    company_balance = result.scalar_one_or_none()
    
    # If company balance doesn't exist, create one with 0 amount
    if not company_balance:
        company_balance = CompanyBalance(amount=0.0)
        db.add(company_balance)
        await db.commit()
        await db.refresh(company_balance)
    
    return company_balance 