from flask import Blueprint, request, jsonify, session
from flask_bcrypt import Bcrypt
from models import db, Restaurant, Customer  # Ensure correct imports for models and db

bcrypt = Bcrypt()
#blueprint for customer
customer_auth_bp = Blueprint('customer_auth', __name__)

def validate_input(data, fields):
    """Validate if required fields are present in the input data."""
    missing_fields = [field for field in fields if field not in data]
    if missing_fields:
        return False, f"Missing fields: {', '.join(missing_fields)}"
    return True, None

#route for registering a new customer
@customer_auth_bp.route('/api/customer/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        print("Received registration data:", data)
        #to keep the consistency with the formData obeject for restaurants
        normalized_data = {
            "username": data.get("username"),
            "first_name": data.get("firstName"),
            "last_name": data.get("lastName"),
            "street": data.get("street"),
            "postal_code": data.get("postalCode"),
            "password": data.get("password"),
        }

        # Validate required fields
        is_valid, error_message = validate_input(normalized_data, ['username', 'first_name', 'last_name', 'street', 'postal_code', 'password'])
        if not is_valid:
            return jsonify({'error': error_message}), 400

        #check if the username already exists
        if Customer.query.filter_by(username=data['username']).first():
            return jsonify({'error': 'Username already exists'}), 400

        #password hash
        hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')

        # Create and save the new customer
        new_customer = Customer(
            username=normalized_data['username'],
            first_name=normalized_data['first_name'],
            last_name=normalized_data['last_name'],
            postal_code=normalized_data['postal_code'],
            street=normalized_data['street'],
            password_hash=hashed_password,
            balance=100.00  # Default balance
        )
        db.session.add(new_customer)
        db.session.commit()
        print("New customer added to the database:", new_customer)

        return jsonify({'message': 'User registered successfully'}), 201

    except Exception as e:
        print("Error:", str(e))
        return jsonify({'error': 'Something went wrong'}), 500

#route for logging in a customer
@customer_auth_bp.route('/api/customer/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        print("Received login data:", data)

        # Validate required fields
        is_valid, error_message = validate_input(data, ['username', 'password'])
        if not is_valid:
            return jsonify({'error': error_message}), 400

        # Query for the user by username
        customer = Customer.query.filter_by(username=data['username']).first()
        #verify password
        if customer and bcrypt.check_password_hash(customer.password_hash, data['password']):
            session['username'] = customer.username
            session['customer_id'] = customer.id
            return jsonify({'message': 'Login successful', 'restaurant_id': customer.id}), 200
        else:
            return jsonify({'error': 'Invalid username or password'}), 401

    except Exception as e:
        print("Error:", str(e))
        return jsonify({'error': 'Something went wrong'}), 500