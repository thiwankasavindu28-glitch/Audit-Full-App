import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ModalProvider } from './context/ModalContext';
import { DashboardProvider } from './context/DashboardContext';
import { AnalyticsProvider } from './context/AnalyticsContext';
import { AuditedUsersProvider } from './context/AuditedUsersContext';
import { HistoryProvider } from './context/HistoryContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuditDetailProvider } from './context/AuditDetailContext'; // <-- 1. IMPORT
import App from './App.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ModalProvider>
          <DashboardProvider>
            <AnalyticsProvider>
              <AuditedUsersProvider>
                <HistoryProvider>
                  <ThemeProvider>
                    <AuditDetailProvider> {/* <-- 2. WRAP */}
                      <App />
                    </AuditDetailProvider>
                  </ThemeProvider>
                </HistoryProvider>
              </AuditedUsersProvider>
            </AnalyticsProvider>
          </DashboardProvider>
        </ModalProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);