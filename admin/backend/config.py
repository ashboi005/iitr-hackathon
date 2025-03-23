from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flasgger import Swagger
from dotenv import load_dotenv
import os

db = SQLAlchemy()  #init db instance

load_dotenv()  #load .env

def configure_app(app: Flask):  #configures entire flask app
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')    #link db
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SWAGGER'] = {
        'title': 'Your API',
        'uiversion': 3
    }

    db.init_app(app)    #link db instance to app instance
    Swagger(app)    #init Swagger (used for API documentation - avail at /apidocs)