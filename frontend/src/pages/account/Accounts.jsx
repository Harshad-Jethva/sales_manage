import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Plus, Landmark, ArrowUpRight, ArrowDownLeft, History, CreditCard, ChevronRight, Wallet, DollarSign, X } from 'lucide-react';
import gsap from 'gsap';
import SEO from '../../components/common/SEO';

const Accounts = () => {
    const navigate = useNavigate();
    const [accounts, setAccounts] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showTxModal, setShowTxModal] = useState(false);
    const containerRef = useRef(null);

    // Transaction Form State
    const [txData, setTxData] = useState({
        account_id: '',
        type: 'credit',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (!loading && containerRef.current) {
            gsap.fromTo(
                gsap.utils.toArray('.account-anim-el', containerRef.current),
                { y: 20, opacity: 0 },
                { y: 0, opacity: 1, stagger: 0.05, duration: 0.5, ease: "power2.out" }
            );
        }
    }, [loading]);

    const fetchData = async () => {
        try {
            const accRes = await axios.get('http://localhost/sales_manage/backend/api/banks.php');
            const txRes = await axios.get('http://localhost/sales_manage/backend/api/banks.php?transactions=true');
            setAccounts(Array.isArray(accRes.data) ? accRes.data : []);
            setTransactions(Array.isArray(txRes.data) ? txRes.data : []);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleTxSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost/sales_manage/backend/api/banks.php', { ...txData, action: 'transaction' });
            if (res.data.success) {
                alert("Transaction Successful!");
                setShowTxModal(false);
                setTxData({ ...txData, amount: '', description: '' }); // Reset fields
                fetchData();
            } else {
                alert("Transaction Failed: " + (res.data.error || 'Unknown error'));
            }
        } catch (err) {
            console.error(err);
            alert("Error processing transaction");
        }
    };

    const totalBalance = accounts.reduce((sum, acc) => sum + parseFloat(acc.balance || 0), 0);

    return (
        <div className="animate-fade-in" ref={containerRef}>
            <SEO title="Financial Accounts" description="Overview of bank accounts and cash flow." />
            <header className="page-header flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 account-anim-el">
                <div>
                    <h1 className="page-title">Financial Accounts</h1>
                    <p className="page-subtitle">Overview of your bank accounts and cash flow.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="erp-button erp-button-secondary bg-surface-hover border-[rgba(255,255,255,0.05)]" onClick={() => setShowTxModal(true)}>
                        <ArrowUpRight size={18} className="text-emerald-400" /> <span>New Transaction</span>
                    </button>
                    <button className="erp-button erp-button-primary shadow-lg" onClick={() => navigate('/accounts/add')}>
                        <Plus size={18} /> <span>Add Account</span>
                    </button>
                </div>
            </header>

            {/* Overview Stats */}
            <div className="erp-grid erp-grid-cards mb-8">
                <div className="erp-card flex items-center gap-4 border-l-4 border-primary/50 account-anim-el">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <Wallet size={24} />
                    </div>
                    <div>
                        <h3 className="text-secondary text-sm font-semibold mb-1">Total Liquid Balance</h3>
                        <h2 className="text-white text-2xl font-bold font-mono">₹{totalBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h2>
                    </div>
                </div>

                <div className="erp-card flex items-center gap-4 account-anim-el">
                    <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
                        <Landmark size={24} />
                    </div>
                    <div>
                        <h3 className="text-secondary text-sm font-semibold mb-1">Active Accounts</h3>
                        <h2 className="text-white text-2xl font-bold">{accounts.length}</h2>
                    </div>
                </div>
            </div>

            {/* Accounts Grid */}
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2 account-anim-el">
                <Landmark size={20} className="text-primary" /> Your Accounts
            </h2>

            <div className="erp-grid erp-grid-cards mb-10">
                {loading ? (
                    Array(3).fill(0).map((_, i) => (
                        <div key={i} className="erp-card p-6 h-[180px] flex flex-col">
                            <div className="flex justify-between mb-4">
                                <div className="skeleton w-12 h-12 rounded-xl"></div>
                            </div>
                            <div className="skeleton h-5 w-1/2 mb-2 rounded"></div>
                            <div className="skeleton h-4 w-1/3 mb-auto rounded"></div>
                            <div className="skeleton h-6 w-1/3 ml-auto rounded mt-4"></div>
                        </div>
                    ))
                ) : (
                    <>
                        {accounts.map(acc => (
                            <div
                                key={acc.id}
                                className="erp-card p-6 cursor-pointer hover:-translate-y-1 hover:border-indigo-500/30 transition-all duration-300 relative group account-anim-el"
                                onClick={() => navigate(`/accounts/view?id=${acc.id}`)}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600 flex items-center justify-center text-slate-300 shadow-lg">
                                        <Landmark size={24} />
                                    </div>
                                    <button className="text-slate-500 group-hover:text-primary transition-colors p-1">
                                        <ChevronRight size={20} />
                                    </button>
                                </div>

                                <div>
                                    <h3 className="text-lg font-bold text-white mb-1 group-hover:text-indigo-200 transition-colors">{acc.bank_name}</h3>
                                    <p className="text-slate-400 font-mono text-sm tracking-widest mb-4">•••• {acc.account_number.slice(-4)}</p>

                                    <div className="pt-4 border-t border-[rgba(255,255,255,0.05)] flex justify-between items-center">
                                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Balance</span>
                                        <span className="text-lg font-bold text-emerald-400 font-mono">₹{parseFloat(acc.balance).toLocaleString('en-IN')}</span>
                                    </div>
                                </div>
                            </div>
                        ))}

                        <div
                            className="erp-card flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-700/50 bg-transparent hover:bg-slate-800/30 hover:border-indigo-500/30 cursor-pointer min-h-[180px] transition-all duration-300 group account-anim-el"
                            onClick={() => navigate('/accounts/add')}
                        >
                            <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 group-hover:bg-indigo-500/20 group-hover:text-indigo-400 transition-colors mb-3">
                                <Plus size={24} />
                            </div>
                            <p className="font-semibold text-slate-400 group-hover:text-indigo-300 transition-colors">Register New Account</p>
                        </div>
                    </>
                )}
            </div>

            {/* Transactions Table */}
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2 account-anim-el">
                <History size={20} className="text-primary" /> Recent Transactions
            </h2>

            <div className="erp-card account-anim-el">
                <div className="erp-table-container">
                    <table className="erp-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Account Details</th>
                                <th>Description</th>
                                <th>Type</th>
                                <th className="text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-6">
                                        <div className="skeleton h-8 w-full rounded"></div>
                                    </td>
                                </tr>
                            ) : transactions.slice(0, 10).map(tx => (
                                <tr key={tx.id}>
                                    <td className="text-slate-300 text-sm">{new Date(tx.transaction_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                                    <td>
                                        <div className="font-bold text-white text-sm">{tx.bank_name}</div>
                                        {tx.account_number && <div className="text-xs text-slate-500 font-mono">...{tx.account_number.slice(-4)}</div>}
                                    </td>
                                    <td className="text-slate-300">{tx.description}</td>
                                    <td>
                                        <span className={`erp-badge ${tx.type === 'credit' ? 'badge-success' : 'badge-danger'}`}>
                                            {tx.type === 'credit' ? 'DEPOSIT' : 'WITHDRAWAL'}
                                        </span>
                                    </td>
                                    <td className={`text-right font-mono font-bold ${tx.type === 'credit' ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {tx.type === 'credit' ? '+' : '-'} ₹{parseFloat(tx.amount).toLocaleString('en-IN')}
                                    </td>
                                </tr>
                            ))}
                            {!loading && transactions.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="text-center py-10 text-slate-400">
                                        <History size={40} className="mx-auto mb-3 opacity-20" />
                                        <p>No transaction history found.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {showTxModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowTxModal(false)} />
                    <div className="erp-card relative z-10 w-full max-w-md bg-surface p-0 overflow-hidden flex flex-col">
                        <div className="p-5 border-b border-[rgba(255,255,255,0.05)] flex justify-between items-center bg-surface-hover">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                <DollarSign size={20} className="text-emerald-400" /> New Ledger Entry
                            </h2>
                            <button className="text-slate-400 hover:text-white transition-colors" onClick={() => setShowTxModal(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6">
                            <form id="txForm" onSubmit={handleTxSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Account <span className="text-danger">*</span></label>
                                    <select
                                        required
                                        className="erp-input w-full"
                                        value={txData.account_id}
                                        onChange={(e) => setTxData({ ...txData, account_id: e.target.value })}
                                    >
                                        <option value="">-- Select Source/Destination --</option>
                                        {accounts.map(a => <option key={a.id} value={a.id}>{a.bank_name} (Bal: ₹{a.balance})</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Transaction Type</label>
                                    <select
                                        className="erp-input w-full"
                                        value={txData.type}
                                        onChange={(e) => setTxData({ ...txData, type: e.target.value })}
                                    >
                                        <option value="credit">IN (Deposit/Credit)</option>
                                        <option value="debit">OUT (Withdrawal/Debit)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Amount <span className="text-danger">*</span></label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold">₹</span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            required
                                            className="erp-input w-full pl-8 font-mono text-lg"
                                            value={txData.amount}
                                            onChange={(e) => setTxData({ ...txData, amount: e.target.value })}
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Particulars / Description <span className="text-danger">*</span></label>
                                    <input
                                        type="text"
                                        required
                                        className="erp-input w-full"
                                        placeholder="Reason for transaction"
                                        value={txData.description}
                                        onChange={(e) => setTxData({ ...txData, description: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Date</label>
                                    <input
                                        type="date"
                                        className="erp-input w-full"
                                        value={txData.date}
                                        onChange={(e) => setTxData({ ...txData, date: e.target.value })}
                                    />
                                </div>
                            </form>
                        </div>

                        <div className="p-5 border-t border-[rgba(255,255,255,0.05)] bg-surface-hover">
                            <button type="submit" form="txForm" className="erp-button erp-button-primary w-full justify-center">
                                Record Transaction
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Accounts;
