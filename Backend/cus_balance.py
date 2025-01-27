
from flask import Blueprint, jsonify, session
from models import Restaurant
from models import db, Order,Customer	

cus_balance_bp = Blueprint('cbalance', __name__, url_prefix='/api')

@cus_balance_bp.route('/customer/balance', methods=['GET'])
def get_balance():
    
    customer_id = session.get('customer_id')
    if not customer_id:
        return jsonify({'error': 'Unauthorized access'}), 401

    try:
        # get the balance 
        balance = db.session.query(Customer.balance).filter(Customer.id == customer_id).scalar()
        balance = balance or 0

        return jsonify({'balance': float(balance)}), 200

    except Exception as e:
        return jsonify({'error': f'Failed to fetch balance: {str(e)}'}), 500
