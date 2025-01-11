from flask import Blueprint, jsonify, session
from models import Restaurant

from flask import Blueprint, jsonify, session
from models import db, Order  # Assuming Order model is imported correctly

balance_bp = Blueprint('balance', __name__, url_prefix='/api')

@balance_bp.route('/restaurant/balance', methods=['GET'])
def get_balance():
    # Get the restaurant ID from the session
    restaurant_id = session.get('restaurant_id')
    if not restaurant_id:
        return jsonify({'error': 'Unauthorized access'}), 401

    try:
        # Query to calculate the balance dynamically
        balance = db.session.query(
            db.func.sum(Order.total_amount - Order.platform_fee)
        ).filter(
            Order.restaurant_id == restaurant_id,
            Order.status == 'preparing'
        ).scalar()

        # Ensure balance is 0 if no orders are found
        balance = balance or 0

        return jsonify({'balance': float(balance)}), 200

    except Exception as e:
        return jsonify({'error': f'Failed to fetch balance: {str(e)}'}), 500
