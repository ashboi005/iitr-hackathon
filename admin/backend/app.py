from flask import Flask, jsonify
from flasgger import Swagger
from dotenv import load_dotenv
from config import db, Config
from blueprints.core import bp
from models.admin import Admin, Ticket
from blueprints.chat import chat_bp

load_dotenv()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    db.init_app(app)
    Swagger(app)
    
    with app.app_context():
        db.create_all()
    
    app.register_blueprint(bp, url_prefix='/admin')
    app.register_blueprint(chat_bp, url_prefix='/admin')
    
    @app.route('/')
    def health_check():
        return jsonify({
            'status': 'healthy',
            'database': app.config['SQLALCHEMY_DATABASE_URI'],
            'tables': ['users', 'tickets']
        })
    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(port=5000)