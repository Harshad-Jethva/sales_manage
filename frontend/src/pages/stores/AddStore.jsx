import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Building2, UserCircle, Phone, Mail, Hash, MapPin, Save, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const AddStore = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        supplier_name: '',
        contact_person: '',
        phone: '',
        email: '',
        address: '',
        gst_number: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost/sales_manage/backend/api/stores.php', formData);
            if (res.data.success) {
                alert('Supplier registered successfully!');
                navigate('/stores');
            } else {
                alert('Failed to register supplier: ' + res.data.error);
            }
        } catch (err) {
            console.error(err);
            alert('An error occurred while registering the supplier.');
        }
    };

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="page-container">
            <header className="page-header">
                <button className="back-btn" onClick={() => navigate('/stores')}>
                    <ArrowLeft size={20} /> Back to Stores
                </button>
                <h1>Register New Supplier</h1>
            </header>

            <div className="form-card glass-card">
                <form onSubmit={handleSubmit} className="premium-form">
                    <div className="form-group full">
                        <label>Company / Store Name</label>
                        <div className="input-wrapper">
                            <Building2 size={18} />
                            <input
                                required
                                placeholder="e.g. Acme Wholesale Corp"
                                value={formData.supplier_name}
                                onChange={(e) => setFormData({ ...formData, supplier_name: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="form-grid">
                        <div className="form-group">
                            <label>Contact Person</label>
                            <div className="input-wrapper">
                                <UserCircle size={18} />
                                <input
                                    placeholder="Manager Name"
                                    value={formData.contact_person}
                                    onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Contact Phone</label>
                            <div className="input-wrapper">
                                <Phone size={18} />
                                <input
                                    placeholder="+91 ..."
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="form-grid">
                        <div className="form-group">
                            <label>Email Address</label>
                            <div className="input-wrapper">
                                <Mail size={18} />
                                <input
                                    type="email"
                                    placeholder="vendor@example.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>GST Number</label>
                            <div className="input-wrapper">
                                <Hash size={18} />
                                <input
                                    placeholder="GSTIN..."
                                    value={formData.gst_number}
                                    onChange={(e) => setFormData({ ...formData, gst_number: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="form-group full">
                        <label>Full Address</label>
                        <div className="input-wrapper top-align">
                            <MapPin size={18} />
                            <textarea
                                rows="3"
                                placeholder="Warehouse address, City, ZIP..."
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            ></textarea>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="btn-primary-gradient">
                            <Save size={20} /> Register Supplier
                        </button>
                    </div>
                </form>
            </div>

            <style jsx>{`
                .page-container { max-width: 800px; margin: 0 auto; color: white; }
                .page-header { margin-bottom: 2rem; }
                .page-header h1 { font-size: 2rem; font-weight: 800; margin-top: 1rem; }
                
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
                .input-wrapper input, .input-wrapper textarea {
                    background: none; border: none; color: white; width: 100%; outline: none; font-size: 1rem;
                }
                .input-wrapper.top-align { align-items: flex-start; }

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
            `}</style>
        </motion.div>
    );
};

export default AddStore;
