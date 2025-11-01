import React from 'react';
import { X } from 'lucide-react';
import { useAuditDetail } from '../context/AuditDetailContext';

const AuditDetailModal = () => {
  const { 
    isModalOpen, 
    selectedAudit, 
    detailedAudit, 
    isLoadingModal, 
    closeAuditDetail 
  } = useAuditDetail();

  // Don't render anything if the modal isn't open
  if (!isModalOpen || !selectedAudit) {
    return null;
  }

  // Use the full detailed audit if it has loaded,
  // otherwise, fall back to the basic summary info
  const auditData = detailedAudit || selectedAudit;
  const errors = detailedAudit ? detailedAudit.errors : [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto dark:bg-slate-800">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-800 dark:border-slate-700">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Audit Details</h2>
          <button
            onClick={closeAuditDetail}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors dark:text-slate-300 dark:hover:bg-slate-700"
          >
            <X size={24} />
          </button>
        </div>
        
        {/* Modal Body */}
        <div className="p-6">
          <p className="text-lg font-semibold mb-4 dark:text-white">
            {auditData.id} - {auditData.auditedUser?.name || 'Unknown User'}
          </p>
          
          {isLoadingModal ? (
            <p className="dark:text-slate-300">Loading errors...</p>
          ) : detailedAudit ? (
            <div className="space-y-4">
              {errors.length === 0 ? (
                <p className="dark:text-slate-300">No errors were recorded for this audit.</p>
              ) : (
                errors.map((error, index) => (
                  <div key={error.id} className="border border-slate-200 rounded-lg p-4 dark:border-slate-700">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 mr-4">
                        <p className="font-semibold text-slate-800 dark:text-white">{index + 1}. {error.name} <span className="text-red-500 font-bold">({error.points} pts)</span></p>
                        <div className="text-sm text-slate-600 mt-2 space-y-1 dark:text-slate-300">
                          {Object.entries(error).map(([key, value]) => {
                            if (value && !['id', 'auditId', 'errorType', 'name', 'code', 'points', 'notes', 'customPoints', 'payable', 'nonPayable'].includes(key)) {
                              const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                              return <p key={key}><span className="font-medium text-slate-500 dark:text-slate-400">{formattedKey}:</span> {String(value)}</p>;
                            }
                            return null;
                          })}
                        </div>
                        {error.notes && <p className="text-sm text-slate-700 mt-2 pt-2 border-t border-slate-200 dark:border-slate-700 italic dark:text-slate-300">Notes: {error.notes}</p>}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <p className="dark:text-slate-300">Could not load audit details.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuditDetailModal;