/**
 * Format phone number to WhatsApp-compatible international format
 * Removes spaces, dashes, parentheses, etc.
 * Handles Indian (+91) numbers by default
 */
export function formatWhatsAppNumber(raw) {
  if (!raw) return null;
  let num = String(raw).replace(/[\s\-().+]/g, '');
  // Remove leading zeros
  num = num.replace(/^0+/, '');
  // Add country code if missing (assume +91 India if 10 digits)
  if (num.length === 10 && /^[6-9]/.test(num)) {
    num = '91' + num;
  }
  // Validate basic length
  if (num.length < 10 || num.length > 15) return null;
  return num;
}

/**
 * Build WhatsApp URL
 */
export function buildWhatsAppURL(phone, message) {
  const num = formatWhatsAppNumber(phone);
  if (!num) return null;
  const encoded = encodeURIComponent(message || '');
  return `https://wa.me/${num}?text=${encoded}`;
}

/**
 * Open WhatsApp — works on both desktop (WhatsApp Web) and mobile
 */
export function openWhatsApp(phone, message) {
  const url = buildWhatsAppURL(phone, message);
  if (!url) return false;
  window.open(url, '_blank', 'noopener,noreferrer');
  return true;
}

/**
 * Format date to readable string
 */
export function formatDate(dateStr) {
  if (!dateStr) return '—';
  try {
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

/**
 * Format relative time (e.g. "2 hours ago")
 */
export function timeAgo(dateStr) {
  if (!dateStr) return '—';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

/**
 * Status to badge variant mapping
 */
export function getStatusBadge(status) {
  const map = {
    'Not Contacted': 'gray',
    'Sent': 'cyan',
    'Replied': 'purple',
    'Converted': 'green',
    'Rejected': 'red',
  };
  return map[status] || 'gray';
}

/**
 * Truncate text
 */
export function truncate(str, n = 30) {
  if (!str) return '—';
  return str.length > n ? str.slice(0, n) + '…' : str;
}

/**
 * Calculate conversion rate
 */
export function calcConversionRate(converted, total) {
  if (!total) return 0;
  return Math.round((converted / total) * 100);
}

/**
 * Export array of objects to CSV
 */
export function exportToCSV(data, filename = 'leads.csv') {
  if (!data.length) return;
  const headers = Object.keys(data[0]);
  const rows = data.map((row) => headers.map((h) => `"${row[h] ?? ''}"`).join(','));
  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Detect if device is mobile
 */
export function isMobile() {
  return /Android|iPhone|iPad/i.test(navigator.userAgent);
}

/**
 * Debounce function
 */
export function debounce(fn, delay = 300) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  };
}
