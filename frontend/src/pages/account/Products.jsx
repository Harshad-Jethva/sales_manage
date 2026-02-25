import React, { useState, useEffect, useMemo, useRef } from 'react';
import axios from 'axios';
import { Plus, Package, Tag, IndianRupee, BarChart2, Search, Edit3, Trash2, X, AlertCircle } from 'lucide-react';
import gsap from 'gsap';
import SEO from '../../components/common/SEO';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [formData, setFormData] = useState({
        name: '', sku: '', mrp: '', sale_price: '', purchase_price: '', stock_quantity: '0', unit: 'pcs'
    });
    const containerRef = useRef(null);

    useEffect(() => {
        fetchProducts();
    }, []);

    useEffect(() => {
        if (!isLoading && containerRef.current) {
            gsap.fromTo(
                gsap.utils.toArray('.product-anim-el', containerRef.current),
                { y: 20, opacity: 0 },
                { y: 0, opacity: 1, stagger: 0.05, duration: 0.5, ease: "power2.out" }
            );
        }
    }, [isLoading, searchTerm]);

    const fetchProducts = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get('http://localhost/sales_manage/backend/api/products.php');
            setProducts(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost/sales_manage/backend/api/products.php', formData);
            if (res.data.success) {
                setShowModal(false);
                setFormData({ name: '', sku: '', mrp: '', sale_price: '', purchase_price: '', stock_quantity: '0', unit: 'pcs' });
                fetchProducts();
            }
        } catch (err) { console.error(err); }
    };

    const stats = useMemo(() => {
        const total = products.length;
        const lowStock = products.filter(p => p.stock_quantity > 0 && p.stock_quantity < 10).length;
        const outOfStock = products.filter(p => p.stock_quantity <= 0).length;
        const value = products.reduce((acc, p) => acc + (parseFloat(p.purchase_price) * parseFloat(p.stock_quantity || 0)), 0);
        return { total, lowStock, outOfStock, value };
    }, [products]);

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="animate-fade-in" ref={containerRef}>
            <SEO title="Inventory & Catalog" description="Manage your product stock, SKUs, and pricing." />
            <header className="page-header product-anim-el">
                <div>
                    <h1 className="page-title">Inventory & Catalog</h1>
                    <p className="page-subtitle">Manage your product stock, SKUs, and pricing.</p>
                </div>
                <button className="erp-button erp-button-primary shadow-lg" onClick={() => setShowModal(true)}>
                    <Plus size={18} /> Add Product
                </button>
            </header>

            {/* Stats Summary */}
            <div className="erp-grid erp-grid-cards mb-8">
                <div className="erp-card flex items-center gap-4 product-anim-el">
                    <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl">
                        <Package size={28} />
                    </div>
                    <div>
                        <h4 className="text-secondary text-sm font-semibold">Total SKUs</h4>
                        <h2 className="text-white text-2xl font-bold">{stats.total}</h2>
                    </div>
                </div>

                <div className="erp-card flex items-center gap-4 border-l-4 border-warning/50 product-anim-el">
                    <div className="p-3 bg-warning/10 text-warning rounded-xl">
                        <BarChart2 size={28} />
                    </div>
                    <div>
                        <h4 className="text-secondary text-sm font-semibold">Low Stock</h4>
                        <h2 className="text-white text-2xl font-bold">{stats.lowStock}</h2>
                    </div>
                </div>

                <div className="erp-card flex items-center gap-4 border-l-4 border-danger/50 product-anim-el">
                    <div className="p-3 bg-danger/10 text-danger rounded-xl">
                        <AlertCircle size={28} />
                    </div>
                    <div>
                        <h4 className="text-secondary text-sm font-semibold">Out of Stock</h4>
                        <h2 className="text-white text-2xl font-bold">{stats.outOfStock}</h2>
                    </div>
                </div>

                <div className="erp-card flex items-center gap-4 product-anim-el">
                    <div className="p-3 bg-success/10 text-success rounded-xl">
                        <IndianRupee size={28} />
                    </div>
                    <div>
                        <h4 className="text-secondary text-sm font-semibold">Inventory Value</h4>
                        <h2 className="text-white text-2xl font-bold">₹{stats.value?.toLocaleString() || 0}</h2>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="erp-card mb-6 py-3 px-4 flex flex-col sm:flex-row gap-4 justify-between items-center rounded-xl bg-surface-hover border-[rgba(255,255,255,0.05)] product-anim-el">
                <div className="relative w-full sm:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        className="erp-input pl-10 w-full"
                        placeholder="Search products by name or SKU..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="erp-card product-anim-el">
                <div className="erp-table-container">
                    <table className="erp-table">
                        <thead>
                            <tr>
                                <th>Product Details</th>
                                <th>MRP</th>
                                <th>Sale Price</th>
                                <th>Stock</th>
                                <th>Status</th>
                                <th className="text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-8">
                                        <div className="skeleton h-8 w-full rounded mb-2"></div>
                                        <div className="skeleton h-8 w-full rounded mb-2"></div>
                                        <div className="skeleton h-8 w-full rounded"></div>
                                    </td>
                                </tr>
                            ) : filteredProducts.length > 0 ? (
                                filteredProducts.map(p => (
                                    <tr key={p.id}>
                                        <td>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded bg-slate-800 flex items-center justify-center text-slate-400 border border-slate-700">
                                                    <Tag size={18} />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-white text-sm">{p.name}</div>
                                                    <div className="text-xs font-mono text-slate-400 mt-0.5">#{p.sku || 'N/A'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="text-slate-300 font-mono">₹{parseFloat(p.mrp || 0).toLocaleString()}</td>
                                        <td className="font-bold text-success font-mono">₹{parseFloat(p.sale_price || 0).toLocaleString()}</td>
                                        <td>
                                            <span className={`font-mono font-bold ${p.stock_quantity < 10 ? 'text-danger' : 'text-slate-300'}`}>
                                                {p.stock_quantity} <span className="text-xs font-normal text-slate-500 uppercase">{p.unit}</span>
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`erp-badge ${p.stock_quantity > 0 ? (p.stock_quantity < 10 ? 'badge-warning' : 'badge-success') : 'badge-neutral bg-slate-800 text-slate-400 border-slate-700'}`}>
                                                {p.stock_quantity > 0 ? (p.stock_quantity < 10 ? 'LOW STOCK' : 'IN STOCK') : 'OUT OF STOCK'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="flex gap-2 justify-end">
                                                <button className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-md transition-colors" title="Edit">
                                                    <Edit3 size={16} />
                                                </button>
                                                <button className="p-1.5 text-danger opacity-70 hover:opacity-100 hover:bg-red-500/10 rounded-md transition-colors" title="Delete">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="text-center py-12 text-slate-400">
                                        <Package size={48} className="mx-auto mb-3 opacity-20" />
                                        <p>No products found in the catalog.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
                    <div className="erp-card relative z-10 w-full max-w-2xl bg-surface p-0 overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-5 border-b border-[rgba(255,255,255,0.05)] flex justify-between items-center bg-surface-hover">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                <Package size={20} className="text-primary" /> New Product Entry
                            </h2>
                            <button className="text-slate-400 hover:text-white transition-colors" onClick={() => setShowModal(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto">
                            <form id="productForm" onSubmit={handleSubmit} className="flex flex-col gap-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Product Name <span className="text-danger">*</span></label>
                                        <input required className="erp-input w-full" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Enter product name" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">SKU / Barcode</label>
                                        <input className="erp-input w-full" value={formData.sku} onChange={(e) => setFormData({ ...formData, sku: e.target.value })} placeholder="Stock Keeping Unit" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 border-t border-[rgba(255,255,255,0.05)] pt-5">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Purchase Cost</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">₹</span>
                                            <input type="number" step="0.01" className="erp-input w-full pl-8" value={formData.purchase_price} onChange={(e) => setFormData({ ...formData, purchase_price: e.target.value })} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">MRP <span className="text-danger">*</span></label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">₹</span>
                                            <input type="number" step="0.01" required className="erp-input w-full pl-8" value={formData.mrp} onChange={(e) => setFormData({ ...formData, mrp: e.target.value })} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Sale Price <span className="text-danger">*</span></label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">₹</span>
                                            <input type="number" step="0.01" required className="erp-input w-full pl-8 font-bold text-success" value={formData.sale_price} onChange={(e) => setFormData({ ...formData, sale_price: e.target.value })} />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 border-t border-[rgba(255,255,255,0.05)] pt-5">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Initial Stock Qty</label>
                                        <input type="number" className="erp-input w-full" value={formData.stock_quantity} onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Unit of Measurement</label>
                                        <select className="erp-input w-full appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M7%2010L12%2015L17%2010%22%20stroke%3D%22%2394A3B8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[length:16px_16px] bg-no-repeat bg-[position:right_12px_center]" value={formData.unit} onChange={(e) => setFormData({ ...formData, unit: e.target.value })}>
                                            <option value="pcs">Pieces (pcs)</option>
                                            <option value="kg">Kilograms (kg)</option>
                                            <option value="g">Grams (g)</option>
                                            <option value="ltr">Liters (ltr)</option>
                                            <option value="box">Box (box)</option>
                                        </select>
                                    </div>
                                </div>
                            </form>
                        </div>

                        <div className="p-5 border-t border-[rgba(255,255,255,0.05)] bg-surface-hover flex justify-end gap-3 mt-auto">
                            <button type="button" className="erp-button erp-button-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                            <button type="submit" form="productForm" className="erp-button erp-button-primary">Save Product</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Products;
