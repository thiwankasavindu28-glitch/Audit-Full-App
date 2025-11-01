import React, { createContext, useState, useContext, useCallback } from 'react';
import api from '../services/api';

// 1. Create the context
const AuditDetailContext = createContext(null);
export const useAuditDetail = () => useContext(AuditDetailContext);

// 2. Create the provider
export const AuditDetailProvider = ({ children }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAudit, setSelectedAudit] = useState(null); // The basic audit info
  const [detailedAudit, setDetailedAudit] = useState(null); // The full audit with errors
  const [isLoadingModal, setIsLoadingModal] = useState(false);

  // 3. Create a function to open the modal
  const openAuditDetail = useCallback(async (auditSummary) => {
    setSelectedAudit(auditSummary); // Set basic info immediately
    setIsModalOpen(true);
    setIsLoadingModal(true);
    setDetailedAudit(null); // Clear previous details
    
    try {
      const { data } = await api.get(`/audits/${auditSummary.id}`);
      setDetailedAudit(data); // Set the full data with errors
    } catch (err) {
      console.error("Failed to fetch audit details", err);
      // We can still show the modal with basic info even if this fails
    }
    setIsLoadingModal(false);
  }, []);

  // 4. Create a function to close the modal
  const closeAuditDetail = () => {
    setIsModalOpen(false);
    setSelectedAudit(null);
    setDetailedAudit(null);
  };

  const value = {
    isModalOpen,
    selectedAudit,
    detailedAudit,
    isLoadingModal,
    openAuditDetail,
    closeAuditDetail,
  };

  return (
    <AuditDetailContext.Provider value={value}>
      {children}
    </AuditDetailContext.Provider>
  );
};