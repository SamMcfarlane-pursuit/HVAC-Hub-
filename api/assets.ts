import type { VercelRequest, VercelResponse } from '@vercel/node';
import { assets } from './data/store';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        if (req.method === 'GET') {
            return res.status(200).json(assets);
        }

        if (req.method === 'PUT') {
            const { id, status } = req.body;
            const assetIndex = assets.findIndex(a => a.id === id);

            if (assetIndex > -1) {
                if (status) assets[assetIndex].status = status;
                return res.status(200).json(assets[assetIndex]);
            }
            return res.status(404).json({ error: 'Asset not found' });
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error('Assets API Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
