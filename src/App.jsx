import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
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

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <AppProvider>
          <NotificationProvider>
            <Router>
              <Routes>
                <Route path="/" element={<Catalog />} />
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
