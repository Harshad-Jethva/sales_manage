import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Filter, ArrowUpRight, ArrowDownRight,
    AlertTriangle, Package, History, RefreshCw,
    ChevronRight, Download, Eye, Plus, Minus, X
} from 'lucide-react';
import SEO from '../../components/common/SEO';
import { toast } from 'react-hot-toast';

const StockDetails = () => {
    const [stockData, setStockData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all'); // all, low, out
    const [showHistory, setShowHistory] = useState(null); // id of product to show history for
    const [historyData, setHistoryData] = useState([]);

    // Adjustment State
    const [adjustProduct, setAdjustProduct] = useState(null);
    const [adjustQty, setAdjustQty] = useState(0);
    const [adjustType, setAdjustType] = useState('adjustment'); // adjustment, return
    const [adjustNotes, setAdjustNotes] = useState('');

    useEffect(() => {
        fetchStock();
    }, []);

    const fetchStock = async () => {
        setLoading(true);
        try {
            const res = await axios.get('http://localhost/sales_manage/backend/api/stock.php');
            if (res.data.success) {
                setStockData(res.data.data);
            }
        } catch (err) {
            console.error("Failed to fetch stock", err);
            toast.error("Failed to load inventory data");
        } finally {
            setLoading(false);
        }
    };

    const fetchHistory = async (productId) => {
        try {
            const res = await axios.get(`http://localhost/sales_manage/backend/api/stock.php?action=history&product_id=${productId}`);
            if (res.data.success) {
                setHistoryData(res.data.data);
            }
        } catch (err) {
            console.error("Failed to fetch history", err);
        }
    };

    const handleAdjustStock = async () => {
        if (!adjustProduct || adjustQty === 0) return;

        try {
            const res = await axios.post('http://localhost/sales_manage/backend/api/stock.php', {
                action: 'update',
                product_id: adjustProduct.id,
                change: adjustQty,
                type: adjustType,
                notes: adjustNotes
            });

            if (res.data.success) {
                toast.success("Stock updated successfully");
                setAdjustProduct(null);
                setAdjustQty(0);
                setAdjustNotes('');
                fetchStock();
            } else {
                toast.error(res.data.error || "Failed to update stock");
            }
        } catch (err) {
            toast.error("Network error while updating stock");
        }
    };

    const filteredStock = stockData.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.sku?.toLowerCase().includes(searchTerm.toLowerCase());

        const qty = parseFloat(item.stock_quantity);
        const min = parseFloat(item.min_stock_level || 5);

        if (filterStatus === 'low') return matchesSearch && qty > 0 && qty <= min;
        if (filterStatus === 'out') return matchesSearch && qty <= 0;
        return matchesSearch;
    });

    const getStatusInfo = (qty, min) => {
        if (qty <= 0) return { label: 'Out of Stock', color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/20' };
        if (qty <= min) return { label: 'Low Stock', color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/20' };
        return { label: 'Normal', color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20' };
    };

    return (
        <div className="min-h-screen bg-[#0f172a] text-slate-200 p-6">
            <SEO title="Inventory Management" description="Real-time stock monitoring and control." />

            {/* Header */}
            <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                        Inventory Dashboard
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">Monitor and manage your product stock in real-time.</p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchStock}
                        className="p-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-all hover:scale-105"
                        title="Refresh Data"
                    >
                        <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl font-semibold transition-all shadow-lg shadow-blue-900/20">
                        <Download size={18} />
                        Export Report
                    </button>
                </div>
            </header>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                {[
                    { label: 'Total Items', val: stockData.length, icon: Package, color: 'blue' },
                    { label: 'Low Stock', val: stockData.filter(i => i.stock_quantity > 0 && i.stock_quantity <= (i.min_stock_level || 5)).length, icon: AlertTriangle, color: 'yellow' },
                    { label: 'Out of Stock', val: stockData.filter(i => i.stock_quantity <= 0).length, icon: AlertTriangle, color: 'red' },
                    { label: 'In Stock', val: stockData.filter(i => i.stock_quantity > (i.min_stock_level || 5)).length, icon: Eye, color: 'emerald' },
                ].map((stat, idx) => (
                    <motion.div
                        key={idx}
                        whileHover={{ y: -5 }}
                        className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-5 rounded-2xl"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <div className={`p-2.5 rounded-xl ${stat.color === 'blue' ? 'bg-blue-500/10 text-blue-400' :
                                stat.color === 'yellow' ? 'bg-yellow-500/10 text-yellow-400' :
                                    stat.color === 'red' ? 'bg-red-500/10 text-red-400' :
                                        'bg-emerald-500/10 text-emerald-400'
                                }`}>
                                <stat.icon size={20} />
                            </div>
                        </div>
                        <h3 className="text-slate-400 text-sm font-medium">{stat.label}</h3>
                        <p className="text-2xl font-bold mt-1">{stat.val}</p>
                    </motion.div>
                ))}
            </div>

            {/* Controls */}
            <div className="bg-slate-800/30 border border-slate-700/50 p-4 rounded-2xl mb-6 flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input
                        type="text"
                        placeholder="Search by name or SKU..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <Filter size={18} className="text-slate-500 mr-2" />
                    {['all', 'normal', 'low', 'out'].map(status => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-all ${filterStatus === status
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700 border border-slate-700'
                                }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl overflow-hidden backdrop-blur-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-900/50 border-b border-slate-700/50">
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Item Details</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Supplier</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Stock Qty</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Min Level</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/50">
                            <AnimatePresence>
                                {filteredStock.map((product) => {
                                    const status = getStatusInfo(product.stock_quantity, product.min_stock_level || 5);
                                    return (
                                        <motion.tr
                                            key={product.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="hover:bg-slate-700/20 transition-colors group"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-lg bg-slate-700 flex items-center justify-center text-slate-400 font-bold border border-slate-600">
                                                        {product.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-slate-200">{product.name}</p>
                                                        <p className="text-xs text-slate-500 font-mono">{product.sku || 'N/A'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-300 font-medium">
                                                {product.supplier_name || 'Generic Vendor'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className={`text-lg font-bold font-mono px-2 rounded w-fit ${parseFloat(product.stock_quantity) < 0 ? 'text-red-500 bg-red-500/10' : status.color}`}>
                                                        {product.stock_quantity}
                                                    </span>
                                                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-tight">Units Available</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-400 font-mono">
                                                {product.min_stock_level || 5}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${status.bg} ${status.color} ${status.border}`}>
                                                    {status.label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => setAdjustProduct(product)}
                                                        className="p-2 text-slate-500 hover:text-emerald-400 hover:bg-emerald-400/10 rounded-lg transition-all"
                                                        title="Adjust Stock"
                                                    >
                                                        <Plus size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setShowHistory(product.id);
                                                            fetchHistory(product.id);
                                                        }}
                                                        className="p-2 text-slate-500 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-all"
                                                        title="View History"
                                                    >
                                                        <History size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    );
                                })}
                            </AnimatePresence>
                            {!loading && filteredStock.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-slate-500 font-medium">
                                        No items found matching your criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Adjust Stock Modal */}
            <AnimatePresence>
                {adjustProduct && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setAdjustProduct(null)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl p-8 shadow-2xl"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-white">Manual Stock Update</h2>
                                <button onClick={() => setAdjustProduct(null)} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50 mb-6">
                                <p className="text-sm text-slate-400">Updating stock for:</p>
                                <p className="text-lg font-bold text-blue-400">{adjustProduct.name}</p>
                                <div className="flex justify-between mt-2">
                                    <span className="text-xs text-slate-500">Current Stock: <b className="text-slate-300 font-mono">{adjustProduct.stock_quantity}</b></span>
                                    <span className="text-xs text-slate-500">Min Level: <b className="text-slate-300 font-mono">{adjustProduct.min_stock_level || 5}</b></span>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-slate-500 mb-2 tracking-widest">Update Type</label>
                                    <div className="flex p-1 bg-slate-800 rounded-xl border border-slate-700">
                                        {['adjustment', 'return'].map(type => (
                                            <button
                                                key={type}
                                                onClick={() => setAdjustType(type)}
                                                className={`flex-1 py-2 rounded-lg text-sm font-bold capitalize transition-all ${adjustType === type ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-500 hover:text-slate-300'}`}
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase text-slate-500 mb-2 tracking-widest">Change Quantity</label>
                                    <div className="grid grid-cols-3 items-center bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
                                        <button
                                            onClick={() => setAdjustQty(q => q - 1)}
                                            className="h-14 flex items-center justify-center hover:bg-red-500/10 text-red-400 transition-colors border-r border-slate-700"
                                        >
                                            <Minus size={24} />
                                        </button>
                                        <input
                                            type="number"
                                            value={adjustQty}
                                            onChange={(e) => setAdjustQty(parseFloat(e.target.value) || 0)}
                                            className="bg-transparent text-center text-2xl font-bold font-mono outline-none"
                                        />
                                        <button
                                            onClick={() => setAdjustQty(q => q + 1)}
                                            className="h-14 flex items-center justify-center hover:bg-emerald-500/10 text-emerald-400 transition-colors border-l border-slate-700"
                                        >
                                            <Plus size={24} />
                                        </button>
                                    </div>
                                    <p className="text-[10px] text-slate-500 mt-2 italic text-center">Use negative values to reduce stock manually.</p>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase text-slate-500 mb-2 tracking-widest">Reason / Notes</label>
                                    <textarea
                                        placeholder="Add a reason for this adjustment..."
                                        value={adjustNotes}
                                        onChange={(e) => setAdjustNotes(e.target.value)}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-2xl p-4 text-sm outline-none focus:border-blue-500/50 min-h-[100px]"
                                    />
                                </div>

                                <button
                                    onClick={handleAdjustStock}
                                    disabled={adjustQty === 0}
                                    className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl transition-all shadow-xl shadow-blue-900/20 flex items-center justify-center gap-2"
                                >
                                    Confirm Update
                                    <RefreshCw size={18} />
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* History Sidebar/Modal */}
            <AnimatePresence>
                {showHistory && (
                    <div className="fixed inset-0 z-50 flex items-center justify-end">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowHistory(null)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="relative w-full max-w-md h-full bg-[#0f172a] shadow-2xl border-l border-slate-700 p-6 overflow-y-auto"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <History className="text-blue-400" />
                                    Stock History
                                </h2>
                                <button onClick={() => setShowHistory(null)} className="p-2 hover:bg-slate-800 rounded-lg">
                                    <ChevronRight size={24} />
                                </button>
                            </div>

                            {historyData.length === 0 ? (
                                <div className="text-center py-20 text-slate-500">
                                    No history recorded for this item yet.
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {historyData.map((log, idx) => (
                                        <div key={idx} className="bg-slate-800/40 border border-slate-700/50 p-4 rounded-xl">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded ${log.type === 'purchase' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                                    log.type === 'sale' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                                                        'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                                                    }`}>
                                                    {log.type}
                                                </span>
                                                <span className="text-xs text-slate-500 font-mono">
                                                    {new Date(log.created_at).toLocaleString()}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="flex flex-col">
                                                    <span className="text-xs text-slate-500 font-medium">Quantity</span>
                                                    <span className={`text-lg font-bold flex items-center gap-1 ${parseFloat(log.change_quantity) > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                                        {parseFloat(log.change_quantity) > 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                                                        {Math.abs(log.change_quantity)}
                                                    </span>
                                                </div>
                                                <div className="h-8 w-px bg-slate-700/50" />
                                                <div className="flex flex-col">
                                                    <span className="text-xs text-slate-500 font-medium">New Stock</span>
                                                    <span className={`text-lg font-bold px-2 rounded w-fit ${parseFloat(log.new_quantity) < 0 ? 'text-red-500 bg-red-500/10' : 'text-slate-200'}`}>
                                                        {log.new_quantity}
                                                    </span>
                                                </div>
                                            </div>
                                            {log.notes && (
                                                <p className="mt-3 text-xs text-slate-400 bg-slate-900/50 p-2 rounded italic border-l-2 border-slate-700">
                                                    {log.notes}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default StockDetails;
