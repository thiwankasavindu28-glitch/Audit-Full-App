import React, { useState, useEffect, useCallback } from 'react';
import { Users, Plus, Edit, Trash2, Search, Mail, Phone, Building, Award, TrendingUp, TrendingDown, X, Check } from 'lucide-react';
import api from '../services/api';
import { useAnalytics } from '../context/AnalyticsContext';

const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Auditor'
  });

  const {
    userPerformanceData: users, 
    isAnalyticsLoading: loading,
    fetchAnalyticsData
  } = useAnalytics();

  const stableFetchAnalytics = useCallback(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  useEffect(() => {
    stableFetchAnalytics();
  }, [stableFetchAnalytics]);

  const handleNewUserChange = (e) => {
    const { name, value } = e.target;
    setNewUser(prev => ({ ...prev, [name]: value }));
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
        const { data: savedUser } = await api.post('/auth/register', newUser);
        
        fetchAnalyticsData(); 
        setShowAddModal(false);
        setNewUser({ name: '', email: '', password: '', role: 'Auditor' });

    } catch (err) {
        console.error("Failed to add user", err);
        alert("Failed to add user. Is the email already in use?");
    }
  };

  const AddUserModal = ({ user, onChange, onSubmit }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <form onSubmit={onSubmit} className="bg-white rounded-xl max-w-2xl w-full dark:bg-slate-800">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between dark:border-slate-700">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Add New Auditor</h2>
          <button type="button" onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-100 rounded-lg dark:text-slate-300 dark:hover:bg-slate-700">
            <X size={24} />
          </button>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2 dark:text-slate-300">Full Name *</label>
            <input 
              name="name" 
              type="text" 
              required 
              value={user.name} 
              onChange={onChange} 
              className="w-full px-3 py-2 border border-slate-300 rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2 dark:text-slate-300">Email *</label>
            <input 
              name="email" 
              type="email" 
              required 
              value={user.email} 
              onChange={onChange} 
              className="w-full px-3 py-2 border border-slate-300 rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2 dark:text-slate-300">Password *</label>
            <input 
              name="password" 
              type="password" 
              required 
              value={user.password} 
              onChange={onChange} 
              className="w-full px-3 py-2 border border-slate-300 rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2 dark:text-slate-300">Role *</label>
            <select 
              name="role" 
              value={user.role} 
              onChange={onChange} 
              className="w-full px-3 py-2 border border-slate-300 rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white"
            >
              <option>Auditor</option>
              <option>Senior Auditor</option>
              <option>Lead Auditor</option>
            </select>
          </div>
        </div>
        <div className="p-6 border-t border-slate-200 flex justify-end gap-3 dark:border-slate-700">
          <button type="button" onClick={() => setShowAddModal(false)} className="px-6 py-2 border border-slate-300 rounded-lg dark:border-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">
            Cancel
          </button>
          <button type="submit" className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg">
            Add User
          </button>
        </div>
      </form>
    </div>
  );

  const UserDetailModal = ({ user }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        {/* ... (Your UserDetailModal JSX from the mockup) ... */}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm dark:bg-slate-900 dark:border-slate-700">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
           <div className="flex items-center justify-between">
             <div className="flex items-center gap-4">
                <div className="bg-blue-600 p-3 rounded-xl"><Users className="w-8 h-8 text-white" /></div>
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">User Management</h1>
                    <p className="text-slate-600 text-sm mt-1 dark:text-slate-400">Manage auditors and team members</p>
                </div>
             </div>
             <button
                onClick={() => setShowAddModal(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-xl flex items-center gap-2"
             >
                <Plus size={20} />
                Add New User
             </button>
           </div>
         </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
               <p className="text-sm text-slate-600 font-medium dark:text-slate-400">Total Users</p>
               <p className="text-3xl font-bold text-slate-900 mt-2 dark:text-white">{users.length}</p>
            </div>
            {/* ... (Rest of your stats boxes - add dark: styles) ... */}
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200 mb-6 dark:bg-slate-800 dark:border-slate-700">
            {/* ... (Your Search Bar JSX) ... */}
        </div>

        {/* Users Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading && users.length === 0 ? (
            <p className="dark:text-slate-300">Loading...</p>
          ) : filteredUsers.map((user) => (
            <div key={user.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg transition-all dark:bg-slate-800 dark:border-slate-700 dark:hover:shadow-indigo-500/10">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="font-bold text-slate-900 text-lg dark:text-white">{user.name}</h3>
                  <span className="px-2 py-1 bg-emerald-100 text-emerald-800 text-xs font-medium rounded-full">Active</span>
                </div>
                <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400"><Mail size={16} /><span>{user.email}</span></div>
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400"><Building size={16} /><span>{user.role}</span></div>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="p-3 bg-slate-50 rounded-lg text-center dark:bg-slate-700">
                        <p className="text-xl font-bold text-slate-900 dark:text-white">{user.audits}</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">Audits</p>
                    </div>
                     <div className="p-3 bg-slate-50 rounded-lg text-center dark:bg-slate-700">
                        <p className="text-xl font-bold text-slate-900 dark:text-white">{user.avgErrorRate}</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">Avg Errors</p>
                    </div>
                </div>
                 <div className="flex gap-2">
                    <button
                        onClick={() => setSelectedUser(user)}
                        className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg text-sm"
                    >
                        View Details
                    </button>
                    <button className="px-3 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-700">
                        <Edit size={16} className="text-slate-600 dark:text-slate-300" />
                    </button>
                 </div>
              </div>
            </div>
          ))}
        </div>

        {/* ... (Your Empty State JSX) ... */}
      </div>

      {/* Modals */}
      {showAddModal && <AddUserModal user={newUser} onChange={handleNewUserChange} onSubmit={handleAddUser} />}
      {selectedUser && <UserDetailModal user={selectedUser} />}
    </div>
  );
};

export default UserManagement;