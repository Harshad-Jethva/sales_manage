import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import {
    Search, Edit, ArrowLeft, Save, X,
    Building2, UserCircle, MapPin, Phone, Mail, Hash, Briefcase, User
} from 'lucide-react';

const UpdateStore = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [suppliers, setSuppliers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSupplier, setSelectedSupplier] = useState(null);

    // Form State
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSuppliers();
    }, []);

    useEffect(() => {
        if (location.state && location.state.supplier) {
            handleSelect(location.state.supplier);
        }
    }, [location.state]);

    const fetchSuppliers = async () => {
        try {
            const res = await axios.get('http://localhost/sales_manage/backend/api/stores.php');
            setSuppliers(Array.isArray(res.data) ? res.data : []);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleSelect = (supplier) => {
        setSelectedSupplier(supplier);
        setFormData({
            id: supplier.id,
            supplier_name: supplier.supplier_name || '',
            contact_person: supplier.contact_person || '',
            phone: supplier.phone || '',
            email: supplier.email || '',
            address: supplier.address || '',
            gst_number: supplier.gst_number || ''
        });
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.put('http://localhost/sales_manage/backend/api/stores.php', formData);
            if (res.data.success) {
                alert("Supplier Updated Successfully!");
                setSelectedSupplier(null);
                fetchSuppliers();
                if (location.state) navigate('/stores');
            } else {
                alert("Error: " + res.data.error);
            }
        } catch (err) {
            console.error(err);
            alert("Update Failed");
        }
    };

    const filteredSuppliers = suppliers.filter(s =>
        s.supplier_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.contact_person && s.contact_person.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (s.phone && s.phone.includes(searchTerm))
    );

    return (
        <div className="page-container">
            <header className="page-header">
                <button className="btn-back" onClick={() => navigate('/stores')}>
                    <ArrowLeft size={18} /> Back to List
                </button>
                <h1>Update Supplier</h1>
                <p className="text-muted">Search for a supplier and update their details.</p>
            </header>

            {!selectedSupplier ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="selection-view">
                    <div className="search-bar">
                        <Search className="search-icon" size={20} />
                        <input
                            type="text"
                            placeholder="Search suppliers by name, person, or phone..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="supplier-list">
                        {loading ? <p>Loading suppliers...</p> : filteredSuppliers.map(sup => (
                            <div key={sup.id} className="supplier-item" onClick={() => handleSelect(sup)}>
                                <div className="si-avatar">{sup.supplier_name[0]}</div>
                                <div className="si-info">
                                    <h4>{sup.supplier_name}</h4>
                                    <p>{sup.contact_person || 'No Contact'} • {sup.phone}</p>
                                </div>
                                <button className="btn-select">Select <Edit size={16} /></button>
                            </div>
                        ))}
                        {filteredSuppliers.length === 0 && !loading && <p className="no-results">No suppliers found matching "{searchTerm}"</p>}
                    </div>
                </motion.div>
            ) : (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="edit-form-container">
                    <div className="form-header">
                        <h3>Editing: {selectedSupplier.supplier_name}</h3>
                        <button className="btn-close" onClick={() => setSelectedSupplier(null)}><X size={20} /> Cancel</button>
                    </div>

                    <form onSubmit={handleUpdate} className="update-form">
                        <div className="form-section">
                            <div className="section-title"><Building2 size={20} /> Store Information</div>
                            <div className="grid-2">
                                <div className="f-group">
                                    <label>Company / Store Name</label>
                                    <input required value={formData.supplier_name} onChange={(e) => setFormData({ ...formData, supplier_name: e.target.value })} />
                                </div>
                                <div className="f-group">
                                    <label>GST Number</label>
                                    <input value={formData.gst_number} onChange={(e) => setFormData({ ...formData, gst_number: e.target.value })} />
                                </div>
                            </div>
                        </div>

                        <div className="form-section">
                            <div className="section-title"><User size={20} /> Contact Details</div>
                            <div className="grid-2">
                                <div className="f-group">
                                    <label>Contact Person</label>
                                    <input value={formData.contact_person} onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })} />
                                </div>
                                <div className="f-group">
                                    <label>Phone Number</label>
                                    <input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                                </div>
                            </div>
                            <div className="f-group">
                                <label>Email Address</label>
                                <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                            </div>
                        </div>

                        <div className="form-section">
                            <div className="section-title"><MapPin size={20} /> Address</div>
                            <div className="f-group">
                                <label>Warehouse / Office Address</label>
                                <textarea rows="3" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
                            </div>
                        </div>

                        <div className="form-actions">
                            <button type="submit" className="btn-save"><Save size={18} /> Update Supplier</button>
                        </div>
                    </form>
                </motion.div>
            )}

            <style>{`
                .page-container { max-width: 900px; margin: 0 auto; padding-bottom: 3rem; color: white; }
                .page-header { margin-bottom: 2rem; }
                .page-header h1 { font-size: 2rem; margin-bottom: 0.5rem; }
                .btn-back { display: flex; align-items: center; gap: 0.5rem; background: none; border: none; color: #94a3b8; cursor: pointer; margin-bottom: 1rem; transition: 0.2s; }
                .btn-back:hover { color: white; }
                .text-muted { color: #94a3b8; }

                .search-bar { position: relative; margin-bottom: 2rem; }
                .search-icon { position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: #94a3b8; }
                .search-bar input { width: 100%; padding: 1rem 1rem 1rem 3rem; background: rgba(30, 41, 59, 0.5); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; color: white; font-size: 1rem; outline: none; transition: 0.2s; }
                .search-bar input:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2); }

                .supplier-list { display: grid; gap: 1rem; }
                .supplier-item { display: flex; align-items: center; gap: 1rem; padding: 1rem; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; cursor: pointer; transition: 0.2s; }
                .supplier-item:hover { background: rgba(255,255,255,0.07); transform: translateX(5px); border-color: #6366f1; }
                
                .si-avatar { width: 42px; height: 42px; background: linear-gradient(135deg, #6366f1, #a855f7); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-weight: 700; color: white; font-size: 1.2rem; }
                .si-info { flex: 1; }
                .si-info h4 { margin: 0; font-size: 1rem; color: white; }
                .si-info p { margin: 2px 0 0; font-size: 0.85rem; color: #94a3b8; }
                
                .btn-select { display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; background: rgba(99, 102, 241, 0.1); color: #818cf8; border: 1px solid rgba(99, 102, 241, 0.2); border-radius: 8px; cursor: pointer; transition: 0.2s; }
                .btn-select:hover { background: #6366f1; color: white; }

                .edit-form-container { background: rgba(30, 41, 59, 0.8); padding: 2rem; border-radius: 16px; border: 1px solid rgba(255,255,255,0.05); }
                .form-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 1px solid rgba(255,255,255,0.1); }
                .btn-close { display: flex; align-items: center; gap: 0.5rem; background: none; border: none; color: #ef4444; cursor: pointer; }

                .section-title { display: flex; align-items: center; gap: 0.5rem; font-size: 1.1rem; margin-bottom: 1.5rem; color: white; font-weight: 600; padding-bottom: 0.5rem; border-bottom: 1px solid rgba(255,255,255,0.05); }
                .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem; }

                .f-group { margin-bottom: 1.5rem; }
                .f-group label { display: block; margin-bottom: 0.5rem; color: #94a3b8; font-size: 0.9rem; }
                .f-group input, .f-group textarea { width: 100%; padding: 0.8rem; background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: white; transition: 0.2s; }
                .f-group input:focus, .f-group textarea:focus { border-color: #6366f1; outline: none; box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2); }
                
                .form-actions { margin-top: 2rem; display: flex; justify-content: flex-end; }
                .btn-save { display: flex; align-items: center; gap: 0.8rem; padding: 0.8rem 2rem; background: #6366f1; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; transition: 0.2s; }
                .btn-save:hover { background: #4f46e5; }
            `}</style>
        </div>
    );
};

export default UpdateStore;
