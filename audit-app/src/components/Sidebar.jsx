import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Home,
  Users,
  Archive,
  BarChart3,
  Settings,
  UserCheck,
  LogOut,
  FileText,
} from 'lucide-react';

const Sidebar = () => {
  const { auditor, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNavLinkClass = ({ isActive }) => {
    return isActive
      ? 'flex items-center gap-3 px-4 py-3 bg-indigo-100 text-indigo-700 rounded-lg font-semibold dark:bg-indigo-900 dark:text-indigo-100'
      : 'flex items-center gap-3 px-4 py-3 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors dark:text-slate-300 dark:hover:bg-slate-700';
  };

  return (
    <div className="w-64 bg-white border-r border-slate-200 flex flex-col p-4 dark:bg-slate-900 dark:border-slate-700">
      <div className="flex items-center gap-3 p-4 mb-6">
        <div className="bg-indigo-600 p-2 rounded-lg">
          <FileText className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">SuperQ Audit</h1>
      </div>

      <nav className="flex-1 space-y-2">
        <NavLink to="/" end className={getNavLinkClass}>
          <Home size={20} />
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/users" className={getNavLinkClass}>
          <Users size={20} />
          <span>Audited Users</span>
        </NavLink>
        <NavLink to="/history" className={getNavLinkClass}>
          <Archive size={20} />
          <span>Audit History</span>
        </NavLink>
        <NavLink to="/analytics" className={getNavLinkClass}>
          <BarChart3 size={20} />
          <span>Analytics</span>
        </NavLink>
        <NavLink to="/manage-auditors" className={getNavLinkClass}>
          <UserCheck size={20} />
          <span>Manage Auditors</span>
        </NavLink>
        <NavLink to="/settings" className={getNavLinkClass}>
          <Settings size={20} />
          <span>My Settings</span>
        </NavLink>
      </nav>

      {/* Profile/Logout section at the bottom */}
      <div className="mt-auto">
        <div className="p-4 mb-2 border-t border-slate-200 dark:border-slate-700">
          <p className="font-semibold text-slate-800 dark:text-slate-100">{auditor?.name}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">{auditor?.role}</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-4 py-3 text-slate-600 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors dark:text-slate-300 dark:hover:bg-red-900/20 dark:hover:text-red-400"
        >
          <LogOut size={20} />
          <span className="font-medium">Log Out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;