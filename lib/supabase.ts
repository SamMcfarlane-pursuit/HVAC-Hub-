import { createClient } from '@supabase/supabase-js';

// Database type definitions
export interface Job {
    id: string;
    client_id: string;
    client_name: string;
    address: string;
    description: string | null;
    status: string;
    tech_id: string | null;
    timestamp: string;
    required_skill_level: string;
    location_lat: number | null;
    location_lng: number | null;
    estimated_duration: number | null;
    created_at?: string;
}

export interface Technician {
    id: string;
    name: string;
    level: string;
    location_lat: number | null;
    location_lng: number | null;
    location_label: string | null;
    inventory: string[];
    avatar: string | null;
    is_available: boolean;
}

export interface Part {
    id: string;
    name: string;
    sku: string;
    category: string;
    price: number;
    stock: number;
    location_type: string | null;
    location_name: string | null;
    distance: string | null;
}

export interface Asset {
    id: string;
    name: string;
    category: string;
    daily_rate: number;
    owner_id: string | null;
    owner_name: string | null;
    status: 'Available' | 'Rented';
    image_url: string | null;
    location: string | null;
}

// Supabase client
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase credentials not found. Database features will not work.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper to convert database rows to frontend format (camelCase with nested location)
export function dbJobToJob(row: Job) {
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
        location: {
            lat: row.location_lat || 0,
            lng: row.location_lng || 0
        },
        estimatedDuration: row.estimated_duration || 0
    };
}

export function dbTechToTech(row: Technician) {
    return {
        id: row.id,
        name: row.name,
        level: row.level,
        location: {
            lat: row.location_lat || 0,
            lng: row.location_lng || 0,
            label: row.location_label || ''
        },
        inventory: row.inventory || [],
        avatar: row.avatar || '',
        isAvailable: row.is_available
    };
}

export function dbPartToPart(row: Part) {
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

export function dbAssetToAsset(row: Asset) {
    return {
        id: row.id,
        name: row.name,
        category: row.category,
        dailyRate: row.daily_rate,
        ownerId: row.owner_id || '',
        ownerName: row.owner_name || '',
        status: row.status,
        imageUrl: row.image_url || '',
        location: row.location || ''
    };
}
