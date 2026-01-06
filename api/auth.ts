import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';

// Inline validation schema
const LoginSchema = z.object({
    username: z.string().min(1, "Username is required"),
    password: z.string().min(1, "Password is required")
});

// Valid credentials database (in production, this would be a real database)
const validCredentials = [
    { username: 'admin', password: 'hvac2026', name: 'Admin User', role: 'admin' },
    { username: 'admin@hvachub.com', password: 'hvac2026', name: 'Admin User', role: 'admin' },
    { username: 'demo', password: 'demo123', name: 'Demo User', role: 'viewer' },
    { username: 'test', password: 'test123', name: 'Test User', role: 'technician' }
];

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

        // Normalize username (trim whitespace, lowercase)
        const normalizedUsername = username.trim().toLowerCase();

        // Find matching credentials
        const user = validCredentials.find(
            cred => cred.username.toLowerCase() === normalizedUsername && cred.password === password
        );

        if (user) {
            const token = `hvac_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            return res.status(200).json({
                success: true,
                token,
                user: {
                    id: `u_${Math.random().toString(36).substr(2, 6)}`,
                    name: user.name,
                    role: user.role,
                    username: user.username
                }
            });
        }

        // Return helpful error message
        return res.status(401).json({
            error: 'Invalid credentials',
            hint: 'Try: admin / hvac2026'
        });

    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                error: 'Validation Error',
                details: error.issues.map(i => i.message).join(', ')
            });
        }
        console.error('Auth error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
