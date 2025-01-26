from flask import Blueprint, jsonify, request, session
from models import db, DeliveryArea, Restaurant

delivery_bp = Blueprint('delivery', __name__, url_prefix='/api/settings')

@delivery_bp.route('/delivery_areas', methods=['GET'])
def get_delivery_areas():
    restaurant_id = session.get('restaurant_id')
    if not restaurant_id:
        return jsonify({'error': 'Unauthorized access'}), 401

    try:
        delivery_areas = DeliveryArea.query.filter_by(restaurant_id=restaurant_id).all()
        response = [{'id': area.id, 'postal_code': area.postal_code} for area in delivery_areas]
        return jsonify(response), 200
    except Exception as e:
        return jsonify({'error': f'Failed to fetch delivery areas: {str(e)}'}), 500

@delivery_bp.route('/delivery_areas', methods=['POST'])
def add_delivery_area():
    restaurant_id = session.get('restaurant_id')
    if not restaurant_id:
        return jsonify({'error': 'Unauthorized access'}), 401

    data = request.get_json()
    postal_code = data.get('postal_code')
    if not postal_code:
        return jsonify({'error': 'Postal code is required'}), 400

    try:
        # Check if the postal code already exists
        existing_area = DeliveryArea.query.filter_by(restaurant_id=restaurant_id, postal_code=postal_code).first()
        if existing_area:
            return jsonify({'error': 'Postal code already exists'}), 400

        # Add the new delivery area
        new_area = DeliveryArea(restaurant_id=restaurant_id, postal_code=postal_code)
        db.session.add(new_area)
        db.session.commit()

        return jsonify({'id': new_area.id, 'postal_code': new_area.postal_code}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to add delivery area: {str(e)}'}), 500

@delivery_bp.route('/delivery_areas/<int:area_id>', methods=['DELETE'])
def delete_delivery_area(area_id):
    restaurant_id = session.get('restaurant_id')
    if not restaurant_id:
        return jsonify({'error': 'Unauthorized access'}), 401

    try:
        delivery_area = DeliveryArea.query.filter_by(id=area_id, restaurant_id=restaurant_id).first()
        if not delivery_area:
            return jsonify({'error': 'Delivery area not found'}), 404

        # Fetch the restaurant's registration postal code
        restaurant = Restaurant.query.get(restaurant_id)
        if not restaurant:
            return jsonify({'error': 'Restaurant not found'}), 404

        # Delete the delivery area
        db.session.delete(delivery_area)
        db.session.commit()

        return jsonify({'message': 'Delivery area deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to delete delivery area: {str(e)}'}), 500
