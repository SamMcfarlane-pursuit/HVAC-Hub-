import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';

// Validation schema
const ResetSchema = z.object({
    email: z.string().email("Invalid email address")
});

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
        const { email } = ResetSchema.parse(req.body);

        // In production:
        // 1. Check if email exists in database
        // 2. Generate a secure reset token
        // 3. Store token with expiry (e.g., 1 hour)
        // 4. Send email with reset link

        // For demo purposes, we'll simulate the process
        console.log(`Password reset requested for: ${email}`);

        // Always return success to prevent email enumeration
        return res.status(200).json({
            success: true,
            message: 'If an account exists with this email, a reset link has been sent.',
            // In dev mode, include debug info
            ...(process.env.NODE_ENV !== 'production' && {
                debug: {
                    email: email,
                    resetToken: `reset_${Date.now().toString(36)}`,
                    expiresIn: '1 hour'
                }
            })
        });

    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                error: 'Validation Error',
                details: error.issues.map(i => i.message).join(', ')
            });
        }
        console.error('Reset password error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
