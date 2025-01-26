from flask import Blueprint, request, jsonify, session
from flask_bcrypt import Bcrypt
from models import db, Restaurant, ActionLog, DeliveryArea
from utils import validate_request
import logging


logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

bcrypt = Bcrypt()

register_bp = Blueprint('register', __name__, url_prefix='/api')

@register_bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        logging.info(f"Received registration data: {data}")

        validation_error = validate_request(data, ['username', 'password', 'name', 'street', 'postalCode', 'description'])
        if validation_error:
            logging.warning(f"Validation failed: {validation_error}")
            return jsonify(validation_error), 400


        if Restaurant.query.filter_by(username=data['username']).first():
            logging.warning("Username already exists")
            return jsonify({'error': 'Username already exists'}), 400

        
        hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')

        # Create and save the new restaurant
        new_restaurant = Restaurant(
            username=data['username'],
            name=data['name'],
            street=data['street'],
            postal_code=data['postalCode'],
            description=data['description'],
            password_hash=hashed_password,
            balance=0.00
        )
        db.session.add(new_restaurant)
        db.session.commit()

         # Add postal code to delivery areas
        delivery_area = DeliveryArea(restaurant_id=new_restaurant.id, postal_code=data['postalCode'])
        db.session.add(delivery_area)
        
        log = ActionLog(
            action="registration",
            description=f"Registered restaurant: {new_restaurant.name} (username: {new_restaurant.username})"
        )
        db.session.add(log)
        db.session.commit()

        session['username'] = new_restaurant.username
        session['restaurant_id'] = new_restaurant.id
        logging.info(f"Session data: {dict(session)}")
        session_cookie = request.cookies.get('app_session')
        logging.info(f"Session cookie set: {session_cookie}")
        return jsonify({'message': 'User registered successfully'}), 201

    except Exception as e:
        logging.error(f"Error during registration: {e}")
        return jsonify({'error': 'Internal server error'}), 500
