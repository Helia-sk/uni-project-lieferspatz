from Flaskapp import create_app
from models import db, UserSession
from datetime import datetime

app = create_app()

def cleanup_expired_sessions():
    with app.app_context():
        expired_sessions = UserSession.query.filter(UserSession.expires_at < datetime.utcnow()).all()
        for session in expired_sessions:
            db.session.delete(session)
        db.session.commit()
        print(f"Deleted {len(expired_sessions)} expired sessions.")

if __name__ == "__main__":
    cleanup_expired_sessions()
