import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, User, Bell, Shield, Palette, Save, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'appearance', label: 'Appearance', icon: Palette },
];

const THEMES = [
  { name: 'Dark Cyber', from: '#3b82f6', to: '#7c3aed', class: '' },
  { name: 'Dark Purple', from: '#7c3aed', to: '#ec4899', class: 'theme-purple' },
  { name: 'Dark Green', from: '#10b981', to: '#3b82f6', class: 'theme-green' },
];

export default function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [activeTheme, setActiveTheme] = useState(() => {
    const saved = localStorage.getItem('theme');
    return THEMES.find(t => t.class === saved) || THEMES[0];
  });

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [notifications, setNotifications] = useState({
    uploadComplete: true,
    dailySummary: false,
    replyAlert: true,
  });

  useEffect(() => {
    // Remove all theme classes
    document.body.classList.remove('theme-purple', 'theme-green');
    if (activeTheme.class) {
      document.body.classList.add(activeTheme.class);
    }
    localStorage.setItem('theme', activeTheme.class || '');
  }, [activeTheme]);

  const handleThemeChange = (theme) => {
    setActiveTheme(theme);
    toast.success(`${theme.name} theme applied!`);
  };

  const handleSaveProfile = () => {
    toast.success('Profile updated successfully!');
  };

  const handleUpdatePassword = () => {
    if (!password) {
      toast.error('Please enter a new password.');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }
    toast.success('Password updated successfully!');
    setPassword('');
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div>
        <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
          <Settings size={20} className="text-accent-cyan" />
          Settings
        </h2>
        <p className="text-xs text-text-muted mt-1">Manage your account and preferences</p>
      </div>

      <div className="flex gap-6">
        {/* Tab sidebar */}
        <div className="w-48 shrink-0 space-y-1">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`w-full sidebar-item ${activeTab === id ? 'active' : ''}`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card p-6"
          >
            {activeTab === 'profile' && (
              <div className="space-y-5">
                <h3 className="font-semibold text-text-primary border-b border-border pb-3">Profile Information</h3>

                {/* Avatar */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white"
                    style={{ background: 'linear-gradient(135deg, #00d4ff, #7c3aed)' }}>
                    {name.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-primary">{name || 'User'}</p>
                    <p className="text-xs text-text-muted">{email}</p>
                    <span className="badge-cyan badge text-xs mt-1">{user?.role || 'User'}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-text-muted mb-1.5">Full Name</label>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="input-field"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-text-muted mb-1.5">Email Address</label>
                    <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input-field"
                      placeholder="your@email.com"
                      type="email"
                    />
                  </div>
                </div>

                <button onClick={handleSaveProfile} className="btn-primary flex items-center gap-2">
                  <Save size={14} />
                  Save Changes
                </button>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-5">
                <h3 className="font-semibold text-text-primary border-b border-border pb-3">Notification Preferences</h3>
                {Object.entries(notifications).map(([key, val]) => {
                  const labels = {
                    uploadComplete: { title: 'Upload Complete', desc: 'Notify when file upload finishes' },
                    dailySummary: { title: 'Daily Summary', desc: 'Receive daily outreach report' },
                    replyAlert: { title: 'Reply Alert', desc: 'Alert when a lead replies' },
                  };
                  return (
                    <div key={key} className="flex items-center justify-between p-4 rounded-lg bg-bg-elevated">
                      <div>
                        <p className="text-sm font-medium text-text-primary">{labels[key].title}</p>
                        <p className="text-xs text-text-muted">{labels[key].desc}</p>
                      </div>
                      <button
                        onClick={() => setNotifications((n) => ({ ...n, [key]: !n[key] }))}
                        className={`relative w-10 h-5 rounded-full transition-all duration-200 ${val ? 'bg-accent-cyan' : 'bg-bg-card border border-border'}`}
                        style={val ? { background: '#00d4ff' } : {}}
                      >
                        <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-200 ${val ? 'left-5' : 'left-0.5'}`} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-5">
                <h3 className="font-semibold text-text-primary border-b border-border pb-3">Security Settings</h3>
                <div>
                  <label className="block text-xs text-text-muted mb-1.5">New Password</label>
                  <div className="relative">
                    <input
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      type={showPassword ? 'text' : 'password'}
                      className="input-field pr-10"
                      placeholder="Enter new password"
                    />
                    <button
                      onClick={() => setShowPassword((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary"
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-yellow-500/5 border border-yellow-500/20">
                  <p className="text-xs text-yellow-400">⚠️ Password changes require re-authentication. You'll be logged out after update.</p>
                </div>
                <button onClick={handleUpdatePassword} className="btn-primary flex items-center gap-2">
                  <Shield size={14} />
                  Update Password
                </button>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="space-y-5">
                <h3 className="font-semibold text-text-primary border-b border-border pb-3">Appearance</h3>
                <div className="p-4 rounded-lg bg-bg-elevated">
                  <p className="text-sm font-medium text-text-primary mb-1">Theme</p>
                  <p className="text-xs text-text-muted mb-3">Current: {activeTheme.name}</p>
                  <div className="flex gap-3">
                    {THEMES.map((theme) => (
                      <button
                        key={theme.name}
                        onClick={() => handleThemeChange(theme)}
                        className={`p-3 rounded-xl flex flex-col items-center gap-2 border transition-all ${
                          activeTheme.name === theme.name ? 'border-accent-cyan shadow-glow-sm' : 'border-border'
                        }`}
                        style={{ background: 'rgba(26,26,46,0.5)' }}
                      >
                        <div className="w-8 h-8 rounded-lg"
                          style={{ background: `linear-gradient(135deg, ${theme.from}, ${theme.to})` }} />
                        <span className={`text-xs ${activeTheme.name === theme.name ? 'text-text-primary font-bold' : 'text-text-muted'}`}>
                          {theme.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
