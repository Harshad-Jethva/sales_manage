import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Plus, Landmark, ArrowUpRight, ArrowDownLeft, History, CreditCard, ChevronRight, Wallet, DollarSign, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Accounts = () => {
    const navigate = useNavigate();
    const [accounts, setAccounts] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showTxModal, setShowTxModal] = useState(false);

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

    if (loading) return <div className="loader">Loading Financial Data...</div>;

    const totalBalance = accounts.reduce((sum, acc) => sum + parseFloat(acc.balance || 0), 0);

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="page-container">
            <header className="page-header">
                <div>
                    <h1>Financial Accounts</h1>
                    <p className="text-muted">Overview of your bank accounts and cash flow.</p>
                </div>
                <div className="header-actions">
                    <button className="btn-secondary" onClick={() => setShowTxModal(true)}>
                        <ArrowUpRight size={18} /> New Transaction
                    </button>
                    <button className="btn-primary" onClick={() => navigate('/accounts/add')}>
                        <Plus size={18} /> Add Account
                    </button>
                </div>
            </header>

            <div className="overview-cards">
                <div className="glass-card summary-card">
                    <div className="icon-wrapper"><Wallet size={24} /></div>
                    <div className="card-info">
                        <h3>Total Balance</h3>
                        <h2>₹{totalBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h2>
                    </div>
                </div>
                <div className="glass-card summary-card">
                    <div className="icon-wrapper blue"><Landmark size={24} /></div>
                    <div className="card-info">
                        <h3>Active Accounts</h3>
                        <h2>{accounts.length}</h2>
                    </div>
                </div>
            </div>

            <h2 className="section-title">Your Accounts</h2>
            <div className="accounts-grid">
                {accounts.map(acc => (
                    <motion.div
                        whileHover={{ y: -5 }}
                        transition={{ duration: 0.2 }}
                        key={acc.id}
                        className="glass-card account-card"
                        onClick={() => navigate(`/accounts/view?id=${acc.id}`)}
                    >
                        <div className="card-top">
                            <div className="bank-icon">
                                <Landmark size={24} />
                            </div>
                            <button className="btn-arrow"><ChevronRight size={18} /></button>
                        </div>
                        <div className="card-body">
                            <h3>{acc.bank_name}</h3>
                            <p className="acc-num">•••• {acc.account_number.slice(-4)}</p>
                            <div className="balance-row">
                                <span className="label">Balance</span>
                                <span className="value">₹{parseFloat(acc.balance).toLocaleString('en-IN')}</span>
                            </div>
                        </div>
                    </motion.div>
                ))}

                <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="add-card-placeholder"
                    onClick={() => navigate('/accounts/add')}
                >
                    <div className="plus-circle"><Plus size={24} /></div>
                    <p>Add New Account</p>
                </motion.div>
            </div>

            <h2 className="section-title" style={{ marginTop: '3rem' }}>Recent Transactions</h2>
            <div className="glass-card table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Account</th>
                            <th>Description</th>
                            <th>Type</th>
                            <th className="text-right">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.slice(0, 5).map(tx => (
                            <tr key={tx.id}>
                                <td>{new Date(tx.transaction_date).toLocaleDateString()}</td>
                                <td>{tx.bank_name}</td>
                                <td>{tx.description}</td>
                                <td><span className={`badge ${tx.type}`}>{tx.type}</span></td>
                                <td className={`text-right amount ${tx.type}`}>
                                    {tx.type === 'credit' ? '+' : '-'} ₹{parseFloat(tx.amount).toLocaleString('en-IN')}
                                </td>
                            </tr>
                        ))}
                        {transactions.length === 0 && <tr><td colSpan="5" className="text-center">No transactions recorded.</td></tr>}
                    </tbody>
                </table>
            </div>

            {/* Quick Transaction Modal */}
            <AnimatePresence>
                {showTxModal && (
                    <div className="modal-overlay">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="glass-card modal"
                        >
                            <div className="modal-header">
                                <h2><DollarSign size={20} /> New Transaction</h2>
                                <button className="close-btn" onClick={() => setShowTxModal(false)}><X size={20} /></button>
                            </div>
                            <form onSubmit={handleTxSubmit}>
                                <div className="form-group">
                                    <label>Account</label>
                                    <select
                                        required
                                        className="input-control"
                                        value={txData.account_id}
                                        onChange={(e) => setTxData({ ...txData, account_id: e.target.value })}
                                    >
                                        <option value="">Select Account</option>
                                        {accounts.map(a => <option key={a.id} value={a.id}>{a.bank_name} ({a.balance})</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Type</label>
                                    <select
                                        className="input-control"
                                        value={txData.type}
                                        onChange={(e) => setTxData({ ...txData, type: e.target.value })}
                                    >
                                        <option value="credit">Credit (Deposit)</option>
                                        <option value="debit">Debit (Withdrawal)</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Amount (₹)</label>
                                    <input
                                        type="number"
                                        required
                                        className="input-control"
                                        value={txData.amount}
                                        onChange={(e) => setTxData({ ...txData, amount: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Description</label>
                                    <input
                                        type="text"
                                        required
                                        className="input-control"
                                        placeholder="e.g. Client Payment"
                                        value={txData.description}
                                        onChange={(e) => setTxData({ ...txData, description: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Date</label>
                                    <input
                                        type="date"
                                        className="input-control"
                                        value={txData.date}
                                        onChange={(e) => setTxData({ ...txData, date: e.target.value })}
                                    />
                                </div>
                                <div className="modal-actions">
                                    <button type="submit" className="btn-primary-full">Submit Transaction</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <style jsx>{`
                .page-container { max-width: 1200px; margin: 0 auto; color: white; padding-bottom: 4rem; }
                .loader { text-align: center; padding: 2rem; color: #94a3b8; }
                
                .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2.5rem; }
                .page-header h1 { font-size: 2rem; font-weight: 700; margin: 0; }
                .text-muted { color: #94a3b8; margin: 0.5rem 0 0; }
                
                .header-actions { display: flex; gap: 1rem; }
                .btn-primary, .btn-secondary { display: flex; align-items: center; gap: 0.6rem; padding: 0.7rem 1.4rem; border-radius: 10px; font-weight: 600; cursor: pointer; transition: 0.2s; border: none; }
                .btn-primary { background: #6366f1; color: white; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3); }
                .btn-primary:hover { background: #4f46e5; transform: translateY(-2px); }
                .btn-secondary { background: rgba(255,255,255,0.1); color: white; border: 1px solid rgba(255,255,255,0.1); }
                .btn-secondary:hover { background: rgba(255,255,255,0.15); }

                .overview-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.5rem; margin-bottom: 2.5rem; }
                .summary-card { padding: 1.5rem; display: flex; align-items: center; gap: 1.5rem; }
                .icon-wrapper { width: 50px; height: 50px; background: rgba(16, 185, 129, 0.2); color: #34d399; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
                .icon-wrapper.blue { background: rgba(99, 102, 241, 0.2); color: #818cf8; }
                .card-info h3 { margin: 0; font-size: 0.9rem; color: #94a3b8; font-weight: 500; }
                .card-info h2 { margin: 0.3rem 0 0; font-size: 1.8rem; font-weight: 700; color: white; }

                .section-title { font-size: 1.25rem; margin-bottom: 1.5rem; color: #e2e8f0; border-left: 4px solid #6366f1; padding-left: 1rem; }

                .accounts-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem; }
                .glass-card { background: rgba(30, 41, 59, 0.6); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.05); border-radius: 16px; overflow: hidden; }
                
                .account-card { padding: 1.5rem; cursor: pointer; position: relative; }
                .account-card:hover { border-color: #6366f1; background: rgba(30, 41, 59, 0.8); }
                .card-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; }
                .bank-icon { width: 48px; height: 48px; background: linear-gradient(135deg, #1e293b, #334155); border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; border: 1px solid rgba(255,255,255,0.1); }
                .btn-arrow { background: none; border: none; color: #94a3b8; cursor: pointer; }
                
                .card-body h3 { margin: 0; font-size: 1.2rem; color: white; }
                .acc-num { margin: 0.3rem 0 1rem; color: #94a3b8; font-size: 0.9rem; letter-spacing: 1px; }
                .balance-row { display: flex; justify-content: space-between; align-items: center; padding-top: 1rem; border-top: 1px solid rgba(255,255,255,0.05); }
                .balance-row .label { color: #94a3b8; font-size: 0.85rem; }
                .balance-row .value { color: #4ade80; font-weight: 700; font-size: 1.1rem; }

                .add-card-placeholder { border: 2px dashed rgba(255,255,255,0.1); border-radius: 16px; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 2rem; cursor: pointer; color: #94a3b8; transition: 0.2s; min-height: 200px; }
                .add-card-placeholder:hover { border-color: #6366f1; color: #6366f1; background: rgba(99, 102, 241, 0.05); }
                .plus-circle { width: 50px; height: 50px; border-radius: 50%; background: rgba(255,255,255,0.05); display: flex; align-items: center; justify-content: center; margin-bottom: 1rem; }

                .table-container { padding: 0.5rem; }
                table { width: 100%; border-collapse: collapse; }
                th, td { padding: 1rem 1.5rem; text-align: left; border-bottom: 1px solid rgba(255,255,255,0.05); }
                th { color: #94a3b8; font-size: 0.85rem; font-weight: 600; text-transform: uppercase; }
                td { color: #e2e8f0; font-size: 0.95rem; }
                tr:last-child td { border-bottom: none; }
                .badge { padding: 0.25rem 0.6rem; border-radius: 6px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; }
                .badge.credit { background: rgba(74, 222, 128, 0.15); color: #4ade80; }
                .badge.debit { background: rgba(248, 113, 113, 0.15); color: #f87171; }
                .amount.credit { color: #4ade80; font-weight: 600; }
                .amount.debit { color: #f87171; font-weight: 600; }
                .text-right { text-align: right; }
                .text-center { text-align: center; color: #64748b; }

                /* Modal Styles */
                .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(5px); z-index: 100; display: flex; align-items: center; justify-content: center; }
                .modal { width: 100%; max-width: 450px; padding: 2rem; background: #1e293b; border: 1px solid rgba(255,255,255,0.1); }
                .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
                .modal-header h2 { margin: 0; font-size: 1.3rem; display: flex; align-items: center; gap: 0.5rem; }
                .close-btn { background: none; border: none; color: #94a3b8; cursor: pointer; }
                .close-btn:hover { color: white; }
                
                .form-group { margin-bottom: 1.25rem; }
                .form-group label { display: block; margin-bottom: 0.5rem; color: #cbd5e1; font-size: 0.9rem; }
                .input-control { width: 100%; padding: 0.8rem; background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: white; font-size: 1rem; outline: none; }
                .input-control:focus { border-color: #6366f1; }
                
                .btn-primary-full { width: 100%; padding: 0.9rem; background: #6366f1; color: white; border: none; border-radius: 8px; font-weight: 600; font-size: 1rem; cursor: pointer; transition: 0.2s; }
                .btn-primary-full:hover { background: #4f46e5; }
            `}</style>
        </motion.div>
    );
};

export default Accounts;
