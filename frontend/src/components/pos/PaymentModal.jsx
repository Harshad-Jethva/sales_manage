import React, { useState, useEffect } from 'react';
import { X, Check, Printer, CreditCard, Banknote, Smartphone, Wallet } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PaymentModal = ({ isOpen, onClose, total, onConfirm }) => {
    const [tendered, setTendered] = useState('');
    const [method, setMethod] = useState('Cash');
    const [print, setPrint] = useState(true);

    if (!isOpen) return null;

    const change = Math.max(0, (parseFloat(tendered) || 0) - total);
    const due = Math.max(0, total - (parseFloat(tendered) || 0));

    const handleConfirm = () => {
        onConfirm({
            paidAmount: parseFloat(tendered) || 0,
            method,
            printInvoice: print,
            status: due > 0 ? 'partial' : 'paid'
        });
    };

    const quickAmounts = [10, 20, 50, 100, 200, 500, 2000];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-gray-900 border border-white/10 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden"
            >
                <div className="flex justify-between items-center p-4 border-b border-white/10 bg-gray-800/50">
                    <h2 className="text-xl font-bold text-white flex gap-2 items-center">
                        <Wallet className="text-indigo-400" />
                        Payment
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Total Display */}
                    <div className="text-center space-y-1">
                        <label className="text-gray-400 text-sm">Total Payable</label>
                        <div className="text-4xl font-mono font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">
                            ₹{total.toFixed(2)}
                        </div>
                    </div>

                    {/* Payment Methods */}
                    <div className="grid grid-cols-3 gap-3">
                        {['Cash', 'Card', 'UPI'].map((m) => (
                            <button
                                key={m}
                                onClick={() => setMethod(m)}
                                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${method === m
                                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/25'
                                        : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700 hover:text-white'
                                    }`}
                            >
                                {m === 'Cash' && <Banknote size={24} className="mb-1" />}
                                {m === 'Card' && <CreditCard size={24} className="mb-1" />}
                                {m === 'UPI' && <Smartphone size={24} className="mb-1" />}
                                <span className="text-sm font-medium">{m}</span>
                            </button>
                        ))}
                    </div>

                    {/* Tendered Input */}
                    <div className="space-y-2">
                        <label className="text-gray-400 text-sm flex justify-between">
                            <span>Amount Received</span>
                            {due > 0 && <span className="text-amber-400 text-xs font-mono">Due: ₹{due.toFixed(2)}</span>}
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-mono">₹</span>
                            <input
                                type="number"
                                autoFocus
                                className="w-full bg-gray-800 border border-gray-700 text-white pl-8 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-lg font-mono transition-all"
                                placeholder="0.00"
                                value={tendered}
                                onChange={(e) => setTendered(e.target.value)}
                            />
                        </div>
                        {/* Quick Cash Buttons */}
                        {method === 'Cash' && (
                            <div className="flex flex-wrap gap-2 pt-2">
                                {quickAmounts.map(amt => (
                                    <button
                                        key={amt}
                                        onClick={() => setTendered(amt.toString())}
                                        className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-xs hover:bg-indigo-600 hover:text-white transition-colors border border-gray-700"
                                    >
                                        +₹{amt}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Change Display */}
                    {change > 0 && (
                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 flex justify-between items-center">
                            <span className="text-emerald-400 font-medium">Change to Return</span>
                            <span className="text-xl font-bold text-emerald-300 font-mono">₹{change.toFixed(2)}</span>
                        </div>
                    )}

                    {/* Print Toggle */}
                    <div className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-xl border border-dashed border-gray-700 cursor-pointer" onClick={() => setPrint(!print)}>
                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${print ? 'bg-indigo-500 border-indigo-500' : 'border-gray-500'}`}>
                            {print && <Check size={14} className="text-white" />}
                        </div>
                        <div className="flex items-center gap-2 text-gray-300">
                            <Printer size={16} />
                            <span>Print Receipt</span>
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-gray-900 border-t border-white/10 flex justify-end gap-3">
                    <button onClick={onClose} className="px-5 py-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-lg shadow-lg shadow-indigo-500/30 active:scale-[0.98] transition-all flex items-center gap-2"
                    >
                        <span>Complete Sale</span>
                        <Check size={18} />
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default PaymentModal;
