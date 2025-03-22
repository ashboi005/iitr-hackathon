from datetime import datetime
from config import db
import random
import string

class User(db.Model):
    __tablename__ = "users"
    
    clerkId = db.Column(db.String, primary_key=True, index=True)
    email = db.Column(db.String, unique=True, index=True)
    phone_number = db.Column(db.String(20))
    firstName = db.Column(db.String)
    lastName = db.Column(db.String)
    createdAt = db.Column(db.DateTime, default=datetime.utcnow)
    role = db.Column(db.String)
    is_banned = db.Column(db.Boolean, default=False)
    
    tickets = db.relationship('Ticket', backref='user', lazy=True)

class Ticket(db.Model):
    __tablename__ = "tickets"
    
    id = db.Column(db.String(8), primary_key=True)
    title = db.Column(db.String(100))
    description = db.Column(db.Text)
    status = db.Column(db.String(20), default='open')
    urgency = db.Column(db.String(10), default='medium')
    created_by = db.Column(db.String, db.ForeignKey('users.clerkId'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __init__(self, **kwargs):
        super(Ticket, self).__init__(**kwargs)
        self.id = self.generate_unique_ticket_id()

    @staticmethod
    def generate_unique_ticket_id():
        while True:
            ticket_id = ''.join(random.choices(
                string.ascii_uppercase + string.digits, 
                k=8
            ))
            if not Ticket.query.get(ticket_id):
                return ticket_id