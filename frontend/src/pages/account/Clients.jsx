import React, { useState, useEffect, useMemo, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Search, Phone, MapPin, Filter,
  TrendingUp, Users, Award, Edit, Trash2, ArrowRight
} from 'lucide-react';
import gsap from 'gsap';
import SEO from '../../components/common/SEO';

const Clients = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [loading, setLoading] = useState(true);
  const containerRef = useRef(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    if (!loading && containerRef.current) {
      gsap.fromTo(
        gsap.utils.toArray('.client-anim-el', containerRef.current),
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.05, duration: 0.6, ease: "power2.out" }
      );
    }
  }, [loading, filterType, searchTerm]);

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
    return { total, vip };
  }, [customers]);

  const filteredCustomers = customers.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.phone && c.phone.includes(searchTerm)) ||
      (c.shop_name && c.shop_name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchFilter = filterType === 'All' || c.customer_type === filterType;
    return matchSearch && matchFilter;
  });

  return (
    <div className="animate-fade-in" ref={containerRef}>
      <SEO title="Clients Directory" description="Manage your customer profiles and view their details." />
      <header className="page-header client-anim-el">
        <div>
          <h1 className="page-title">Client Directory</h1>
          <p className="page-subtitle">Manage customer profiles, access billing history, and oversee accounts.</p>
        </div>
        <button className="erp-button erp-button-primary shadow-lg" onClick={() => navigate('/clients/add')}>
          <Plus size={18} />
          <span>Add New Client</span>
        </button>
      </header>

      {/* Stats Summary */}
      <div className="erp-grid erp-grid-cards mb-8">
        <div className="erp-card flex items-center justify-between client-anim-el">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl">
              <Users size={28} />
            </div>
            <div>
              <h4 className="text-secondary text-sm font-semibold">Total Clients</h4>
              <h2 className="text-white text-3xl font-bold">{stats.total}</h2>
            </div>
          </div>
          <div className="text-success text-sm font-medium flex items-center gap-1 bg-success-bg px-2 py-1 rounded-md border border-[rgba(16,185,129,0.2)]">
            <TrendingUp size={14} /> +12%
          </div>
        </div>

        <div className="erp-card flex items-center justify-between client-anim-el">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl">
              <Award size={28} />
            </div>
            <div>
              <h4 className="text-secondary text-sm font-semibold">VIP Accounts</h4>
              <h2 className="text-white text-3xl font-bold">{stats.vip}</h2>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 w-24">
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div className="bg-purple-500 h-full rounded-full" style={{ width: `${stats.total ? (stats.vip / stats.total) * 100 : 0}%` }}></div>
            </div>
            <span className="text-xs text-slate-400">{stats.total ? ((stats.vip / stats.total) * 100).toFixed(0) : 0}% of total</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="erp-card mb-6 py-3 px-4 flex flex-col sm:flex-row gap-4 justify-between items-center rounded-xl bg-surface-hover border-[rgba(255,255,255,0.05)] client-anim-el">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            className="erp-input pl-10"
            placeholder="Search by name, phone or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter size={18} className="text-slate-400 hidden sm:block" />
          <select
            className="erp-input w-full sm:w-48 appearance-none cursor-pointer"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="All">All Client Types</option>
            <option value="Regular">Regular</option>
            <option value="VIP">VIP</option>
            <option value="Wholesale">Wholesale</option>
          </select>
        </div>
      </div>

      {/* Clients Grid List */}
      <div className="erp-grid erp-grid-cards">
        {loading ? (
          [1, 2, 3, 4, 5, 6].map(i => <div key={i} className="skeleton h-56 w-full rounded-2xl"></div>)
        ) : filteredCustomers.length > 0 ? (
          filteredCustomers.map((client) => (
            <div
              key={client.id}
              className="erp-card flex flex-col group hover:border-primary/30 transition-all duration-300 cursor-pointer client-anim-el"
              onClick={() => navigate('/clients/view', { state: { client } })}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex gap-3 items-center">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-[0_4px_10px_rgba(79,70,229,0.3)]">
                    {client.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <span className="text-xs font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">#{String(client.id).padStart(4, '0')}</span>
                    <h3 className="font-bold text-white text-lg mt-0.5 leading-tight">{client.name}</h3>
                  </div>
                </div>

                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => { e.stopPropagation(); navigate('/clients/update', { state: { client } }); }}
                    className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-md transition-colors"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); navigate('/clients/delete', { state: { client } }); }}
                    className="p-1.5 text-danger opacity-70 hover:opacity-100 hover:bg-red-500/10 rounded-md transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <p className="text-sm text-slate-400 mb-4 line-clamp-1">{client.company || client.shop_name || 'Individual'}</p>

              <div className="flex flex-wrap gap-2 mb-4">
                <span className={`erp-badge ${client.customer_type === 'VIP' ? 'badge-info bg-purple-500/10 text-purple-400 border-purple-500/20' : client.customer_type === 'Wholesale' ? 'badge-warning' : 'badge-neutral'}`}>
                  {client.customer_type}
                </span>
                {client.gstin && <span className="erp-badge badge-success">GST Reg</span>}
              </div>

              <div className="mt-auto pt-4 border-t border-[rgba(255,255,255,0.05)] flex flex-col gap-2">
                <div className="flex items-center gap-2 text-sm text-slate-300">
                  <Phone size={14} className="text-slate-500" /> {client.phone}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-slate-300">
                    <MapPin size={14} className="text-slate-500" /> <span className="truncate max-w-[120px]">{client.city || "Not specified"}</span>
                  </div>

                  <span className="text-primary text-sm font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Profile <ArrowRight size={14} />
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-12 text-center bg-slate-800/20 rounded-2xl border border-dashed border-slate-700">
            <h3 className="text-xl font-medium text-white mb-2">No clients found</h3>
            <p className="text-slate-400 mb-4">Try adjusting your filters or search term parameters.</p>
            <button className="erp-button erp-button-secondary" onClick={() => { setSearchTerm(''); setFilterType('All'); }}>
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Clients;
