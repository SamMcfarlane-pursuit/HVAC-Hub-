import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { X, Lock, CreditCard, Loader2, ShieldCheck, AlertTriangle } from 'lucide-react';

// Initialize Stripe Promise
// NOTE: Replaced with valid test publishable key if available, otherwise mock flow used
const stripePromise = loadStripe('pk_test_51O7...placeholder');

const API_BASE = typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? ''
    : '';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    amount: number;
    assetName: string;
    assetId: string;
}

const CheckoutForm = ({ onSuccess, onError, amount }: { onSuccess: () => void, onError: (msg: string) => void, amount: number }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [isProcessing, setIsProcessing] = useState(false);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!stripe || !elements) return;

        setIsProcessing(true);

        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: window.location.href, // In a real app, successful redirect
            },
            redirect: 'if_required'
        });

        if (error) {
            onError(error.message || "Payment failed");
            setIsProcessing(false);
        } else {
            onSuccess();
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <PaymentElement />
            <button
                disabled={!stripe || isProcessing}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-lg flex items-center justify-center transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : `Pay $${amount.toFixed(2)}`}
            </button>
        </form>
    );
};

const MockPaymentForm = ({ onSuccess, amount }: { onSuccess: () => void, amount: number }) => {
    const [isProcessing, setIsProcessing] = useState(false);

    const handleMockPay = (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);
        // Simulate network delay
        setTimeout(() => {
            onSuccess();
        }, 1500);
    };

    return (
        <form onSubmit={handleMockPay} className="space-y-4">
            <div className="bg-slate-900 border border-slate-700 p-4 rounded-lg">
                <label className="block text-slate-400 text-xs uppercase font-bold mb-2">Card Number (Demo)</label>
                <div className="flex items-center bg-slate-800 rounded px-3 py-2 border border-slate-700">
                    <CreditCard className="w-5 h-5 text-slate-500 mr-2" />
                    <input type="text" defaultValue="4242 4242 4242 4242" className="bg-transparent w-full text-white outline-none font-mono" readOnly />
                </div>
            </div>
            <div className="flex gap-4">
                <div className="flex-1 bg-slate-900 border border-slate-700 p-4 rounded-lg">
                    <label className="block text-slate-400 text-xs uppercase font-bold mb-2">Expiry</label>
                    <input type="text" defaultValue="12/30" className="bg-transparent w-full text-white outline-none font-mono" readOnly />
                </div>
                <div className="flex-1 bg-slate-900 border border-slate-700 p-4 rounded-lg">
                    <label className="block text-slate-400 text-xs uppercase font-bold mb-2">CVC</label>
                    <input type="text" defaultValue="123" className="bg-transparent w-full text-white outline-none font-mono" readOnly />
                </div>
            </div>

            <div className="text-xs text-amber-500 bg-amber-900/20 p-2 rounded border border-amber-900/50 flex items-center">
                <AlertTriangle className="w-3 h-3 mr-1" />
                <span>Test Mode: No real charges will be made.</span>
            </div>

            <button
                type="submit"
                disabled={isProcessing}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-lg flex items-center justify-center transition disabled:opacity-50"
            >
                {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : `Complete Demo Payment ($${amount.toFixed(2)})`}
            </button>
        </form>
    );
};

export const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, onSuccess, amount, assetName, assetId }) => {
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [isMockMode, setIsMockMode] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            const initPayment = async () => {
                setIsLoading(true);
                setError(null);
                try {
                    const res = await fetch(`${API_BASE}/api/payment`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ amount: Math.round(amount * 100), currency: 'usd', assetId })
                    });

                    if (!res.ok) throw new Error('Failed to initialize payment');

                    const data = await res.json();
                    setClientSecret(data.clientSecret);
                    setIsMockMode(!!data.isMock);

                } catch (err) {
                    setError("Could not load secure payment gateway.");
                } finally {
                    setIsLoading(false);
                }
            };
            initPayment();
        } else {
            // Reset state on close
            setClientSecret(null);
            setIsMockMode(false);
        }
    }, [isOpen, amount, assetId]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-2xl w-full max-w-md overflow-hidden relative">
                {/* Header */}
                <div className="bg-slate-900 p-6 border-b border-slate-700 flex justify-between items-center">
                    <div>
                        <h3 className="text-white font-bold text-lg flex items-center">
                            <ShieldCheck className="w-5 h-5 mr-2 text-emerald-500" /> Secure Checkout
                        </h3>
                        <p className="text-slate-400 text-xs">High-Value Asset Rental Protection</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition"><X className="w-5 h-5" /></button>
                </div>

                {/* Amount Display */}
                <div className="p-6 bg-slate-800/50">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <div className="text-slate-400 text-xs uppercase font-bold">Item</div>
                            <div className="text-white font-bold text-lg truncate w-48">{assetName}</div>
                        </div>
                        <div className="text-right">
                            <div className="text-slate-400 text-xs uppercase font-bold">Total</div>
                            <div className="text-emerald-400 font-bold text-2xl">${amount.toFixed(2)}</div>
                        </div>
                    </div>

                    {/* Payment Area */}
                    {isLoading ? (
                        <div className="py-12 flex flex-col items-center justify-center text-slate-400">
                            <Loader2 className="w-8 h-8 animate-spin mb-2 text-indigo-500" />
                            Initializing Secure Gateway...
                        </div>
                    ) : error ? (
                        <div className="bg-red-900/20 border border-red-900/50 p-4 rounded text-center">
                            <p className="text-red-400 text-sm font-bold mb-2">{error}</p>
                            <button onClick={onClose} className="text-xs text-slate-300 underline">Close</button>
                        </div>
                    ) : isMockMode ? (
                        <MockPaymentForm onSuccess={onSuccess} amount={amount} />
                    ) : (
                        clientSecret && (
                            <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'night', labels: 'floating' } }}>
                                <CheckoutForm onSuccess={onSuccess} onError={setError} amount={amount} />
                            </Elements>
                        )
                    )}
                </div>

                {/* Footer */}
                <div className="bg-slate-900/50 p-3 border-t border-slate-800 text-center">
                    <p className="text-[10px] text-slate-500 flex items-center justify-center">
                        <Lock className="w-3 h-3 mr-1" /> Payments processed securely. Encrypted via 256-bit SSL.
                    </p>
                </div>
            </div>
        </div>
    );
};
