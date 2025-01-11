# Backend/restaurant_details.py
from flask import Blueprint, jsonify, request
from models import db, Restaurant, MenuItem

restaurant_details_bp = Blueprint('restaurant_details', __name__, url_prefix='/api/restaurant_details')

@restaurant_details_bp.route('/<int:restaurant_id>', methods=['GET'])
def get_restaurant_details(restaurant_id):
    restaurant = Restaurant.query.get(restaurant_id)
    if not restaurant:
        return jsonify({'error': 'Restaurant not found'}), 404

    restaurant_data = {
        'id': restaurant.id,
        'name': restaurant.name,
        'street': restaurant.street,
        'postalCode': restaurant.postal_code,
        'description': restaurant.description,
        'imageUrl': restaurant.image_url
    }
    return jsonify(restaurant_data), 200

@restaurant_details_bp.route('/<int:restaurant_id>/menu', methods=['GET'])
def get_menu_items(restaurant_id):
    menu_items = MenuItem.query.filter_by(restaurant_id=restaurant_id).all()
    items = [
        {
            'id': item.id,
            'name': item.name,
            'description': item.description,
            'price': float(item.price),
            'category': item.category,
            'imageUrl': item.image_url,
            'isAvailable': item.is_available
        }
        for item in menu_items
    ]
    return jsonify(items), 200