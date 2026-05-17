"""Analytics routes: dashboard stats, outreach performance, conversions."""
from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from firebase_client import get_db
from datetime import datetime, timedelta, timezone

analytics_bp = Blueprint('analytics', __name__)

@analytics_bp.route('/dashboard', methods=['GET'])
@jwt_required()
def get_dashboard_stats():
    user_id = get_jwt_identity()
    db = get_db()

    # Fetch all leads for this user to compute stats
    leads_docs = db.collection('leads').where('user_id', '==', user_id).stream()
    leads = [d.to_dict() for d in leads_docs]

    total_leads = len(leads)
    contacted = len([l for l in leads if l.get('status') != 'Not Contacted'])
    pending = total_leads - contacted
    replied = len([l for l in leads if l.get('status') in ('Replied', 'Converted')])
    converted = len([l for l in leads if l.get('status') == 'Converted'])
    
    conversion_rate = round((converted / total_leads * 100), 1) if total_leads > 0 else 0

    return jsonify({
        'total_leads': total_leads,
        'contacted': contacted,
        'pending': pending,
        'replied': replied,
        'converted': converted,
        'conversion_rate': conversion_rate,
        # Placeholder trends
        'total_trend': 12,
        'contacted_trend': 8,
        'replied_trend': 5,
        'converted_trend': 2
    }), 200

@analytics_bp.route('/outreach', methods=['GET'])
@jwt_required()
def get_outreach_data():
    # In a real app, we'd query analytics_logs
    # For now, we return mock data for the charts
    return jsonify([
        {'date': 'Mon', 'sent': 12, 'replied': 4, 'converted': 1},
        {'date': 'Tue', 'sent': 18, 'replied': 6, 'converted': 2},
        {'date': 'Wed', 'sent': 15, 'replied': 3, 'converted': 0},
        {'date': 'Thu', 'sent': 22, 'replied': 8, 'converted': 3},
        {'date': 'Fri', 'sent': 30, 'replied': 12, 'converted': 5},
        {'date': 'Sat', 'sent': 10, 'replied': 2, 'converted': 1},
        {'date': 'Sun', 'sent': 8, 'replied': 1, 'converted': 0},
    ]), 200
