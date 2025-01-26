from flask import Blueprint, jsonify, session, request
import logging


logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')


logout_bp = Blueprint('logout', __name__, url_prefix='/api')

@logout_bp.route('/logout', methods=['POST'])
def logout():
    logging.info(f"Session data at logout: {dict(session)}")  # Log current session data
    try:

        session_cookie = request.cookies.get('app_session')
        logging.info(f"Session cookie received: {session_cookie}")

        if 'username' in session:
            username = session.pop('username', None)
            session.pop('restaurant_id', None)
            session.clear()  # Clear the session
            logging.info(f"User logged out: {username}")
            return jsonify({'message': 'Logout successful'}), 200
        else:
            logging.warning("Logout attempted without an active session")
            return jsonify({'error': 'No active session'}), 400
    except Exception as e:
        logging.error(f"Error during logout: {e}")
        return jsonify({'error': 'Internal server error'}), 500
