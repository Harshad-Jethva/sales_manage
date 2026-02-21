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
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="page-container">
            <header className="page-header">
                <button className="back-btn" onClick={() => navigate('/accounts')}>
                    <ArrowLeft size={20} /> Back to Accounts
                </button>
                <h1>Update Account Details</h1>
                <p className="text-muted">Modify bank account information.</p>
            </header>

            {!selectedAccount ? (
                <div className="selection-view">
                    <div className="search-bar">
                        <Search className="search-icon" size={20} />
                        <input
                            type="text"
                            placeholder="Search by bank, number, or holder..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="list-grid">
                        {loading ? <p>Loading...</p> : filteredAccounts.map(acc => (
                            <div key={acc.id} className="list-item glass-card" onClick={() => handleSelect(acc)}>
                                <div className="item-left">
                                    <div className="avatar"><Landmark size={24} /></div>
                                    <div className="item-info">
                                        <h4>{acc.bank_name}</h4>
                                        <p>{acc.account_number} • {acc.account_holder}</p>
                                    </div>
                                </div>
                                <button className="btn-select">Select <Edit size={16} /></button>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="edit-form glass-card">
                    <div className="form-header">
                        <h3>Editing: {selectedAccount.bank_name}</h3>
                        <button className="btn-close" onClick={() => setSelectedAccount(null)}><X size={20} /> Cancel</button>
                    </div>

                    <form onSubmit={handleUpdate} className="premium-form">
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Bank Name</label>
                                <div className="input-wrapper">
                                    <Landmark size={18} />
                                    <input
                                        required
                                        value={formData.bank_name}
                                        onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Account Number</label>
                                <div className="input-wrapper">
                                    <CreditCard size={18} />
                                    <input
                                        required
                                        value={formData.account_number}
                                        onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="form-group full">
                            <label>Account Holder</label>
                            <div className="input-wrapper">
                                <User size={18} />
                                <input
                                    required
                                    value={formData.account_holder}
                                    onChange={(e) => setFormData({ ...formData, account_holder: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="form-actions">
                            <button type="submit" className="btn-primary-gradient">
                                <Save size={20} /> Save Changes
                            </button>
                        </div>
                    </form>
                </motion.div>
            )}

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

                .search-bar { position: relative; margin-bottom: 2rem; }
                .search-icon { position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: #94a3b8; }
                .search-bar input { width: 100%; padding: 1rem 1rem 1rem 3rem; background: rgba(30, 41, 59, 0.5); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; color: white; font-size: 1rem; outline: none; transition: 0.2s; }
                .search-bar input:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2); }

                .list-grid { display: grid; gap: 1rem; }
                .list-item { display: flex; align-items: center; justify-content: space-between; padding: 1.5rem; background: rgba(30, 41, 59, 0.6); border: 1px solid rgba(255,255,255,0.05); border-radius: 16px; cursor: pointer; transition: 0.2s; }
                .list-item:hover { background: rgba(30, 41, 59, 0.9); border-color: #6366f1; transform: translateY(-2px); }
                
                .item-left { display: flex; align-items: center; gap: 1rem; }
                .avatar { width: 48px; height: 48px; background: linear-gradient(135deg, #6366f1, #4f46e5); color: white; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
                .item-info h4 { margin: 0; font-size: 1.1rem; color: white; }
                .item-info p { margin: 2px 0 0; font-size: 0.9rem; color: #94a3b8; }
                
                .btn-select { display: flex; align-items: center; gap: 0.5rem; padding: 0.6rem 1rem; background: rgba(99, 102, 241, 0.1); color: #818cf8; border: 1px solid rgba(99, 102, 241, 0.2); border-radius: 8px; cursor: pointer; transition: 0.2s; }
                .btn-select:hover { background: #6366f1; color: white; }

                .edit-form { padding: 2.5rem; border-radius: 24px; background: rgba(30, 41, 59, 0.8); border: 1px solid rgba(255,255,255,0.1); }
                .form-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
                .btn-close { display: flex; align-items: center; gap: 0.5rem; background: none; border: none; color: #ef4444; cursor: pointer; }

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

export default UpdateAccount;
