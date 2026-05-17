import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';
import { signInWithGooglePopup } from '../services/firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('lp_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('lp_token'));
  const [loading, setLoading] = useState(false);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const res = await authAPI.login({ email, password });
      const { token: jwt, user: userData } = res.data;
      setToken(jwt);
      setUser(userData);
      localStorage.setItem('lp_token', jwt);
      localStorage.setItem('lp_user', JSON.stringify(userData));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || 'Login failed' };
    } finally {
      setLoading(false);
    }
  }, []);

  const loginWithGoogle = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Firebase Google Auth Popup
      const result = await signInWithGooglePopup();
      // 2. Get the Firebase ID token
      const idToken = await result.user.getIdToken();
      // 3. Send it to our backend
      const res = await authAPI.googleLogin({ idToken });
      
      const { token: jwt, user: userData } = res.data;
      setToken(jwt);
      setUser(userData);
      localStorage.setItem('lp_token', jwt);
      localStorage.setItem('lp_user', JSON.stringify(userData));
      return { success: true };
    } catch (err) {
      console.error("Google login error:", err);
      // Firebase pop-up closed or other error
      return { success: false, error: err.response?.data?.error || err.message || 'Google login failed' };
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (name, email, password) => {
    setLoading(true);
    try {
      const res = await authAPI.register({ name, email, password });
      const { token: jwt, user: userData } = res.data;
      setToken(jwt);
      setUser(userData);
      localStorage.setItem('lp_token', jwt);
      localStorage.setItem('lp_user', JSON.stringify(userData));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || 'Registration failed' };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('lp_token');
    localStorage.removeItem('lp_user');
  }, []);

  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider value={{ user, token, loading, login, loginWithGoogle, register, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
