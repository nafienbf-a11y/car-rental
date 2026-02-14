import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { NotificationProvider } from './context/NotificationContext';
import MainLayout from './components/layout/MainLayout';
import Toast from './components/common/Toast';
import Dashboard from './pages/Dashboard';
import Fleet from './pages/Fleet';
import Bookings from './pages/Bookings';
import Clients from './pages/Clients';
import Expenses from './pages/Expenses';
import History from './pages/History';

function App() {
  return (
    <AppProvider>
      <NotificationProvider>
        <Router>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="fleet" element={<Fleet />} />
              <Route path="bookings" element={<Bookings />} />
              <Route path="clients" element={<Clients />} />
              <Route path="expenses" element={<Expenses />} />
              <Route path="history" element={<History />} />
            </Route>
          </Routes>
          <Toast />
        </Router>
      </NotificationProvider>
    </AppProvider>
  );
}

export default App;
