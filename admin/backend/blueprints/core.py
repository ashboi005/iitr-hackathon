from flask import Blueprint, request, jsonify
from flasgger import swag_from
from datetime import datetime
from sqlalchemy.orm import joinedload
from config import db
from models.admin import Admin, Ticket
from services.twilio_service import twilio_service  # Added Twilio

bp = Blueprint('core', __name__)

@bp.route('/admin/<string:clerkId>', methods=['GET'])
@swag_from({
    'tags': ['Admin'],
    'parameters': [{
        'name': 'clerkId',
        'in': 'path',
        'type': 'string',
        'required': True
    }],
    'responses': {
        200: {'description': 'Admin details'},
        404: {'description': 'Admin not found'}
    }
})
def get_admin(clerkId):
    admin = Admin.query.get(clerkId)
    if not admin:
        return jsonify({"error": "Admin not found"}), 404
    
    return jsonify({
        "clerkId": admin.clerkId,
        "email": admin.email,
        "firstName": admin.firstName,
        "lastName": admin.lastName,
        "role": admin.role,
        "phoneNumber": admin.phone_number,  # Added phone number
        "createdAt": admin.createdAt.isoformat(),
        "is_banned": admin.is_banned
    })

@bp.route('/admin/<string:clerkId>/tickets', methods=['GET'])
@swag_from({
    'tags': ['Tickets'],
    'parameters': [{
        'name': 'clerkId',
        'in': 'path',
        'type': 'string',
        'required': True
    }],
    'responses': {
        200: {
            'description': 'List of admin tickets',
            'schema': {
                'type': 'array',
                'items': {
                    'type': 'object',
                    'properties': {
                        'id': {'type': 'string'},  # Changed to string
                        'title': {'type': 'string'},
                        'status': {'type': 'string'},
                        'urgency': {'type': 'string'},
                        'creator_name': {'type': 'string'},
                        'created_at': {'type': 'string'}
                    }
                }
            }
        },
        404: {'description': 'Admin not found'}
    }
})
def get_admin_tickets(clerkId):
    admin = Admin.query.get(clerkId)
    if not admin:
        return jsonify({"error": "Admin not found"}), 404
    
    tickets = Ticket.query.options(joinedload(Ticket.admin)).filter_by(created_by=clerkId).all()
    return jsonify([{
        "id": t.id,
        "title": t.title,
        "status": t.status,
        "urgency": t.urgency,
        "creator_name": f"{t.admin.firstName} {t.admin.lastName}",
        "created_at": t.created_at.isoformat()
    } for t in tickets])

@bp.route('/tickets', methods=['POST'])  # Changed endpoint from /post to /tickets
@swag_from({
    'tags': ['Tickets'],
    'parameters': [{
        'name': 'body',
        'in': 'body',
        'schema': {
            'type': 'object',
            'properties': {
                'title': {'type': 'string'},
                'description': {'type': 'string'},
                'urgency': {'type': 'string', 'enum': ['low', 'medium', 'high']},
                'created_by': {'type': 'string'}
            },
            'required': ['title', 'description', 'created_by']
        }
    }],
    'responses': {
        201: {
            'description': 'Ticket created successfully',
            'schema': {
                'type': 'object',
                'properties': {
                    'id': {'type': 'string'},  # Changed to string
                    'status': {'type': 'string'},
                    'creator_name': {'type': 'string'},
                    'created_at': {'type': 'string'}
                }
            }
        },
        400: {'description': 'Invalid request'}
    }
})
def create_ticket():
    data = request.json
    try:
        admin = Admin.query.get(data['created_by'])
        if not admin:
            return jsonify({"error": "Admin not found"}), 404

        ticket = Ticket(
            title=data['title'],
            description=data['description'],
            urgency=data.get('urgency', 'medium'),
            created_by=data['created_by']
        )
        
        db.session.add(ticket)
        db.session.commit()
        
        # SMS Notification
        if admin.phone_number:
            message = f"New Ticket Created!\nID: {ticket.id}\nTitle: {ticket.title}\nStatus: {ticket.status}"
            twilio_service.send_sms(admin.phone_number, message)

        return jsonify({
            'id': ticket.id,
            'status': ticket.status,
            'creator_name': f"{admin.firstName} {admin.lastName}",
            'created_at': ticket.created_at.isoformat()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@bp.route('/admin/ban/<string:clerkId>', methods=['POST'])
@swag_from({
    'tags': ['Admin'],
    'parameters': [{
        'name': 'clerkId',
        'in': 'path',
        'type': 'string',
        'required': True
    }],
    'responses': {
        200: {
            'description': 'Admin banned successfully',
            'schema': {
                'type': 'object',
                'properties': {
                    'message': {'type': 'string'},
                    'banned_at': {'type': 'string'}
                }
            }
        },
        404: {'description': 'Admin not found'},
        500: {'description': 'Server error'}
    }
})
def ban_admin(clerkId):
    try:
        admin = Admin.query.get(clerkId)
        if not admin:
            return jsonify({"error": "Admin not found"}), 404
        
        admin.is_banned = True
        db.session.commit()
        
        # Ban Notification
        if admin.phone_number:
            message = f"Account Banned\nYour admin account ({admin.email}) has been suspended."
            twilio_service.send_sms(admin.phone_number, message)

        return jsonify({
            "message": f"Admin {clerkId} banned successfully",
            "banned_at": datetime.utcnow().isoformat()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# Rest of the file remains unchanged...