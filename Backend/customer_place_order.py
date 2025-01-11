from flask import Blueprint, request, jsonify, session
from models import db, Order, OrderItem, Customer, Platform
from decimal import Decimal
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)

# Blueprint for placing orders
customer_place_order_bp = Blueprint('customer_place_order', __name__)

@customer_place_order_bp.route('/api/customer/dashboard/orders/', methods=['GET'])
def get_order_history():
    try:
        customer_id = session.get('customer_id')
        if not customer_id:
            return jsonify({'error': 'Unauthorized access'}), 401

        # Fetch orders for the customer
        orders = Order.query.filter_by(customer_id=customer_id).all()
        order_ids = [order.id for order in orders]

        # Fetch order items separately using order IDs
        order_items = OrderItem.query.filter(OrderItem.order_id.in_(order_ids)).all()

        # Group order items by order_id
        order_items_dict = {}
        for item in order_items:
            if item.order_id not in order_items_dict:
                order_items_dict[item.order_id] = []
            order_items_dict[item.order_id].append({
                'menu_item_id': item.menu_item_id,
                'quantity': item.quantity,
                'price': float(item.price_at_order),
            })

        # Construct response
        result = [
            {
                'id': order.id,
                'restaurant_id': order.restaurant_id,
                'total_amount': float(order.total_amount),
                'status': order.status,
                'items': order_items_dict.get(order.id, [])  # Get order items or empty list
            }
            for order in orders
        ]

        return jsonify(result), 200

    except Exception as e:
        logging.error(f"Error fetching customer order history: {e}")
        return jsonify({'error': 'Failed to fetch orders'}), 500

@customer_place_order_bp.route('/api/customer/place_order', methods=['POST'])
def place_order():
    try:
        data = request.get_json()
        customer_id = session.get('customer_id')
        if not customer_id:
            return jsonify({'error': 'Unauthorized access'}), 401

        customer = Customer.query.get(customer_id)
        if not customer:
            return jsonify({'error': 'Customer not found'}), 404

        # Validate request data
        required_fields = ['restaurant_id', 'items', 'total', 'notes']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing field: {field}'}), 400

        total = Decimal(str(data['total']))
        platform_fee = (total * Decimal('0.15')).quantize(Decimal('0.01'))
        restaurant_amount = (total * Decimal('0.85')).quantize(Decimal('0.01'))



        # Check if customer has enough balance
        if customer.balance < total:
            return jsonify({'error': 'Insufficient balance'}), 400

        # Deduct total amount from customer's balance
        customer.balance -= total

        # Add platform fee to platform's balance
        platform = Platform.query.first()
        if not platform:
            platform = Platform(balance=0)
            db.session.add(platform)
        platform.balance += platform_fee

        # Create a new order
        order = Order(
            customer_id=customer_id,
            restaurant_id=data['restaurant_id'],
            status='processing',
            total_amount=total,
            platform_fee=platform_fee,
            restaurant_amount=restaurant_amount,
            notes=data.get('notes', '')
        )
        db.session.add(order)
        db.session.flush()  # Flush to get order.id before committing

        # Add order items
        for item in data['items']:
            order_item = OrderItem(
                order_id=order.id,
                menu_item_id=item['id'],
                quantity=item['quantity'],
                price_at_order=item['price']
            )
            db.session.add(order_item)

        db.session.commit()

        return jsonify({'message': 'Order placed successfully', 'order_id': order.id}), 201

    except Exception as e:
        db.session.rollback()
        logging.error(f"Error placing order: {e}")
        return jsonify({'error': 'Failed to place order'}), 500
    
    