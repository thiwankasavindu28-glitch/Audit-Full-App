import React, { createContext, useState, useContext, useCallback } from 'react';
import api from '../services/api';

const AnalyticsContext = createContext(null);

export const useAnalytics = () => useContext(AnalyticsContext);

const initialState = {
  keyMetrics: {},
  errorTrendData: [],
  errorCategoryData: [],
  topErrorsData: [],
  auditedUserRanking: [], 
  userPerformanceData: [], 
};

export const AnalyticsProvider = ({ children }) => {
  const [data, setData] = useState(initialState);
  const [loading, setLoading] = useState(false);

  const fetchAnalyticsData = useCallback(async () => {
    if (loading) return; 
    setLoading(true);
    
    // --- THIS LINE HAS BEEN REMOVED ---
    // setData(initialState); // <-- This was the line causing the problem.
    
    try {
      // 1. Get Key Metrics
      const statsRes = await api.get('/analytics/stats');
      setData(prev => ({ ...prev, keyMetrics: statsRes.data }));

      // 2. Get Top Errors
      const topErrorsRes = await api.get('/analytics/top-errors');
      setData(prev => ({ ...prev, topErrorsData: topErrorsRes.data }));

      // 3. Get User Ranking
      const userRankingRes = await api.get('/analytics/audited-user-ranking');
      setData(prev => ({ ...prev, auditedUserRanking: userRankingRes.data }));
      
      // 4. Get Error Trend
      const trendRes = await api.get('/analytics/error-trend');
      setData(prev => ({ ...prev, errorTrendData: trendRes.data }));

      // 5. Get Category Distribution
      const categoryRes = await api.get('/analytics/category-distribution');
      setData(prev => ({ ...prev, errorCategoryData: categoryRes.data }));

      // 6. Get User Performance (for Manage Auditors page)
      const userPerfRes = await api.get('/analytics/user-performance');
      setData(prev => ({ ...prev, userPerformanceData: userPerfRes.data }));

    } catch (err) {
      console.Error("Failed to load analytics data", err);
    }
    setLoading(false);
  }, []); // <-- This is correct

  const value = {
    ...data, // Spread all data
    fetchAnalyticsData,
    isAnalyticsLoading: loading,
  };

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
};