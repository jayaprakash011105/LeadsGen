/**
 * AI-Powered Message Engine (Client-Side Rule-Based)
 * Generates personalized WhatsApp cold outreach messages
 * based on business data and selected tone.
 */

const TONES = {
  professional: 'professional',
  friendly: 'friendly',
  premium: 'premium',
  casual: 'casual',
};

// ── SCENARIO DETECTION ────────────────────────────────────────

function detectScenario(lead) {
  const hasWebsite = lead.domain && lead.domain !== 'N/A' && lead.domain !== '';
  const rating = parseFloat(lead.rating) || 0;
  const lowRating = rating > 0 && rating < 4.0;

  if (!hasWebsite) return 'no_website';
  if (hasWebsite && lowRating) return 'low_rating';
  if (hasWebsite && rating >= 4.0) return 'good_rating';
  return 'generic';
}

// ── MESSAGE TEMPLATES ─────────────────────────────────────────

const TEMPLATES = {
  no_website: {
    professional: (lead) =>
      `Hello ${lead.business_name},\n\nI came across your business${lead.location ? ` in ${lead.location}` : ''} and noticed you don't currently have a professional website. In today's digital landscape, a website is essential for credibility, visibility, and attracting more customers.\n\nWe specialize in building fast, modern websites for ${lead.category || 'businesses'} like yours — typically live within 5–7 days.\n\n📌 What you get:\n✅ Professional design\n✅ Mobile-responsive\n✅ SEO-optimized\n✅ Affordable pricing\n\nWould you be open to a quick 10-minute call this week?\n\nBest regards,\n[Your Name]`,

    friendly: (lead) =>
      `Hey ${lead.business_name}! 👋\n\nI found your business${lead.location ? ` in ${lead.location}` : ''} and noticed you're not online yet — and you're honestly missing out!\n\nA website can help you get *more customers* even while you sleep 😄\n\nI build clean, professional websites for ${lead.category || 'local businesses'} and I'd love to help you get started.\n\nDrop me a message and let's chat! 🚀`,

    premium: (lead) =>
      `Dear ${lead.business_name},\n\nI hope this message finds you well. I specialize in building premium digital solutions for established ${lead.category || 'businesses'}, and I noticed your business${lead.location ? ` in ${lead.location}` : ''} doesn't yet have an online presence.\n\nA professionally crafted website can significantly increase your revenue, brand authority, and customer trust.\n\n🏆 Our premium packages include:\n• Custom design & branding\n• Lead capture systems\n• Google Business integration\n• Ongoing support\n\nI'd love to discuss how we can elevate your digital presence. Are you available for a brief consultation?\n\nWarm regards,\n[Your Name]`,

    casual: (lead) =>
      `Hi ${lead.business_name}! Quick question — do you have a website?\n\nI checked and couldn't find one. Websites are super affordable now and can bring in a LOT more business.\n\nI make them for people like you — no tech skills needed from your side. Just tell me what you do and I handle everything 😊\n\nInterested? Reply and let's talk!`,
  },

  low_rating: {
    professional: (lead) =>
      `Hello ${lead.business_name},\n\nI reviewed your business online and noticed your current Google rating is ${lead.rating || 'below average'}. Research shows that businesses with ratings above 4.0 receive up to 3x more inquiries.\n\nWe help ${lead.category || 'businesses'} in ${lead.location || 'your area'} improve their online reputation through:\n✅ Review generation strategies\n✅ Website optimization\n✅ Reputation management\n\nWould you be interested in a free 15-minute consultation?\n\nBest regards,\n[Your Name]`,

    friendly: (lead) =>
      `Hey ${lead.business_name}! 👋\n\nI noticed your Google rating is at ${lead.rating || 'a lower score'} — and I genuinely think you deserve better!\n\nMore good reviews = more customers. It's that simple.\n\nI help businesses like yours build a stronger online reputation and get more 5-star reviews. Want to know how? Let's chat! 😊`,

    premium: (lead) =>
      `Dear ${lead.business_name},\n\nI've been analyzing local businesses in ${lead.location || 'your area'} and your business stood out — though I believe there's significant untapped potential with your current rating of ${lead.rating}.\n\nOur reputation management service is designed specifically for ${lead.category || 'established businesses'} looking to dominate their local market.\n\n🏆 Results our clients see:\n• Rating improvement from ${lead.rating} to 4.5+\n• 40% increase in customer inquiries\n• Stronger brand authority\n\nI'd welcome a consultation at your convenience.\n\nWarm regards,\n[Your Name]`,

    casual: (lead) =>
      `Hi ${lead.business_name}!\n\nSaw your Google rating is ${lead.rating} — honestly you can do way better! 🌟\n\nI help local businesses get more positive reviews and look amazing online. Pretty simple stuff that makes a big difference.\n\nGive me a shout if you're curious — no pressure at all! 😄`,
  },

  good_rating: {
    professional: (lead) =>
      `Hello ${lead.business_name},\n\nCongratulations on your impressive ${lead.rating}⭐ rating! Your business clearly delivers excellent service${lead.location ? ` in ${lead.location}` : ''}.\n\nWe work with top-performing ${lead.category || 'businesses'} to help them scale their digital marketing and reach even more customers online.\n\nOur services include:\n✅ Google Ads & SEO\n✅ Social media marketing\n✅ Lead generation campaigns\n✅ Website performance optimization\n\nWould you be open to exploring how we can accelerate your growth?\n\nBest regards,\n[Your Name]`,

    friendly: (lead) =>
      `Hey ${lead.business_name}! 🌟\n\nWow — a ${lead.rating} rating? That's awesome! You're clearly doing something right.\n\nI help great businesses like yours reach even MORE customers through digital marketing.\n\nIf you're looking to grow, I'd love to share some ideas. No pressure — just a quick chat! 😊`,

    premium: (lead) =>
      `Dear ${lead.business_name},\n\nYour ${lead.rating}⭐ rating speaks volumes about the quality of your service. It's rare to find such a well-regarded ${lead.category || 'business'} in ${lead.location || 'the market'}.\n\nWe partner exclusively with high-performing businesses to amplify their digital presence and maximize revenue through bespoke growth strategies.\n\nI believe there's a compelling opportunity to discuss. Would a brief call work for you?\n\nWarm regards,\n[Your Name]`,

    casual: (lead) =>
      `Hi ${lead.business_name}! Love the ${lead.rating}⭐ rating 🔥\n\nYou're crushing it! I help businesses like yours get even more customers through digital marketing.\n\nWanna see how? I'll keep it short — promise! 😄`,
  },

  generic: {
    professional: (lead) =>
      `Hello ${lead.business_name},\n\nI hope this message finds you well. I came across your business${lead.location ? ` in ${lead.location}` : ''} and wanted to reach out about potential collaboration.\n\nWe specialize in helping ${lead.category || 'businesses'} grow their online presence, generate more leads, and improve customer engagement.\n\nWould you have 10 minutes this week for a brief call?\n\nBest regards,\n[Your Name]`,

    friendly: (lead) =>
      `Hey ${lead.business_name}! 👋\n\nFound your business online and thought I'd reach out!\n\nI help ${lead.category || 'local businesses'} get more customers through digital marketing — and I think I could genuinely help you grow!\n\nWanna chat? 😊`,

    premium: (lead) =>
      `Dear ${lead.business_name},\n\nI hope this message reaches you in good health. Having researched leading ${lead.category || 'businesses'} in ${lead.location || 'your area'}, I believe there is an exciting opportunity to discuss.\n\nWe deliver premium digital growth solutions tailored to ambitious businesses. I would welcome the opportunity to arrange a brief consultation.\n\nWarm regards,\n[Your Name]`,

    casual: (lead) =>
      `Hi ${lead.business_name}! Quick message — I help businesses like yours get more customers online.\n\nThought I'd reach out and see if you're open to it!\n\nLet me know 😊`,
  },
};

// ── MAIN GENERATOR ────────────────────────────────────────────

/**
 * Generate a personalized WhatsApp message for a lead
 * @param {Object} lead - Lead object
 * @param {string} tone - 'professional' | 'friendly' | 'premium' | 'casual'
 * @returns {string} Generated message
 */
export function generateMessage(lead, tone = 'professional') {
  const scenario = detectScenario(lead);
  const toneKey = TONES[tone] || TONES.professional;
  const templateFn = TEMPLATES[scenario]?.[toneKey] || TEMPLATES.generic.professional;
  return templateFn(lead);
}

/**
 * Generate messages for all 4 tones for a given lead
 */
export function generateAllTones(lead) {
  return Object.keys(TONES).reduce((acc, tone) => {
    acc[tone] = generateMessage(lead, tone);
    return acc;
  }, {});
}

/**
 * Get scenario label for display
 */
export function getScenarioLabel(lead) {
  const s = detectScenario(lead);
  const labels = {
    no_website: '🌐 No Website',
    low_rating: '⭐ Low Rating',
    good_rating: '🏆 Good Rating',
    generic: '💼 Generic',
  };
  return labels[s] || '💼 Generic';
}

export const TONE_OPTIONS = [
  { value: 'professional', label: 'Professional', icon: '💼', desc: 'Formal & business-like' },
  { value: 'friendly', label: 'Friendly', icon: '😊', desc: 'Warm & approachable' },
  { value: 'premium', label: 'Premium', icon: '🏆', desc: 'Exclusive & high-end' },
  { value: 'casual', label: 'Casual', icon: '😄', desc: 'Relaxed & conversational' },
];
