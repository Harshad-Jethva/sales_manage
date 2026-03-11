import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
    Users, UserPlus, Search, Filter, Edit, Trash2, Key,
    CheckCircle, XCircle, MoreVertical, Shield, Mail, Phone,
    ChevronDown, ArrowLeft, Save, X, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import SEO from '../../components/common/SEO';
import gsap from 'gsap';

const EmployeeManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('All');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        password: '',
        role: 'cashier',
        mobile_number: '',
        email: '',
        account_status: 'active'
    });

    const containerRef = useRef(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        if (!loading && containerRef.current) {
            gsap.fromTo(
                ".user-card-anim",
                { y: 20, opacity: 0 },
                { y: 0, opacity: 1, stagger: 0.05, duration: 0.5, ease: "power2.out" }
            );
        }
    }, [loading, filterRole, searchTerm]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await axios.get('http://localhost/sales_manage/backend/api/users.php');
            if (res.data.success) {
                // Filter out non-employee roles if necessary, but request says manage employees
                // Let's keep all for now or filter specifically for employee roles
                setUsers(res.data.data);
            } else {
                toast.error('Failed to fetch employee accounts');
            }
        } catch (err) {
            console.error(err);
            toast.error('Network error while fetching accounts');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (user = null) => {
        if (user) {
            setEditingUser(user);
            setFormData({
                id: user.id,
                name: user.name,
                username: user.username,
                password: '',
                role: user.role,
                mobile_number: user.mobile_number || '',
                email: user.email || '',
                account_status: user.account_status || 'active'
            });
        } else {
            setEditingUser(null);
            setFormData({
                name: '',
                username: '',
                password: '',
                role: 'cashier',
                mobile_number: '',
                email: '',
                account_status: 'active'
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingUser(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const loadingToast = toast.loading(editingUser ? 'Updating account...' : 'Creating account...');

        try {
            let res;
            if (editingUser) {
                res = await axios.put('http://localhost/sales_manage/backend/api/users.php', formData);
            } else {
                res = await axios.post('http://localhost/sales_manage/backend/api/users.php', formData);
            }

            if (res.data.success) {
                toast.success(res.data.message, { id: loadingToast });
                handleCloseModal();
                fetchUsers();
            } else {
                toast.error(res.data.message, { id: loadingToast });
            }
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Action failed', { id: loadingToast });
        }
    };

    const handleDeleteUser = async (id) => {
        if (!window.confirm('Are you sure you want to delete this employee account?')) return;

        const loadingToast = toast.loading('Deleting account...');
        try {
            const res = await axios.delete(`http://localhost/sales_manage/backend/api/users.php?id=${id}`);
            if (res.data.success) {
                toast.success('Account deleted successfully', { id: loadingToast });
                fetchUsers();
            } else {
                toast.error(res.data.message, { id: loadingToast });
            }
        } catch (err) {
            console.error(err);
            toast.error('Failed to delete account', { id: loadingToast });
        }
    };

    const toggleStatus = async (user) => {
        const newStatus = user.account_status === 'active' ? 'inactive' : 'active';
        const loadingToast = toast.loading(`Updating status to ${newStatus}...`);

        try {
            const res = await axios.put('http://localhost/sales_manage/backend/api/users.php', {
                id: user.id,
                account_status: newStatus
            });
            if (res.data.success) {
                toast.success(`Account ${newStatus}d`, { id: loadingToast });
                fetchUsers();
            } else {
                toast.error(res.data.message, { id: loadingToast });
            }
        } catch (err) {
            console.error(err);
            toast.error('Failed to update status', { id: loadingToast });
        }
    };

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(8);

    const employeeRoles = ['admin', 'accountant', 'cashier', 'salesman', 'warehouse', 'manager'];

    const filteredUsers = users.filter(u => {
        const term = searchTerm.toLowerCase();
        const matchesSearch =
            u.name.toLowerCase().includes(term) ||
            u.username.toLowerCase().includes(term) ||
            (u.mobile_number && u.mobile_number.includes(term)) ||
            (u.email && u.email.toLowerCase().includes(term));

        const matchesRole = filterRole === 'All' ? employeeRoles.includes(u.role) : u.role === filterRole;

        return matchesSearch && matchesRole;
    });

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

    const roles = [
        { value: 'admin', label: 'Super Admin' },
        { value: 'accountant', label: 'Accountant' },
        { value: 'cashier', label: 'Cashier' },
        { value: 'salesman', label: 'Salesman' },
        { value: 'warehouse', label: 'Warehouse Manager' },
        { value: 'manager', label: 'Manager' }
    ];

    const getRoleLabel = (roleValue) => {
        const role = roles.find(r => r.value === roleValue);
        return role ? role.label : roleValue;
    };

    const getRoleColor = (role) => {
        switch (role) {
            case 'admin': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
            case 'accountant': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
            case 'cashier': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            case 'salesman': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
            case 'warehouse': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            case 'manager': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
            default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
        }
    };

    return (
        <div className="employee-mgmt-container" ref={containerRef}>
            <SEO title="Employee Account Management | Admin" description="Manage employee login credentials and panel access." />

            <div className="page-header mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <div className="p-2 bg-indigo-500/20 rounded-xl text-indigo-500">
                            <Shield size={32} />
                        </div>
                        Employee Account Management
                    </h1>
                    <p className="text-slate-400 mt-2">Create and manage internal staff access accounts.</p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchUsers}
                        className="p-2.5 rounded-xl bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700 transition-all border border-slate-700/50"
                    >
                        <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                    </button>
                    <button
                        onClick={() => handleOpenModal()}
                        className="erp-button erp-button-primary"
                    >
                        <UserPlus size={18} />
                        <span>Add New Employee</span>
                    </button>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by name, username, role..."
                        className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-indigo-500/50 transition-all backdrop-blur-sm"
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    />
                </div>

                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <select
                            className="bg-slate-900/50 border border-slate-700/50 rounded-xl py-3 pl-10 pr-10 text-white appearance-none focus:outline-none focus:border-indigo-500/50 transition-all backdrop-blur-sm min-w-[180px]"
                            value={filterRole}
                            onChange={(e) => { setFilterRole(e.target.value); setCurrentPage(1); }}
                        >
                            <option value="All">All Roles</option>
                            {roles.map(r => (
                                <option key={r.value} value={r.value}>{r.label}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={16} />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {loading ? (
                    Array(8).fill(0).map((_, i) => (
                        <div key={i} className="bg-slate-800/20 border border-slate-700/50 rounded-2xl h-48 animate-pulse"></div>
                    ))
                ) : currentItems.length > 0 ? (
                    currentItems.map((user) => (
                        <motion.div
                            key={user.id}
                            layout
                            className="user-card-anim group bg-slate-900/40 border border-slate-700/50 rounded-2xl p-5 hover:border-indigo-500/30 transition-all duration-300 relative overflow-hidden flex flex-col backdrop-blur-sm shadow-xl"
                        >
                            <div className="absolute top-4 right-4 z-10">
                                <button
                                    onClick={(e) => { e.stopPropagation(); toggleStatus(user); }}
                                    className={`px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider border transition-all ${user.account_status === 'active'
                                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                        : 'bg-red-500/10 text-red-400 border-red-500/20'
                                        }`}
                                >
                                    {user.account_status}
                                </button>
                            </div>

                            <div className="flex gap-4 items-center mb-4">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-black text-lg shadow-lg group-hover:scale-110 transition-transform duration-300">
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-white font-bold text-base truncate pr-12">{user.name}</h3>
                                    <div className="text-slate-500 text-xs font-mono truncate">@{user.username}</div>
                                </div>
                            </div>

                            <div className="space-y-2 mb-4">
                                <span className={`inline-block px-2.5 py-0.5 rounded-lg text-[10px] font-bold border uppercase tracking-wider ${getRoleColor(user.role)}`}>
                                    {getRoleLabel(user.role)}
                                </span>
                                {user.email && (
                                    <div className="flex items-center gap-2 text-xs text-slate-400 truncate">
                                        <Mail size={12} className="text-slate-500" /> {user.email}
                                    </div>
                                )}
                                <div className="flex items-center gap-2 text-xs text-slate-400">
                                    <Phone size={12} className="text-slate-500" /> {user.mobile_number || 'N/A'}
                                </div>
                            </div>

                            <div className="flex items-center gap-2 mt-auto pt-4 border-t border-slate-700/30">
                                <button
                                    onClick={() => handleOpenModal(user)}
                                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-slate-800/50 text-slate-300 rounded-lg hover:bg-indigo-500/20 hover:text-indigo-400 transition-all"
                                >
                                    <Edit size={14} /> <span className="text-xs">Edit</span>
                                </button>
                                <button
                                    onClick={() => handleDeleteUser(user.id)}
                                    className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </motion.div>
                    ))
                ) : (
                    <div className="col-span-full py-20 flex flex-col items-center justify-center bg-slate-900/20 rounded-3xl border border-dashed border-slate-800">
                        <Users size={48} className="text-slate-600 mb-4" />
                        <h3 className="text-xl font-medium text-slate-300">No employees found</h3>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center mt-8 gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                        <button
                            key={number}
                            onClick={() => setCurrentPage(number)}
                            className={`w-9 h-9 rounded-lg font-bold transition-all ${currentPage === number
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                                : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700 border border-slate-700/50'
                                }`}
                        >
                            {number}
                        </button>
                    ))}
                </div>
            )}

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60" onClick={handleCloseModal} />
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-slate-900 border border-slate-700/50 w-full max-w-lg rounded-3xl shadow-2xl z-20 overflow-hidden">
                            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                                <h2 className="text-xl font-bold text-white">{editingUser ? 'Edit Employee' : 'Add New Employee'}</h2>
                                <button onClick={handleCloseModal} className="text-slate-400 hover:text-white"><X size={20} /></button>
                            </div>
                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-slate-400">Full Name</label>
                                        <input type="text" name="name" required className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white" value={formData.name} onChange={handleInputChange} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-slate-400">Username</label>
                                        <input type="text" name="username" required disabled={!!editingUser} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white disabled:opacity-50" value={formData.username} onChange={handleInputChange} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-slate-400">{editingUser ? 'New Password' : 'Password'}</label>
                                        <input type="password" name="password" required={!editingUser} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white" value={formData.password} onChange={handleInputChange} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-slate-400">Role</label>
                                        <select name="role" required className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white" value={formData.role} onChange={handleInputChange}>
                                            {roles.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-slate-400">Mobile</label>
                                        <input type="tel" name="mobile_number" className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white" value={formData.mobile_number} onChange={handleInputChange} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-slate-400">Email</label>
                                        <input type="email" name="email" className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white" value={formData.email} onChange={handleInputChange} />
                                    </div>
                                </div>
                                <div className="space-y-2 pt-2">
                                    <label className="text-xs font-semibold text-slate-400">Status</label>
                                    <div className="flex gap-4">
                                        <button type="button" onClick={() => setFormData({ ...formData, account_status: 'active' })} className={`flex-1 p-2 rounded-xl border text-sm font-bold ${formData.account_status === 'active' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>Active</button>
                                        <button type="button" onClick={() => setFormData({ ...formData, account_status: 'inactive' })} className={`flex-1 p-2 rounded-xl border text-sm font-bold ${formData.account_status === 'inactive' ? 'bg-red-500/20 border-red-500 text-red-500' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>Inactive</button>
                                    </div>
                                </div>
                                <div className="pt-4 flex gap-3">
                                    <button type="button" onClick={handleCloseModal} className="flex-1 py-3 bg-slate-800 text-white rounded-xl font-bold">Cancel</button>
                                    <button type="submit" className="flex-[2] py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-600/20">
                                        {editingUser ? 'Save Changes' : 'Create Account'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <style>{`
                .erp-button {
                    display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.25rem;
                    border-radius: 0.75rem; font-weight: 600; transition: all 0.2s ease;
                }
                .erp-button-primary { background: var(--enterprise-gradient); color: white; }
                .erp-button-primary:hover { transform: translateY(-2px); filter: brightness(1.1); }
            `}</style>
        </div>
    );
};

export default EmployeeManagement;
