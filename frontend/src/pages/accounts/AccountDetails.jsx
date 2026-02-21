import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Landmark, ArrowLeft, CreditCard, User, History, ArrowUpRight, ArrowDownLeft, Edit, Trash2 } from 'lucide-react';

const AccountDetails = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const id = searchParams.get('id');
    const [account, setAccount] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            fetchData();
        } else {
            navigate('/accounts');
        }
    }, [id]);

    const fetchData = async () => {
        try {
            const [accRes, txRes] = await Promise.all([
                axios.get('http://localhost/sales_manage/backend/api/banks.php'),
                axios.get(`http://localhost/sales_manage/backend/api/banks.php?transactions=true&account_id=${id}`)
            ]);

            const acc = accRes.data.find(a => a.id == id);
            if (acc) {
                setAccount(acc);
                setTransactions(Array.isArray(txRes.data) ? txRes.data : []);
            } else {
                alert("Account not found");
                navigate('/accounts');
            }
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    if (loading) return <div className="loader">Loading...</div>;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="page-container">
            <header className="page-header">
                <button className="back-btn" onClick={() => navigate('/accounts')}>
                    <ArrowLeft size={20} /> Back to Accounts
                </button>
                <div className="header-content">
                    <div className="profile-badge">
                        <Landmark size={40} />
                    </div>
                    <div className="header-text">
                        <h1>{account.bank_name}</h1>
                        <p className="account-meta">{account.account_number}</p>
                    </div>
                    <div className="header-actions">
                        <button className="btn-icon edit" onClick={() => navigate('/accounts/update', { state: { account } })}>
                            <Edit size={18} /> Edit
                        </button>
                        <button className="btn-icon delete" onClick={() => navigate('/accounts/delete', { state: { account } })}>
                            <Trash2 size={18} /> Delete
                        </button>
                    </div>
                </div>
            </header>

            <div className="dashboard-grid">
                <div className="glass-card balance-card">
                    <h3>Current Balance</h3>
                    <div className="balance-amount">₹{parseFloat(account.balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                    <div className="holder-name"><User size={16} /> {account.account_holder}</div>
                </div>

                <div className="glass-card stats-card">
                    <div className="stat">
                        <label>Total Credits</label>
                        <span className="text-green"><ArrowDownLeft size={16} /> Incoming</span>
                    </div>
                    <div className="stat">
                        <label>Total Debits</label>
                        <span className="text-red"><ArrowUpRight size={16} /> Outgoing</span>
                    </div>
                </div>
            </div>

            <div className="transactions-section">
                <h2><History size={20} /> Transaction History</h2>
                <div className="glass-card table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Description</th>
                                <th>Type</th>
                                <th className="text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.length > 0 ? transactions.map(tx => (
                                <tr key={tx.id}>
                                    <td>{new Date(tx.transaction_date).toLocaleDateString()}</td>
                                    <td>{tx.description}</td>
                                    <td>
                                        <span className={`badge ${tx.type}`}>
                                            {tx.type === 'credit' ? 'Credit' : 'Debit'}
                                        </span>
                                    </td>
                                    <td className={`text-right amount ${tx.type}`}>
                                        {tx.type === 'credit' ? '+' : '-'} ₹{parseFloat(tx.amount).toLocaleString('en-IN')}
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan="4" className="text-center">No transactions found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <style jsx>{`
                .page-container { max-width: 1000px; margin: 0 auto; color: white; padding-bottom: 3rem; }
                .loader { text-align: center; padding: 2rem; color: #94a3b8; }
                
                .page-header { margin-bottom: 2rem; }
                .back-btn { display: flex; align-items: center; gap: 0.5rem; background: none; border: none; color: #94a3b8; cursor: pointer; margin-bottom: 1.5rem; }
                .back-btn:hover { color: white; }

                .header-content { display: flex; align-items: center; gap: 1.5rem; background: rgba(255,255,255,0.03); padding: 2rem; border-radius: 20px; border: 1px solid rgba(255,255,255,0.05); }
                .profile-badge { width: 80px; height: 80px; background: linear-gradient(135deg, #6366f1, #4f46e5); border-radius: 20px; display: flex; align-items: center; justify-content: center; color: white; box-shadow: 0 10px 25px rgba(99, 102, 241, 0.4); }
                .header-text { flex: 1; }
                .header-text h1 { margin: 0; font-size: 2rem; }
                .account-meta { color: #94a3b8; margin: 0.5rem 0 0; font-family: monospace; letter-spacing: 1px; font-size: 1.1rem; }
                
                .header-actions { display: flex; gap: 1rem; }
                .btn-icon { display: flex; align-items: center; gap: 0.5rem; padding: 0.6rem 1.2rem; border-radius: 10px; border: 1px solid rgba(255,255,255,0.1); cursor: pointer; font-weight: 500; transition: 0.2s; background: rgba(255,255,255,0.05); color: white; }
                .btn-icon:hover { background: rgba(255,255,255,0.1); }
                .btn-icon.delete:hover { background: rgba(239, 68, 68, 0.2); color: #f87171; border-color: rgba(239, 68, 68, 0.3); }

                .dashboard-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 2rem; }
                .glass-card { background: rgba(30, 41, 59, 0.6); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.05); border-radius: 16px; padding: 1.5rem; }
                
                .balance-card h3 { margin: 0 0 1rem 0; color: #94a3b8; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1px; }
                .balance-amount { font-size: 2.5rem; font-weight: 700; color: white; margin-bottom: 1rem; }
                .holder-name { display: flex; align-items: center; gap: 0.5rem; color: #cbd5e1; font-size: 0.9rem; }

                .stats-card { display: flex; justify-content: space-around; align-items: center; }
                .stat { text-align: center; }
                .stat label { display: block; color: #94a3b8; font-size: 0.8rem; margin-bottom: 0.5rem; }
                .stat span { display: flex; align-items: center; gap: 0.3rem; font-weight: 600; font-size: 1.1rem; }
                .text-green { color: #4ade80; }
                .text-red { color: #f87171; }

                .transactions-section h2 { font-size: 1.4rem; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.8rem; }
                .table-container { padding: 0; overflow: hidden; }
                table { width: 100%; border-collapse: collapse; }
                th { text-align: left; padding: 1rem 1.5rem; color: #94a3b8; font-size: 0.85rem; font-weight: 600; border-bottom: 1px solid rgba(255,255,255,0.05); background: rgba(0,0,0,0.1); }
                td { padding: 1rem 1.5rem; color: #e2e8f0; font-size: 0.95rem; border-bottom: 1px solid rgba(255,255,255,0.03); }
                tr:last-child td { border-bottom: none; }
                .badge { padding: 0.2rem 0.6rem; border-radius: 4px; font-size: 0.75rem; text-transform: uppercase; font-weight: 600; }
                .badge.credit { background: rgba(74, 222, 128, 0.1); color: #4ade80; }
                .badge.debit { background: rgba(248, 113, 113, 0.1); color: #f87171; }
                .amount.credit { color: #4ade80; font-weight: 600; }
                .amount.debit { color: #f87171; font-weight: 600; }
                .text-right { text-align: right; }
                .text-center { text-align: center; color: #64748b; }

                @media (max-width: 768px) {
                    .dashboard-grid { grid-template-columns: 1fr; }
                }
            `}</style>
        </motion.div>
    );
};

export default AccountDetails;
