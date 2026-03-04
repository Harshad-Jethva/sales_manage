import React, { useState, useEffect } from 'react';
import { X, PlayCircle, Trash2, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const HoldBillModal = ({ isOpen, onClose, savedBills, onResume, onDelete }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-gray-900 border border-white/10 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden h-[80vh] flex flex-col"
            >
                <div className="flex justify-between items-center p-4 border-b border-white/10 bg-gray-800/50">
                    <h2 className="text-xl font-bold text-white flex gap-2 items-center">
                        <Clock className="text-amber-400" />
                        Held Bills
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-gray-800">
                    {savedBills.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500">
                            <Clock size={48} strokeWidth={1} />
                            <p>No held bills</p>
                        </div>
                    ) : (
                        savedBills.map((bill) => (
                            <div key={bill.id} className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-4 flex justify-between items-center hover:bg-gray-800/60 transition-colors group">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-white font-medium">{bill.clientName || 'Walk-in Customer'}</span>
                                        <span className="text-xs text-gray-500 font-mono bg-gray-900 px-2 py-0.5 rounded border border-gray-800">
                                            {new Date(bill.timestamp).toLocaleString()}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-400 line-clamp-1">
                                        {bill.cart.length} items: {bill.cart.map(i => i.name).join(', ')}
                                    </p>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <div className="text-white font-bold font-mono text-lg">₹{bill.total.toFixed(2)}</div>
                                        <div className="text-xs text-amber-500/80">Pending</div>
                                    </div>

                                    <div className="flex gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => onResume(bill)}
                                            className="p-2 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white rounded-lg transition-colors"
                                            title="Resume"
                                        >
                                            <PlayCircle size={20} />
                                        </button>
                                        <button
                                            onClick={() => onDelete(bill.id)}
                                            className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-colors"
                                            title="Discard"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default HoldBillModal;
