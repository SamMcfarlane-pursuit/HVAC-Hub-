import type { VercelRequest, VercelResponse } from '@vercel/node';

// Static data inline to avoid import issues with Vercel serverless functions
const jobs = [
    { id: "J101", clientName: "Empire State Prop", status: "In Progress", techId: "T001", timestamp: "10:30 AM" },
    { id: "J102", clientName: "Joe's Pizza", status: "En Route", techId: "T002", timestamp: "11:15 AM" },
    { id: "J103", clientName: "Res. Complex A", status: "Pending", timestamp: "12:00 PM" },
    { id: "J104", clientName: "Tech Startup HQ", status: "Pending", timestamp: "09:00 AM" },
    { id: "J105", clientName: "Brooklyn Hospital", status: "Pending", timestamp: "08:30 AM" }
];

const technicians = [
    { id: "T001", isAvailable: true },
    { id: "T002", isAvailable: true },
    { id: "T003", isAvailable: true },
    { id: "T004", isAvailable: false }
];

const parts = [
    { id: "P103", name: "TXV Valve R410A", stock: 2 },
    { id: "P111", name: "Universal Control Board", stock: 1 },
    { id: "P112", name: "Defrost Control Board", stock: 2 },
    { id: "P117", name: "R22 Refrigerant 30lb", stock: 1 }
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        if (req.method === 'GET') {
            const activeTechs = technicians.filter(t => t.isAvailable && jobs.some(j => j.techId === t.id && j.status !== 'Completed')).length;
            const totalTechs = technicians.length;
            const utilizationRate = (activeTechs / totalTechs) * 100;

            const lowStockCount = parts.filter(p => p.stock < 3).length;
            const unassignedJobsCount = jobs.filter(j => !j.techId && j.status !== 'Completed').length;

            const revenueMix = [
                { name: 'Jan', oneTime: 4000, recurring: 1200 },
                { name: 'Feb', oneTime: 3500, recurring: 1500 },
                { name: 'Mar', oneTime: 4200, recurring: 2100 },
                { name: 'Apr', oneTime: 4800, recurring: 2800 },
            ];

            const utilizationTrend = [
                { name: 'Mon', value: 75 },
                { name: 'Tue', value: 82 },
                { name: 'Wed', value: 88 },
                { name: 'Thu', value: 85 },
                { name: 'Fri', value: Math.round(utilizationRate) || 92 },
            ];

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
            ].slice(0, 6);

            return res.status(200).json({
                utilization: {
                    rate: utilizationRate.toFixed(1),
                    trend: utilizationTrend
                },
                margin: {
                    value: 48.2,
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
