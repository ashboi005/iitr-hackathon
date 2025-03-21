from datetime import datetime
from config import db

class Admin(db.Model):
    __tablename__ = "admin"  # Changed table name
    
    clerkId = db.Column(db.String, primary_key=True, index=True)
    email = db.Column(db.String, unique=True, index=True)
    firstName = db.Column(db.String)
    lastName = db.Column(db.String)
    createdAt = db.Column(db.DateTime, default=datetime.utcnow)
    role = db.Column(db.String)  # EMPLOYER, FREELANCER, or ADMIN
    is_banned = db.Column(db.Boolean, default=False)
    
    tickets = db.relationship('Ticket', backref='admin', lazy=True)

class Ticket(db.Model):
    __tablename__ = "tickets"
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100))
    description = db.Column(db.Text)
    status = db.Column(db.String(20), default='open')
    urgency = db.Column(db.String(10), default='medium')
    created_by = db.Column(db.String, db.ForeignKey('admin.clerkId'))  # Updated foreign key
    created_at = db.Column(db.DateTime, default=datetime.utcnow)