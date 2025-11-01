import React, { createContext, useState, useContext, useCallback } from 'react';
import api from '../services/api';

const AuditedUsersContext = createContext(null);

export const useAuditedUsers = () => useContext(AuditedUsersContext);

const initialState = {
  users: [],
  departments: [],
};

export const AuditedUsersProvider = ({ children }) => {
  const [data, setData] = useState(initialState);
  const [loading, setLoading] = useState(false);

  const fetchAuditedUsers = useCallback(async () => {
    // We removed the 'if (loading)' check to allow refetching
    setLoading(true);
    try {
      const { data: usersData } = await api.get('/audited-users');
      const usersWithStats = usersData.map(u => ({
          ...u,
          stats: { totalAudits: u._count.audits },
      }));
      const depts = [...new Set(usersWithStats.map(u => u.department))];
      
      setData({
        users: usersWithStats,
        departments: depts,
      });
    } catch (err) {
      console.error("Failed to fetch audited users", err);
      setData(initialState); // Reset on error
    }
    setLoading(false);
  }, []); // No dependencies, fetch is manually called

  // This function allows the AddUserModal to add to our context state
  // without needing a full refetch
  const addUser = (newUser) => {
     const userWithStats = { 
        ...newUser, 
        stats: { totalAudits: 0 }, 
        _count: { audits: 0 } 
    };
    setData(prevData => ({
        ...prevData,
        users: [...prevData.users, userWithStats],
        // Optionally add new department if it doesn't exist
        departments: [...new Set([...prevData.departments, userWithStats.department])]
    }));
  };

  const value = {
    ...data, // Spread all data (users, departments)
    fetchAuditedUsers,
    addUser, // Expose the addUser function
    isUsersLoading: loading,
  };

  return (
    <AuditedUsersContext.Provider value={value}>
      {children}
    </AuditedUsersContext.Provider>
  );
};