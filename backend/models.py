from sqlalchemy import Column, ForeignKey, Integer, String, DateTime, Float, Table, ARRAY, Text, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
import json
from sqlalchemy.types import TypeDecorator

# Custom JSON type to ensure proper serialization/deserialization
class JSONDict(TypeDecorator):
    impl = JSON
    
    def process_bind_param(self, value, dialect):
        if value is None:
            return {}
        return value
    
    def process_result_value(self, value, dialect):
        if value is None:
            return {}
        return value

# SQLAlchemy Base
Base = declarative_base()

# User Model
class User(Base):
    __tablename__ = "users"

    clerkId = Column(String, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    firstName = Column(String)
    lastName = Column(String)
    createdAt = Column(DateTime, default=datetime.utcnow)
    role = Column(String)  # EMPLOYER, FREELANCER, or ADMIN

    # Relationships
    user_details = relationship("UserDetails", back_populates="user", uselist=False)
    freelancer_details = relationship("FreelancerDetails", back_populates="user", uselist=False)
    employer_details = relationship("EmployerDetails", back_populates="user", uselist=False)
    gigs = relationship("Gig", back_populates="employer")
    gig_requests = relationship("GigRequest", back_populates="freelancer", foreign_keys="GigRequest.freelancerClerkId")
    employer_requests = relationship("GigRequest", back_populates="employer", foreign_keys="GigRequest.employerClerkId")
    active_gigs_freelancer = relationship("ActiveGig", back_populates="freelancer", foreign_keys="ActiveGig.freelancerClerkId")
    active_gigs_employer = relationship("ActiveGig", back_populates="employer", foreign_keys="ActiveGig.employerClerkId")
    balance = relationship("Balance", back_populates="user", uselist=False)

# UserDetails Model
class UserDetails(Base):
    __tablename__ = "user_details"

    id = Column(Integer, primary_key=True, index=True)
    clerkId = Column(String, ForeignKey("users.clerkId"), unique=True)
    phone = Column(String, nullable=True)
    address = Column(String, nullable=True)
    bio = Column(String, nullable=True)
    profilePicture = Column(String, nullable=True)
    
    # Relationship
    user = relationship("User", back_populates="user_details")

# FreelancerDetails Model
class FreelancerDetails(Base):
    __tablename__ = "freelancer_details"

    id = Column(Integer, primary_key=True, index=True)
    clerkId = Column(String, ForeignKey("users.clerkId"), unique=True)
    occupation = Column(String)
    skills = Column(ARRAY(String))  # List of skills
    averageRating = Column(Float, default=0.0)
    portfolioLinks = Column(ARRAY(String))  # List of portfolio links
    
    # Relationship
    user = relationship("User", back_populates="freelancer_details")

# EmployerDetails Model
class EmployerDetails(Base):
    __tablename__ = "employer_details"

    id = Column(Integer, primary_key=True, index=True)
    clerkId = Column(String, ForeignKey("users.clerkId"), unique=True)
    worksNeeded = Column(ARRAY(String))  # List of works/skills needed
    averageRating = Column(Float, default=0.0)
    
    # Relationship
    user = relationship("User", back_populates="employer_details")

# Gig Model
class Gig(Base):
    __tablename__ = "gigs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(Text)
    skills_needed = Column(ARRAY(String))  # List of skills as tags
    project_deadline = Column(DateTime)
    milestones = Column(ARRAY(String))  # List of milestone descriptions
    milestone_payments = Column(ARRAY(Float))  # List of payments for each milestone
    total_payment = Column(Float)
    status = Column(String, default="OPEN")  # OPEN, CLOSED
    created_at = Column(DateTime, default=datetime.utcnow)
    employerClerkId = Column(String, ForeignKey("users.clerkId"))
    
    # Relationships
    employer = relationship("User", back_populates="gigs")
    gig_requests = relationship("GigRequest", back_populates="gig")
    active_gigs = relationship("ActiveGig", back_populates="gig")

# GigRequest Model
class GigRequest(Base):
    __tablename__ = "gig_requests"

    id = Column(Integer, primary_key=True, index=True)
    gig_id = Column(Integer, ForeignKey("gigs.id"), index=True)
    freelancerClerkId = Column(String, ForeignKey("users.clerkId"), index=True)
    employerClerkId = Column(String, ForeignKey("users.clerkId"), index=True)
    status = Column(String, default="PENDING")  # PENDING, ACCEPTED, REJECTED
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    gig = relationship("Gig", back_populates="gig_requests")
    freelancer = relationship("User", back_populates="gig_requests", foreign_keys=[freelancerClerkId])
    employer = relationship("User", back_populates="employer_requests", foreign_keys=[employerClerkId])

# ActiveGig Model
class ActiveGig(Base):
    __tablename__ = "active_gigs"

    id = Column(Integer, primary_key=True, index=True)
    gig_id = Column(Integer, ForeignKey("gigs.id"), index=True)
    freelancerClerkId = Column(String, ForeignKey("users.clerkId"), index=True)
    employerClerkId = Column(String, ForeignKey("users.clerkId"), index=True)
    milestone_status = Column(ARRAY(String))  # List of statuses for each milestone: PENDING, APPROVED
    milestone_links = Column(JSONDict, default={})  # Dictionary of links for each milestone submission
    status = Column(String, default="ACTIVE")  # ACTIVE, TERMINATED, COMPLETED
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    gig = relationship("Gig", back_populates="active_gigs")
    freelancer = relationship("User", back_populates="active_gigs_freelancer", foreign_keys=[freelancerClerkId])
    employer = relationship("User", back_populates="active_gigs_employer", foreign_keys=[employerClerkId])

# Balance Model
class Balance(Base):
    __tablename__ = "balances"

    id = Column(Integer, primary_key=True, index=True)
    clerkId = Column(String, ForeignKey("users.clerkId"), unique=True)
    amount = Column(Float, default=0.0)
    
    # Relationship
    user = relationship("User", back_populates="balance")

# CompanyBalance Model
class CompanyBalance(Base):
    __tablename__ = "company_balance"

    id = Column(Integer, primary_key=True, index=True)
    amount = Column(Float, default=0.0)
    last_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow) 