import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LeadsProvider } from './context/LeadsContext';
import AuthGuard from './components/AuthGuard';
import AppLayout from './layouts/AppLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import LeadsPage from './pages/LeadsPage';
import ClientsPage from './pages/ClientsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SettingsPage from './pages/SettingsPage';
import FilesPage from './pages/FilesPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LeadsProvider>
          <Routes>
            {/* Public */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected */}
            <Route
              path="/"
              element={
                <AuthGuard>
                  <AppLayout />
                </AuthGuard>
              }
            >
              <Route index element={<DashboardPage />} />
              <Route path="leads" element={<LeadsPage />} />
              <Route path="clients" element={<ClientsPage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="files" element={<FilesPage />} />
            </Route>
          </Routes>
        </LeadsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
