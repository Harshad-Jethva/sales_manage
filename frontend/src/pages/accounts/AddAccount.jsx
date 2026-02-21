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
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="page-container">
            <header className="page-header">
                <button className="back-btn" onClick={() => navigate('/accounts')}>
                    <ArrowLeft size={20} /> Back to Accounts
                </button>
                <h1>Add New Bank Account</h1>
                <p className="text-muted">Register a new bank account or wallet for transactions.</p>
            </header>

            <div className="form-card glass-card">
                <form onSubmit={handleSubmit} className="premium-form">
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Bank / Wallet Name</label>
                            <div className="input-wrapper">
                                <Landmark size={18} />
                                <input
                                    required
                                    placeholder="e.g. HDFC Bank, PayPal"
                                    value={formData.bank_name}
                                    onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Account Number / ID</label>
                            <div className="input-wrapper">
                                <CreditCard size={18} />
                                <input
                                    required
                                    placeholder="XXXX-XXXX-XXXX-1234"
                                    value={formData.account_number}
                                    onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="form-grid">
                        <div className="form-group">
                            <label>Account Holder Name</label>
                            <div className="input-wrapper">
                                <User size={18} />
                                <input
                                    required
                                    placeholder="Name on account"
                                    value={formData.account_holder}
                                    onChange={(e) => setFormData({ ...formData, account_holder: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Initial Balance</label>
                            <div className="input-wrapper">
                                <DollarSign size={18} />
                                <input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={formData.balance}
                                    onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="btn-primary-gradient">
                            <Save size={20} /> Save Account
                        </button>
                    </div>
                </form>
            </div>

            <style jsx>{`
                .page-container { max-width: 800px; margin: 0 auto; color: white; padding-bottom: 3rem; }
                .page-header { margin-bottom: 2rem; }
                .page-header h1 { font-size: 2rem; font-weight: 800; margin-top: 1rem; background: linear-gradient(to right, #fff, #a5b4fc); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
                .text-muted { color: #94a3b8; }
                
                .back-btn {
                    display: flex; align-items: center; gap: 0.5rem;
                    background: none; border: none; color: #94a3b8;
                    cursor: pointer; font-size: 0.9rem; transition: 0.2s;
                }
                .back-btn:hover { color: white; transform: translateX(-4px); }

                .glass-card {
                    background: rgba(30, 41, 59, 0.7);
                    backdrop-filter: blur(16px);
                    border: 1px solid rgba(255,255,255,0.08);
                    border-radius: 24px;
                    padding: 2.5rem;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                }

                .premium-form { display: flex; flex-direction: column; gap: 1.5rem; }
                .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
                .form-group label { display: block; font-size: 0.9rem; color: #94a3b8; margin-bottom: 0.5rem; font-weight: 500; }
                
                .input-wrapper {
                    display: flex; align-items: center; gap: 0.8rem;
                    background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.1);
                    padding: 0.8rem 1rem; border-radius: 12px; transition: 0.3s;
                }
                .input-wrapper:focus-within { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2); background: rgba(0,0,0,0.4); }
                .input-wrapper input {
                    background: none; border: none; color: white; width: 100%; outline: none; font-size: 1rem;
                }

                .form-actions { display: flex; justify-content: flex-end; margin-top: 1rem; }
                .btn-primary-gradient {
                    display: flex; align-items: center; gap: 0.8rem;
                    padding: 1rem 2.5rem;
                    background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
                    border: none; border-radius: 12px; color: #fff;
                    cursor: pointer; box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
                    font-weight: 700; font-size: 1.1rem; transition: 0.3s;
                }
                .btn-primary-gradient:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(99, 102, 241, 0.5); }
                
                @media (max-width: 768px) {
                    .form-grid { grid-template-columns: 1fr; }
                }
            `}</style>
        </motion.div>
    );
};

export default AddAccount;
