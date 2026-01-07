import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabase: SupabaseClient | null = null;

function getSupabase(): SupabaseClient | null {
    if (supabase) return supabase;
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_ANON_KEY;
    if (url && key) {
        supabase = createClient(url, key);
        return supabase;
    }
    return null;
}

const fallbackParts = [
    { id: "P101", name: "Run Capacitor 35+5", sku: "CAP-355-UNIV", category: "Electrical", price: 15.00, stock: 12, locationType: "Warehouse", locationName: "Queens Hub", distance: "4.2 mi" },
    { id: "P102", name: "Contactor 2-Pole 30A", sku: "CTR-2P30", category: "Electrical", price: 22.50, stock: 4, locationType: "Van", locationName: "T001 (Alex)", distance: "0.8 mi" },
    { id: "P103", name: "TXV Valve R410A", sku: "TXV-410-2T", category: "Refrigerant", price: 85.00, stock: 2, locationType: "Retailer", locationName: "United Ref. Brooklyn", distance: "2.1 mi" },
    { id: "P104", name: "Transformer 40VA", sku: "TRF-40VA-MULTI", category: "Electrical", price: 18.00, stock: 15, locationType: "Warehouse", locationName: "Queens Hub", distance: "4.2 mi" },
    { id: "P105", name: "Thermostat C-Wire Adapter", sku: "THERM-CW-01", category: "Controls", price: 35.00, stock: 8, locationType: "Warehouse", locationName: "Queens Hub", distance: "4.2 mi" },
    { id: "P106", name: "R410A Refrigerant 25lb", sku: "REF-410-25", category: "Refrigerant", price: 350.00, stock: 3, locationType: "Warehouse", locationName: "Queens Hub", distance: "4.2 mi" },
    { id: "P108", name: "Fan Motor 1/3 HP", sku: "MTR-13-825", category: "Motors", price: 145.00, stock: 1, locationType: "Van", locationName: "T003 (Mike)", distance: "1.5 mi" },
    { id: "P109", name: "Condenser Fan Blade 22\"", sku: "FAN-BLD-22", category: "Mechanical", price: 55.00, stock: 6, locationType: "Warehouse", locationName: "Queens Hub", distance: "4.2 mi" },
    { id: "P110", name: "Blower Wheel 10x10", sku: "BLW-WHL-1010", category: "Mechanical", price: 65.00, stock: 0, locationType: "Retailer", locationName: "United Ref. Brooklyn", distance: "2.1 mi" },
    { id: "P111", name: "Universal Control Board", sku: "PCB-UNI-X", category: "Electronics", price: 120.00, stock: 1, locationType: "Warehouse", locationName: "Queens Hub", distance: "4.2 mi" }
];

function dbToFrontend(row: any) {
    return {
        id: row.id,
        name: row.name,
        sku: row.sku,
        category: row.category,
        price: row.price,
        stock: row.stock,
        locationType: row.location_type || '',
        locationName: row.location_name || '',
        distance: row.distance || ''
    };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const db = getSupabase();

    try {
        if (req.method === 'GET') {
            if (!db) {
                return res.status(200).json(fallbackParts);
            }

            const { data, error } = await db.from('parts').select('*');
            if (error) throw error;

            return res.status(200).json(data.map(dbToFrontend));
        }

        if (req.method === 'POST') {
            const { id, quantity } = req.body;

            if (!id || !quantity) {
                return res.status(400).json({ error: 'Missing part ID or quantity' });
            }

            if (!db) {
                const partIndex = fallbackParts.findIndex(p => p.id === id);
                if (partIndex > -1) {
                    fallbackParts[partIndex].stock += quantity;
                    return res.status(200).json({ success: true, message: 'Stock updated', updatedPart: fallbackParts[partIndex] });
                }
                return res.status(404).json({ error: 'Part not found' });
            }

            const { data: part, error: fetchError } = await db.from('parts').select('stock').eq('id', id).single();
            if (fetchError) throw fetchError;

            const newStock = (part.stock || 0) + quantity;
            const { data, error } = await db.from('parts').update({ stock: newStock }).eq('id', id).select().single();
            if (error) throw error;

            return res.status(200).json({ success: true, message: 'Stock updated', updatedPart: dbToFrontend(data) });
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error('Parts API Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
