from Flaskapp import create_app
from models import db, UserSession
from datetime import datetime, timedelta

app = create_app()

def add_session(session_id, user_id):
    with app.app_context():
        session = UserSession(
            id=session_id,
            user_id=user_id,
            created_at=datetime.utcnow(),
            expires_at=datetime.utcnow() + timedelta(days=1)  # Session expires in 1 day
        )
        db.session.add(session)
        db.session.commit()
        print(f"Session for user {user_id} added successfully!")

if __name__ == "__main__":
    add_session("unique_session_id_123", 1)  # Replace with your session ID and user ID
