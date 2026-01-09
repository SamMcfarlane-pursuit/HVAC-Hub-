import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Inline fallback data
const FALLBACK_CUSTOMERS: Record<string, any> = {
    'u1': {
        id: 'CUST001',
        userId: 'u1',
        fullName: 'Admin User',
        email: 'admin@hvachub.com',
        phone: '555-0100',
        billingAddress: {
            line1: '123 HVAC Street',
            line2: '',
            city: 'New York',
            state: 'NY',
            zip: '10001',
            country: 'US'
        },
        saveForFuture: true,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z'
    }
};

// In-memory store
let customersStore = { ...FALLBACK_CUSTOMERS };

// Supabase client (lazy init)
let supabase: ReturnType<typeof createClient> | null = null;
const getSupabase = () => {
    if (!supabase && process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
        supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
    }
    return supabase;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const db = getSupabase();
    const userId = (req.query.userId as string) || (req.body?.userId) || 'u1';

    // GET: Fetch customer profile
    if (req.method === 'GET') {
        if (db) {
            try {
                const { data, error } = await db
                    .from('customers')
                    .select('*')
                    .eq('user_id', userId)
                    .single();

                if (error && error.code !== 'PGRST116') throw error;

                if (data) {
                    const customer = {
                        id: data.id,
                        userId: data.user_id,
                        fullName: data.full_name,
                        email: data.email,
                        phone: data.phone,
                        billingAddress: {
                            line1: data.billing_address_line1 || '',
                            line2: data.billing_address_line2 || '',
                            city: data.billing_city || '',
                            state: data.billing_state || '',
                            zip: data.billing_zip || '',
                            country: data.billing_country || 'US'
                        },
                        saveForFuture: data.save_for_future,
                        createdAt: data.created_at,
                        updatedAt: data.updated_at
                    };
                    return res.status(200).json(customer);
                }
            } catch (err) {
                console.error('Supabase error:', err);
            }
        }

        // Fallback
        const customer = customersStore[userId];
        if (customer) {
            return res.status(200).json(customer);
        }
        return res.status(404).json({ error: 'Customer not found' });
    }

    // PUT/POST: Create or update customer
    if (req.method === 'PUT' || req.method === 'POST') {
        try {
            const { fullName, email, phone, billingAddress, saveForFuture = true } = req.body;

            const customerData = {
                id: `CUST${String(Date.now()).slice(-6)}`,
                userId,
                fullName,
                email,
                phone,
                billingAddress,
                saveForFuture,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            if (db) {
                try {
                    // Upsert pattern
                    const { data, error } = await db
                        .from('customers')
                        .upsert({
                            id: customersStore[userId]?.id || customerData.id,
                            user_id: userId,
                            full_name: fullName,
                            email,
                            phone,
                            billing_address_line1: billingAddress?.line1,
                            billing_address_line2: billingAddress?.line2,
                            billing_city: billingAddress?.city,
                            billing_state: billingAddress?.state,
                            billing_zip: billingAddress?.zip,
                            billing_country: billingAddress?.country || 'US',
                            save_for_future: saveForFuture,
                            updated_at: new Date().toISOString()
                        }, { onConflict: 'user_id' })
                        .select()
                        .single();

                    if (error) throw error;

                    const result = {
                        id: data.id,
                        userId: data.user_id,
                        fullName: data.full_name,
                        email: data.email,
                        phone: data.phone,
                        billingAddress: {
                            line1: data.billing_address_line1 || '',
                            line2: data.billing_address_line2 || '',
                            city: data.billing_city || '',
                            state: data.billing_state || '',
                            zip: data.billing_zip || '',
                            country: data.billing_country || 'US'
                        },
                        saveForFuture: data.save_for_future,
                        createdAt: data.created_at,
                        updatedAt: data.updated_at
                    };
                    return res.status(200).json(result);
                } catch (err) {
                    console.error('Supabase upsert error:', err);
                }
            }

            // Fallback: store in memory
            if (customersStore[userId]) {
                customerData.id = customersStore[userId].id;
                customerData.createdAt = customersStore[userId].createdAt;
            }
            customersStore[userId] = customerData;
            return res.status(200).json(customerData);

        } catch (err: any) {
            return res.status(400).json({ error: 'Invalid customer data', details: err.message });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
