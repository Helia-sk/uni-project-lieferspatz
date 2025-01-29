from flask_session import Session
import os
from datetime import timedelta


def init_session(app, db):
    app.config['SESSION_TYPE'] = 'sqlalchemy'  # Use SQLAlchemy for session management
    app.config['SESSION_SQLALCHEMY'] = db  # Use the database instance for session management
    app.config['SESSION_PERMANENT'] = True
    app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(minutes=60)
    app.config['SESSION_USE_SIGNER'] = False
    app.config['SESSION_KEY_PREFIX'] = 'session:'
    app.config['SESSION_COOKIE_NAME'] = 'app_session'
    app.config['SESSION_COOKIE_HTTPONLY'] = True
    app.config['SESSION_COOKIE_SECURE'] = False  
    app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'

    # Initialize Flask-Session
    Session(app)
