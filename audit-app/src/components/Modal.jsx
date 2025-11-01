import React from 'react';
import { useModal } from '../context/ModalContext';
import { Check, X, AlertTriangle } from 'lucide-react';

const Modal = () => {
  const { modalState } = useModal();

  if (!modalState) {
    return null; // Don't render anything if no modal is active
  }

  const { type, message, onConfirm, onCancel } = modalState;
  const isConfirm = type === 'confirm';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md dark:bg-slate-800">
        <div className="p-6 text-center">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={32} />
          </div>
          <p className="text-lg font-medium text-slate-800 dark:text-slate-100">{message}</p>
        </div>
        
        <div className="bg-slate-50 p-4 rounded-b-xl flex justify-end gap-3 dark:bg-slate-700/50">
          {isConfirm && (
            <button
              onClick={onCancel}
              className="px-6 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium rounded-lg dark:bg-slate-600 dark:hover:bg-slate-500 dark:text-slate-200"
            >
              Cancel
            </button>
          )}
          <button
            onClick={onConfirm}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg flex items-center gap-2"
          >
            <Check size={20} />
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;