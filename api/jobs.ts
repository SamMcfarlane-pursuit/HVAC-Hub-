import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Lazy Supabase client initialization
let supabase: SupabaseClient | null = null;

function getSupabase(): SupabaseClient | null {
    if (supabase) return supabase;

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseAnonKey) {
        supabase = createClient(supabaseUrl, supabaseAnonKey);
        return supabase;
    }
    return null;
}

// Fallback data if database not configured
const fallbackJobs = [
    { id: "J101", clientId: "C501", clientName: "Empire State Prop", address: "350 5th Ave, NY", description: "Chiller 2 vibration alert", status: "In Progress", techId: "T001", timestamp: "10:30 AM", requiredSkillLevel: "Master", location: { lat: 40.7484, lng: -73.9857 }, estimatedDuration: 4 },
    { id: "J102", clientId: "C502", clientName: "Joe's Pizza", address: "145 W 4th St, NY", description: "Walk-in freezer warm", status: "En Route", techId: "T002", timestamp: "11:15 AM", requiredSkillLevel: "Journeyman", location: { lat: 40.7305, lng: -74.0021 }, estimatedDuration: 2 },
    { id: "J103", clientId: "C503", clientName: "Res. Complex A", address: "220 CPS, NY", description: "Seasonal Maintenance", status: "Pending", timestamp: "12:00 PM", requiredSkillLevel: "Apprentice", location: { lat: 40.7663, lng: -73.9774 }, estimatedDuration: 1.5 },
    { id: "J104", clientId: "C504", clientName: "Tech Startup HQ", address: "111 8th Ave, NY", description: "Server room AC failure", status: "Pending", timestamp: "09:00 AM", requiredSkillLevel: "Master", location: { lat: 40.7410, lng: -74.0025 }, estimatedDuration: 3 },
    { id: "J105", clientId: "C505", clientName: "Brooklyn Hospital", address: "121 Dekalb Ave, BK", description: "Negative pressure error", status: "Pending", timestamp: "08:30 AM", requiredSkillLevel: "Journeyman", location: { lat: 40.6905, lng: -73.9772 }, estimatedDuration: 5 }
];

// Convert DB row to frontend format
function dbToFrontend(row: any) {
    return {
        id: row.id,
        clientId: row.client_id,
        clientName: row.client_name,
        address: row.address,
        description: row.description || '',
        status: row.status,
        techId: row.tech_id,
        timestamp: row.timestamp,
        requiredSkillLevel: row.required_skill_level,
        location: { lat: row.location_lat || 0, lng: row.location_lng || 0 },
        estimatedDuration: row.estimated_duration || 0
    };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const db = getSupabase();

    try {
        if (req.method === 'GET') {
            if (!db) {
                return res.status(200).json(fallbackJobs);
            }

            const { data, error } = await db.from('jobs').select('*').order('created_at', { ascending: false });
            if (error) throw error;

            return res.status(200).json(data.map(dbToFrontend));
        }

        if (req.method === 'POST') {
            const body = req.body;
            const newJob = {
                id: `J${Math.floor(Math.random() * 9000) + 1000}`,
                client_id: body.clientId || `C${Math.floor(Math.random() * 1000)}`,
                client_name: body.clientName || 'Unknown',
                address: body.address || 'TBD',
                description: body.description || '',
                status: 'Pending',
                timestamp: body.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                required_skill_level: body.requiredSkillLevel || 'Journeyman',
                location_lat: body.location?.lat || 40.7128,
                location_lng: body.location?.lng || -74.0060,
                estimated_duration: body.estimatedDuration || 2
            };

            if (!db) {
                const frontendJob = dbToFrontend(newJob);
                fallbackJobs.unshift(frontendJob);
                return res.status(201).json(frontendJob);
            }

            const { data, error } = await db.from('jobs').insert(newJob).select().single();
            if (error) throw error;

            return res.status(201).json(dbToFrontend(data));
        }

        if (req.method === 'PUT') {
            const { id, ...updates } = req.body;

            if (!db) {
                const jobIndex = fallbackJobs.findIndex(j => j.id === id);
                if (jobIndex > -1) {
                    fallbackJobs[jobIndex] = { ...fallbackJobs[jobIndex], ...updates };
                    return res.status(200).json(fallbackJobs[jobIndex]);
                }
                return res.status(404).json({ error: 'Job not found' });
            }

            const dbUpdates: any = {};
            if (updates.status) dbUpdates.status = updates.status;
            if (updates.techId) dbUpdates.tech_id = updates.techId;
            if (updates.description) dbUpdates.description = updates.description;

            const { data, error } = await db.from('jobs').update(dbUpdates).eq('id', id).select().single();
            if (error) throw error;

            return res.status(200).json(dbToFrontend(data));
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error('Jobs API Error:', error);
        return res.status(500).json({ error: 'Internal server error', details: String(error) });
    }
}
