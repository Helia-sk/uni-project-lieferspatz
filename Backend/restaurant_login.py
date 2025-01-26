from flask import Blueprint, request, jsonify, session
from flask_bcrypt import Bcrypt
from models import db, Restaurant
from utils import validate_request
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

bcrypt = Bcrypt()

login_bp = Blueprint('login', __name__, url_prefix='/api')

@login_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        logging.info(f"Received login data: {data}")

        # Validate input fields
        validation_error = validate_request(data, ['username', 'password'])
        if validation_error:
            logging.warning(f"Validation failed: {validation_error}")
            return jsonify(validation_error), 400

        # Query the restaurant by username
        restaurant = Restaurant.query.filter_by(username=data['username']).first()

        # Verify password
        if restaurant and bcrypt.check_password_hash(restaurant.password_hash, data['password']):
            session['username'] = restaurant.username
            session['restaurant_id'] = restaurant.id
            logging.info(f"Login successful for user: {restaurant.username}, Session Data: {dict(session)}")
            
            session_cookie = request.cookies.get('app_session')
            logging.info(f"Session cookie set: {session_cookie}")
            return jsonify({'message': 'Login successful', 'restaurant_id': restaurant.id}), 200

        logging.warning("Invalid username or password")
        return jsonify({'error': 'Invalid username or password'}), 401

    except Exception as e:
        logging.error(f"Error during login: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@login_bp.route('/session', methods=['GET'])
def check_session():
    if 'username' in session:
        return jsonify({'username': session['username'], 'restaurant_id': session['restaurant_id']}), 200
    return jsonify({'error': 'No active session'}), 401
