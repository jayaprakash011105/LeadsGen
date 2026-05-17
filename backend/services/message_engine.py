"""
AI Message Generation Engine
Rule-based personalized WhatsApp cold outreach message generator.
Mirrors the frontend messageEngine.js for server-side generation.
"""

TONES = ['professional', 'friendly', 'premium', 'casual']


def detect_scenario(lead: dict) -> str:
    domain = lead.get('domain') or ''
    has_website = bool(domain and domain.strip() not in ('', 'N/A', 'null'))
    try:
        rating = float(lead.get('rating') or 0)
    except (ValueError, TypeError):
        rating = 0

    if not has_website:
        return 'no_website'
    if has_website and 0 < rating < 4.0:
        return 'low_rating'
    if has_website and rating >= 4.0:
        return 'good_rating'
    return 'generic'


TEMPLATES = {
    'no_website': {
        'professional': lambda l: f"Hello {l.get('business_name', 'there')},\n\nI came across your business{' in ' + l['location'] if l.get('location') else ''} and noticed you don't currently have a professional website. In today's digital landscape, a website is essential for credibility, visibility, and attracting more customers.\n\nWe specialize in building fast, modern websites for {l.get('category', 'businesses')} like yours — typically live within 5–7 days.\n\n📌 What you get:\n✅ Professional design\n✅ Mobile-responsive\n✅ SEO-optimized\n✅ Affordable pricing\n\nWould you be open to a quick 10-minute call this week?\n\nBest regards,\n[Your Name]",
        'friendly': lambda l: f"Hey {l.get('business_name', 'there')}! 👋\n\nI found your business{' in ' + l['location'] if l.get('location') else ''} and noticed you're not online yet — and you're honestly missing out!\n\nA website can help you get *more customers* even while you sleep 😄\n\nI build clean, professional websites for {l.get('category', 'local businesses')} and I'd love to help you get started.\n\nDrop me a message and let's chat! 🚀",
        'premium': lambda l: f"Dear {l.get('business_name', 'there')},\n\nI hope this message finds you well. I specialize in building premium digital solutions for established {l.get('category', 'businesses')}, and I noticed your business{' in ' + l['location'] if l.get('location') else ''} doesn't yet have an online presence.\n\nA professionally crafted website can significantly increase your revenue, brand authority, and customer trust.\n\n🏆 Our premium packages include:\n• Custom design & branding\n• Lead capture systems\n• Google Business integration\n• Ongoing support\n\nI'd love to discuss how we can elevate your digital presence. Are you available for a brief consultation?\n\nWarm regards,\n[Your Name]",
        'casual': lambda l: f"Hi {l.get('business_name', 'there')}! Quick question — do you have a website?\n\nI checked and couldn't find one. Websites are super affordable now and can bring in a LOT more business.\n\nI make them for people like you — no tech skills needed from your side. Just tell me what you do and I handle everything 😊\n\nInterested? Reply and let's talk!",
    },
    'low_rating': {
        'professional': lambda l: f"Hello {l.get('business_name', 'there')},\n\nI reviewed your business online and noticed your current Google rating is {l.get('rating', 'below average')}. Research shows that businesses with ratings above 4.0 receive up to 3x more inquiries.\n\nWe help {l.get('category', 'businesses')} in {l.get('location', 'your area')} improve their online reputation through:\n✅ Review generation strategies\n✅ Website optimization\n✅ Reputation management\n\nWould you be interested in a free 15-minute consultation?\n\nBest regards,\n[Your Name]",
        'friendly': lambda l: f"Hey {l.get('business_name', 'there')}! 👋\n\nI noticed your Google rating is at {l.get('rating', 'a lower score')} — and I genuinely think you deserve better!\n\nMore good reviews = more customers. It's that simple.\n\nI help businesses like yours build a stronger online reputation and get more 5-star reviews. Want to know how? Let's chat! 😊",
        'premium': lambda l: f"Dear {l.get('business_name', 'there')},\n\nI've been analyzing local businesses in {l.get('location', 'your area')} and your business stood out — though I believe there's significant untapped potential with your current rating of {l.get('rating', 'N/A')}.\n\nOur reputation management service is designed specifically for {l.get('category', 'established businesses')} looking to dominate their local market.\n\n🏆 Results our clients see:\n• Rating improvement to 4.5+\n• 40% increase in customer inquiries\n• Stronger brand authority\n\nI'd welcome a consultation at your convenience.\n\nWarm regards,\n[Your Name]",
        'casual': lambda l: f"Hi {l.get('business_name', 'there')}!\n\nSaw your Google rating is {l.get('rating', 'low')} — honestly you can do way better! 🌟\n\nI help local businesses get more positive reviews and look amazing online.\n\nGive me a shout if you're curious — no pressure at all! 😄",
    },
    'good_rating': {
        'professional': lambda l: f"Hello {l.get('business_name', 'there')},\n\nCongratulations on your impressive {l.get('rating', '')}⭐ rating! Your business clearly delivers excellent service{' in ' + l['location'] if l.get('location') else ''}.\n\nWe work with top-performing {l.get('category', 'businesses')} to help them scale their digital marketing and reach even more customers online.\n\nOur services include:\n✅ Google Ads & SEO\n✅ Social media marketing\n✅ Lead generation campaigns\n✅ Website performance optimization\n\nWould you be open to exploring how we can accelerate your growth?\n\nBest regards,\n[Your Name]",
        'friendly': lambda l: f"Hey {l.get('business_name', 'there')}! 🌟\n\nWow — a {l.get('rating', '')} rating? That's awesome! You're clearly doing something right.\n\nI help great businesses like yours reach even MORE customers through digital marketing.\n\nIf you're looking to grow, I'd love to share some ideas. No pressure — just a quick chat! 😊",
        'premium': lambda l: f"Dear {l.get('business_name', 'there')},\n\nYour {l.get('rating', '')}⭐ rating speaks volumes about the quality of your service. It's rare to find such a well-regarded {l.get('category', 'business')} in {l.get('location', 'the market')}.\n\nWe partner exclusively with high-performing businesses to amplify their digital presence and maximize revenue through bespoke growth strategies.\n\nI believe there's a compelling opportunity to discuss. Would a brief call work for you?\n\nWarm regards,\n[Your Name]",
        'casual': lambda l: f"Hi {l.get('business_name', 'there')}! Love the {l.get('rating', '')}⭐ rating 🔥\n\nYou're crushing it! I help businesses like yours get even more customers through digital marketing.\n\nWanna see how? I'll keep it short — promise! 😄",
    },
    'generic': {
        'professional': lambda l: f"Hello {l.get('business_name', 'there')},\n\nI hope this message finds you well. I came across your business{' in ' + l['location'] if l.get('location') else ''} and wanted to reach out about potential collaboration.\n\nWe specialize in helping {l.get('category', 'businesses')} grow their online presence, generate more leads, and improve customer engagement.\n\nWould you have 10 minutes this week for a brief call?\n\nBest regards,\n[Your Name]",
        'friendly': lambda l: f"Hey {l.get('business_name', 'there')}! 👋\n\nFound your business online and thought I'd reach out!\n\nI help {l.get('category', 'local businesses')} get more customers through digital marketing — and I think I could genuinely help you grow!\n\nWanna chat? 😊",
        'premium': lambda l: f"Dear {l.get('business_name', 'there')},\n\nI hope this message reaches you in good health. Having researched leading {l.get('category', 'businesses')} in {l.get('location', 'your area')}, I believe there is an exciting opportunity to discuss.\n\nWe deliver premium digital growth solutions tailored to ambitious businesses.\n\nWarm regards,\n[Your Name]",
        'casual': lambda l: f"Hi {l.get('business_name', 'there')}! Quick message — I help businesses like yours get more customers online.\n\nThought I'd reach out and see if you're open to it!\n\nLet me know 😊",
    },
}


def generate_message(lead: dict, tone: str = 'professional') -> str:
    """Generate a personalized WhatsApp message for a lead."""
    scenario = detect_scenario(lead)
    tone = tone if tone in TONES else 'professional'
    template_fn = TEMPLATES.get(scenario, TEMPLATES['generic']).get(tone, TEMPLATES['generic']['professional'])
    return template_fn(lead)


def generate_all_tones(lead: dict) -> dict:
    """Generate messages for all 4 tones."""
    return {tone: generate_message(lead, tone) for tone in TONES}
