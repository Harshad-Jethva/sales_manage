import React, { useState, useEffect, useMemo, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
    Plus, Search, Phone, Mail, MapPin, Filter,
    Building2, UserCircle, Briefcase,
    Edit, Trash2, AlertCircle, ShoppingBag, Eye
} from 'lucide-react';
import gsap from 'gsap';
import SEO from '../../components/common/SEO';

const Stores = () => {
    const navigate = useNavigate();
    const [suppliers, setSuppliers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const containerRef = useRef(null);

    useEffect(() => {
        fetchSuppliers();
    }, []);

    useEffect(() => {
        if (!loading && containerRef.current) {
            gsap.fromTo(
                gsap.utils.toArray('.store-anim-el', containerRef.current),
                { y: 20, opacity: 0 },
                { y: 0, opacity: 1, stagger: 0.05, duration: 0.5, ease: "power2.out" }
            );
        }
    }, [loading, searchTerm]);

    const fetchSuppliers = async () => {
        try {
            const res = await axios.get('http://localhost/sales_manage/backend/api/stores.php');
            const list = res.data.data || (Array.isArray(res.data) ? res.data : []);
            setSuppliers(list);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation(); // Prevent card click
        if (window.confirm("Are you sure you want to remove this supplier?")) {
            try {
                const res = await axios.delete(`http://localhost/sales_manage/backend/api/stores.php?id=${id}`);
                if (res.data.success) {
                    setSuppliers(suppliers.filter(s => s.id !== id));
                    alert("Supplier removed.");
                } else {
                    alert("Failed to delete.");
                }
            } catch (err) { console.error(err); }
        }
    };

    const filteredSuppliers = suppliers.filter(s =>
        s.supplier_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.contact_person && s.contact_person.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (s.phone && s.phone.includes(searchTerm))
    );

    const stats = useMemo(() => {
        return {
            total: suppliers.length,
            active: suppliers.length // Mock logic
        };
    }, [suppliers]);

    return (
        <div className="animate-fade-in" ref={containerRef}>
            <SEO title="Stores & Vendors" description="Manage your suppliers and procurement." />
            <header className="page-header flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 store-anim-el">
                <div>
                    <h1 className="page-title">Supply Chain Masters</h1>
                    <p className="page-subtitle">Manage your vendors and procurement channels.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-surface-hover border border-[rgba(255,255,255,0.05)] rounded-xl text-white font-semibold">
                        <ShoppingBag size={18} className="text-emerald-400" />
                        <span>{stats.total} Active Suppliers</span>
                    </div>
                    <button
                        className="erp-button erp-button-primary shadow-lg"
                        onClick={() => navigate('/stores/add')}
                    >
                        <Plus size={18} /> <span>Register Supplier</span>
                    </button>
                </div>
            </header>

            {/* Controls */}
            <div className="erp-card mb-6 py-3 px-4 flex flex-col sm:flex-row gap-4 justify-between items-center bg-surface-hover border-[rgba(255,255,255,0.05)] rounded-xl store-anim-el">
                <div className="relative w-full sm:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        placeholder="Search suppliers by name, person, or phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="erp-input pl-10 w-full"
                    />
                </div>
                <div className="flex">
                    <button className="erp-button erp-button-secondary bg-indigo-500/10 text-indigo-400 border-indigo-500/20">
                        <Filter size={16} /> All Vendors
                    </button>
                </div>
            </div>

            <div className="erp-grid erp-grid-cards">
                {loading ? (
                    Array(4).fill(0).map((_, i) => (
                        <div key={i} className="erp-card p-6 min-h-[220px] flex flex-col gap-4">
                            <div className="flex justify-between items-start">
                                <div className="skeleton w-14 h-14 rounded-xl"></div>
                            </div>
                            <div className="skeleton h-6 w-3/4 mb-2 rounded"></div>
                            <div className="skeleton h-4 w-1/2 mb-1 rounded"></div>
                            <div className="skeleton h-4 w-2/3 rounded"></div>
                            <div className="mt-auto skeleton h-8 w-24 rounded"></div>
                        </div>
                    ))
                ) : filteredSuppliers.length > 0 ? (
                    filteredSuppliers.map((sup, index) => (
                        <div
                            key={sup.id}
                            className="erp-card relative p-6 cursor-pointer hover:-translate-y-1 hover:border-indigo-500/50 transition-all duration-300 flex flex-col h-full group store-anim-el"
                            onClick={() => navigate(`/stores/view?id=${sup.id}`)}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                                    <Building2 size={28} />
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                    <button
                                        className="p-2 text-slate-400 hover:text-white hover:bg-blue-500 rounded-lg transition-colors"
                                        onClick={(e) => { e.stopPropagation(); navigate(`/stores/view?id=${sup.id}`); }}
                                        title="View"
                                    >
                                        <Eye size={16} />
                                    </button>
                                    <button
                                        className="p-2 text-slate-400 hover:text-white hover:bg-indigo-500 rounded-lg transition-colors"
                                        onClick={(e) => { e.stopPropagation(); navigate('/stores/update', { state: { supplier: sup } }); }}
                                        title="Edit"
                                    >
                                        <Edit size={16} />
                                    </button>
                                    <button
                                        className="p-2 text-slate-400 hover:text-white hover:bg-red-500 rounded-lg transition-colors"
                                        onClick={(e) => handleDelete(e, sup.id)}
                                        title="Delete"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 space-y-3">
                                <h3 className="text-xl font-bold text-white leading-tight">{sup.supplier_name}</h3>

                                <div className="space-y-2 mt-4 text-sm text-slate-300">
                                    <div className="flex items-center gap-3 text-indigo-300 font-medium">
                                        <UserCircle size={16} className="shrink-0" />
                                        <span className="truncate">{sup.contact_person || 'No Contact Person'}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Phone size={16} className="shrink-0 text-slate-400" />
                                        <span className="truncate">{sup.phone || '--'}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Mail size={16} className="shrink-0 text-slate-400" />
                                        <span className="truncate">{sup.email || '--'}</span>
                                    </div>
                                    <div className="flex items-start gap-3 text-slate-400">
                                        <MapPin size={16} className="shrink-0 mt-0.5" />
                                        <span className="line-clamp-2 leading-snug">{sup.address || 'Address not provided'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 pt-4 border-t border-[rgba(255,255,255,0.05)] flex justify-between items-center">
                                <span className="erp-badge badge-success flex items-center gap-1.5">
                                    <Briefcase size={12} /> Supplier
                                </span>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-16 text-center">
                        <div className="text-slate-500 mb-4 inline-flex items-center justify-center p-4 rounded-full bg-surface-hover">
                            <AlertCircle size={48} />
                        </div>
                        <h3 className="text-xl text-white font-semibold mb-2">No Suppliers Found</h3>
                        <p className="text-slate-400">We couldn't find any suppliers matching your search criteria.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Stores;
