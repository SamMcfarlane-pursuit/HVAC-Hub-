import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { z } from 'zod';

// Inline validation schema to avoid import issues with Vercel
const PaymentIntentSchema = z.object({
    amount: z.number().min(50, "Minimum amount is $0.50").max(999999, "Amount precise limit exceeded"),
    currency: z.string().length(3).default('usd'),
    assetId: z.string().min(1, "Asset ID is required")
});

// Initialize Stripe (Use env var or mock key for dev)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock_key', {
    apiVersion: '2025-12-15.clover',
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        // Validate Input
        const { amount, currency, assetId } = PaymentIntentSchema.parse(req.body);

        // Determine if we assume success for demo purposes (if no real key)
        const isMockMode = !process.env.STRIPE_SECRET_KEY;

        if (isMockMode) {
            // Return a mock client secret for frontend demo flow
            return res.status(200).json({
                clientSecret: 'mock_secret_' + Math.random().toString(36),
                dpmCheckerLink: 'https://example.com/mock-link',
                isMock: true
            });
        }

        // REAL STRIPE CALL
        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency,
            metadata: { assetId },
            automatic_payment_methods: { enabled: true },
        });

        return res.status(200).json({
            clientSecret: paymentIntent.client_secret,
            dpmCheckerLink: paymentIntent.latest_charge,
        });

    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: 'Validation Error', details: error.errors });
        }
        console.error('Stripe Error:', error);
        return res.status(500).json({ error: 'Payment initialization failed' });
    }
}
