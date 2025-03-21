from flask import Blueprint, request, jsonify
from flasgger import swag_from
from datetime import datetime
from config import db
from models.admin import Admin, Ticket
from models.chat import ChatMessage
from services.pusher_service import trigger_message

chat_bp = Blueprint('chat_bp', __name__)

@chat_bp.route('/chat/<int:ticket_id>/messages', methods=['POST'])
@swag_from({
    'tags': ['Chat'],
    'parameters': [{
        'name': 'body',
        'in': 'body',
        'schema': {
            'type': 'object',
            'properties': {
                'sender_id': {'type': 'string'},
                'message': {'type': 'string'}
            },
            'required': ['sender_id', 'message']
        }
    }],
    'responses': {
        201: {
            'description': 'Message sent successfully',
            'schema': {
                'type': 'object',
                'properties': {
                    'id': {'type': 'integer'},
                    'ticket_id': {'type': 'integer'},
                    'sender_id': {'type': 'string'},
                    'message': {'type': 'string'},
                    'timestamp': {'type': 'string'}
                }
            }
        },
        404: {'description': 'Ticket or sender not found'}
    }
})
def send_message(ticket_id):
    data = request.json
    ticket = Ticket.query.get(ticket_id)
    sender = Admin.query.get(data['sender_id'])
    
    if not ticket or not sender:
        return jsonify({"error": "Ticket or sender not found"}), 404

    new_message = ChatMessage(
        ticket_id=ticket_id,
        sender_id=data['sender_id'],
        message=data['message']
    )
    
    db.session.add(new_message)
    db.session.commit()
    
    message_data = {
        'id': new_message.id,
        'ticket_id': ticket_id,
        'sender_id': data['sender_id'],
        'sender_name': f"{sender.firstName} {sender.lastName}",
        'message': data['message'],
        'timestamp': new_message.timestamp.isoformat()
    }
    
    trigger_message(ticket_id, message_data)
    
    return jsonify(message_data), 201

@chat_bp.route('/chat/<int:ticket_id>/messages', methods=['GET'])
@swag_from({
    'tags': ['Chat'],
    'parameters': [{
        'name': 'ticket_id',
        'in': 'path',
        'type': 'integer',
        'required': True
    }],
    'responses': {
        200: {
            'description': 'Message history',
            'schema': {
                'type': 'array',
                'items': {
                    'type': 'object',
                    'properties': {
                        'id': {'type': 'integer'},
                        'sender_id': {'type': 'string'},
                        'sender_name': {'type': 'string'},
                        'message': {'type': 'string'},
                        'timestamp': {'type': 'string'}
                    }
                }
            }
        },
        404: {'description': 'Ticket not found'}
    }
})
def get_message_history(ticket_id):
    ticket = Ticket.query.get(ticket_id)
    if not ticket:
        return jsonify({"error": "Ticket not found"}), 404
    
    messages = ChatMessage.query.options(db.joinedload(ChatMessage.sender))\
                .filter_by(ticket_id=ticket_id)\
                .order_by(ChatMessage.timestamp.asc())\
                .all()
    
    return jsonify([{
        'id': msg.id,
        'sender_id': msg.sender_id,
        'sender_name': f"{msg.sender.firstName} {msg.sender.lastName}",
        'message': msg.message,
        'timestamp': msg.timestamp.isoformat()
    } for msg in messages]), 200