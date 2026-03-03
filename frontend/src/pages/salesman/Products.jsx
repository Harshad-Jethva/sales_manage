import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    Package,
    ChevronLeft,
    ChevronRight,
    Eye,
    ShoppingCart,
    ArrowUp,
    ArrowDown
} from 'lucide-react';
import axios from 'axios';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';

const Products = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [category, setCategory] = useState('');

    // Pagination & Sorting state
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [limit, setLimit] = useState(10);
    const [sortBy, setSortBy] = useState('name');
    const [sortOrder, setSortOrder] = useState('asc');

    // Debounce search input
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1); // Reset page on new search
        }, 300);
        return () => clearTimeout(handler);
    }, [search]);

    // Reset page when category changes
    useEffect(() => {
        setPage(1);
    }, [category]);

    useEffect(() => {
        fetchProducts();
    }, [debouncedSearch, category, page, limit, sortBy, sortOrder]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`http://localhost/sales_manage/backend/api/salesman/products.php`, {
                params: {
                    search: debouncedSearch,
                    category,
                    page,
                    limit,
                    sort_by: sortBy,
                    sort_order: sortOrder
                }
            });

            if (response.data.success) {
                setProducts(response.data.data);
                if (response.data.pagination) {
                    setTotalPages(response.data.pagination.total_pages);
                }
            } else {
                setProducts([]);
            }
        } catch (error) {
            console.error("Error fetching products:", error);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSort = (column) => {
        if (sortBy === column) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(column);
            setSortOrder('asc');
        }
    };

    const renderSortIcon = (column) => {
        if (sortBy !== column) return <ArrowUp size={14} className="opacity-0 group-hover:opacity-50 transition-opacity" />;
        return sortOrder === 'asc' ? <ArrowUp size={14} className="text-indigo-400" /> : <ArrowDown size={14} className="text-indigo-400" />;
    };

    return (
        <div className="product-listing p-4 lg:p-8">
            <Helmet>
                <title>Product Catalog | HAB CREATION</title>
            </Helmet>

            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white">Product Catalog</h1>
                    <p className="text-gray-400 mt-1">Explore available inventory, pricing and stock levels.</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                    <div className="relative flex-1 sm:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input
                            type="text"
                            placeholder="Search by name or SKU..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white outline-none focus:border-indigo-500/50 transition-all"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <select
                        className="bg-white/5 border border-white/10 rounded-xl py-3 px-6 text-white outline-none focus:border-indigo-500/50 transition-all cursor-pointer"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                    >
                        <option value="" className="bg-gray-900">All Categories</option>
                        <option value="Electronics" className="bg-gray-900">Electronics</option>
                        <option value="Hardware" className="bg-gray-900">Hardware</option>
                        <option value="Packaging" className="bg-gray-900">Packaging</option>
                    </select>
                </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-3xl backdrop-blur-xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/5 border-b border-white/10">
                                <th onClick={() => handleSort('name')} className="p-5 cursor-pointer group hover:bg-white/5 transition-colors select-none">
                                    <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                                        Product Info {renderSortIcon('name')}
                                    </div>
                                </th>
                                <th className="p-5 select-none">
                                    <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Category</div>
                                </th>
                                <th onClick={() => handleSort('sale_price')} className="p-5 cursor-pointer group hover:bg-white/5 transition-colors select-none">
                                    <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                                        Price {renderSortIcon('sale_price')}
                                    </div>
                                </th>
                                <th onClick={() => handleSort('stock_quantity')} className="p-5 cursor-pointer group hover:bg-white/5 transition-colors text-center select-none">
                                    <div className="flex items-center justify-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                                        Stock {renderSortIcon('stock_quantity')}
                                    </div>
                                </th>
                                <th className="p-5 text-right select-none">
                                    <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Actions</div>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            <AnimatePresence>
                                {loading ? (
                                    [...Array(limit > 10 ? 10 : limit)].map((_, index) => (
                                        <motion.tr key={`skeleton-${index}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                            <td className="p-5"><div className="h-10 bg-white/10 rounded animate-pulse w-48"></div></td>
                                            <td className="p-5"><div className="h-6 bg-white/10 rounded animate-pulse w-24"></div></td>
                                            <td className="p-5"><div className="h-6 bg-white/10 rounded animate-pulse w-20"></div></td>
                                            <td className="p-5"><div className="h-6 bg-white/10 rounded animate-pulse w-16 mx-auto"></div></td>
                                            <td className="p-5"><div className="h-10 bg-white/10 rounded animate-pulse w-32 ml-auto"></div></td>
                                        </motion.tr>
                                    ))
                                ) : products && products.length > 0 ? (
                                    products.map((product, idx) => (
                                        <motion.tr
                                            key={product.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className="hover:bg-white/5 transition-colors group"
                                        >
                                            <td className="p-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                                                        <Package size={24} />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-white font-bold text-base group-hover:text-indigo-400 transition-colors">{product.name}</h3>
                                                        <p className="text-xs text-gray-500 font-mono mt-1">SKU: {product.sku}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-5">
                                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/5 border border-white/10 text-gray-300">
                                                    {product.category || 'General'}
                                                </span>
                                            </td>
                                            <td className="p-5">
                                                <div>
                                                    <p className="text-white font-bold text-lg">₹{product.sale_price}</p>
                                                    <p className="text-[10px] text-gray-500">+{product.gst_percent}% GST</p>
                                                </div>
                                            </td>
                                            <td className="p-5 text-center">
                                                <span className={`px-3 py-1 rounded-full text-xs font-black tracking-widest border ${product.stock_quantity <= 5 ? 'text-rose-500 bg-rose-500/10 border-rose-500/20' :
                                                        product.stock_quantity <= 20 ? 'text-amber-500 bg-amber-500/10 border-amber-500/20' :
                                                            'text-emerald-500 bg-emerald-500/10 border-emerald-500/20'
                                                    }`}>
                                                    {product.stock_quantity}
                                                </span>
                                            </td>
                                            <td className="p-5">
                                                <div className="flex items-center justify-end gap-3">
                                                    <button
                                                        onClick={() => navigate(`/salesman/products/${product.id}`)}
                                                        className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition-all shadow-sm"
                                                        title="View Details"
                                                    >
                                                        <Eye size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => navigate('/salesman/place-order')}
                                                        className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-lg shadow-indigo-600/20"
                                                        title="Order Now"
                                                    >
                                                        <ShoppingCart size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="p-16 text-center">
                                            <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6 text-gray-600">
                                                <Package size={40} />
                                            </div>
                                            <h2 className="text-xl font-bold text-white">No products found</h2>
                                            <p className="text-gray-500 mt-2">Try adjusting your search or filters.</p>
                                        </td>
                                    </tr>
                                )}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {!loading && totalPages > 1 && (
                    <div className="p-5 border-t border-white/10 flex items-center justify-between bg-black/20">
                        <div className="text-sm text-gray-400">
                            Showing page <span className="font-bold text-white">{page}</span> of <span className="font-bold text-white">{totalPages}</span>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Products;
