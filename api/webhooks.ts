import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Webhook Receiver Endpoint
 * 
 * Receives webhooks from external systems and processes them.
 * Supports: job updates, inventory alerts, technician status
 */

interface WebhookPayload {
    event: string;
    source: string;
    timestamp: string;
    data: Record<string, any>;
    signature?: string;
}

const webhookLog: WebhookPayload[] = [];

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Webhook-Signature');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        if (req.method === 'GET') {
            // Return recent webhook activity
            return res.status(200).json({
                recentWebhooks: webhookLog.slice(-10),
                totalReceived: webhookLog.length,
                supportedEvents: [
                    'job.created',
                    'job.updated',
                    'job.completed',
                    'inventory.low_stock',
                    'technician.status_change'
                ]
            });
        }

        if (req.method === 'POST') {
            const payload: WebhookPayload = {
                event: req.body.event || 'unknown',
                source: req.body.source || 'external',
                timestamp: new Date().toISOString(),
                data: req.body.data || {},
                signature: req.headers['x-webhook-signature'] as string
            };

            // Log the webhook
            webhookLog.push(payload);
            if (webhookLog.length > 100) webhookLog.shift(); // Keep last 100

            // Process based on event type
            switch (payload.event) {
                case 'job.created':
                    console.log('Webhook: New job received from', payload.source);
                    break;
                case 'inventory.low_stock':
                    console.log('Webhook: Low stock alert from', payload.source);
                    break;
                case 'technician.status_change':
                    console.log('Webhook: Tech status update from', payload.source);
                    break;
                default:
                    console.log('Webhook: Unhandled event', payload.event);
            }

            return res.status(200).json({
                received: true,
                id: `wh_${Date.now()}`,
                processed: true
            });
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error('Webhook processing error:', error);
        return res.status(500).json({ error: 'Webhook processing failed' });
    }
}
