import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { Landmark, CreditCard, User, Edit, ArrowLeft, Save, X, Search } from 'lucide-react';
import { motion } from 'framer-motion';

const UpdateAccount = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [accounts, setAccounts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [loading, setLoading] = useState(true);

    // Form State
    const [formData, setFormData] = useState({
        id: '',
        bank_name: '',
        account_number: '',
        account_holder: ''
    });

    useEffect(() => {
        fetchAccounts();
        if (location.state && location.state.account) {
            handleSelect(location.state.account);
        }
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

    const handleSelect = (account) => {
        setSelectedAccount(account);
        setFormData({
            id: account.id,
            bank_name: account.bank_name,
            account_number: account.account_number,
            account_holder: account.account_holder
        });
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.put('http://localhost/sales_manage/backend/api/banks.php', formData);
            if (res.data.success) {
                alert('Account updated successfully!');
                setSelectedAccount(null);
                fetchAccounts();
                if (location.state) navigate('/accounts');
            } else {
                alert('Failed to update: ' + (res.data.error || 'Unknown error'));
            }
        } catch (err) {
            console.error(err);
            alert('Update failed.');
        }
    };

    const filteredAccounts = accounts.filter(acc =>
        acc.bank_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        acc.account_number.includes(searchTerm) ||
        acc.account_holder.toLowerCase().includes(searchTerm.toLowerCase())
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
                    <h1 className="page-title">Update Account Details</h1>
                    <p className="page-subtitle">Modify bank account information.</p>
                </div>
            </header>

            {!selectedAccount ? (
                <div className="max-w-5xl mx-auto mt-6">
                    <div className="relative mb-8">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                        <input
                            type="text"
                            placeholder="Search by bank name, account number, or holder..."
                            className="erp-input pl-12 w-full py-4 text-base bg-surface-hover/50 border-[rgba(255,255,255,0.05)] shadow-lg"
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
                                    className="erp-card p-5 flex items-center justify-between cursor-pointer hover:-translate-y-1 group transition-all duration-300 border border-[rgba(255,255,255,0.02)] hover:border-indigo-500/30 hover:shadow-[0_10px_30px_-10px_rgba(99,102,241,0.2)]"
                                    onClick={() => handleSelect(acc)}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform">
                                            <Landmark size={24} />
                                        </div>
                                        <div>
                                            <h4 className="text-white font-bold text-lg">{acc.bank_name}</h4>
                                            <p className="text-slate-400 text-sm mt-0.5">{acc.account_number} • {acc.account_holder}</p>
                                        </div>
                                    </div>
                                    <button className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg group-hover:bg-indigo-500 group-hover:text-white transition-colors text-sm font-semibold">
                                        Select <Edit size={14} />
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full p-8 text-center text-slate-500">No accounts found matching your search.</div>
                        )}
                    </div>
                </div>
            ) : (
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="erp-card p-6 md:p-8 max-w-4xl mx-auto mt-6 border border-[rgba(255,255,255,0.05)] shadow-2xl"
                >
                    <div className="flex justify-between items-center mb-6 pb-6 border-b border-[rgba(255,255,255,0.05)]">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <Edit className="text-indigo-400" size={24} /> Editing: <span className="text-indigo-300">{selectedAccount.bank_name}</span>
                        </h3>
                        <button
                            className="flex items-center gap-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 px-3 py-1.5 rounded-lg transition-colors text-sm font-semibold"
                            onClick={() => setSelectedAccount(null)}
                        >
                            <X size={16} /> Cancel
                        </button>
                    </div>

                    <form onSubmit={handleUpdate} className="flex flex-col gap-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1.5">Bank Name</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Landmark size={18} className="text-slate-500" />
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        className="erp-input pl-10 w-full"
                                        value={formData.bank_name}
                                        onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1.5">Account Number</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <CreditCard size={18} className="text-slate-500" />
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        className="erp-input pl-10 w-full font-mono"
                                        value={formData.account_number}
                                        onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1.5">Account Holder</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User size={18} className="text-slate-500" />
                                </div>
                                <input
                                    type="text"
                                    required
                                    className="erp-input pl-10 w-full"
                                    value={formData.account_holder}
                                    onChange={(e) => setFormData({ ...formData, account_holder: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end mt-4 pt-6 border-t border-[rgba(255,255,255,0.05)]">
                            <button type="submit" className="erp-button erp-button-primary shadow-lg px-8 py-3 text-base">
                                <Save size={20} />
                                <span>Save Changes</span>
                            </button>
                        </div>
                    </form>
                </motion.div>
            )}
        </div>
    );
};

export default UpdateAccount;
