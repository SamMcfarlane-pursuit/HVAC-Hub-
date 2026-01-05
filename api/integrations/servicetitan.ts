import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * ServiceTitan Integration Stub
 * 
 * This endpoint provides a mock interface for ServiceTitan API integration.
 * In production, this would sync with the real ServiceTitan API.
 * 
 * Supported operations:
 * - GET: Retrieve sync status
 * - POST: Trigger a sync
 */

interface SyncStatus {
    connected: boolean;
    lastSync: string | null;
    jobsImported: number;
    techniciansSynced: number;
    nextScheduledSync: string;
}

const mockStatus: SyncStatus = {
    connected: false, // Would be true when API key is configured
    lastSync: null,
    jobsImported: 0,
    techniciansSynced: 0,
    nextScheduledSync: new Date(Date.now() + 3600000).toISOString() // 1 hour from now
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        if (req.method === 'GET') {
            // Return current sync status
            return res.status(200).json({
                integration: 'servicetitan',
                status: mockStatus,
                message: mockStatus.connected
                    ? 'Integration active'
                    : 'Configure SERVICETITAN_API_KEY to enable'
            });
        }

        if (req.method === 'POST') {
            const { action } = req.body;

            if (action === 'sync') {
                // Mock sync operation
                return res.status(200).json({
                    success: true,
                    message: 'Sync initiated (mock)',
                    estimatedCompletion: new Date(Date.now() + 60000).toISOString()
                });
            }

            if (action === 'test') {
                // Test connection
                return res.status(200).json({
                    success: true,
                    message: 'Connection test successful (mock)',
                    latency: '45ms'
                });
            }

            return res.status(400).json({ error: 'Invalid action. Use: sync, test' });
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error('ServiceTitan integration error:', error);
        return res.status(500).json({ error: 'Integration error' });
    }
}
