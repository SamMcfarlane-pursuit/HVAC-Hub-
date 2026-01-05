import type { VercelRequest, VercelResponse } from '@vercel/node';
import { jobs, parts, technicians } from './data/store';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        if (req.method === 'GET') {
            // Calculate dynamic metrics

            // 1. Utilization Rate (Active Techs / Total Techs)
            const activeTechs = technicians.filter(t => t.isAvailable && jobs.some(j => j.techId === t.id && j.status !== 'Completed')).length;
            const totalTechs = technicians.length;
            const utilizationRate = (activeTechs / totalTechs) * 100;

            // 2. Active Alerts (Low Stock + Unassigned Jobs)
            const lowStockCount = parts.filter(p => p.stock < 3).length;
            const unassignedJobsCount = jobs.filter(j => !j.techId && j.status !== 'Completed').length;

            // 3. Simple Mock Revenue (In a real app, this would sum invoice totals)
            // We'll keep the mix static for now as we don't have invoices in the store yet
            const revenueMix = [
                { name: 'Jan', oneTime: 4000, recurring: 1200 },
                { name: 'Feb', oneTime: 3500, recurring: 1500 },
                { name: 'Mar', oneTime: 4200, recurring: 2100 },
                { name: 'Apr', oneTime: 4800, recurring: 2800 },
            ];

            // 4. Tech Efficiency (Jobs per day - mocked trajectory based on current load)
            const utilizationTrend = [
                { name: 'Mon', value: 75 },
                { name: 'Tue', value: 82 },
                { name: 'Wed', value: 88 },
                { name: 'Thu', value: 85 },
                { name: 'Fri', value: Math.round(utilizationRate) || 92 }, // Use current calc for Friday
            ];

            // 5. Live Activity Feed (Synthesized from Store)
            const recentActivity = [
                ...jobs.slice(0, 3).map(j => ({
                    id: `job-${j.id}`,
                    type: 'job',
                    message: `Job #${j.id} at ${j.clientName} is ${j.status}`,
                    timestamp: j.timestamp,
                    status: j.status === 'Completed' ? 'success' : 'info'
                })),
                ...parts.filter(p => p.stock < 5).map(p => ({
                    id: `stock-${p.id}`,
                    type: 'alert',
                    message: `Low Stock Warning: ${p.name} (${p.stock} units remaining)`,
                    timestamp: 'Now',
                    status: p.stock < 3 ? 'critical' : 'warning'
                }))
            ].slice(0, 6); // Top 6 items

            return res.status(200).json({
                utilization: {
                    rate: utilizationRate.toFixed(1),
                    trend: utilizationTrend
                },
                margin: {
                    value: 48.2, // Static for now as we don't have cost analysis
                    targetMet: true
                },
                revenue: {
                    totalRecurring: 12450,
                    history: revenueMix
                },
                alerts: {
                    count: lowStockCount + unassignedJobsCount,
                    details: `${lowStockCount} Low Stock, ${unassignedJobsCount} Unassigned`
                },
                recentActivity
            });
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error('Analytics API Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
