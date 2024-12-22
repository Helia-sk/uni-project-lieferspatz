from flask_session import Session

def init_session(app):
    app.config['SESSION_TYPE'] = 'filesystem'  # Use filesystem storage for sessions
    app.config['SESSION_PERMANENT'] = False  # Make session non-permanent
    app.config['SESSION_USE_SIGNER'] = True  # Sign cookies to prevent tampering
    app.config['SESSION_COOKIE_HTTPONLY'] = True  # Cookies are accessible only to the server
    app.config['SESSION_COOKIE_SECURE'] = False  # Set to True if using HTTPS
    app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'  # Prevent CSRF issues
    app.config['SECRET_KEY'] = 'your-secret-key'  # Replace with your app's secret key
    Session(app)


