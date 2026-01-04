import type { VercelRequest, VercelResponse } from '@vercel/node';
import { store } from './data/store';

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
                // Get all parts
                const parts = store.getParts();
                return res.status(200).json(parts);
            }

            case 'PUT': {
                // Update part stock
                const { id, stockChange } = req.body;

                if (!id || stockChange === undefined) {
                    return res.status(400).json({ error: 'Part ID and stockChange are required' });
                }

                const updatedPart = store.updatePartStock(id, stockChange);

                if (!updatedPart) {
                    return res.status(404).json({ error: 'Part not found' });
                }

                return res.status(200).json(updatedPart);
            }

            default:
                return res.status(405).json({ error: 'Method not allowed' });
        }
    } catch (error) {
        console.error('Parts API Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
