import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Eye, EyeOff, Mail, Lock, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login, loginWithGoogle, isAuthenticated, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');

  if (isAuthenticated) return <Navigate to="/" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const result = await login(email, password);
    if (!result.success) setError(result.error);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: '#08080f' }}>
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-10"
          style={{ background: 'radial-gradient(circle, #00d4ff, transparent)' }} />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-10"
          style={{ background: 'radial-gradient(circle, #7c3aed, transparent)' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-sm px-4"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'linear-gradient(135deg, #00d4ff, #7c3aed)', boxShadow: '0 0 30px rgba(0,212,255,0.3)' }}>
            <Zap size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary">LeadsGen</h1>
          <p className="text-sm text-text-muted mt-1">Sign in to your account</p>
        </div>

        {/* Card */}
        <div className="glass-card p-7" style={{ border: '1px solid rgba(0,212,255,0.15)' }}>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">Email Address</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-10"
                  placeholder="you@example.com"
                  required
                  autoFocus
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">Password</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-10 pr-10"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((s) => !s)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary"
                >
                  {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-3 rounded-lg text-xs text-red-400"
                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
              >
                {error}
              </motion.div>
            )}

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3 mb-4"
            >
              {loading ? (
                <><Loader2 size={16} className="animate-spin" /> Signing in...</>
              ) : (
                'Sign In'
              )}
            </motion.button>

            {/* Google Auth Button */}
            <motion.button
              type="button"
              onClick={async () => {
                setError('');
                const result = await loginWithGoogle();
                if (!result.success) setError(result.error);
              }}
              disabled={loading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-lg font-medium text-sm transition-all duration-200 border border-border text-text-primary bg-bg-elevated hover:bg-[#1e1e2e]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                <path fill="none" d="M1 1h22v22H1z" />
              </svg>
              Continue with Google
            </motion.button>
          </form>

          <div className="glow-separator my-5" />

          <p className="text-center text-xs text-text-muted">
            Don't have an account?{' '}
            <Link to="/register" className="text-accent-cyan hover:underline font-medium">
              Create one
            </Link>
          </p>
        </div>

        {/* Demo hint */}
        <p className="text-center text-xs text-text-muted mt-5">
          First time? <Link to="/register" className="text-accent-cyan hover:underline">Register here</Link> to get started.
        </p>
      </motion.div>
    </div>
  );
}
