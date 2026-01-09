import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Inline fallback data
const FALLBACK_ORDERS = [
    {
        id: 'ORD001',
        customerId: 'CUST001',
        userId: 'u1',
        assetId: 'A003',
        assetName: 'Hydro-Jetting Rig Used',
        rentalDays: 3,
        dailyRate: 150.00,
        subtotal: 450.00,
        tax: 36.00,
        total: 486.00,
        status: 'Completed',
        paymentMethod: 'card',
        startDate: '2026-01-05',
        endDate: '2026-01-08',
        receiptNumber: 'RCP-20260105-001',
        createdAt: '2026-01-05T10:00:00Z'
    }
];

// Store for new orders (in-memory for demo)
let ordersStore = [...FALLBACK_ORDERS];

// Supabase client (lazy init)
let supabase: ReturnType<typeof createClient> | null = null;
const getSupabase = () => {
    if (!supabase && process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
        supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
    }
    return supabase;
};

// Generate receipt number
const generateReceiptNumber = () => {
    const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const seq = String(ordersStore.length + 1).padStart(3, '0');
    return `RCP-${date}-${seq}`;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const db = getSupabase();

    // GET: Fetch orders
    if (req.method === 'GET') {
        const userId = req.query.userId as string || 'u1';

        if (db) {
            try {
                const { data, error } = await db
                    .from('orders')
                    .select('*')
                    .eq('user_id', userId)
                    .order('created_at', { ascending: false });

                if (error) throw error;

                // Transform snake_case to camelCase
                const orders = data.map((o: any) => ({
                    id: o.id,
                    customerId: o.customer_id,
                    userId: o.user_id,
                    assetId: o.asset_id,
                    assetName: o.asset_name,
                    rentalDays: o.rental_days,
                    dailyRate: parseFloat(o.daily_rate),
                    subtotal: parseFloat(o.subtotal),
                    tax: parseFloat(o.tax),
                    total: parseFloat(o.total),
                    status: o.status,
                    paymentMethod: o.payment_method,
                    paymentIntentId: o.payment_intent_id,
                    startDate: o.start_date,
                    endDate: o.end_date,
                    receiptNumber: o.receipt_number,
                    notes: o.notes,
                    createdAt: o.created_at
                }));

                return res.status(200).json(orders);
            } catch (err) {
                console.error('Supabase error:', err);
            }
        }

        // Fallback
        const userOrders = ordersStore.filter(o => o.userId === userId);
        return res.status(200).json(userOrders);
    }

    // POST: Create order
    if (req.method === 'POST') {
        try {
            const {
                customerId,
                userId = 'u1',
                assetId,
                assetName,
                rentalDays,
                dailyRate,
                startDate,
                endDate,
                paymentIntentId,
                notes
            } = req.body;

            // Calculate totals
            const subtotal = rentalDays * dailyRate;
            const tax = Math.round(subtotal * 0.08 * 100) / 100; // 8% tax
            const total = subtotal + tax;

            const newOrder = {
                id: `ORD${String(Date.now()).slice(-6)}`,
                customerId,
                userId,
                assetId,
                assetName,
                rentalDays,
                dailyRate,
                subtotal,
                tax,
                total,
                status: 'Completed' as const,
                paymentMethod: 'card',
                paymentIntentId,
                startDate,
                endDate,
                receiptNumber: generateReceiptNumber(),
                notes,
                createdAt: new Date().toISOString()
            };

            if (db) {
                try {
                    const { data, error } = await db
                        .from('orders')
                        .insert({
                            id: newOrder.id,
                            customer_id: newOrder.customerId,
                            user_id: newOrder.userId,
                            asset_id: newOrder.assetId,
                            asset_name: newOrder.assetName,
                            rental_days: newOrder.rentalDays,
                            daily_rate: newOrder.dailyRate,
                            subtotal: newOrder.subtotal,
                            tax: newOrder.tax,
                            total: newOrder.total,
                            status: newOrder.status,
                            payment_method: newOrder.paymentMethod,
                            payment_intent_id: newOrder.paymentIntentId,
                            start_date: newOrder.startDate,
                            end_date: newOrder.endDate,
                            receipt_number: newOrder.receiptNumber,
                            notes: newOrder.notes
                        })
                        .select()
                        .single();

                    if (error) throw error;
                    return res.status(201).json(newOrder);
                } catch (err) {
                    console.error('Supabase insert error:', err);
                }
            }

            // Fallback: store in memory
            ordersStore.push(newOrder);
            return res.status(201).json(newOrder);

        } catch (err: any) {
            return res.status(400).json({ error: 'Invalid order data', details: err.message });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
