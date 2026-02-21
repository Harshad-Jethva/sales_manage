import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
    Plus, Search, Phone, Mail, MapPin, Filter,
    Building2, UserCircle, Briefcase, Hash,
    Edit, Trash2, AlertCircle, ShoppingBag, Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Stores = () => {
    const navigate = useNavigate();
    const [suppliers, setSuppliers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSuppliers();
    }, []);

    const fetchSuppliers = async () => {
        try {
            const res = await axios.get('http://localhost/sales_manage/backend/api/stores.php');
            setSuppliers(Array.isArray(res.data) ? res.data : []);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation(); // Prevent card click
        if (window.confirm("Are you sure you want to remove this supplier?")) {
            try {
                const res = await axios.delete(`http://localhost/sales_manage/backend/api/stores.php?id=${id}`);
                if (res.data.success) {
                    setSuppliers(suppliers.filter(s => s.id !== id));
                    alert("Supplier removed.");
                } else {
                    alert("Failed to delete.");
                }
            } catch (err) { console.error(err); }
        }
    };

    const filteredSuppliers = suppliers.filter(s =>
        s.supplier_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.contact_person && s.contact_person.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (s.phone && s.phone.includes(searchTerm))
    );

    const stats = useMemo(() => {
        return {
            total: suppliers.length,
            active: suppliers.length // Mock logic
        };
    }, [suppliers]);

    return (
        <div className="stores-hub">
            <header className="page-header">
                <div>
                    <motion.h1 initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>Supply Chain Masters</motion.h1>
                    <motion.p initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="text-muted">
                        Manage your vendors and procurement channels.
                    </motion.p>
                </div>
                <div className="header-actions">
                    <div className="stat-pill">
                        <ShoppingBag size={18} />
                        <span>{stats.total} Active Suppliers</span>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="btn-primary-gradient"
                        onClick={() => navigate('/stores/add')}
                    >
                        <Plus size={20} /> Register Supplier
                    </motion.button>
                </div>
            </header>

            <div className="filters-bar">
                <div className="search-box">
                    <Search size={20} />
                    <input
                        placeholder="Search suppliers by name, person, or phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="filter-group">
                    <button className="btn-filter active"><Filter size={16} /> All Vendors</button>
                    {/* Placeholder for future filters */}
                </div>
            </div>

            <div className="stores-grid">
                <AnimatePresence>
                    {filteredSuppliers.map((sup, index) => (
                        <motion.div
                            key={sup.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="store-card glass-card"
                            onClick={() => navigate(`/stores/view?id=${sup.id}`)}
                            whileHover={{ y: -5 }}
                        >
                            <div className="card-top">
                                <div className="store-icon">
                                    <Building2 size={24} />
                                </div>
                                <div className="card-actions">
                                    <button className="action-btn view" onClick={(e) => { e.stopPropagation(); navigate(`/stores/view?id=${sup.id}`); }}>
                                        <Eye size={16} />
                                    </button>
                                    <button className="action-btn edit" onClick={(e) => { e.stopPropagation(); navigate('/stores/update', { state: { supplier: sup } }); }}>
                                        <Edit size={16} />
                                    </button>
                                    <button className="action-btn delete" onClick={(e) => { e.stopPropagation(); navigate('/stores/delete', { state: { supplier: sup } }); }}>
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="store-info">
                                <h3>{sup.supplier_name}</h3>
                                <div className="info-row highlight">
                                    <UserCircle size={16} /> <span>{sup.contact_person || 'No Contact'}</span>
                                </div>
                                <div className="info-row">
                                    <Phone size={16} /> <span>{sup.phone || '--'}</span>
                                </div>
                                <div className="info-row">
                                    <Mail size={16} /> <span>{sup.email || '--'}</span>
                                </div>
                                <div className="info-row address">
                                    <MapPin size={16} /> <span>{sup.address || 'Address not provided'}</span>
                                </div>
                            </div>

                            <div className="card-footer">
                                <span className="status-badge"><Briefcase size={12} /> Supplier</span>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
                {filteredSuppliers.length === 0 && !loading && (
                    <div className="empty-state">
                        <AlertCircle size={48} />
                        <p>No suppliers found matching your search.</p>
                    </div>
                )}
            </div>

            <style jsx>{`
                .stores-hub {
                    max-width: 1600px;
                    margin: 0 auto;
                    padding-bottom: 5rem;
                    color: white;
                }
                .page-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 3rem;
                }
                .page-header h1 {
                    font-size: 2.5rem;
                    font-weight: 800;
                    margin: 0;
                    background: linear-gradient(135deg, #fff 0%, #a5b4fc 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                .text-muted { color: #94a3b8; font-size: 1.1rem; }
                
                .header-actions { display: flex; gap: 1.5rem; align-items: center; }
                .stat-pill {
                    display: flex; align-items: center; gap: 0.5rem;
                    background: rgba(255,255,255,0.05); padding: 0.8rem 1.2rem;
                    border-radius: 50px; border: 1px solid rgba(255,255,255,0.1);
                    color: #fff; font-weight: 600;
                }
                .btn-primary-gradient {
                    display: flex; align-items: center; gap: 0.8rem;
                    padding: 0.8rem 2rem;
                    background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
                    border: none; border-radius: 12px; color: #fff;
                    cursor: pointer; box-shadow: 0 4px 20px rgba(99, 102, 241, 0.4);
                    font-weight: 700; font-size: 1rem; transition: 0.3s;
                }
                .btn-primary-gradient:hover { transform: translateY(-2px); box-shadow: 0 6px 25px rgba(99, 102, 241, 0.6); }

                .filters-bar {
                    display: flex; justify-content: space-between; align-items: center;
                    margin-bottom: 2.5rem; padding: 1rem;
                    background: rgba(0,0,0,0.2); border-radius: 16px;
                    border: 1px solid rgba(255,255,255,0.05);
                }
                .search-box {
                    display: flex; align-items: center; gap: 1rem;
                    background: rgba(255,255,255,0.05); padding: 0.8rem 1.2rem;
                    border-radius: 12px; width: 400px;
                }
                .search-box:focus-within { background: rgba(255,255,255,0.1); box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.5); }
                .search-box input {
                    background: none; border: none; color: white;
                    width: 100%; outline: none; font-size: 1rem;
                }

                .stores-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
                    gap: 2rem;
                }
                .store-card {
                    background: rgba(30, 41, 59, 0.7);
                    backdrop-filter: blur(16px);
                    border: 1px solid rgba(255,255,255,0.08);
                    border-radius: 24px;
                    padding: 1.5rem;
                    display: flex; flex-direction: column; gap: 1rem;
                    cursor: pointer;
                    transition: border-color 0.2s;
                    position: relative;
                }
                .store-card:hover { border-color: rgba(99, 102, 241, 0.5); background: rgba(30, 41, 59, 0.9); }
                
                .card-top { display: flex; justify-content: space-between; align-items: flex-start; }
                .store-icon {
                    width: 56px; height: 56px;
                    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                    border-radius: 16px;
                    display: flex; align-items: center; justify-content: center;
                    color: white; box-shadow: 0 8px 16px rgba(16, 185, 129, 0.3);
                }
                .card-actions { display: flex; gap: 0.5rem; opacity: 0; transition: 0.3s; }
                .store-card:hover .card-actions { opacity: 1; }
                .action-btn {
                    width: 32px; height: 32px; border-radius: 8px;
                    display: flex; align-items: center; justify-content: center;
                    background: rgba(255,255,255,0.1); border: none;
                    color: white; cursor: pointer; transition: 0.2s;
                }
                .action-btn.view:hover { background: #3b82f6; }
                .action-btn.edit:hover { background: #8b5cf6; }
                .action-btn.delete:hover { background: #ef4444; }

                .store-info h3 { margin: 0.5rem 0; font-size: 1.4rem; color: #fff; }
                .info-row {
                    display: flex; align-items: center; gap: 0.8rem;
                    padding: 0.5rem 0; color: #cbd5e1; font-size: 0.95rem;
                    border-bottom: 1px solid rgba(255,255,255,0.03);
                }
                .info-row.highlight { color: #818cf8; font-weight: 600; }
                .info-row.address { align-items: flex-start; }
                .info-row:last-child { border-bottom: none; }

                .card-footer {
                    margin-top: auto; padding-top: 1rem;
                    display: flex; justify-content: space-between;
                }
                .status-badge {
                    display: flex; align-items: center; gap: 0.4rem;
                    font-size: 0.75rem; font-weight: 700;
                    background: rgba(16, 185, 129, 0.15); color: #34d399;
                    padding: 0.3rem 0.8rem; border-radius: 6px;
                }
                
                .empty-state { text-align: center; padding: 4rem; color: #64748b; grid-column: 1 / -1; }
            `}</style>
        </div>
    );
};

export default Stores;
