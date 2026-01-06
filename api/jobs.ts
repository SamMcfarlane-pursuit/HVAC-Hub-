import type { VercelRequest, VercelResponse } from '@vercel/node';

// Inline data to avoid import issues in Vercel serverless
const jobs = [
    {
        id: "J101",
        clientId: "C501",
        clientName: "Empire State Prop",
        address: "350 5th Ave, NY",
        description: "Chiller 2 vibration alert",
        status: "In Progress",
        techId: "T001",
        timestamp: "10:30 AM",
        requiredSkillLevel: "Master",
        location: { lat: 40.7484, lng: -73.9857 },
        estimatedDuration: 4
    },
    {
        id: "J102",
        clientId: "C502",
        clientName: "Joe's Pizza",
        address: "145 W 4th St, NY",
        description: "Walk-in freezer warm",
        status: "En Route",
        techId: "T002",
        timestamp: "11:15 AM",
        requiredSkillLevel: "Journeyman",
        location: { lat: 40.7305, lng: -74.0021 },
        estimatedDuration: 2
    },
    {
        id: "J103",
        clientId: "C503",
        clientName: "Res. Complex A",
        address: "220 CPS, NY",
        description: "Seasonal Maintenance",
        status: "Pending",
        timestamp: "12:00 PM",
        requiredSkillLevel: "Apprentice",
        location: { lat: 40.7663, lng: -73.9774 },
        estimatedDuration: 1.5
    },
    {
        id: "J104",
        clientId: "C504",
        clientName: "Tech Startup HQ",
        address: "111 8th Ave, NY",
        description: "Server room AC failure",
        status: "Pending",
        timestamp: "09:00 AM",
        requiredSkillLevel: "Master",
        location: { lat: 40.7410, lng: -74.0025 },
        estimatedDuration: 3
    },
    {
        id: "J105",
        clientId: "C505",
        clientName: "Brooklyn Hospital",
        address: "121 Dekalb Ave, BK",
        description: "Negative pressure error",
        status: "Pending",
        timestamp: "08:30 AM",
        requiredSkillLevel: "Journeyman",
        location: { lat: 40.6905, lng: -73.9772 },
        estimatedDuration: 5
    }
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        if (req.method === 'GET') {
            return res.status(200).json(jobs);
        }

        if (req.method === 'POST') {
            const body = req.body;
            const newJob = {
                id: `J${Math.floor(Math.random() * 9000) + 1000}`,
                clientId: `C${Math.floor(Math.random() * 1000)}`,
                clientName: body.clientName || 'Unknown',
                address: body.address || 'TBD',
                description: body.description || '',
                status: 'Pending',
                // Keep timestamp if provided, else current time
                timestamp: body.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                requiredSkillLevel: body.requiredSkillLevel || 'Journeyman',
                location: body.location || { lat: 40.7128, lng: -74.0060 },
                estimatedDuration: body.estimatedDuration || 2
            };
            jobs.unshift(newJob);
            return res.status(201).json(newJob);
        }

        if (req.method === 'PUT') {
            const { id, ...updates } = req.body;
            const jobIndex = jobs.findIndex(j => j.id === id);

            if (jobIndex > -1) {
                jobs[jobIndex] = { ...jobs[jobIndex], ...updates };
                return res.status(200).json(jobs[jobIndex]);
            }
            return res.status(404).json({ error: 'Job not found' });
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error('Jobs API Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
