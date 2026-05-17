import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, MessageSquare, Copy, Send, Check, 
  RefreshCw, Sparkles, AlertCircle, Info, Phone, X
} from 'lucide-react';
import { generateMessage } from '../utils/messageEngine';
import { leadsAPI } from '../services/api';
import toast from 'react-hot-toast';

const TONES = [
  { id: 'professional', label: 'Professional', icon: '💼' },
  { id: 'friendly', label: 'Friendly', icon: '👋' },
  { id: 'premium', label: 'Premium', icon: '🏆' },
  { id: 'casual', label: 'Casual', icon: '😄' },
];

export default function MessageGenerator({ lead }) {
  const [tone, setTone] = useState('professional');
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const generate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      // Fixed: Using the correct function name 'generateMessage' from messageEngine.js
      const msg = generateMessage(lead, tone);
      setMessage(msg);
      setIsGenerating(false);
    }, 600);
  };

  useEffect(() => {
    generate();
  }, [lead, tone]);

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    toast.success('Message copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = async () => {
    if (!lead.phone_number) {
      toast.error('No phone number available for this lead');
      return;
    }
    
    try {
      await leadsAPI.updateStatus(lead.id, 'Sent');
      const encodedMsg = encodeURIComponent(message);
      const url = `https://wa.me/${lead.phone_number}?text=${encodedMsg}`;
      window.open(url, '_blank');
      toast.success('Opening WhatsApp...');
    } catch (err) {
      console.error('Outreach logging failed:', err);
    }
  };

  return (
    <div className="bg-[#13131f] border border-[#1e1e2e] rounded-[32px] overflow-hidden shadow-2xl flex flex-col md:flex-row min-h-[500px]">
      {/* Left: Lead Context & Tones */}
      <div className="w-full md:w-[320px] bg-[#08080f] p-8 border-r border-[#1e1e2e]">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={16} className="text-[#3b82f6]" />
            <span className="text-[10px] font-black text-[#3b82f6] uppercase tracking-[0.2em]">Context Hub</span>
          </div>
          <h2 className="text-xl font-bold text-white mb-2 truncate">{lead.business_name}</h2>
          <div className="flex items-center gap-2 text-xs text-[#475569]">
            <Phone size={10} />
            {lead.phone_number || 'No Phone'}
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <p className="text-[10px] font-black text-[#475569] uppercase tracking-widest mb-4">Choose Tone</p>
            <div className="grid grid-cols-1 gap-2">
              {TONES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTone(t.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                    tone === t.id 
                    ? 'bg-[#3b82f6] text-white shadow-lg shadow-blue-500/20' 
                    : 'bg-[#13131f] text-[#94a3b8] border border-[#1e1e2e] hover:border-[#3b82f630]'
                  }`}
                >
                  <span className="text-lg">{t.icon}</span>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-5 bg-blue-500/5 border border-blue-500/10 rounded-2xl">
            <div className="flex items-center gap-2 mb-2 text-[#3b82f6]">
              <Info size={14} />
              <span className="text-[10px] font-bold uppercase tracking-widest">AI Tip</span>
            </div>
            <p className="text-[11px] text-[#94a3b8] leading-relaxed">
              {lead.domain 
                ? "This client has a website. AI is highlighting their digital presence." 
                : "No website detected. AI is focusing on digital modernization value."}
            </p>
          </div>
        </div>
      </div>

      {/* Right: Message Editor */}
      <div className="flex-1 p-8 flex flex-col bg-gradient-to-br from-[#13131f] to-[#08080f]">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#3b82f610] flex items-center justify-center">
              <Zap size={18} className="text-[#3b82f6]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">AI Generated Outreach</h3>
              <p className="text-[10px] text-[#475569] font-medium uppercase tracking-widest">Personalized for {lead.business_name}</p>
            </div>
          </div>
          <button 
            onClick={generate}
            disabled={isGenerating}
            className="flex items-center gap-2 text-[10px] font-black text-[#3b82f6] hover:text-white transition-colors"
          >
            <RefreshCw size={14} className={isGenerating ? 'animate-spin' : ''} />
            REGENERATE
          </button>
        </div>

        <div className="relative flex-1 group">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full h-full min-h-[300px] bg-[#08080f] border border-[#1e1e2e] rounded-[24px] p-8 text-white text-[15px] leading-relaxed outline-none focus:border-[#3b82f630] transition-all resize-none font-medium"
            placeholder="AI is generating your message..."
          />
          
          <AnimatePresence>
            {isGenerating && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-[#08080f]/80 backdrop-blur-sm rounded-[24px] flex items-center justify-center flex-col gap-4"
              >
                <div className="flex gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                      transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                      className="w-2.5 h-2.5 rounded-full bg-[#3b82f6]"
                    />
                  ))}
                </div>
                <p className="text-xs font-bold text-[#3b82f6] uppercase tracking-[0.2em]">Crafting Magic...</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Actions */}
        <div className="mt-8 flex items-center justify-between gap-4">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-6 py-4 rounded-2xl bg-[#1e1e2e] text-white text-[11px] font-black uppercase tracking-widest hover:bg-[#2a2a3a] transition-all"
          >
            {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
            {copied ? 'Copied' : 'Copy Message'}
          </button>

          <button
            onClick={handleWhatsApp}
            disabled={!lead.phone_number}
            className="flex-1 flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-[#3b82f6] text-white text-[12px] font-black uppercase tracking-widest hover:bg-[#2563eb] transition-all shadow-xl shadow-blue-500/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={18} />
            Send via WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
}
