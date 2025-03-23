from flask import Blueprint, jsonify, request
from flasgger import swag_from  # Import swag_from for Swagger documentation
from models import Ticket, User, db
from datetime import datetime

# Create the admin blueprint
admin_bp = Blueprint('admin', __name__, url_prefix='/admin')

def is_admin(clerkId):
    """Check if user has ADMIN role"""
    admin = User.query.filter_by(clerkId=clerkId).first()
    return admin and admin.role == "ADMIN"

@admin_bp.route('/<string:clerkId>/tickets/all', methods=['GET'])
@swag_from({
    'tags': ['Admin'],
    'parameters': [
        {
            'name': 'clerkId',
            'in': 'path',
            'type': 'string',
            'required': True,
            'description': 'Admin clerk ID'
        }
    ],
    'responses': {
        200: {
            'description': 'List of all tickets',
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
        403: {'description': 'Unauthorized'},
        404: {'description': 'Admin not found'}
    }
})
def get_all_tickets(clerkId):
    """Get all tickets (Admin only)
    ---
    """
    if not is_admin(clerkId):
        return jsonify({"error": "Unauthorized: User is not an admin"}), 403
    
    admin = User.query.get(clerkId)
    if not admin:
        return jsonify({"error": "Admin not found"}), 404
    
    tickets = Ticket.query.all()
    return jsonify([{
        "id": t.id,
        "title": t.title,
        "description": t.description,
        "status": t.status,
        "urgency": t.urgency,
        "created_by": t.created_by,
        "created_at": t.created_at.isoformat()
    } for t in tickets])

@admin_bp.route('/<string:clerkId>/tickets/pending', methods=['GET'])
@swag_from({
    'tags': ['Admin'],
    'parameters': [
        {
            'name': 'clerkId',
            'in': 'path',
            'type': 'string',
            'required': True,
            'description': 'Admin clerk ID'
        }
    ],
    'responses': {
        200: {
            'description': 'List of pending tickets',
            'examples': {
                'application/json': [
                    {
                        "id": 2,
                        "title": "Technical Support",
                        "status": "pending",
                        "urgency": "medium",
                        "created_at": "2023-01-02T00:00:00Z"
                    }
                ]
            }
        },
        403: {'description': 'Unauthorized'},
        404: {'description': 'Admin not found'}
    }
})
def get_pending_tickets(clerkId):
    """Get pending tickets (Admin only)
    ---
    """
    if not is_admin(clerkId):
        return jsonify({"error": "Unauthorized: User is not an admin"}), 403
    
    admin = User.query.get(clerkId)
    if not admin:
        return jsonify({"error": "Admin not found"}), 404
    
    pending_tickets = Ticket.query.filter_by(status='pending').all()
    return jsonify([{
        "id": t.id,
        "title": t.title,
        "description": t.description,
        "status": t.status,
        "urgency": t.urgency,
        "created_by": t.created_by,
        "created_at": t.created_at.isoformat()
    } for t in pending_tickets])

@admin_bp.route('/<string:clerkId>/tickets/<int:id>/update-status', methods=['POST'])
@swag_from({
    'tags': ['Admin'],
    'parameters': [
        {
            'name': 'clerkId',
            'in': 'path',
            'type': 'string',
            'required': True,
            'description': 'Admin clerk ID'
        },
        {
            'name': 'id',
            'in': 'path',
            'type': 'integer',
            'required': True,
            'description': 'Ticket ID (primary key in tickets table)'
        },
        {
            'name': 'body',
            'in': 'body',
            'required': True,
            'schema': {
                'type': 'object',
                'properties': {
                    'status': {
                        'type': 'string',
                        'enum': ['accepted', 'rejected'],
                        'example': 'accepted'  # Example value for Swagger UI
                    }
                },
                'required': ['status'],
                'example': {  # Full example request body
                    'status': 'accepted'
                }
            }
        }
    ],
    'consumes': ['application/json'],  # Explicitly set expected content type
    'responses': {
        200: {
            'description': 'Ticket status updated successfully',
            'examples': {
                'application/json': {
                    "message": "Ticket 1 status updated to accepted",
                    "updated_at": "2023-01-01T00:00:00Z"
                }
            }
        },
        400: {'description': 'Invalid status provided or missing status'},
        403: {'description': 'Unauthorized'},
        404: {'description': 'Admin or ticket not found'}
    }
})
def update_ticket_status(clerkId, id):
    """Update ticket status (Admin only)"""
    # Debugging headers and content type
    print("Headers:", request.headers)
    print("Content-Type:", request.content_type)
    
    # Attempt to parse JSON data
    try:
        data = request.get_json(force=True)  # Force JSON parsing regardless of Content-Type
    except Exception as e:
        print(f"JSON Parsing Error: {str(e)}")
        return jsonify({"error": "Invalid JSON format"}), 400
    
    print("Parsed JSON Data:", data)  # Debug parsed data
    
    # Validate presence of required field
    if not data or 'status' not in data:
        return jsonify({"error": "Missing required 'status' in request body"}), 400
    
    # Validate status value
    new_status = data['status'].lower()
    if new_status not in ['accepted', 'rejected']:
        return jsonify({"error": "Invalid status. Use 'accepted' or 'rejected'"}), 400
    
    # Database operations
    try:
        ticket = Ticket.query.get_or_404(id)
        ticket.status = new_status
        db.session.commit()
        return jsonify({
            "message": f"Ticket {id} status updated to {new_status}",
            "updated_at": datetime.utcnow().isoformat()
        }), 200
    except Exception as e:
        db.session.rollback()
        print(f"Database Error: {str(e)}")
        return jsonify({"error": "Failed to update ticket status"}), 500