import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Search, Trash2, ArrowLeft, Users } from 'lucide-react';

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
        <div className="animate-fade-in max-w-4xl mx-auto pb-16">
            <header className="page-header mb-8">
                <button className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4 text-sm font-medium" onClick={() => navigate('/clients')}>
                    <ArrowLeft size={16} /> Back to List
                </button>
                <h1 className="text-3xl font-bold text-red-400 m-0 mb-2 flex items-center gap-3">
                    <Trash2 size={28} /> Delete Client
                </h1>
                <p className="text-slate-400 mt-1">Search for a client to permanently remove them from the directory.</p>
            </header>

            <div className="erp-card p-6 mb-8 relative z-10">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                    <input
                        type="text"
                        placeholder="Search clients by name, phone, or shop..."
                        className="erp-input pl-12 w-full border-red-500/20 focus:border-red-500/50 focus:ring-red-500/20"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid gap-4">
                {loading ? (
                    <div className="flex justify-center p-12">
                        <div className="w-8 h-8 border-4 border-red-500/20 border-t-red-500 rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <AnimatePresence>
                        {filteredClients.map((client, index) => (
                            <motion.div
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: index * 0.05 }}
                                key={client.id}
                                className="erp-card p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-white/5 hover:border-red-500/30 hover:bg-red-500/5 transition-all group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center font-bold text-xl shrink-0 group-hover:scale-110 transition-transform">
                                        {client.name[0]}
                                    </div>
                                    <div>
                                        <h4 className="text-white font-bold text-lg m-0 group-hover:text-red-300 transition-colors">{client.name}</h4>
                                        <p className="text-slate-400 text-sm m-0 mt-0.5">{client.phone} • {client.shop_name || 'Individual'}</p>
                                    </div>
                                </div>
                                <button
                                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500 hover:text-white transition-all font-semibold"
                                    onClick={() => handleDelete(client.id, client.name)}
                                >
                                    <Trash2 size={16} /> Delete Forever
                                </button>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}

                {filteredClients.length === 0 && !loading && (
                    <div className="text-center p-12 erp-card border-white/5 border-dashed">
                        <Users className="mx-auto text-slate-600 mb-4" size={48} />
                        <h3 className="text-white text-lg font-bold">No clients found</h3>
                        <p className="text-slate-400">"{searchTerm}" didn't match any clients.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DeleteClient;
