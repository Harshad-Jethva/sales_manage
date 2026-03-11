import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Building2, UserCircle, Phone, Mail, Hash, MapPin, ArrowLeft, Loader2, Edit, Trash2, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

const StoreDetails = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const id = searchParams.get('id');
    const [loading, setLoading] = useState(true);
    const [supplier, setSupplier] = useState(null);

    useEffect(() => {
        if (id) {
            fetchStoreDetails();
        } else {
            navigate('/stores');
        }
    }, [id]);

    const fetchStoreDetails = async () => {
        try {
            const res = await axios.get('http://localhost/sales_manage/backend/api/stores.php');
            const data = res.data;
            const sup = data.find(s => s.id == id);
            if (sup) {
                setSupplier(sup);
            } else {
                alert("Supplier not found.");
                navigate('/stores');
            }
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (window.confirm("Are you sure you want to permanently delete this supplier?")) {
            try {
                const res = await axios.delete(`http://localhost/sales_manage/backend/api/stores.php?id=${id}`);
                if (res.data.success) {
                    alert('Supplier deleted.');
                    navigate('/stores');
                } else {
                    alert('Failed to delete.');
                }
            } catch (err) { console.error(err); }
        }
    };

    if (loading) return <div className="loader"><Loader2 className="spin" /> Loading Profile...</div>;

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="profile-container">
            <header className="profile-header">
                <button className="back-btn" onClick={() => navigate('/stores')}>
                    <ArrowLeft size={20} /> Back to Stores
                </button>
                <div className="header-content">
                    <div className="profile-badge">
                        <Building2 size={40} />
                    </div>
                    <div className="header-text">
                        <h1>{supplier.supplier_name}</h1>
                        <p className="status-active">Active Vendor</p>
                    </div>
                    <div className="header-actions">
                        <button className="btn-icon edit" onClick={() => navigate(`/stores/update?id=${id}`)}>
                            <Edit size={20} /> Edit
                        </button>
                        <button className="btn-icon delete" onClick={handleDelete}>
                            <Trash2 size={20} /> Delete
                        </button>
                    </div>
                </div>
            </header>

            <div className="details-grid">
                <div className="detail-card glass-card">
                    <h3>Contact Information</h3>
                    <div className="info-list">
                        <div className="info-item">
                            <UserCircle size={20} />
                            <div>
                                <label>Contact Person</label>
                                <p>{supplier.contact_person || 'N/A'}</p>
                            </div>
                        </div>
                        <div className="info-item">
                            <Phone size={20} />
                            <div>
                                <label>Phone Number</label>
                                <p>{supplier.phone || 'N/A'}</p>
                            </div>
                        </div>
                        <div className="info-item">
                            <Mail size={20} />
                            <div>
                                <label>Email Address</label>
                                <p>{supplier.email || 'N/A'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="detail-card glass-card">
                    <h3>Business Details</h3>
                    <div className="info-list">
                        <div className="info-item">
                            <Hash size={20} />
                            <div>
                                <label>GST Number</label>
                                <p>{supplier.gst_number || 'N/A'}</p>
                            </div>
                        </div>
                        <div className="info-item">
                            <MapPin size={20} />
                            <div>
                                <label>Registered Address</label>
                                <p>{supplier.address || 'N/A'}</p>
                            </div>
                        </div>
                        <div className="info-item">
                            <Calendar size={20} />
                            <div>
                                <label>Registered Since</label>
                                <p>{new Date(supplier.created_at || Date.now()).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .profile-container { max-width: 1000px; margin: 0 auto; color: white; padding-bottom: 5rem; }
                .loader { display: flex; align-items: center; justify-content: center; height: 50vh; color: #94a3b8; gap: 1rem; }
                .spin { animation: spin 1s linear infinite; }
                
                .profile-header { margin-bottom: 3rem; }
                .back-btn { background: none; border: none; color: #94a3b8; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1.5rem; }
                .back-btn:hover { color: white; }
                
                .header-content { display: flex; align-items: center; gap: 2rem; background: rgba(255,255,255,0.03); padding: 2rem; border-radius: 24px; border: 1px solid rgba(255,255,255,0.05); }
                .profile-badge { width: 80px; height: 80px; background: linear-gradient(135deg, #6366f1, #4f46e5); border-radius: 20px; display: flex; align-items: center; justify-content: center; color: white; box-shadow: 0 10px 25px rgba(99, 102, 241, 0.4); }
                .header-text { flex: 1; }
                .header-text h1 { margin: 0 0 0.5rem 0; font-size: 2.2rem; }
                .status-active { color: #34d399; font-weight: 600; font-size: 0.9rem; background: rgba(16, 185, 129, 0.1); display: inline-block; padding: 0.3rem 0.8rem; border-radius: 50px; }
                
                .header-actions { display: flex; gap: 1rem; }
                .btn-icon { display: flex; align-items: center; gap: 0.5rem; padding: 0.8rem 1.2rem; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); cursor: pointer; font-weight: 600; transition: 0.2s; }
                .btn-icon.edit { background: rgba(255,255,255,0.05); color: white; }
                .btn-icon.edit:hover { background: rgba(99, 102, 241, 0.2); color: #818cf8; border-color: #6366f1; }
                .btn-icon.delete { background: rgba(239, 68, 68, 0.1); color: #f87171; border-color: rgba(239, 68, 68, 0.2); }
                .btn-icon.delete:hover { background: rgba(239, 68, 68, 0.2); }

                .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }
                .glass-card { background: rgba(30, 41, 59, 0.7); backdrop-filter: blur(16px); border: 1px solid rgba(255,255,255,0.08); border-radius: 24px; padding: 2rem; }
                .detail-card h3 { margin-top: 0; margin-bottom: 1.5rem; color: #cbd5e1; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 1rem; }
                
                .info-list { display: flex; flex-direction: column; gap: 1.5rem; }
                .info-item { display: flex; align-items: flex-start; gap: 1rem; }
                .info-item svg { color: #818cf8; margin-top: 0.2rem; }
                .info-item label { display: block; font-size: 0.85rem; color: #94a3b8; margin-bottom: 0.2rem; }
                .info-item p { margin: 0; font-size: 1.1rem; font-weight: 500; }
            `}</style>
        </motion.div>
    );
};

export default StoreDetails;
