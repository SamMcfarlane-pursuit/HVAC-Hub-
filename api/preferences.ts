import type { VercelRequest, VercelResponse } from '@vercel/node';

interface UserPreferences {
    userId: string;
    theme: 'dark' | 'light' | 'system';
    locale: string;
    timezone: string;
    notifications: {
        email: boolean;
        push: boolean;
        lowStock: boolean;
        jobUpdates: boolean;
        systemAlerts: boolean;
        quietHours: { enabled: boolean; start: string; end: string };
    };
    serviceArea: {
        lat: number;
        lng: number;
        radiusMiles: number;
    };
    display: {
        dashboardLayout: 'compact' | 'default' | 'expanded';
        mapDefaultZoom: number;
        showTutorials: boolean;
    };
}

// Default preferences
const DEFAULT_PREFERENCES: Omit<UserPreferences, 'userId'> = {
    theme: 'dark',
    locale: 'en-US',
    timezone: 'America/New_York',
    notifications: {
        email: true,
        push: true,
        lowStock: true,
        jobUpdates: true,
        systemAlerts: true,
        quietHours: { enabled: false, start: '22:00', end: '07:00' }
    },
    serviceArea: {
        lat: 40.7128,
        lng: -74.0060,
        radiusMiles: 25
    },
    display: {
        dashboardLayout: 'default',
        mapDefaultZoom: 12,
        showTutorials: true
    }
};

// In-memory store (would be database in production)
const userPreferences: Record<string, UserPreferences> = {};

export default function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Extract user ID from query or body (in production, from auth token)
    const userId = (req.query.userId as string) || req.body?.userId || 'default';

    if (req.method === 'GET') {
        const prefs = userPreferences[userId] || { userId, ...DEFAULT_PREFERENCES };
        return res.status(200).json(prefs);
    }

    if (req.method === 'PUT') {
        const updates = req.body;

        if (!updates || typeof updates !== 'object') {
            return res.status(400).json({ error: 'Invalid preferences data' });
        }

        // Merge with existing or default preferences
        const current = userPreferences[userId] || { userId, ...DEFAULT_PREFERENCES };
        const updated: UserPreferences = {
            ...current,
            ...updates,
            userId, // Ensure userId can't be overwritten
            notifications: { ...current.notifications, ...updates.notifications },
            serviceArea: { ...current.serviceArea, ...updates.serviceArea },
            display: { ...current.display, ...updates.display }
        };

        userPreferences[userId] = updated;

        return res.status(200).json({
            success: true,
            preferences: updated,
            message: 'Preferences saved successfully'
        });
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
