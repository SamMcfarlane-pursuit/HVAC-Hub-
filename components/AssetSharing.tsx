import React, { useState, useEffect } from 'react';
import { Wrench, ShieldCheck, Calendar, MapPin, User, Loader2, Star, Filter, Search, TrendingUp, Clock, Banknote, BadgeCheck, Plus, CalendarDays } from 'lucide-react';
import { Asset, Order } from '../types';
import { PaymentModal } from './PaymentModal';
import { ListAssetModal } from './ListAssetModal';

type FilterType = 'ALL' | 'HEAVY' | 'TOOLS' | 'DIAGNOSTIC';

export const AssetSharing: React.FC = () => {
    const [assets, setAssets] = useState<Asset[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState<FilterType>('ALL');
    const [searchTerm, setSearchTerm] = useState('');

    // Payment State
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

    // List Asset Modal
    const [isListModalOpen, setIsListModalOpen] = useState(false);

    // Date Range Picker State
    const [rentalDays, setRentalDays] = useState(1);
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        fetchAssets();
    }, []);

    const fetchAssets = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/assets');
            if (res.ok) {
                const data = await res.json();
                setAssets(data);
            }
        } catch (error) {
            console.error('Failed to fetch assets', error);
        } finally {
            setLoading(false);
        }
    };

    const handleBookClick = (asset: Asset) => {
        setSelectedAsset(asset);
        setIsPaymentModalOpen(true);
    };

    const handlePaymentSuccess = async (order: Order) => {
        if (!selectedAsset) return;

        const assetId = selectedAsset.id;
        setIsPaymentModalOpen(false);

        try {
            setAssets(prev => prev.map(a => a.id === assetId ? { ...a, status: 'Rented' } : a));

            await fetch('/api/assets', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: assetId, status: 'Rented' })
            });

            setSelectedAsset(null);
            console.log('Order created:', order.receiptNumber);
        } catch (error) {
            console.error('Booking failed', error);
            fetchAssets();
        }
    };

    const handleListSuccess = () => {
        setIsListModalOpen(false);
        fetchAssets();
    };

    // Filter Logic
    const filteredAssets = assets.filter(asset => {
        const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            asset.ownerName.toLowerCase().includes(searchTerm.toLowerCase());

        if (!matchesSearch) return false;

        if (activeFilter === 'ALL') return true;
        if (activeFilter === 'HEAVY') return asset.category.includes('Machinery') || asset.category.includes('Heavy');
        if (activeFilter === 'TOOLS') return asset.category.includes('Tool') || asset.category.includes('Drill');
        if (activeFilter === 'DIAGNOSTIC') return asset.category.includes('Meter') || asset.category.includes('Camera');
        return true;
    });

    // Stats
    const activeRentals = assets.filter(a => a.status === 'Rented').length;
    const availableAssets = assets.filter(a => a.status === 'Available').length;

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center flex-col">
                <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
                <p className="text-slate-400 font-medium">Scanning Asset Network...</p>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col p-6 space-y-6 overflow-y-auto">
            {/* HEADLINE */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center">
                        <Wrench className="mr-2 text-indigo-400" /> Equipment Exchange
                    </h2>
                    <p className="text-slate-400 text-sm">Peer-to-peer heavy equipment rental network.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative w-full md:w-80 group">
                        <Search className="absolute left-3 top-3 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition" />
                        <input
                            type="text"
                            placeholder="Find equipment or owners..."
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all focus:border-indigo-500 shadow-inner"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={() => setIsListModalOpen(true)}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-lg font-bold flex items-center transition shadow-lg shadow-indigo-900/20"
                    >
                        <Plus className="w-5 h-5 mr-1" /> List Asset
                    </button>
                </div>
            </div>

            {/* NETWORK STATS */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex items-center shadow-lg">
                    <div className="p-3 bg-indigo-500/10 rounded-lg text-indigo-400 mr-4">
                        <Clock className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">Active Rentals</div>
                        <div className="text-2xl font-black text-white">{activeRentals}</div>
                    </div>
                </div>
                <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex items-center shadow-lg">
                    <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-400 mr-4">
                        <Banknote className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">Est. Capex Savings</div>
                        <div className="text-2xl font-black text-white">$14,250</div>
                    </div>
                </div>
                <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex items-center shadow-lg">
                    <div className="p-3 bg-amber-500/10 rounded-lg text-amber-400 mr-4">
                        <TrendingUp className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">Network Utilization</div>
                        <div className="text-2xl font-black text-white">{assets.length > 0 ? Math.round((activeRentals / assets.length) * 100) : 0}%</div>
                    </div>
                </div>

                {/* DATE PICKER CARD */}
                <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-lg">
                    <div className="flex items-center mb-2">
                        <CalendarDays className="w-4 h-4 text-indigo-400 mr-2" />
                        <span className="text-xs font-bold text-slate-400 uppercase">Rental Period</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="flex-1 px-2 py-1.5 bg-slate-900 border border-slate-600 rounded text-white text-sm focus:ring-2 focus:ring-indigo-500"
                        />
                        <select
                            value={rentalDays}
                            onChange={(e) => setRentalDays(parseInt(e.target.value))}
                            className="px-2 py-1.5 bg-slate-900 border border-slate-600 rounded text-white text-sm focus:ring-2 focus:ring-indigo-500"
                        >
                            {[1, 2, 3, 5, 7, 14, 30].map(d => (
                                <option key={d} value={d}>{d} day{d > 1 ? 's' : ''}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* FILTERS */}
            <div className="flex flex-wrap gap-2 pb-2">
                {(['ALL', 'HEAVY', 'TOOLS', 'DIAGNOSTIC'] as FilterType[]).map(type => (
                    <button
                        key={type}
                        onClick={() => setActiveFilter(type)}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition flex items-center border ${activeFilter === type
                            ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-500/20'
                            : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-500 hover:text-slate-200'
                            }`}
                    >
                        {type === 'ALL' && <Filter className="w-3 h-3 mr-1.5" />}
                        {type}
                    </button>
                ))}
                <span className="ml-auto text-slate-500 text-sm">{filteredAssets.length} assets</span>
            </div>

            {/* ASSET GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredAssets.map((asset) => (
                    <div key={asset.id} className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden flex flex-col group hover:border-indigo-500 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1">

                        {/* IMAGE HEADER */}
                        <div className="relative h-48 bg-slate-900 overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent opacity-60 z-10" />
                            <img
                                src={asset.imageUrl}
                                alt={asset.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
                            />

                            {/* STATUS BADGE */}
                            <div className="absolute top-3 right-3 z-20">
                                <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wide border shadow-sm backdrop-blur-md ${asset.status === 'Available'
                                    ? 'bg-emerald-500/90 text-white border-emerald-400'
                                    : 'bg-slate-900/90 text-slate-400 border-slate-600'
                                    }`}>
                                    {asset.status === 'Available' ? 'Ready to Book' : 'Currently Rented'}
                                </span>
                            </div>

                            {/* PRICE TAG */}
                            <div className="absolute bottom-3 right-3 z-20 flex flex-col items-end">
                                <span className="text-2xl font-black text-white text-shadow-lg">${asset.dailyRate * rentalDays}</span>
                                <span className="text-[10px] text-slate-300 font-bold uppercase tracking-wider">
                                    {rentalDays} day{rentalDays > 1 ? 's' : ''} @ ${asset.dailyRate}/day
                                </span>
                            </div>
                        </div>

                        {/* CONTENT */}
                        <div className="p-5 flex-1 flex flex-col pt-4">
                            <div className="mb-4">
                                <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition leading-tight mb-1">{asset.name}</h3>
                                <div className="flex items-center text-xs text-slate-400">
                                    <span className="bg-slate-700 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold mr-2">{asset.category}</span>
                                    <MapPin className="w-3 h-3 mr-1" /> {asset.location}
                                </div>
                            </div>

                            <div className="bg-slate-900/50 rounded-lg p-3 mb-4 border border-slate-700/50">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center">
                                        <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-xs mr-2">
                                            {asset.ownerName.charAt(0)}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-slate-200">{asset.ownerName}</span>
                                            <span className="text-[10px] text-emerald-400 flex items-center">
                                                <BadgeCheck className="w-3 h-3 mr-1" /> Verified Owner
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center bg-slate-800 px-1.5 py-0.5 rounded text-amber-400 border border-slate-700">
                                        <Star className="w-3 h-3 mr-1 fill-current" />
                                        <span className="text-xs font-bold">4.9</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-auto flex items-center justify-between pt-2 border-t border-slate-700/50">
                                <div className="flex items-center text-slate-500 text-[10px] font-medium">
                                    <ShieldCheck className="w-3 h-3 mr-1 text-emerald-500" />
                                    $50k Insurance
                                </div>
                                <button
                                    onClick={() => handleBookClick(asset)}
                                    disabled={asset.status !== 'Available'}
                                    className={`px-4 py-2 rounded-lg font-bold text-xs transition uppercase tracking-wide ${asset.status === 'Available'
                                        ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/20'
                                        : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                                        }`}
                                >
                                    {asset.status === 'Available' ? 'Book Now' : 'Unavailable'}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Payment Modal */}
            {selectedAsset && (
                <PaymentModal
                    isOpen={isPaymentModalOpen}
                    onClose={() => setIsPaymentModalOpen(false)}
                    onSuccess={handlePaymentSuccess}
                    amount={selectedAsset.dailyRate * rentalDays}
                    assetName={selectedAsset.name}
                    assetId={selectedAsset.id}
                    rentalDays={rentalDays}
                    startDate={startDate}
                    dailyRate={selectedAsset.dailyRate}
                />
            )}

            {/* List Asset Modal */}
            <ListAssetModal
                isOpen={isListModalOpen}
                onClose={() => setIsListModalOpen(false)}
                onSuccess={handleListSuccess}
            />
        </div>
    );
};

