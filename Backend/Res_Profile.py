from flask import Blueprint, jsonify, session, request
from models import Restaurant, db

profile_bp = Blueprint('profile', __name__, url_prefix='/api')

@profile_bp.route('/restaurant', methods=['GET'])
def get_restaurant():
    restaurant_id = session.get('restaurant_id')
    if not restaurant_id:
        return jsonify({'error': 'Unauthorized access'}), 401

    try:
        restaurant = Restaurant.query.get(restaurant_id)
        if not restaurant:
            return jsonify({'error': 'Restaurant not found'}), 404

        # Return restaurant data as JSON
        return jsonify({
            'id': restaurant.id,
            'name': restaurant.name,
            'description': restaurant.description,
            'street': restaurant.street,
            'postalCode': restaurant.postal_code,
            'imageUrl': restaurant.image_url  # Include the image URL if applicable
        }), 200
    except Exception as e:
        return jsonify({'error': f'Failed to fetch restaurant data: {str(e)}'}), 500

@profile_bp.route('/restaurant', methods=['PUT'])
def update_restaurant():
    restaurant_id = session.get('restaurant_id')
    if not restaurant_id:
        return jsonify({'error': 'Unauthorized access'}), 401

    try:
        data = request.get_json()
        restaurant = Restaurant.query.get(restaurant_id)

        if not restaurant:
            return jsonify({'error': 'Restaurant not found'}), 404

        # Update restaurant fields
        restaurant.name = data.get('name', restaurant.name)
        restaurant.description = data.get('description', restaurant.description)
        restaurant.street = data.get('street', restaurant.street)
        restaurant.postal_code = data.get('postalCode', restaurant.postal_code)
        restaurant.image_url = data.get('imageUrl', restaurant.image_url)

        db.session.commit()

        return jsonify({'message': 'Restaurant updated successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to update restaurant: {str(e)}'}), 500