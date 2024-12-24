from Flaskapp import create_app
from models import db

app = create_app()

with app.app_context():
    db.create_all()
    print("Tables created successfully!")