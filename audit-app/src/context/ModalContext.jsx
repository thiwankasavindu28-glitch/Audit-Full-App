import React, { createContext, useState, useContext, useCallback } from 'react';

const ModalContext = createContext();

export const useModal = () => useContext(ModalContext);

export const ModalProvider = ({ children }) => {
  const [modalState, setModalState] = useState(null);

  const alert = (message) => {
    return new Promise((resolve) => {
      setModalState({
        type: 'alert',
        message,
        onConfirm: () => {
          setModalState(null);
          resolve(true);
        },
      });
    });
  };

  const confirm = (message) => {
    return new Promise((resolve) => {
      setModalState({
        type: 'confirm',
        message,
        onConfirm: () => {
          setModalState(null);
          resolve(true);
        },
        onCancel: () => {
          setModalState(null);
          resolve(false);
        },
      });
    });
  };

  return (
    <ModalContext.Provider value={{ alert, confirm, modalState }}>
      {children}
    </ModalContext.Provider>
  );
};