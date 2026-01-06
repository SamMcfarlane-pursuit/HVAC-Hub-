import type { VercelRequest, VercelResponse } from '@vercel/node';

// In-memory store for demo (would be database in production)
const orders: ProcurementOrder[] = [];

interface ProcurementOrder {
    id: string;
    partId: string;
    partName: string;
    supplierId: string;
    supplierName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    status: 'pending' | 'confirmed' | 'shipped' | 'delivered';
    estimatedDelivery: string;
    createdAt: string;
}

// Mock suppliers database
const SUPPLIERS = [
    { id: 's1', name: 'Global HVAC Dist', priceModifier: 1.0, deliveryDays: 2, reliability: 0.98 },
    { id: 's2', name: 'Metro Rapid Supply', priceModifier: 1.15, deliveryDays: 0.17, reliability: 0.95 },
    { id: 's3', name: 'Discount Parts', priceModifier: 0.9, deliveryDays: 5, reliability: 0.80 }
];

export default function handler(req: VercelRequest, res: VercelResponse) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method === 'GET') {
        // Return order history
        return res.status(200).json({
            orders: orders.slice(-20), // Last 20 orders
            suppliers: SUPPLIERS
        });
    }

    if (req.method === 'POST') {
        const { partId, partName, supplierId, quantity, unitPrice } = req.body;

        if (!partId || !supplierId || !quantity) {
            return res.status(400).json({ error: 'Missing required fields: partId, supplierId, quantity' });
        }

        const supplier = SUPPLIERS.find(s => s.id === supplierId);
        if (!supplier) {
            return res.status(400).json({ error: 'Invalid supplier' });
        }

        const totalPrice = (unitPrice || 50) * quantity * supplier.priceModifier;
        const deliveryDate = new Date();
        deliveryDate.setDate(deliveryDate.getDate() + Math.ceil(supplier.deliveryDays));

        const order: ProcurementOrder = {
            id: `PO-${Date.now().toString(36).toUpperCase()}`,
            partId,
            partName: partName || 'Unknown Part',
            supplierId,
            supplierName: supplier.name,
            quantity,
            unitPrice: unitPrice || 50,
            totalPrice: Math.round(totalPrice * 100) / 100,
            status: 'confirmed',
            estimatedDelivery: deliveryDate.toISOString().split('T')[0],
            createdAt: new Date().toISOString()
        };

        orders.push(order);

        return res.status(201).json({
            success: true,
            order,
            message: `Order ${order.id} confirmed with ${supplier.name}`
        });
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
