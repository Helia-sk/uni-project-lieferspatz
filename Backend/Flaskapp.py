from flask_bcrypt import Bcrypt
from flask import Flask, jsonify, request
from flask_cors import CORS
import os
from models import db, Restaurant
from restaurant_registration import restaurant_auth_bp
from flask_session import Session
from session_config import init_session

app = Flask(__name__)
CORS(app)
init_session(app)# Function to initialize session management


basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{os.path.join(basedir, 'database.db')}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize the database
db.init_app(app)  # This line ensures the db is tied to the app
bcrypt = Bcrypt(app)

# Register Blueprints
app.register_blueprint(restaurant_auth_bp)


@app.route('/routes', methods=['GET'])
def list_routes():
    routes = {rule.rule: list(rule.methods) for rule in app.url_map.iter_rules()}
    return jsonify(routes)

if __name__ == "__main__":
    print("Starting Flask server...")
    app.run(debug=True, port=5000)
from flask_bcrypt import Bcrypt
from flask import Flask, jsonify, request
from flask_cors import CORS
import os
from models import db, Restaurant
from restaurant_registration import restaurant_auth_bp

app = Flask(__name__)
CORS(app)

basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{os.path.join(basedir, 'database.db')}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize the database
db.init_app(app)  # This line ensures the db is tied to the app
bcrypt = Bcrypt(app)

# Register Blueprints
app.register_blueprint(restaurant_auth_bp)


@app.route('/routes', methods=['GET'])
def list_routes():
    routes = {rule.rule: list(rule.methods) for rule in app.url_map.iter_rules()}
    return jsonify(routes)

if __name__ == "__main__":
    print("Starting Flask server...")
    app.run(debug=True, port=5000)
