import type { VercelRequest, VercelResponse } from '@vercel/node';
import { assets } from './data/store';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        if (req.method === 'GET') {
            return res.status(200).json(assets);
        }

        if (req.method === 'POST') {
            // List a new asset for rental
            const { name, category, dailyRate, location, ownerName, imageUrl } = req.body;

            if (!name || !dailyRate) {
                return res.status(400).json({ error: 'Name and daily rate are required' });
            }

            const newAsset = {
                id: `A${Date.now().toString(36).toUpperCase()}`,
                name,
                category: category || 'Equipment',
                dailyRate: Number(dailyRate),
                location: location || 'New York, NY',
                ownerId: `O${Date.now().toString(36).toUpperCase()}`,
                ownerName: ownerName || 'Unknown Owner',
                imageUrl: imageUrl || 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400',
                status: 'Available' as const,
                rating: 5.0
            };

            assets.push(newAsset);

            return res.status(201).json({
                success: true,
                asset: newAsset,
                message: 'Asset listed successfully'
            });
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
