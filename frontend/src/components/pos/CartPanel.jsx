import React, { useState, useMemo } from 'react';
import { Trash2, User, Plus, Pause, ShoppingCart, UserPlus, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CartPanel = ({
    cart = [],
    onUpdateQty,
    onRemove,
    onClear,
    onHold,
    onCheckout,
    client,
    onClientSelect,
    clients = []
}) => {
    const [discountType, setDiscountType] = useState('percent'); // percent or fixed
    const [globalDiscount, setGlobalDiscount] = useState(0);

    // Calculate totals
    const totals = useMemo(() => {
        const subTotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
        const taxTotal = cart.reduce((acc, item) => acc + (item.price * item.qty * (item.gst_percent / 100)), 0);

        let discountAmount = 0;
        if (discountType === 'percent') {
            discountAmount = (subTotal * globalDiscount) / 100;
        } else {
            discountAmount = globalDiscount;
        }

        const finalTotal = subTotal + taxTotal - discountAmount;

        return {
            subTotal,
            taxTotal,
            discountAmount,
            finalTotal: Math.max(0, finalTotal)
        };
    }, [cart, globalDiscount, discountType]);

    return (
        <div className="flex flex-col h-full bg-gray-900 border-l border-white/10 shadow-2xl backdrop-blur-3xl w-full max-w-md">
            {/* Header: Client & Actions */}
            <div className="p-4 border-b border-white/10 bg-gray-900/90 z-10 sticky top-0">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-white font-semibold">
                        <ShoppingCart className="text-indigo-400" size={20} />
                        <span>Current Sale</span>
                        <span className="text-xs text-gray-400 font-normal ml-2">#{Date.now().toString().slice(-6)}</span>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={onHold}
                            className="p-2 text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors"
                            title="Hold Bill"
                        >
                            <Pause size={18} />
                        </button>
                        <button
                            onClick={onClear}
                            className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Clear Cart"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                </div>

                {/* Client Selection */}
                <div className="relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-400 transition-colors">
                        <User size={18} />
                    </div>
                    <select
                        className="w-full bg-gray-800 border border-gray-700 text-white pl-10 pr-4 py-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none appearance-none cursor-pointer transition-all"
                        value={client?.id || ''}
                        onChange={(e) => {
                            const selected = clients.find(c => c.id == e.target.value);
                            onClientSelect(selected);
                        }}
                    >
                        <option value="">Select Customer (Walk-in)</option>
                        {clients.map(c => (
                            <option key={c.id} value={c.id}>{c.name} ({c.phone || 'No Phone'})</option>
                        ))}
                    </select>
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                        <UserPlus size={14} />
                    </div>
                </div>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-gray-800">
                <AnimatePresence initial={false}>
                    {cart.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col items-center justify-center h-full text-gray-500 space-y-4"
                        >
                            <FileText size={48} strokeWidth={1} />
                            <p>Cart is empty</p>
                            <p className="text-xs text-gray-600">Scan barcode or search products</p>
                        </motion.div>
                    ) : (
                        cart.map((item) => (
                            <motion.div
                                key={item.id}
                                layout
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-3 mb-2 hover:border-indigo-500/30 transition-colors group"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h4 className="text-white font-medium text-sm line-clamp-1">{item.name}</h4>
                                        <p className="text-xs text-gray-500 font-mono">₹{parseFloat(item.price).toFixed(2)} × {item.qty} {item.unit}</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-white font-mono font-bold text-sm">₹{(item.price * item.qty).toFixed(2)}</div>
                                        {item.gst_percent > 0 && (
                                            <div className="text-[10px] text-emerald-400">+{item.gst_percent}% GST</div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between bg-gray-900/50 p-1 rounded-lg">
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => onUpdateQty(item.id, item.qty - 1)}
                                            className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
                                            disabled={item.qty <= 1}
                                        >
                                            -
                                        </button>
                                        <input
                                            type="number"
                                            className="w-10 bg-transparent text-center text-sm font-mono text-white outline-none"
                                            value={item.qty}
                                            onChange={(e) => onUpdateQty(item.id, parseInt(e.target.value) || 1)}
                                            min="1"
                                        />
                                        <button
                                            onClick={() => onUpdateQty(item.id, item.qty + 1)}
                                            className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
                                        >
                                            +
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => onRemove(item.id)}
                                        className="p-1.5 text-red-400/70 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>

            {/* Footer: Totals & Checkout */}
            <div className="bg-gray-900 border-t border-white/5 p-4 space-y-3 z-10 sticky bottom-0 backdrop-blur-md">
                {/* Subtotals */}
                <div className="space-y-1 text-sm text-gray-400">
                    <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span className="font-mono text-white">₹{totals.subTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Tax (GST)</span>
                        <span className="font-mono text-white">₹{totals.taxTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center group">
                        <span className="flex items-center gap-2 cursor-pointer" onClick={() => setDiscountType(discountType === 'percent' ? 'fixed' : 'percent')}>
                            Discount ({discountType === 'percent' ? '%' : '₹'})
                        </span>
                        <input
                            type="number"
                            className="w-16 bg-gray-800 text-right text-xs rounded px-1 py-0.5 outline-none focus:ring-1 focus:ring-indigo-500 transition-all font-mono text-amber-400"
                            value={globalDiscount}
                            onChange={(e) => setGlobalDiscount(parseFloat(e.target.value) || 0)}
                            placeholder="0"
                        />
                    </div>
                    {totals.discountAmount > 0 && (
                        <div className="flex justify-between text-amber-400 text-xs">
                            <span>Discount Applied</span>
                            <span className="font-mono">- ₹{totals.discountAmount.toFixed(2)}</span>
                        </div>
                    )}
                </div>

                <div className="pt-3 border-t border-dashed border-gray-700">
                    <div className="flex justify-between items-end mb-4">
                        <span className="text-gray-300 font-medium">Grand Total</span>
                        <span className="text-2xl font-bold text-white font-mono bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
                            ₹{totals.finalTotal.toFixed(2)}
                        </span>
                    </div>

                    <button
                        onClick={() => onCheckout(totals)}
                        disabled={cart.length === 0}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-500/30 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 group"
                    >
                        <span>Proceed to Pay</span>
                        <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                            <span className="text-xs">{cart.length}</span>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CartPanel;
