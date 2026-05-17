import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # JWT
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'leadpulse-secret-change-in-production')
    JWT_ACCESS_TOKEN_EXPIRES = False  # No expiry (or set timedelta)

    # Firebase
    FIREBASE_CREDENTIALS_PATH = os.getenv('FIREBASE_CREDENTIALS_PATH', 'firebase-credentials.json')

    # CORS
    FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:5173')

    # Server
    DEBUG = os.getenv('FLASK_DEBUG', 'true').lower() == 'true'
    PORT = int(os.getenv('PORT', 5000))
