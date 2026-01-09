import React, { useState, useEffect } from 'react';
import { ShoppingBag, Calendar, Clock, CheckCircle, XCircle, RefreshCw, Search, Filter, Eye, Loader2, Package, DollarSign, TrendingUp } from 'lucide-react';
import { Order, Customer } from '../types';
import { ReceiptModal } from './ReceiptModal';

type FilterStatus = 'ALL' | 'Completed' | 'Pending' | 'Cancelled';

export const OrderHistory: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<FilterStatus>('ALL');

    // Receipt Modal State
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [isReceiptOpen, setIsReceiptOpen] = useState(false);

    useEffect(() => {
        fetchOrders();
        fetchCustomer();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/orders');
            if (res.ok) {
                const data = await res.json();
                setOrders(data);
            }
        } catch (error) {
            console.error('Failed to fetch orders', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCustomer = async () => {
        try {
            const res = await fetch('/api/customers');
            if (res.ok) {
                const data = await res.json();
                setCustomer(data);
            }
        } catch (error) {
            console.error('Failed to fetch customer', error);
        }
    };

    const handleViewReceipt = (order: Order) => {
        setSelectedOrder(order);
        setIsReceiptOpen(true);
    };

    // Filter logic
    const filteredOrders = orders.filter(order => {
        const matchesSearch =
            order.assetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase());

        if (!matchesSearch) return false;
        if (statusFilter === 'ALL') return true;
        return order.status === statusFilter;
    });

    // Stats
    const totalSpent = orders.reduce((sum, o) => sum + o.total, 0);
    const completedOrders = orders.filter(o => o.status === 'Completed').length;

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Completed': return <CheckCircle className="w-4 h-4 text-emerald-400" />;
            case 'Pending': return <Clock className="w-4 h-4 text-amber-400" />;
            case 'Cancelled': return <XCircle className="w-4 h-4 text-red-400" />;
            case 'Refunded': return <RefreshCw className="w-4 h-4 text-blue-400" />;
            default: return null;
        }
    };

    const getStatusClasses = (status: string) => {
        switch (status) {
            case 'Completed': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
            case 'Pending': return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
            case 'Cancelled': return 'bg-red-500/10 text-red-400 border-red-500/30';
            case 'Refunded': return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
            default: return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
        }
    };

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center flex-col">
                <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
                <p className="text-slate-400 font-medium">Loading order history...</p>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col p-6 space-y-6 overflow-y-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center">
                        <ShoppingBag className="mr-2 text-indigo-400" /> My Orders
                    </h2>
                    <p className="text-slate-400 text-sm">View your rental history and receipts</p>
                </div>
                <div className="relative w-full md:w-80 group">
                    <Search className="absolute left-3 top-3 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition" />
                    <input
                        type="text"
                        placeholder="Search orders..."
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all focus:border-indigo-500"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex items-center shadow-lg">
                    <div className="p-3 bg-indigo-500/10 rounded-lg text-indigo-400 mr-4">
                        <Package className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Orders</div>
                        <div className="text-2xl font-black text-white">{orders.length}</div>
                    </div>
                </div>
                <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex items-center shadow-lg">
                    <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-400 mr-4">
                        <CheckCircle className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">Completed</div>
                        <div className="text-2xl font-black text-white">{completedOrders}</div>
                    </div>
                </div>
                <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex items-center shadow-lg">
                    <div className="p-3 bg-amber-500/10 rounded-lg text-amber-400 mr-4">
                        <DollarSign className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Spent</div>
                        <div className="text-2xl font-black text-white">${totalSpent.toFixed(2)}</div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
                {(['ALL', 'Completed', 'Pending', 'Cancelled'] as FilterStatus[]).map(status => (
                    <button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition flex items-center border ${statusFilter === status
                                ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-500/20'
                                : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-500 hover:text-slate-200'
                            }`}
                    >
                        {status === 'ALL' && <Filter className="w-3 h-3 mr-1.5" />}
                        {status}
                    </button>
                ))}
                <span className="ml-auto text-slate-500 text-sm">{filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''}</span>
            </div>

            {/* Orders List */}
            {filteredOrders.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
                    <ShoppingBag className="w-16 h-16 text-slate-600 mb-4" />
                    <h3 className="text-xl font-bold text-slate-400 mb-2">No orders found</h3>
                    <p className="text-slate-500">Your rental history will appear here</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredOrders.map(order => (
                        <div
                            key={order.id}
                            className="bg-slate-800 rounded-xl border border-slate-700 p-5 hover:border-indigo-500/50 transition-all hover:shadow-lg group"
                        >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                {/* Order Info */}
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition">
                                            {order.assetName}
                                        </h3>
                                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase border flex items-center gap-1 ${getStatusClasses(order.status)}`}>
                                            {getStatusIcon(order.status)}
                                            {order.status}
                                        </span>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                                        <span className="flex items-center">
                                            <Calendar className="w-4 h-4 mr-1.5" />
                                            {order.startDate} → {order.endDate}
                                        </span>
                                        <span className="text-slate-600">•</span>
                                        <span className="font-mono text-xs bg-slate-900 px-2 py-0.5 rounded">
                                            {order.receiptNumber}
                                        </span>
                                    </div>
                                </div>

                                {/* Amount & Actions */}
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <div className="text-2xl font-black text-emerald-400">${order.total.toFixed(2)}</div>
                                        <div className="text-xs text-slate-500">{order.rentalDays} day{order.rentalDays > 1 ? 's' : ''}</div>
                                    </div>
                                    <button
                                        onClick={() => handleViewReceipt(order)}
                                        className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-lg font-bold text-sm flex items-center transition shadow-lg shadow-indigo-900/20"
                                    >
                                        <Eye className="w-4 h-4 mr-1.5" /> View Receipt
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Receipt Modal */}
            {selectedOrder && customer && (
                <ReceiptModal
                    isOpen={isReceiptOpen}
                    onClose={() => setIsReceiptOpen(false)}
                    order={selectedOrder}
                    customer={customer}
                />
            )}
        </div>
    );
};
