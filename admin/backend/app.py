# app.py
from flask import Flask, jsonify
from flask_cors import CORS
from flasgger import Swagger
from models import db
from blueprints.admin import admin_bp
from blueprints.chat import chat_bp
from blueprints.tickets import ticket_bp
import os

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Swagger configuration
app.config['SWAGGER'] = {
    'title': 'Workly API',
    'uiversion': 3,
    'openapi': '3.0.3',
    'specs_route': '/apidocs/'
}

# Initialize extensions
db.init_app(app)

# Configure Swagger
Swagger(app, template={
    "openapi": "3.0.3",
    "info": {
        "title": "Workly API Documentation",
        "description": "API for Workly Platform - Ticket Management System",
        "version": "1.0.0",
        "contact": {
            "name": "Workly Support",
            "email": "support@workly.com"
        }
    },
    "components": {
        "securitySchemes": {
            "BearerAuth": {
                "type": "http",
                "scheme": "bearer",
                "bearerFormat": "JWT"
            }
        }
    }
})

# Register blueprints
app.register_blueprint(admin_bp)
app.register_blueprint(chat_bp)
app.register_blueprint(ticket_bp)

@app.route('/')
def health_check():
    """Application health check endpoint
    ---
    get:
      tags:
        - Health
      responses:
        200:
          description: Service is healthy
          content:
            application/json:
              example: {"status": "healthy"}
    """
    return jsonify({"status": "healthy"})

if __name__ == '__main__':
    with app.app_context():
    
        app.run(host='0.0.0.0', port=5000, debug=True)