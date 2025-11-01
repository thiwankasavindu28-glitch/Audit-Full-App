import express from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../server.js';
// TODO: Add an admin-only middleware here

const router = express.Router();

// @desc    Get all auditors
// @route   GET /api/auditors
router.get('/', async (req, res) => {
  // --- OPTIMIZATION START ---
  const sevenDaysAgo = new Date(new Date().setDate(new Date().getDate() - 7));

  // 1. Get all auditors (This is fast)
  const auditors = await prisma.auditor.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      joinDate: true,
    }
  });

  const auditorIds = auditors.map(a => a.id);

  // 2. Get "completedThisWeek" stats for ALL auditors in ONE query
  const completedStats = await prisma.audit.groupBy({
    by: ['auditorId'],
    where: {
      auditorId: { in: auditorIds },
      status: 'completed',
      completedDate: {
        gte: sevenDaysAgo,
      },
    },
    _count: {
      _all: true
    }
  });

  // 3. Get "activeAudits" stats for ALL auditors in ONE query
  const activeStats = await prisma.audit.groupBy({
    by: ['auditorId'],
    where: {
      auditorId: { in: auditorIds },
      status: 'in-progress',
    },
    _count: {
      _all: true
    }
  });

  // 4. Create maps for fast lookups
  const completedMap = completedStats.reduce((acc, curr) => {
    acc[curr.auditorId] = curr._count._all;
    return acc;
  }, {});

  const activeMap = activeStats.reduce((acc, curr) => {
    acc[curr.auditorId] = curr._count._all;
    return acc;
  }, {});

  // 5. Combine the data in JavaScript (This is very fast)
  const auditorsWithStats = auditors.map(auditor => ({
    ...auditor,
    activeAudits: activeMap[auditor.id] || 0,
    completedThisWeek: completedMap[auditor.id] || 0,
  }));
  // --- OPTIMIZATION END ---

  res.json(auditorsWithStats);
});

// @desc    Create a new auditor (similar to register)
// @route   POST /api/auditors
router.post('/', async (req, res) => {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Please add all fields' });
    }
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newAuditor = await prisma.auditor.create({
        data: { name, email, password: hashedPassword, role: role || 'Auditor' },
        select: { id: true, name: true, email: true, role: true, joinDate: true }
    });
    res.status(201).json(newAuditor);
});

// @desc    Get a single auditor
// @route   GET /api/auditors/:id
router.get('/:id', async (req, res) => {
    const auditor = await prisma.auditor.findUnique({
        where: { id: req.params.id },
        select: {
            id: true, name: true, email: true, role: true, joinDate: true,
            _count: { select: { audits: true } }
        }
    });
    res.json(auditor);
});

// @desc    Update an auditor
// @route   PUT /api/auditors/:id
router.put('/:id', async (req, res) => {
    const { name, email, role } = req.body;
    const updatedAuditor = await prisma.auditor.update({
        where: { id: req.params.id },
        data: { name, email, role },
        select: { id: true, name: true, email: true, role: true, joinDate: true }
    });
    res.json(updatedAuditor);
});

// @desc    Delete an auditor
// @route   DELETE /api/auditors/:id
router.delete('/:id', async (req, res) => {
    await prisma.auditor.delete({
        where: { id: req.params.id }
    });
    res.json({ message: 'Auditor deleted' });
});

export default router;