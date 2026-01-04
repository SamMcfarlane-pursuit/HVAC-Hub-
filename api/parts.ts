import type { VercelRequest, VercelResponse } from '@vercel/node';

// Inline data - no external imports
const parts = [
    { id: "P101", name: "Run Capacitor 35+5", sku: "CAP-355-UNIV", category: "Electrical", price: 15.00, stock: 12, locationType: "Warehouse", locationName: "Queens Hub", distance: "4.2 mi" },
    { id: "P102", name: "Contactor 2-Pole 30A", sku: "CTR-2P30", category: "Electrical", price: 22.50, stock: 4, locationType: "Van", locationName: "T001 (Alex)", distance: "0.8 mi" },
    { id: "P103", name: "TXV Valve R410A", sku: "TXV-410-2T", category: "Refrigerant", price: 85.00, stock: 2, locationType: "Retailer", locationName: "United Ref. Brooklyn", distance: "2.1 mi" },
    { id: "P104", name: "Fan Motor 1/3 HP", sku: "MTR-13-825", category: "Motors", price: 145.00, stock: 1, locationType: "Van", locationName: "T003 (Mike)", distance: "1.5 mi" },
    { id: "P105", name: "Thermostat C-Wire Adapter", sku: "THERM-CW-01", category: "Controls", price: 35.00, stock: 8, locationType: "Warehouse", locationName: "Queens Hub", distance: "4.2 mi" },
    { id: "P106", name: "R410A Refrigerant 25lb", sku: "REF-410-25", category: "Refrigerant", price: 275.00, stock: 3, locationType: "Warehouse", locationName: "Queens Hub", distance: "4.2 mi" },
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        if (req.method === 'GET') {
            return res.status(200).json(parts);
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error('Parts API Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
