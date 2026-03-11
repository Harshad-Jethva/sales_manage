import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Calendar, Download, FileText, IndianRupee, CreditCard,
    ArrowLeft, Printer, Filter, CheckCircle, Clock, AlertCircle, TrendingUp,
    User, Hash, Activity, ShoppingBag, MapPin, Phone, ShieldCheck, PieChart
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import SEO from '../../components/common/SEO';
import { useAuth } from '../../context/AuthContext';

const POSReport = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const today = new Date().toISOString().split('T')[0];

    const [fromDate, setFromDate] = useState(today);
    const [toDate, setToDate] = useState(today);
    const [reportData, setReportData] = useState({ summary: [], bills: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReport();
    }, [fromDate, toDate]);

    const fetchReport = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`http://localhost/sales_manage/backend/api/reports.php?type=cashier_report&from=${fromDate}&to=${toDate}`);
            setReportData(res.data);
        } catch (err) {
            console.error("Error fetching report:", err);
        } finally {
            setLoading(false);
        }
    };

    // Data Calculations
    const totalTransactions = reportData.bills.length;
    const grossSalesAmount = reportData.bills.reduce((sum, b) => sum + parseFloat(b.total_amount), 0);
    const totalPaymentsReceived = reportData.bills.reduce((sum, b) => sum + parseFloat(b.paid_amount), 0);
    const netOutstandingBalance = grossSalesAmount - totalPaymentsReceived;

    const cashMetrics = reportData.summary.find(s => s.payment_method?.toLowerCase() === 'cash') || { paid_amount: 0, count: 0 };
    const onlineMetrics = reportData.summary.filter(s => s.payment_method?.toLowerCase() !== 'cash').reduce((acc, curr) => ({
        paid_amount: acc.paid_amount + parseFloat(curr.paid_amount),
        count: acc.count + parseInt(curr.count)
    }), { paid_amount: 0, count: 0 });

    const exportToExcel = () => {
        const headers = ['Date', 'Bill No', 'Customer', 'Sale Value', 'Received', 'Balance', 'Mode'];
        const formatCurrency = (val) => parseFloat(val).toFixed(2);

        const rows = reportData.bills.map(b => [
            b.bill_date,
            b.bill_number,
            b.customer_name || 'Walk-in',
            formatCurrency(b.total_amount),
            formatCurrency(b.paid_amount),
            formatCurrency(parseFloat(b.total_amount) - parseFloat(b.paid_amount)),
            b.payment_method || 'N/A'
        ]);

        const csvContent = headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `Sales_Audit_${fromDate}_to_${toDate}.csv`;
        link.click();
    };

    return (
        <div className="min-h-screen bg-[#07090F] text-slate-200">
            <SEO title="System Audit Report" description="Professional financial audit and sales tracking." />

            {/* SCREEN VIEW */}
            <div className="p-6 md:p-10 max-w-[1400px] mx-auto print:hidden">
                {/* Modern Header */}
                <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-10 gap-8">
                    <div className="space-y-2">
                        <button
                            onClick={() => navigate(-1)}
                            className="bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 border border-indigo-500/20 mb-4"
                        >
                            <ArrowLeft size={14} /> Back to Dashboard
                        </button>
                        <h1 className="text-5xl font-black text-white leading-none tracking-tight">Audit <span className="text-indigo-500">Analytics</span></h1>
                        <p className="text-slate-400 font-medium">Verified system data for period: <span className="text-slate-200 font-bold underline decoration-indigo-500/50">{fromDate} — {toDate}</span></p>
                    </div>

                    <div className="flex flex-wrap gap-4">
                        <button onClick={exportToExcel} className="flex items-center gap-3 bg-slate-800 hover:bg-slate-700 text-white px-8 py-4 rounded-2xl font-black transition-all border border-slate-700 shadow-2xl">
                            <Download size={20} className="text-emerald-400" /> DOWNLOAD RAW DATA
                        </button>
                        <button onClick={() => window.print()} className="flex items-center gap-3 bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-2xl font-black transition-all shadow-2xl shadow-indigo-600/20">
                            <Printer size={20} /> INITIATE OFFICIAL PRINT
                        </button>
                    </div>
                </div>

                {/* Dashboard-style Filters */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-12">
                    <div className="lg:col-span-3 bg-white/[0.03] border border-white/10 rounded-[2rem] p-8 flex flex-col md:flex-row gap-8 items-end backdrop-blur-3xl">
                        <div className="flex-1 space-y-3 w-full">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">Start Threshold</label>
                            <div className="relative">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500" size={18} />
                                <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-white font-black" />
                            </div>
                        </div>
                        <div className="flex-1 space-y-3 w-full">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">End Threshold</label>
                            <div className="relative">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500" size={18} />
                                <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-white font-black" />
                            </div>
                        </div>
                        <button onClick={fetchReport} className="bg-indigo-500 hover:bg-indigo-400 text-white px-8 py-4 rounded-2xl font-black transition-all flex items-center gap-2">
                            <Filter size={18} /> REFRESH DATA
                        </button>
                    </div>
                    <div className="bg-gradient-to-br from-indigo-600 to-indigo-900 rounded-[2rem] p-8 flex flex-col justify-center relative overflow-hidden group">
                        <p className="text-indigo-200 text-xs font-black uppercase tracking-[0.2em] relative z-10">Net Recovery</p>
                        <h2 className="text-4xl font-black text-white mt-2 relative z-10">₹{totalPaymentsReceived.toLocaleString()}</h2>
                        <PieChart size={120} className="absolute -bottom-8 -right-8 text-white/10 group-hover:rotate-12 transition-transform duration-1000" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <QuickStat label="Total Invoices" value={totalTransactions} icon={<FileText size={24} />} />
                    <QuickStat label="Cash Velocity" value={`₹${cashMetrics.paid_amount.toLocaleString()}`} icon={<IndianRupee size={24} />} color="emerald" />
                    <QuickStat label="Online Clearance" value={`₹${onlineMetrics.paid_amount.toLocaleString()}`} icon={<CreditCard size={24} />} color="blue" />
                </div>

                {/* Main Table Screen */}
                <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
                    <div className="p-8 border-b border-white/5 bg-white/[0.01] flex justify-between items-center">
                        <h3 className="text-xl font-black uppercase tracking-widest flex items-center gap-4">
                            <span className="w-2 h-8 bg-indigo-500 rounded-full"></span> Transaction Audit Log
                        </h3>
                        <div className="text-xs font-bold text-slate-500 uppercase">Records: <span className="text-white">{totalTransactions}</span></div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white/[0.04] text-slate-500 text-[10px] uppercase font-black tracking-[0.2em]">
                                    <th className="px-8 py-6">Identity / Period</th>
                                    <th className="px-6 py-6 font-black">Client Descriptor</th>
                                    <th className="px-6 py-6">Protocol</th>
                                    <th className="px-6 py-6 text-right">Debit</th>
                                    <th className="px-6 py-6 text-right">Credit</th>
                                    <th className="px-8 py-6 text-right">Net Bal</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {loading ? (
                                    <tr><td colSpan="6" className="p-24 text-center text-slate-600 font-black tracking-[0.5em] animate-pulse">SYNCHRONIZING WITH DATACORE...</td></tr>
                                ) : (
                                    reportData.bills.map(bill => {
                                        const bal = parseFloat(bill.total_amount) - parseFloat(bill.paid_amount);
                                        return (
                                            <tr key={bill.id} className="hover:bg-white/[0.03] transition-colors">
                                                <td className="px-8 py-6"><div className="text-white font-black text-sm uppercase">{bill.bill_number}</div><div className="text-[10px] font-mono text-slate-500 mt-1">{bill.bill_date}</div></td>
                                                <td className="px-6 py-6"><div className="font-bold text-slate-200">{bill.customer_name || 'Generic Walk-in'}</div></td>
                                                <td className="px-6 py-6"><span className="text-[10px] font-black uppercase text-indigo-400 bg-indigo-400/10 px-3 py-1 rounded-full border border-indigo-500/20">{bill.payment_method}</span></td>
                                                <td className="px-6 py-6 text-right font-mono font-bold text-slate-100">₹{parseFloat(bill.total_amount).toLocaleString()}</td>
                                                <td className="px-6 py-6 text-right font-mono font-bold text-emerald-400">₹{parseFloat(bill.paid_amount).toLocaleString()}</td>
                                                <td className={`px-8 py-6 text-right font-mono font-black ${bal > 0 ? 'text-amber-500 underline decoration-amber-500/30' : 'text-slate-600'}`}>₹{bal.toLocaleString()}</td>
                                            </tr>
                                        )
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* --- ULTIMATE PROFESSIONAL PRINT VIEW --- */}
            <div className="hidden print:block bg-white text-black p-0 m-0 w-full min-h-screen">
                <style>{`
                    @media print {
                        .audit-box { border: 2.5pt solid black; padding: 20pt; margin: 0; }
                        .audit-label { font-size: 8pt; font-weight: 900; background: black; color: white; padding: 2pt 5pt; display: inline-block; text-transform: uppercase; margin-bottom: 4pt; }
                        .audit-value { font-size: 11pt; font-weight: 900; text-transform: uppercase; display: block; border-left: 3pt solid black; padding-left: 8pt; margin-top: 4pt; }
                        .data-row td { border: 1pt solid #ddd; padding: 6pt 8pt; font-size: 9pt; vertical-align: middle; }
                        .data-header th { background: #f0f0f0; border: 1.5pt solid black !important; padding: 8pt; font-size: 8pt; font-weight: 900; text-transform: uppercase; }
                        .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); border: 2pt solid black; margin-top: 20pt; }
                        .summary-item { padding: 15pt; border-right: 2pt solid black; text-align: center; }
                        .summary-item:last-child { border-right: none; }
                        .sig-box { border-top: 1.5pt solid black; margin-top: 50pt; text-align: center; padding-top: 10pt; flex: 1; }
                    }
                `}</style>

                <div className="audit-box">
                    <header className="flex justify-between items-start border-b-[5pt] border-black pb-10 mb-8">
                        <div>
                            <h1 className="text-5xl font-[1000] tracking-tighter uppercase leading-none m-0">HAB CREATION</h1>
                            <p className="text-sm font-black mt-3 tracking-widest pl-1 border-t-2 border-black pt-2 uppercase">Official System Sales Audit Dossier</p>
                        </div>
                        <div className="text-right">
                            <div className="bg-black text-white px-4 py-2 text-xs font-black uppercase mb-2">Authenticated System Extract</div>
                            <p className="text-[10pt] font-black uppercase tracking-tighter">NODE-REF: POS/SRV/2026</p>
                            <p className="text-[8pt] font-mono font-bold text-gray-600 mt-1">GEN-ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
                        </div>
                    </header>

                    <div className="grid grid-cols-2 gap-10 mb-10">
                        <div>
                            <span className="audit-label">Issuing Authority</span>
                            <span className="audit-value">{user?.name} (Cashier Office)</span>

                            <div className="mt-6">
                                <span className="audit-label">Validation Timestamp</span>
                                <span className="audit-value">{new Date().toLocaleString()} IST</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="audit-label">Fiscal Period Range</span>
                            <span className="audit-value">{fromDate} to {toDate}</span>

                            <div className="mt-6">
                                <span className="audit-label">Total Recovery Extraction</span>
                                <span className="text-4xl font-black block mt-2">₹{totalPaymentsReceived.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    <div className="summary-grid">
                        <div className="summary-item bg-gray-50">
                            <p className="text-[8pt] font-black uppercase text-gray-500 mb-1">Gross Billing</p>
                            <p className="text-2xl font-[1000]">₹{grossSalesAmount.toLocaleString()}</p>
                        </div>
                        <div className="summary-item">
                            <p className="text-[8pt] font-black uppercase text-gray-500 mb-1">Verified Received</p>
                            <p className="text-2xl font-[1000] text-emerald-700">₹{totalPaymentsReceived.toLocaleString()}</p>
                        </div>
                        <div className="summary-item bg-gray-100">
                            <p className="text-[8pt] font-black uppercase text-gray-500 mb-1">Outstanding Ledger</p>
                            <p className="text-2xl font-[1000] text-red-700">₹{netOutstandingBalance.toLocaleString()}</p>
                        </div>
                    </div>

                    <div className="mt-12 text-center">
                        <span className="block text-[10pt] font-black uppercase tracking-widest bg-black text-white py-2 mb-6">Master Transaction Registry</span>
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="data-header">
                                    <th className="text-left">REF ID</th>
                                    <th className="text-left">IDENTITY</th>
                                    <th className="text-center">PROTOCOL</th>
                                    <th className="text-right text-red-800">DR (TOTAL)</th>
                                    <th className="text-right text-emerald-800">CR (PAID)</th>
                                    <th className="text-right">BAL.</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reportData.bills.map((bill) => (
                                    <tr key={bill.id} className="data-row">
                                        <td className="font-mono font-black">{bill.bill_number}</td>
                                        <td className="font-bold">{bill.customer_name || 'WALK-IN'}</td>
                                        <td className="text-center font-black text-[8pt] uppercase">{bill.payment_method}</td>
                                        <td className="text-right font-bold tracking-tighter">₹{parseFloat(bill.total_amount).toLocaleString()}</td>
                                        <td className="text-right font-bold tracking-tighter text-emerald-700">₹{parseFloat(bill.paid_amount).toLocaleString()}</td>
                                        <td className="text-right font-black tracking-tighter">₹{(bill.total_amount - bill.paid_amount).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr className="bg-black text-white font-black">
                                    <td colSpan="3" className="p-4 text-left uppercase text-[9pt] tracking-[0.3em] font-black">Document Final Balances</td>
                                    <td className="p-4 text-right text-lg border-x border-white/20">₹{grossSalesAmount.toLocaleString()}</td>
                                    <td className="p-4 text-right text-lg border-r border-white/20">₹{totalPaymentsReceived.toLocaleString()}</td>
                                    <td className="p-4 text-right text-lg">₹{netOutstandingBalance.toLocaleString()}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    <div className="mt-10 grid grid-cols-2 gap-10">
                        <div className="border-2 border-black p-5">
                            <h4 className="audit-label mb-4">Payment Summary</h4>
                            <div className="flex justify-between border-b border-black/10 py-2">
                                <span className="text-[10pt] font-bold">CASH SETTLEMENTS:</span>
                                <span className="text-[10pt] font-black">₹{cashMetrics.paid_amount.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between border-b border-black/10 py-2">
                                <span className="text-[10pt] font-bold">ONLINE/BANK TRANFERS:</span>
                                <span className="text-[10pt] font-black">₹{onlineMetrics.paid_amount.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between py-2 bg-gray-50 font-black">
                                <span className="text-[10pt]">TOTAL COUNT:</span>
                                <span className="text-[10pt]">{totalTransactions} INVOICES</span>
                            </div>
                        </div>
                        <div className="border-2 border-black p-5 italic font-bold text-[9pt] text-gray-600 flex items-center justify-center text-center">
                            "I hereby certify that the above statement is a true and accurate reflection of the system records for the specified period. Any discrepancies are subject to manual audit."
                        </div>
                    </div>

                    <div className="flex mt-24 gap-20">
                        <div className="sig-box">
                            <p className="text-[8pt] font-black uppercase text-gray-500 mb-2">Accountable Cashier</p>
                            <p className="text-sm font-[1000]">{user?.name}</p>
                        </div>
                        <div className="sig-box">
                            <p className="text-[8pt] font-black uppercase text-gray-500 mb-2">Verifying Official</p>
                            <div className="h-4"></div>
                        </div>
                        <div className="sig-box">
                            <p className="text-[8pt] font-black uppercase text-gray-500 mb-2">Audit Approval</p>
                            <div className="h-4"></div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .animate-fade-in { animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
};

const QuickStat = ({ label, value, icon, color }) => {
    const themes = {
        emerald: "text-emerald-400 border-emerald-400/20 bg-emerald-400/5",
        blue: "text-blue-400 border-blue-400/20 bg-blue-400/5",
    };

    return (
        <div className={`p-8 bg-white/[0.02] border border-white/10 rounded-[2rem] flex items-center gap-6 transition-transform hover:scale-[1.02]`}>
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border border-white/5 ${themes[color] || 'text-indigo-400 bg-indigo-500/5 border-indigo-500/10'}`}>
                {icon}
            </div>
            <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">{label}</p>
                <h3 className="text-2xl font-black text-white">{value}</h3>
            </div>
        </div>
    );
};

export default POSReport;
