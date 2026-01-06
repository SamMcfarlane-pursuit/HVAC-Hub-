import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Fallback data
const fallbackTechnicians = [
    { id: "T001", name: "Alex Rivera", level: "Master", location: { lat: 40.7128, lng: -74.0060, label: "Lower Manhattan" }, inventory: ["P101", "P102", "P115"], avatar: "https://picsum.photos/id/1005/50/50", isAvailable: true },
    { id: "T002", name: "Sarah Chen", level: "Journeyman", location: { lat: 40.7484, lng: -73.9857, label: "Midtown" }, inventory: ["P103", "P120"], avatar: "https://picsum.photos/id/1011/50/50", isAvailable: true },
    { id: "T003", name: "Mike Kowalski", level: "Apprentice", location: { lat: 40.7831, lng: -73.9712, label: "Upper West Side" }, inventory: ["P101", "P104", "P112"], avatar: "https://picsum.photos/id/1025/50/50", isAvailable: true },
    { id: "T004", name: "David Kim", level: "Master", location: { lat: 40.6782, lng: -73.9442, label: "Brooklyn Hub" }, inventory: ["P105", "P106", "P118"], avatar: "https://picsum.photos/id/1012/50/50", isAvailable: false }
];

function dbToFrontend(row: any) {
    return {
        id: row.id,
        name: row.name,
        level: row.level,
        location: { lat: row.location_lat || 0, lng: row.location_lng || 0, label: row.location_label || '' },
        inventory: row.inventory || [],
        avatar: row.avatar || '',
        isAvailable: row.is_available
    };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const useDatabase = supabaseUrl && supabaseAnonKey;

    try {
        if (req.method === 'GET') {
            if (!useDatabase) {
                return res.status(200).json(fallbackTechnicians);
            }

            const { data, error } = await supabase.from('technicians').select('*');
            if (error) throw error;

            return res.status(200).json(data.map(dbToFrontend));
        }

        if (req.method === 'PUT') {
            const { id, ...updates } = req.body;

            if (!useDatabase) {
                const techIndex = fallbackTechnicians.findIndex(t => t.id === id);
                if (techIndex > -1) {
                    fallbackTechnicians[techIndex] = { ...fallbackTechnicians[techIndex], ...updates };
                    return res.status(200).json(fallbackTechnicians[techIndex]);
                }
                return res.status(404).json({ error: 'Technician not found' });
            }

            const dbUpdates: any = {};
            if (updates.isAvailable !== undefined) dbUpdates.is_available = updates.isAvailable;
            if (updates.location) {
                dbUpdates.location_lat = updates.location.lat;
                dbUpdates.location_lng = updates.location.lng;
                if (updates.location.label) dbUpdates.location_label = updates.location.label;
            }

            const { data, error } = await supabase.from('technicians').update(dbUpdates).eq('id', id).select().single();
            if (error) throw error;

            return res.status(200).json(dbToFrontend(data));
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error('Technicians API Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
