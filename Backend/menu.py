from flask import Blueprint, jsonify, session, request
from models import db, MenuItem, Restaurant
from flask_bcrypt import Bcrypt
from sqlalchemy.exc import IntegrityError
import logging

menu_bp = Blueprint('menu', __name__, url_prefix='/api/menu')
bcrypt = Bcrypt()

@menu_bp.route('/', methods=['GET'])
def get_menu_items():
    restaurant_id = session.get('restaurant_id')
    if not restaurant_id:
        return jsonify({'error': 'Unauthorized access'}), 401

    restaurant = Restaurant.query.get(restaurant_id)
    if not restaurant:
        return jsonify({'error': 'Restaurant not found'}), 404

    menu_items = MenuItem.query.filter_by(restaurant_id=restaurant.id).all()
    items = [
        {
            'id': item.id,
            'name': item.name,
            'description': item.description,
            'price': float(item.price),
            'category': item.category,
            'image_url': item.image_url,
            'is_available': item.is_available
        }
        for item in menu_items
    ]
    return jsonify(items), 200

@menu_bp.route('/', methods=['POST'])
def add_menu_item():
    restaurant_id = session.get('restaurant_id')
    if not restaurant_id:
        logging.warning('Unauthorized access: No restaurant_id in session')
        return jsonify({'error': 'Unauthorized access'}), 401

    data = request.get_json()
    logging.info(f"Received POST request to /api/menu with data: {data}")

    # Validate required fields
    required_fields = ['name', 'description', 'price', 'category']
    for field in required_fields:
        if field not in data:
            logging.warning(f"Missing field: {field}")
            return jsonify({'error': f"'{field}' is required."}), 400

    try:
        # Extract and validate data
        name = data['name']
        description = data['description']
        price = float(data['price'])
        category = data['category']
        image_url = data.get('image_url', '')
        is_available = bool(data.get('is_available', True))

        logging.info(f"Validated data: name={name}, description={description}, price={price}, category={category}")

        # Create a new MenuItem instance
        new_item = MenuItem(
            restaurant_id=restaurant_id,
            name=name,
            description=description,
            price=price,
            category=category,
            image_url=image_url,
            is_available=is_available
        )

        # Add to the database
        db.session.add(new_item)
        db.session.commit()

        item_data = {
            'id': new_item.id,
            'name': new_item.name,
            'description': new_item.description,
            'price': float(new_item.price),
            'category': new_item.category,
            'image_url': new_item.image_url,
            'is_available': new_item.is_available
        }

        return jsonify(item_data), 201

    except (ValueError, TypeError) as e:
        logging.error(f"Data validation error: {str(e)}")
        return jsonify({'error': 'Invalid data format.'}), 400
    except IntegrityError as e:
        db.session.rollback()
        logging.error(f"Database integrity error: {str(e)}")
        return jsonify({'error': 'Database integrity error.'}), 500
    except Exception as e:
        db.session.rollback()
        logging.error(f"Unexpected error: {str(e)}")
        return jsonify({'error': f'An unexpected error occurred: {str(e)}'}), 500
