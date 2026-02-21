import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Sidebar from './components/Sidebar';
import ThreeBackground from './components/ThreeBackground';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Bills from './pages/Bills';
import Stores from './pages/Stores';
import Accounts from './pages/Accounts';
import Reports from './pages/Reports';
import POS from './pages/POS';

import AddClient from './pages/clients/AddClient';
import UpdateClient from './pages/clients/UpdateClient';
import DeleteClient from './pages/clients/DeleteClient';
import ClientProfile from './pages/clients/ClientProfile';

import AddStore from './pages/stores/AddStore';
import UpdateStore from './pages/stores/UpdateStore';
import DeleteStore from './pages/stores/DeleteStore';
import StoreDetails from './pages/stores/StoreDetails';

import AddAccount from './pages/accounts/AddAccount';
import UpdateAccount from './pages/accounts/UpdateAccount';
import DeleteAccount from './pages/accounts/DeleteAccount';
import AccountDetails from './pages/accounts/AccountDetails';

// Layout Component
const MainLayout = () => {
  const location = useLocation();
  // Hide background and sidebar for POS if desired, but user asked for panels. 
  // We'll keep them consistent but maybe adjust styles if needed.
  // Actually POS.jsx has its own background color style that might conflict with transparent main-content.
  // Let's force POS to be overlay or handle it gracefully.
  // POS.jsx sets background: #0f172a.

  return (
    <div className="app-container">
      <ThreeBackground />
      <Sidebar />
      <main className="main-content">
        <Outlet />
      </main>

      <style jsx>{`
        .app-container {
          display: flex;
          min-height: 100vh;
          background-color: transparent;
          position: relative;
          z-index: 1;
        }

        .main-content {
          flex: 1;
          margin-left: 260px;
          padding: 2.5rem;
          max-width: calc(100vw - 260px);
          overflow-x: hidden;
        }

        @media (max-width: 1024px) {
          .main-content {
            margin-left: 0;
            max-width: 100vw;
            padding-top: 4rem;
          }
        }
      `}</style>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={<Login />} />

          {/* Protected Routes */}
          <Route element={<MainLayout />}>

            {/* POS -- Accessible by Admin & Cashier */}
            <Route element={<ProtectedRoute allowedRoles={['admin', 'cashier']} />}>
              <Route path="/pos" element={<POS />} />
            </Route>

            {/* Dashboard & Management -- For Admin & Accountant */}
            <Route element={<ProtectedRoute allowedRoles={['admin', 'accountant']} />}>
              <Route path="/" element={<Dashboard />} />

              <Route path="/clients" element={<Clients />} />
              <Route path="/clients/view" element={<ClientProfile />} />
              <Route path="/clients/add" element={<AddClient />} />
              <Route path="/clients/update" element={<UpdateClient />} />
              <Route path="/clients/delete" element={<DeleteClient />} />

              <Route path="/bills" element={<Bills />} />

              <Route path="/stores" element={<Stores />} />
              <Route path="/stores/add" element={<AddStore />} />
              <Route path="/stores/update" element={<UpdateStore />} />
              <Route path="/stores/delete" element={<DeleteStore />} />
              <Route path="/stores/view" element={<StoreDetails />} />

              <Route path="/accounts" element={<Accounts />} />
              <Route path="/accounts/add" element={<AddAccount />} />
              <Route path="/accounts/update" element={<UpdateAccount />} />
              <Route path="/accounts/delete" element={<DeleteAccount />} />
              <Route path="/accounts/view" element={<AccountDetails />} />

              <Route path="/reports" element={<Reports />} />
            </Route>

          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
