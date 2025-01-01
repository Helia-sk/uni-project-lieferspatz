from flask import Blueprint, jsonify, session
import logging
from models import db, Order

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

orders_bp = Blueprint('orders', __name__, url_prefix='/api/orders')

@orders_bp.route('/', methods=['GET'])
def get_orders():
    restaurant_id = session.get('restaurant_id')
    logging.info('Fetching orders. Session restaurant_id: %s', restaurant_id)

    if not restaurant_id:
        logging.warning('Unauthorized access: No restaurant_id in session')
        return jsonify({'error': 'Unauthorized access'}), 401

    try:
        orders = Order.query.filter_by(restaurant_id=restaurant_id).all()
        response = [
            {
                'id': order.id,
                'customer_id': order.customer_id,
                'restaurant_id': order.restaurant_id,
                'status': order.status,
                'total_amount': float(order.total_amount),
                'platform_fee': float(order.platform_fee),
                'restaurant_amount': float(order.restaurant_amount),
                'notes': order.notes,
                'created_at': order.created_at.isoformat(),
                'updated_at': order.updated_at.isoformat()
            }
            for order in orders
        ]
        logging.info('Fetched orders: %s', response)
        return jsonify(response), 200
    except Exception as e:
        logging.error('Failed to fetch orders: %s', str(e))
        return jsonify({'error': f'Failed to fetch orders: {str(e)}'}), 500


@orders_bp.route('/<int:order_id>/accept', methods=['POST'])
def accept_order(order_id):
    restaurant_id = session.get('restaurant_id')
    logging.info('Accepting order. Session restaurant_id: %s, Order ID: %d', restaurant_id, order_id)

    if not restaurant_id:
        logging.warning('Unauthorized access: No restaurant_id in session')
        return jsonify({'error': 'Unauthorized access'}), 401

    try:
        order = Order.query.filter_by(id=order_id, restaurant_id=restaurant_id).first()
        if not order:
            logging.warning('Order not found. Order ID: %d, Restaurant ID: %s', order_id, restaurant_id)
            return jsonify({'error': 'Order not found'}), 404

        order.status = 'preparing'
        db.session.commit()
        logging.info('Order accepted successfully. Order ID: %d', order_id)
        return jsonify({'message': 'Order accepted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        logging.error('Failed to accept order: %s', str(e))
        return jsonify({'error': f'Failed to accept order: {str(e)}'}), 500


@orders_bp.route('/<int:order_id>/reject', methods=['POST'])
def reject_order(order_id):
    logging.info('Rejecting order. Session restaurant_id: %s, Order ID: %d', session.get('restaurant_id'), order_id)

    restaurant_id = session.get('restaurant_id')
    if not restaurant_id:
        logging.warning('Unauthorized access: No restaurant_id in session')
        return jsonify({'error': 'Unauthorized access'}), 401

    try:
        order = Order.query.filter_by(id=order_id, restaurant_id=restaurant_id).first()
        if not order:
            logging.warning('Order not found. Order ID: %d, Restaurant ID: %s', order_id, restaurant_id)
            return jsonify({'error': 'Order not found'}), 404

        order.status = 'cancelled'  # Use the correct value as per the database constraint
        db.session.commit()
        logging.info('Order rejected successfully. Order ID: %d', order_id)
        return jsonify({'message': 'Order rejected successfully'}), 200
    except Exception as e:
        db.session.rollback()
        logging.error('Failed to reject order: %s', str(e))
        return jsonify({'error': f'Failed to reject order: {str(e)}'}), 500

