import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingDown, TrendingUp, Users, AlertTriangle, Award, Calendar, Download, Filter, Star } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../services/api';
import * as XLSX from 'xlsx';
import { useAnalytics } from '../context/AnalyticsContext';

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('30days');
  
  const {
    keyMetrics,
    errorTrendData,
    errorCategoryData,
    topErrorsData,
    auditedUserRanking, 
    fetchAnalyticsData,
    isAnalyticsLoading
  } = useAnalytics();

  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData, timeRange]);

  const handleExportReport = () => {
    // ... (this function is unchanged) ...
    const wb = XLSX.utils.book_new();

    const metricsData = [
      ["Metric", "Value"],
      ["Total Errors", keyMetrics.totalErrors],
      ["Avg Error Rate", keyMetrics.avgErrorRate],
      ["Total Points", keyMetrics.totalPoints],
      ["Active Auditors", keyMetrics.totalAuditorsActive],
    ];
    const wsMetrics = XLSX.utils.aoa_to_sheet(metricsData);
    XLSX.utils.book_append_sheet(wb, wsMetrics, "Key Metrics");

    const topErrorsHeader = ['Rank', 'Error Name', 'Count', 'Total Points'];
    const topErrorsRows = topErrorsData.map((err, i) => [
      i + 1,
      err.error,
      err.count,
      err.points
    ]);
    const wsTopErrors = XLSX.utils.aoa_to_sheet([topErrorsHeader, ...topErrorsRows]);
    XLSX.utils.book_append_sheet(wb, wsTopErrors, "Top Errors");
    
    const userRankingHeader = ['Rank', 'User Name', 'Department', 'Total Audits', 'Total Errors', 'Total Points'];
    const userRankingRows = auditedUserRanking.map((user, i) => [
      i + 1,
      user.name,
      user.department,
      user.totalAudits,
      user.totalErrors,
      user.totalPoints
    ]);
    const wsUserRanking = XLSX.utils.aoa_to_sheet([userRankingHeader, ...userRankingRows]);
    XLSX.utils.book_append_sheet(wb, wsUserRanking, "Audited User Ranking");

    const trendHeader = ['Date', 'Errors'];
    const trendRows = errorTrendData.map(day => [
      day.month,
      day.errors
    ]);
    const wsTrend = XLSX.utils.aoa_to_sheet([trendHeader, ...trendRows]);
    XLSX.utils.book_append_sheet(wb, wsTrend, "Error Trend");

    const categoryHeader = ['Category', 'Count', 'Chart Color'];
    const categoryRows = errorCategoryData.map(cat => [
      cat.name,
      cat.value,
      cat.color
    ]);
    const wsCategory = XLSX.utils.aoa_to_sheet([categoryHeader, ...categoryRows]);
    XLSX.utils.book_append_sheet(wb, wsCategory, "Category Distribution");

    XLSX.writeFile(wb, "Analytics_Report_Detailed.xlsx");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm dark:bg-slate-900 dark:border-slate-700">
        {/* ... (header is unchanged) ... */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-purple-600 p-3 rounded-xl">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Analytics Dashboard</h1>
                <p className="text-slate-600 text-sm mt-1 dark:text-slate-400">Performance insights and trends</p>
              </div>
            </div>
            <div className="flex gap-3">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-4 py-2 border border-slate-300 rounded-lg bg-white text-slate-700 font-medium dark:bg-slate-700 dark:border-slate-600 dark:text-white"
              >
                <option value="30days">Last 30 Days</option>
                <option value="90days">Last 90 Days</option>
                <option value="year">This Year</option>
              </select>
              <button 
                onClick={handleExportReport}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded-lg flex items-center gap-2 transition-all">
                <Download size={18} />
                Export Report
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* ... (key metrics are unchanged) ... */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
            <p className="text-sm text-slate-600 font-medium dark:text-slate-400">Total Errors</p>
            <p className="text-3xl font-bold text-slate-900 mt-2 dark:text-white">{keyMetrics.totalErrors || 0}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
            <p className="text-sm text-slate-600 font-medium dark:text-slate-400">Avg Error Rate</p>
            <p className="text-3xl font-bold text-slate-900 mt-2 dark:text-white">{keyMetrics.avgErrorRate || 0}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
            <p className="text-sm text-slate-600 font-medium dark:text-slate-400">Total Points</p>
            <p className="text-3xl font-bold text-slate-900 mt-2 dark:text-white">{keyMetrics.totalPoints || 0}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
             <p className="text-sm text-slate-600 font-medium dark:text-slate-400">Active Auditors</p>
             <p className="text-3xl font-bold text-slate-900 mt-2 dark:text-white">{keyMetrics.totalAuditorsActive || 0}</p>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Error Trend Chart */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Error Trends (Last 30 Days)</h3>
            {isAnalyticsLoading && errorTrendData.length === 0 ? <p className="py-10 text-center text-slate-500 dark:text-slate-400">Loading chart...</p> : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={errorTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="errors" stroke="#6366f1" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
            )}
          </div>

          {/* Error Category Distribution */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Error Distribution</h3>
            {isAnalyticsLoading && errorCategoryData.length === 0 ? <p className="py-10 text-center text-slate-500 dark:text-slate-400">Loading chart...</p> : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                {/* --- THIS IS THE FIX --- */}
                <Pie 
                  data={errorCategoryData} 
                  dataKey="value" 
                  nameKey="name" 
                  cx="50%" 
                  cy="50%" 
                  outerRadius={100} 
                  label
                  isAnimationActive={false} // <-- ADDED THIS PROP
                >
                {/* --- END OF FIX --- */}
                  {errorCategoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Top Errors Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-8 dark:bg-slate-800 dark:border-slate-700">
            {/* ... (top errors table is unchanged) ... */}
            <h3 className="text-lg font-semibold text-slate-900 p-6 border-b border-slate-200 dark:text-white dark:border-slate-700">Most Common Errors</h3>
            {isAnalyticsLoading && topErrorsData.length === 0 ? <p className="p-6 dark:text-slate-300">Loading...</p> : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200 dark:bg-slate-700/50 dark:border-slate-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase dark:text-slate-400">Rank</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase dark:text-slate-400">Error Name</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase dark:text-slate-400">Count</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase dark:text-slate-400">Total Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {topErrorsData.map((error, index) => (
                    <tr key={index} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                        <td className="px-6 py-4 dark:text-slate-300">{index + 1}</td>
                        <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">{error.error}</td>
                        <td className="px-6 py-4 text-slate-700 dark:text-slate-300">{error.count}</td>
                        <td className="px-6 py-4"><span className="font-semibold text-red-600">{error.points}</span></td>
                    </tr>
                ))}
                </tbody>
              </table>
            </div>
            )}
        </div>
        
        {/* Audited User Ranking */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
          {/* ... (user ranking table is unchanged) ... */}
          <h3 className="text-lg font-semibold text-slate-900 p-6 border-b border-slate-200 dark:text-white dark:border-slate-700">Audited User Ranking (By Error Points)</h3>
           {isAnalyticsLoading && auditedUserRanking.length === 0 ? <p className="p-6 dark:text-slate-300">Loading...</p> : (
           <div className="overflow-x-auto">
             <table className="w-full">
               <thead className="bg-slate-50 border-b border-slate-200 dark:bg-slate-700/50 dark:border-slate-700">
                 <tr>
                   <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase dark:text-slate-400">Rank</th>
                   <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase dark:text-slate-400">User</th>
                   <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase dark:text-slate-400">Department</th>
                   <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase dark:text-slate-400">Total Audits</th>
                   <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase dark:text-slate-400">Total Errors</th>
                   <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase dark:text-slate-400">Total Points</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                 {auditedUserRanking.map((user, index) => (
                   <tr key={index} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                     <td className="px-6 py-4">
                        <span className={`font-bold ${index === 0 ? 'text-red-500' : index === 1 ? 'text-amber-500' : index === 2 ? 'text-blue-500' : 'text-slate-500'}`}>
                            {index + 1}
                        </span>
                     </td>
                     <td className="px-6 py-4">
                       <div className="font-semibold text-slate-900 dark:text-white">{user.name}</div>
                       <div className="text-sm text-slate-500 dark:text-slate-400">{user.email}</div>
                     </td>
                     <td className="px-6 py-4 text-slate-700 dark:text-slate-300">{user.department}</td>
                     <td className="px-6 py-4 text-slate-700 dark:text-slate-300">{user.totalAudits}</td>
                     <td className="px-6 py-4 text-slate-700 dark:text-slate-300">{user.totalErrors}</td>
                     <td className="px-6 py-4 font-bold text-red-600">{user.totalPoints}</td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;