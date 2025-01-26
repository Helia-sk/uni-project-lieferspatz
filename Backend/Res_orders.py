from flask import Blueprint, jsonify, session
import logging
from models import db, Order, OrderItem, MenuItem, Customer, Platform, Restaurant
from decimal import Decimal

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

        # Calculate platform fee and restaurant amount
        total = order.total_amount
        platform_fee = (total * Decimal('0.15')).quantize(Decimal('0.01'))
        restaurant_amount = (total * Decimal('0.85')).quantize(Decimal('0.01'))
        order.platform_fee = platform_fee
        order.restaurant_amount = restaurant_amount

        # Add platform fee to platform's balance
        platform = Platform.query.first()
        if not platform:
            platform = Platform(balance=0)
            db.session.add(platform)
        platform.balance += platform_fee

        # Update restaurant's balance
        restaurant = Restaurant.query.get(restaurant_id)
        if not restaurant:
            logging.warning('Restaurant not found. Restaurant ID: %s', restaurant_id)
            return jsonify({'error': 'Restaurant not found'}), 404
        restaurant.balance += restaurant_amount

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

        
        order.status = 'cancelled'

        # Refund the customer
        customer = Customer.query.get(order.customer_id)
        if not customer:
            logging.warning('Customer not found. Customer ID: %d', order.customer_id)
            return jsonify({'error': 'Customer not found'}), 404

        customer.balance += order.total_amount

        db.session.commit()
        logging.info('Order rejected and customer refunded successfully. Order ID: %d', order_id)
        return jsonify({'message': 'Order rejected and customer refunded successfully'}), 200
    except Exception as e:
        db.session.rollback()
        logging.error('Failed to reject order: %s', str(e))
        return jsonify({'error': f'Failed to reject order: {str(e)}'}), 500


@orders_bp.route('/<int:order_id>/details', methods=['GET'])
def get_order_details(order_id):
    """
    Fetch detailed information for a specific order, including items and customer details.
    """
    restaurant_id = session.get('restaurant_id')
    logging.info('Fetching order details. Session restaurant_id: %s, Order ID: %d', restaurant_id, order_id)

    if not restaurant_id:
        logging.warning('Unauthorized access: No restaurant_id in session')
        return jsonify({'error': 'Unauthorized access'}), 401

    try:
        # Fetch the order
        order = Order.query.filter_by(id=order_id, restaurant_id=restaurant_id).first()
        logging.debug('Order fetched from database: %s', order)

        if not order:
            logging.warning('Order not found. Order ID: %d, Restaurant ID: %s', order_id, restaurant_id)
            return jsonify({'error': 'Order not found'}), 404

        # Fetch the customer
        customer = Customer.query.get(order.customer_id)
        logging.debug('Customer fetched from database: %s', customer)

        if not customer:
            logging.warning('Customer not found for Order ID: %d', order_id)
            return jsonify({'error': 'Customer not found'}), 404

        # Fetch the items in the order
        items = (
            db.session.query(OrderItem, MenuItem)
            .join(MenuItem, MenuItem.id == OrderItem.menu_item_id)
            .filter(OrderItem.order_id == order_id)
            .all()
        )
        logging.debug('Order items fetched from database: %s', items)

        order_details = {
            'id': order.id,
            'status': order.status,
            'total_amount': float(order.total_amount),
            'notes': order.notes,
            'created_at': order.created_at.isoformat(),
            'customer': {
                'first_name': customer.first_name,
                'last_name': customer.last_name,
                'address': f"{customer.street}, {customer.postal_code}",
            },
            'items': [
                {
                    'name': item.MenuItem.name,
                    'quantity': item.OrderItem.quantity,
                    'price_at_order': float(item.OrderItem.price_at_order),
                }
                for item in items
            ],
        }

        logging.info('Order details prepared successfully. Order ID: %d', order_id)
        return jsonify(order_details), 200
    except Exception as e:
        logging.error('Failed to fetch order details: %s', str(e))
        return jsonify({'error': f'Failed to fetch order details: {str(e)}'}), 500


@orders_bp.route('/<int:order_id>/complete', methods=['POST'])
def mark_order_completed(order_id):
    try:
        # Fetch the order
        order = Order.query.get(order_id)
        if not order:
            return jsonify({'error': 'Order not found'}), 404

        # Update the status
        order.status = 'completed'
        db.session.commit()

        return jsonify({'message': 'Order marked as completed successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500