import React, { useState, useEffect } from 'react';
import { Users, Search, Filter, Mail, Phone, Building, TrendingUp, TrendingDown, FileText, X, Calendar, AlertTriangle, Plus } from 'lucide-react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useAuditedUsers } from '../context/AuditedUsersContext';
import { useAuditDetail } from '../context/AuditDetailContext'; // <-- 1. IMPORT

const AuditedUsers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDept, setFilterDept] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null); 
  const [detailedUser, setDetailedUser] = useState(null); 
  const [loadingModal, setLoadingModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const navigate = useNavigate();

  const { 
    users: auditedUsers, 
    departments, 
    isUsersLoading: loading, 
    fetchAuditedUsers, 
    addUser 
  } = useAuditedUsers();
  
  const { openAuditDetail } = useAuditDetail(); // <-- 2. USE THE CONTEXT

  useEffect(() => {
    fetchAuditedUsers();
  }, [fetchAuditedUsers]);

  // ... (handleAddUser, handleStartAuditForUser, openDetailsModal functions are unchanged) ...
    const handleAddUser = async (e) => {
    e.preventDefault();
    const { name, email, phone, department, position, supervisor } = e.target.elements;
    const newUser = { name: name.value, email: email.value, phone: phone.value, department: department.value, position: position.value, supervisor: supervisor.value };
    try {
        const { data: savedUser } = await api.post('/audited-users', newUser);
        addUser(savedUser);
        setShowAddModal(false);
        e.target.reset();
    } catch (err) {
        console.error("Failed to add user", err);
        alert("Failed to add user. Is the email already in use?");
    }
  };

  const handleStartAuditForUser = async (userId) => {
    try {
      const { data: newAudit } = await api.post('/audits', { auditedUserId: userId });
      navigate(`/audit-workspace/${newAudit.id}`);
    } catch (err) {
      console.error("Failed to start new audit", err);
      alert("Could not start new audit.");
    }
  };
  
  const openDetailsModal = async (user) => {
    setSelectedUser(user);
    setLoadingModal(true);
    setDetailedUser(null);
    try {
        const { data: fullUserData } = await api.get(`/audited-users/${user.id}`);
        setDetailedUser(fullUserData);
    } catch (err) {
        console.error("Failed to fetch detailed user data", err);
    }
    setLoadingModal(false);
  };

  // ... (AddUserModal component is unchanged) ...
    const AddUserModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <form onSubmit={handleAddUser} className="bg-white rounded-xl max-w-2xl w-full dark:bg-slate-800">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between dark:border-slate-700">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Add New Audited User</h2>
          <button type="button" onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-100 rounded-lg dark:text-slate-300 dark:hover:bg-slate-700">
            <X size={24} />
          </button>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2 dark:text-slate-300">Full Name *</label>
            <input name="name" type="text" required className="w-full px-3 py-2 border border-slate-300 rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2 dark:text-slate-300">Email *</label>
            <input name="email" type="email" required className="w-full px-3 py-2 border border-slate-300 rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
          </div>
           <div>
            <label className="block text-sm font-medium text-slate-700 mb-2 dark:text-slate-300">Phone</label>
            <input name="phone" type="tel" className="w-full px-3 py-2 border border-slate-300 rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
          </div>
           <div>
            <label className="block text-sm font-medium text-slate-700 mb-2 dark:text-slate-300">Department *</label>
            <input name="department" type="text" required className="w-full px-3 py-2 border border-slate-300 rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
          </div>
           <div>
            <label className="block text-sm font-medium text-slate-700 mb-2 dark:text-slate-300">Position *</label>
            <input name="position" type="text" required className="w-full px-3 py-2 border border-slate-300 rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
          </div>
           <div>
            <label className="block text-sm font-medium text-slate-700 mb-2 dark:text-slate-300">Supervisor *</label>
            <input name="supervisor" type="text" required className="w-full px-3 py-2 border border-slate-300 rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
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

  const UserDetailModal = ({ user }) => {
    // ... (this component is unchanged until the "View Details" button) ...
    const defaultStats = { totalAudits: user.stats.totalAudits, avgErrorRate: 0, totalPoints: 0, trend: 0, highestErrorType: 'N/A', lastAuditDate: 'N/A' };
    const displayUser = detailedUser || user;
    const displayStats = detailedUser ? detailedUser.stats : defaultStats;
    const displayRecentAudits = detailedUser ? detailedUser.recentAudits : [];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto dark:bg-slate-800">
            {/* ... (modal header JSX unchanged) ... */}
             <div className="p-6 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-800 dark:border-slate-700">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                  {displayUser.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{displayUser.name}</h2>
                  <p className="text-slate-600 dark:text-slate-400">{displayUser.position} • {displayUser.department}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors dark:text-slate-300 dark:hover:bg-slate-700"
              >
                <X size={24} />
              </button>
            </div>
            
            {loadingModal ? (
                <div className="p-6 text-center dark:text-slate-300">Loading full details...</div>
            ) : (
                <div className="p-6 space-y-6">
                  {/* ... (contact, performance, problem area JSX unchanged) ... */}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-4 dark:text-white">Contact & Work Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg dark:bg-slate-700">
                        <Mail className="text-slate-500 dark:text-slate-400" size={20} />
                        <div>
                          <p className="text-xs text-slate-600 dark:text-slate-400">Email</p>
                          <p className="font-medium text-slate-900 dark:text-white">{displayUser.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg dark:bg-slate-700">
                        <Phone className="text-slate-500 dark:text-slate-400" size={20} />
                        <div>
                          <p className="text-xs text-slate-600 dark:text-slate-400">Phone</p>
                          <p className="font-medium text-slate-900 dark:text-white">{displayUser.phone || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg dark:bg-slate-700">
                        <Building className="text-slate-500 dark:text-slate-400" size={20} />
                        <div>
                          <p className="text-xs text-slate-600 dark:text-slate-400">Department</p>
                          <p className="font-medium text-slate-900 dark:text-white">{displayUser.department}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg dark:bg-slate-700">
                        <Users className="text-slate-500 dark:text-slate-400" size={20} />
                        <div>
                          <p className="text-xs text-slate-600 dark:text-slate-400">Supervisor</p>
                          <p className="font-medium text-slate-900 dark:text-white">{displayUser.supervisor}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-4 dark:text-white">Performance Overview</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-4 bg-blue-50 rounded-lg text-center dark:bg-blue-900/50">
                        <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{displayStats.totalAudits}</p>
                        <p className="text-xs text-slate-600 mt-1 dark:text-slate-400">Total Audits</p>
                      </div>
                      <div className="p-4 bg-purple-50 rounded-lg text-center dark:bg-purple-900/50">
                        <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">{displayStats.avgErrorRate}</p>
                        <p className="text-xs text-slate-600 mt-1 dark:text-slate-400">Avg Errors/Audit</p>
                      </div>
                      <div className="p-4 bg-red-50 rounded-lg text-center dark:bg-red-900/50">
                        <p className="text-2xl font-bold text-red-700 dark:text-red-300">{displayStats.totalPoints}</p>
                        <p className="text-xs text-slate-600 mt-1 dark:text-slate-400">Total Points</p>
                      </div>
                      <div className="p-4 bg-amber-50 rounded-lg text-center dark:bg-amber-900/50">
                        <div className="flex items-center justify-center gap-1">
                          {displayStats.trend >= 0 ? (
                            <TrendingDown className="w-5 h-5 text-emerald-600" />
                          ) : (
                            <TrendingUp className="w-5 h-5 text-red-600" />
                          )}
                          <p className={`text-2xl font-bold ${displayStats.trend >= 0 ? 'text-emerald-700 dark:text-emerald-300' : 'text-red-700 dark:text-red-300'}`}>
                            {Math.abs(displayStats.trend)}%
                          </p>
                        </div>
                        <p className="text-xs text-slate-600 mt-1 dark:text-slate-400">Trend</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2 dark:text-white">
                      <AlertTriangle className="w-5 h-5 text-amber-600" />
                      Main Problem Area
                    </h3>
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg dark:bg-amber-900/50 dark:border-amber-700">
                      <p className="font-semibold text-amber-900 dark:text-amber-200">{displayStats.highestErrorType}</p>
                      <p className="text-sm text-amber-700 mt-1 dark:text-amber-400">This user makes the most errors in this category</p>
                    </div>
                  </div>
    
                  {/* Recent Audits History */}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-4 dark:text-white">Recent Audit History</h3>
                    <div className="space-y-3">
                      {displayRecentAudits.map((audit, idx) => (
                        <div key={idx} className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors dark:border-slate-700 dark:hover:bg-slate-700/50">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <p className="font-semibold text-slate-900 dark:text-white">{audit.id}</p>
                              <p className="text-sm text-slate-600 flex items-center gap-2 dark:text-slate-400">
                                <Calendar size={14} />
                                {audit.date}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-slate-900 dark:text-white">{audit.errors} errors</p>
                              <p className="text-sm text-red-600">{audit.points} points</p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-600 dark:text-slate-400">Audited by: {audit.auditor.name}</span>
                            {/* --- 3. THIS IS THE FIX --- */}
                            <button 
                              onClick={() => openAuditDetail(audit)}
                              className="text-indigo-600 hover:text-indigo-700 font-medium dark:text-indigo-400 dark:hover:text-indigo-300"
                            >
                              View Details →
                            </button>
                          </div>
                        </div>
                      ))}
                      {displayRecentAudits.length === 0 && (
                        <p className="text-slate-500 text-sm dark:text-slate-400">No recent audits found.</p>
                      )}
                    </div>
                  </div>
    
                  {/* Actions */}
                  <div className="pt-4 border-t border-slate-200 flex gap-3 dark:border-slate-700">
                     {/* ... (actions JSX unchanged) ... */}
                    <button 
                        onClick={() => handleStartAuditForUser(user.id)}
                        className="flex-1 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2">
                      <FileText size={18} />
                      Start New Audit for {user.name.split(' ')[0]}
                    </button>
                    <button className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors font-medium flex items-center gap-2 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600">
                      <Mail size={18} />
                      Email Reports
                    </button>
                  </div>
                </div>
            )}
          </div>
        </div>
    );
  };
  
  const filteredUsers = auditedUsers.filter(user => {
    // ... (this function is unchanged)
    const matchesSearch = searchTerm === '' ||
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesDept = filterDept === 'all' || user.department === filterDept;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* ... (rest of the page JSX is unchanged) ... */}
       <header className="bg-white border-b border-slate-200 shadow-sm dark:bg-slate-900 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-blue-600 p-3 rounded-xl">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Audited Users Directory</h1>
                <p className="text-slate-600 text-sm mt-1 dark:text-slate-400">Track performance of users being audited</p>
              </div>
            </div>
            <button
                onClick={() => setShowAddModal(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-5 rounded-lg flex items-center gap-2 transition-all"
            >
                <Plus size={20} />
                Add Audited User
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200 mb-6 dark:bg-slate-800 dark:border-slate-700">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Search by name, email, or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-400"
              />
            </div>
            <select
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value)}
              className="px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-white"
            >
              <option value="all">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading && auditedUsers.length === 0 ? (
            <p className="text-slate-600 dark:text-slate-400">Loading users...</p>
          ) : filteredUsers.map((user) => (
            <div key={user.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg transition-all dark:bg-slate-800 dark:border-slate-700 dark:hover:shadow-indigo-500/10">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg dark:text-white">{user.name}</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{user.position}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2 mb-4 pb-4 border-b border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <Building size={16} />
                    <span>{user.department}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <Users size={16} />
                    <span>Reports to: {user.supervisor}</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="p-2 bg-blue-50 rounded text-center dark:bg-blue-900/50">
                    <p className="text-lg font-bold text-blue-700 dark:text-blue-300">{user.stats.totalAudits}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Audits</p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => openDetailsModal(user)}
                    className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors text-sm"
                  >
                    View Details
                  </button>
                  <button 
                    onClick={() => handleStartAuditForUser(user.id)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors text-sm dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600">
                    New Audit
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {!loading && filteredUsers.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center dark:bg-slate-800 dark:border-slate-700">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-4 dark:bg-slate-700">
              <Users className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2 dark:text-white">No users found</h3>
            <p className="text-slate-600 dark:text-slate-400">Click the "Add Audited User" button to add your first user.</p>
          </div>
        )}
      </div>

      {selectedUser && <UserDetailModal user={selectedUser} />}
      
      {showAddModal && <AddUserModal />}
    </div>
  );
};

export default AuditedUsers;