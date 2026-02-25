import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Search, Trash2, ArrowLeft, Landmark, AlertTriangle } from 'lucide-react';

const DeleteAccount = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [accounts, setAccounts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (location.state && location.state.account) {
            setSearchTerm(location.state.account.bank_name);
        }
        fetchAccounts();
    }, [location.state]);

    const fetchAccounts = async () => {
        try {
            const res = await axios.get('http://localhost/sales_manage/backend/api/banks.php');
            setAccounts(Array.isArray(res.data) ? res.data : []);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Are you sure you want to PERMANENTLY delete account "${name}"?\n\nWARNING: All transaction history associated with this account will also be deleted!`)) return;

        try {
            const res = await axios.delete(`http://localhost/sales_manage/backend/api/banks.php?id=${id}`);
            if (res.data.success) {
                alert("Account Deleted Successfully");
                setAccounts(accounts.filter(a => a.id !== id));
            } else {
                alert("Error: " + (res.data.error || 'Unknown error'));
            }
        } catch (err) {
            console.error(err);
            alert("Delete Failed");
        }
    };

    const filteredAccounts = accounts.filter(acc =>
        acc.bank_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        acc.account_number.includes(searchTerm)
    );

    return (
        <div className="animate-fade-in">
            <header className="page-header flex flex-col items-start gap-4">
                <button
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-semibold"
                    onClick={() => navigate('/accounts')}
                >
                    <ArrowLeft size={16} /> Back to Accounts
                </button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-red-500 flex items-center gap-3">
                        <AlertTriangle className="text-red-500" size={32} />
                        Delete Account
                    </h1>
                    <p className="page-subtitle mt-1">Permanently remove a bank account/wallet.</p>
                </div>
            </header>

            <div className="max-w-5xl mx-auto mt-6">
                <div className="relative mb-8">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                    <input
                        type="text"
                        placeholder="Search accounts to delete..."
                        className="w-full bg-surface-hover/50 border border-red-500/20 text-white pl-12 pr-4 py-4 rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition-all placeholder:text-slate-500 shadow-lg shadow-red-500/5 text-base"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {loading ? (
                        <div className="col-span-full p-8 text-center text-slate-400">Loading accounts...</div>
                    ) : filteredAccounts.length > 0 ? (
                        filteredAccounts.map(acc => (
                            <div
                                key={acc.id}
                                className="bg-red-500/5 border border-red-500/20 rounded-xl p-5 flex items-center justify-between hover:bg-red-500/10 transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-red-500/10 group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-red-500/20 text-red-400 rounded-xl flex items-center justify-center shrink-0">
                                        <Landmark size={24} />
                                    </div>
                                    <div>
                                        <h4 className="text-white font-bold text-lg">{acc.bank_name}</h4>
                                        <p className="text-slate-400 text-sm mt-0.5">{acc.account_number} • Balance: ₹{acc.balance}</p>
                                    </div>
                                </div>
                                <button
                                    className="flex items-center gap-2 px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg group-hover:bg-red-500 group-hover:text-white transition-colors text-sm font-semibold"
                                    onClick={() => handleDelete(acc.id, acc.bank_name)}
                                >
                                    <Trash2 size={16} /> Delete
                                </button>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full p-8 text-center text-slate-500">No matching accounts found.</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DeleteAccount;
