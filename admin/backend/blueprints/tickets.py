from flask import Blueprint, request, jsonify
from datetime import datetime
from flasgger import swag_from
from models import Ticket, User, db
from services.twilio import twilio_service

ticket_bp = Blueprint('ticket', __name__, url_prefix='/tickets')

@ticket_bp.route('', methods=['POST'])
def create_ticket():
    """Create a new support ticket
    ---
    tags:
      - Tickets
    requestBody:
      required: true
      content:
        application/json:
          schema:
            type: object
            properties:
              title:
                type: string
                example: "Payment Issue"
              description:
                type: string
                example: "Unable to process payment"
              urgency:
                type: string
                enum: [low, medium, high]
                default: medium
              created_by:
                type: string
                example: "user_123"
            required:
              - title
              - description
              - created_by
    responses:
      201:
        description: Ticket created
        content:
          application/json:
            example:
              id: 1
              status: "open"
              creator_id: "user_123"
              created_at: "2023-01-01T00:00:00Z"
      400:
        description: Invalid request
    """
    data = request.json
    try:
        ticket = Ticket(
            title=data['title'],
            description=data['description'],
            urgency=data.get('urgency', 'medium'),
            created_by=data['created_by']
        )
        
        db.session.add(ticket)
        db.session.commit()
        
        creator = User.query.filter_by(clerkId=data['created_by']).first()
        
        if creator and creator.user_details and creator.user_details.phone:
            message = f"New Ticket Created!\nID: {ticket.id}\nTitle: {ticket.title}"
            twilio_service.send_sms(message)

        return jsonify({
            'id': ticket.id,
            'status': ticket.status,
            'creator_id': data['created_by'],
            'created_at': ticket.created_at.isoformat()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@ticket_bp.route('/user/<string:clerkId>', methods=['GET'])
@swag_from({
    'tags': ['Tickets'],
    'parameters': [
        {
            'name': 'clerkId',
            'in': 'path',
            'type': 'string',
            'required': True,
            'description': 'User clerk ID (freelancer or employer)'
        }
    ],
    'responses': {
        200: {
            'description': 'List of tickets created by the user',
            'examples': {
                'application/json': [
                    {
                        "id": 1,
                        "title": "Payment Issue",
                        "status": "open",
                        "urgency": "high",
                        "created_at": "2023-01-01T00:00:00Z"
                    }
                ]
            }
        },
        404: {'description': 'User not found'}
    }
})
def get_user_tickets(clerkId):
    """Get tickets created by a specific user (freelancer or employer)
    ---
    """
    user = User.query.get(clerkId)
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    # Fetch tickets created by this user
    tickets = Ticket.query.filter_by(created_by=clerkId).all()
    
    return jsonify([{
        "id": t.id,
        "title": t.title,
        "description": t.description,
        "status": t.status,
        "urgency": t.urgency,
        "created_at": t.created_at.isoformat()
    } for t in tickets])