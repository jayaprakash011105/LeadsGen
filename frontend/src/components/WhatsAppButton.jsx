import { useState } from 'react';
import { MessageCircle, ExternalLink, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { openWhatsApp, buildWhatsAppURL } from '../utils/helpers';
import { leadsAPI } from '../services/api';

export default function WhatsAppButton({ lead, message, onSent, compact = false }) {
  const [sent, setSent] = useState(lead?.status === 'Sent' || lead?.status === 'Replied' || lead?.status === 'Converted');

  const handleClick = async () => {
    const success = openWhatsApp(lead.phone_number, message);
    if (!success) {
      alert('Invalid or missing phone number for this lead.');
      return;
    }

    // Mark as Sent
    try {
      await leadsAPI.updateStatus(lead.id, 'Sent');
      setSent(true);
      onSent?.('Sent');
    } catch {
      // Silent fail — WhatsApp still opened
    }
  };

  if (compact) {
    return (
      <button
        onClick={handleClick}
        title={sent ? 'Sent — Click to resend' : 'Send WhatsApp message'}
        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${
          sent
            ? 'bg-green-500/10 border border-green-500/30 text-green-400 hover:bg-green-500/20'
            : 'bg-[#25D366]/10 border border-[#25D366]/30 text-[#25D366] hover:bg-[#25D366]/20'
        }`}
      >
        {sent ? <Check size={14} /> : <MessageCircle size={14} />}
      </button>
    );
  }

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      onClick={handleClick}
      className="flex items-center gap-2.5 px-5 py-3 rounded-xl font-medium text-sm transition-all duration-200 w-full justify-center"
      style={
        sent
          ? { background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#34d399' }
          : { background: 'rgba(37,211,102,0.12)', border: '1px solid rgba(37,211,102,0.3)', color: '#25D366' }
      }
    >
      {sent ? (
        <>
          <Check size={18} />
          Message Sent — Click to Resend
        </>
      ) : (
        <>
          <MessageCircle size={18} />
          Send WhatsApp Message
          <ExternalLink size={14} className="ml-auto opacity-50" />
        </>
      )}
    </motion.button>
  );
}
