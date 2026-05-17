"""Authentication routes: register, login, get current user."""
# pyrefly: ignore [missing-import]
from flask import Blueprint, request, jsonify
# pyrefly: ignore [missing-import]
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
import bcrypt
import uuid
from datetime import datetime, timezone
from firebase_client import get_db
from firebase_admin import auth as firebase_auth

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    name = (data.get('name') or '').strip()
    email = (data.get('email') or '').strip().lower()
    password = data.get('password') or ''

    if not name or not email or not password:
        return jsonify({'error': 'Name, email, and password are required.'}), 400
    if len(password) < 6:
        return jsonify({'error': 'Password must be at least 6 characters.'}), 400

    db = get_db()

    # Check duplicate email
    existing = db.collection('users').where('email', '==', email).limit(1).get()
    if list(existing):
        return jsonify({'error': 'An account with this email already exists.'}), 409

    # Hash password
    hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

    # Create user
    user_id = str(uuid.uuid4())
    user_data = {
        'id': user_id,
        'name': name,
        'email': email,
        'password_hash': hashed,
        'role': 'user',
        'created_at': datetime.now(timezone.utc).isoformat(),
    }
    db.collection('users').document(user_id).set(user_data)

    # Generate token
    token = create_access_token(identity=user_id)
    user_public = {k: v for k, v in user_data.items() if k != 'password_hash'}

    return jsonify({'token': token, 'user': user_public}), 201


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = (data.get('email') or '').strip().lower()
    password = data.get('password') or ''

    if not email or not password:
        return jsonify({'error': 'Email and password are required.'}), 400

    db = get_db()
    docs = list(db.collection('users').where('email', '==', email).limit(1).get())
    if not docs:
        return jsonify({'error': 'Invalid email or password.'}), 401

    user_data = docs[0].to_dict()

    if not bcrypt.checkpw(password.encode(), user_data['password_hash'].encode()):
        return jsonify({'error': 'Invalid email or password.'}), 401

    # Update last login
    db.collection('users').document(user_data['id']).update({
        'last_login': datetime.now(timezone.utc).isoformat()
    })

    token = create_access_token(identity=user_data['id'])
    user_public = {k: v for k, v in user_data.items() if k != 'password_hash'}

    return jsonify({'token': token, 'user': user_public}), 200


@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def me():
    user_id = get_jwt_identity()
    db = get_db()
    doc = db.collection('users').document(user_id).get()
    if not doc.exists:
        return jsonify({'error': 'User not found.'}), 404
    user_data = doc.to_dict()
    user_public = {k: v for k, v in user_data.items() if k != 'password_hash'}
    return jsonify(user_public), 200

@auth_bp.route('/google', methods=['POST'])
def google_login():
    data = request.get_json()
    id_token = data.get('idToken')
    
    if not id_token:
        return jsonify({'error': 'ID token is required.'}), 400
        
    try:
        decoded_token = firebase_auth.verify_id_token(id_token)
        uid = decoded_token['uid']
        email = decoded_token.get('email')
        name = decoded_token.get('name', '')
        
        if not email:
            return jsonify({'error': 'Email is required from Google.'}), 400
            
        db = get_db()
        docs = list(db.collection('users').where('email', '==', email).limit(1).get())
        
        if docs:
            user_data = docs[0].to_dict()
            db.collection('users').document(user_data['id']).update({
                'last_login': datetime.now(timezone.utc).isoformat()
            })
        else:
            user_id = str(uuid.uuid4())
            user_data = {
                'id': user_id,
                'name': name,
                'email': email,
                'role': 'user',
                'created_at': datetime.now(timezone.utc).isoformat(),
                'last_login': datetime.now(timezone.utc).isoformat(),
                'auth_provider': 'google',
                'firebase_uid': uid
            }
            db.collection('users').document(user_id).set(user_data)
            
        token = create_access_token(identity=user_data['id'])
        user_public = {k: v for k, v in user_data.items() if k != 'password_hash'}
        
        return jsonify({'token': token, 'user': user_public}), 200
        
    except Exception as e:
        return jsonify({'error': f'Invalid token: {str(e)}'}), 401
