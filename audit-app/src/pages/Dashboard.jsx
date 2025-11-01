import React, { useState, useEffect } from 'react';
import { Plus, FileText, Clock, CheckCircle, TrendingUp, Users, Calendar, Search, Filter, Mail, UserCheck, Eye } from 'lucide-react'; // <-- 1. Add Eye
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDashboard } from '../context/DashboardContext';
import { useAuditDetail } from '../context/AuditDetailContext'; // <-- 2. IMPORT
import api from '../services/api';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('my-audits');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const { auditor } = useAuth();
  const { openAuditDetail } = useAuditDetail(); // <-- 3. USE THE CONTEXT

  const {
    stats,
    myAudits,
    completedAudits,
    auditors,
    recentlyAuditedUsers,
    fetchDashboardData
  } = useDashboard();
  
  // ... (rest of the component is unchanged until the "View Report" button) ...
  
  useEffect(() => {
    if (auditor) {
      fetchDashboardData();
    }
  }, [auditor, fetchDashboardData]);

  const handleStartNewAudit = async () => {
    navigate('/users');
  };

  const currentAudits = activeTab === 'my-audits' ? myAudits : completedAudits;

  const filteredAudits = currentAudits.filter(
    (audit) =>
      (audit.id && audit.id.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (audit.auditedUser.name && audit.auditedUser.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header (Now part of the page) */}
      <header className="bg-white border-b border-slate-200 shadow-sm dark:bg-slate-900 dark:border-slate-700">
        {/* ... (header JSX unchanged) ... */}
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-indigo-600 p-3 rounded-xl">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Auditor Dashboard</h1>
                <p className="text-slate-600 text-sm mt-1 dark:text-slate-400">Welcome back, {auditor?.name}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Action - Start New Audit */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg p-8 mb-8 text-white">
          {/* ... (quick action JSX unchanged) ... */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Start a New Audit</h2>
              <p className="text-indigo-100 mb-4">Go to the Audited Users page to begin a new audit.</p>
              <button 
                onClick={handleStartNewAudit}
                className="bg-white text-indigo-600 hover:bg-indigo-50 font-semibold py-3 px-8 rounded-lg flex items-center gap-2 transition-all shadow-md hover:shadow-xl transform hover:scale-105"
              >
                <Users size={20} />
                Select a User to Audit
              </button>
            </div>
            <div className="hidden md:block">
              <div className="w-32 h-32 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <FileText className="w-16 h-16 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
             {/* ... (stats grid JSX unchanged) ... */}
             <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200 hover:shadow-md transition-shadow dark:bg-slate-800 dark:border-slate-700 dark:hover:shadow-indigo-500/10">
               <div className="flex items-center justify-between">
                 <div>
                   <p className="text-sm text-slate-600 font-medium dark:text-slate-400">My Active Audits</p>
                   <p className="text-3xl font-bold text-slate-900 mt-2 dark:text-white">{stats.myActiveAudits || 0}</p>
                 </div>
                 <div className="bg-amber-100 p-3 rounded-lg"><Clock className="w-6 h-6 text-amber-600" /></div>
               </div>
             </div>
             <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200 hover:shadow-md transition-shadow dark:bg-slate-800 dark:border-slate-700 dark:hover:shadow-indigo-500/10">
               <div className="flex items-center justify-between">
                 <div>
                   <p className="text-sm text-slate-600 font-medium dark:text-slate-400">Completed This Week</p>
                   <p className="text-3xl font-bold text-slate-900 mt-2 dark:text-white">{stats.myCompletedThisWeek || 0}</p>
                 </div>
                 <div className="bg-emerald-100 p-3 rounded-lg"><CheckCircle className="w-6 h-6 text-emerald-600" /></div>
                </div>
             </div>
             <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200 hover:shadow-md transition-shadow dark:bg-slate-800 dark:border-slate-700 dark:hover:shadow-indigo-500/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 font-medium dark:text-slate-400">Team Completed Audits</p>
                    <p className="text-3xl font-bold text-slate-900 mt-2 dark:text-white">{stats.totalCompletedAudits || 0}</p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-lg"><FileText className="w-6 h-6 text-blue-600" /></div>
                </div>
             </div>
             <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200 hover:shadow-md transition-shadow dark:bg-slate-800 dark:border-slate-700 dark:hover:shadow-indigo-500/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 font-medium dark:text-slate-400">Active Auditors</p>
                    <p className="text-3xl font-bold text-slate-900 mt-2 dark:text-white">{stats.totalAuditorsActive || 0}</p>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-lg"><UserCheck className="w-6 h-6 text-purple-600" /></div>
                </div>
             </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - My Audits */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
              {/* Tabs and Search */}
              <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                 {/* ... (tabs and search JSX unchanged) ... */}
                 <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex gap-2">
                        <button
                          onClick={() => setActiveTab('my-audits')}
                          className={`px-4 py-2 rounded-lg font-medium transition-all ${
                            activeTab === 'my-audits'
                              ? 'bg-indigo-600 text-white shadow-md'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
                          }`}
                        >
                          My Active ({myAudits.length})
                        </button>
                        <button
                          onClick={() => setActiveTab('completed')}
                          className={`px-4 py-2 rounded-lg font-medium transition-all ${
                            activeTab === 'completed'
                              ? 'bg-indigo-600 text-white shadow-md'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
                          }`}
                        >
                          Completed ({completedAudits.length})
                        </button>
                    </div>
                    <div className="relative flex-1 sm:flex-initial">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                        <input
                          type="text"
                          placeholder="Search..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg w-full sm:w-64 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-400"
                        />
                    </div>
                </div>
              </div>

              {/* Audits List */}
              <div className="divide-y divide-slate-200 dark:divide-slate-700">
                {filteredAudits.length === 0 ? (
                  // ... (empty state JSX unchanged) ...
                  <div className="py-12 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-4 dark:bg-slate-700">
                      <FileText className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2 dark:text-white">No audits found</h3>
                    <p className="text-slate-600 dark:text-slate-400">Start your first audit to begin tracking</p>
                  </div>
                ) : (
                  filteredAudits.map((audit) => (
                    <div key={audit.id} className="p-6 hover:bg-slate-50 transition-colors dark:hover:bg-slate-800/50">
                      {/* ... (audit card JSX unchanged) ... */}
                       <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4 flex-1">
                              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg flex items-center justify-center text-white font-bold">
                                  {audit.auditedUser.name.split(' ').map(n => n[0]).join('')}
                              </div>
                              <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-1">
                                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">{audit.id}</h3>
                                      {audit.status === 'completed' ? (
                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                                          <CheckCircle size={12} />
                                          Completed
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                          <Clock size={12} />
                                          In Progress
                                        </span>
                                      )}
                                      {audit.reportSent && (
                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                          <Mail size={12} />
                                          Report Sent
                                        </span>
                                      )}
                                  </div>
                                  <p className="text-slate-700 font-semibold mb-1 dark:text-slate-200">User: {audit.auditedUser.name}</p>
                                  <p className="text-sm text-slate-600 mb-2 dark:text-slate-400">Department: {audit.auditedUser.department}</p>
                                  <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                                      <span className="flex items-center gap-1">
                                      <Calendar size={14} />
                                      {audit.status === 'completed' ? `Completed: ${new Date(audit.completedDate).toLocaleDateString()}` : `Started: ${new Date(audit.startDate).toLocaleDateString()}`}
                                      </span>
                                  </div>
                              </div>
                          </div>
                          <div className="flex gap-6 ml-4">
                              <div className="text-center">
                                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{audit._count.errors}</p>
                                  <p className="text-xs text-slate-600 dark:text-slate-400">Errors</p>
                              </div>
                              <div className="text-center">
                                  <p className="text-2xl font-bold text-red-600">{audit.totalPoints}</p>
                                  <p className="text-xs text-slate-600 dark:text-slate-400">Points</p>
                              </div>
                          </div>
                      </div>
                      <div className="mt-4 flex gap-2">
                        {audit.status === 'in-progress' ? (
                          <Link to={`/audit-workspace/${audit.id}`} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors">
                            Continue Audit
                          </Link>
                        ) : (
                          <>
                            {/* --- 4. THIS IS THE FIX --- */}
                            <button 
                              onClick={() => openAuditDetail(audit)}
                              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-colors dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 flex items-center gap-2"
                            >
                              <Eye size={16} />
                              View Details
                            </button>
                            {!audit.reportSent && (
                              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2">
                                <Mail size={16} />
                                Send to User
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* ... (sidebar components JSX unchanged) ... */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2 dark:text-white">
                    <UserCheck className="w-5 h-5 text-indigo-600" />
                    Auditor Team
                </h3>
                <div className="space-y-3">
                  {auditors.map((auditorItem, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors dark:bg-slate-700/50 dark:hover:bg-slate-700">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          {auditorItem.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 text-sm dark:text-white">{auditorItem.name}</p>
                          <p className="text-xs text-slate-600 dark:text-slate-400">{auditorItem.activeAudits} active</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-emerald-600">{auditorItem.completedThisWeek}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">this week</p>
                      </div>
                    </div>
                  ))}
                </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2 dark:text-white">
                    <Users className="w-5 h-5 text-indigo-600" />
                    Recently Audited Users
                </h3>
                <div className="space-y-3">
                  {recentlyAuditedUsers.map((user, idx) => (
                    <div key={idx} className="p-3 border border-slate-200 rounded-lg hover:border-indigo-300 transition-colors dark:border-slate-700 dark:hover:border-indigo-500">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold text-slate-900 text-sm dark:text-white">{user.name}</p>
                        <span className="text-xs text-slate-500 dark:text-slate-400">{user.dept}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-600 dark:text-slate-400">{user.totalAudits} audits</span>
                        <span className="font-semibold text-red-600">{user.avgErrors} avg errors</span>
                      </div>
                    </div>
                  ))}
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;