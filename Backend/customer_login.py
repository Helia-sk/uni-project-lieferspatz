from flask import Blueprint, request, jsonify, session
from flask_bcrypt import Bcrypt
from models import db, Customer
from utils import validate_request
import logging

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

bcrypt = Bcrypt()

# Blueprint for customer login
customer_login_bp = Blueprint('customer_login', __name__)

@customer_login_bp.route('/api/customer/login', methods=['POST'])
def login():
    try:
        # Retrieve JSON data from the request
        data = request.get_json()
        logging.info(f"Received customer login data: {data}")

        # Validate input fields
        validation_error = validate_request(data, ['username', 'password'])
        if validation_error:
            logging.warning(f"Validation failed: {validation_error}")
            return jsonify(validation_error), 400

        # Query the customer by username
        customer = Customer.query.filter_by(username=data['username']).first()

        # Verify the password
        if customer and bcrypt.check_password_hash(customer.password_hash, data['password']):
            # Set session details
            session['username'] = customer.username
            session['customer_id'] = customer.id
            logging.info(f"Login successful for customer: {customer.username}, Session Data: {dict(session)}")

            # Log the session cookie value for debugging
            session_cookie = request.cookies.get('app_session')
            logging.info(f"Session cookie set: {session_cookie}")

            return jsonify({
                'message': 'Login successful',
                'customer_id': customer.id,
                'postal_code': customer.postal_code  # Assuming postal_code is a column in the Customer model
            }), 200

        logging.warning("Invalid username or password")
        return jsonify({'error': 'Invalid username or password'}), 401

    except Exception as e:
        logging.error(f"Error during customer login: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@customer_login_bp.route('/session', methods=['GET'])
def check_session():
    if 'username' in session:
        return jsonify({'username': session['username'], 'customer_id': session['customer_id']}), 200
    return jsonify({'error': 'No active session'}), 401
