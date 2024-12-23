from flask_session import Session
import os
from flask import jsonify, request, session

def init_session(app):
    # Configure session settings
    app.config['SESSION_TYPE'] = 'filesystem'  # Store session data on the server's filesystem
    app.config['SESSION_PERMANENT'] = False    # Sessions are not permanent
    app.config['SESSION_FILE_DIR'] = os.path.join(os.path.abspath(os.path.dirname(__file__)), 'session_files')
    app.config['SESSION_USE_SIGNER'] = True    # Sign session cookies for added security
    app.config['SESSION_KEY_PREFIX'] = 'restaurant_session:'  # Prefix for session keys
    app.config['SESSION_COOKIE_NAME'] = 'restaurant_app_session'  # Custom cookie name
    app.config['SESSION_COOKIE_HTTPONLY'] = True  # Prevent JavaScript access to cookies
    app.config['SESSION_COOKIE_SECURE'] = False   # Set to True in production with HTTPS

    # Ensure session directory exists
    os.makedirs(app.config['SESSION_FILE_DIR'], exist_ok=True)

    # Initialize Flask-Session
    Session(app)

def set_session():
    username = request.json.get('username')
    restaurant_id = request.json.get('restaurant_id')

    if not username or not restaurant_id:
        return jsonify({"error": "Both username and restaurant_id are required"}), 400

    # Save username and restaurant_id in the session
    session['username'] = username
    session['restaurant_id'] = restaurant_id

    return jsonify({"message": f"Session set for {username} with restaurant_id {restaurant_id}"})

def get_session():
    username = session.get('username')
    restaurant_id = session.get('restaurant_id')

    if not username or not restaurant_id:
        return jsonify({"message": "No session data found"}), 404

    return jsonify({"username": username, "restaurant_id": restaurant_id})
