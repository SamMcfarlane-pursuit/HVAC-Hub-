import type { VercelRequest, VercelResponse } from '@vercel/node';
import { store, Technician } from './data/store';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        switch (req.method) {
            case 'GET': {
                // Get all technicians
                const technicians = store.getTechnicians();
                return res.status(200).json(technicians);
            }

            case 'PUT': {
                // Update technician
                const { id, ...updates } = req.body;

                if (!id) {
                    return res.status(400).json({ error: 'Technician ID is required' });
                }

                const updatedTech = store.updateTechnician(id, updates);

                if (!updatedTech) {
                    return res.status(404).json({ error: 'Technician not found' });
                }

                return res.status(200).json(updatedTech);
            }

            default:
                return res.status(405).json({ error: 'Method not allowed' });
        }
    } catch (error) {
        console.error('Technicians API Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
