import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
    FileText,
    Download,
    Calendar,
    BarChart3,
    PieChart,
    Grid,
    Search,
    ChevronRight,
    ArrowDownLeft,
    Box,
    Building2,
    CalendarDays,
    AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SEO from '../../components/common/SEO';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

const ExpiryReports = () => {
    const [reportType, setReportType] = useState('soon');
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [daysRange, setDaysRange] = useState(30);
    const containerRef = useRef(null);

    useEffect(() => {
        fetchReport();
    }, [reportType, daysRange]);

    const fetchReport = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`http://localhost/sales_manage/backend/api/expiry.php?action=reports&type=${reportType}&days=${daysRange}`);
            if (res.data.success) {
                setReportData(res.data.data || []);
            }
        } catch (err) {
            console.error("Fetch Report Error:", err);
        } finally {
            setLoading(false);
        }
    };

    const exportToPDF = () => {
        const doc = new jsPDF('p', 'mm', 'a4');
        const title = reportType === 'soon' ? `Expiring Soon Report (${daysRange} days)` :
            reportType === 'expired' ? 'Expired Items Report' : 'Supplier Expiry Analysis';

        doc.setFontSize(18);
        doc.text(title, 14, 22);
        doc.setFontSize(10);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28);

        const tableData = reportData.map(item => [
            item.id,
            item.name,
            item.supplier_name || 'N/A',
            item.mfg_date || 'N/A',
            item.expiry_date || 'N/A',
            item.stock_quantity,
            item.purchase_price
        ]);

        doc.autoTable({
            startY: 35,
            head: [['ID', 'Product', 'Supplier', 'MFG', 'EXP', 'Stock', 'Cost']],
            body: tableData,
            theme: 'grid',
            headStyles: { fillColor: [79, 70, 229] }
        });

        doc.save(`${reportType}_report_${Date.now()}.pdf`);
    };

    const exportToExcel = () => {
        const ws = XLSX.utils.json_to_sheet(reportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Report");
        XLSX.writeFile(wb, `${reportType}_report_${Date.now()}.xlsx`);
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="expiry-reports-container" ref={containerRef}>
            <SEO title="Expiry Reports" description="Generate detailed business intelligence reports on stock expiry." />

            <header className="page-header">
                <div>
                    <h1>Expiry Intelligence Reports</h1>
                    <p className="text-muted">Generate and export comprehensive inventory auditing reports.</p>
                </div>
            </header>

            <div className="report-config-grid mb-8">
                <div
                    className={`config-card glass-card ${reportType === 'soon' ? 'active' : ''}`}
                    onClick={() => setReportType('soon')}
                >
                    <div className="icon-box bg-indigo-500/20 text-indigo-400"><Calendar size={24} /></div>
                    <div className="info">
                        <h3>Expiring Soon</h3>
                        <p>Items reaching expiry in selected period.</p>
                    </div>
                </div>
                <div
                    className={`config-card glass-card ${reportType === 'expired' ? 'active' : ''}`}
                    onClick={() => setReportType('expired')}
                >
                    <div className="icon-box bg-red-500/20 text-red-500"><AlertCircle size={24} /></div>
                    <div className="info">
                        <h3>Expired Items</h3>
                        <p>Inventory pieces that are past their shelf life.</p>
                    </div>
                </div>
                <div
                    className={`config-card glass-card ${reportType === 'supplier' ? 'active' : ''}`}
                    onClick={() => setReportType('supplier')}
                >
                    <div className="icon-box bg-emerald-500/20 text-emerald-400"><Building2 size={24} /></div>
                    <div className="info">
                        <h3>Supplier Analysis</h3>
                        <p>Expiry grouping by supply source.</p>
                    </div>
                </div>
            </div>

            <div className="action-bar glass-card mb-6 p-4">
                <div className="left-controls">
                    {reportType === 'soon' && (
                        <div className="range-selector">
                            <label>Period:</label>
                            <select value={daysRange} onChange={(e) => setDaysRange(e.target.value)}>
                                <option value="7">Next 7 Days</option>
                                <option value="15">Next 15 Days</option>
                                <option value="30">Next 30 Days</option>
                                <option value="60">Next 60 Days</option>
                                <option value="90">Next 90 Days</option>
                            </select>
                        </div>
                    )}
                </div>
                <div className="right-controls">
                    <button className="btn-secondary-glass" onClick={exportToExcel}><Download size={18} /> Excel Export</button>
                    <button className="btn-primary-gradient" onClick={exportToPDF}><FileText size={18} /> PDF Download</button>
                </div>
            </div>

            <div className="report-results glass-card">
                {loading ? (
                    <div className="loading-area p-12 text-center">
                        <div className="loader mb-4"></div>
                        <p>Compiling Report Data...</p>
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="report-table">
                            <thead>
                                <tr>
                                    <th>Supplier</th>
                                    <th>Product Title</th>
                                    <th>Batch Info (MFG/EXP)</th>
                                    <th>Available Qty</th>
                                    <th>Unit Cost</th>
                                    <th>Total Value</th>
                                    <th>Risk Factor</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reportData.length > 0 ? (
                                    reportData.map((item, idx) => (
                                        <tr key={idx}>
                                            <td className="font-bold text-indigo-400">{item.supplier_name || 'Counter Purchase'}</td>
                                            <td>
                                                <div className="prod-name-cell">
                                                    <Box size={14} className="text-muted" />
                                                    <span>{item.name}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="text-xs text-muted">MFG: {item.mfg_date || 'N/A'}</span>
                                                <br />
                                                <span className="font-bold">EXP: {item.expiry_date}</span>
                                            </td>
                                            <td><span className="qty-badge">{item.stock_quantity}</span></td>
                                            <td>₹{parseFloat(item.purchase_price).toLocaleString()}</td>
                                            <td>₹{(parseFloat(item.purchase_price) * parseFloat(item.stock_quantity)).toLocaleString()}</td>
                                            <td>
                                                {reportType === 'expired' ? (
                                                    <span className="risk-pill high">100% LOSS</span>
                                                ) : (
                                                    <span className="risk-pill medium">AT RISK</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="p-12 text-center text-muted">No data available for this report.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <style>{`
                .expiry-reports-container {
                    padding: 2rem;
                    max-width: 1400px;
                    margin: 0 auto;
                }
                .page-header h1 {
                    font-size: 2.2rem;
                    font-weight: 800;
                    margin: 0 0 0.5rem 0;
                    background: linear-gradient(135deg, #fff 0%, #818cf8 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                .text-muted { color: #94a3b8; }
                .glass-card {
                    background: rgba(30, 41, 59, 0.7);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255,255,255,0.05);
                    border-radius: 20px;
                }
                .report-config-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 1.5rem;
                }
                .config-card {
                    padding: 1.5rem;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 1.25rem;
                    transition: all 0.3s ease;
                    border: 2px solid transparent;
                }
                .config-card:hover { transform: translateY(-5px); background: rgba(255,255,255,0.03); }
                .config-card.active { 
                    border-color: #6366f1;
                    background: rgba(99, 102, 241, 0.05);
                }
                .icon-box {
                    width: 56px;
                    height: 56px;
                    border-radius: 14px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .info h3 { margin: 0; font-size: 1.1rem; color: #fff; }
                .info p { margin: 0.25rem 0 0 0; font-size: 0.8rem; color: #94a3b8; }
                
                .action-bar {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .range-selector {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }
                .range-selector select {
                    background: rgba(0,0,0,0.3);
                    border: 1px solid rgba(255,255,255,0.1);
                    color: #fff;
                    padding: 0.5rem 1rem;
                    border-radius: 10px;
                    outline: none;
                }
                .right-controls {
                    display: flex;
                    gap: 1rem;
                }
                .btn-primary-gradient {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.8rem 1.5rem;
                    background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
                    border: none;
                    border-radius: 12px;
                    color: #fff;
                    font-weight: 700;
                    cursor: pointer;
                    box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
                }
                .btn-secondary-glass {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.8rem 1.5rem;
                    background: rgba(255,255,255,0.05);
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 12px;
                    color: #fff;
                    font-weight: 700;
                    cursor: pointer;
                }
                
                .report-table { width: 100%; border-collapse: collapse; }
                .report-table th {
                    text-align: left;
                    padding: 1.25rem;
                    color: #94a3b8;
                    font-size: 0.75rem;
                    text-transform: uppercase;
                    border-bottom: 1px solid rgba(255,255,255,0.1);
                }
                .report-table td {
                    padding: 1.25rem;
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                }
                .prod-name-cell {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    font-weight: 600;
                }
                .qty-badge {
                    background: rgba(255,255,255,0.05);
                    padding: 0.25rem 0.75rem;
                    border-radius: 8px;
                    font-weight: 700;
                }
                .risk-pill {
                    font-size: 0.7rem;
                    font-weight: 800;
                    padding: 0.25rem 0.75rem;
                    border-radius: 4px;
                }
                .risk-pill.high { background: #ef4444; color: #fff; }
                .risk-pill.medium { background: #f97316; color: #fff; }
                
                .loader {
                    width: 32px;
                    height: 32px;
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

export default ExpiryReports;
