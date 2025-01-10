from flask import Blueprint, jsonify, session, request
from models import db, Restaurant, DeliveryArea, Customer
import logging

# Create a Blueprint
nearby_restaurants_bp = Blueprint('nearby_restaurants', __name__, url_prefix='/api/restaurants')


@nearby_restaurants_bp.route('/nearby', methods=['GET'])
def get_nearby_restaurants():
    """Fetch restaurants that deliver to the logged-in customer's location."""
    logging.debug(f"Session customer_id: {session.get('customer_id')}")

    # Check if the customer is logged in
    customer_id = session.get('customer_id')
    if not customer_id:
        logging.warning('Unauthorized access: No customer_id in session')
        return jsonify({'error': 'Unauthorized access'}), 401

    # Retrieve customer's postal code
    customer = Customer.query.get(customer_id)
    if not customer:
        logging.warning(f'Customer not found: id={customer_id}')
        return jsonify({'error': 'Customer not found'}), 404

    customer_postal_code = customer.postal_code
    logging.debug(f"Customer postal code: {customer_postal_code}")

    # Query for restaurants that deliver to the customer's postal code
    restaurants_query = Restaurant.query.join(
        DeliveryArea, Restaurant.id == DeliveryArea.restaurant_id
    ).filter(
        DeliveryArea.postal_code == customer_postal_code
    )

    # Log the generated SQL query
    logging.debug(f"Generated SQL Query: {str(restaurants_query)}")

    # Execute the query and fetch results
    restaurants = restaurants_query.all()
    logging.debug(f"Number of restaurants found: {len(restaurants)}")
    logging.debug(f"Restaurant names: {[r.name for r in restaurants]}")

    result = [
        {
            "id": r.id,
            "name": r.name,
            "street": r.street,
            "postal_code": r.postal_code,
            "description": r.description,
            "image_url": r.image_url
        }
        for r in restaurants
    ]

    return jsonify(result), 200

