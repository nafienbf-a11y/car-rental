import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { AppProvider } from './context/AppContext';
import { NotificationProvider } from './context/NotificationContext';
import { AuthProvider } from './context/AuthContext';
import MainLayout from './components/layout/MainLayout';
import Toast from './components/common/Toast';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Fleet from './pages/Fleet';
import Bookings from './pages/Bookings';
import Clients from './pages/Clients';
import Expenses from './pages/Expenses';
import History from './pages/History';
import Catalog from './pages/Catalog';
import NotFound from './pages/NotFound';

function App() {
  // HashRouter doesn't handle pathname (e.g. /sqds), so we check it manually
  React.useEffect(() => {
    const path = window.location.pathname;
    // Only redirect if we are NOT at root and NOT requesting a file
    if (path !== '/' && path !== '/index.html' && !path.includes('.')) {
      // redirect to root with #/404 if it's a real server path that the hash router can't see
      window.location.href = `${window.location.origin}/#/404`;
    }
  }, []);

  return (
    <LanguageProvider>
      <AuthProvider>
        <AppProvider>
          <NotificationProvider>
            <Router>
              <Routes>
                <Route path="/" element={<Catalog />} />
                <Route path="/catalog" element={<Catalog />} />
                <Route path="/login" element={<Login />} />

                {/* Protected Admin Routes */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/admin" element={<MainLayout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="fleet" element={<Fleet />} />
                    <Route path="bookings" element={<Bookings />} />
                    <Route path="clients" element={<Clients />} />
                    <Route path="expenses" element={<Expenses />} />
                    <Route path="history" element={<History />} />
                  </Route>
                </Route>
                {/* Catch-all: 404 Page */}
                <Route path="/404" element={<NotFound />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Toast />
            </Router>
          </NotificationProvider>
        </AppProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
