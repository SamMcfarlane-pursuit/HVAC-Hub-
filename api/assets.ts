import type { VercelRequest, VercelResponse } from '@vercel/node';

// Inline data to avoid import issues in Vercel serverless
const assets: Array<{
    id: string;
    name: string;
    category: string;
    dailyRate: number;
    ownerId: string;
    ownerName: string;
    status: "Available" | "Rented";
    imageUrl: string;
    location: string;
    rating?: number;
}> = [
        {
            id: "A001",
            name: "FLIR Thermal Camera E8",
            category: "Diagnostics",
            dailyRate: 45,
            ownerId: "C902",
            ownerName: "Mike's HVAC",
            status: "Available",
            imageUrl: "https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&q=80&w=400",
            location: "Brooklyn Navy Yard"
        },
        {
            id: "A002",
            name: "Refrigerant Recovery Machine",
            category: "Heavy Equipment",
            dailyRate: 85,
            ownerId: "C501",
            ownerName: "Empire Mechanical",
            status: "Available",
            imageUrl: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&q=80&w=400",
            location: "Long Island City"
        },
        {
            id: "A003",
            name: "Hydro-Jetting Rig Used",
            category: "Plumbing",
            dailyRate: 150,
            ownerId: "C888",
            ownerName: "City Services Corp",
            status: "Rented",
            imageUrl: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=400",
            location: "Jersey City"
        },
        {
            id: "A004",
            name: "Scissor Lift 19ft",
            category: "Access",
            dailyRate: 120,
            ownerId: "C101",
            ownerName: "Premier Heights",
            status: "Available",
            imageUrl: "https://images.unsplash.com/photo-1588636224151-f40884df00e9?auto=format&fit=crop&q=80&w=400",
            location: "Midtown West"
        },
        {
            id: "A005",
            name: "Digital Manifold Gauge",
            category: "Diagnostics",
            dailyRate: 25,
            ownerId: "C902",
            ownerName: "Mike's HVAC",
            status: "Available",
            imageUrl: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=400",
            location: "Brooklyn Navy Yard"
        },
        {
            id: "A006",
            name: "Vacuum Pump 8CFM",
            category: "Heavy Equipment",
            dailyRate: 40,
            ownerId: "C501",
            ownerName: "Empire Mechanical",
            status: "Available",
            imageUrl: "https://plus.unsplash.com/premium_photo-1664303847960-586318f59035?auto=format&fit=crop&q=80&w=400",
            location: "Long Island City"
        },
        {
            id: "A007",
            name: "Combustion Analyzer",
            category: "Diagnostics",
            dailyRate: 55,
            ownerId: "C888",
            ownerName: "City Services Corp",
            status: "Available",
            imageUrl: "https://images.unsplash.com/photo-1581092334651-ddf26d9a09d0?auto=format&fit=crop&q=80&w=400",
            location: "Jersey City"
        },
        {
            id: "A008",
            name: "Pipe Press Tool",
            category: "Plumbing",
            dailyRate: 65,
            ownerId: "C101",
            ownerName: "Premier Heights",
            status: "Rented",
            imageUrl: "https://images.unsplash.com/photo-1542013936693-884638332954?auto=format&fit=crop&q=80&w=400",
            location: "Midtown West"
        },
        {
            id: "A009",
            name: "Portable AC 5 Ton",
            category: "Temporary Cooling",
            dailyRate: 200,
            ownerId: "C501",
            ownerName: "Empire Mechanical",
            status: "Available",
            imageUrl: "https://images.unsplash.com/photo-1632053002228-e4d0d04c3527?auto=format&fit=crop&q=80&w=400",
            location: "Queens Warehouse"
        }
    ];

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
