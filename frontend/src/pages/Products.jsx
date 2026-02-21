import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Package, Tag, IndianRupee, BarChart2, Search, Edit3, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '', sku: '', mrp: '', sale_price: '', purchase_price: '', stock_quantity: '0', unit: 'pcs'
    });

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await axios.get('http://localhost/sales_manage/backend/api/products.php');
            setProducts(res.data);
        } catch (err) { console.error(err); }
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

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="products-page">
            <header className="page-header">
                <div>
                    <h1>Inventory Management</h1>
                    <p className="text-muted">Manage your stock, prices and product catalog.</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    <Plus size={20} /> Add Product
                </button>
            </header>

            <div className="stats-mini-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="glass-card">
                    <p className="text-muted">Total SKUs</p>
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Package color="#6366f1" /> {products.length}</h2>
                </div>
                <div className="glass-card">
                    <p className="text-muted">Low Stock</p>
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><BarChart2 color="#ef4444" /> {products.filter(p => p.stock_quantity < 10).length}</h2>
                </div>
            </div>

            <div className="glass-card">
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Name / SKU</th>
                                <th>MRP</th>
                                <th>Sale Price</th>
                                <th>Current Stock</th>
                                <th>Unit</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map(p => (
                                <tr key={p.id}>
                                    <td>
                                        <div className="prod-name">
                                            <span className="font-bold">{p.name}</span>
                                            <span className="text-muted" style={{ fontSize: '0.7rem' }}>#{p.sku || 'N/A'}</span>
                                        </div>
                                    </td>
                                    <td>₹{p.mrp}</td>
                                    <td className="font-bold">₹{p.sale_price}</td>
                                    <td className={p.stock_quantity < 10 ? 'text-danger' : ''}>{p.stock_quantity}</td>
                                    <td>{p.unit}</td>
                                    <td>
                                        <span className={`badge ${p.stock_quantity > 0 ? 'badge-paid' : 'badge-danger'}`}>
                                            {p.stock_quantity > 0 ? 'IN STOCK' : 'OUT OF STOCK'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="action-row">
                                            <button className="icon-btn"><Edit3 size={16} /></button>
                                            <button className="icon-btn text-danger"><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <div className="modal-root">
                    <div className="modal-overlay" onClick={() => setShowModal(false)} />
                    <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="glass-card modal">
                        <h2>New Product Entry</h2>
                        <form onSubmit={handleSubmit} style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div className="form-row">
                                <div className="input-group">
                                    <label>Product Name</label>
                                    <input required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                                </div>
                                <div className="input-group">
                                    <label>SKU / Barcode</label>
                                    <input value={formData.sku} onChange={(e) => setFormData({ ...formData, sku: e.target.value })} />
                                </div>
                            </div>
                            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                                <div className="input-group">
                                    <label>MRP</label>
                                    <input type="number" required value={formData.mrp} onChange={(e) => setFormData({ ...formData, mrp: e.target.value })} />
                                </div>
                                <div className="input-group">
                                    <label>Sale Price</label>
                                    <input type="number" required value={formData.sale_price} onChange={(e) => setFormData({ ...formData, sale_price: e.target.value })} />
                                </div>
                                <div className="input-group">
                                    <label>Stock Qty</label>
                                    <input type="number" value={formData.stock_quantity} onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })} />
                                </div>
                            </div>
                            <div className="modal-footer" style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Add Product</button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}

            <style jsx>{`
                .prod-name { display: flex; flex-direction: column; }
                .action-row { display: flex; gap: 0.5rem; }
                .modal { width: 100%; max-width: 600px; padding: 2rem; }
                .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
                .input-group label { display: block; margin-bottom: 0.5rem; font-size: 0.8rem; color: var(--text-muted); }
                .input-group input { 
                    width: 100%; padding: 0.75rem; background: rgba(255,255,255,0.03); 
                    border: 1px solid var(--border); border-radius: 8px; color: white;
                }
            `}</style>
        </motion.div>
    );
};

export default Products;
