import React, { useState } from 'react';
import { X, Upload, DollarSign, MapPin, Tag, Image, Loader2, Check } from 'lucide-react';

interface ListAssetModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const ListAssetModal: React.FC<ListAssetModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [name, setName] = useState('');
    const [category, setCategory] = useState('Heavy Equipment');
    const [dailyRate, setDailyRate] = useState('');
    const [location, setLocation] = useState('New York, NY');
    const [ownerName, setOwnerName] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isComplete, setIsComplete] = useState(false);

    if (!isOpen) return null;

    const categories = [
        'Heavy Equipment',
        'Power Tools',
        'Diagnostic Equipment',
        'Machinery',
        'Hand Tools',
        'Safety Equipment'
    ];

    const handleSubmit = async () => {
        if (!name || !dailyRate) return;

        setIsSubmitting(true);
        try {
            const res = await fetch('/api/assets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    category,
                    dailyRate: parseFloat(dailyRate),
                    location,
                    ownerName: ownerName || 'Anonymous',
                    imageUrl: imageUrl || undefined
                })
            });

            if (res.ok) {
                setIsComplete(true);
                setTimeout(() => {
                    onSuccess();
                    handleReset();
                }, 1500);
            }
        } catch (err) {
            console.error('Failed to list asset', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReset = () => {
        setName('');
        setCategory('Heavy Equipment');
        setDailyRate('');
        setLocation('New York, NY');
        setOwnerName('');
        setImageUrl('');
        setIsComplete(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-white">List Your Asset</h2>
                        <p className="text-slate-400 text-sm">Share your equipment with the network</p>
                    </div>
                    <button onClick={handleReset} className="text-slate-500 hover:text-white transition">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6">
                    {isComplete ? (
                        <div className="text-center py-12 animate-in fade-in zoom-in">
                            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Check className="w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">Asset Listed!</h3>
                            <p className="text-slate-400">Your equipment is now available for rental</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Name */}
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">
                                    <Tag className="w-4 h-4 inline mr-1" /> Equipment Name *
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g., Industrial Air Compressor"
                                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                            </div>

                            {/* Category */}
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Category</label>
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-indigo-500"
                                >
                                    {categories.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Daily Rate */}
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">
                                    <DollarSign className="w-4 h-4 inline mr-1" /> Daily Rate *
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                                    <input
                                        type="number"
                                        value={dailyRate}
                                        onChange={(e) => setDailyRate(e.target.value)}
                                        placeholder="150"
                                        className="w-full pl-8 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>

                            {/* Location */}
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">
                                    <MapPin className="w-4 h-4 inline mr-1" /> Location
                                </label>
                                <input
                                    type="text"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    placeholder="New York, NY"
                                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            {/* Owner Name */}
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Your Name / Company</label>
                                <input
                                    type="text"
                                    value={ownerName}
                                    onChange={(e) => setOwnerName(e.target.value)}
                                    placeholder="HVAC Solutions Inc."
                                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            {/* Image URL */}
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">
                                    <Image className="w-4 h-4 inline mr-1" /> Image URL (optional)
                                </label>
                                <input
                                    type="text"
                                    value={imageUrl}
                                    onChange={(e) => setImageUrl(e.target.value)}
                                    placeholder="https://..."
                                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    onClick={handleReset}
                                    className="px-4 py-2 text-slate-400 hover:text-white font-medium transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    disabled={!name || !dailyRate || isSubmitting}
                                    onClick={handleSubmit}
                                    className={`px-6 py-2 rounded-xl font-bold text-white flex items-center transition-all
                                        ${!name || !dailyRate
                                            ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                                            : 'bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-900/20'
                                        }
                                    `}
                                >
                                    {isSubmitting ? (
                                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Listing...</>
                                    ) : (
                                        <><Upload className="w-4 h-4 mr-2" /> List Asset</>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
