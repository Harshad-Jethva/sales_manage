import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Search, Trash2, ArrowLeft, AlertTriangle } from 'lucide-react';

const DeleteClient = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [clients, setClients] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (location.state && location.state.client) {
            setSearchTerm(location.state.client.name);
        }
        fetchClients();
    }, [location.state]);

    const fetchClients = async () => {
        try {
            const res = await axios.get('http://localhost/sales_manage/backend/api/clients.php');
            setClients(Array.isArray(res.data) ? res.data : []);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Are you sure you want to PERMANENTLY delete client "${name}"? This action cannot be undone.`)) return;

        try {
            const res = await axios.delete('http://localhost/sales_manage/backend/api/clients.php', { data: { id } });
            if (res.data.success) {
                alert("Client Deleted Successfully");
                setClients(clients.filter(c => c.id !== id));
            } else {
                alert("Error: " + res.data.error);
            }
        } catch (err) {
            console.error(err);
            alert("Delete Failed");
        }
    };

    const filteredClients = clients.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.phone && c.phone.includes(searchTerm)) ||
        (c.shop_name && c.shop_name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="page-container">
            <header className="page-header">
                <button className="btn-back" onClick={() => navigate('/clients')}>
                    <ArrowLeft size={18} /> Back to List
                </button>
                <h1>Delete Client</h1>
                <p className="text-muted">Search for a client to permanently remove them from the directory.</p>
            </header>

            <div className="search-bar">
                <Search className="search-icon" size={20} />
                <input
                    type="text"
                    placeholder="Search clients..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="client-list">
                {loading ? <p>Loading clients...</p> : filteredClients.map(client => (
                    <motion.div
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        key={client.id}
                        className="client-item"
                    >
                        <div className="ci-left">
                            <div className="ci-avatar-danger">{client.name[0]}</div>
                            <div className="ci-info">
                                <h4>{client.name}</h4>
                                <p>{client.phone} • {client.shop_name || 'Individual'}</p>
                            </div>
                        </div>
                        <button className="btn-delete" onClick={() => handleDelete(client.id, client.name)}>
                            <Trash2 size={16} /> Delete
                        </button>
                    </motion.div>
                ))}
                {filteredClients.length === 0 && !loading && <p className="no-results">No clients found matching "{searchTerm}"</p>}
            </div>

            <style jsx>{`
        .page-container { max-width: 800px; margin: 0 auto; color: white; }
        .page-header { margin-bottom: 2rem; }
        .page-header h1 { color: #f87171; font-size: 2rem; margin-bottom: 0.5rem; }
        .btn-back { display: flex; align-items: center; gap: 0.5rem; background: none; border: none; color: #94a3b8; cursor: pointer; margin-bottom: 1rem; transition: 0.2s; }
        .btn-back:hover { color: white; }

        .search-bar { position: relative; margin-bottom: 2rem; }
        .search-icon { position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: #94a3b8; }
        .search-bar input { width: 100%; padding: 1rem 1rem 1rem 3rem; background: rgba(30, 41, 59, 0.5); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; color: white; font-size: 1rem; outline: none; transition: 0.2s; }
        .search-bar input:focus { border-color: #ef4444; box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.2); }

        .client-list { display: grid; gap: 1rem; }
        .client-item { display: flex; align-items: center; justify-content: space-between; padding: 1rem; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; transition: 0.2s; }
        .client-item:hover { background: rgba(239, 68, 68, 0.05); border-color: #f87171; transform: translateX(4px); }
        
        .ci-left { display: flex; align-items: center; gap: 1rem; }
        .ci-avatar-danger { width: 42px; height: 42px; background: rgba(239, 68, 68, 0.2); color: #f87171; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.2rem; }
        .ci-info h4 { margin: 0; font-size: 1rem; color: white; }
        .ci-info p { margin: 2px 0 0; font-size: 0.85rem; color: #94a3b8; }
        
        .btn-delete { display: flex; align-items: center; gap: 0.5rem; padding: 0.6rem 1.2rem; background: rgba(239, 68, 68, 0.15); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 8px; cursor: pointer; transition: 0.2s; font-weight: 500; }
        .btn-delete:hover { background: #ef4444; color: white; }
      `}</style>
        </div>
    );
};

export default DeleteClient;
