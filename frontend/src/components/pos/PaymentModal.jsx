import React, { useState, useEffect } from 'react';
import { X, Check, Printer, CreditCard, Banknote, Smartphone, Wallet, Landmark, UserCheck, AlertCircle, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PaymentModal = ({ isOpen, onClose, total, onConfirm, selectedClient }) => {
    const [tendered, setTendered] = useState('');
    const [method, setMethod] = useState('Cash');

    // Auto-fill tendered amount based on method selection
    useEffect(() => {
        if (method === 'Credit') {
            setTendered(''); // Usually 0 or partial for Credit
        } else if (method !== 'Cash') {
            setTendered(total.toString()); // Auto-fill full amount for digital
        }
    }, [method, total]);

    if (!isOpen) return null;

    const change = Math.max(0, (parseFloat(tendered) || 0) - total);
    const due = Math.max(0, total - (parseFloat(tendered) || 0));

    const handleConfirm = (shouldPrint) => {
        if (method === 'Credit' && !selectedClient) {
            alert("Error: A Customer Profile MUST be selected to process Credit (Udhar) transactions.");
            return;
        }

        onConfirm({
            paidAmount: parseFloat(tendered) || 0,
            method,
            printInvoice: shouldPrint,
            status: due > 0 ? (parseFloat(tendered) > 0 ? 'partial' : 'pending') : 'paid'
        });
    };

    const quickAmounts = [10, 50, 100, 500, 2000];

    const paymentMethods = [
        { id: 'Cash', icon: Banknote, color: 'text-emerald-400' },
        { id: 'Online', icon: Smartphone, color: 'text-purple-400' },
        { id: 'Credit', icon: UserCheck, color: 'text-red-400' }
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-gray-900 border border-white/10 w-full max-w-[550px] rounded-2xl shadow-2xl overflow-hidden"
            >
                <div className="flex justify-between items-center p-4 border-b border-white/10 bg-gray-800/50">
                    <h2 className="text-xl font-bold text-white flex gap-2 items-center">
                        <Wallet className="text-indigo-400" />
                        Finalize Payment
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
                    <div>
                        <label className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2 block">Payment Method</label>
                        <div className="grid grid-cols-3 gap-2">
                            {paymentMethods.map((m) => {
                                const Icon = m.icon;
                                const isSelected = method === m.id;
                                return (
                                    <button
                                        key={m.id}
                                        onClick={() => setMethod(m.id)}
                                        className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all h-20 ${isSelected
                                            ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/25 scale-105'
                                            : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700 hover:text-white'
                                            }`}
                                    >
                                        <Icon size={22} className={`mb-1 ${isSelected ? 'text-white' : m.color}`} />
                                        <span className="text-[10px] sm:text-xs font-bold text-center leading-tight">{m.id}</span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Dynamic Warning for Credit Account without Client */}
                        {method === 'Credit' && !selectedClient && (
                            <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="mt-2 p-2 rounded bg-red-900/40 border border-red-500/50 flex items-center gap-2 text-red-400 text-xs">
                                <AlertCircle size={14} className="flex-shrink-0" />
                                <span>No Customer selected! Bill balance cannot be tethered to a ledger.</span>
                            </motion.div>
                        )}
                        {method === 'Credit' && selectedClient && (
                            <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="mt-2 p-2 rounded bg-emerald-900/40 border border-emerald-500/50 flex items-center gap-2 text-emerald-400 text-xs">
                                <UserCheck size={14} className="flex-shrink-0" />
                                <span>Debt will be assigned to <strong>{selectedClient.name}</strong>'s ledger.</span>
                            </motion.div>
                        )}
                    </div>

                    {/* Tendered Input */}
                    <div className="space-y-2">
                        <label className="text-gray-400 text-sm flex justify-between">
                            <span>Amount Received Now</span>
                            {due > 0 && <span className="text-amber-400 text-xs font-mono font-bold bg-amber-900/30 px-2 py-0.5 rounded">Due: ₹{due.toFixed(2)}</span>}
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
                                <button
                                    onClick={() => setTendered(total.toString())}
                                    className="px-3 py-1 bg-gray-800 text-emerald-400 font-bold rounded-full text-xs hover:bg-emerald-600 hover:text-white transition-colors border border-gray-700"
                                >
                                    EXACT ₹{total.toFixed(0)}
                                </button>
                                {quickAmounts.map(amt => (
                                    <button
                                        key={amt}
                                        onClick={() => setTendered((parseFloat(tendered || 0) + amt).toString())}
                                        className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-xs hover:bg-indigo-600 hover:text-white transition-colors border border-gray-700"
                                    >
                                        +₹{amt}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setTendered('')}
                                    className="px-3 py-1 bg-gray-800 text-gray-500 rounded-full text-xs hover:bg-red-900 hover:text-white transition-colors border border-gray-700 ml-auto"
                                >
                                    CLEAR
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Change Display */}
                    {change > 0 && (
                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 flex justify-between items-center shadow-inner">
                            <span className="text-emerald-400 font-bold tracking-wide">Change to Return</span>
                            <span className="text-2xl font-black text-emerald-300 font-mono">₹{change.toFixed(2)}</span>
                        </div>
                    )}
                </div>

                <div className="p-4 bg-gray-900 border-t border-white/10 flex justify-end gap-3 rounded-b-2xl">
                    <button onClick={onClose} className="px-5 py-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors font-bold text-sm">
                        Cancel
                    </button>
                    <button
                        onClick={() => handleConfirm(false)}
                        className={`px-5 py-2 font-bold rounded-lg shadow-lg active:scale-[0.98] transition-all flex items-center gap-2 text-white ${(method === 'Credit' && !selectedClient)
                            ? 'bg-gray-600 cursor-not-allowed opacity-50'
                            : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/30'
                            }`}
                        disabled={method === 'Credit' && !selectedClient}
                    >
                        <Save size={18} />
                        <span>Save & Store</span>
                    </button>
                    <button
                        onClick={() => handleConfirm(true)}
                        className={`px-6 py-2 font-bold rounded-lg shadow-lg active:scale-[0.98] transition-all flex items-center gap-2 text-white ${(method === 'Credit' && !selectedClient)
                            ? 'bg-gray-600 cursor-not-allowed opacity-50'
                            : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-indigo-500/30'
                            }`}
                        disabled={method === 'Credit' && !selectedClient}
                    >
                        <Printer size={18} />
                        <span>Print Invoice</span>
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default PaymentModal;
