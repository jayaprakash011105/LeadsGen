"""
Lead Parser Service
Parses and normalizes Apify Google Maps JSON exports.
Handles deduplication, phone formatting, and field extraction.
"""
import re
from datetime import datetime, timezone

# ── PHONE FORMATTING ──────────────────────────────────────────

def format_phone(raw_phone: str) -> str | None:
    """Format phone number to WhatsApp-compatible international format."""
    if not raw_phone:
        return None
    # Strip everything except digits and leading +
    cleaned = re.sub(r'[^\d+]', '', str(raw_phone))
    # Remove leading zeros
    if cleaned.startswith('+'):
        cleaned = '+' + cleaned[1:].lstrip('0')
    else:
        cleaned = cleaned.lstrip('0')
    # India: 10 digit mobile starting with 6-9 → add +91
    if re.match(r'^[6-9]\d{9}$', cleaned):
        cleaned = '91' + cleaned
    # Remove + for wa.me format
    cleaned = cleaned.lstrip('+')
    # Validate length
    if len(cleaned) < 10 or len(cleaned) > 15:
        return None
    return cleaned


# ── DOMAIN EXTRACTION ─────────────────────────────────────────

def extract_domain(website_url: str) -> str | None:
    """Extract clean domain from URL."""
    if not website_url:
        return None
    website_url = str(website_url).strip()
    if website_url in ('', 'N/A', 'null', 'None'):
        return None
    # Remove protocol
    domain = re.sub(r'^https?://', '', website_url)
    # Remove trailing slash and path
    domain = domain.split('/')[0].strip().lower()
    
    # Filter out generic domains (like Google Maps links or social profiles that aren't specific websites)
    generic_domains = ['google.com', 'google.co.in', 'maps.google.com', 'facebook.com', 'instagram.com']
    if any(gd in domain for gd in generic_domains):
        return None

    return domain if domain else None


# ── APIFY FIELD MAPPING ───────────────────────────────────────

APIFY_FIELD_MAP = {
    # Apify field → our field
    'title': 'business_name',
    'name': 'business_name',
    'website': 'domain',
    'phone': 'phone_number',
    'phoneUnformatted': 'phone_number',
    'address': 'location',
    'fullAddress': 'location',
    'city': '_city',
    'state': '_state',
    'categoryName': 'category',
    'category': 'category',
    'totalScore': 'rating',
    'stars': 'rating',
    'rating': 'rating',
    'email': 'email',
    'emails': 'email',
}


def parse_lead(raw: dict) -> dict | None:
    """
    Parse a single raw Apify lead object into normalized lead data.
    Returns None if the lead is invalid (no business name).
    """
    lead = {}

    # Map fields
    for apify_key, our_key in APIFY_FIELD_MAP.items():
        if apify_key in raw and raw[apify_key] is not None:
            val = raw[apify_key]
            if our_key.startswith('_'):
                lead[our_key] = val
            elif our_key not in lead or not lead[our_key]:
                lead[our_key] = val

    # Build location from parts if not set
    if not lead.get('location'):
        parts = [lead.pop('_city', ''), lead.pop('_state', '')]
        location = ', '.join(p for p in parts if p)
        lead['location'] = location or None
    else:
        lead.pop('_city', None)
        lead.pop('_state', None)

    # Must have a business name
    if not lead.get('business_name'):
        return None

    # Clean and format fields
    lead['business_name'] = str(lead['business_name']).strip()
    lead['domain'] = extract_domain(lead.get('domain'))
    lead['phone_number'] = format_phone(lead.get('phone_number'))
    lead['location'] = str(lead.get('location', '')).strip() or None
    lead['category'] = str(lead.get('category', '')).strip() or None

    # Rating: ensure float, round to 1 decimal
    try:
        rating = float(lead.get('rating', 0))
        lead['rating'] = round(rating, 1) if rating > 0 else None
    except (ValueError, TypeError):
        lead['rating'] = None

    # Email: handle list
    email = lead.get('email')
    if isinstance(email, list):
        email = email[0] if email else None
    lead['email'] = str(email).strip() if email else None

    # Default status
    lead['status'] = 'Not Contacted'
    lead['notes'] = ''
    lead['last_contacted'] = None
    lead['created_at'] = datetime.now(timezone.utc).isoformat()

    return lead


# ── BATCH PARSER ──────────────────────────────────────────────

def parse_apify_json(data: list, user_id: str, file_id: str) -> dict:
    """
    Parse a full Apify JSON export.
    Returns dict with: leads list, total, inserted count, duplicates count.
    Also deduplicates by phone number within the batch.
    """
    if not isinstance(data, list):
        # Some Apify exports wrap in a dict
        if isinstance(data, dict) and 'items' in data:
            data = data['items']
        else:
            return {'leads': [], 'total': 0, 'duplicates': 0}

    seen_phones = set()
    seen_names = set()
    parsed = []

    for raw in data:
        if not isinstance(raw, dict):
            continue
        lead = parse_lead(raw)
        if not lead:
            continue

        # Deduplicate within batch by phone
        phone_key = lead.get('phone_number')
        name_key = lead['business_name'].lower().strip()

        if phone_key and phone_key in seen_phones:
            continue
        if name_key in seen_names:
            continue

        if phone_key:
            seen_phones.add(phone_key)
        seen_names.add(name_key)

        lead['user_id'] = user_id
        lead['file_id'] = file_id
        parsed.append(lead)

    return {
        'leads': parsed,
        'total': len(data),
        'valid': len(parsed),
        'duplicates_in_batch': len(data) - len(parsed),
    }
