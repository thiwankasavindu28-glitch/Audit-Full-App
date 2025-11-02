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
      // --- FIX 1: Load lightweight stats FIRST ---
      // These are fast count/aggregate queries.
      const [auditorsRes, statsRes] = await Promise.all([
        api.get('/auditors'),
        api.get('/analytics/stats')
      ]);

      // Set stats data immediately so the page updates
      const stats = {
        totalCompletedAudits: statsRes.data.totalCompletedAudits,
        totalActiveAudits: statsRes.data.totalActiveAudits,
        totalAuditorsActive: auditorsRes.data.length,
      };

      setData(prevData => ({
        ...prevData,
        stats: { ...prevData.stats, ...stats },
        auditors: auditorsRes.data,
      }));

      // --- FIX 2: Load heavy list data SECOND ---
      // These are slower queries that fetch full lists.
      const [myActiveRes, myCompletedRes, usersRes] = await Promise.all([
        api.get('/audits?auditorId=me&status=in-progress'),
        api.get('/audits?auditorId=me&status=completed'),
        api.get('/audits/recent-users')
      ]);

      // Calculate the rest of the stats and set all data
      const myStats = {
        myActiveAudits: myActiveRes.data.length,
        myCompletedThisWeek: myCompletedRes.data.filter(a => a.completedDate && new Date(a.completedDate) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length,
      };

      setData(prevData => ({
        ...prevData,
        stats: { ...prevData.stats, ...myStats },
        myAudits: myActiveRes.data,
        completedAudits: myCompletedRes.data,
        recentlyAuditedUsers: usersRes.data,
      }));

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