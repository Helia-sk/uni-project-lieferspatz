import logging
from flask import Blueprint, jsonify, session, request
from models import db, OpeningHour, Restaurant


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

settings_bp = Blueprint('settings', __name__, url_prefix='/api/settings')

@settings_bp.route('/opening_hours', methods=['GET'])
def get_opening_hours():
    logger.info("Fetching opening hours")
    restaurant_id = session.get('restaurant_id')
    if not restaurant_id:
        logger.warning("Unauthorized access: No restaurant_id in session")
        return jsonify({'error': 'Unauthorized access'}), 401

    restaurant = Restaurant.query.get(restaurant_id)
    if not restaurant:
        logger.warning(f"Restaurant not found for ID {restaurant_id}")
        return jsonify({'error': 'Restaurant not found'}), 404

    try:
        opening_hours = OpeningHour.query.filter_by(restaurant_id=restaurant_id).all()
        logger.info(f"Fetched {len(opening_hours)} opening hours for restaurant {restaurant_id}")
        return jsonify([
            {
                'id': oh.id,
                'day_of_week': oh.day_of_week,
                'open_time': oh.open_time,
                'close_time': oh.close_time
            } for oh in opening_hours
        ]), 200
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        return jsonify({'error': f'Unexpected error: {str(e)}'}), 500


@settings_bp.route('/opening_hours', methods=['POST'])
def add_opening_hour():
    logger.info("Adding a new opening hour")
    restaurant_id = session.get('restaurant_id')
    if not restaurant_id:
        logger.warning("Unauthorized access: No restaurant_id in session")
        return jsonify({'error': 'Unauthorized access'}), 401

    data = request.get_json()
    logger.info(f"Received data: {data}")
    required_fields = ['day_of_week', 'open_time', 'close_time']
    for field in required_fields:
        if field not in data:
            logger.warning(f"Missing field: {field}")
            return jsonify({'error': f"'{field}' is required."}), 400

    try:
        new_opening_hour = OpeningHour(
            restaurant_id=restaurant_id,
            day_of_week=int(data['day_of_week']),
            open_time=data['open_time'],
            close_time=data['close_time']
        )
        db.session.add(new_opening_hour)
        db.session.commit()

        logger.info(f"Added opening hour with ID {new_opening_hour.id}")
        return jsonify({
            'id': new_opening_hour.id,
            'day_of_week': new_opening_hour.day_of_week,
            'open_time': new_opening_hour.open_time,
            'close_time': new_opening_hour.close_time
        }), 201

    except Exception as e:
        db.session.rollback()
        logger.error(f"Unexpected error while adding opening hour: {str(e)}")
        return jsonify({'error': f'Unexpected error: {str(e)}'}), 500


@settings_bp.route('/opening_hours/batch_update', methods=['POST'])
def batch_update_opening_hours():
    logger.info("Performing batch update for opening hours")
    restaurant_id = session.get('restaurant_id')
    if not restaurant_id:
        logger.warning("Unauthorized access: No restaurant_id in session")
        return jsonify({'error': 'Unauthorized access'}), 401

    data = request.get_json()
    logger.info(f"Received batch data: {data}")
    opening_hours = data.get('opening_hours', [])

    try:
        OpeningHour.query.filter_by(restaurant_id=restaurant_id).delete()

        for hour in opening_hours:
            new_hour = OpeningHour(
                restaurant_id=restaurant_id,
                day_of_week=int(hour['day_of_week']),
                open_time=hour['open_time'],
                close_time=hour['close_time']
            )
            db.session.add(new_hour)

        db.session.commit()
        logger.info(f"Batch update successful for restaurant {restaurant_id}")
        return jsonify({'message': 'Opening hours updated successfully'}), 200

    except Exception as e:
        db.session.rollback()
        logger.error(f"Unexpected error during batch update: {str(e)}")
        return jsonify({'error': f'Unexpected error: {str(e)}'}), 500
