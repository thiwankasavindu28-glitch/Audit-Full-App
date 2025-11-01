import express from 'express';
import { prisma } from '../server.js';

const router = express.Router();

// @desc    Get key metrics
// @route   GET /api/analytics/stats
router.get('/stats', async (req, res) => {
    const totalErrors = await prisma.error.count();
    const totalCompletedAudits = await prisma.audit.count({ where: { status: 'completed' } });
    const totalActiveAudits = await prisma.audit.count({ where: { status: 'in-progress' } });
    const totalPoints = await prisma.error.aggregate({ _sum: { points: true } });
    const totalAuditors = await prisma.auditor.count();

    res.json({
        totalErrors,
        totalCompletedAudits,
        totalActiveAudits,
        totalPoints: totalPoints._sum.points || 0,
        avgErrorRate: totalCompletedAudits > 0 ? (totalErrors / totalCompletedAudits).toFixed(1) : 0,
        totalAuditorsActive: totalAuditors
    });
});

// @desc    Get error trend data (last 30 days)
// @route   GET /api/analytics/error-trend
router.get('/error-trend', async (req, res) => {
    try {
        const errorsByDay = await prisma.error.groupBy({
            by: ['processedDate'],
            _count: { id: true },
            where: {
                processedDate: {
                    gte: new Date(new Date().setDate(new Date().getDate() - 30)), // Last 30 days
                },
            },
            orderBy: { processedDate: 'asc' },
        });
        
        // Format for the chart
        const formattedData = errorsByDay.map(day => ({
            month: new Date(day.processedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            errors: day._count.id,
        }));
        
        res.json(formattedData);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error fetching trend data" });
    }
});

// @desc    Get error category distribution
// @route   GET /api/analytics/category-distribution
router.get('/category-distribution', async (req, res) => {
    try {
        const categories = await prisma.error.groupBy({
            by: ['errorType'], // Group by "General Errors", "Work Errors", etc.
            _count: { id: true },
        });

        // Colors for the pie chart
        const COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6', '#10b981', '#64748b'];
        
        const formattedData = categories.map((cat, index) => ({
            name: cat.errorType,
            value: cat._count.id,
            color: COLORS[index % COLORS.length] // Assign a color
        }));
        
        res.json(formattedData);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error fetching category data" });
    }
});

// @desc    Get top 5 errors
// @route   GET /api/analytics/top-errors
router.get('/top-errors', async (req, res) => {
    const topErrors = await prisma.error.groupBy({
        by: ['name'], // Group by "Incorrect Writer", "Airdate Error", etc.
        _count: { id: true },
        _sum: { points: true },
        orderBy: { _count: { id: 'desc' } },
        take: 5
    });
    
    const formattedErrors = topErrors.map(e => ({
        error: e.name,
        count: e._count.id,
        points: e._sum.points
    }));
    
    res.json(formattedErrors);
});

// @desc    Get user performance data
// @route   GET /api/analytics/user-performance
router.get('/user-performance', async (req, res) => {
    try {
        // --- THIS IS THE CORRECTED OPTIMIZATION ---

        // 1. Get all auditors (This is fast)
        const auditors = await prisma.auditor.findMany({
            select: { id: true, name: true, email: true, role: true }
        });
        const auditorIds = auditors.map(a => a.id);

        // 2. Get all audit counts in ONE query
        const auditCounts = await prisma.audit.groupBy({
            by: ['auditorId'],
            where: {
                auditorId: { in: auditorIds },
                status: 'completed'
            },
            _count: { _all: true }
        });

        // 3. Get all error/point stats (This is the new, fixed part)
        
        // 3a. Get all *completed* audit IDs and their corresponding auditorId
        const completedAudits = await prisma.audit.findMany({
            where: {
                auditorId: { in: auditorIds },
                status: 'completed'
            },
            select: {
                id: true, // This is the auditId
                auditorId: true
            }
        });
        
        const completedAuditIds = completedAudits.map(a => a.id);

        // 3b. Create a map of { auditId -> auditorId }
        const auditToAuditorMap = completedAudits.reduce((acc, curr) => {
            acc[curr.id] = curr.auditorId;
            return acc;
        }, {});

        // 3c. Get error counts grouped by the valid 'auditId' field
        const auditErrorStats = await prisma.error.groupBy({
            by: ['auditId'], // <-- FIX: Group by a valid field
            where: {
                auditId: { in: completedAuditIds }
            },
            _count: { _all: true },
            _sum: { points: true }
        });

        // 4. Create maps for fast lookups

        // 4a. Map for total audits per auditor
        const auditCountMap = auditCounts.reduce((acc, curr) => {
            acc[curr.auditorId] = curr._count._all;
            return acc;
        }, {});

        // 4b. Map for aggregated error stats per *auditor*
        const errorStatMap = {};
        for (const stat of auditErrorStats) {
            const auditorId = auditToAuditorMap[stat.auditId]; // Find which auditor this audit belongs to
            if (!errorStatMap[auditorId]) {
                errorStatMap[auditorId] = { count: 0, points: 0 };
            }
            errorStatMap[auditorId].count += stat._count._all;
            errorStatMap[auditorId].points += stat._sum.points || 0;
        }

        // 5. Combine the data in JavaScript (very fast)
        const performanceData = auditors.map(auditor => {
            const totalAudits = auditCountMap[auditor.id] || 0;
            const stats = errorStatMap[auditor.id] || { count: 0, points: 0 };
            const totalErrors = stats.count;
            const avgErrorRate = totalAudits > 0 ? (totalErrors / totalAudits).toFixed(1) : 0;

            return {
                id: auditor.id,
                name: auditor.name,
                email: auditor.email,
                role: auditor.role,
                audits: totalAudits,
                errors: totalErrors,
                points: stats.points,
                avgErrorRate: parseFloat(avgErrorRate),
                improvement: 0 // Mock trend
            };
        });
        
        res.json(performanceData);
    } catch (err) {
        console.error("Failed to get user performance", err); // Give a more specific error
        res.status(500).json({ message: "Error fetching user performance" });
    }
});

export default router;