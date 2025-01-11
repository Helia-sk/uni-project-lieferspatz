from flask import Blueprint, request, jsonify,session
from models import db, Order, OrderItem, Restaurant, Customer, Platform
from utils import validate_request
from datetime import datetime
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)

# Blueprint for orders
customer_order_bp = Blueprint('customer_order', __name__)


@customer_order_bp.route('/api/customer/dashboard/orders', methods=['POST'])
def create_order():
    logging.info("create_order function called.")
    logging.info(f"Request headers: {request.headers}")
    logging.info(f"Request data: {request.get_json()}")
    """
    Endpoint to create a new order and associate it with a customer and a restaurant.
    """
    data = request.get_json()
    logging.info(f"Order data received: {data}")

    required_fields = ['customer_id', 'restaurant_id', 'items', 'total', 'notes']

    # Validate request data
    #if not validate_request(data, required_fields):
    #   logging.info("in the function")
    #    logging.error(f"Invalid request data: {data}")
    #    return jsonify({'error': 'Invalid request data'}), 400

    customer_id = data['customer_id']
    restaurant_id = data['restaurant_id']
    items = data['items']  # List of items: [{id, quantity, price}, ...]
    total = data['total']
    notes = data.get('notes', '')
    platform_fee = data.get('platform_fee')
    restaurant_amount = data.get('restaurant_amount')

    try:
        # Validate customer and restaurant exist
        customer = Customer.query.get(customer_id)
        restaurant = Restaurant.query.get(restaurant_id)

        if not customer or not restaurant:
            logging.error(f"Invalid customer ({customer_id}) or restaurant ({restaurant_id}) ID")
            return jsonify({'error': 'Invalid customer or restaurant ID'}), 404

        # Create a new order
        order = Order(
            customer_id=customer_id,
            restaurant_id=restaurant_id,
            status='processing',
            total_amount=total,
            platform_fee = platform_fee,
            restaurant_amount = restaurant_amount,
            notes=notes,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        db.session.add(order)
        db.session.flush()  # Flush to get order.id before committing

        # Add order items
        for item in items:
            order_item = OrderItem(
                order_id=order.id,
                menu_item_id=item['id'],
                quantity=item['quantity'],
                price_at_order=item['price'],
            )
            db.session.add(order_item)

        db.session.commit()

        # Log the new order
        logging.info(f"New order created: Order ID {order.id} for Restaurant ID {restaurant_id}")

        # Notify restaurant (Mock notification - implement real notification logic if needed)
        notify_restaurant(restaurant_id, order)

        return jsonify({'message': 'Order created successfully', 'order_id': order.id}), 201

    except Exception as e:
        db.session.rollback()
        logging.error(f"Error creating order: {e}")
        return jsonify({'error': 'Failed to create order'}), 500



def notify_restaurant(restaurant_id, order):
    """
    Mock function to notify the restaurant about the new order.
    Replace this with actual notification logic (e.g., sending an email or a push notification).
    """
    restaurant = Restaurant.query.get(restaurant_id)
    if restaurant:
        logging.info(f"Notification sent to Restaurant ID {restaurant_id} for Order ID {order.id}")

@customer_order_bp.route('/api/customer/dashboard/orders/', methods=['GET'])
def get_customer_order_history():
    """
    Endpoint for the customer to fetch their order history using session data.
    """
    # Get customer_id from session
    customer_id = session.get('customer_id')
    logging.info(f"Customer ID: {customer_id}")
    if not customer_id:
        logging.error("Unauthorized access: No customer_id in session")
        return jsonify({'error': 'Unauthorized access'}), 401

    try:
        # Fetch order history
        order_history = fetch_customer_order_history(customer_id)
        return jsonify(order_history), 200

    except Exception as e:
        logging.error(f"Error fetching customer order history: {e}")
        return jsonify({'error': 'Failed to fetch orders'}), 500



def fetch_customer_order_history(customer_id):
    """
    Helper function to fetch customer order history.
    """
    logging.info(f"Fetching customer order history for customer ID {customer_id}")
    orders = Order.query.filter_by(customer_id=customer_id).order_by(Order.created_at.desc()).all()
    result = [
        {
            'id': order.id,
            'restaurant_id': order.restaurant_id,
            'status': order.status,
            'total_amount': float(order.total_amount),
            'notes': order.notes,
            'created_at': order.created_at,
            'items': [
                {
                    'menu_item_id': item.menu_item_id,
                    'quantity': item.quantity,
                    'price_at_order': float(item.price_at_order),
                }
                for item in order.items
            ],
        }
        for order in orders
    ]
    return result

@customer_order_bp.route('/api/restaurant/dashboard/orders', methods=['GET'])
def get_restaurant_orders():
    """
    Endpoint for the restaurant to fetch received orders.
    """
    restaurant_id = request.args.get('restaurant_id')
    if not restaurant_id:
        return jsonify({'error': 'Restaurant ID is required'}), 400

    try:
        # Fetch orders for the restaurant
        orders = Order.query.filter_by(restaurant_id=restaurant_id).order_by(Order.created_at.desc()).all()
        result = [
            {
                'id': order.id,
                'customer_id': order.customer_id,
                'total_amount': order.total_amount,
                'status': order.status,
                'notes': order.notes,
                'created_at': order.created_at,
                'items': [
                    {
                        'menu_item_id': item.menu_item_id,
                        'quantity': item.quantity,
                        'price_at_order': item.price_at_order,
                    }
                    for item in order.items
                ],
            }
            for order in orders
        ]
        return jsonify(result), 200

    except Exception as e:
        logging.error(f"Error fetching restaurant orders: {e}")
        return jsonify({'error': 'Failed to fetch orders'}), 500
