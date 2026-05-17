"""
Leads Management Blueprint
Handles CRUD operations, bulk actions, and lead ingestion with deterministic deduplication.
"""
import json
import uuid
import hashlib
import csv
import io
from datetime import datetime, timezone

from flask import Blueprint, request, jsonify, Response
from flask_jwt_extended import jwt_required, get_jwt_identity

from firebase_client import get_db
from services.lead_parser import parse_apify_json

leads_bp = Blueprint('leads', __name__)

def _lead_to_dict(doc):
    """Helper to convert Firestore doc to dict with ID."""
    d = doc.to_dict()
    d['id'] = doc.id
    return d

def generate_lead_id(user_id, business_name, phone_number):
    """Generate a deterministic ID based on user, name, and phone to allow smart updates."""
    key = f"{user_id}_{str(business_name).lower().strip()}_{str(phone_number or '').strip()}"
    return hashlib.md5(key.encode()).hexdigest()

# ── GET ALL LEADS ─────────────────────────────────────────────

@leads_bp.route('', methods=['GET'])
@jwt_required()
def get_leads():
    user_id = get_jwt_identity()
    db = get_db()

    # Query params
    search = request.args.get('search', '').strip().lower()
    location = request.args.get('location', '').strip().lower()
    category = request.args.get('category', '').strip().lower()
    status = request.args.get('status', '').strip()
    sort_by = request.args.get('sort_by', 'created_at')
    sort_dir = request.args.get('sort_dir', 'desc')

    try:
        page = max(1, int(request.args.get('page', 1)))
        limit = min(5000, max(1, int(request.args.get('limit', 20))))
    except ValueError:
        page, limit = 1, 20

    # Base query
    query = db.collection('leads').where('user_id', '==', user_id)
    if status:
        query = query.where('status', '==', status)

    # Fetch and filter
    all_docs = list(query.stream())
    leads = [_lead_to_dict(d) for d in all_docs]

    if search:
        leads = [l for l in leads if search in (l.get('business_name') or '').lower() or search in (l.get('phone_number') or '').lower()]
    if location:
        leads = [l for l in leads if location in (l.get('location') or '').lower()]
    if category:
        leads = [l for l in leads if category in (l.get('category') or '').lower()]

    # Sort
    reverse = sort_dir == 'desc'
    leads.sort(key=lambda l: (l.get(sort_by) or ''), reverse=reverse)
    
    total = len(leads)
    start = (page - 1) * limit
    paginated = leads[start: start + limit]

    return jsonify({'leads': paginated, 'total': total, 'page': page, 'limit': limit}), 200

# ── UPLOAD LEADS ──────────────────────────────────────────────

@leads_bp.route('/upload', methods=['POST'])
@jwt_required()
def upload_leads():
    user_id = get_jwt_identity()
    db = get_db()

    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded.'}), 400

    file = request.files['file']
    try:
        raw_data = json.loads(file.read().decode('utf-8'))
    except Exception:
        return jsonify({'error': 'Invalid JSON file content.'}), 400

    file_id = str(uuid.uuid4())
    file_record = {
        'id': file_id,
        'filename': file.filename,
        'user_id': user_id,
        'upload_date': datetime.now(timezone.utc).isoformat(),
        'lead_count': 0,
    }

    result = parse_apify_json(raw_data, user_id, file_id)
    parsed_leads = result['leads']

    if not parsed_leads:
        return jsonify({'error': 'No valid leads found in JSON.'}), 400

    batch = db.batch()
    batch_count = 0
    inserted = 0

    for lead in parsed_leads:
        # Smart Deduplication: overwrite existing leads with cleaned data
        lead_id = generate_lead_id(user_id, lead['business_name'], lead.get('phone_number'))
        doc_ref = db.collection('leads').document(lead_id)
        
        batch.set(doc_ref, lead, merge=True)
        inserted += 1
        batch_count += 1

        if batch_count >= 490:
            batch.commit()
            batch = db.batch()
            batch_count = 0

    if batch_count > 0:
        batch.commit()

    file_record['lead_count'] = inserted
    db.collection('uploaded_files').document(file_id).set(file_record)

    return jsonify({
        'file_id': file_id,
        'total': result['total'],
        'inserted': inserted,
        'status': 'success'
    }), 201

# ── CRUD OPERATIONS ───────────────────────────────────────────

@leads_bp.route('/<lead_id>', methods=['GET'])
@jwt_required()
def get_lead(lead_id):
    user_id = get_jwt_identity()
    db = get_db()
    doc = db.collection('leads').document(lead_id).get()
    if not doc.exists:
        return jsonify({'error': 'Lead not found.'}), 404
    lead = _lead_to_dict(doc)
    if lead.get('user_id') != user_id:
        return jsonify({'error': 'Unauthorized.'}), 403
    return jsonify(lead), 200

@leads_bp.route('/<lead_id>', methods=['PUT'])
@jwt_required()
def update_lead(lead_id):
    user_id = get_jwt_identity()
    db = get_db()
    doc = db.collection('leads').document(lead_id).get()
    if not doc.exists or doc.to_dict().get('user_id') != user_id:
        return jsonify({'error': 'Unauthorized.'}), 403
    data = request.get_json() or {}
    db.collection('leads').document(lead_id).update(data)
    return jsonify({'success': True}), 200

@leads_bp.route('/<lead_id>/status', methods=['PATCH'])
@jwt_required()
def update_status(lead_id):
    user_id = get_jwt_identity()
    db = get_db()
    doc = db.collection('leads').document(lead_id).get()
    if not doc.exists or doc.to_dict().get('user_id') != user_id:
        return jsonify({'error': 'Unauthorized.'}), 403
    data = request.get_json() or {}
    status = data.get('status')
    db.collection('leads').document(lead_id).update({
        'status': status,
        'last_contacted': datetime.now(timezone.utc).isoformat() if status in ('Sent', 'Replied') else None
    })
    return jsonify({'success': True, 'status': status}), 200

@leads_bp.route('/<lead_id>', methods=['DELETE'])
@jwt_required()
def delete_lead(lead_id):
    user_id = get_jwt_identity()
    db = get_db()
    doc = db.collection('leads').document(lead_id).get()
    if not doc.exists or doc.to_dict().get('user_id') != user_id:
        return jsonify({'error': 'Unauthorized.'}), 403
    db.collection('leads').document(lead_id).delete()
    return jsonify({'success': True}), 200

@leads_bp.route('/bulk-delete', methods=['POST'])
@jwt_required()
def bulk_delete():
    user_id = get_jwt_identity()
    db = get_db()
    data = request.get_json() or {}
    ids = data.get('ids', [])
    batch = db.batch()
    for lid in ids[:500]:
        batch.delete(db.collection('leads').document(lid))
    batch.commit()
    return jsonify({'success': True}), 200

@leads_bp.route('/export', methods=['GET'])
@jwt_required()
def export_leads():
    user_id = get_jwt_identity()
    db = get_db()
    docs = db.collection('leads').where('user_id', '==', user_id).stream()
    leads = [_lead_to_dict(d) for d in docs]
    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=['business_name', 'domain', 'phone_number', 'location', 'category', 'rating', 'status', 'email', 'notes', 'created_at'], extrasaction='ignore')
    writer.writeheader()
    writer.writerows(leads)
    return Response(output.getvalue(), mimetype='text/csv', headers={'Content-Disposition': 'attachment; filename=leads_export.csv'})
