from datetime import datetime
from config import db
from models.admin import Ticket

class ChatMessage(db.Model):
    __tablename__ = "chat_messages"
    
    id = db.Column(db.Integer, primary_key=True)
    ticket_id = db.Column(db.Integer, db.ForeignKey('tickets.id'), nullable=False)
    sender_id = db.Column(db.String, db.ForeignKey('admin.clerkId'), nullable=False)
    message = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    
    ticket = db.relationship('Ticket', backref='messages')
    sender = db.relationship('Admin', backref='messages')