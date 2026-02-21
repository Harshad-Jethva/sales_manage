import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Building2,
    User,
    MapPin,
    FileText,
    Phone,
    Mail,
    CreditCard,
    Briefcase,
    Upload,
    Save,
    ArrowLeft,
    ArrowRight
} from 'lucide-react';

const AddClient = () => {
    const navigate = useNavigate();
    const [activeFormTab, setActiveFormTab] = useState('personal'); // personal, work, billing, bank

    const [formData, setFormData] = useState({
        name: '', phone: '', email: '', customer_type: 'Regular',
        shop_name: '', company: '', website: '', contact_person: '',
        address: '', billing_address: '', shipping_address: '',
        city: '', state: '', pincode: '',
        gstin: '', pan: '', notes: '', credit_limit: '',
        bank_name: '', account_number: '', ifsc_code: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                // Fallbacks for addresses if empty
                billing_address: formData.billing_address || formData.address,
                shipping_address: formData.shipping_address || formData.address
            };

            const res = await axios.post('http://localhost/sales_manage/backend/api/clients.php', payload);

            if (res.data.success) {
                alert("Client Profile Created Successfully!");
                navigate('/clients'); // Redirect to list
            } else {
                alert("Error: " + res.data.error);
            }
        } catch (err) {
            console.error(err);
            alert("Submission Failed");
        }
    };

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="page-container">
            <header className="page-header">
                <div>
                    <button className="btn-back" onClick={() => navigate('/clients')}>
                        <ArrowLeft size={18} /> Back to Clients
                    </button>
                    <h1>Add New Client</h1>
                    <p className="text-muted">Create a comprehensive profile for a new customer or business partner.</p>
                </div>
            </header>

            <div className="content-card">
                <div className="tabs-header">
                    {['personal', 'work', 'billing', 'bank'].map(tab => (
                        <button
                            key={tab}
                            className={`tab-btn ${activeFormTab === tab ? 'active' : ''}`}
                            onClick={() => setActiveFormTab(tab)}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)} Information
                        </button>
                    ))}
                </div>

                <form onSubmit={handleSubmit} className="client-form">

                    {/* PHASE 1: PERSONAL */}
                    {activeFormTab === 'personal' && (
                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="form-section">
                            <div className="section-title"><User size={20} /> Personal Details</div>

                            <div className="grid-2">
                                <div className="f-group">
                                    <label>Full Name *</label>
                                    <input required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Rahul Sharma" />
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
                                    <label>Primary Phone *</label>
                                    <div className="input-icon">
                                        <Phone size={16} />
                                        <input required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="+91 98765 43210" />
                                    </div>
                                </div>
                                <div className="f-group">
                                    <label>Email Address</label>
                                    <div className="input-icon">
                                        <Mail size={16} />
                                        <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="client@example.com" />
                                    </div>
                                </div>
                            </div>

                            <div className="f-group">
                                <label>Primary Address</label>
                                <textarea rows="3" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} placeholder="Full street address..." />
                            </div>

                            <div className="grid-3">
                                <div className="f-group"><label>City</label><input value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} /></div>
                                <div className="f-group"><label>State</label><input value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value })} /></div>
                                <div className="f-group"><label>Pincode</label><input value={formData.pincode} onChange={(e) => setFormData({ ...formData, pincode: e.target.value })} /></div>
                            </div>

                            <div className="f-group">
                                <label>Internal Notes</label>
                                <textarea rows="2" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder="Specific requirements or remarks about the client..." />
                            </div>

                            <div className="form-actions right">
                                <button type="button" className="btn-next" onClick={() => {
                                    if (formData.name && formData.phone) setActiveFormTab('work');
                                    else alert('Please fill required fields (Name & Phone)');
                                }}>
                                    Next Phase <ArrowRight size={18} />
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* PHASE 2: WORK */}
                    {activeFormTab === 'work' && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="form-section">
                            <div className="section-title"><Briefcase size={20} /> Business Details</div>

                            <div className="f-group">
                                <label>Shop / Store Name</label>
                                <input value={formData.shop_name} onChange={(e) => setFormData({ ...formData, shop_name: e.target.value })} placeholder="e.g. Laxmi General Store" />
                            </div>

                            <div className="grid-2">
                                <div className="f-group">
                                    <label>Legal Company Name</label>
                                    <input value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} placeholder="e.g. Laxmi Enterprises Pvt Ltd" />
                                </div>
                                <div className="f-group">
                                    <label>Website URL</label>
                                    <input value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })} placeholder="https://..." />
                                </div>
                            </div>

                            <div className="f-group">
                                <label>Contact Person (if distinct)</label>
                                <input value={formData.contact_person} onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })} placeholder="Manager Name" />
                            </div>

                            <div className="form-actions spread">
                                <button type="button" className="btn-back-step" onClick={() => setActiveFormTab('personal')}>Back</button>
                                <button type="button" className="btn-next" onClick={() => setActiveFormTab('billing')}>Next Phase <ArrowRight size={18} /></button>
                            </div>
                        </motion.div>
                    )}

                    {/* PHASE 3: BILLING */}
                    {activeFormTab === 'billing' && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="form-section">
                            <div className="section-title"><FileText size={20} /> Tax & Billing</div>

                            <div className="grid-2">
                                <div className="f-group">
                                    <label>GSTIN Number</label>
                                    <input value={formData.gstin} onChange={(e) => setFormData({ ...formData, gstin: e.target.value })} style={{ textTransform: 'uppercase' }} placeholder="22AAAAA0000A1Z5" />
                                </div>
                                <div className="f-group">
                                    <label>PAN Number</label>
                                    <input value={formData.pan} onChange={(e) => setFormData({ ...formData, pan: e.target.value })} style={{ textTransform: 'uppercase' }} placeholder="ABCDE1234F" />
                                </div>
                            </div>

                            <div className="f-group">
                                <label>Credit Limit (₹)</label>
                                <div className="input-icon">
                                    <span style={{ fontSize: '1.2rem', paddingRight: '5px' }}>₹</span>
                                    <input type="number" value={formData.credit_limit} onChange={(e) => setFormData({ ...formData, credit_limit: e.target.value })} placeholder="0.00" />
                                </div>
                            </div>

                            <div className="grid-2">
                                <div className="f-group">
                                    <label>Billing Address</label>
                                    <textarea rows="3" value={formData.billing_address} onChange={(e) => setFormData({ ...formData, billing_address: e.target.value })} placeholder="Same as personal if empty" />
                                </div>
                                <div className="f-group">
                                    <label>Shipping Address</label>
                                    <textarea rows="3" value={formData.shipping_address} onChange={(e) => setFormData({ ...formData, shipping_address: e.target.value })} placeholder="Same as billing if empty" />
                                </div>
                            </div>

                            <div className="form-actions spread">
                                <button type="button" className="btn-back-step" onClick={() => setActiveFormTab('work')}>Back</button>
                                <button type="button" className="btn-next" onClick={() => setActiveFormTab('bank')}>Next Phase <ArrowRight size={18} /></button>
                            </div>
                        </motion.div>
                    )}

                    {/* PHASE 4: BANK */}
                    {activeFormTab === 'bank' && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="form-section">
                            <div className="section-title"><Building2 size={20} /> Bank Account Details</div>

                            <div className="f-group">
                                <label>Bank Name</label>
                                <input value={formData.bank_name} onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })} placeholder="e.g. HDFC Bank" />
                            </div>

                            <div className="grid-2">
                                <div className="f-group">
                                    <label>Account Number</label>
                                    <input value={formData.account_number} onChange={(e) => setFormData({ ...formData, account_number: e.target.value })} placeholder="0000000000" />
                                </div>
                                <div className="f-group">
                                    <label>IFSC Code</label>
                                    <input value={formData.ifsc_code} onChange={(e) => setFormData({ ...formData, ifsc_code: e.target.value })} style={{ textTransform: 'uppercase' }} placeholder="HDFC0001234" />
                                </div>
                            </div>

                            <div className="form-actions spread">
                                <button type="button" className="btn-back-step" onClick={() => setActiveFormTab('billing')}>Back</button>
                                <button type="submit" className="btn-primary-large">
                                    <Save size={20} /> Save Client Profile
                                </button>
                            </div>
                        </motion.div>
                    )}
                </form>
            </div>

            <style jsx>{`
        .page-container { max-width: 1000px; margin: 0 auto; padding-bottom: 3rem; }
        .page-header { margin-bottom: 2rem; }
        .page-header h1 { font-size: 2rem; margin-bottom: 0.5rem; background: linear-gradient(to right, #fff, #a5b4fc); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .btn-back { display: flex; align-items: center; gap: 0.5rem; background: none; border: none; color: var(--text-muted); cursor: pointer; margin-bottom: 1rem; font-size: 0.9rem; transition: 0.2s; }
        .btn-back:hover { color: white; transform: translateX(-4px); }
        
        .content-card { background: rgba(30, 41, 59, 0.7); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.05); border-radius: 16px; overflow: hidden; }
        
        .tabs-header { display: flex; background: rgba(0,0,0,0.2); border-bottom: 1px solid rgba(255,255,255,0.05); padding: 0 1rem; overflow-x: auto; }
        .tab-btn { padding: 1.25rem 1.5rem; background: none; border: none; border-bottom: 2px solid transparent; color: var(--text-muted); cursor: pointer; font-weight: 600; transition: 0.2s; white-space: nowrap; }
        .tab-btn:hover { color: white; background: rgba(255,255,255,0.02); }
        .tab-btn.active { color: #818cf8; border-bottom-color: #818cf8; background: rgba(99, 102, 241, 0.05); }

        .client-form { padding: 2rem; }
        .section-title { display: flex; align-items: center; gap: 0.8rem; font-size: 1.2rem; font-weight: 700; color: white; margin-bottom: 1.5rem; padding-bottom: 0.8rem; border-bottom: 1px solid rgba(255,255,255,0.05); }
        
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem; }
        .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem; }
        .f-group { margin-bottom: 1.5rem; }
        .f-group label { display: block; margin-bottom: 0.5rem; font-size: 0.85rem; color: var(--text-muted-light); font-weight: 500; }
        
        .f-group input, .f-group select, .f-group textarea { 
          width: 100%; padding: 0.9rem 1rem; 
          background: rgba(15, 23, 42, 0.6); 
          border: 1px solid rgba(255,255,255,0.1); 
          border-radius: 8px; 
          color: white; 
          font-size: 0.95rem; 
          transition: 0.2s; 
        }
        .f-group input:focus, .f-group select:focus, .f-group textarea:focus { 
          border-color: #818cf8; 
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15); 
          outline: none; 
        }
        
        .input-icon { position: relative; display: flex; align-items: center; }
        .input-icon svg, .input-icon span { position: absolute; left: 1rem; color: var(--text-muted); pointer-events: none; }
        .input-icon input { padding-left: 2.8rem; }
        
        .form-actions { margin-top: 2rem; display: flex; }
        .form-actions.right { justify-content: flex-end; }
        .form-actions.spread { justify-content: space-between; }

        .btn-next {
          display: flex; align-items: center; gap: 0.8rem;
          padding: 0.8rem 1.5rem;
          background: #3b82f6;
          color: white; border: none; border-radius: 10px;
          font-weight: 600; cursor: pointer; transition: 0.2s;
        }
        .btn-next:hover { background: #2563eb; transform: translateX(2px); }

        .btn-back-step {
          padding: 0.8rem 1.5rem;
          background: transparent;
          border: 1px solid rgba(255,255,255,0.2);
          color: var(--text-muted);
          border-radius: 10px; font-weight: 600; cursor: pointer; transition: 0.2s;
        }
        .btn-back-step:hover { border-color: white; color: white; }

        .btn-primary-large { 
          display: flex; align-items: center; gap: 0.8rem; 
          padding: 1rem 2rem; 
          background: linear-gradient(135deg, #6366f1, #4f46e5); 
          color: white; 
          border: none; 
          border-radius: 10px; 
          font-weight: 700; 
          font-size: 1rem; 
          cursor: pointer; 
          transition: 0.2s; 
          box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
        }
        .btn-primary-large:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(79, 70, 229, 0.4); }

        @media (max-width: 768px) {
          .grid-2, .grid-3 { grid-template-columns: 1fr; }
        }
      `}</style>
        </motion.div>
    );
};

export default AddClient;
