from flask import Blueprint, request, jsonify
from models import ChatMessage, Ticket, User, db

chat_bp = Blueprint('chat', __name__, url_prefix='/chat')

@chat_bp.route('/<int:ticket_id>/messages', methods=['POST'])
def send_message(ticket_id):
    """Send a new chat message
    ---
    tags:
      - Chat
    parameters:
      - name: ticket_id
        in: path
        required: true
        schema:
          type: integer
      - name: message
        in: body
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                sender_id:
                  type: string
                  example: "user_123"
                message:
                  type: string
                  example: "Hello there!"
              required:
                - sender_id
                - message
    responses:
      201:
        description: Message created
        content:
          application/json:
            example:
              id: 1
              ticket_id: 123
              sender_id: "user_123"
              message: "Hello there!"
              timestamp: "2023-01-01T00:00:00Z"
      404:
        description: Ticket or sender not found
    """
    data = request.json
    ticket = Ticket.query.get(ticket_id)
    sender = User.query.get(data['sender_id'])
    
    if not ticket or not sender:
        return jsonify({"error": "Ticket or sender not found"}), 404

    new_message = ChatMessage(
        ticket_id=ticket_id,
        sender_id=data['sender_id'],
        message=data['message']
    )
    
    db.session.add(new_message)
    db.session.commit()
    
    return jsonify({
        'id': new_message.id,
        'ticket_id': ticket_id,
        'sender_id': data['sender_id'],
        'message': data['message'],
        'timestamp': new_message.timestamp.isoformat()
    }), 201

@chat_bp.route('/<int:ticket_id>/messages', methods=['GET'])
def get_message_history(ticket_id):
    """Get message history for a ticket
    ---
    tags:
      - Chat
    parameters:
      - name: ticket_id
        in: path
        required: true
        schema:
          type: integer
    responses:
      200:
        description: List of messages
        content:
          application/json:
            example:
              - id: 1
                sender_id: "user_123"
                message: "Hello there!"
                timestamp: "2023-01-01T00:00:00Z"
      404:
        description: Ticket not found
    """
    ticket = Ticket.query.get(ticket_id)
    if not ticket:
        return jsonify({"error": "Ticket not found"}), 404
    
    messages = ChatMessage.query.filter_by(ticket_id=ticket_id).order_by(ChatMessage.timestamp.asc()).all()
    
    return jsonify([{
        'id': msg.id,
        'sender_id': msg.sender_id,
        'message': msg.message,
        'timestamp': msg.timestamp.isoformat()
    } for msg in messages]), 200