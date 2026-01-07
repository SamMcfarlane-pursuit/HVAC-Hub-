import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Lazy Supabase client
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

// Validation schema
const SignupSchema = z.object({
    fullName: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    company: z.string().min(1, "Company is required"),
    username: z.string().min(3, "Username must be at least 3 characters").max(20),
    password: z.string().min(6, "Password must be at least 6 characters")
});

// In-memory users store (fallback when no database)
const registeredUsers: any[] = [];

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const data = SignupSchema.parse(req.body);
        const db = getSupabase();

        // Check if username already exists
        const normalizedUsername = data.username.toLowerCase().trim();

        if (db) {
            const { data: existing } = await db
                .from('users')
                .select('id')
                .eq('username', normalizedUsername)
                .single();

            if (existing) {
                return res.status(409).json({ error: 'Username already taken' });
            }

            // Insert new user (in production, hash the password!)
            const newUser = {
                id: `u_${Date.now().toString(36)}`,
                username: normalizedUsername,
                email: data.email.toLowerCase(),
                full_name: data.fullName,
                company: data.company,
                password_hash: data.password, // In production: use bcrypt
                role: 'user',
                created_at: new Date().toISOString()
            };

            const { error } = await db.from('users').insert(newUser);
            if (error) throw error;

            return res.status(201).json({
                success: true,
                message: 'Account created successfully',
                user: {
                    id: newUser.id,
                    username: newUser.username,
                    email: newUser.email,
                    name: newUser.full_name
                }
            });
        }

        // Fallback: In-memory storage
        const existingUser = registeredUsers.find(u => u.username === normalizedUsername);
        if (existingUser) {
            return res.status(409).json({ error: 'Username already taken' });
        }

        const newUser = {
            id: `u_${Date.now().toString(36)}`,
            username: normalizedUsername,
            email: data.email.toLowerCase(),
            fullName: data.fullName,
            company: data.company,
            role: 'user',
            createdAt: new Date().toISOString()
        };

        registeredUsers.push({ ...newUser, password: data.password });

        return res.status(201).json({
            success: true,
            message: 'Account created successfully',
            user: newUser
        });

    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                error: 'Validation Error',
                details: error.issues.map(i => i.message).join(', ')
            });
        }
        console.error('Signup error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
