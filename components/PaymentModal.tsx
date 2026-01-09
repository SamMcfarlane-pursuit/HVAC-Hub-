import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { X, Lock, CreditCard, Loader2, ShieldCheck, AlertTriangle, User, Mail, Phone, MapPin, ChevronRight, ChevronLeft, CheckCircle } from 'lucide-react';
import { Customer, Order, BillingAddress } from '../types';
import { ReceiptModal } from './ReceiptModal';

// Initialize Stripe Promise
const stripePromise = loadStripe('pk_test_51O7...placeholder');

const API_BASE = typeof window !== 'undefined' && window.location.hostname === 'localhost' ? '' : '';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (order: Order) => void;
    amount: number;
    assetName: string;
    assetId: string;
    rentalDays: number;
    startDate: string;
    dailyRate: number;
}

type Step = 'info' | 'payment' | 'success';

interface CustomerFormData {
    fullName: string;
    email: string;
    phone: string;
    billingLine1: string;
    billingLine2: string;
    billingCity: string;
    billingState: string;
    billingZip: string;
    saveForFuture: boolean;
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
            confirmParams: { return_url: window.location.href },
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

const MockPaymentForm = ({ onSuccess, amount, isProcessing }: { onSuccess: () => void, amount: number, isProcessing: boolean }) => {
    const handleMockPay = (e: React.FormEvent) => {
        e.preventDefault();
        onSuccess();
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
                {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : `Complete Payment ($${amount.toFixed(2)})`}
            </button>
        </form>
    );
};

export const PaymentModal: React.FC<PaymentModalProps> = ({
    isOpen, onClose, onSuccess, amount, assetName, assetId, rentalDays, startDate, dailyRate
}) => {
    const [step, setStep] = useState<Step>('info');
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [isMockMode, setIsMockMode] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Customer info
    const [formData, setFormData] = useState<CustomerFormData>({
        fullName: '',
        email: '',
        phone: '',
        billingLine1: '',
        billingLine2: '',
        billingCity: '',
        billingState: '',
        billingZip: '',
        saveForFuture: true
    });

    // Result
    const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
    const [savedCustomer, setSavedCustomer] = useState<Customer | null>(null);

    // Load existing customer data
    useEffect(() => {
        if (isOpen) {
            fetchCustomer();
        } else {
            resetState();
        }
    }, [isOpen]);

    const fetchCustomer = async () => {
        try {
            const res = await fetch('/api/customers');
            if (res.ok) {
                const customer = await res.json();
                setFormData({
                    fullName: customer.fullName || '',
                    email: customer.email || '',
                    phone: customer.phone || '',
                    billingLine1: customer.billingAddress?.line1 || '',
                    billingLine2: customer.billingAddress?.line2 || '',
                    billingCity: customer.billingAddress?.city || '',
                    billingState: customer.billingAddress?.state || '',
                    billingZip: customer.billingAddress?.zip || '',
                    saveForFuture: true
                });
                setSavedCustomer(customer);
            }
        } catch (err) {
            console.log('No existing customer data');
        }
    };

    const resetState = () => {
        setStep('info');
        setClientSecret(null);
        setError(null);
        setCreatedOrder(null);
        setIsProcessing(false);
    };

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

    const handleInfoSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate required fields
        if (!formData.fullName || !formData.email) {
            setError('Name and email are required');
            return;
        }

        // Save customer data
        if (formData.saveForFuture) {
            try {
                const billingAddress: BillingAddress = {
                    line1: formData.billingLine1,
                    line2: formData.billingLine2,
                    city: formData.billingCity,
                    state: formData.billingState,
                    zip: formData.billingZip,
                    country: 'US'
                };

                const res = await fetch('/api/customers', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        fullName: formData.fullName,
                        email: formData.email,
                        phone: formData.phone,
                        billingAddress,
                        saveForFuture: true
                    })
                });

                if (res.ok) {
                    const customer = await res.json();
                    setSavedCustomer(customer);
                }
            } catch (err) {
                console.error('Failed to save customer', err);
            }
        }

        setError(null);
        await initPayment();
        setStep('payment');
    };

    const handlePaymentSuccess = async () => {
        setIsProcessing(true);

        // Calculate end date
        const start = new Date(startDate);
        const end = new Date(start);
        end.setDate(end.getDate() + rentalDays);

        try {
            // Create order
            const orderRes = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customerId: savedCustomer?.id || 'guest',
                    assetId,
                    assetName,
                    rentalDays,
                    dailyRate,
                    startDate,
                    endDate: end.toISOString().split('T')[0],
                    paymentIntentId: clientSecret?.split('_secret')[0]
                })
            });

            if (orderRes.ok) {
                const order = await orderRes.json();
                setCreatedOrder(order);
                setStep('success');
                onSuccess(order);
            } else {
                throw new Error('Failed to create order');
            }
        } catch (err) {
            setError('Payment successful but order creation failed. Contact support.');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleClose = () => {
        if (step === 'success') {
            resetState();
        }
        onClose();
    };

    if (!isOpen) return null;

    // Calculate totals for display
    const subtotal = dailyRate * rentalDays;
    const tax = Math.round(subtotal * 0.08 * 100) / 100;
    const total = subtotal + tax;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-2xl w-full max-w-lg overflow-hidden relative">

                {/* Header */}
                <div className="bg-slate-900 p-6 border-b border-slate-700">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="text-white font-bold text-lg flex items-center">
                                {step === 'success' ? (
                                    <><CheckCircle className="w-5 h-5 mr-2 text-emerald-500" /> Order Complete</>
                                ) : (
                                    <><ShieldCheck className="w-5 h-5 mr-2 text-emerald-500" /> Secure Checkout</>
                                )}
                            </h3>
                            <p className="text-slate-400 text-xs">
                                {step === 'info' && 'Step 1: Your Information'}
                                {step === 'payment' && 'Step 2: Payment Details'}
                                {step === 'success' && 'Thank you for your rental!'}
                            </p>
                        </div>
                        <button onClick={handleClose} className="text-slate-400 hover:text-white transition">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Progress bar */}
                    {step !== 'success' && (
                        <div className="flex gap-2 mt-4">
                            <div className={`h-1 flex-1 rounded ${step === 'info' || step === 'payment' ? 'bg-emerald-500' : 'bg-slate-700'}`} />
                            <div className={`h-1 flex-1 rounded ${step === 'payment' ? 'bg-emerald-500' : 'bg-slate-700'}`} />
                        </div>
                    )}
                </div>

                {/* Order Summary */}
                <div className="px-6 py-4 bg-slate-800/50 border-b border-slate-700">
                    <div className="flex justify-between items-center">
                        <div>
                            <div className="text-slate-400 text-xs uppercase font-bold">Item</div>
                            <div className="text-white font-bold truncate max-w-[200px]">{assetName}</div>
                            <div className="text-slate-500 text-xs">{rentalDays} day{rentalDays > 1 ? 's' : ''} @ ${dailyRate}/day</div>
                        </div>
                        <div className="text-right">
                            <div className="text-slate-400 text-xs uppercase font-bold">Total</div>
                            <div className="text-emerald-400 font-bold text-2xl">${total.toFixed(2)}</div>
                            <div className="text-slate-500 text-[10px]">incl. tax</div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 max-h-[50vh] overflow-y-auto">
                    {error && (
                        <div className="bg-red-900/20 border border-red-900/50 p-3 rounded-lg mb-4 text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Step 1: Customer Info */}
                    {step === 'info' && (
                        <form onSubmit={handleInfoSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label className="block text-slate-400 text-xs uppercase font-bold mb-2">
                                        <User className="w-3 h-3 inline mr-1" /> Full Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.fullName}
                                        onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-emerald-500/50 outline-none"
                                        placeholder="John Smith"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-400 text-xs uppercase font-bold mb-2">
                                        <Mail className="w-3 h-3 inline mr-1" /> Email *
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-emerald-500/50 outline-none"
                                        placeholder="john@company.com"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-400 text-xs uppercase font-bold mb-2">
                                        <Phone className="w-3 h-3 inline mr-1" /> Phone
                                    </label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-emerald-500/50 outline-none"
                                        placeholder="(555) 123-4567"
                                    />
                                </div>
                            </div>

                            {/* Billing Address */}
                            <div className="pt-4 border-t border-slate-700">
                                <label className="block text-slate-400 text-xs uppercase font-bold mb-3">
                                    <MapPin className="w-3 h-3 inline mr-1" /> Billing Address
                                </label>
                                <div className="space-y-3">
                                    <input
                                        type="text"
                                        value={formData.billingLine1}
                                        onChange={e => setFormData({ ...formData, billingLine1: e.target.value })}
                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-emerald-500/50 outline-none"
                                        placeholder="Street address"
                                    />
                                    <div className="grid grid-cols-3 gap-2">
                                        <input
                                            type="text"
                                            value={formData.billingCity}
                                            onChange={e => setFormData({ ...formData, billingCity: e.target.value })}
                                            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-white focus:ring-2 focus:ring-emerald-500/50 outline-none text-sm"
                                            placeholder="City"
                                        />
                                        <input
                                            type="text"
                                            value={formData.billingState}
                                            onChange={e => setFormData({ ...formData, billingState: e.target.value })}
                                            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-white focus:ring-2 focus:ring-emerald-500/50 outline-none text-sm"
                                            placeholder="State"
                                        />
                                        <input
                                            type="text"
                                            value={formData.billingZip}
                                            onChange={e => setFormData({ ...formData, billingZip: e.target.value })}
                                            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-white focus:ring-2 focus:ring-emerald-500/50 outline-none text-sm"
                                            placeholder="ZIP"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Save checkbox */}
                            <label className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.saveForFuture}
                                    onChange={e => setFormData({ ...formData, saveForFuture: e.target.checked })}
                                    className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-emerald-500 focus:ring-emerald-500"
                                />
                                Save information for future purchases
                            </label>

                            <button
                                type="submit"
                                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-lg flex items-center justify-center transition"
                            >
                                Continue to Payment <ChevronRight className="w-5 h-5 ml-1" />
                            </button>
                        </form>
                    )}

                    {/* Step 2: Payment */}
                    {step === 'payment' && (
                        <div className="space-y-4">
                            <button
                                onClick={() => setStep('info')}
                                className="text-slate-400 hover:text-white text-sm flex items-center transition mb-2"
                            >
                                <ChevronLeft className="w-4 h-4 mr-1" /> Back to Info
                            </button>

                            {isLoading ? (
                                <div className="py-12 flex flex-col items-center justify-center text-slate-400">
                                    <Loader2 className="w-8 h-8 animate-spin mb-2 text-indigo-500" />
                                    Initializing Secure Gateway...
                                </div>
                            ) : isMockMode ? (
                                <MockPaymentForm onSuccess={handlePaymentSuccess} amount={total} isProcessing={isProcessing} />
                            ) : (
                                clientSecret && (
                                    <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'night', labels: 'floating' } }}>
                                        <CheckoutForm onSuccess={handlePaymentSuccess} onError={setError} amount={total} />
                                    </Elements>
                                )
                            )}
                        </div>
                    )}

                    {/* Step 3: Success */}
                    {step === 'success' && createdOrder && savedCustomer && (
                        <div className="text-center py-6">
                            <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="w-10 h-10 text-emerald-500" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Payment Successful!</h3>
                            <p className="text-slate-400 mb-4">Your rental has been confirmed.</p>
                            <div className="bg-slate-900 rounded-lg p-4 mb-4 text-left">
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-slate-400">Receipt #</span>
                                    <span className="text-white font-mono">{createdOrder.receiptNumber}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-400">Total Paid</span>
                                    <span className="text-emerald-400 font-bold">${createdOrder.total.toFixed(2)}</span>
                                </div>
                            </div>
                            <p className="text-slate-500 text-xs">A confirmation email has been sent to {savedCustomer.email}</p>
                        </div>
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
