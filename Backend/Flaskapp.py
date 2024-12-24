from flask_bcrypt import Bcrypt
from flask import Flask, jsonify
from flask_cors import CORS
import os
from models import db
from restaurant_registration import restaurant_auth_bp
from session_config import init_session


def create_app():
    app = Flask(__name__)
    CORS(app)

    # Initialize session management
    init_session(app)

    # Configure the app
    basedir = os.path.abspath(os.path.dirname(__file__))
    app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{os.path.join(basedir, 'database.db')}"
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.secret_key = os.urandom(24)  # Use a strong secret key

    # Initialize the database
    db.init_app(app)
    bcrypt = Bcrypt(app)

    # Register Blueprints
    app.register_blueprint(restaurant_auth_bp)

    # Add utility route
    @app.route('/routes', methods=['GET'])
    def list_routes():
        routes = {rule.rule: list(rule.methods) for rule in app.url_map.iter_rules()}
        return jsonify(routes)

    return app

if __name__ == "__main__":
    app = create_app()
    print("Starting Flask server...")
    app.run(debug=True, port=5000)
