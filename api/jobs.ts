import type { VercelRequest, VercelResponse } from '@vercel/node';

// Inline data store - no external module imports
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
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                requiredSkillLevel: body.requiredSkillLevel || 'Journeyman',
                location: body.location || { lat: 40.7128, lng: -74.0060 },
                estimatedDuration: body.estimatedDuration || 2
            };
            jobs.unshift(newJob);
            return res.status(201).json(newJob);
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error('Jobs API Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
