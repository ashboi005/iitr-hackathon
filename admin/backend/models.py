from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy import TypeDecorator, JSON
from datetime import datetime
import json

db = SQLAlchemy()

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

class User(db.Model):
    __tablename__ = "users"

    clerkId = db.Column(db.String, primary_key=True, index=True)
    email = db.Column(db.String, unique=True, index=True)
    firstName = db.Column(db.String)
    lastName = db.Column(db.String)
    createdAt = db.Column(db.DateTime, default=datetime.utcnow)
    role = db.Column(db.String)  # EMPLOYER, FREELANCER, or ADMIN

    # Relationships
    user_details = db.relationship("UserDetails", back_populates="user", uselist=False)
    freelancer_details = db.relationship("FreelancerDetails", back_populates="user", uselist=False)
    employer_details = db.relationship("EmployerDetails", back_populates="user", uselist=False)
    gigs = db.relationship("Gig", back_populates="employer")
    gig_requests = db.relationship("GigRequest", back_populates="freelancer", foreign_keys="GigRequest.freelancerClerkId")
    employer_requests = db.relationship("GigRequest", back_populates="employer", foreign_keys="GigRequest.employerClerkId")
    active_gigs_freelancer = db.relationship("ActiveGig", back_populates="freelancer", foreign_keys="ActiveGig.freelancerClerkId")
    active_gigs_employer = db.relationship("ActiveGig", back_populates="employer", foreign_keys="ActiveGig.employerClerkId")
    balance = db.relationship("Balance", back_populates="user", uselist=False)
    created_tickets = db.relationship("Ticket", back_populates="creator")  # Relationship for tickets
    messages = db.relationship("ChatMessage", back_populates="sender")  # Added this relationship


# UserDetails Model
class UserDetails(db.Model):
    __tablename__ = "user_details"

    id = db.Column(db.Integer, primary_key=True, index=True)
    clerkId = db.Column(db.String, db.ForeignKey("users.clerkId"), unique=True)
    phone = db.Column(db.String, nullable=True)
    address = db.Column(db.String, nullable=True)
    bio = db.Column(db.String, nullable=True)
    profilePicture = db.Column(db.String, nullable=True)
    
    user = db.relationship("User", back_populates="user_details")

# FreelancerDetails Model
class FreelancerDetails(db.Model):
    __tablename__ = "freelancer_details"

    id = db.Column(db.Integer, primary_key=True, index=True)
    clerkId = db.Column(db.String, db.ForeignKey("users.clerkId"), unique=True)
    occupation = db.Column(db.String)
    skills = db.Column(ARRAY(db.String))
    averageRating = db.Column(db.Float, default=0.0)
    portfolioLinks = db.Column(ARRAY(db.String))
    
    user = db.relationship("User", back_populates="freelancer_details")

# EmployerDetails Model
class EmployerDetails(db.Model):
    __tablename__ = "employer_details"

    id = db.Column(db.Integer, primary_key=True, index=True)
    clerkId = db.Column(db.String, db.ForeignKey("users.clerkId"), unique=True)
    worksNeeded = db.Column(ARRAY(db.String))
    
    user = db.relationship("User", back_populates="employer_details")

# Gig Model
class Gig(db.Model):
    __tablename__ = "gigs"

    id = db.Column(db.Integer, primary_key=True, index=True)
    title = db.Column(db.String, index=True)
    description = db.Column(db.Text)
    skills_needed = db.Column(ARRAY(db.String))
    project_deadline = db.Column(db.DateTime)
    milestones = db.Column(ARRAY(db.String))
    milestone_payments = db.Column(ARRAY(db.Float))
    total_payment = db.Column(db.Float)
    status = db.Column(db.String, default="OPEN")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    employerClerkId = db.Column(db.String, db.ForeignKey("users.clerkId"))
    
    employer = db.relationship("User", back_populates="gigs")
    gig_requests = db.relationship("GigRequest", back_populates="gig")
    active_gigs = db.relationship("ActiveGig", back_populates="gig")

# GigRequest Model
class GigRequest(db.Model):
    __tablename__ = "gig_requests"

    id = db.Column(db.Integer, primary_key=True, index=True)
    gig_id = db.Column(db.Integer, db.ForeignKey("gigs.id"), index=True)
    freelancerClerkId = db.Column(db.String, db.ForeignKey("users.clerkId"), index=True)
    freelancer_wallet_address = db.Column(db.String)
    employerClerkId = db.Column(db.String, db.ForeignKey("users.clerkId"), index=True)
    status = db.Column(db.String, default="PENDING")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    gig = db.relationship("Gig", back_populates="gig_requests")
    freelancer = db.relationship("User", back_populates="gig_requests", foreign_keys=[freelancerClerkId])
    employer = db.relationship("User", back_populates="employer_requests", foreign_keys=[employerClerkId])

# ActiveGig Model
class ActiveGig(db.Model):
    __tablename__ = "active_gigs"

    id = db.Column(db.Integer, primary_key=True, index=True)
    gig_id = db.Column(db.Integer, db.ForeignKey("gigs.id"), index=True)
    freelancerClerkId = db.Column(db.String, db.ForeignKey("users.clerkId"), index=True)
    employerClerkId = db.Column(db.String, db.ForeignKey("users.clerkId"), index=True)
    contract_address = db.Column(db.String)
    milestone_status = db.Column(ARRAY(db.String))
    milestone_links = db.Column(JSONDict, default={})
    status = db.Column(db.String, default="ACTIVE")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    gig = db.relationship("Gig", back_populates="active_gigs")
    freelancer = db.relationship("User", back_populates="active_gigs_freelancer", foreign_keys=[freelancerClerkId])
    employer = db.relationship("User", back_populates="active_gigs_employer", foreign_keys=[employerClerkId])

# Balance Model
class Balance(db.Model):
    __tablename__ = "balances"

    id = db.Column(db.Integer, primary_key=True, index=True)
    clerkId = db.Column(db.String, db.ForeignKey("users.clerkId"), unique=True)
    amount = db.Column(db.Float, default=0.0)
    
    user = db.relationship("User", back_populates="balance")

# CompanyBalance Model
class CompanyBalance(db.Model):
    __tablename__ = "company_balance"

    id = db.Column(db.Integer, primary_key=True, index=True)
    amount = db.Column(db.Float, default=0.0)
    last_updated = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# Review Model
class Review(db.Model):
    __tablename__ = "reviews"

    id = db.Column(db.Integer, primary_key=True, index=True)
    rating = db.Column(db.Integer)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    employer_clerk_id = db.Column(db.String, db.ForeignKey("users.clerkId"))
    freelancer_clerk_id = db.Column(db.String, db.ForeignKey("users.clerkId"))
    
    employer = db.relationship("User", foreign_keys=[employer_clerk_id], backref="reviews_given")
    freelancer = db.relationship("User", foreign_keys=[freelancer_clerk_id], backref="reviews_received")

class ChatMessage(db.Model):
    __tablename__ = "chat_messages"

    id = db.Column(db.Integer, primary_key=True)
    ticket_id = db.Column(db.Integer, db.ForeignKey('tickets.id'), nullable=False)
    sender_id = db.Column(db.String, db.ForeignKey('users.clerkId'), nullable=False)  # Changed to users.clerkId
    message = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    ticket = db.relationship('Ticket', backref='messages')
    sender = db.relationship('User', back_populates='messages')  # Changed to User

class Ticket(db.Model):
    __tablename__ = "tickets"
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100))
    description = db.Column(db.Text)
    status = db.Column(db.String(20), default='pending')
    urgency = db.Column(db.String(10), default='medium')
    created_by = db.Column(db.String, db.ForeignKey('users.clerkId'))  # Changed to users.clerkId
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    creator = db.relationship("User", back_populates="created_tickets")  # Relationship to User