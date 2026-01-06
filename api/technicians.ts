import type { VercelRequest, VercelResponse } from '@vercel/node';

import { technicians } from './data/store';

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
