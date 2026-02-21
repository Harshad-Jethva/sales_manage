import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ArrowLeft, Phone, Mail, MapPin, Globe, Building2,
    FileText, CreditCard, Edit, Trash2, Printer, Share2,
    Calendar, TrendingUp, DollarSign, Award
} from 'lucide-react';

const ClientProfile = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [client, setClient] = useState(null);

    useEffect(() => {
        if (location.state && location.state.client) {
            setClient(location.state.client);
        } else {
            navigate('/clients');
        }
    }, [location.state, navigate]);

    if (!client) return null;

    const getInitials = (name) => name ? name.substring(0, 2).toUpperCase() : '??';

    // Helper to format date
    const formattedDate = new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="profile-page"
        >
            {/* ================= PRINT REPORT LAYOUT ================= */}
            <div className="print-report-container">
                <div className="doc-header">
                    <h1 className="doc-title">CLIENT PROFILE RECORD</h1>
                    <div className="doc-meta">
                        <span><strong>Generated:</strong> {formattedDate}</span>
                        <span><strong>Client ID:</strong> #{client.id?.toString().padStart(4, '0')}</span>
                    </div>
                </div>

                <div className="doc-section">
                    <h2 className="doc-section-title">1. CLIENT IDENTITY</h2>
                    <div className="doc-row">
                        <div className="doc-col">
                            <div className="doc-field"><span className="doc-label">Full Name:</span> {client.name}</div>
                            <div className="doc-field"><span className="doc-label">Status:</span> {client.customer_type || 'Active'}</div>
                        </div>
                        <div className="doc-col">
                            <div className="doc-field"><span className="doc-label">Credit Limit:</span> ₹{client.credit_limit || '0.00'}</div>
                            <div className="doc-field"><span className="doc-label">Location:</span> {client.city}, {client.state}</div>
                        </div>
                    </div>
                </div>

                <div className="doc-divider"></div>

                <div className="doc-section">
                    <h2 className="doc-section-title">2. CONTACT & BUSINESS</h2>
                    <div className="doc-row">
                        <div className="doc-col">
                            <div className="doc-field"><span className="doc-label">Company:</span> {client.company || '-'}</div>
                            <div className="doc-field"><span className="doc-label">Shop Name:</span> {client.shop_name || '-'}</div>
                            <div className="doc-field"><span className="doc-label">Contact Person:</span> {client.contact_person || '-'}</div>
                        </div>
                        <div className="doc-col">
                            <div className="doc-field"><span className="doc-label">Mobile:</span> {client.phone}</div>
                            <div className="doc-field"><span className="doc-label">Email:</span> {client.email || '-'}</div>
                            <div className="doc-field"><span className="doc-label">Website:</span> {client.website || '-'}</div>
                        </div>
                    </div>
                </div>

                <div className="doc-divider"></div>

                <div className="doc-section">
                    <h2 className="doc-section-title">3. BILLING & TAXATION</h2>
                    <div className="doc-row">
                        <div className="doc-col">
                            <div className="doc-field"><span className="doc-label">GSTIN:</span> {client.gstin || 'N/A'}</div>
                            <div className="doc-field"><span className="doc-label">PAN:</span> {client.pan || 'N/A'}</div>
                        </div>
                        <div className="doc-col">
                            <div className="doc-field"><span className="doc-label">Billing Address:</span></div>
                            <div className="doc-text">{client.billing_address || client.address || '-'}</div>
                            <div className="doc-text">{client.city} {client.state} {client.pincode}</div>
                        </div>
                    </div>
                </div>

                <div className="doc-divider"></div>

                <div className="doc-section">
                    <h2 className="doc-section-title">4. BANKING DETAILS</h2>
                    <div className="doc-row">
                        <div className="doc-col">
                            <div className="doc-field"><span className="doc-label">Bank Name:</span> {client.bank_name || '-'}</div>
                            <div className="doc-field"><span className="doc-label">Account Name:</span> {client.name.toUpperCase()}</div>
                        </div>
                        <div className="doc-col">
                            <div className="doc-field"><span className="doc-label">Account Number:</span> {client.account_number || '-'}</div>
                            <div className="doc-field"><span className="doc-label">IFSC Code:</span> {client.ifsc_code || '-'}</div>
                        </div>
                    </div>
                </div>

                <div className="doc-section" style={{ marginTop: '2rem' }}>
                    <h2 className="doc-section-title">INTERNAL NOTES</h2>
                    <div className="doc-note-box">
                        {client.notes || 'No internal notes recorded.'}
                    </div>
                </div>

                <div className="doc-footer">
                    <p>This document is a confidential business record.</p>
                </div>
            </div>
            {/* ================= END PRINT LAYOUT ================= */}


            {/* HERO BANNER (Screen Only) */}
            <div className="profile-hero">
                <div className="hero-overlay"></div>
                <div className="hero-content">
                    <button className="btn-back" onClick={() => navigate('/clients')}>
                        <ArrowLeft size={18} /> Back
                    </button>
                    <div className="hero-actions">
                        <button className="hero-btn icon-only" title="Share"><Share2 size={18} /></button>
                        <button className="hero-btn" onClick={() => window.print()}><Printer size={18} /> Print Report</button>
                        <button className="hero-btn danger" onClick={() => navigate('/clients/delete', { state: { client } })}>
                            <Trash2 size={18} /> Delete
                        </button>
                        <button className="hero-btn primary" onClick={() => navigate('/clients/update', { state: { client } })}>
                            <Edit size={18} /> Edit Profile
                        </button>
                    </div>
                </div>
            </div>

            {/* MAIN CONTENT CONTAINER (Screen Only) */}
            <div className="profile-container">

                {/* HEADLINE SECTION */}
                <div className="profile-header-card">
                    <div className="ph-left">
                        <div className="avatar-group">
                            <div className="avatar-large">
                                {getInitials(client.name)}
                            </div>
                            <div className="id-badge-circle" title="Client ID">
                                #{client.id.toString().padStart(4, '0')}
                            </div>
                        </div>
                        <div className="ph-text">
                            <div className="name-row">
                                <h1>{client.name}</h1>
                                <span className={`badge ${client.customer_type?.toLowerCase()}`}>{client.customer_type}</span>
                            </div>
                            <p className="subtitle">{client.shop_name || client.company || 'Individual Client'} • {client.city || 'Location N/A'}</p>
                            <div className="ph-meta">
                                <span><Calendar size={14} /> ID: #{client.id.toString().padStart(4, '0')}</span>
                            </div>
                        </div>
                    </div>
                    <div className="ph-right">
                        <div className="quick-stat">
                            <label>Credit Limit</label>
                            <h4>₹{client.credit_limit || '0'}</h4>
                        </div>
                        <div className="quick-stat">
                            <label>Status</label>
                            <h4 className="text-green">Active</h4>
                        </div>
                    </div>
                </div>

                {/* TWO COLUMN GRID */}
                <div className="profile-grid">

                    {/* LEFT COLUMN */}
                    <div className="left-col">
                        <div className="section-card contact-card">
                            <h3><Phone size={18} /> Contact Information</h3>
                            <div className="info-list">
                                <div className="info-item">
                                    <div className="icon-sq"><Phone size={18} /></div>
                                    <div>
                                        <label>Mobile Number</label>
                                        <p>{client.phone}</p>
                                    </div>
                                </div>
                                <div className="info-item">
                                    <div className="icon-sq"><Mail size={18} /></div>
                                    <div>
                                        <label>Email Address</label>
                                        <p>{client.email || 'No email provided'}</p>
                                    </div>
                                </div>
                                <div className="info-item">
                                    <div className="icon-sq"><Globe size={18} /></div>
                                    <div>
                                        <label>Website</label>
                                        <p>{client.website || 'No website link'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="section-card address-card">
                            <h3><MapPin size={18} /> Address Details</h3>

                            <div className="addr-block">
                                <h5>Billing Address</h5>
                                <p>{client.billing_address || client.address}</p>
                                <p>{client.city} {client.state} {client.pincode}</p>
                            </div>

                            <div className="addr-divider"></div>

                            <div className="addr-block">
                                <h5>Shipping Address</h5>
                                <p>{client.shipping_address || client.billing_address || "Same as Billing"}</p>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN */}
                    <div className="right-col">
                        <div className="section-card business-card">
                            <h3><Building2 size={18} /> Business Profile</h3>
                            <div className="biz-grid">
                                <div className="biz-item">
                                    <label>Company Name</label>
                                    <p>{client.company || 'N/A'}</p>
                                </div>
                                <div className="biz-item">
                                    <label>Shop Name</label>
                                    <p>{client.shop_name || 'N/A'}</p>
                                </div>
                                <div className="biz-item">
                                    <label>Contact Person</label>
                                    <p>{client.contact_person || 'Self'}</p>
                                </div>
                                <div className="biz-item">
                                    <label>Business Type</label>
                                    <p>Retail / Wholesale</p>
                                </div>
                            </div>

                            <div className="tax-box">
                                <div className="tax-row">
                                    <span>GSTIN</span>
                                    <strong>{client.gstin || 'UNREGISTERED'}</strong>
                                </div>
                                <div className="tax-row">
                                    <span>PAN Number</span>
                                    <strong>{client.pan || 'N/A'}</strong>
                                </div>
                            </div>
                        </div>

                        {client.bank_name && (
                            <div className="section-card bank-card-visual">
                                <div className="card-chip"></div>
                                <div className="bank-name">{client.bank_name}</div>
                                <div className="account-num">
                                    **** **** **** {client.account_number ? client.account_number.slice(-4) : '0000'}
                                </div>
                                <div className="card-details">
                                    <div className="cd-block">
                                        <label>IFSC Code</label>
                                        <span>{client.ifsc_code}</span>
                                    </div>
                                    <div className="cd-block">
                                        <label>Account Holder</label>
                                        <span>{client.name.toUpperCase()}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="section-card notes-card">
                            <h3><FileText size={18} /> Internal Notes</h3>
                            <p className="note-text">{client.notes || 'No notes added for this client.'}</p>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .profile-page {
                    min-height: 100vh;
                    background: #0f172a;
                    color: white;
                    padding-bottom: 4rem;
                }
                
                    position: absolute; inset: 0;
                    background-image: radial-gradient(circle at 20% 50%, rgba(99, 102, 241, 0.15) 0%, transparent 50%),
                                      radial-gradient(circle at 80% 80%, rgba(236, 72, 153, 0.1) 0%, transparent 50%);
                }
                .hero-content {
                    max-width: 1200px; margin: 0 auto;
                    height: 100%; display: flex; justify-content: space-between; align-items: flex-start;
                    padding: 2rem; position: relative; z-index: 2;
                }
                .btn-back { display: flex; align-items: center; gap: 0.5rem; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); color: #cbd5e1; padding: 0.6rem 1rem; border-radius: 8px; cursor: pointer; transition: 0.2s; }
                .btn-back:hover { background: rgba(255,255,255,0.1); color: white; }
                .hero-actions { display: flex; gap: 0.8rem; }
                .hero-btn { 
                    display: flex; align-items: center; gap: 0.5rem; 
                    background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); 
                    color: white; padding: 0.6rem 1rem; border-radius: 8px; cursor: pointer; transition: 0.2s; 
                    font-size: 0.9rem; font-weight: 500;
                }
                .hero-btn:hover { background: rgba(255,255,255,0.15); border-color: rgba(255,255,255,0.3); }
                
                .hero-btn.primary { background: #3b82f6; border-color: #3b82f6; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4); }
                .hero-btn.primary:hover { background: #2563eb; transform: translateY(-1px); }

                .hero-btn.danger { background: rgba(239, 68, 68, 0.2); color: #f87171; border-color: rgba(239, 68, 68, 0.3); }
                .hero-btn.danger:hover { background: rgba(239, 68, 68, 0.3); color: white; border-color: #ef4444; }

                .hero-btn.icon-only { padding: 0.6rem; aspect-ratio: 1; justify-content: center; }
                .profile-container { max-width: 1100px; margin: -60px auto 0; padding: 0 1rem; position: relative; z-index: 3; }
                .profile-header-card { background: rgba(30, 41, 59, 0.9); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 2rem; display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; box-shadow: 0 10px 30px rgba(0,0,0,0.3); }
                .ph-left { display: flex; gap: 1.5rem; align-items: center; }
                .avatar-group { display: flex; align-items: center; gap: 1rem; }
                .avatar-large {
                    width: 70px; height: 70px; border-radius: 20px;
                    background: linear-gradient(135deg, #6366f1, #a855f7);
                    display: flex; align-items: center; justify-content: center;
                    font-size: 2.2rem; font-weight: 700; color: white;
                    box-shadow: 0 8px 16px rgba(99, 102, 241, 0.3);
                }
                .id-badge-circle {
                    width: 50px; height: 50px; border-radius: 12px;
                    background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
                    display: flex; align-items: center; justify-content: center;
                    font-family: monospace; font-size: 1.1rem; font-weight: 700; color: #cbd5e1;
                    letter-spacing: 1px;
                }
                .name-row { display: flex; align-items: center; gap: 1rem; margin-bottom: 0.2rem; }
                .name-row h1 { margin: 0; font-size: 1.8rem; }
                .badge { padding: 0.3rem 0.6rem; border-radius: 6px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; background: #334155; color: #94a3b8; }
                .ph-right { display: flex; gap: 2rem; text-align: right; border-left: 1px solid rgba(255,255,255,0.1); padding-left: 2rem; }
                .quick-stat h4 { margin: 0; font-size: 1.4rem; color: white; }
                .text-green { color: #4ade80 !important; }
                
                .profile-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
                .section-card { background: rgba(30, 41, 59, 0.4); border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 1.5rem; margin-bottom: 1.5rem; }
                .section-card h3 { margin: 0 0 1.5rem 0; font-size: 1.1rem; color: #f1f5f9; display: flex; align-items: center; gap: 0.6rem; }
                .info-item { display: flex; align-items: center; gap: 1rem; margin-bottom: 1.2rem; }
                .biz-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.2rem; margin-bottom: 1.5rem; }
                .biz-item label, .info-item label, .addr-block h5 { display: block; font-size: 0.8rem; color: #64748b; margin-bottom: 0.1rem; }
                .biz-item p, .info-item p, .addr-block p { margin: 0; font-size: 0.95rem; color: #e2e8f0; font-weight: 500; }
                .tax-box { background: rgba(0,0,0,0.2); padding: 1rem; border-radius: 8px; border-left: 3px solid #6366f1; }
                .tax-row { display: flex; justify-content: space-between; margin-bottom: 0.4rem; font-size: 0.9rem; }
                .tax-row span { color: #94a3b8; }
                .bank-card-visual { background: linear-gradient(135deg, #1e293b, #0f172a); border: 1px solid rgba(255,255,255,0.1); position: relative; overflow: hidden; }
                .card-chip { width: 40px; height: 28px; background: linear-gradient(135deg, #fceabb, #f8b500); border-radius: 4px; margin-bottom: 1.5rem; opacity: 0.8; }
                .bank-name { font-size: 1.1rem; font-weight: 700; letter-spacing: 1px; margin-bottom: 0.5rem; color: white; }
                .account-num { font-family: 'Courier New', monospace; font-size: 1.4rem; color: #cbd5e1; letter-spacing: 2px; margin-bottom: 1.5rem; }
                .card-details { display: flex; justify-content: space-between; }
                .note-text { font-style: italic; color: #94a3b8; line-height: 1.5; font-size: 0.9rem; }
                
                @media (max-width: 900px) {
                    .profile-grid { grid-template-columns: 1fr; }
                    .ph-right { display: none; }
                }

                .print-report-container { display: none; }

                @media print {
                    @page { margin: 10mm; size: A4; }
                    
                    html, body {
                        height: 100%;
                        margin: 0 !important;
                        padding: 0 !important;
                        overflow: hidden;
                        background: #fff !important;
                    }

                    /* Important: Reset parent containers so they don't restrict or add space */
                    #root, .app-container, .main-content, .profile-page {
                        display: block !important;
                        position: static !important;
                        width: 100% !important;
                        height: auto !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        background: #fff !important;
                        color: #000 !important;
                        overflow: visible !important;
                        border: none !important;
                        box-shadow: none !important;
                    }

                    /* COLLAPSE all screen-only content so it takes 0 space */
                    .profile-hero, 
                    .profile-container, 
                    .sidebar, 
                    header, 
                    nav, 
                    .btn-back, 
                    .hero-actions,
                    .hidden-print { 
                        display: none !important; 
                        height: 0 !important;
                        width: 0 !important;
                    }

                    /* Show the Print Container */
                    .print-report-container {
                        display: block !important;
                        width: 100%;
                        height: auto;
                        position: relative;
                        top: 0;
                        left: 0;
                        background-color: white !important;
                        font-family: 'Times New Roman', Times, serif; 
                        color: #000;
                    }
                    
                    /* Document Layout */
                    .doc-header { text-align: center; margin-bottom: 2rem; border-bottom: 2px solid #000; padding-bottom: 1rem; }
                    .doc-title { font-size: 24pt; font-weight: bold; margin: 0 0 0.5rem 0; text-transform: uppercase; letter-spacing: 1px; color: #000; }
                    .doc-meta { font-size: 10pt; color: #000; display: flex; justify-content: space-between; max-width: 600px; margin: 0 auto; }
                    
                    .doc-section { margin-bottom: 1.5rem; page-break-inside: avoid; }
                    .doc-section-title { font-size: 11pt; font-weight: bold; text-transform: uppercase; border-bottom: 1px solid #000; margin-bottom: 0.8rem; padding-bottom: 0.2rem; color: #000; }
                    
                    .doc-row { display: flex; justify-content: space-between; }
                    .doc-col { width: 48%; }
                    
                    .doc-field { margin-bottom: 0.4rem; font-size: 10pt; line-height: 1.4; color: #000; }
                    .doc-label { font-weight: bold; width: 120px; display: inline-block; color: #000; }
                    .doc-text { margin-bottom: 0.4rem; font-size: 10pt; color: #000; }
                    
                    .doc-divider { height: 1px; background: #000; margin: 1.5rem 0; opacity: 0.3; }
                    
                    .doc-note-box { border: 1px solid #000; padding: 1rem; min-height: 100px; font-size: 10pt; color: #000; }
                    
                    /* Footer at bottom of page 1 */
                    .doc-footer { 
                        position: fixed; 
                        bottom: 0; 
                        left: 0; 
                        width: 100%; 
                        text-align: center; 
                        font-size: 9pt; 
                        border-top: 1px solid #000; 
                        padding-top: 0.5rem; 
                        background: #fff;
                        color: #000;
                    }
                }
            `}</style>
        </motion.div>
    );
};

export default ClientProfile;
