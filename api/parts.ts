import type { VercelRequest, VercelResponse } from '@vercel/node';

import { parts } from './data/store';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        if (req.method === 'GET') {
            return res.status(200).json(parts);
        }

        if (req.method === 'POST') {
            const { id, quantity } = req.body;

            if (!id || !quantity) {
                return res.status(400).json({ error: 'Missing part ID or quantity' });
            }

            const partIndex = parts.findIndex(p => p.id === id);
            if (partIndex > -1) {
                // Update stock in shared store
                parts[partIndex].stock += quantity;
                return res.status(200).json({
                    success: true,
                    message: 'Stock updated',
                    updatedPart: parts[partIndex]
                });
            }
            return res.status(404).json({ error: 'Part not found' });
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error('Parts API Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
