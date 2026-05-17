import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Search, RefreshCw, Star, MapPin, 
  MessageSquare, Trash2, Filter, ChevronDown, Zap, Clock,
  Phone, Globe, ExternalLink, AlertTriangle, X, Briefcase, Navigation,
  Send, MessageCircle, Trophy, XCircle, Activity
} from 'lucide-react';
import { useLeads } from '../context/LeadsContext';
import MessageGenerator from '../components/MessageGenerator';

const STATUS_OPTIONS = [
  { id: 'Not Contacted', label: 'PENDING', icon: Clock, color: '#eab308' },
  { id: 'Sent', label: 'SENT', icon: Send, color: '#06b6d4' },
  { id: 'Replied', label: 'REPLIED', icon: MessageCircle, color: '#3b82f6' },
  { id: 'Converted', label: 'CONVERTED', icon: Trophy, color: '#a855f7' },
  { id: 'Rejected', label: 'REJECTED', icon: XCircle, color: '#ef4444' },
];

export default function LeadsPage() {
  const { leads, totalLeads, fetchLeads, deleteLead, setFilters, updateLeadStatus } = useLeads();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterWebsite, setFilterWebsite] = useState('ALL'); 
  const [filterRating, setFilterRating] = useState('ANY RATING'); 
  const [filterStage, setFilterStage] = useState('ALL STAGES');
  const [selectedLead, setSelectedLead] = useState(null);
  const [leadToDelete, setLeadToDelete] = useState(null);
  const [openStatusId, setOpenStatusId] = useState(null);

  useEffect(() => {
    setFilters({ search: '', location: '', category: '', status: '' });
    fetchLeads();
  }, []);

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const s = searchTerm.toLowerCase();
      const matchesSearch = !s || 
        (lead.business_name || '').toLowerCase().includes(s) || 
        (lead.phone_number || '').includes(s) ||
        (lead.category || '').toLowerCase().includes(s);
      
      let matchesWebsite = true;
      if (filterWebsite === 'NO WEBSITE') matchesWebsite = !lead.domain;
      if (filterWebsite === 'WITH WEBSITE') matchesWebsite = !!lead.domain;

      let matchesRating = true;
      const rating = parseFloat(lead.rating || 0);
      if (filterRating === '4.0+') matchesRating = rating >= 4.0;
      if (filterRating === 'UNDER 4.0') matchesRating = rating > 0 && rating < 4.0;

      let matchesStage = true;
      if (filterStage !== 'ALL STAGES') {
        const stage = filterStage === 'Pending' ? 'Not Contacted' : filterStage;
        matchesStage = lead.status === stage;
      }

      return matchesSearch && matchesWebsite && matchesRating && matchesStage;
    });
  }, [leads, searchTerm, filterWebsite, filterRating, filterStage]);

  const confirmDelete = () => {
    if (leadToDelete) {
      deleteLead(leadToDelete.id);
      setLeadToDelete(null);
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto animate-fade-in px-6 pt-2 pb-20 font-sans">
      
      {/* COMPACT PREMIUM HEADER */}
      <div className="bg-[#0d0d12] border border-[#1e1e2e] rounded-[24px] p-6 mb-6 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Activity size={12} className="text-[#3b82f6]" />
              <span className="text-[10px] font-black text-[#3b82f6] uppercase tracking-[0.2em]">Live Dashboard</span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter">Lead Database</h1>
            <p className="text-[12px] text-[#475569] font-medium">
              Processing <span className="text-white font-bold">{filteredLeads.length}</span> business entities.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative group">
              <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#475569] group-focus-within:text-[#3b82f6] transition-colors" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-[#08080b] border border-[#1e1e2e] text-[13px] text-white pl-10 pr-4 py-2.5 rounded-full w-[280px] outline-none focus:border-[#3b82f640] transition-all"
              />
            </div>
            <button 
              onClick={() => fetchLeads()}
              className="w-12 h-12 rounded-xl bg-[#08080b] border border-[#1e1e2e] flex items-center justify-center text-[#475569] hover:text-[#3b82f6] transition-all shadow-lg"
            >
              <RefreshCw size={18} />
            </button>
          </div>
        </div>

        {/* Filters Section - Compact */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 shrink-0">
            <Filter size={12} className="text-[#475569]" />
            <span className="text-[9px] font-black text-[#475569] uppercase tracking-[0.15em]">Filters:</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex p-0.5 bg-[#08080b] border border-[#1e1e2e] rounded-lg">
              {['ALL', 'NO WEBSITE', 'WITH WEBSITE'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilterWebsite(f)}
                  className={`px-4 py-1.5 rounded-md text-[8.5px] font-black transition-all ${
                    filterWebsite === f ? 'bg-[#3b82f6] text-white shadow-md' : 'text-[#475569] hover:text-[#94a3b8]'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            <div className="w-[1px] h-3.5 bg-[#1e1e2e] mx-1" />

            <div className="flex p-0.5 bg-[#08080b] border border-[#1e1e2e] rounded-lg">
              {['ANY RATING', '4.0+', 'UNDER 4.0'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilterRating(f)}
                  className={`px-4 py-1.5 rounded-md text-[8.5px] font-black transition-all ${
                    filterRating === f ? 'bg-[#3b82f6] text-white shadow-md' : 'text-[#475569] hover:text-[#94a3b8]'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            <div className="w-[1px] h-3.5 bg-[#1e1e2e] mx-1" />

            <div className="relative">
              <select 
                value={filterStage}
                onChange={(e) => setFilterStage(e.target.value)}
                className="appearance-none bg-[#08080b] border border-[#1e1e2e] text-[9px] font-black text-[#94a3b8] px-5 py-2 rounded-lg outline-none focus:border-[#3b82f630] pr-10 uppercase tracking-[0.1em]"
              >
                <option>ALL STAGES</option>
                <option>Pending</option>
                <option>Sent</option>
                <option>Replied</option>
                <option>Converted</option>
              </select>
              <ChevronDown size={12} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#475569] pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Leads */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredLeads.map((lead) => {
          const currentStatus = STATUS_OPTIONS.find(o => o.id === lead.status) || STATUS_OPTIONS[0];

          return (
            <div key={lead.id} className="bg-[#0f0f15] border border-[#1e1e2e] rounded-[24px] transition-all group overflow-hidden flex flex-col shadow-xl relative">
              {/* Header */}
              <div className="p-6 pb-3.5">
                <div className="flex items-start justify-between mb-2.5">
                  <div className="flex items-center gap-1.5">
                    <Briefcase size={12} className="text-[#3b82f6]" />
                    <span className="text-[9px] font-black text-[#3b82f6] uppercase tracking-[0.15em]">{lead.category || 'BUSINESS'}</span>
                  </div>
                  <button onClick={() => setLeadToDelete(lead)} className="text-[#1a1a25] hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                </div>
                <h3 className="text-[17px] font-black text-white tracking-tight leading-tight truncate">{lead.business_name}</h3>
              </div>

              {/* Info */}
              <div className="px-6 py-4 border-t border-[#1e1e2e]/20">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-[8px] font-black text-[#475569] uppercase tracking-widest">Phone</span>
                    <a href={lead.phone_number ? `tel:+${lead.phone_number}` : '#'} className="text-[13px] font-bold text-white flex items-center gap-1.5 hover:text-[#3b82f6] transition-colors">
                      <Phone size={11} className="text-[#3b82f6]" /> {lead.phone_number || 'N/A'}
                    </a>
                  </div>
                  <div className="flex flex-col gap-1 items-end">
                    <span className="text-[8px] font-black text-[#475569] uppercase tracking-widest">Rating</span>
                    <div className="flex items-center gap-1.5 text-[13px] font-bold text-white">
                      <Star size={11} className="text-[#eab308] fill-[#eab308]" /> {lead.rating || 'N/A'}
                    </div>
                  </div>
                </div>
                
                <a 
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lead.business_name + (lead.location ? ', ' + lead.location : ''))}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="bg-[#08080b] rounded-xl p-2.5 px-3.5 flex items-center justify-between border border-[#1e1e2e15] hover:border-[#3b82f650] transition-all cursor-pointer group/loc"
                >
                  <p className="text-[11px] text-[#94a3b8] italic truncate pr-4 group-hover/loc:text-white transition-colors">{lead.location || 'Location Not Available'}</p>
                  <Navigation size={11} className="text-[#3b82f6] rotate-45 shrink-0" />
                </a>
              </div>

              {/* Presence */}
              <div className="px-6 py-3 border-t border-[#1e1e2e]/20 flex items-center gap-3">
                <span className="text-[9px] font-black text-[#475569] uppercase tracking-widest">Presence:</span>
                {!lead.domain ? (
                  <div className="bg-red-500/5 border border-red-500/10 px-3 py-0.5 rounded-full text-[8px] font-black text-red-500/70 uppercase">No Website</div>
                ) : (
                  <a href={`https://${lead.domain}`} target="_blank" rel="noopener noreferrer" className="bg-blue-500/5 border border-blue-500/10 px-3 py-0.5 rounded-full text-[8px] font-black text-[#3b82f6] uppercase flex items-center gap-1.5 hover:bg-blue-500/10 transition-all">
                    <Globe size={9} /> View Site
                  </a>
                )}
              </div>

              {/* Footer */}
              <div className="bg-black/40 px-6 py-4 mt-auto border-t border-[#1e1e2e]/40 relative">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[8px] font-black text-[#475569] uppercase tracking-widest">Status</span>
                    <div className="relative">
                      <button 
                        onClick={() => setOpenStatusId(openStatusId === lead.id ? null : lead.id)}
                        className={`w-[130px] flex items-center justify-between px-3.5 py-1.5 rounded-full border text-[9px] font-black transition-all ${openStatusId === lead.id ? 'bg-[#1e1e2e] border-white/10' : 'bg-transparent border-white/5'}`}
                        style={{ color: currentStatus.color, borderColor: `${currentStatus.color}25` }}
                      >
                        <div className="flex items-center gap-2">
                          <currentStatus.icon size={11} />
                          <span>{currentStatus.label}</span>
                        </div>
                        <ChevronDown size={8} className={`transition-transform ${openStatusId === lead.id ? 'rotate-180' : ''}`} />
                      </button>

                      <AnimatePresence>
                        {openStatusId === lead.id && (
                          <motion.div 
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute bottom-full left-0 mb-2 w-[150px] bg-[#111118] border border-white/10 rounded-2xl shadow-2xl p-1 z-20"
                          >
                            {STATUS_OPTIONS.map((opt) => (
                              <button
                                key={opt.id}
                                onClick={() => {
                                  updateLeadStatus(lead.id, opt.id);
                                  setOpenStatusId(null);
                                }}
                                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[9px] font-black transition-all ${lead.status === opt.id ? 'bg-white/5 text-white' : 'text-[#475569] hover:bg-white/5 hover:text-white'}`}
                              >
                                <opt.icon size={12} style={{ color: opt.color }} />
                                <span>{opt.label}</span>
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  <button 
                    onClick={() => setSelectedLead(lead)}
                    className="flex-1 bg-[#3b82f6] hover:bg-[#2563eb] text-white h-10 px-4 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all shadow-md active:scale-95"
                  >
                    <MessageSquare size={14} className="fill-white" />
                    Outreach
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modals remain same */}
      <AnimatePresence>
        {leadToDelete && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="bg-[#0f0f15] border border-[#1e1e2e] rounded-[32px] p-10 max-w-md w-full text-center shadow-2xl">
              <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6"><AlertTriangle size={40} className="text-red-500" /></div>
              <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">Confirm Deletion</h3>
              <p className="text-[#94a3b8] text-sm mb-8">Are you sure you want to delete <span className="text-white font-bold">{leadToDelete.business_name}</span>?</p>
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setLeadToDelete(null)} className="px-6 py-3 rounded-xl bg-[#1e1e2e] text-white text-sm font-bold hover:bg-[#2a2a3a]">Cancel</button>
                <button onClick={confirmDelete} className="px-6 py-3 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600">Delete Lead</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {selectedLead && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto pt-20">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }} className="w-full max-w-4xl min-h-[500px]">
              <div className="flex justify-end mb-4"><button onClick={() => setSelectedLead(null)} className="w-10 h-10 rounded-full bg-[#0f0f15] border border-[#1e1e2e] flex items-center justify-center text-white/50 hover:text-white"><X size={20} /></button></div>
              <MessageGenerator lead={selectedLead} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
