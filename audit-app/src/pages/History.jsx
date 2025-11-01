import React, { useState, useEffect } from 'react';
import { Search, Filter, Calendar, Download, Eye, Trash2, Archive, ChevronDown, FileText, Clock, CheckCircle, X } from 'lucide-react';
import api from '../services/api';
import * as XLSX from 'xlsx';
import { useModal } from '../context/ModalContext';
import { useHistory } from '../context/HistoryContext';
import { useAuditDetail } from '../context/AuditDetailContext'; 

const AuditHistory = () => {
  const { 
    audits, 
    filters, 
    updateFilters, 
    removeAudit, 
    isHistoryLoading: loading,
    fetchHistory
  } = useHistory();
  
  const { openAuditDetail } = useAuditDetail();
  const { alert, confirm } = useModal();

  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [userList, setUserList] = useState([]);


  useEffect(() => {
    api.get('/audited-users')
        .then(res => setUserList(res.data))
        .catch(err => console.error("Failed to fetch users", err));
  }, []); 

  useEffect(() => {
    fetchHistory(filters);
  }, [fetchHistory, filters]);

  const handleDeleteAudit = async (auditId) => {
    const confirmed = await confirm("Are you sure you want to delete this entire audit? This cannot be undone.");
    
    if (confirmed) {
        try {
            await api.delete(`/audits/${auditId}`);
            removeAudit(auditId);
            await alert("Audit deleted!");
        } catch (err) {
            console.error("Failed to delete audit", err);
            await alert("Failed to delete audit.");
        }
    }
  };
  
  const generateReport = async (auditSummary) => {
    await alert("Generating full report... this may take a moment.");
    try {
      const { data: fullAudit } = await api.get(`/audits/${auditSummary.id}`);
      const { auditedUser, startDate, errors } = fullAudit;
      const totalPoints = errors.reduce((sum, error) => sum + (error.points || 0), 0).toFixed(2);
      const auditDate = new Date(startDate).toLocaleDateString();
      const summary = [
        ["SuperQ Work Audit Report"], [],
        ["User Name:", auditedUser.name], ["Audit Date:", auditDate],
        ["Total Errors:", errors.length], ["Total Points:", totalPoints],
      ];
      const header = [
        'Error #', 'Processed Date', 'Code', 'Error Type', 'Error Name', 'Points', 'Paris MVS', 'User Processed MVS',
        'Existing Paris MVS', 'Incorrect Header', 'Correct Header', 'Work Type', 'Cue Sequence', 'Incorrect/Added MVS',
        'Correct/Existing MVS', 'Incorrect Name', 'Correct Name', 'Correct IPI',
        'Missing Name', 'Additional Name', 'Incorrect Value', 'Correct Value', 'Notes'
      ];
      const errorRows = errors.map((error, index) => [
        index + 1,
        error.processedDate ? new Date(error.processedDate).toLocaleDateString() : 'N/A',
        error.code,
        error.errorType,
        error.name,
        error.points,
        error.parisMVS,
        error.userProcessedMVS,
        error.existingParisMVS,
        error.incorrectHeader,
        error.correctHeader,
        error.workType,
        error.cueSequence,
        error.addedWorkMVS,
        error.existingWorkMVS,
        error.incorrectName,
        error.correctName,
        error.correctIPI,
        error.missingName,
        error.additionalName,
        error.incorrectValue,
        error.correctValue,
        error.notes
      ]);
      const finalData = [ ...summary, [], header, ...errorRows ];
      const ws = XLSX.utils.aoa_to_sheet(finalData);
      ws['!cols'] = [
        { wch: 8 }, { wch: 15 }, { wch: 6 }, { wch: 15 }, { wch: 35 }, { wch: 8 }, { wch: 15 }, { wch: 20 },
        { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 12 }, { wch: 12 }, { wch: 20 }, { wch: 20 },
        { wch: 20 }, { wch: 20 }, { wch: 15 }, { wch: 20 }, { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 40 }
      ];
      ws['A1'].s = { font: { bold: true, sz: 16 } };
      header.forEach((h, i) => {
          const cellRef = XLSX.utils.encode_cell({c: i, r: 7});
          if(ws[cellRef]) ws[cellRef].s = { font: { bold: true } };
      });
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Audit Report");
      XLSX.writeFile(wb, `Audit_${auditedUser.name.replace(/\s+/g, '_')}_${auditDate.replace(/\//g, '-')}.xlsx`);
    } catch (err) {
      console.error("Failed to generate report", err);
      await alert("Error generating full report.");
    }
  };

  const filteredAudits = audits.filter(audit => {
    const matchesSearch = searchTerm === '' ||
        (audit.id && audit.id.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (audit.auditedUser && audit.auditedUser.name && audit.auditedUser.name.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm dark:bg-slate-900 dark:border-slate-700">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-emerald-600 p-3 rounded-xl">
                <Archive className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Audit History</h1>
                <p className="text-slate-600 text-sm mt-1 dark:text-slate-400">Browse and manage past audits</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-2 px-6 rounded-lg flex items-center gap-2 transition-all dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600">
                <Download size={18} />
                Export All
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200 mb-6 dark:bg-slate-800 dark:border-slate-700">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Search by audit ID or user name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-400"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-6 py-3 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2 font-medium text-slate-700 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              <Filter size={18} />
              Filters
              <ChevronDown size={18} className={`transform transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2 dark:text-slate-300">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => updateFilters({ status: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                >
                  <option value="all">All Statuses</option>
                  <option value="completed">Completed</option>
                  <option value="in-progress">In Progress</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2 dark:text-slate-300">User</label>
                <select
                  value={filters.user}
                  onChange={(e) => updateFilters({ user: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                >
                  <option value="all">All Users</option>
                  {userList.map(user => (
                    <option key={user.id} value={user.id}>{user.name}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Audits List */}
        <div className="space-y-4">
          {loading && audits.length === 0 ? (
            <p className="text-slate-600 text-center py-10 dark:text-slate-400">Loading audit history...</p>
          ) : filteredAudits.map((audit) => (
            <div key={audit.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow dark:bg-slate-800 dark:border-slate-700 dark:hover:shadow-indigo-500/10">
              <div className="p-6">
                 <div className="flex items-start justify-between">
                  {/* Left Section */}
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                      {audit.auditedUser?.name.split(' ').map(n => n[0]).join('') || '??'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">{audit.id}</h3>
                        {audit.status === 'completed' ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                            <CheckCircle size={14} /> Completed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                            <Clock size={14} /> In Progress
                          </span>
                        )}
                      </div>
                      <p className="text-slate-700 font-medium mb-1 dark:text-slate-200">{audit.auditedUser?.name || 'Unknown User'}</p>
                      <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          Started: {new Date(audit.startDate).toLocaleDateString()}
                        </span>
                        {audit.completedDate && (
                          <span className="flex items-center gap-1">
                            <CheckCircle size={14} />
                            Completed: {new Date(audit.completedDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* Right Section - Stats */}
                  <div className="flex gap-8 ml-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">{audit._count.errors}</p>
                      <p className="text-xs text-slate-600 mt-1 dark:text-slate-400">Total Errors</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-red-600">{audit.totalPoints}</p>
                      <p className="text-xs text-slate-600 mt-1 dark:text-slate-400">Points</p>
                    </div>
                  </div>
                </div>
                {/* Actions */}
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-2">
                  <button
                    onClick={() => openAuditDetail(audit)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg flex items-center gap-2 transition-all"
                  >
                    <Eye size={16} /> View Details
                  </button>
                  <button 
                    onClick={() => generateReport(audit)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg flex items-center gap-2 transition-all dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600">
                    <Download size={16} />
                    Export
                  </button>
                  <button 
                    onClick={() => handleDeleteAudit(audit.id)}
                    className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-medium rounded-lg flex items-center gap-2 transition-all dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40">
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Empty State */}
        {!loading && filteredAudits.length === 0 && (
           <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center dark:bg-slate-800 dark:border-slate-700">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-4 dark:bg-slate-700">
              <FileText className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2 dark:text-white">No audits found</h3>
            <p className="text-slate-600 dark:text-slate-400">No completed audits match your filters.</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default AuditHistory;