import firebase_admin
from firebase_admin import credentials, firestore
import os

_db = None

def init_firebase():
    global _db
    if not firebase_admin._apps:
        cred_path = os.getenv('FIREBASE_CREDENTIALS_PATH', 'firebase-credentials.json')
        if os.path.exists(cred_path):
            cred = credentials.Certificate(cred_path)
            firebase_admin.initialize_app(cred)
        else:
            # Try environment variable (for deployment)
            import json
            cred_json = os.getenv('FIREBASE_CREDENTIALS_JSON')
            if cred_json:
                cred_dict = json.loads(cred_json)
                cred = credentials.Certificate(cred_dict)
                firebase_admin.initialize_app(cred)
            else:
                raise RuntimeError(
                    "Firebase credentials not found. "
                    "Set FIREBASE_CREDENTIALS_PATH or FIREBASE_CREDENTIALS_JSON env variable."
                )
    _db = firestore.client()
    return _db

def get_db():
    global _db
    if _db is None:
        init_firebase()
    return _db
