import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, Search, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const PAGE_TITLES = {
  '/': 'Dashboard',
  '/leads': 'Lead Database',
  '/clients': 'Clients',
  '/analytics': 'Analytics',
  '/settings': 'Settings',
  '/files': 'Uploaded Files',
};

export default function TopBar() {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const title = PAGE_TITLES[pathname] || 'LeadPulse AI';

  return (
    <header className="h-16 px-6 flex items-center justify-between border-b border-border bg-bg-secondary shrink-0">
      {/* Title */}
      <div>
        <h1 className="text-base font-semibold text-text-primary">{title}</h1>
        <p className="text-xs text-text-muted mt-0.5">
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            className="input-field pl-9 pr-4 py-2 text-xs w-52"
            placeholder="Quick search..."
          />
        </div>

        {/* Notification Bell */}
        <button className="relative w-9 h-9 rounded-lg bg-bg-card border border-border flex items-center justify-center text-text-secondary hover:text-accent-cyan hover:border-accent-cyan transition-all">
          <Bell size={16} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent-cyan animate-pulse" />
        </button>

        {/* Avatar */}
        <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0"
          style={{ background: 'linear-gradient(135deg, #00d4ff, #7c3aed)' }}>
          {(user?.name || 'U').charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  );
}
