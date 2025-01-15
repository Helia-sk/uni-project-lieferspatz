from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_migrate import Migrate
import logging
import sys
import os
from models import db
from session_config import init_session
from socketio_instance import socketio
from logout import logout_bp
#Customer blueprints
from customer_restaurant_details import restaurant_details_bp
from customer_place_order import customer_place_order_bp
from customer_login import customer_login_bp
from customer_reg import customer_register_bp
from nearby_restaurants import nearby_restaurants_bp
from cus_balance import cus_balance_bp
#restaurabnt blueprints
from restaurant_reg import register_bp
from restaurant_login import login_bp
from Res_opening_hours import settings_bp
from Res_delivery_area import delivery_bp
from Res_Profile import profile_bp
from Res_balance import balance_bp
from Res_orders import orders_bp
from menu import menu_bp


sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

def create_app():
    app = Flask(__name__)

    # 1. Configure the app
    basedir = os.path.abspath(os.path.dirname(__file__))
    app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{os.path.join(basedir, 'database.db')}"
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.secret_key = 'Hi'

    # 2. Initialize the database
    db.init_app(app)

    # 3. Initialize session management with the db
    init_session(app, db)

    # 4. Configure CORS to allow credentials and specify the correct origin
    CORS(app, supports_credentials=True, origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5050",
        "http://localhost:5050",
        "http://localhost:5173",
        "localhost:5173",
        "http://127.0.0.1:5173"
    ])

    # 5. Initialize WebSockets
    socketio.init_app(app)

    # 6. Initialize Bcrypt
    bcrypt = Bcrypt(app)
    Migrate(app, db)

    # 7. Register Blueprints
    app.register_blueprint(register_bp)
    app.register_blueprint(login_bp)
    app.register_blueprint(logout_bp)
    app.register_blueprint(menu_bp)
    app.register_blueprint(settings_bp)
    app.register_blueprint(delivery_bp)
    app.register_blueprint(profile_bp)
    app.register_blueprint(balance_bp)
    app.register_blueprint(orders_bp)
    app.register_blueprint(customer_login_bp)
    app.register_blueprint(customer_register_bp)
    app.register_blueprint(nearby_restaurants_bp)
    app.register_blueprint(restaurant_details_bp)  
    app.register_blueprint(customer_place_order_bp)
    app.register_blueprint(cus_balance_bp)

    # 8. Add WebSocket event handlers
    @socketio.on('connect')
    def handle_connect():
        logging.info("A client connected via WebSocket")

    @socketio.on('disconnect')
    def handle_disconnect():
        logging.info("A client disconnected from WebSocket")

    # 9. Utility route to list all available routes
    @app.route('/routes', methods=['GET'])
    def list_routes():
        routes = {rule.rule: list(rule.methods) for rule in app.url_map.iter_rules()}
        return jsonify(routes)

    # 10. Log all incoming requests for debugging
    @app.before_request
    def log_request_info():
        logging.info(f"Received {request.method} request to {request.url}")
        logging.info(f"Headers: {dict(request.headers)}")
        if request.method in ["POST", "PUT", "PATCH"]:
            logging.info(f"Body: {request.get_json()}")

    return app, socketio

if __name__ == "__main__":
    app, socketio = create_app()
    print("Starting Flask server...")
    socketio.run(app, debug=True, host='localhost', port=5050)