import React, { useState, useMemo } from 'react';
import { Search, Package, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ProductGrid = ({ products, onAddToCart }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    // Extract unique categories
    const categories = useMemo(() => {
        const cats = ['All'];
        products.forEach(p => {
            if (p.category && !cats.includes(p.category)) {
                cats.push(p.category);
            }
        });
        return cats;
    }, [products]);

    // Filter products
    const filteredProducts = useMemo(() => {
        return products.filter(p => {
            const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.sku?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
            return matchesSearch && matchesCategory;
        });
    }, [products, searchTerm, selectedCategory]);

    return (
        <div className="flex flex-col h-full bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden">
            {/* Search & Filter Header */}
            <div className="p-4 space-y-4 border-b border-white/10">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search products by name or SKU..."
                        className="w-full bg-gray-900/50 border border-gray-700 text-white pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Categories Chips */}
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-700">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${selectedCategory === cat
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                                    : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700 hover:text-white'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Product Grid */}
            <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-gray-700">
                {filteredProducts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-4">
                        <Package size={64} strokeWidth={1} />
                        <p>No products found</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        <AnimatePresence>
                            {filteredProducts.map((product) => (
                                <motion.div
                                    key={product.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    whileHover={{ scale: 1.02, translateY: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => onAddToCart(product)}
                                    className="group relative bg-gray-800/40 border border-gray-700/50 rounded-xl p-4 cursor-pointer hover:border-indigo-500/50 hover:bg-gray-800/60 transition-all shadow-lg"
                                >
                                    <div className="flex flex-col h-full justify-between">
                                        <div>
                                            {/* Optional: Add product image placeholder or real image if available */}
                                            <div className="mb-3 w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center text-indigo-400">
                                                {/* Icon based on category maybe? */}
                                                <Layers size={20} />
                                            </div>

                                            <h3 className="text-white font-medium text-sm line-clamp-2 mb-1 group-hover:text-indigo-300 transition-colors">
                                                {product.name}
                                            </h3>
                                            <p className="text-xs text-gray-500 font-mono mb-2">{product.sku}</p>
                                        </div>

                                        <div className="flex items-end justify-between mt-2">
                                            <div className="text-emerald-400 font-bold font-mono">
                                                ₹{parseFloat(product.sale_price).toFixed(2)}
                                            </div>
                                            <div className={`text-xs px-2 py-0.5 rounded-full backdrop-blur-sm ${product.stock_quantity > 10
                                                    ? 'bg-emerald-500/10 text-emerald-400'
                                                    : product.stock_quantity > 0
                                                        ? 'bg-amber-500/10 text-amber-400'
                                                        : 'bg-red-500/10 text-red-400'
                                                }`}>
                                                {product.stock_quantity} left
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductGrid;
