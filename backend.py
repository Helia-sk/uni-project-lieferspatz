from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask import Flask, jsonify, request


app = Flask(__name__)

# Configure SQLite database
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize the database
db = SQLAlchemy(app)
bcrypt = Bcrypt(app)

class Restaurant(db.Model):
    __tablename__ = 'restaurants'  # Explicitly match the table name in init.sql

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String, nullable=False)
    name = db.Column(db.String, nullable=False)
    street = db.Column(db.String, nullable=False)
    postal_code = db.Column(db.String, nullable=False)
    description = db.Column(db.Text, nullable=True)
    image_url = db.Column(db.String, nullable=True)  # Matches `image_url` column
    password_hash = db.Column(db.String, nullable=False)
    balance = db.Column(db.Numeric(10, 2), default=0.00)  # Matches DECIMAL(10,2)

class MenuItem(db.Model):
    __tablename__ = 'menu_items'

    id = db.Column(db.Integer, primary_key=True)
    restaurant_id = db.Column(db.Integer, db.ForeignKey('restaurants.id'), nullable=False)
    name = db.Column(db.String, nullable=False)
    description = db.Column(db.String, nullable=False)
    price = db.Column(db.Numeric(10, 2), nullable=False)
    image_url = db.Column(db.String, nullable=True)
    is_available = db.Column(db.Boolean, default=True)

class OpeningHour(db.Model):
    __tablename__ = 'opening_hours'

    id = db.Column(db.Integer, primary_key=True)
    restaurant_id = db.Column(db.Integer, db.ForeignKey('restaurants.id'), nullable=False)
    day_of_week = db.Column(db.Integer, nullable=False)  # Must be between 0 and 6
    open_time = db.Column(db.String, nullable=False)
    close_time = db.Column(db.String, nullable=False)

class DeliveryArea(db.Model):
    __tablename__ = 'delivery_areas'

    id = db.Column(db.Integer, primary_key=True)
    restaurant_id = db.Column(db.Integer, db.ForeignKey('restaurants.id'), nullable=False)
    postal_code = db.Column(db.String, nullable=False)

class Customer(db.Model):
    __tablename__ = 'customers'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String, nullable=False)
    first_name = db.Column(db.String, nullable=False)
    last_name = db.Column(db.String, nullable=False)
    street = db.Column(db.String, nullable=False)
    postal_code = db.Column(db.String, nullable=False)
    password_hash = db.Column(db.String, nullable=False)
    balance = db.Column(db.Numeric(10, 2), default=100.00)

class Order(db.Model):
    __tablename__ = 'orders'

    id = db.Column(db.Integer, primary_key=True)
    customer_id = db.Column(db.Integer, db.ForeignKey('customers.id'), nullable=False)
    restaurant_id = db.Column(db.Integer, db.ForeignKey('restaurants.id'), nullable=False)
    status = db.Column(db.String, default='processing')  # Matches CHECK constraint
    total_amount = db.Column(db.Numeric(10, 2), nullable=False)
    platform_fee = db.Column(db.Numeric(10, 2), nullable=False)
    restaurant_amount = db.Column(db.Numeric(10, 2), nullable=False)
    notes = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    updated_at = db.Column(db.DateTime, default=db.func.current_timestamp(), onupdate=db.func.current_timestamp())
    
class OrderItem(db.Model):
    __tablename__ = 'order_items'

    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=False)
    menu_item_id = db.Column(db.Integer, db.ForeignKey('menu_items.id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    price_at_order = db.Column(db.Numeric(10, 2), nullable=False)

class Platform(db.Model):
    __tablename__ = 'platform'

    id = db.Column(db.Integer, primary_key=True)
    balance = db.Column(db.Numeric(10, 2), default=0.00)

@app.route('/routes', methods=['GET'])
def list_routes():
    routes = {rule.rule: list(rule.methods) for rule in app.url_map.iter_rules()}
    return jsonify(routes)


@app.route('/api/register', methods=['POST'])
def register():
    print(request.form["username"])
    data = request.json  # Get the JSON payload from the frontend
    if not data or 'username' not in data or 'password' not in data:
        return jsonify({'error': 'Invalid input'}), 400

    # Check if the username is already taken
    if Restaurant.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'Username already exists'}), 400

    # Hash the password using bcrypt
    hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')

    # Create a new Restaurant record
    new_restaurant = Restaurant(
        username=data['username'],
        name=data.get('name', ''),
        street=data.get('street', ''),
        postal_code=data.get('postalCode', ''),
        description=data.get('description', ''),
        password_hash=hashed_password,
        balance=100.00  # Default balance
    )

    # Add and commit the new restaurant to the database
    db.session.add(new_restaurant)
    db.session.commit()

    return jsonify({'message': 'User registered successfully'}), 201


if __name__ == "__main__":
    print("Starting Flask server...")
    app.run(debug=True, port=5000)
