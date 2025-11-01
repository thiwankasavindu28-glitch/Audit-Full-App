import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Modal from './components/Modal'; 
import AuditDetailModal from './components/AuditDetailModal'; // <-- 1. IMPORT

// Import all your pages
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import AuditedUsers from './pages/AuditedUsers';
import History from './pages/History';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import UserManagement from './pages/UserManagement';
import AuditWorkspace from './pages/AuditWorkspace';

function App() {
  return (
    <>
      <Routes>
        {/* Public Login Page */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Pages (Main Layout with Sidebar) */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          {/* These pages will render inside the <Layout>'s <Outlet> */}
          <Route index element={<Dashboard />} />
          <Route path="users" element={<AuditedUsers />} />
          <Route path="history" element={<History />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="settings" element={<Settings />} />
          <Route path="manage-auditors" element={<UserManagement />} /> 
        </Route>

        {/* The Audit Workspace is also protected but uses its own layout (no sidebar) */}
        <Route
          path="/audit-workspace/:auditId"
          element={
            <ProtectedRoute>
              <AuditWorkspace />
            </ProtectedRoute>
          }
        />
      </Routes>
      
      <Modal />
      <AuditDetailModal /> {/* <-- 2. ADD THE NEW MODAL HERE */}
    </>
  );
}

export default App;