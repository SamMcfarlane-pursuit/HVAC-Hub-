import React, { useState } from 'react';
import { X, Truck, DollarSign, Clock, ShieldCheck, Zap, AlertTriangle } from 'lucide-react';
import { Part } from '../types';

interface Supplier {
    id: string;
    name: string;
    price: number;
    deliveryTime: string; // "2 hours", "1 day"
    reliability: number; // 0-1
    isRecommended?: boolean;
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

    if (!isOpen || !part) return null;

    // Mock Suppliers based on part category logic
    const suppliers: Supplier[] = [
        { id: 's1', name: 'Global HVAC Dist', price: part.price, deliveryTime: '2 Days', reliability: 0.98 },
        { id: 's2', name: 'Metro Rapid Supply', price: part.price * 1.15, deliveryTime: '4 Hours', reliability: 0.95, isRecommended: true },
        { id: 's3', name: 'Discount Parts', price: part.price * 0.9, deliveryTime: '5 Days', reliability: 0.80 }
    ];

    const handleOrder = () => {
        setIsOrdering(true);
        setTimeout(() => {
            setIsOrdering(false);
            setOrderComplete(true);
            if (onSuccess) onSuccess(5); // Simulate ordering 5 units
        }, 1500);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden relative">
                {/* Header */}
                <div className="p-6 border-b border-slate-800 flex justify-between items-start">
                    <div>
                        <div className="flex items-center space-x-2 mb-1">
                            <span className="bg-amber-900/30 text-amber-500 text-xs font-bold px-2 py-0.5 rounded border border-amber-900/50">
                                AI PROCUREMENT ASSISTANT
                            </span>
                            {part.stock < 5 && (
                                <span className="bg-red-900/30 text-red-500 text-xs font-bold px-2 py-0.5 rounded border border-red-900/50 flex items-center">
                                    <AlertTriangle className="w-3 h-3 mr-1" /> CRITICAL STOCK
                                </span>
                            )}
                        </div>
                        <h2 className="text-xl font-bold text-white">Restock: {part.name}</h2>
                        <p className="text-slate-400 text-sm">SKU: {part.sku} • Current Stock: {part.stock}</p>
                    </div>
                    <button onClick={onClose} className="text-slate-500 hover:text-white transition">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6">
                    {orderComplete ? (
                        <div className="text-center py-12 animate-in fade-in zoom-in duration-300">
                            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Truck className="w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">Order Confirmed!</h3>
                            <p className="text-slate-400">PO #ORD-{Math.floor(Math.random() * 100000)} has been sent.</p>
                            <p className="text-slate-500 text-sm mt-2">Estimated Arrival: {suppliers.find(s => s.id === selectedSupplierId)?.deliveryTime || 'Soon'}</p>
                            <button onClick={onClose} className="mt-6 bg-slate-800 hover:bg-slate-700 text-white px-6 py-2 rounded-lg font-bold transition">
                                Close
                            </button>
                        </div>
                    ) : (
                        <>
                            <p className="text-slate-400 text-sm mb-4">Select a supplier. The system recommends the best balance of speed and cost.</p>

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
                                                            <Zap className="w-3 h-3 mr-0.5 fill-current" /> BEST CHOICE
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center text-xs text-slate-400 mt-1 space-x-3">
                                                    <span className="flex items-center"><Clock className="w-3 h-3 mr-1" /> {supplier.deliveryTime}</span>
                                                    <span className="flex items-center"><ShieldCheck className="w-3 h-3 mr-1" /> {Math.floor(supplier.reliability * 100)}% Reliability</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-lg font-bold text-white">${supplier.price.toFixed(2)}</div>
                                            <div className={`text-xs ${supplier.price > part.price ? 'text-red-400' : 'text-emerald-400'}`}>
                                                {supplier.price > part.price ? `+${((supplier.price - part.price) / part.price * 100).toFixed(0)}% vs avg` : 'Best Price'}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8 flex justify-end space-x-3">
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
                                        <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div> Processing...</>
                                    ) : (
                                        <>Place Order <div className="ml-2 bg-white/20 px-1.5 rounded text-xs">${suppliers.find(s => s.id === selectedSupplierId)?.price.toFixed(2)}</div></>
                                    )}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
