from typing import List, Optional, Dict, Any, Union
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field

# Pydantic models for API request/response

class UserBase(BaseModel):
    email: EmailStr
    firstName: str
    lastName: str
    role: str

class UserCreate(UserBase):
    clerkId: str

class UserResponse(UserBase):
    clerkId: str
    createdAt: datetime

    class Config:
        from_attributes = True

class UserDetailsBase(BaseModel):
    phone: Optional[str] = None
    address: Optional[str] = None
    bio: Optional[str] = None
    profilePicture: Optional[str] = None

class UserDetailsCreate(UserDetailsBase):
    clerkId: str

class UserDetailsResponse(UserDetailsBase):
    id: int
    clerkId: str

    class Config:
        from_attributes = True

class FreelancerDetailsBase(BaseModel):
    occupation: str
    skills: List[str]
    portfolioLinks: Optional[List[str]] = None

class FreelancerDetailsCreate(FreelancerDetailsBase):
    clerkId: str

class FreelancerDetailsResponse(FreelancerDetailsBase):
    id: int
    clerkId: str
    averageRating: float

    class Config:
        from_attributes = True

class EmployerDetailsBase(BaseModel):
    worksNeeded: List[str]

class EmployerDetailsCreate(EmployerDetailsBase):
    clerkId: str

class EmployerDetailsResponse(EmployerDetailsBase):
    id: int
    clerkId: str

    class Config:
        from_attributes = True

# Gig Schemas
class GigBase(BaseModel):
    title: str
    description: str
    skills_needed: List[str]
    project_deadline: datetime
    milestones: List[str]
    milestone_payments: List[float]
    total_payment: float

class GigCreate(GigBase):
    employerClerkId: str

class GigResponse(GigBase):
    id: int
    status: str
    created_at: datetime
    employerClerkId: str

    class Config:
        from_attributes = True

class GigFilter(BaseModel):
    title: Optional[str] = None
    skills_needed: Optional[List[str]] = None
    min_payment: Optional[float] = None
    max_payment: Optional[float] = None

# GigRequest Schemas
class GigRequestBase(BaseModel):
    gig_id: int
    freelancerClerkId: str
    employerClerkId: str

class GigRequestCreate(BaseModel):
    gig_id: int
    freelancerClerkId: str
    freelancer_wallet_address: str

class GigRequestResponse(GigRequestBase):
    id: int
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

# ActiveGig Schemas
class MilestoneSubmission(BaseModel):
    milestone_index: int
    links: List[str]

class ActiveGigBase(BaseModel):
    gig_id: int
    freelancerClerkId: str
    employerClerkId: str
    milestone_status: List[str]
    status: str

class ActiveGigCreate(BaseModel):
    gig_id: int
    freelancerClerkId: str
    employerClerkId: str
    milestone_count: int

class ActiveGigResponse(ActiveGigBase):
    id: int
    milestone_links: Optional[Dict[str, List[str]]] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Balance Schemas
class BalanceBase(BaseModel):
    amount: float

class BalanceCreate(BalanceBase):
    clerkId: str

class BalanceResponse(BalanceBase):
    id: int
    clerkId: str

    class Config:
        from_attributes = True

class CompanyBalanceResponse(BaseModel):
    id: int
    amount: float
    last_updated: datetime

    class Config:
        from_attributes = True

# Payment Verification Schema
class PaymentVerification(BaseModel):
    gig_id: int
    verified: bool = True

# Enhanced response models for API clarity
class GigWithRequests(GigResponse):
    """Gig with its associated requests"""
    requests: List[GigRequestResponse] = []
    
    class Config:
        from_attributes = True

class GigWithActiveGig(GigResponse):
    """Gig with its associated active gig (if any)"""
    active_gig: Optional[ActiveGigResponse] = None
    
    class Config:
        from_attributes = True

# Status response schema for update endpoints
class StatusResponse(BaseModel):
    success: bool
    message: str
    request_id: Optional[int] = None
    gig_id: Optional[int] = None
    active_gig_id: Optional[int] = None

# Milestone-specific response schemas
class MilestoneLinksResponse(BaseModel):
    """Response schema for milestone links query"""
    active_gig_id: int
    gig_id: int
    milestone_links: Dict[str, List[str]]
    milestone_status: List[str]
    milestone_count: int
    gig_title: str
    gig_milestones: List[str]

class MilestoneSubmitResponse(BaseModel):
    """Response schema for milestone submission"""
    success: bool
    message: str
    active_gig_id: int
    gig_id: int
    milestone_index: int
    links: List[str]
    milestone_links: Dict[str, List[str]]
    milestone_status: List[str]

class MilestoneApproveResponse(BaseModel):
    """Response schema for milestone approval"""
    success: bool
    message: str
    active_gig_id: int
    gig_id: int
    milestone_index: int
    milestone_links: Dict[str, List[str]]
    milestone_status: List[str]
    payment_amount: float
    status: str

# Review Schemas
class ReviewCreate(BaseModel):
    rating: int
    employer_clerk_id: str
    freelancer_clerk_id: str

class ReviewResponse(BaseModel):
    id: int
    rating: int
    employer_clerk_id: str
    freelancer_clerk_id: str
    created_at: datetime

    class Config:
        from_attributes = True 