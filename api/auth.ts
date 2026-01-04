import { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import { LoginSchema } from '../utils/validation';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // CORS
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
        // Validate Input
        const { username, password } = LoginSchema.parse(req.body);

        // MOCK AUTHENTICATION (Replace with real DB lookup)
        if (username === 'admin' && password === 'hvac2026') {
            const token = `mock_token_${Date.now()}_${Math.random().toString(36).substr(2)}`;

            return res.status(200).json({
                success: true,
                token,
                user: { id: 'u1', name: 'Admin User', role: 'admin' }
            });
        }

        return res.status(401).json({ error: 'Invalid credentials' });

    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: 'Validation Error', details: error.errors });
        }
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
