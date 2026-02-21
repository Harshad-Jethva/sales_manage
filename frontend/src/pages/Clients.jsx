import React, { useState, useEffect, useMemo, useRef } from 'react'; // Added useRef
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Search, Phone, Mail, MapPin, Filter,
  TrendingUp, Users, Award, MoreVertical,
  Edit, Trash2, Eye, X, Building2, Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap'; // Added GSAP

const Clients = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [loading, setLoading] = useState(true);
  const containerRef = useRef(null); // Ref for GSAP context

  // Mock data for graph - in a real app, calculate from created_at
  const chartData = [12, 19, 15, 22, 28, 32, 40];

  useEffect(() => {
    fetchCustomers();
  }, []);

  // GSAP Stagger Animation on List Update
  useEffect(() => {
    if (filteredCustomers.length > 0) {
      const ctx = gsap.context(() => {
        gsap.fromTo(".client-card",
          { y: 50, opacity: 0, scale: 0.9 },
          { y: 0, opacity: 1, scale: 1, duration: 0.5, stagger: 0.05, ease: "back.out(1.7)" }
        );
      }, containerRef);
      return () => ctx.revert();
    }
  }, [filterType, searchTerm, customers]); // Re-run when list changes

  // 3D Tilt Effect
  const handleMouseMove = (e, card) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -10; // Max 10 deg rotation
    const rotateY = ((x - centerX) / centerX) * 10;

    gsap.to(e.currentTarget, {
      rotateX: rotateX,
      rotateY: rotateY,
      scale: 1.05,
      boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
      duration: 0.3,
      ease: "power2.out"
    });
  };

  const handleMouseLeave = (e) => {
    gsap.to(e.currentTarget, {
      rotateX: 0,
      rotateY: 0,
      scale: 1,
      boxShadow: "none",
      duration: 0.5,
      ease: "elastic.out(1, 0.5)"
    });
  };

  const fetchCustomers = async () => {
    try {
      const res = await axios.get('http://localhost/sales_manage/backend/api/clients.php');
      setCustomers(Array.isArray(res.data) ? res.data : []);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    const total = customers.length;
    const vip = customers.filter(c => c.customer_type === 'VIP').length;
    const wholesale = customers.filter(c => c.customer_type === 'Wholesale').length;
    return { total, vip, wholesale };
  }, [customers]);

  const filteredCustomers = customers.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.phone && c.phone.includes(searchTerm)) ||
      (c.shop_name && c.shop_name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchFilter = filterType === 'All' || c.customer_type === filterType;
    return matchSearch && matchFilter;
  });

  // Simple SVG Line Chart Component
  const SimpleLineChart = ({ data, color }) => {
    const max = Math.max(...data);
    const points = data.map((val, i) => `${(i / (data.length - 1)) * 100},${100 - (val / max) * 100}`).join(' ');

    return (
      <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.2" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={`0,100 ${points} 100,100`} fill="url(#gradient)" />
        <polyline points={points} fill="none" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" />
        <circle cx="100" cy={100 - (data[data.length - 1] / max) * 100} r="3" fill={color} />
      </svg>
    );
  };

  return (
    <div className="clients-page" ref={containerRef}>
      {/* HEADER SECTION */}
      <header className="header-section">
        <div className="header-content">
          <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
            <h1>Client Management</h1>
            <p>Oversee your customer base, track growth, and manage relationships.</p>
          </motion.div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn-add"
            onClick={() => navigate('/clients/add')}
          >
            <Plus size={20} /> Add New Client
          </motion.button>
        </div>

        {/* ANALYTICS CARDS */}
        <div className="stats-grid">
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="stat-card">
            <div className="stat-info">
              <div className="icon-box blue"><Users size={20} /></div>
              <div>
                <h3>{stats.total}</h3>
                <p>Total Clients</p>
              </div>
            </div>
            <div className="chart-mini">
              <SimpleLineChart data={[10, 15, 13, 18, 20, stats.total]} color="#60a5fa" />
            </div>
          </motion.div>

          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="stat-card">
            <div className="stat-info">
              <div className="icon-box purple"><Award size={20} /></div>
              <div>
                <h3>{stats.vip}</h3>
                <p>VIP Accounts</p>
              </div>
            </div>
            <div className="stat-bar ml-auto">
              <div className="bar-bg"><div className="bar-fill" style={{ width: `${(stats.vip / stats.total) * 100}%`, background: '#a78bfa' }}></div></div>
              <span>{(stats.vip / stats.total * 100).toFixed(0)}%</span>
            </div>
          </motion.div>

          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="stat-card">
            <div className="stat-info">
              <div className="icon-box green"><TrendingUp size={20} /></div>
              <div>
                <h3>+12%</h3>
                <p>Growth Rate</p>
              </div>
            </div>
            <div className="chart-mini">
              <SimpleLineChart data={[5, 8, 12, 10, 15, 20]} color="#4ade80" />
            </div>
          </motion.div>
        </div>
      </header>

      {/* CONTROLS BAR */}
      <div className="controls-bar">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search clients, shops, phones..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-box">
          <Filter size={16} />
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="All">All Types</option>
            <option value="Regular">Regular</option>
            <option value="VIP">VIP</option>
            <option value="Wholesale">Wholesale</option>
          </select>
        </div>
      </div>

      {/* CLIENTS GRID */}
      <div className="clients-grid">
        <AnimatePresence>
          {filteredCustomers.length > 0 ? filteredCustomers.map((client, i) => (
            <motion.div
              key={client.id}
              layout
              // Removed initial/animate/exit here to let GSAP handle it for smoother stagger
              className="client-card"
              onClick={() => navigate('/clients/view', { state: { client } })}
              onMouseMove={(e) => handleMouseMove(e, client)}
              onMouseLeave={handleMouseLeave}
              style={{ transformStyle: 'preserve-3d', perspective: '1000px' }} // 3D Context
            >
              <div className="card-header">
                <div className="header-left-group">
                  <div className="avatar">{client.name.substring(0, 2).toUpperCase()}</div>
                  <div className="client-id-badge">#{client.id.toString().padStart(4, '0')}</div>
                </div>
                <div className="actions">
                  <button onClick={(e) => { e.stopPropagation(); navigate('/clients/update', { state: { client } }); }} title="Edit"><Edit size={16} /></button>
                  <button className="danger" onClick={(e) => { e.stopPropagation(); navigate('/clients/delete', { state: { client } }); }} title="Delete"><Trash2 size={16} /></button>
                </div>
              </div>

              <div className="card-body" style={{ transform: 'translateZ(20px)' }}> {/* Depth Layer */}
                <h3>{client.name}</h3>
                <span className="shop-name">{client.shop_name || client.company || "Individual"}</span>

                <div className="tags">
                  <span className={`tag ${client.customer_type.toLowerCase()}`}>{client.customer_type}</span>
                  {client.gstin && <span className="tag gst">GST Registered</span>}
                </div>

                <div className="contact-preview">
                  <div><Phone size={14} /> {client.phone}</div>
                  <div><MapPin size={14} /> {client.city || "N/A"}</div>
                </div>
              </div>

              <div className="card-footer">
                <button className="btn-view" onClick={(e) => { e.stopPropagation(); navigate('/clients/view', { state: { client } }); }}>
                  View Profile <ArrowRightIcon />
                </button>
              </div>
            </motion.div>
          )) : (
            !loading && (
              <div className="no-results">
                <p>No clients found matching your search.</p>
                <button onClick={() => { setSearchTerm(''); setFilterType('All'); }}>Clear Filters</button>
              </div>
            )
          )}
        </AnimatePresence>
      </div>

      <style jsx>{`
            .clients-page {
                padding: 1rem;
                max-width: 1600px;
                margin: 0 auto;
                color: #f1f5f9;
            }

            /* Header & Stats */
            .header-section { margin-bottom: 2.5rem; }
            .header-content { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2rem; }
            .header-content h1 { font-size: 2.2rem; font-weight: 700; background: linear-gradient(to right, #fff, #94a3b8); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin: 0; }
            .header-content p { color: #64748b; margin: 0.5rem 0 0; }
            
            .btn-add {
                display: flex; align-items: center; gap: 0.5rem;
                background: linear-gradient(135deg, #3b82f6, #2563eb);
                color: white; border: none; padding: 0.8rem 1.5rem;
                border-radius: 12px; font-weight: 600; cursor: pointer;
                box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3);
            }

            .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; }
            .stat-card {
                background: rgba(30, 41, 59, 0.6);
                backdrop-filter: blur(12px);
                border: 1px solid rgba(255,255,255,0.05);
                border-radius: 16px;
                padding: 1.5rem;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                height: 140px;
                position: relative;
                overflow: hidden;
            }
            .stat-info { display: flex; align-items: center; gap: 1rem; z-index: 1; }
            .icon-box { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
            .icon-box.blue { background: rgba(59, 130, 246, 0.15); color: #60a5fa; }
            .icon-box.purple { background: rgba(167, 139, 250, 0.15); color: #a78bfa; }
            .icon-box.green { background: rgba(74, 222, 128, 0.15); color: #4ade80; }
            .stat-info h3 { font-size: 1.8rem; margin: 0; font-weight: 700; color: white; }
            .stat-info p { margin: 0; font-size: 0.85rem; color: #94a3b8; }
            
            .chart-mini { position: absolute; bottom: 0; right: 0; width: 120px; height: 60px; opacity: 0.5; }
            .stat-bar { display: flex; flex-direction: column; align-items: flex-end; gap: 5px; }
            .bar-bg { width: 100px; height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; overflow: hidden; }
            .bar-fill { height: 100%; border-radius: 3px; }

            /* Controls */
            .controls-bar {
                display: flex; gap: 1rem; margin-bottom: 2rem;
                background: rgba(30, 41, 59, 0.4); border: 1px solid rgba(255,255,255,0.05);
                padding: 0.5rem; border-radius: 12px;
            }
            .search-box { flex: 1; position: relative; display: flex; align-items: center; }
            .search-box svg { position: absolute; left: 1rem; color: #64748b; }
            .search-box input {
                width: 100%; padding: 0.8rem 1rem 0.8rem 2.5rem;
                background: transparent; border: none; color: white;
                font-size: 0.95rem; outline: none;
            }
            .filter-box { display: flex; align-items: center; gap: 0.5rem; padding: 0 1rem; border-left: 1px solid rgba(255,255,255,0.1); color: #94a3b8; }
            .filter-box select { background: transparent; border: none; color: white; outline: none; cursor: pointer; font-size: 0.9rem; }
            .filter-box select option { background: #1e293b; }

            /* Grid */
            .clients-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem; padding-bottom: 3rem; }
            .client-card {
                background: rgba(30, 41, 59, 0.6);
                border: 1px solid rgba(255,255,255,0.05);
                border-radius: 16px;
                padding: 1.5rem;
                position: relative;
                transition: 0.2s;
                cursor: pointer;
                overflow: hidden;
            }
            .client-card:hover { transform: translateY(-5px); border-color: rgba(99, 102, 241, 0.3); background: rgba(30, 41, 59, 0.8); }

            .card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem; }
            .header-left-group { display: flex; align-items: center; gap: 0.8rem; }
            .avatar {
                width: 56px; height: 56px;
                background: linear-gradient(135deg, #4f46e5, #9333ea);
                border-radius: 14px;
                display: flex; align-items: center; justify-content: center;
                font-size: 1.5rem; font-weight: 700; color: white;
                box-shadow: 0 4px 10px rgba(0,0,0,0.2);
            }
            .client-id-badge {
                font-family: monospace; font-size: 0.9rem; font-weight: 700; color: #94a3b8;
                background: rgba(255,255,255,0.05); padding: 0.3rem 0.6rem; border-radius: 6px;
                border: 1px solid rgba(255,255,255,0.1); letter-spacing: 1px;
            }
            .card-header .actions { display: flex; gap: 0.5rem; opacity: 0; transition: 0.2s; }
            .client-card:hover .actions { opacity: 1; }
            .actions button {
                width: 32px; height: 32px; border-radius: 8px; border: none;
                display: flex; align-items: center; justify-content: center;
                cursor: pointer; background: rgba(255,255,255,0.1); color: white;
                transition: 0.2s;
            }
            .actions button:hover { background: #3b82f6; }
            .actions button.danger:hover { background: #ef4444; }

            .card-body h3 { margin: 0 0 0.2rem 0; font-size: 1.1rem; color: white; }
            .shop-name { display: block; font-size: 0.85rem; color: #94a3b8; margin-bottom: 1rem; }
            
            .tags { display: flex; gap: 0.5rem; margin-bottom: 1.25rem; flex-wrap: wrap; }
            .tag { font-size: 0.7rem; padding: 0.2rem 0.6rem; border-radius: 6px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
            .tag.regular { background: rgba(148, 163, 184, 0.1); color: #94a3b8; }
            .tag.vip { background: rgba(168, 85, 247, 0.15); color: #d8b4fe; border: 1px solid rgba(168, 85, 247, 0.2); }
            .tag.wholesale { background: rgba(59, 130, 246, 0.15); color: #93c5fd; }
            .tag.gst { background: rgba(16, 185, 129, 0.1); color: #6ee7b7; }

            .contact-preview { display: flex; flex-direction: column; gap: 0.5rem; font-size: 0.85rem; color: #cbd5e1; }
            .contact-preview div { display: flex; align-items: center; gap: 0.6rem; }
            .contact-preview svg { color: #64748b; }

            .card-footer { margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid rgba(255,255,255,0.05); }
            .btn-view {
                background: none; border: none; color: #6366f1; font-weight: 600; font-size: 0.85rem;
                cursor: pointer; display: flex; align-items: center; gap: 0.3rem; transition: 0.2s; padding: 0;
            }
            .btn-view:hover { color: #818cf8; gap: 0.5rem; }

            /* Modal */
            .modal-backdrop {
                position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
                background: rgba(0,0,0,0.6); backdrop-filter: blur(5px);
                z-index: 100; display: flex; justify-content: center; align-items: center;
            }
            .modal-content {
                background: #1e293b; width: 600px; max-width: 95vw;
                border-radius: 20px; overflow: hidden;
                border: 1px solid rgba(255,255,255,0.1);
                box-shadow: 0 20px 50px rgba(0,0,0,0.5);
            }
            .modal-top {
                padding: 2rem;
                background: linear-gradient(to bottom right, rgba(99, 102, 241, 0.1), rgba(30, 41, 59, 0));
                display: flex; align-items: center; gap: 1.5rem;
                border-bottom: 1px solid rgba(255,255,255,0.05);
            }
            .profile-large {
                width: 80px; height: 80px; border-radius: 20px;
                background: linear-gradient(135deg, #6366f1, #ec4899);
                display: flex; align-items: center; justify-content: center;
                font-size: 2.5rem; font-weight: 700; color: white;
                box-shadow: 0 10px 20px rgba(99, 102, 241, 0.3);
            }
            .profile-meta h2 { margin: 0 0 0.3rem 0; font-size: 1.5rem; color: white; }
            .profile-meta p { color: #94a3b8; margin: 0 0 1rem 0; }
            .meta-actions { display: flex; gap: 0.8rem; }
            .meta-actions button {
                padding: 0.5rem 1rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1);
                background: rgba(255,255,255,0.05); color: white; cursor: pointer;
                font-size: 0.85rem; display: flex; align-items: center; gap: 0.5rem; transition: 0.2s;
            }
            .meta-actions button:hover { background: rgba(255,255,255,0.1); border-color: white; }
            .meta-actions button.close { padding: 0.5rem; background: rgba(239, 68, 68, 0.1); border-color: rgba(239, 68, 68, 0.2); color: #f87171; }
            .meta-actions button.close:hover { background: #ef4444; color: white; }

            .modal-body-grid {
                padding: 2rem;
                display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;
            }
            .info-section h4 { color: #818cf8; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 1px; margin-bottom: 1rem; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem; }
            .info-row { display: flex; justify-content: space-between; margin-bottom: 0.8rem; font-size: 0.9rem; }
            .info-row label { color: #64748b; }
            .info-row span { color: #f1f5f9; font-weight: 500; text-align: right; }
            
            .full-width { grid-column: span 2; }
            .address-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
            .addr-box { background: rgba(0,0,0,0.2); padding: 1rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05); }
            .addr-box h5 { margin: 0 0 0.5rem 0; color: #94a3b8; font-size: 0.8rem; }
            .addr-box p { margin: 0; font-size: 0.9rem; color: #cbd5e1; line-height: 1.4; }

            /* Helper helper */
            .arrow-icon { width: 14px; height: 14px; }
        `}</style>
    </div>
  );
};

// Small Arrow helper component since I missed importing ArrowRight
const ArrowRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"></line>
    <polyline points="12 5 19 12 12 19"></polyline>
  </svg>
);

export default Clients;
