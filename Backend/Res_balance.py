from flask import Blueprint, jsonify, session
from models import Restaurant

balance_bp = Blueprint('balance', __name__, url_prefix='/api')

@balance_bp.route('/restaurant/balance', methods=['GET'])
def get_balance():
    restaurant_id = session.get('restaurant_id')
    if not restaurant_id:
        return jsonify({'error': 'Unauthorized access'}), 401

    try:
        restaurant = Restaurant.query.get(restaurant_id)
        if not restaurant:
            return jsonify({'error': 'Restaurant not found'}), 404

        return jsonify({'balance': str(restaurant.balance)}), 200
    except Exception as e:
        return jsonify({'error': f'Failed to fetch balance: {str(e)}'}), 500
