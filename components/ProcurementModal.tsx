import React, { useState, useEffect } from 'react';
import { X, Truck, Clock, ShieldCheck, Zap, AlertTriangle, Minus, Plus, History, Star, Package, Loader2 } from 'lucide-react';
import { Part } from '../types';

interface Supplier {
    id: string;
    name: string;
    price: number;
    deliveryTime: string;
    reliability: number;
    isRecommended?: boolean;
}

interface OrderHistory {
    id: string;
    partName: string;
    quantity: number;
    totalPrice: number;
    status: string;
    estimatedDelivery: string;
    createdAt: string;
}

interface ProcurementModalProps {
    isOpen: boolean;
    onClose: () => void;
    part: Part | null;
    onSuccess?: (quantity: number) => void;
}

export const ProcurementModal: React.FC<ProcurementModalProps> = ({ isOpen, onClose, part, onSuccess }) => {
    const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(null);
    const [isOrdering, setIsOrdering] = useState(false);
    const [orderComplete, setOrderComplete] = useState(false);
    const [quantity, setQuantity] = useState(5);
    const [showHistory, setShowHistory] = useState(false);
    const [orderHistory, setOrderHistory] = useState<OrderHistory[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [lastOrder, setLastOrder] = useState<{ id: string; delivery: string } | null>(null);

    // Fetch order history
    useEffect(() => {
        if (isOpen && showHistory) {
            fetchOrderHistory();
        }
    }, [isOpen, showHistory]);

    const fetchOrderHistory = async () => {
        setLoadingHistory(true);
        try {
            const res = await fetch('/api/procurement');
            if (res.ok) {
                const data = await res.json();
                setOrderHistory(data.orders || []);
            }
        } catch (err) {
            console.error('Failed to fetch order history', err);
        } finally {
            setLoadingHistory(false);
        }
    };

    if (!isOpen || !part) return null;

    const suppliers: Supplier[] = [
        { id: 's1', name: 'Global HVAC Dist', price: part.price, deliveryTime: '2 Days', reliability: 0.98 },
        { id: 's2', name: 'Metro Rapid Supply', price: part.price * 1.15, deliveryTime: '4 Hours', reliability: 0.95, isRecommended: true },
        { id: 's3', name: 'Discount Parts', price: part.price * 0.9, deliveryTime: '5 Days', reliability: 0.80 }
    ];

    const selectedSupplier = suppliers.find(s => s.id === selectedSupplierId);
    const totalPrice = selectedSupplier ? selectedSupplier.price * quantity : 0;

    const handleOrder = async () => {
        if (!selectedSupplier) return;
        setIsOrdering(true);

        try {
            const res = await fetch('/api/procurement', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    partId: part.id,
                    partName: part.name,
                    supplierId: selectedSupplier.id,
                    quantity,
                    unitPrice: selectedSupplier.price
                })
            });

            if (res.ok) {
                const data = await res.json();
                setLastOrder({ id: data.order.id, delivery: data.order.estimatedDelivery });
            }
        } catch (err) {
            console.error('Order failed', err);
        }

        setIsOrdering(false);
        setOrderComplete(true);
        if (onSuccess) onSuccess(quantity);
    };

    const adjustQuantity = (delta: number) => {
        setQuantity(prev => Math.max(1, Math.min(100, prev + delta)));
    };

    const renderStars = (reliability: number) => {
        const stars = Math.round(reliability * 5);
        return (
            <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-3 h-3 ${i < stars ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`} />
                ))}
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden relative">
                {/* Header */}
                <div className="p-6 border-b border-slate-800 flex justify-between items-start">
                    <div>
                        <div className="flex items-center space-x-2 mb-1">
                            <span className="bg-amber-900/30 text-amber-500 text-xs font-bold px-2 py-0.5 rounded border border-amber-900/50">
                                AI PROCUREMENT
                            </span>
                            {part.stock < 5 && (
                                <span className="bg-red-900/30 text-red-500 text-xs font-bold px-2 py-0.5 rounded border border-red-900/50 flex items-center">
                                    <AlertTriangle className="w-3 h-3 mr-1" /> CRITICAL
                                </span>
                            )}
                        </div>
                        <h2 className="text-xl font-bold text-white">Restock: {part.name}</h2>
                        <p className="text-slate-400 text-sm">SKU: {part.sku} • Current Stock: {part.stock}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => setShowHistory(!showHistory)}
                            className={`p-2 rounded-lg transition ${showHistory ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                        >
                            <History className="w-5 h-5" />
                        </button>
                        <button onClick={onClose} className="text-slate-500 hover:text-white transition">
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                <div className="p-6">
                    {showHistory ? (
                        /* ORDER HISTORY VIEW */
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-white flex items-center">
                                <History className="w-5 h-5 mr-2 text-blue-400" /> Recent Orders
                            </h3>
                            {loadingHistory ? (
                                <div className="flex justify-center py-8">
                                    <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                                </div>
                            ) : orderHistory.length === 0 ? (
                                <div className="text-center py-8 text-slate-500">
                                    <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                    <p>No orders yet</p>
                                </div>
                            ) : (
                                <div className="space-y-2 max-h-80 overflow-y-auto">
                                    {orderHistory.map(order => (
                                        <div key={order.id} className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 flex justify-between items-center">
                                            <div>
                                                <p className="text-white font-medium">{order.partName}</p>
                                                <p className="text-slate-500 text-xs">x{order.quantity} • {order.id}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-emerald-400 font-bold">${order.totalPrice.toFixed(2)}</p>
                                                <p className="text-slate-500 text-xs">{order.status}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : orderComplete ? (
                        /* ORDER COMPLETE */
                        <div className="text-center py-12 animate-in fade-in zoom-in duration-300">
                            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Truck className="w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">Order Confirmed!</h3>
                            <p className="text-slate-400">PO #{lastOrder?.id || 'Processing'}</p>
                            <p className="text-slate-500 text-sm mt-2">
                                {quantity} units • Est. Arrival: {lastOrder?.delivery || selectedSupplier?.deliveryTime}
                            </p>
                            <button onClick={onClose} className="mt-6 bg-slate-800 hover:bg-slate-700 text-white px-6 py-2 rounded-lg font-bold transition">
                                Close
                            </button>
                        </div>
                    ) : (
                        /* ORDER FORM */
                        <>
                            {/* Quantity Selector */}
                            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 mb-4">
                                <label className="block text-sm font-medium text-slate-400 mb-2">Order Quantity</label>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <button
                                            onClick={() => adjustQuantity(-5)}
                                            className="w-10 h-10 rounded-lg bg-slate-700 hover:bg-slate-600 text-white flex items-center justify-center transition"
                                        >
                                            <Minus className="w-4 h-4" />
                                        </button>
                                        <input
                                            type="number"
                                            value={quantity}
                                            onChange={(e) => setQuantity(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
                                            className="w-20 text-center bg-slate-900 border border-slate-600 rounded-lg py-2 text-white text-xl font-bold focus:ring-2 focus:ring-blue-500"
                                        />
                                        <button
                                            onClick={() => adjustQuantity(5)}
                                            className="w-10 h-10 rounded-lg bg-slate-700 hover:bg-slate-600 text-white flex items-center justify-center transition"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-slate-500 text-xs">Quick select:</p>
                                        <div className="flex space-x-1 mt-1">
                                            {[5, 10, 25, 50].map(n => (
                                                <button
                                                    key={n}
                                                    onClick={() => setQuantity(n)}
                                                    className={`px-2 py-1 rounded text-xs font-bold transition ${quantity === n ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400 hover:text-white'}`}
                                                >
                                                    {n}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <p className="text-slate-400 text-sm mb-4">Select a supplier:</p>

                            {/* Supplier List */}
                            <div className="space-y-3">
                                {suppliers.map((supplier) => (
                                    <div
                                        key={supplier.id}
                                        onClick={() => setSelectedSupplierId(supplier.id)}
                                        className={`relative border rounded-xl p-4 cursor-pointer transition-all flex items-center justify-between group
                                            ${selectedSupplierId === supplier.id
                                                ? 'bg-blue-900/20 border-blue-500 ring-1 ring-blue-500'
                                                : 'bg-slate-800/50 border-slate-700 hover:bg-slate-800 hover:border-slate-600'
                                            }
                                        `}
                                    >
                                        <div className="flex items-center space-x-4">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${supplier.isRecommended ? 'bg-amber-500/20 text-amber-500' : 'bg-slate-700 text-slate-400'}`}>
                                                <Truck className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <div className="flex items-center">
                                                    <h4 className="text-white font-bold">{supplier.name}</h4>
                                                    {supplier.isRecommended && (
                                                        <span className="ml-2 bg-amber-500 text-slate-900 text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center">
                                                            <Zap className="w-3 h-3 mr-0.5 fill-current" /> BEST
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center text-xs text-slate-400 mt-1 space-x-3">
                                                    <span className="flex items-center"><Clock className="w-3 h-3 mr-1" /> {supplier.deliveryTime}</span>
                                                    {renderStars(supplier.reliability)}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-lg font-bold text-white">${(supplier.price * quantity).toFixed(2)}</div>
                                            <div className="text-xs text-slate-500">${supplier.price.toFixed(2)} each</div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Actions */}
                            <div className="mt-6 flex justify-between items-center">
                                <div className="text-slate-400 text-sm">
                                    {selectedSupplier && <span>Total: <span className="text-white font-bold">${totalPrice.toFixed(2)}</span></span>}
                                </div>
                                <div className="flex space-x-3">
                                    <button onClick={onClose} className="px-4 py-2 text-slate-400 hover:text-white text-sm font-bold transition">Cancel</button>
                                    <button
                                        disabled={!selectedSupplierId || isOrdering}
                                        onClick={handleOrder}
                                        className={`px-6 py-2 rounded-lg font-bold text-white flex items-center shadow-lg transition-all
                                            ${!selectedSupplierId
                                                ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                                                : 'bg-blue-600 hover:bg-blue-500 shadow-blue-900/20 active:scale-95'
                                            }
                                        `}
                                    >
                                        {isOrdering ? (
                                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</>
                                        ) : (
                                            <>Place Order</>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

