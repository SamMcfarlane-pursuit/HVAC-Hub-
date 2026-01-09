import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';

// Validation schemas
const LoginSchema = z.object({
    username: z.string().min(1, "Username is required"),
    password: z.string().min(1, "Password is required")
});

const SignupSchema = z.object({
    fullName: z.string().min(1, "Full name is required"),
    email: z.string().email("Invalid email address"),
    company: z.string().min(1, "Company is required"),
    username: z.string().min(3, "Username must be at least 3 characters"),
    password: z.string().min(6, "Password must be at least 6 characters")
});

const ResetPasswordSchema = z.object({
    email: z.string().email("Invalid email address")
});

// Valid credentials database (in production, this would be a real database)
const validCredentials = [
    { username: 'admin', password: 'hvac2026', name: 'Admin User', role: 'admin', email: 'admin@hvachub.com' },
    { username: 'admin@hvachub.com', password: 'hvac2026', name: 'Admin User', role: 'admin', email: 'admin@hvachub.com' },
    { username: 'demo', password: 'demo123', name: 'Demo User', role: 'viewer', email: 'demo@hvachub.com' },
    { username: 'test', password: 'test123', name: 'Test User', role: 'technician', email: 'test@hvachub.com' }
];

// In-memory store for new signups (in production, use a database)
let registeredUsers: typeof validCredentials = [...validCredentials];

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

    const action = req.body?.action || 'login';

    try {
        // SIGNUP
        if (action === 'signup') {
            const { fullName, email, company, username, password } = SignupSchema.parse(req.body);
            const normalizedUsername = username.trim().toLowerCase();
            const normalizedEmail = email.trim().toLowerCase();

            // Check if username or email already exists
            const existingUser = registeredUsers.find(
                u => u.username.toLowerCase() === normalizedUsername ||
                    u.email.toLowerCase() === normalizedEmail
            );

            if (existingUser) {
                return res.status(400).json({ error: 'Username or email already registered' });
            }

            // Create new user
            const newUser = {
                username: normalizedUsername,
                password,
                name: fullName,
                role: 'viewer' as const,
                email: normalizedEmail
            };
            registeredUsers.push(newUser);

            return res.status(201).json({
                success: true,
                message: 'Account created successfully',
                user: {
                    id: `u_${Math.random().toString(36).substr(2, 6)}`,
                    name: fullName,
                    username: normalizedUsername,
                    email: normalizedEmail
                }
            });
        }

        // RESET PASSWORD
        if (action === 'reset-password') {
            const { email } = ResetPasswordSchema.parse(req.body);
            const normalizedEmail = email.trim().toLowerCase();

            // Check if email exists (for demo, always succeed)
            const user = registeredUsers.find(u => u.email.toLowerCase() === normalizedEmail);

            // Always return success to avoid email enumeration
            return res.status(200).json({
                success: true,
                message: 'If an account exists with this email, a reset link has been sent.'
            });
        }

        // LOGIN (default action)
        const { username, password } = LoginSchema.parse(req.body);
        const normalizedUsername = username.trim().toLowerCase();

        const user = registeredUsers.find(
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
