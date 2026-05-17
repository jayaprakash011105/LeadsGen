import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Filter, ChevronUp, ChevronDown, ChevronLeft, ChevronRight,
  Trash2, MessageCircle, Globe, MapPin, Star, ExternalLink,
  Download, RefreshCw, CheckSquare, Square, SlidersHorizontal,
} from 'lucide-react';
import { useLeads } from '../context/LeadsContext';
import { getStatusBadge, truncate, timeAgo, exportToCSV } from '../utils/helpers';
import WhatsAppButton from './WhatsAppButton';
import MessageGenerator from './MessageGenerator';
import { leadsAPI } from '../services/api';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = ['All', 'Not Contacted', 'Sent', 'Replied', 'Converted', 'Rejected'];

const BADGE_CLASS = {
  gray: 'badge-gray', cyan: 'badge-cyan', purple: 'badge-purple',
  green: 'badge-green', yellow: 'badge-yellow', red: 'badge-red',
};

export default function LeadTable() {
  const {
    leads, totalLeads, loading, filters, setFilters,
    pagination, setPagination, sortBy, setSortBy, sortDir, setSortDir,
    fetchLeads, updateLeadStatus, deleteLead, bulkDelete,
  } = useLeads();

  const [selected, setSelected] = useState([]);
  const [activeLeadMsg, setActiveLeadMsg] = useState(null);
  const [searchInput, setSearchInput] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const searchRef = useRef(null);

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => {
      setFilters((f) => ({ ...f, search: searchInput }));
      setPagination((p) => ({ ...p, page: 1 }));
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Fetch leads on filter/pagination change
  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const toggleSelect = (id) =>
    setSelected((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id]);

  const toggleSelectAll = () =>
    setSelected(selected.length === leads.length ? [] : leads.map((l) => l.id));

  const handleSort = (col) => {
    if (sortBy === col) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortBy(col); setSortDir('asc'); }
  };

  const SortIcon = ({ col }) => (
    sortBy === col
      ? sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
      : <ChevronDown size={12} className="opacity-30" />
  );

  const totalPages = Math.ceil(totalLeads / pagination.limit);

  const handleExport = () => {
    const exportData = leads.map((l) => ({
      business_name: l.business_name,
      domain: l.domain,
      phone_number: l.phone_number,
      location: l.location,
      category: l.category,
      rating: l.rating,
      status: l.status,
      last_contacted: l.last_contacted,
    }));
    exportToCSV(exportData, 'leadpulse_leads.csv');
    toast.success('Exported to CSV!');
  };

  const handleBulkDelete = async () => {
    if (!selected.length) return;
    if (!confirm(`Delete ${selected.length} leads?`)) return;
    await bulkDelete(selected);
    setSelected([]);
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="glass-card p-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-48">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              ref={searchRef}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="input-field pl-9 text-sm py-2.5"
              placeholder="Search leads..."
            />
          </div>

          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters((s) => !s)}
            className={`btn-secondary flex items-center gap-2 py-2.5 ${showFilters ? 'border-accent-cyan text-accent-cyan' : ''}`}
          >
            <SlidersHorizontal size={14} />
            Filters
          </button>

          {/* Refresh */}
          <button onClick={fetchLeads} className="btn-ghost py-2.5 flex items-center gap-2">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>

          {/* Export */}
          <button onClick={handleExport} className="btn-secondary flex items-center gap-2 py-2.5">
            <Download size={14} />
            Export CSV
          </button>

          {/* Bulk Delete */}
          {selected.length > 0 && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={handleBulkDelete}
              className="btn-danger flex items-center gap-2 py-2.5"
            >
              <Trash2 size={14} />
              Delete ({selected.length})
            </motion.button>
          )}

          <p className="text-xs text-text-muted ml-auto">
            {totalLeads} total leads
          </p>
        </div>

        {/* Filters Row */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="glow-separator my-3" />
              <div className="flex flex-wrap gap-3">
                <select
                  value={filters.status || ''}
                  onChange={(e) => {
                    setFilters((f) => ({ ...f, status: e.target.value }));
                    setPagination((p) => ({ ...p, page: 1 }));
                  }}
                  className="input-field py-2 text-xs w-40"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s === 'All' ? '' : s}>{s}</option>
                  ))}
                </select>

                <input
                  value={filters.location || ''}
                  onChange={(e) => {
                    setFilters((f) => ({ ...f, location: e.target.value }));
                    setPagination((p) => ({ ...p, page: 1 }));
                  }}
                  className="input-field py-2 text-xs w-40"
                  placeholder="Filter by location..."
                />

                <input
                  value={filters.category || ''}
                  onChange={(e) => {
                    setFilters((f) => ({ ...f, category: e.target.value }));
                    setPagination((p) => ({ ...p, page: 1 }));
                  }}
                  className="input-field py-2 text-xs w-40"
                  placeholder="Filter by category..."
                />

                <button
                  onClick={() => {
                    setFilters({ search: '', location: '', category: '', status: '' });
                    setSearchInput('');
                    setPagination((p) => ({ ...p, page: 1 }));
                  }}
                  className="btn-ghost text-xs py-2"
                >
                  Clear Filters
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="table-header w-10">
                  <button onClick={toggleSelectAll} className="text-text-muted hover:text-accent-cyan">
                    {selected.length === leads.length && leads.length > 0
                      ? <CheckSquare size={16} className="text-accent-cyan" />
                      : <Square size={16} />
                    }
                  </button>
                </th>
                {[
                  { col: 'business_name', label: 'Business' },
                  { col: 'domain', label: 'Domain' },
                  { col: 'phone_number', label: 'Phone' },
                  { col: 'location', label: 'Location' },
                  { col: 'category', label: 'Category' },
                  { col: 'rating', label: 'Rating' },
                  { col: 'status', label: 'Status' },
                  { col: 'last_contacted', label: 'Last Contact' },
                ].map(({ col, label }) => (
                  <th
                    key={col}
                    className="table-header cursor-pointer hover:text-text-secondary"
                    onClick={() => handleSort(col)}
                  >
                    <div className="flex items-center gap-1">
                      {label}
                      <SortIcon col={col} />
                    </div>
                  </th>
                ))}
                <th className="table-header text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-b border-border">
                    {Array.from({ length: 10 }).map((_, j) => (
                      <td key={j} className="table-cell">
                        <div className="skeleton h-4 rounded-md w-full" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-16 text-center text-text-muted text-sm">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-2xl bg-bg-elevated flex items-center justify-center">
                        <Search size={24} className="text-text-muted" />
                      </div>
                      <p>No leads found. Upload a JSON file to get started.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                leads.map((lead, i) => (
                  <motion.tr
                    key={lead.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="table-row"
                  >
                    <td className="table-cell">
                      <button onClick={() => toggleSelect(lead.id)} className="text-text-muted hover:text-accent-cyan">
                        {selected.includes(lead.id)
                          ? <CheckSquare size={16} className="text-accent-cyan" />
                          : <Square size={16} />
                        }
                      </button>
                    </td>
                    <td className="table-cell">
                      <p className="font-medium text-text-primary text-sm">{truncate(lead.business_name, 25)}</p>
                    </td>
                    <td className="table-cell">
                      {lead.domain && lead.domain !== 'N/A' ? (
                        <a
                          href={lead.domain.startsWith('http') ? lead.domain : `https://${lead.domain}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-accent-cyan text-xs hover:underline"
                        >
                          <Globe size={12} />
                          {truncate(lead.domain, 20)}
                          <ExternalLink size={10} />
                        </a>
                      ) : (
                        <span className="badge-red text-xs">No Website</span>
                      )}
                    </td>
                    <td className="table-cell">
                      <span className="font-mono text-xs text-text-secondary">{lead.phone_number || '—'}</span>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-1 text-xs text-text-secondary">
                        <MapPin size={11} className="shrink-0" />
                        {truncate(lead.location, 20)}
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className="badge-purple text-xs">{truncate(lead.category, 18)}</span>
                    </td>
                    <td className="table-cell">
                      {lead.rating ? (
                        <div className="flex items-center gap-1 text-xs">
                          <Star size={11} className="text-accent-yellow fill-accent-yellow" style={{ color: '#fbbf24', fill: '#fbbf24' }} />
                          <span className="text-text-primary">{lead.rating}</span>
                        </div>
                      ) : <span className="text-text-muted text-xs">—</span>}
                    </td>
                    <td className="table-cell">
                      <select
                        value={lead.status || 'Not Contacted'}
                        onChange={(e) => updateLeadStatus(lead.id, e.target.value)}
                        className={`badge ${BADGE_CLASS[getStatusBadge(lead.status)]} border-0 bg-transparent cursor-pointer text-xs`}
                        style={{ appearance: 'none', padding: '2px 8px' }}
                      >
                        {STATUS_OPTIONS.slice(1).map((s) => (
                          <option key={s} value={s} style={{ background: '#13131f' }}>{s}</option>
                        ))}
                      </select>
                    </td>
                    <td className="table-cell text-xs text-text-muted">
                      {timeAgo(lead.last_contacted)}
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-2 justify-end">
                        <WhatsAppButton lead={lead} message="" onSent={(s) => updateLeadStatus(lead.id, s)} compact />
                        <button
                          onClick={() => setActiveLeadMsg(lead)}
                          className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-400 hover:bg-purple-500/20 flex items-center justify-center transition-all"
                          title="Generate Message"
                        >
                          <MessageCircle size={14} />
                        </button>
                        <button
                          onClick={() => deleteLead(lead.id)}
                          className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 flex items-center justify-center transition-all"
                          title="Delete Lead"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-border">
          <p className="text-xs text-text-muted">
            Showing {((pagination.page - 1) * pagination.limit) + 1}–{Math.min(pagination.page * pagination.limit, totalLeads)} of {totalLeads}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
              disabled={pagination.page <= 1}
              className="btn-ghost py-1.5 px-3 text-xs disabled:opacity-30"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="text-xs text-text-secondary px-2">
              {pagination.page} / {totalPages || 1}
            </span>
            <button
              onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
              disabled={pagination.page >= totalPages}
              className="btn-ghost py-1.5 px-3 text-xs disabled:opacity-30"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Message Generator Drawer */}
      <AnimatePresence>
        {activeLeadMsg && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
            style={{ background: 'rgba(8,8,15,0.85)', backdropFilter: 'blur(8px)' }}
            onClick={() => setActiveLeadMsg(null)}
          >
            <motion.div
              initial={{ y: 40, scale: 0.97 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 40, scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="glass-card p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-text-primary">{activeLeadMsg.business_name}</h3>
                  <p className="text-xs text-text-muted">{activeLeadMsg.category} • {activeLeadMsg.location}</p>
                </div>
                <button onClick={() => setActiveLeadMsg(null)} className="btn-ghost py-1.5 px-3 text-xs">
                  Close
                </button>
              </div>
              <MessageGenerator
                lead={activeLeadMsg}
                onSent={(s) => {
                  updateLeadStatus(activeLeadMsg.id, s);
                  setActiveLeadMsg(null);
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
