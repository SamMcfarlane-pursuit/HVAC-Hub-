import React, { useState } from 'react';
import {
    X, Mail, User, Building2, Phone, MessageSquare,
    Loader2, CheckCircle, Send, AlertCircle
} from 'lucide-react';

interface ContactModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface FormData {
    name: string;
    email: string;
    company: string;
    phone: string;
    message: string;
}

interface FormErrors {
    name?: string;
    email?: string;
    message?: string;
}

type Step = 'form' | 'success';

export const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {
    const [step, setStep] = useState<Step>('form');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [referenceNumber, setReferenceNumber] = useState<string | null>(null);
    const [errors, setErrors] = useState<FormErrors>({});
    const [submitError, setSubmitError] = useState<string | null>(null);

    const [formData, setFormData] = useState<FormData>({
        name: '',
        email: '',
        company: '',
        phone: '',
        message: ''
    });

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Invalid email format';
        }

        if (!formData.message.trim()) {
            newErrors.message = 'Message is required';
        } else if (formData.message.trim().length < 10) {
            newErrors.message = 'Please provide more details';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitError(null);

        if (!validateForm()) return;

        setIsSubmitting(true);

        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to submit');
            }

            setReferenceNumber(data.referenceNumber);
            setStep('success');

        } catch (err) {
            setSubmitError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        // Reset state on close
        setStep('form');
        setFormData({ name: '', email: '', company: '', phone: '', message: '' });
        setErrors({});
        setSubmitError(null);
        setReferenceNumber(null);
        onClose();
    };

    const handleInputChange = (field: keyof FormData, value: string) => {
        setFormData({ ...formData, [field]: value });
        // Clear error when user types
        if (errors[field as keyof FormErrors]) {
            setErrors({ ...errors, [field]: undefined });
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeInUp">
            <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-2xl shadow-indigo-500/10 w-full max-w-lg overflow-hidden relative">

                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-900/60 to-purple-900/60 p-6 border-b border-slate-700">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="text-white font-bold text-lg flex items-center">
                                {step === 'success' ? (
                                    <><CheckCircle className="w-5 h-5 mr-2 text-emerald-500" /> Message Sent</>
                                ) : (
                                    <><Mail className="w-5 h-5 mr-2 text-indigo-400" /> Get In Touch</>
                                )}
                            </h3>
                            <p className="text-slate-400 text-sm">
                                {step === 'form'
                                    ? 'We\'ll respond within 24 hours'
                                    : 'Thank you for reaching out!'}
                            </p>
                        </div>
                        <button
                            onClick={handleClose}
                            className="text-slate-400 hover:text-white transition p-1 hover:bg-slate-700 rounded-lg"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    {submitError && (
                        <div className="bg-red-900/20 border border-red-900/50 p-3 rounded-lg mb-4 text-red-400 text-sm flex items-center">
                            <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                            {submitError}
                        </div>
                    )}

                    {step === 'form' && (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Name */}
                            <div>
                                <label className="block text-slate-400 text-xs uppercase font-bold mb-2">
                                    <User className="w-3 h-3 inline mr-1" /> Name *
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={e => handleInputChange('name', e.target.value)}
                                    className={`w-full bg-slate-900 border rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition ${errors.name ? 'border-red-500' : 'border-slate-700'}`}
                                    placeholder="Your full name"
                                />
                                {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-slate-400 text-xs uppercase font-bold mb-2">
                                    <Mail className="w-3 h-3 inline mr-1" /> Email *
                                </label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={e => handleInputChange('email', e.target.value)}
                                    className={`w-full bg-slate-900 border rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition ${errors.email ? 'border-red-500' : 'border-slate-700'}`}
                                    placeholder="you@company.com"
                                />
                                {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
                            </div>

                            {/* Company & Phone Row */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-slate-400 text-xs uppercase font-bold mb-2">
                                        <Building2 className="w-3 h-3 inline mr-1" /> Company
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.company}
                                        onChange={e => handleInputChange('company', e.target.value)}
                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition"
                                        placeholder="Optional"
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-400 text-xs uppercase font-bold mb-2">
                                        <Phone className="w-3 h-3 inline mr-1" /> Phone
                                    </label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={e => handleInputChange('phone', e.target.value)}
                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition"
                                        placeholder="Optional"
                                    />
                                </div>
                            </div>

                            {/* Message */}
                            <div>
                                <label className="block text-slate-400 text-xs uppercase font-bold mb-2">
                                    <MessageSquare className="w-3 h-3 inline mr-1" /> Message *
                                </label>
                                <textarea
                                    value={formData.message}
                                    onChange={e => handleInputChange('message', e.target.value)}
                                    rows={4}
                                    className={`w-full bg-slate-900 border rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none resize-none transition ${errors.message ? 'border-red-500' : 'border-slate-700'}`}
                                    placeholder="Tell us about your HVAC needs, questions, or how we can help..."
                                />
                                {errors.message && <p className="text-red-400 text-xs mt-1">{errors.message}</p>}
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-lg flex items-center justify-center transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20"
                            >
                                {isSubmitting ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>Send Message <Send className="w-4 h-4 ml-2" /></>
                                )}
                            </button>
                        </form>
                    )}

                    {step === 'success' && (
                        <div className="text-center py-6">
                            <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulseGlow text-emerald-500">
                                <CheckCircle className="w-10 h-10" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Message Received!</h3>
                            <p className="text-slate-400 mb-4">
                                Our team will review your inquiry and get back to you within 24 hours.
                            </p>
                            {referenceNumber && (
                                <div className="bg-slate-900 rounded-lg p-4 mb-4 inline-block">
                                    <div className="text-slate-400 text-xs uppercase font-bold mb-1">Reference Number</div>
                                    <div className="text-white font-mono text-lg">{referenceNumber}</div>
                                </div>
                            )}
                            <div className="pt-4">
                                <button
                                    onClick={handleClose}
                                    className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="bg-slate-900/50 p-3 border-t border-slate-800 text-center">
                    <p className="text-[10px] text-slate-500">
                        Your information is secure. We never share your data with third parties.
                    </p>
                </div>
            </div>
        </div>
    );
};
