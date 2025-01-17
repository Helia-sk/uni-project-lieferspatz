from flask import Blueprint, jsonify, session
from models import db, Order, OrderItem, MenuItem, Customer
import logging

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

cus_orders_bp = Blueprint('cus_orders', __name__, url_prefix='/api/customer/orders')

@cus_orders_bp.route('/', methods=['GET'])
def get_customer_orders():
    customer_id = session.get('customer_id')
    logging.info('Fetching orders for customer_id: %s', customer_id)

    if not customer_id:
        logging.warning('Unauthorized access: No customer_id in session')
        return jsonify({'error': 'Unauthorized access'}), 401

    try:
        orders = Order.query.filter_by(customer_id=customer_id).all()
        response = []
        for order in orders:
            order_items = db.session.query(OrderItem, MenuItem).join(MenuItem, OrderItem.menu_item_id == MenuItem.id).filter(OrderItem.order_id == order.id).all()
            items = [
                {
                    'name': item.MenuItem.name,
                    'quantity': item.OrderItem.quantity,
                    'price_at_order': float(item.OrderItem.price_at_order),
                }
                for item in order_items
            ]
            response.append({
                'id': order.id,
                'status': order.status,
                'total_amount': float(order.total_amount),
                'created_at': order.created_at.isoformat(),
                'notes': order.notes,
                'items': items
            })
        logging.info('Fetched orders: %s', response)
        return jsonify(response), 200
    except Exception as e:
        logging.error('Failed to fetch orders: %s', str(e))
        return jsonify({'error': f'Failed to fetch orders: {str(e)}'}), 500

@cus_orders_bp.route('/<int:order_id>/details', methods=['GET'])
def get_order_details(order_id):
    customer_id = session.get('customer_id')
    logging.info('Fetching order details for order_id: %s, customer_id: %s', order_id, customer_id)

    if not customer_id:
        logging.warning('Unauthorized access: No customer_id in session')
        return jsonify({'error': 'Unauthorized access'}), 401

    try:
        order = Order.query.filter_by(id=order_id, customer_id=customer_id).first()
        if not order:
            logging.warning('Order not found: order_id=%s, customer_id=%s', order_id, customer_id)
            return jsonify({'error': 'Order not found'}), 404

        customer = Customer.query.get(customer_id)
        if not customer:
            logging.warning('Customer not found: customer_id=%s', customer_id)
            return jsonify({'error': 'Customer not found'}), 404

        order_items = db.session.query(OrderItem, MenuItem).join(MenuItem, OrderItem.menu_item_id == MenuItem.id).filter(OrderItem.order_id == order.id).all()
        items = [
            {
                'name': item.MenuItem.name,
                'quantity': item.OrderItem.quantity,
                'price_at_order': float(item.OrderItem.price_at_order),
            }
            for item in order_items
        ]

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
            'items': items,
        }

        logging.info('Fetched order details: %s', order_details)
        return jsonify(order_details), 200
    except Exception as e:
        logging.error('Failed to fetch order details: %s', str(e))
        return jsonify({'error': f'Failed to fetch order details: {str(e)}'}), 500