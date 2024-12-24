from Flaskapp import create_app
from models import db, UserSession

app = create_app()

def query_session(session_id):
    with app.app_context():
        session = UserSession.query.filter_by(id=session_id).first()
        if session:
            print(f"Session Found: User ID: {session.user_id}, Expires At: {session.expires_at}")
        else:
            print("Session not found.")

if __name__ == "__main__":
    query_session("unique_session_id_123")  # Replace with the session ID you want to query
