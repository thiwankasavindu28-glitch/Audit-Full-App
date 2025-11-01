import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingDown, TrendingUp, Users, AlertTriangle, Award, Calendar, Download, Filter } from 'lucide-react';
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
    userPerformanceData,
    fetchAnalyticsData,
    isAnalyticsLoading
  } = useAnalytics();

  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData, timeRange]);

  const handleExportReport = () => {
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
    
    const userPerfHeader = ['Auditor', 'Audits Completed', 'Total Errors', 'Avg Error Rate'];
    const userPerfRows = userPerformanceData.map(user => [
      user.name,
      user.audits,
      user.errors,
      user.avgErrorRate
    ]);
    const wsUserPerf = XLSX.utils.aoa_to_sheet([userPerfHeader, ...userPerfRows]);
    XLSX.utils.book_append_sheet(wb, wsUserPerf, "User Performance");

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
                <Pie data={errorCategoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
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
        
        {/* User Performance Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 p-6 border-b border-slate-200 dark:text-white dark:border-slate-700">Auditor Performance</h3>
           {isAnalyticsLoading && userPerformanceData.length === 0 ? <p className="p-6 dark:text-slate-300">Loading...</p> : (
           <div className="overflow-x-auto">
             <table className="w-full">
               <thead className="bg-slate-50 border-b border-slate-200 dark:bg-slate-700/50 dark:border-slate-700">
                 <tr>
                   <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase dark:text-slate-400">Auditor</th>
                   <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase dark:text-slate-400">Audits Completed</th>
                   <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase dark:text-slate-400">Total Errors</th>
                   <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase dark:text-slate-400">Avg Error Rate</th>
                   <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase dark:text-slate-400">Performance</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                 {userPerformanceData.map((user, index) => (
                   <tr key={index} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                     <td className="px-6 py-4">
                       <div className="flex items-center gap-3">
                         <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                           {user.name.split(' ').map(n => n[0]).join('')}
                         </div>
                         <span className="font-semibold text-slate-900 dark:text-white">{user.name}</span>
                       </div>
                     </td>
                     <td className="px-6 py-4 text-slate-700 dark:text-slate-300">{user.audits}</td>
                     <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">{user.errors}</td>
                     <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">{user.avgErrorRate}</td>
                     <td className="px-6 py-4">
                       {user.avgErrorRate < 8 ? (
                         <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">Excellent</span>
                       ) : user.avgErrorRate < 12 ? (
                         <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Good</span>
                       ) : (
                         <span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">Needs Improvement</span>
                       )}
                     </td>
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