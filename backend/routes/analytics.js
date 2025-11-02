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
            by: ['errorType'], 
            _count: { id: true },
        });

        const COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6', '#10b981', '#64748b'];
        
        const formattedData = categories.map((cat, index) => ({
            name: cat.errorType,
            value: cat._count.id,
            color: COLORS[index % COLORS.length]
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
        by: ['name'], 
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

// @desc    Get audited user ranking data (FOR ANALYTICS PAGE)
// @route   GET /api/analytics/audited-user-ranking
router.get('/audited-user-ranking', async (req, res) => {
    try {
        const users = await prisma.auditedUser.findMany({
            select: { id: true, name: true, email: true, department: true }
        });
        const userIds = users.map(u => u.id);

        const auditCounts = await prisma.audit.groupBy({
            by: ['auditedUserId'],
            where: {
                auditedUserId: { in: userIds },
                status: 'completed'
            },
            _count: { _all: true }
        });

        const completedAudits = await prisma.audit.findMany({
            where: {
                auditedUserId: { in: userIds },
                status: 'completed'
            },
            select: {
                id: true, 
                auditedUserId: true
            }
        });
        
        const completedAuditIds = completedAudits.map(a => a.id);
        const auditToUserMap = completedAudits.reduce((acc, curr) => {
            acc[curr.id] = curr.auditedUserId;
            return acc;
        }, {});

        const auditErrorStats = await prisma.error.groupBy({
            by: ['auditId'],
            where: {
                auditId: { in: completedAuditIds }
            },
            _count: { _all: true },
            _sum: { points: true }
        });

        const auditCountMap = auditCounts.reduce((acc, curr) => {
            acc[curr.auditedUserId] = curr._count._all;
            return acc;
        }, {});

        const errorStatMap = {};
        for (const stat of auditErrorStats) {
            const userId = auditToUserMap[stat.auditId];
            if (!errorStatMap[userId]) {
                errorStatMap[userId] = { count: 0, points: 0 };
            }
            errorStatMap[userId].count += stat._count._all;
            errorStatMap[userId].points += stat._sum.points || 0;
        }

        const performanceData = users.map(user => {
            const totalAudits = auditCountMap[user.id] || 0;
            const stats = errorStatMap[user.id] || { count: 0, points: 0 };
            const totalErrors = stats.count;

            return {
                id: user.id,
                name: user.name,
                email: user.email,
                department: user.department,
                totalAudits: totalAudits,
                totalErrors: totalErrors,
                totalPoints: stats.points,
            };
        })
        .sort((a, b) => b.totalPoints - a.totalPoints);
        
        res.json(performanceData);
    } catch (err) {
        console.error("Failed to get audited user ranking", err);
        res.status(500).json({ message: "Error fetching audited user ranking" });
    }
});


// @desc    Get user performance data (FOR USER MANAGEMENT PAGE)
// @route   GET /api/analytics/user-performance
router.get('/user-performance', async (req, res) => {
    try {
        const auditors = await prisma.auditor.findMany({
            select: { id: true, name: true, email: true, role: true }
        });
        const auditorIds = auditors.map(a => a.id);

        const auditCounts = await prisma.audit.groupBy({
            by: ['auditorId'],
            where: {
                auditorId: { in: auditorIds },
                status: 'completed'
            },
            _count: { _all: true }
        });

        const completedAudits = await prisma.audit.findMany({
            where: {
                auditorId: { in: auditorIds },
                status: 'completed'
            },
            select: {
                id: true, 
                auditorId: true
            }
        });
        
        const completedAuditIds = completedAudits.map(a => a.id);

        const auditToAuditorMap = completedAudits.reduce((acc, curr) => {
            acc[curr.id] = curr.auditorId;
            return acc;
        }, {});

        const auditErrorStats = await prisma.error.groupBy({
            by: ['auditId'], 
            where: {
                auditId: { in: completedAuditIds }
            },
            _count: { _all: true },
            _sum: { points: true }
        });

        const auditCountMap = auditCounts.reduce((acc, curr) => {
            acc[curr.auditorId] = curr._count._all;
            return acc;
        }, {});

        const errorStatMap = {};
        for (const stat of auditErrorStats) {
            const auditorId = auditToAuditorMap[stat.auditId]; 
            if (!errorStatMap[auditorId]) {
                errorStatMap[auditorId] = { count: 0, points: 0 };
            }
            errorStatMap[auditorId].count += stat._count._all;
            errorStatMap[auditorId].points += stat._sum.points || 0;
        }

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
                improvement: 0 
            };
        });
        
        res.json(performanceData);
    } catch (err) {
        console.error("Failed to get user performance", err); 
        res.status(500).json({ message: "Error fetching user performance" });
    }
});

export default router;