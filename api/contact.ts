import { VercelRequest, VercelResponse } from '@vercel/node';

interface ContactFormData {
    name: string;
    email: string;
    company?: string;
    phone?: string;
    message: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { name, email, company, phone, message } = req.body as ContactFormData;

        // Validate required fields
        if (!name || !name.trim()) {
            return res.status(400).json({ error: 'Name is required' });
        }
        if (!email || !email.trim()) {
            return res.status(400).json({ error: 'Email is required' });
        }
        if (!message || !message.trim()) {
            return res.status(400).json({ error: 'Message is required' });
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        // Log the inquiry (in production, this would send to email service, CRM, or database)
        console.log('=== New Contact Form Submission ===');
        console.log('Timestamp:', new Date().toISOString());
        console.log('Name:', name);
        console.log('Email:', email);
        console.log('Company:', company || 'N/A');
        console.log('Phone:', phone || 'N/A');
        console.log('Message:', message);
        console.log('===================================');

        // Generate reference number
        const referenceNumber = `INQ-${Date.now().toString(36).toUpperCase()}`;

        return res.status(200).json({
            success: true,
            message: 'Thank you for your inquiry! We will get back to you within 24 hours.',
            referenceNumber
        });

    } catch (error) {
        console.error('Contact form error:', error);
        return res.status(500).json({ error: 'Failed to submit inquiry. Please try again.' });
    }
}
