import React from 'react';
import { X, Download, Printer, CheckCircle, Calendar, MapPin, CreditCard, Receipt as ReceiptIcon, User, Phone, Mail, Building } from 'lucide-react';
import { Order, Customer } from '../types';

interface ReceiptModalProps {
    isOpen: boolean;
    onClose: () => void;
    order: Order;
    customer: Customer;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ isOpen, onClose, order, customer }) => {
    if (!isOpen) return null;

    const handlePrint = () => {
        window.print();
    };

    const handleDownload = () => {
        // Create text receipt
        const receiptText = `
HVAC Hub Equipment Exchange
Receipt: ${order.receiptNumber}
Date: ${new Date(order.createdAt).toLocaleDateString()}
========================================

CUSTOMER
${customer.fullName}
${customer.email}
${customer.phone || ''}
${customer.billingAddress?.line1 || ''}
${customer.billingAddress?.city || ''}, ${customer.billingAddress?.state || ''} ${customer.billingAddress?.zip || ''}

----------------------------------------

RENTAL DETAILS
Item: ${order.assetName}
Rental Period: ${order.rentalDays} day(s)
Start: ${order.startDate}
End: ${order.endDate}

----------------------------------------

PAYMENT SUMMARY
Daily Rate: $${order.dailyRate.toFixed(2)}
Subtotal: $${order.subtotal.toFixed(2)}
Tax (8%): $${order.tax.toFixed(2)}
----------------------------------------
TOTAL: $${order.total.toFixed(2)}

Payment Method: ${order.paymentMethod.toUpperCase()}
Status: ${order.status}

========================================
Thank you for your business!
HVAC Hub - Equipment Exchange
    `.trim();

        const blob = new Blob([receiptText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `receipt-${order.receiptNumber}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn print:bg-white print:p-0">
            <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-2xl w-full max-w-lg overflow-hidden print:bg-white print:border-none print:shadow-none print:max-w-none">

                {/* Header */}
                <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 p-6 print:bg-emerald-600">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center">
                            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mr-4">
                                <CheckCircle className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <h2 className="text-white font-bold text-xl">Payment Successful</h2>
                                <p className="text-emerald-100 text-sm">Thank you for your rental!</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white/80 hover:text-white transition print:hidden"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Receipt Content */}
                <div className="p-6 space-y-6 print:text-black">

                    {/* Receipt Number & Date */}
                    <div className="flex justify-between items-center pb-4 border-b border-slate-700 print:border-slate-300">
                        <div>
                            <div className="text-slate-400 text-xs uppercase font-bold print:text-slate-600">Receipt</div>
                            <div className="text-white font-mono text-lg print:text-black">{order.receiptNumber}</div>
                        </div>
                        <div className="text-right">
                            <div className="text-slate-400 text-xs uppercase font-bold print:text-slate-600">Date</div>
                            <div className="text-white print:text-black">{new Date(order.createdAt).toLocaleDateString()}</div>
                        </div>
                    </div>

                    {/* Customer Info */}
                    <div className="bg-slate-900/50 rounded-lg p-4 print:bg-slate-100">
                        <h3 className="text-slate-400 text-xs uppercase font-bold mb-3 flex items-center print:text-slate-600">
                            <User className="w-4 h-4 mr-2" /> Billed To
                        </h3>
                        <div className="space-y-1 text-sm">
                            <div className="text-white font-semibold print:text-black">{customer.fullName}</div>
                            <div className="text-slate-300 flex items-center print:text-slate-700">
                                <Mail className="w-3 h-3 mr-2" /> {customer.email}
                            </div>
                            {customer.phone && (
                                <div className="text-slate-300 flex items-center print:text-slate-700">
                                    <Phone className="w-3 h-3 mr-2" /> {customer.phone}
                                </div>
                            )}
                            {customer.billingAddress?.line1 && (
                                <div className="text-slate-300 flex items-center print:text-slate-700">
                                    <Building className="w-3 h-3 mr-2" />
                                    {customer.billingAddress.line1}, {customer.billingAddress.city}, {customer.billingAddress.state} {customer.billingAddress.zip}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Rental Details */}
                    <div className="space-y-3">
                        <h3 className="text-slate-400 text-xs uppercase font-bold flex items-center print:text-slate-600">
                            <ReceiptIcon className="w-4 h-4 mr-2" /> Rental Details
                        </h3>
                        <div className="bg-slate-900 rounded-lg p-4 border border-slate-700 print:bg-white print:border-slate-300">
                            <div className="text-white font-semibold text-lg mb-2 print:text-black">{order.assetName}</div>
                            <div className="flex items-center text-slate-400 text-sm mb-3 print:text-slate-600">
                                <Calendar className="w-4 h-4 mr-2" />
                                {order.startDate} → {order.endDate} ({order.rentalDays} day{order.rentalDays > 1 ? 's' : ''})
                            </div>

                            {/* Price Breakdown */}
                            <div className="space-y-2 pt-3 border-t border-slate-700 print:border-slate-300">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-400 print:text-slate-600">Daily Rate</span>
                                    <span className="text-slate-300 print:text-slate-700">${order.dailyRate.toFixed(2)}/day</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-400 print:text-slate-600">Subtotal ({order.rentalDays} days)</span>
                                    <span className="text-slate-300 print:text-slate-700">${order.subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-400 print:text-slate-600">Tax (8%)</span>
                                    <span className="text-slate-300 print:text-slate-700">${order.tax.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-lg font-bold pt-2 border-t border-slate-600 print:border-slate-300">
                                    <span className="text-white print:text-black">Total</span>
                                    <span className="text-emerald-400 print:text-emerald-600">${order.total.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Payment Method */}
                    <div className="flex items-center justify-between text-sm bg-slate-900/50 rounded-lg p-3 print:bg-slate-100">
                        <div className="flex items-center text-slate-400 print:text-slate-600">
                            <CreditCard className="w-4 h-4 mr-2" />
                            Payment Method
                        </div>
                        <span className="text-white font-medium uppercase print:text-black">{order.paymentMethod}</span>
                    </div>
                </div>

                {/* Actions */}
                <div className="bg-slate-900/50 p-4 border-t border-slate-700 flex gap-3 print:hidden">
                    <button
                        onClick={handleDownload}
                        className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2.5 rounded-lg font-medium flex items-center justify-center transition"
                    >
                        <Download className="w-4 h-4 mr-2" /> Download
                    </button>
                    <button
                        onClick={handlePrint}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded-lg font-medium flex items-center justify-center transition"
                    >
                        <Printer className="w-4 h-4 mr-2" /> Print
                    </button>
                </div>
            </div>
        </div>
    );
};
