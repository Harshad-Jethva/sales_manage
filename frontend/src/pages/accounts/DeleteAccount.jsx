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
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="page-container">
            <header className="page-header">
                <button className="back-btn" onClick={() => navigate('/accounts')}>
                    <ArrowLeft size={20} /> Back to Accounts
                </button>
                <h1>Delete Account</h1>
                <p className="text-muted">Permanently remove a bank account/wallet.</p>
            </header>

            <div className="search-bar">
                <Search className="search-icon" size={20} />
                <input
                    type="text"
                    placeholder="Search accounts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="list-grid">
                {loading ? <p>Loading...</p> : filteredAccounts.map(acc => (
                    <div key={acc.id} className="list-item glass-card-danger">
                        <div className="item-left">
                            <div className="avatar-danger"><Landmark size={24} /></div>
                            <div className="item-info">
                                <h4>{acc.bank_name}</h4>
                                <p>{acc.account_number} • Balance: ₹{acc.balance}</p>
                            </div>
                        </div>
                        <button className="btn-delete" onClick={() => handleDelete(acc.id, acc.bank_name)}>
                            <Trash2 size={16} /> Delete
                        </button>
                    </div>
                ))}
                {filteredAccounts.length === 0 && !loading && <p style={{ textAlign: 'center', color: '#94a3b8' }}>No accounts found.</p>}
            </div>

            <style jsx>{`
                .page-container { max-width: 800px; margin: 0 auto; color: white; padding-bottom: 3rem; }
                .page-header { margin-bottom: 2rem; }
                .page-header h1 { color: #f87171; font-size: 2rem; margin-bottom: 0.5rem; }
                .text-muted { color: #94a3b8; }
                .back-btn { display: flex; align-items: center; gap: 0.5rem; background: none; border: none; color: #94a3b8; cursor: pointer; margin-bottom: 1rem; transition: 0.2s; }
                .back-btn:hover { color: white; }

                .search-bar { position: relative; margin-bottom: 2rem; }
                .search-icon { position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: #94a3b8; }
                .search-bar input { width: 100%; padding: 1rem 1rem 1rem 3rem; background: rgba(30, 41, 59, 0.5); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; color: white; font-size: 1rem; outline: none; transition: 0.2s; }
                .search-bar input:focus { border-color: #ef4444; box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.2); }

                .list-grid { display: grid; gap: 1rem; }
                .list-item { display: flex; align-items: center; justify-content: space-between; padding: 1.5rem; background: rgba(239, 68, 68, 0.05); border: 1px solid rgba(239, 68, 68, 0.1); border-radius: 16px; transition: 0.2s; }
                .list-item:hover { background: rgba(239, 68, 68, 0.1); border-color: #f87171; transform: translateX(4px); }
                
                .item-left { display: flex; align-items: center; gap: 1rem; }
                .avatar-danger { width: 48px; height: 48px; background: rgba(239, 68, 68, 0.2); color: #f87171; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
                .item-info h4 { margin: 0; font-size: 1.1rem; color: white; }
                .item-info p { margin: 2px 0 0; font-size: 0.9rem; color: #94a3b8; }
                
                .btn-delete { display: flex; align-items: center; gap: 0.5rem; padding: 0.6rem 1.2rem; background: rgba(239, 68, 68, 0.15); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 8px; cursor: pointer; transition: 0.2s; font-weight: 600; }
                .btn-delete:hover { background: #ef4444; color: white; }
            `}</style>
        </motion.div>
    );
};

export default DeleteAccount;
