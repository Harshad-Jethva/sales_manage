import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
    Calendar,
    AlertCircle,
    CheckCircle,
    Clock,
    Search,
    Filter,
    Download,
    FileText,
    ExternalLink,
    Box,
    Building2,
    CalendarDays
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import SEO from '../../components/common/SEO';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

const ExpiryManagement = () => {
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [supplierFilter, setSupplierFilter] = useState('all');
    const containerRef = useRef(null);

    useEffect(() => {
        fetchInventory();
    }, []);

    const fetchInventory = async () => {
        setLoading(true);
        try {
            const res = await axios.get('http://localhost/sales_manage/backend/api/expiry.php?action=list');
            if (res.data.success) {
                setInventory(res.data.data || []);
            }
        } catch (err) {
            console.error("Fetch Expiry Inventory Error:", err);
        } finally {
            setLoading(false);
        }
    };

    const getStatus = (days) => {
        if (days <= 0) return { label: 'Expired', color: 'danger', icon: <AlertCircle size={14} /> };
        if (days <= 7) return { label: 'Expiring Soon (7d)', color: 'warning', icon: <Clock size={14} /> };
        if (days <= 30) return { label: 'Expiring Soon (30d)', color: 'warning-soft', icon: <CalendarDays size={14} /> };
        return { label: 'Healthy', color: 'success', icon: <CheckCircle size={14} /> };
    };

    const filteredInventory = inventory.filter(item => {
        const matchesSearch = item.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.id && item.id.toString().includes(searchTerm));
        const days = parseInt(item.remaining_days || 0);
        let matchesStatus = true;
        if (statusFilter === 'expired') matchesStatus = days <= 0;
        else if (statusFilter === 'soon7') matchesStatus = days > 0 && days <= 7;
        else if (statusFilter === 'soon30') matchesStatus = days > 0 && days <= 30;
        else if (statusFilter === 'healthy') matchesStatus = days > 30;

        const matchesSupplier = supplierFilter === 'all' || item.supplier_name === supplierFilter;

        return matchesSearch && matchesStatus && matchesSupplier;
    });

    const suppliers = [...new Set(inventory.map(i => i.supplier_name).filter(Boolean))];

    const exportToPDF = () => {
        const doc = new jsPDF('p', 'mm', 'a4');
        doc.setFontSize(18);
        doc.text('Expiry Inventory Report', 14, 22);
        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);

        const tableData = filteredInventory.map(item => [
            item.id,
            item.item_name,
            item.supplier_name || 'N/A',
            item.mfg_date || 'N/A',
            item.expiry_date || 'N/A',
            item.remaining_days,
            item.stock_quantity,
            getStatus(item.remaining_days).label
        ]);

        doc.autoTable({
            startY: 35,
            head: [['ID', 'Item Name', 'Supplier', 'MFG', 'EXP', 'Days Left', 'Stock', 'Status']],
            body: tableData,
            theme: 'grid',
            headStyles: { fillColor: [79, 70, 229] }
        });

        doc.save(`Expiry_Report_${Date.now()}.pdf`);
    };

    const exportToExcel = () => {
        const ws = XLSX.utils.json_to_sheet(filteredInventory.map(item => ({
            'Item ID': item.id,
            'Item Name': item.item_name,
            'Supplier': item.supplier_name || 'N/A',
            'Manufacturing Date': item.mfg_date || 'N/A',
            'Expiry Date': item.expiry_date || 'N/A',
            'Days Remaining': item.remaining_days,
            'Stock Balance': item.stock_quantity,
            'Status': getStatus(item.remaining_days).label
        })));
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Expiry Inventory");
        XLSX.writeFile(wb, `Expiry_Inventory_${Date.now()}.xlsx`);
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="expiry-management-container" ref={containerRef}>
            <SEO title="Expiry Management" description="Monitor and manage inventory expiry dates and alerts." />

            <header className="page-header">
                <div>
                    <h1>Expiry Management</h1>
                    <p className="text-muted text-sm">Monitor stock health and track item expiration lifecycles.</p>
                </div>
                <div className="header-actions">
                    <button className="btn-secondary-glass" onClick={exportToExcel}><Download size={18} /> Excel</button>
                    <button className="btn-primary-gradient" onClick={exportToPDF}><FileText size={18} /> Export PDF</button>
                </div>
            </header>

            <div className="stats-grid mb-8">
                <div className="stat-card glass-card">
                    <div className="stat-icon bg-red-500/20 text-red-500"><AlertCircle size={24} /></div>
                    <div className="stat-info">
                        <h3>{inventory.filter(i => parseInt(i.remaining_days) <= 0).length}</h3>
                        <p>Already Expired</p>
                    </div>
                </div>
                <div className="stat-card glass-card">
                    <div className="stat-icon bg-orange-500/20 text-orange-500"><Clock size={24} /></div>
                    <div className="stat-info">
                        <h3>{inventory.filter(i => parseInt(i.remaining_days) > 0 && parseInt(i.remaining_days) <= 7).length}</h3>
                        <p>Expiring in 7 Days</p>
                    </div>
                </div>
                <div className="stat-card glass-card">
                    <div className="stat-icon bg-yellow-500/20 text-yellow-500"><CalendarDays size={24} /></div>
                    <div className="stat-info">
                        <h3>{inventory.filter(i => parseInt(i.remaining_days) > 7 && parseInt(i.remaining_days) <= 30).length}</h3>
                        <p>Expiring in 30 Days</p>
                    </div>
                </div>
                <div className="stat-card glass-card">
                    <div className="stat-icon bg-emerald-500/20 text-emerald-500"><CheckCircle size={24} /></div>
                    <div className="stat-info">
                        <h3>{inventory.filter(i => parseInt(i.remaining_days) > 30).length}</h3>
                        <p>Healthy Stock</p>
                    </div>
                </div>
            </div>

            <div className="filter-bar glass-card mb-6 p-4">
                <div className="search-box">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Search item by name or ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="filters">
                    <div className="filter-group">
                        <Filter size={16} />
                        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                            <option value="all">All Status</option>
                            <option value="expired">Expired</option>
                            <option value="soon7">Expiring (7d)</option>
                            <option value="soon30">Expiring (30d)</option>
                            <option value="healthy">Healthy</option>
                        </select>
                    </div>
                    <div className="filter-group">
                        <Building2 size={16} />
                        <select value={supplierFilter} onChange={(e) => setSupplierFilter(e.target.value)}>
                            <option value="all">All Suppliers</option>
                            {suppliers.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            <div className="table-area glass-card">
                {loading ? (
                    <div className="loading-state p-12 text-center">
                        <div className="spinner mb-4"></div>
                        <p>Analyzing Expiry Data...</p>
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="modern-table">
                            <thead>
                                <tr>
                                    <th>Item ID</th>
                                    <th>Product Name</th>
                                    <th>Supplier</th>
                                    <th>MFG Date</th>
                                    <th>Expiry Date</th>
                                    <th>Stock Qty</th>
                                    <th>Days to Expiry</th>
                                    <th>Health Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                <AnimatePresence>
                                    {filteredInventory.length > 0 ? (
                                        filteredInventory.map((item) => {
                                            const status = getStatus(parseInt(item.remaining_days));
                                            return (
                                                <motion.tr
                                                    key={item.id}
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    whileHover={{ backgroundColor: 'rgba(255,255,255,0.02)' }}
                                                >
                                                    <td className="font-mono text-xs text-indigo-400">#{item.id}</td>
                                                    <td>
                                                        <div className="item-cell">
                                                            <div className="item-icon"><Box size={14} /></div>
                                                            <span className="font-bold">{item.item_name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="text-muted">{item.supplier_name || 'Generic'}</td>
                                                    <td className="text-sm">{item.mfg_date || '-'}</td>
                                                    <td className="text-sm font-bold">{item.expiry_date}</td>
                                                    <td>
                                                        <span className="stock-badge">{item.stock_quantity}</span>
                                                    </td>
                                                    <td>
                                                        <span className={`days-badge ${status.color}`}>
                                                            {item.remaining_days} days
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className={`status-pill ${status.color}`}>
                                                            {status.icon} {status.label}
                                                        </span>
                                                    </td>
                                                </motion.tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan="8" className="empty-state p-12 text-center">
                                                <div className="mb-4 text-muted"><Search size={48} /></div>
                                                <p className="text-muted">No items matching your criteria.</p>
                                            </td>
                                        </tr>
                                    )}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <style>{`
                .expiry-management-container {
                    padding: 2rem;
                    max-width: 1400px;
                    margin: 0 auto;
                }
                .page-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 2rem;
                }
                .page-header h1 {
                    font-size: 2rem;
                    font-weight: 800;
                    margin: 0;
                    background: linear-gradient(135deg, #fff 0%, #a5b4fc 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                .text-muted { color: #94a3b8; }
                .text-sm { font-size: 0.875rem; }
                .glass-card {
                    background: rgba(30, 41, 59, 0.7);
                    backdrop-filter: blur(16px);
                    border: 1px solid rgba(255,255,255,0.08);
                    border-radius: 16px;
                }
                .btn-primary-gradient {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.75rem 1.5rem;
                    background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
                    border: none;
                    border-radius: 10px;
                    color: #fff;
                    font-weight: 600;
                    cursor: pointer;
                    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
                }
                .btn-secondary-glass {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.75rem 1.5rem;
                    background: rgba(255,255,255,0.05);
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 10px;
                    color: #fff;
                    font-weight: 600;
                    cursor: pointer;
                }
                .header-actions {
                    display: flex;
                    gap: 1rem;
                }
                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 1.5rem;
                }
                .stat-card {
                    padding: 1.5rem;
                    display: flex;
                    align-items: center;
                    gap: 1.25rem;
                }
                .stat-icon {
                    width: 48px;
                    height: 48px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .stat-info h3 {
                    font-size: 1.5rem;
                    font-weight: 700;
                    margin: 0;
                    color: #fff;
                }
                .stat-info p {
                    font-size: 0.8rem;
                    color: #94a3b8;
                    margin: 0;
                    white-space: nowrap;
                }
                .filter-bar {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 2rem;
                }
                .search-box {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    background: rgba(0,0,0,0.2);
                    padding: 0.6rem 1rem;
                    border-radius: 10px;
                    border: 1px solid rgba(255,255,255,0.05);
                }
                .search-box input {
                    background: none;
                    border: none;
                    color: #fff;
                    width: 100%;
                    outline: none;
                }
                .filters {
                    display: flex;
                    gap: 1rem;
                }
                .filter-group {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    background: rgba(0,0,0,0.2);
                    padding: 0.4rem 0.8rem;
                    border-radius: 8px;
                    border: 1px solid rgba(255,255,255,0.05);
                }
                .filter-group select {
                    background: none;
                    border: none;
                    color: #fff;
                    outline: none;
                    cursor: pointer;
                }
                .modern-table {
                    width: 100%;
                    border-collapse: collapse;
                }
                .modern-table th {
                    text-align: left;
                    padding: 1.25rem 1rem;
                    font-size: 0.75rem;
                    text-transform: uppercase;
                    color: #94a3b8;
                    border-bottom: 2px solid rgba(255,255,255,0.05);
                }
                .modern-table td {
                    padding: 1.25rem 1rem;
                    border-bottom: 1px solid rgba(255,255,255,0.03);
                    color: #e2e8f0;
                }
                .item-cell {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }
                .item-icon {
                    width: 28px;
                    height: 28px;
                    background: rgba(99, 102, 241, 0.15);
                    color: #818cf8;
                    border-radius: 6px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .stock-badge {
                    background: rgba(255,255,255,0.05);
                    padding: 0.25rem 0.75rem;
                    border-radius: 20px;
                    font-weight: 700;
                }
                .days-badge {
                    font-weight: 700;
                    font-size: 0.85rem;
                }
                .status-pill {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.4rem;
                    padding: 0.4rem 0.8rem;
                    border-radius: 20px;
                    font-size: 0.75rem;
                    font-weight: 700;
                    text-transform: uppercase;
                }
                .danger { background: rgba(239, 68, 68, 0.15); color: #ef4444; }
                .warning { background: rgba(249, 115, 22, 0.15); color: #f97316; }
                .warning-soft { background: rgba(234, 179, 8, 0.15); color: #eab308; }
                .success { background: rgba(16, 185, 129, 0.15); color: #10b981; }

                .spinner {
                    width: 40px;
                    height: 40px;
                    border: 3px solid rgba(99, 102, 241, 0.2);
                    border-top-color: #6366f1;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin: 0 auto;
                }
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
        </motion.div>
    );
};

export default ExpiryManagement;
