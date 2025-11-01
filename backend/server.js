import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/auth.js';
import auditorRoutes from './routes/auditors.js'; // For managing auditors
import auditedUserRoutes from './routes/auditedUsers.js'; // For managing audited users
import auditRoutes from './routes/audits.js';
import analyticsRoutes from './routes/analytics.js';
import { protect } from './middleware/authMiddleware.js';

dotenv.config();

export const prisma = new PrismaClient();
const app = express();

// Middleware
app.use(cors()); // Allow frontend to connect
app.use(express.json()); // Allow reading JSON bodies

// --- API Routes ---

// Auth (Login/Register for Auditors)
app.use('/api/auth', authRoutes);

// Managing Auditors (for UserManagement.jsx)
app.use('/api/auditors', protect, auditorRoutes);

// Managing Audited Users (for AuditedUsersDirectory.jsx)
app.use('/api/audited-users', protect, auditedUserRoutes);

// Managing Audits & Errors (for Dashboard, History, Workspace)
app.use('/api/audits', protect, auditRoutes);

// Analytics (for AnalyticsDashboard.jsx)
app.use('/api/analytics', protect, analyticsRoutes);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});