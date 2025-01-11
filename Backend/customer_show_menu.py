from flask import Blueprint, jsonify, request
from models import db, MenuItem, Restaurant
import logging

# Create a Blueprint for the customer menu
customer_menu_bp = Blueprint('customer_menu', __name__, url_prefix='/api/customer/dashboard/restaurant')

@customer_menu_bp.route('/<int:restaurant_id>/', methods=['GET'])
def get_menu_by_restaurant(restaurant_id):
    """
    Fetch menu items for a specific restaurant based on the restaurant_id.
    """
    logging.info(f'Restaurant ID: {restaurant_id}')
    # Validate restaurant_id
    if not restaurant_id:
        logging.warning('Missing restaurant_id in request')
        return jsonify({'error': 'restaurant_id is required'}), 400

    try:
        # Check if the restaurant exists
        restaurant = Restaurant.query.get(restaurant_id)
        if not restaurant:
            logging.warning(f'Restaurant not found: id={restaurant_id}')
            return jsonify({'error': 'Restaurant not found'}), 404

        # Fetch menu items for the restaurant
        menu_items = MenuItem.query.filter_by(restaurant_id=restaurant_id, is_available=True).all()
        logging.info(f"Found {len(menu_items)} menu items for restaurant_id={restaurant_id}")

        # Format the menu items as JSON
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

    except Exception as e:
        logging.error(f"Unexpected error while fetching menu: {str(e)}")
        return jsonify({'error': 'An unexpected error occurred'}), 500
