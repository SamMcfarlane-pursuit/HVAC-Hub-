import type { VercelRequest, VercelResponse } from '@vercel/node';

// Inline data to avoid import issues in Vercel serverless
const parts = [
    // Electrical
    { id: "P101", name: "Run Capacitor 35+5", sku: "CAP-355-UNIV", category: "Electrical", price: 15.00, stock: 12, locationType: "Warehouse", locationName: "Queens Hub", distance: "4.2 mi" },
    { id: "P102", name: "Contactor 2-Pole 30A", sku: "CTR-2P30", category: "Electrical", price: 22.50, stock: 4, locationType: "Van", locationName: "T001 (Alex)", distance: "0.8 mi" },
    { id: "P104", name: "Transformer 40VA", sku: "TRF-40VA-MULTI", category: "Electrical", price: 18.00, stock: 15, locationType: "Warehouse", locationName: "Queens Hub", distance: "4.2 mi" },
    { id: "P105", name: "Thermostat C-Wire Adapter", sku: "THERM-CW-01", category: "Controls", price: 35.00, stock: 8, locationType: "Warehouse", locationName: "Queens Hub", distance: "4.2 mi" },
    { id: "P112", name: "Defrost Control Board", sku: "PCB-DEF-UNIV", category: "Electrical", price: 85.00, stock: 2, locationType: "Retailer", locationName: "SupplyCorp BX", distance: "8.5 mi" },
    // Refrigerants & Chemicals
    { id: "P103", name: "TXV Valve R410A", sku: "TXV-410-2T", category: "Refrigerant", price: 85.00, stock: 2, locationType: "Retailer", locationName: "United Ref. Brooklyn", distance: "2.1 mi" },
    { id: "P106", name: "R410A Refrigerant 25lb", sku: "REF-410-25", category: "Refrigerant", price: 350.00, stock: 3, locationType: "Warehouse", locationName: "Queens Hub", distance: "4.2 mi" },
    { id: "P115", name: "Leak Stop (Injectable)", sku: "CHEM-LK-STP", category: "Chemicals", price: 45.00, stock: 20, locationType: "Van", locationName: "T001 (Alex)", distance: "0.8 mi" },
    { id: "P116", name: "Coil Cleaner (Foaming)", sku: "CHEM-CL-FOAM", category: "Chemicals", price: 12.00, stock: 4, locationType: "Warehouse", locationName: "Queens Hub", distance: "4.2 mi" },
    { id: "P117", name: "R22 Refrigerant 30lb", sku: "REF-22-LEGACY", category: "Refrigerant", price: 850.00, stock: 1, locationType: "Warehouse", locationName: "Queens Hub", distance: "4.2 mi" },
    // Motors & Mechanical
    { id: "P108", name: "Fan Motor 1/3 HP", sku: "MTR-13-825", category: "Motors", price: 145.00, stock: 1, locationType: "Van", locationName: "T003 (Mike)", distance: "1.5 mi" },
    { id: "P109", name: "Condenser Fan Blade 22\"", sku: "FAN-BLD-22", category: "Mechanical", price: 55.00, stock: 6, locationType: "Warehouse", locationName: "Queens Hub", distance: "4.2 mi" },
    { id: "P110", name: "Blower Wheel 10x10", sku: "BLW-WHL-1010", category: "Mechanical", price: 65.00, stock: 0, locationType: "Retailer", locationName: "United Ref. Brooklyn", distance: "2.1 mi" },
    // Electronics & Boards
    { id: "P111", name: "Universal Control Board", sku: "PCB-UNI-X", category: "Electronics", price: 120.00, stock: 1, locationType: "Warehouse", locationName: "Queens Hub", distance: "4.2 mi" },
    { id: "P113", name: "Ignition Control Module", sku: "IGN-MOD-77", category: "Electronics", price: 180.00, stock: 3, locationType: "Warehouse", locationName: "Queens Hub", distance: "4.2 mi" },
    { id: "P114", name: "Flame Sensor", sku: "SEN-FLM-01", category: "Electronics", price: 12.00, stock: 25, locationType: "Van", locationName: "T002 (Sarah)", distance: "1.2 mi" },
    // Tools & Misc
    { id: "P118", name: "Filter Drier 3/8", sku: "FLT-DRI-38", category: "Refrigerant", price: 18.00, stock: 8, locationType: "Warehouse", locationName: "Queens Hub", distance: "4.2 mi" },
    { id: "P119", name: "Schrader Valve Cores (10pk)", sku: "VLV-CORE-10", category: "Misc", price: 5.00, stock: 50, locationType: "Van", locationName: "T004 (David)", distance: "3.5 mi" },
    { id: "P120", name: "PVC Trap 3/4\"", sku: "PVC-TRP-34", category: "Plumbing", price: 8.00, stock: 11, locationType: "Van", locationName: "T002 (Sarah)", distance: "1.2 mi" },
];

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
