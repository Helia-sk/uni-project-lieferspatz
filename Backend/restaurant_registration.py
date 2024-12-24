from flask import Blueprint, request, jsonify, session
from flask_bcrypt import Bcrypt
from models import db, Restaurant# Ensure correct imports for models and db

bcrypt = Bcrypt()

# Define a Blueprint for restaurant authentication
restaurant_auth_bp = Blueprint('restaurant_auth', __name__)

# Helper function to validate input data
def validate_input(data, fields):
    """Validate if required fields are present in the input data."""
    missing_fields = [field for field in fields if field not in data]
    if missing_fields:
        return False, f"Missing fields: {', '.join(missing_fields)}"
    return True, None

# Route for registering a new restaurant
@restaurant_auth_bp.route('/api/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        print("Received registration data:", data)

        # Validate required fields
        is_valid, error_message = validate_input(data, ['username', 'password', 'name', 'street', 'postalCode', 'description'])
        if not is_valid:
            return jsonify({'error': error_message}), 400

        # Check if the username already exists
        if Restaurant.query.filter_by(username=data['username']).first():
            return jsonify({'error': 'Username already exists'}), 400

        # Hash the password using bcrypt
        hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')

        # Create and save the new restaurant
        new_restaurant = Restaurant(
            username=data['username'],
            name=data['name'],
            street=data['street'],
            postal_code=data['postalCode'],
            description=data['description'],
            password_hash=hashed_password,
            balance=100.00  # Default balance
        )


        db.session.add(new_restaurant)
        db.session.commit()
        print("New restaurant added to the database:", new_restaurant)

        return jsonify({'message': 'User registered successfully'}), 201

    except Exception as e:
        print("Error:", str(e))
        return jsonify({'error': 'Something went wrong'}), 500

# Route for logging in a restaurant
@restaurant_auth_bp.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        print("Received login data:", data)

        # Validate required fields
        is_valid, error_message = validate_input(data, ['username', 'password'])
        if not is_valid:
            return jsonify({'error': error_message}), 400

        # Query for the user by username
        restaurant = Restaurant.query.filter_by(username=data['username']).first()

        # Verify password
        if restaurant and bcrypt.check_password_hash(restaurant.password_hash, data['password']):
            session['username'] = restaurant.username
            session['restaurant_id'] = restaurant.id
            return jsonify({'message': 'Login successful', 'restaurant_id': restaurant.id}), 200
        else:
            return jsonify({'error': 'Invalid username or password'}), 401

    except Exception as e:
        print("Error:", str(e))
        return jsonify({'error': 'Something went wrong'}), 500
