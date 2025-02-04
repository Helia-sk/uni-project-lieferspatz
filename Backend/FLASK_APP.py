from flask import Flask, jsonify, request
from flask_cors import CORS
from models import db
from session_config import init_session
from restaurant_reg import register_bp
from restaurant_login import login_bp
from customer_registration import customer_auth_bp
from logout import logout_bp
from flask_bcrypt import Bcrypt
import logging	
from menu import menu_bp
from flask_migrate import Migrate   
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))


def create_app():
    app = Flask(__name__)

    # 1. Configure the app
    basedir = os.path.abspath(os.path.dirname(__file__))
    app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{os.path.join(basedir, 'database.db')}"
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.secret_key = 'Hi'  # Use a fixed secret key for development

    # 2. Initialize the database
    db.init_app(app)

    # 3. Initialize session management with the db
    init_session(app, db)

    # 4. Configure CORS to allow credentials and specify the correct origin
    # CORS(app)
    CORS(app, supports_credentials=True, origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5050",
        "http://localhost:5050",
        "http://localhost:5173",
        "localhost:5173",
        "http://127.0.0.1:5173"
    ])  # Adjust origin as needed

    # 5. Initialize Bcrypt
    bcrypt = Bcrypt(app)
    Migrate(app, db)

    # 6. Register Blueprints
    app.register_blueprint(register_bp)
    app.register_blueprint(login_bp)
    app.register_blueprint(logout_bp)
    app.register_blueprint(menu_bp)
    app.register_blueprint(customer_auth_bp)
    
    # 7. Add utility route (optional)
    @app.route('/routes', methods=['GET'])
    def list_routes():
        routes = {rule.rule: list(rule.methods) for rule in app.url_map.iter_rules()}
        return jsonify(routes)
    
     # 8. Log all incoming requests for debugging
    @app.before_request
    def log_request_info():
        logging.info(f"Received {request.method} request to {request.url}")
        logging.info(f"Headers: {dict(request.headers)}")
        if request.method in ["POST", "PUT", "PATCH"]:
            logging.info(f"Body: {request.get_json()}")

    return app

if __name__ == "__main__":
    app = create_app()
    print("Starting Flask server...")
    app.run(debug=True, host='localhost', port=5050)