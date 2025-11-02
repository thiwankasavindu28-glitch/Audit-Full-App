import React, { createContext, useState, useContext, useCallback } from 'react';
import api from '../services/api';

const AnalyticsContext = createContext(null);

export const useAnalytics = () => useContext(AnalyticsContext);

// 1. Define the initial state for all our data
const initialState = {
  keyMetrics: {},
  errorTrendData: [],
  errorCategoryData: [],
  topErrorsData: [],
  auditedUserRanking: [], // <-- For Analytics Page
  userPerformanceData: [], // <-- For User Management Page
};

export const AnalyticsProvider = ({ children }) => {
  const [data, setData] = useState(initialState);
  const [loading, setLoading] = useState(false);

  // 2. Create one function to fetch ALL analytics data in parallel
  const fetchAnalyticsData = useCallback(async () => {
    if (loading) return; 
    setLoading(true);
    try {
      const [
        statsRes,
        trendRes,
        categoryRes,
        topErrorsRes,
        userPerfRes,
        userRankingRes // <-- ADDED
      ] = await Promise.all([
        api.get('/analytics/stats'),
        api.get('/analytics/error-trend'),
        api.get('/analytics/category-distribution'),
        api.get('/analytics/top-errors'),
        api.get('/analytics/user-performance'), // <-- RESTORED
        api.get('/analytics/audited-user-ranking') // <-- ADDED
      ]);

      setData({
        keyMetrics: statsRes.data,
        errorTrendData: trendRes.data,
        errorCategoryData: categoryRes.data,
        topErrorsData: topErrorsRes.data,
        userPerformanceData: userPerfRes.data, // <-- RESTORED
        auditedUserRanking: userRankingRes.data, // <-- ADDED
      });

    } catch (err) {
      console.error("Failed to load analytics data", err);
    }
    setLoading(false);
  }, [loading]); // <-- This dependency is correct

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