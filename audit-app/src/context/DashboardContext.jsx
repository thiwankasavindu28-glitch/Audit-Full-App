import React, { createContext, useState, useContext, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const DashboardContext = createContext(null);

export const useDashboard = () => useContext(DashboardContext);

const initialState = {
  stats: {},
  myAudits: [],
  completedAudits: [],
  auditors: [],
  recentlyAuditedUsers: [],
};

export const DashboardProvider = ({ children }) => {
  const [data, setData] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const { auditor } = useAuth();

  const fetchDashboardData = useCallback(async () => {
    if (loading || !auditor) return; // Prevent multiple fetches
    
    setLoading(true);
    try {
      const [
        myActiveRes,
        myCompletedRes,
        auditorsRes,
        usersRes,
        statsRes
      ] = await Promise.all([
        api.get('/audits?auditorId=me&status=in-progress'),
        api.get('/audits?auditorId=me&status=completed'),
        api.get('/auditors'),
        api.get('/audits/recent-users'),
        api.get('/analytics/stats')
      ]);

      const stats = {
        myActiveAudits: myActiveRes.data.length,
        myCompletedThisWeek: myCompletedRes.data.filter(a => a.completedDate && new Date(a.completedDate) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length,
        totalCompletedAudits: statsRes.data.totalCompletedAudits,
        totalActiveAudits: statsRes.data.totalActiveAudits,
        totalAuditorsActive: auditorsRes.data.length,
      };

      setData({
        stats: stats,
        myAudits: myActiveRes.data,
        completedAudits: myCompletedRes.data,
        auditors: auditorsRes.data,
        recentlyAuditedUsers: usersRes.data,
      });

    } catch (err) {
      console.error("Failed to load dashboard data", err);
    }
    setLoading(false);
  }, [auditor, loading]); // Dependencies

  const value = {
    ...data, // Spread all data (stats, myAudits, etc.)
    fetchDashboardData,
    isDashboardLoading: loading,
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};