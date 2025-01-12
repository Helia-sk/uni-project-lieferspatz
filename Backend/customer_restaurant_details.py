from flask import Blueprint, jsonify, request, session
from models import db, Restaurant, OpeningHour, DeliveryArea, MenuItem, Customer
from datetime import datetime
import logging

# Create a Blueprint for restaurant details
restaurant_details_bp = Blueprint('restaurant_details', __name__, url_prefix='/api/restaurant_details')

def is_restaurant_open(restaurant_id):
    """
    Check if a restaurant is currently open based on its opening hours.
    Handles cases where restaurants stay open past midnight.
    Adjusts Sunday from Python's 6 to database's 0.
    """
    now = datetime.now()
    current_day = now.weekday()  # 0=Monday, 6=Sunday
    current_time = now.strftime('%H:%M')  # Current time as "HH:MM"

    # ✅ Convert Python's weekday format to match the database (Sunday = 0, Monday = 1, etc.)
    db_day_of_week = (current_day + 1) % 7  # Converts: Python 0=Monday -> DB 1, Python 6=Sunday -> DB 0

    logging.info(f"Checking restaurant {restaurant_id} - Current Time: {current_time}, Day (DB Format): {db_day_of_week}")

    # Query the opening hours for the restaurant for the current day (adjusted for database format)
    opening_hours = OpeningHour.query.filter_by(restaurant_id=restaurant_id, day_of_week=db_day_of_week).all()

    if not opening_hours:
        logging.warning(f"⚠️ No opening hours found for restaurant {restaurant_id} on day {db_day_of_week}")
        return False  # No hours found, so it's closed

    for hours in opening_hours:
        open_time = hours.open_time  # Stored as HH:MM
        close_time = hours.close_time  # Stored as HH:MM

        logging.info(f"Restaurant {restaurant_id} - Checking: Open {open_time}, Close {close_time}")

        # ✅ Fix Midnight (00:00) Closing Issue
        if close_time == "00:00":
            close_time = "23:59"

        # Normal case (same-day closing)
        if open_time <= current_time <= close_time:
            logging.info(f"✅ Restaurant {restaurant_id} is OPEN")
            return True

        # Overnight case (e.g., 22:00 - 03:00)
        if open_time > close_time:  # If restaurant closes after midnight
            if current_time >= open_time or current_time <= close_time:
                logging.info(f"✅ Restaurant {restaurant_id} is OPEN (overnight case)")
                return True

    logging.info(f"❌ Restaurant {restaurant_id} is CLOSED")
    return False


def get_opening_hours(restaurant_id):
    """
    Fetch opening hours for a specific restaurant.
    """
    opening_hours = OpeningHour.query.filter_by(restaurant_id=restaurant_id).all()
    return [
        {
            'day_of_week': hour.day_of_week,
            'open_time': hour.open_time,
            'close_time': hour.close_time
        }
        for hour in opening_hours
    ]

def construct_restaurant_data(restaurant, is_open):
    """
    Construct restaurant data including opening hours.
    """
    opening_hours = get_opening_hours(restaurant.id)
    return {
        'id': restaurant.id,
        'name': restaurant.name,
        'street': restaurant.street,
        'postal_code': restaurant.postal_code,
        'description': restaurant.description,
        'image_url': restaurant.image_url,
        'is_open': is_open,
        'opening_hours': opening_hours
    }

@restaurant_details_bp.route('/<int:restaurant_id>', methods=['GET'])
def get_restaurant_details(restaurant_id):
    """
    Fetch details for a specific restaurant based on the restaurant_id.
    """
    restaurant = Restaurant.query.get(restaurant_id)
    if not restaurant:
        return jsonify({'error': 'Restaurant not found'}), 404

    is_open = is_restaurant_open(restaurant_id)
    restaurant_data = construct_restaurant_data(restaurant, is_open)
    return jsonify(restaurant_data), 200

@restaurant_details_bp.route('/<int:restaurant_id>/menu', methods=['GET'])
def get_menu_by_restaurant(restaurant_id):
    """
    Fetch menu items for a specific restaurant based on the restaurant_id.
    """
    logging.info(f'Restaurant ID: {restaurant_id}')
    # Validate restaurant_id
    if not restaurant_id:
        logging.warning('Missing restaurant_id in request')
        return jsonify({'error': 'restaurant_id is required'}), 400

    try:
        # Check if the restaurant exists
        restaurant = Restaurant.query.get(restaurant_id)
        if not restaurant:
            logging.warning(f'Restaurant not found: id={restaurant_id}')
            return jsonify({'error': 'Restaurant not found'}), 404

        # Fetch menu items for the restaurant
        menu_items = MenuItem.query.filter_by(restaurant_id=restaurant_id, is_available=True).all()
        logging.info(f"Found {len(menu_items)} menu items for restaurant_id={restaurant_id}")

        # Format the menu items as JSON
        items = [
            {
                'id': item.id,
                'name': item.name,
                'description': item.description,
                'price': float(item.price),
                'category': item.category,
                'image_url': item.image_url,
                'is_available': item.is_available
            }
            for item in menu_items
        ]

        return jsonify(items), 200

    except Exception as e:
        logging.error(f"Unexpected error while fetching menu: {str(e)}")
        return jsonify({'error': 'An unexpected error occurred'}), 500

@restaurant_details_bp.route('/nearby', methods=['GET'])
def get_nearby_restaurants():
    """
    Fetch nearby restaurants based on the customer's postal code.
    """
    # Get the customer ID from the session
    customer_id = session.get('customer_id')
    if not customer_id:
        return jsonify({'error': 'Customer ID is required'}), 400

    # Query the customer's postal code
    customer = Customer.query.get(customer_id)
    if not customer:
        return jsonify({'error': 'Customer not found'}), 404

    customer_postal_code = customer.postal_code
    logging.info(f"Customer postal code: {customer_postal_code}")

    # Query the restaurants that deliver to the customer's postal code
    delivery_areas = DeliveryArea.query.filter_by(postal_code=customer_postal_code).all()
    delivery_restaurant_ids = [area.restaurant_id for area in delivery_areas]

    # Query the restaurants that have the same postal code as the customer
    same_postal_code_restaurants = Restaurant.query.filter_by(postal_code=customer_postal_code).all()
    same_postal_code_restaurant_ids = [restaurant.id for restaurant in same_postal_code_restaurants]

    # Combine the restaurant IDs from both queries
    combined_restaurant_ids = set(delivery_restaurant_ids + same_postal_code_restaurant_ids)
    restaurants = Restaurant.query.filter(Restaurant.id.in_(combined_restaurant_ids)).all()

    restaurant_list = []
    for restaurant in restaurants:
        is_open = is_restaurant_open(restaurant.id)
        restaurant_data = construct_restaurant_data(restaurant, is_open)
        restaurant_list.append(restaurant_data)

    return jsonify(restaurant_list), 200