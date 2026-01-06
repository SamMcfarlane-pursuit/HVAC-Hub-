import type { VercelRequest, VercelResponse } from '@vercel/node';

// Inline data to avoid import issues in Vercel serverless
const technicians = [
    {
        id: "T001",
        name: "Alex Rivera",
        level: "Master",
        location: { lat: 40.7128, lng: -74.0060, label: "Lower Manhattan" },
        inventory: ["P101", "P102", "P115"],
        avatar: "https://picsum.photos/id/1005/50/50",
        isAvailable: true,
    },
    {
        id: "T002",
        name: "Sarah Chen",
        level: "Journeyman",
        location: { lat: 40.7484, lng: -73.9857, label: "Midtown" },
        inventory: ["P103", "P120"],
        avatar: "https://picsum.photos/id/1011/50/50",
        isAvailable: true,
    },
    {
        id: "T003",
        name: "Mike Kowalski",
        level: "Apprentice",
        location: { lat: 40.7831, lng: -73.9712, label: "Upper West Side" },
        inventory: ["P101", "P104", "P112"],
        avatar: "https://picsum.photos/id/1025/50/50",
        isAvailable: true,
    },
    {
        id: "T004",
        name: "David Kim",
        level: "Master",
        location: { lat: 40.6782, lng: -73.9442, label: "Brooklyn Hub" },
        inventory: ["P105", "P106", "P118"],
        avatar: "https://picsum.photos/id/1012/50/50",
        isAvailable: false,
    }
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

        if (req.method === 'PUT') {
            const { id, ...updates } = req.body;
            const techIndex = technicians.findIndex(t => t.id === id);

            if (techIndex > -1) {
                technicians[techIndex] = { ...technicians[techIndex], ...updates };
                return res.status(200).json(technicians[techIndex]);
            }
            return res.status(404).json({ error: 'Technician not found' });
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error('Technicians API Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
