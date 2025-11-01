import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../server.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Helper to generate a token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register a new auditor (e.g., for an admin to add the 5 auditors)
// @route   POST /api/auth/register
router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Please add all fields' });
  }

  const auditorExists = await prisma.auditor.findUnique({ where: { email } });
  if (auditorExists) {
    return res.status(400).json({ message: 'Auditor already exists' });
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const auditor = await prisma.auditor.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: role || 'Auditor',
    },
  });

  if (auditor) {
    res.status(201).json({
      _id: auditor.id,
      name: auditor.name,
      email: auditor.email,
      role: auditor.role,
      token: generateToken(auditor.id),
    });
  } else {
    res.status(400).json({ message: 'Invalid auditor data' });
  }
});

// @desc    Authenticate (login) an auditor
// @route   POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const auditor = await prisma.auditor.findUnique({ where: { email } });

  if (auditor && (await bcrypt.compare(password, auditor.password))) {
    res.json({
      _id: auditor.id,
      name: auditor.name,
      email: auditor.email,
      role: auditor.role,
      token: generateToken(auditor.id),
    });
  } else {
    res.status(400).json({ message: 'Invalid credentials' });
  }
});

// @desc    Get current logged-in auditor's data (for AuditorSettings)
// @route   GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  // req.auditor is added by the 'protect' middleware
  const auditorData = await prisma.auditor.findUnique({
    where: { id: req.auditor.id },
    select: { // <-- Select only the fields you need, including the new phone field
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true, // <-- ADDED
      _count: { select: { audits: true } }
    }
  });
  res.json(auditorData);
});

// @desc    Update current logged-in auditor's profile
// @route   PUT /api/auth/me
router.put('/me', protect, async (req, res) => {
    const { name, email, phone } = req.body; 
    const updatedAuditor = await prisma.auditor.update({
        where: { id: req.auditor.id },
        data: { name, email, phone }, // <-- FIX: Added phone
    });
    res.json(updatedAuditor);
});

// @desc    Update current logged-in auditor's password
// @route   PUT /api/auth/password
router.put('/password', protect, async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const auditor = await prisma.auditor.findUnique({ where: { id: req.auditor.id } });

    if (auditor && (await bcrypt.compare(currentPassword, auditor.password))) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        
        await prisma.auditor.update({
            where: { id: req.auditor.id },
            data: { password: hashedPassword }
        });
        res.json({ message: "Password updated successfully" });
    } else {
        res.status(400).json({ message: "Current password is incorrect" });
    }
});

export default router;