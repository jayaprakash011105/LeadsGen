import { useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, UserCheck, BarChart3, Settings,
  LogOut, RefreshCw, FileJson, Trash2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLeads } from '../context/LeadsContext';

const NAV_ITEMS = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/leads', icon: Users, label: 'Leads' },
  { to: '/clients', icon: UserCheck, label: 'Clients' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar() {
  const { logout } = useAuth();
  const { files, fetchFiles, deleteFile } = useLeads();
  const navigate = useNavigate();

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="w-[260px] flex flex-col h-screen bg-[#08080f] border-r border-[#1e1e2e] z-30 shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-8">
        <div>
          <h1 className="font-bold text-lg text-white tracking-tight">LeadsGen</h1>
        </div>
      </div>

      {/* Nav */}
      <nav className="px-4 space-y-2">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive 
                ? 'bg-[#3b82f610] text-[#3b82f6] border border-[#3b82f630] shadow-[0_0_15px_rgba(59,130,246,0.05)]' 
                : 'text-[#94a3b8] hover:text-white hover:bg-[#1a1a2e]'
              }`
            }
          >
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Uploaded Files Section */}
      <div className="flex-1 px-4 mt-8 flex flex-col min-h-0">
        <div className="flex items-center justify-between mb-4 px-4">
          <span className="text-[10px] font-black text-[#475569] uppercase tracking-[0.2em]">Uploaded Files</span>
          <button 
            onClick={() => fetchFiles()}
            className="text-[#475569] hover:text-[#3b82f6] transition-colors"
          >
            <RefreshCw size={14} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto no-scrollbar space-y-2 px-1 pb-4">
          {files.length === 0 ? (
            <p className="px-4 text-[11px] text-[#475569] italic">No files uploaded yet.</p>
          ) : (
            files.map((file) => (
              <div 
                key={file.id} 
                className="group relative bg-[#13131f] border border-[#1e1e2e] rounded-xl p-3 hover:border-[#3b82f630] transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#08080f] flex items-center justify-center shrink-0">
                    <FileJson size={14} className="text-[#3b82f6]" />
                  </div>
                  <div className="min-w-0 pr-6">
                    <p className="text-[11px] font-bold text-white truncate" title={file.filename}>
                      {file.filename}
                    </p>
                    <p className="text-[9px] text-[#475569] mt-0.5">
                      {new Date(file.upload_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => deleteFile(file.id)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-[#475569] hover:text-red-500 transition-all p-1"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Logout at bottom */}
      <div className="p-6 border-t border-[#1e1e2e]">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 text-[#94a3b8] hover:text-white transition-colors w-full rounded-xl hover:bg-red-500/5 group"
        >
          <LogOut size={18} className="group-hover:text-red-500 transition-colors" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}
