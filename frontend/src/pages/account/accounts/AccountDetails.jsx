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

    if (loading) return (
        <div className="flex items-center justify-center p-12 text-slate-400">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-3">Loading details...</span>
        </div>
    );

    return (
        <div className="animate-fade-in flex flex-col h-full">
            <header className="mb-6 flex flex-col items-start gap-4">
                <button
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-semibold mb-2"
                    onClick={() => navigate('/accounts')}
                >
                    <ArrowLeft size={16} /> Back to Accounts
                </button>

                <div className="erp-card w-full p-6 flex flex-col md:flex-row items-center gap-6 border border-[rgba(255,255,255,0.05)] shadow-xl relative overflow-hidden">
                    {/* Background decoration */}
                    <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[80px]"></div>

                    <div className="w-20 h-20 bg-gradient-to-tr from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 shrink-0 relative z-10">
                        <Landmark size={40} />
                    </div>

                    <div className="flex-1 text-center md:text-left relative z-10">
                        <h1 className="text-3xl font-bold text-white mb-1 tracking-tight">{account.bank_name}</h1>
                        <p className="font-mono text-indigo-300 tracking-wider text-sm bg-indigo-500/10 px-3 py-1 rounded-md inline-block border border-indigo-500/20">
                            {account.account_number}
                        </p>
                    </div>

                    <div className="flex gap-3 relative z-10 shrink-0">
                        <button
                            className="flex items-center gap-2 px-4 py-2 border border-white/10 rounded-xl hover:bg-white/5 text-white font-medium transition-all shadow-sm"
                            onClick={() => navigate('/accounts/update', { state: { account } })}
                        >
                            <Edit size={16} className="text-indigo-400" /> Edit
                        </button>
                        <button
                            className="flex items-center gap-2 px-4 py-2 border border-red-500/30 rounded-xl hover:bg-red-500/10 text-white font-medium transition-all shadow-sm group"
                            onClick={() => navigate('/accounts/delete', { state: { account } })}
                        >
                            <Trash2 size={16} className="text-red-400 group-hover:text-red-500 transition-colors" /> Delete
                        </button>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="erp-card p-6 md:p-8 flex flex-col justify-between border-l-4 border-indigo-500 shadow-xl overflow-hidden relative">
                    <div className="absolute right-0 bottom-0 opacity-5 p-4 pointer-events-none">
                        <Landmark size={120} />
                    </div>
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Current Balance</h3>
                    <div className="text-4xl md:text-5xl font-black text-white font-mono tracking-tight mb-4 drop-shadow-md">
                        ₹{parseFloat(account.balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="flex items-center gap-2 text-indigo-200 bg-indigo-500/10 px-4 py-2 rounded-lg self-start border border-indigo-500/20">
                        <User size={16} />
                        <span className="font-medium text-sm">{account.account_holder}</span>
                    </div>
                </div>

                <div className="erp-card p-6 flex flex-col justify-center shadow-xl">
                    <div className="flex justify-around items-center w-full">
                        <div className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-white/5 transition-colors">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Incoming</span>
                            <div className="flex items-center gap-2 text-emerald-400 font-bold bg-emerald-500/10 px-4 py-2 rounded-lg border border-emerald-500/20 shadow-inner">
                                <ArrowDownLeft size={20} /> IN
                            </div>
                        </div>
                        <div className="w-[1px] h-16 bg-white/5 hidden sm:block"></div>
                        <div className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-white/5 transition-colors">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Outgoing</span>
                            <div className="flex items-center gap-2 text-red-400 font-bold bg-red-500/10 px-4 py-2 rounded-lg border border-red-500/20 shadow-inner">
                                <ArrowUpRight size={20} /> OUT
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex flex-col">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3 px-1">
                    <History className="text-indigo-400" size={24} />
                    Transaction History
                </h2>

                <div className="erp-card flex-1 overflow-hidden flex flex-col shadow-xl border border-[rgba(255,255,255,0.05)]">
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left whitespace-nowrap">
                            <thead className="bg-slate-800/80 sticky top-0 z-10 backdrop-blur-md border-b border-white/5">
                                <tr>
                                    <th className="p-4 font-bold uppercase text-xs text-slate-400 tracking-wider">Date</th>
                                    <th className="p-4 font-bold uppercase text-xs text-slate-400 tracking-wider">Description</th>
                                    <th className="p-4 font-bold uppercase text-xs text-slate-400 tracking-wider text-center">Type</th>
                                    <th className="p-4 font-bold uppercase text-xs text-slate-400 tracking-wider text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {transactions.length > 0 ? transactions.map((tx, index) => (
                                    <tr key={tx.id || index} className="hover:bg-slate-700/50 transition-colors">
                                        <td className="p-4 font-mono text-sm text-slate-300">
                                            {new Date(tx.transaction_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td className="p-4 text-slate-200 font-medium">{tx.description}</td>
                                        <td className="p-4 text-center">
                                            <span className={`px-2.5 py-1 rounded text-[10px] uppercase font-bold tracking-wider shadow-sm border ${tx.type === 'credit'
                                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                    : 'bg-red-500/10 text-red-400 border-red-500/20'
                                                }`}>
                                                {tx.type === 'credit' ? 'Credit' : 'Debit'}
                                            </span>
                                        </td>
                                        <td className={`p-4 text-right font-mono font-bold ${tx.type === 'credit' ? 'text-emerald-400' : 'text-red-400'}`}>
                                            {tx.type === 'credit' ? '+' : '-'} ₹{parseFloat(tx.amount).toLocaleString('en-IN')}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="4" className="text-center p-12 text-slate-500">
                                            <History className="mx-auto mb-3 opacity-20" size={40} />
                                            <p>No transactions found for this account.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <style type="text/css">{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 8px;
                    height: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(15, 23, 42, 0.5);
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(99, 102, 241, 0.5);
                    border-radius: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(99, 102, 241, 0.8);
                }
            `}</style>
        </div>
    );
};

export default AccountDetails;
