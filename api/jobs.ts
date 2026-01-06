import type { VercelRequest, VercelResponse } from '@vercel/node';

import { jobs } from './data/store';

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
