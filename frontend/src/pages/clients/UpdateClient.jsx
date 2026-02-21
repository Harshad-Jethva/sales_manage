import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import {
    Search, Edit, ArrowLeft, Save, X,
    Building2, User, MapPin, FileText, Phone, Mail, Briefcase
} from 'lucide-react';

const UpdateClient = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [clients, setClients] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedClient, setSelectedClient] = useState(null);
    const [activeFormTab, setActiveFormTab] = useState('personal');

    // Form State
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchClients();
    }, []);

    useEffect(() => {
        if (location.state && location.state.client) {
            handleSelect(location.state.client);
        }
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

    const handleSelect = (client) => {
        setSelectedClient(client);
        setActiveFormTab('personal');
        setFormData({
            id: client.id,
            name: client.name || '',
            phone: client.phone || '',
            email: client.email || '',
            customer_type: client.customer_type || 'Regular',
            shop_name: client.shop_name || '',
            company: client.company || '',
            website: client.website || '',
            contact_person: client.contact_person || '',
            address: client.address || '',
            city: client.city || '',
            state: client.state || '',
            pincode: client.pincode || '',
            billing_address: client.billing_address || '',
            shipping_address: client.shipping_address || '',
            gstin: client.gstin || '',
            pan: client.pan || '',
            credit_limit: client.credit_limit || '',
            notes: client.notes || '',
            bank_name: client.bank_name || '',
            account_number: client.account_number || '',
            ifsc_code: client.ifsc_code || ''
        });
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                // Fallbacks for addresses if empty
                billing_address: formData.billing_address || formData.address,
                shipping_address: formData.shipping_address || formData.address
            };
            const res = await axios.put('http://localhost/sales_manage/backend/api/clients.php', payload);
            if (res.data.success) {
                alert("Client Updated Successfully!");
                setSelectedClient(null);
                fetchClients();
                // Optionally navigate back or stay to edit more
                if (location.state) navigate('/clients');
            } else {
                alert("Error: " + res.data.error);
            }
        } catch (err) {
            console.error(err);
            alert("Update Failed");
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
                <h1>Update Client</h1>
                <p className="text-muted">Search for a client and update their details.</p>
            </header>

            {!selectedClient ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="selection-view">
                    <div className="search-bar">
                        <Search className="search-icon" size={20} />
                        <input
                            type="text"
                            placeholder="Search clients by name, phone, or shop..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="client-list">
                        {loading ? <p>Loading clients...</p> : filteredClients.map(client => (
                            <div key={client.id} className="client-item" onClick={() => handleSelect(client)}>
                                <div className="ci-avatar">{client.name[0]}</div>
                                <div className="ci-info">
                                    <h4>{client.name}</h4>
                                    <p>{client.shop_name || client.company || client.phone}</p>
                                </div>
                                <button className="btn-select">Select <Edit size={16} /></button>
                            </div>
                        ))}
                        {filteredClients.length === 0 && !loading && <p className="no-results">No clients found matching "{searchTerm}"</p>}
                    </div>
                </motion.div>
            ) : (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="edit-form-container">
                    <div className="form-header">
                        <h3>Editing: {selectedClient.name}</h3>
                        <button className="btn-close" onClick={() => setSelectedClient(null)}><X size={20} /> Cancel</button>
                    </div>

                    <div className="tabs-header">
                        {['personal', 'work', 'billing', 'bank'].map(tab => (
                            <button
                                key={tab}
                                className={`tab-btn ${activeFormTab === tab ? 'active' : ''}`}
                                onClick={() => setActiveFormTab(tab)}
                            >
                                {tab.charAt(0).toUpperCase() + tab.slice(1)} Info
                            </button>
                        ))}
                    </div>

                    <form onSubmit={handleUpdate} className="update-form">

                        {activeFormTab === 'personal' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="form-section">
                                <div className="section-title"><User size={20} /> Personal Details</div>
                                <div className="grid-2">
                                    <div className="f-group">
                                        <label>Full Name *</label>
                                        <input required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                                    </div>
                                    <div className="f-group">
                                        <label>Client Type</label>
                                        <select value={formData.customer_type} onChange={(e) => setFormData({ ...formData, customer_type: e.target.value })}>
                                            <option value="Regular">Regular</option>
                                            <option value="VIP">VIP</option>
                                            <option value="Wholesale">Wholesale</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid-2">
                                    <div className="f-group">
                                        <label>Phone *</label>
                                        <input required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                                    </div>
                                    <div className="f-group">
                                        <label>Email</label>
                                        <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                                    </div>
                                </div>

                                <div className="f-group">
                                    <label>Address</label>
                                    <textarea rows="2" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
                                </div>

                                <div className="grid-3">
                                    <div className="f-group"><label>City</label><input value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} /></div>
                                    <div className="f-group"><label>State</label><input value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value })} /></div>
                                    <div className="f-group"><label>Pincode</label><input value={formData.pincode} onChange={(e) => setFormData({ ...formData, pincode: e.target.value })} /></div>
                                </div>
                                <div className="f-group">
                                    <label>Internal Notes</label>
                                    <textarea rows="2" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
                                </div>
                            </motion.div>
                        )}

                        {activeFormTab === 'work' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="form-section">
                                <div className="section-title"><Briefcase size={20} /> Business Details</div>
                                <div className="f-group">
                                    <label>Shop Name</label>
                                    <input value={formData.shop_name} onChange={(e) => setFormData({ ...formData, shop_name: e.target.value })} />
                                </div>
                                <div className="grid-2">
                                    <div className="f-group"><label>Company Name</label><input value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} /></div>
                                    <div className="f-group"><label>Website</label><input value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })} /></div>
                                </div>
                                <div className="f-group">
                                    <label>Contact Person</label>
                                    <input value={formData.contact_person} onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })} />
                                </div>
                            </motion.div>
                        )}

                        {activeFormTab === 'billing' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="form-section">
                                <div className="section-title"><FileText size={20} /> Tax & Billing</div>
                                <div className="grid-2">
                                    <div className="f-group"><label>GSTIN</label><input value={formData.gstin} onChange={(e) => setFormData({ ...formData, gstin: e.target.value })} style={{ textTransform: 'uppercase' }} /></div>
                                    <div className="f-group"><label>PAN</label><input value={formData.pan} onChange={(e) => setFormData({ ...formData, pan: e.target.value })} style={{ textTransform: 'uppercase' }} /></div>
                                </div>
                                <div className="f-group">
                                    <label>Credit Limit (₹)</label>
                                    <input type="number" value={formData.credit_limit} onChange={(e) => setFormData({ ...formData, credit_limit: e.target.value })} />
                                </div>
                                <div className="grid-2">
                                    <div className="f-group"><label>Billing Address</label><textarea value={formData.billing_address} onChange={(e) => setFormData({ ...formData, billing_address: e.target.value })} /></div>
                                    <div className="f-group"><label>Shipping Address</label><textarea value={formData.shipping_address} onChange={(e) => setFormData({ ...formData, shipping_address: e.target.value })} /></div>
                                </div>
                            </motion.div>
                        )}

                        {activeFormTab === 'bank' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="form-section">
                                <div className="section-title"><Building2 size={20} /> Bank Details</div>
                                <div className="f-group">
                                    <label>Bank Name</label>
                                    <input value={formData.bank_name} onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })} />
                                </div>
                                <div className="grid-2">
                                    <div className="f-group"><label>Account Number</label><input value={formData.account_number} onChange={(e) => setFormData({ ...formData, account_number: e.target.value })} /></div>
                                    <div className="f-group"><label>IFSC Code</label><input value={formData.ifsc_code} onChange={(e) => setFormData({ ...formData, ifsc_code: e.target.value })} style={{ textTransform: 'uppercase' }} /></div>
                                </div>
                            </motion.div>
                        )}

                        <div className="form-actions">
                            <button type="submit" className="btn-save"><Save size={18} /> Update Client</button>
                        </div>
                    </form>
                </motion.div>
            )}

            <style jsx>{`
        .page-container { max-width: 900px; margin: 0 auto; padding-bottom: 3rem; color: white; }
        .page-header { margin-bottom: 2rem; }
        .page-header h1 { font-size: 2rem; margin-bottom: 0.5rem; }
        .btn-back { display: flex; align-items: center; gap: 0.5rem; background: none; border: none; color: #94a3b8; cursor: pointer; margin-bottom: 1rem; transition: 0.2s; }
        .btn-back:hover { color: white; }

        .search-bar { position: relative; margin-bottom: 2rem; }
        .search-icon { position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: #94a3b8; }
        .search-bar input { width: 100%; padding: 1rem 1rem 1rem 3rem; background: rgba(30, 41, 59, 0.5); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; color: white; font-size: 1rem; outline: none; transition: 0.2s; }
        .search-bar input:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2); }

        .client-list { display: grid; gap: 1rem; }
        .client-item { display: flex; align-items: center; gap: 1rem; padding: 1rem; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; cursor: pointer; transition: 0.2s; }
        .client-item:hover { background: rgba(255,255,255,0.07); transform: translateX(5px); border-color: #6366f1; }
        
        .ci-avatar { width: 42px; height: 42px; background: linear-gradient(135deg, #6366f1, #a855f7); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-weight: 700; color: white; font-size: 1.2rem; }
        .ci-info { flex: 1; }
        .ci-info h4 { margin: 0; font-size: 1rem; color: white; }
        .ci-info p { margin: 2px 0 0; font-size: 0.85rem; color: #94a3b8; }
        
        .btn-select { display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; background: rgba(99, 102, 241, 0.1); color: #818cf8; border: 1px solid rgba(99, 102, 241, 0.2); border-radius: 8px; cursor: pointer; transition: 0.2s; }
        .btn-select:hover { background: #6366f1; color: white; }

        .edit-form-container { background: rgba(30, 41, 59, 0.8); padding: 2rem; border-radius: 16px; border: 1px solid rgba(255,255,255,0.05); }
        .form-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 1px solid rgba(255,255,255,0.1); }
        .btn-close { display: flex; align-items: center; gap: 0.5rem; background: none; border: none; color: #ef4444; cursor: pointer; }

        .tabs-header { display: flex; gap: 0.5rem; margin-bottom: 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 0.5rem; }
        .tab-btn { padding: 0.5rem 1rem; background: none; border: none; color: #94a3b8; cursor: pointer; border-radius: 6px; transition: 0.2s; font-weight: 600; }
        .tab-btn:hover { color: white; background: rgba(255,255,255,0.05); }
        .tab-btn.active { background: #6366f1; color: white; }
        
        .section-title { display: flex; align-items: center; gap: 0.5rem; font-size: 1.1rem; margin-bottom: 1.5rem; color: white; font-weight: 600; padding-bottom: 0.5rem; border-bottom: 1px solid rgba(255,255,255,0.05); }
        
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem; }
        .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem; }

        .f-group { margin-bottom: 1.5rem; }
        .f-group label { display: block; margin-bottom: 0.5rem; color: #94a3b8; font-size: 0.9rem; }
        .f-group input, .f-group select, .f-group textarea { width: 100%; padding: 0.8rem; background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: white; transition: 0.2s; }
        .f-group input:focus, .f-group select:focus, .f-group textarea:focus { border-color: #6366f1; outline: none; box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2); }
        
        .form-actions { margin-top: 2rem; display: flex; justify-content: flex-end; }
        .btn-save { display: flex; align-items: center; gap: 0.8rem; padding: 0.8rem 2rem; background: #6366f1; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; transition: 0.2s; }
        .btn-save:hover { background: #4f46e5; }
      `}</style>
        </div>
    );
};

export default UpdateClient;
