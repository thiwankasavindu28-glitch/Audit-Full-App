import express from 'express';
import { prisma } from '../server.js';

const router = express.Router();

// @desc    Get all audited users (for main list)
// @route   GET /api/audited-users
router.get('/', async (req, res) => {
  // This route stays fast, it only gets the user list
  const users = await prisma.auditedUser.findMany({
    include: {
        _count: { select: { audits: true } },
    }
  });
  res.json(users);
});

// @desc    Create a new audited user
// @route   POST /api/audited-users
router.post('/', async (req, res) => {
  const { name, email, phone, department, position, supervisor } = req.body;
  const newUser = await prisma.auditedUser.create({
    data: { name, email, phone, department, position, supervisor },
  });
  res.status(201).json(newUser);
});

// @desc    Get a single audited user by ID (for the modal)
// @route   GET /api/audited-users/:id
router.get('/:id', async (req, res) => {
  try {
    const user = await prisma.auditedUser.findUnique({
      where: { id: req.params.id },
      include: {
        audits: { // Include their audit history
          where: { status: 'completed' }, // Only get stats for COMPLETED audits
          orderBy: { completedDate: 'desc' },
          include: { 
            auditor: { select: { name: true } },
            _count: { select: { errors: true } }
          }
        }
      }
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // --- STATS CALCULATION ---
    const totalAudits = user.audits.length;
    let totalErrors = 0;
    let totalPoints = 0;
    
    // Get all errors for this user's completed audits
    const allErrors = await prisma.error.findMany({
        where: { audit: { auditedUserId: req.params.id, status: 'completed' } }
    });

    // Calculate totals
    allErrors.forEach(error => {
        totalErrors += 1;
        totalPoints += error.points;
    });

    // --- THIS IS THE CORRECTED QUERY ---
    // Find most common error
    const errorGroups = await prisma.error.groupBy({
        by: ['name'],
        where: { audit: { auditedUserId: req.params.id, status: 'completed' } },
        _count: {
          name: true // Count by the 'name' field
        },
        orderBy: {
          _count: {
            name: 'desc' // Order by the count of 'name'
          }
        },
        take: 1
    });
    // --- END OF FIX ---

    const stats = {
        totalAudits: totalAudits,
        totalErrors: totalErrors,
        totalPoints: totalPoints,
        avgErrorRate: totalAudits > 0 ? (totalErrors / totalAudits).toFixed(1) : 0,
        lastAuditDate: totalAudits > 0 ? user.audits[0].completedDate : 'N/A',
        highestErrorType: errorGroups.length > 0 ? errorGroups[0].name : 'N/A',
        trend: 0 // Trend is complex, setting to 0 for now
    }
    
    // Add total points to each recent audit
    const auditsWithPoints = await Promise.all(user.audits.map(async (audit) => {
      const errorSum = await prisma.error.aggregate({
          _sum: { points: true },
          where: { auditId: audit.id }
      });
      return {
          ...audit,
          errors: audit._count.errors,
          points: errorSum._sum.points || 0,
          date: new Date(audit.completedDate).toLocaleDateString()
      };
    }));

    res.json({ ...user, stats, recentAudits: auditsWithPoints });

  } catch (err) {
    console.error(err); // Log the error to the console
    res.status(500).json({ message: "Error fetching user details." });
  }
});

// @desc    Update an audited user
// @route   PUT /api/audited-users/:id
router.put('/:id', async (req, res) => {
  const { name, email, phone, department, position, supervisor } = req.body;
  const updatedUser = await prisma.auditedUser.update({
    where: { id: req.params.id },
    data: { name, email, phone, department, position, supervisor },
  });
  res.json(updatedUser);
});

// @desc    Delete an audited user
// @route   DELETE /api/audited-users/:id
router.delete('/:id', async (req, res) => {
  await prisma.auditedUser.delete({
    where: { id: req.params.id },
  });
  res.json({ message: 'User deleted' });
});

export default router;