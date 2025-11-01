import express from 'express';
import { prisma } from '../server.js';

const router = express.Router();

// @desc    Get all audits (for dashboard/history)
// @route   GET /api/audits
router.get('/', async (req, res) => {
  const { status, user, auditorId } = req.query;
  const where = {};

  if (status) where.status = status;
  if (user) where.auditedUserId = user;
  
  if (auditorId === 'me') {
    where.auditorId = req.auditor.id;
  } else if (auditorId) {
    where.auditorId = auditorId;
  }
  
  // --- This optimization is CORRECT and FAST ---
  // 1. Get all audits
  const audits = await prisma.audit.findMany({
    where,
    include: {
      auditedUser: { select: { name: true, department: true } },
      auditor: { select: { name: true } },
      _count: { select: { errors: true } }
    },
    orderBy: { startDate: 'desc' }
  });

  // 2. Get all error point sums in ONE query
  const auditIds = audits.map(a => a.id);
  const pointSums = await prisma.error.groupBy({
    by: ['auditId'],
    where: {
      auditId: { in: auditIds }
    },
    _sum: {
      points: true
    }
  });

  // 3. Create a simple map for fast lookups
  const pointsMap = pointSums.reduce((acc, curr) => {
    acc[curr.auditId] = curr._sum.points || 0;
    return acc;
  }, {});

  // 4. Combine the data in JavaScript
  const auditsWithPoints = audits.map(audit => ({
    ...audit,
    totalPoints: pointsMap[audit.id] || 0
  }));
  
  res.json(auditsWithPoints);
});

// @desc    Get 4 most recently audited users with their stats
// @route   GET /api/audits/recent-users
router.get('/recent-users', async (req, res) => {
    try {
        // --- THIS IS THE CORRECTED OPTIMIZATION ---

        // 1. Get the 4 most recently audited users
        const recentAudits = await prisma.audit.findMany({
            where: { status: 'completed' },
            orderBy: { completedDate: 'desc' },
            distinct: ['auditedUserId'],
            take: 4,
            select: { 
              auditedUserId: true, 
              completedDate: true, 
              auditedUser: { select: { name: true, department: true, id: true }} 
            }
        });

        const userIds = recentAudits.map(a => a.auditedUserId);

        // 2. Get total audit counts for ONLY those users in ONE query
        const userStats = await prisma.audit.groupBy({
          by: ['auditedUserId'],
          where: {
            auditedUserId: { in: userIds },
            status: 'completed'
          },
          _count: {
            _all: true, // This counts the number of audits
          },
        });
        
        // 3. Get error stats (This is the new, fixed part)
        // 3a. Get all completed audit IDs for these users
        const allUserAudits = await prisma.audit.findMany({
            where: {
                auditedUserId: { in: userIds },
                status: 'completed'
            },
            select: {
                id: true, // This is the auditId
                auditedUserId: true
            }
        });

        // 3b. Create a map of auditId -> auditedUserId
        const auditToUserMap = allUserAudits.reduce((acc, curr) => {
            acc[curr.id] = curr.auditedUserId;
            return acc;
        }, {});

        // 3c. Get error counts grouped by the valid 'auditId' field
        const auditErrorStats = await prisma.error.groupBy({
            by: ['auditId'], // <-- FIX: Group by a valid field
            where: {
                auditId: { in: allUserAudits.map(a => a.id) }
            },
            _count: {
                _all: true
            }
        });
        
        // 3d. Aggregate error counts per user (fast, in-memory)
        const errorCountMap = {};
        for (const stat of auditErrorStats) {
            const userId = auditToUserMap[stat.auditId]; // Find which user this audit belongs to
            if (!errorCountMap[userId]) {
                errorCountMap[userId] = 0;
            }
            errorCountMap[userId] += stat._count._all; // Add this audit's errors to the user's total
        }

        // 4. Create a map for the audit counts
        const auditCountMap = userStats.reduce((acc, curr) => {
          acc[curr.auditedUserId] = curr._count._all;
          return acc;
        }, {});
        
        // 5. Combine all the data
        const usersWithStats = recentAudits.map(audit => {
            const totalAudits = auditCountMap[audit.auditedUserId] || 0;
            const totalErrors = errorCountMap[audit.auditedUserId] || 0; // Use the new, correct map
            const avgErrors = totalAudits > 0 ? (totalErrors / totalAudits).toFixed(1) : 0;

            return {
                id: audit.auditedUser.id,
                name: audit.auditedUser.name,
                dept: audit.auditedUser.department,
                lastAudit: audit.completedDate,
                totalAudits: totalAudits,
                avgErrors: parseFloat(avgErrors)
            };
        });
        
        res.json(usersWithStats);
    } catch (err) {
        console.error("Failed to get recent users", err);
        res.status(500).json({ message: "Error fetching recent users" });
    }
});
// --- END OF ROUTE ---

// @desc    Start a new audit
// @route   POST /api/audits
router.post('/', async (req, res) => {
  const { auditedUserId } = req.body;
  const newAudit = await prisma.audit.create({
    data: {
      auditorId: req.auditor.id, // from 'protect' middleware
      auditedUserId: auditedUserId,
      status: 'in-progress'
    }
  });
  res.status(201).json(newAudit);
});

// @desc    Get a single audit (for the workspace)
// @route   GET /api/audits/:id
router.get('/:id', async (req, res) => {
  const audit = await prisma.audit.findUnique({
    where: { id: req.params.id },
    include: {
      errors: true, // Get all errors for this audit
      auditedUser: true
    }
  });
  if (!audit) {
    return res.status(4.04).json({ message: 'Audit not found' });
  }
  res.json(audit);
});

// @desc    Update an audit (e.g., set to 'completed' or 'reportSent')
// @route   PUT /api/audits/:id
router.put('/:id', async (req, res) => {
    const { status, reportSent } = req.body;
    const data = {};
    if (status) data.status = status;
    if (reportSent !== undefined) data.reportSent = reportSent;
    if (status === 'completed') data.completedDate = new Date();

    const updatedAudit = await prisma.audit.update({
        where: { id: req.params.id },
        data
    });
    res.json(updatedAudit);
});

// --- Error Management ---

// @desc    Add an error to an audit
// @route   POST /api/audits/:auditId/errors
router.post('/:auditId/errors', async (req, res) => {
  const { auditId } = req.params;
  // Get all error data from the body (from your App.jsx state)
  const errorData = req.body;
  
  const newError = await prisma.error.create({
    data: {
      auditId: auditId,
      ...errorData // Pass all fields from your form
    }
  });
  res.status(201).json(newError);
});

// @desc    Remove an error from an audit
// @route   DELETE /api/audits/errors/:errorId
router.delete('/errors/:errorId', async (req, res) => {
  const { errorId } = req.params;
  // TODO: Add check to ensure auditor owns this audit
  
  await prisma.error.delete({
    where: { id: errorId }
  });
  res.json({ message: 'Error removed' });
});


// @desc    Delete an audit (and all its errors)
// @route   DELETE /api/audits/:id
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    // We must delete all errors associated with the audit first
    await prisma.error.deleteMany({
      where: { auditId: id },
    });
    
    // --- FIX APPLIED HERE ---
    // Changed `delete` to `deleteMany` to prevent P2025 error
    // if the audit is already deleted (e.g., from a double-click)
    await prisma.audit.deleteMany({
      where: { id: id },
    });
    
    res.json({ message: 'Audit and all associated errors deleted' });
  } catch (err) {
    console.error(err);
    // This catch block is what's sending the "Failed to delete" message
    res.status(500).json({ message: "Error deleting audit" });
  }
});


export default router;