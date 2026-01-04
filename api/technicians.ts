import type { VercelRequest, VercelResponse } from '@vercel/node';

// Inline data - no external imports
const technicians = [
    {
        id: "T001",
        name: "Alex Rivera",
        level: "Master",
        location: { lat: 40.7128, lng: -74.0060, label: "Lower Manhattan" },
        inventory: ["P101", "P102"],
        avatar: "https://picsum.photos/id/1005/50/50",
        isAvailable: true,
    },
    {
        id: "T002",
        name: "Sarah Chen",
        level: "Journeyman",
        location: { lat: 40.7484, lng: -73.9857, label: "Midtown" },
        inventory: ["P103"],
        avatar: "https://picsum.photos/id/1011/50/50",
        isAvailable: true,
    },
    {
        id: "T003",
        name: "Mike Kowalski",
        level: "Apprentice",
        location: { lat: 40.7831, lng: -73.9712, label: "Upper West Side" },
        inventory: ["P101", "P104"],
        avatar: "https://picsum.photos/id/1025/50/50",
        isAvailable: true,
    },
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        if (req.method === 'GET') {
            return res.status(200).json(technicians);
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error('Technicians API Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
