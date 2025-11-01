import React, { createContext, useState, useContext, useCallback } from 'react';
import api from '../services/api';

const HistoryContext = createContext(null);

export const useHistory = () => useContext(HistoryContext);

const initialState = {
  audits: [],
};

export const HistoryProvider = ({ children }) => {
  const [data, setData] = useState(initialState);
  const [loading, setLoading] = useState(false);

  // Store filters in context
  const [filters, setFilters] = useState({
    status: 'all',
    user: 'all',
  });

  // fetchHistory now takes the current filters as an argument
  const fetchHistory = useCallback(async (currentFilters) => {
    setLoading(true);
    try {
      const params = {
        status: currentFilters.status === 'all' ? undefined : currentFilters.status,
        user: currentFilters.user === 'all' ? undefined : currentFilters.user,
      };
      const { data: auditData } = await api.get('/audits', { params });
      setData({ audits: auditData });
    } catch (err) {
      console.error("Failed to fetch audit history", err);
      setData(initialState);
    }
    setLoading(false);
  }, []); // Removed 'filters' dependency

  // --- WE REMOVED THE useEffect THAT WAS HERE ---

  // Function to update filters from the UI
  const updateFilters = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };
  
  // Function to remove a deleted audit from the list
  const removeAudit = (auditId) => {
    setData(prevData => ({
        ...prevData,
        audits: prevData.audits.filter(a => a.id !== auditId)
    }));
  };

  const value = {
    ...data, // Spread all data (audits)
    filters,
    updateFilters,
    fetchHistory, // <-- Expose the fetch function
    removeAudit,
    isHistoryLoading: loading,
  };

  return (
    <HistoryContext.Provider value={value}>
      {children}
    </HistoryContext.Provider>
  );
};