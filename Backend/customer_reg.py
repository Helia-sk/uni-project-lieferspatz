from flask import Blueprint, request, jsonify, session
from flask_bcrypt import Bcrypt
from models import db, Customer, ActionLog
from utils import validate_request
import logging


logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

bcrypt = Bcrypt()

customer_register_bp = Blueprint('customer_register', __name__)

@customer_register_bp.route('/api/customer/register', methods=['POST'])
def register():
    try:
        
        data = request.get_json()
        logging.info(f"Received customer registration data: {data}")

        
        validation_error = validate_request(data, ['username', 'password', 'firstName', 'lastName', 'street', 'postalCode'])
        if validation_error:
            logging.warning(f"Validation failed: {validation_error}")
            return jsonify(validation_error), 400

        # Check the username 
        if Customer.query.filter_by(username=data['username']).first():
            logging.warning("Username already exists")
            return jsonify({'error': 'Username already exists'}), 400

        # Hash the password
        hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')

    
        normalized_data = {
            "username": data['username'],
            "first_name": data['firstName'],
            "last_name": data['lastName'],
            "street": data['street'],
            "postal_code": data['postalCode'],
        }

        # Create and save the new customer
        new_customer = Customer(
            username=normalized_data['username'],
            first_name=normalized_data['first_name'],
            last_name=normalized_data['last_name'],
            postal_code=normalized_data['postal_code'],
            street=normalized_data['street'],
            password_hash=hashed_password,
            balance=100.00  
        )
        db.session.add(new_customer)

       
        log = ActionLog(
            action="registration",
            description=f"Registered customer: {new_customer.first_name} (username: {new_customer.username})"
        )
        db.session.add(log)
        db.session.commit()

        # Set session details
        session['username'] = new_customer.username
        session['customer_id'] = new_customer.id
        logging.info(f"Session data: {dict(session)}")

      
        session_cookie = request.cookies.get('app_session')
        logging.info(f"Session cookie set: {session_cookie}")

        return jsonify({'message': 'User registered successfully'}), 201

    except Exception as e:
        logging.error(f"Error during customer registration: {e}")
        return jsonify({'error': 'Internal server error'}), 500
