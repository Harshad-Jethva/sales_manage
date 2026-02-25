import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Landmark, CreditCard, User, Wallet, ArrowLeft, Save, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';

const AddAccount = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        bank_name: '',
        account_number: '',
        account_holder: '',
        balance: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost/sales_manage/backend/api/banks.php', {
                ...formData,
                action: 'add_account'
            });
            if (res.data.success) {
                alert('Account added successfully!');
                navigate('/accounts');
            } else {
                alert('Failed to add account: ' + (res.data.error || 'Unknown error'));
            }
        } catch (err) {
            console.error(err);
            alert('An error occurred.');
        }
    };

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
                    <h1 className="page-title">Add New Bank Account</h1>
                    <p className="page-subtitle">Register a new bank account or wallet for transactions.</p>
                </div>
            </header>

            <div className="erp-card p-6 md:p-8 max-w-4xl mx-auto mt-6 border border-[rgba(255,255,255,0.05)] shadow-2xl">
                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1.5">Bank / Wallet Name</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Landmark size={18} className="text-slate-500" />
                                </div>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. HDFC Bank, PayPal"
                                    className="erp-input pl-10 w-full"
                                    value={formData.bank_name}
                                    onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1.5">Account Number / ID</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <CreditCard size={18} className="text-slate-500" />
                                </div>
                                <input
                                    type="text"
                                    required
                                    placeholder="XXXX-XXXX-XXXX-1234"
                                    className="erp-input pl-10 w-full font-mono"
                                    value={formData.account_number}
                                    onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1.5">Account Holder Name</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User size={18} className="text-slate-500" />
                                </div>
                                <input
                                    type="text"
                                    required
                                    placeholder="Name on account"
                                    className="erp-input pl-10 w-full"
                                    value={formData.account_holder}
                                    onChange={(e) => setFormData({ ...formData, account_holder: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1.5">Initial Balance</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <DollarSign size={18} className="text-slate-500" />
                                </div>
                                <input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    className="erp-input pl-10 w-full font-mono"
                                    value={formData.balance}
                                    onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end mt-6 pt-6 border-t border-[rgba(255,255,255,0.05)]">
                        <button type="submit" className="erp-button erp-button-primary shadow-lg px-8 py-3 text-base">
                            <Save size={20} />
                            <span>Save Account</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddAccount;
