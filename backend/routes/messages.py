"""Messages routes: generate AI messages, manage templates."""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from services.message_engine import generate_all_tones, generate_message

messages_bp = Blueprint('messages', __name__)

@messages_bp.route('/generate', methods=['POST'])
@jwt_required()
def generate():
    data = request.get_json()
    lead = data.get('lead')
    tone = data.get('tone', 'professional')

    if not lead:
        return jsonify({'error': 'Lead data is required.'}), 400

    message = generate_message(lead, tone)
    return jsonify({'message': message}), 200

@messages_bp.route('/generate-all', methods=['POST'])
@jwt_required()
def generate_all():
    data = request.get_json()
    lead = data.get('lead')

    if not lead:
        return jsonify({'error': 'Lead data is required.'}), 400

    messages = generate_all_tones(lead)
    return jsonify({'messages': messages}), 200

@messages_bp.route('/templates', methods=['GET'])
@jwt_required()
def get_templates():
    # Return common templates or custom ones from DB
    return jsonify([
        {'id': '1', 'name': 'No Website Pitch', 'content': 'Hi {business_name}, I noticed you don\'t have a website...'},
        {'id': '2', 'name': 'Low Rating Fix', 'content': 'Hello {business_name}, we can help improve your rating...'},
    ]), 200
