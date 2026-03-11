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

const ClientAccountManagement = () => {
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
        role: 'client_panel',
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
                setUsers(res.data.data);
            } else {
                toast.error('Failed to fetch user accounts');
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
                password: '', // Don't show password
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
                role: 'client_panel',
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
        if (!window.confirm('Are you sure you want to delete this account? This action cannot be undone.')) return;

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
    const [itemsPerPage] = useState(6);

    const filteredUsers = users.filter(u => {
        const term = searchTerm.toLowerCase();
        const matchesSearch =
            u.name.toLowerCase().includes(term) ||
            u.username.toLowerCase().includes(term) ||
            (u.mobile_number && u.mobile_number.includes(term)) ||
            (u.email && u.email.toLowerCase().includes(term));

        const matchesRole = filterRole === 'All' || u.role === filterRole;

        return matchesSearch && matchesRole;
    });

    // Pagination Logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const roles = [
        { value: 'admin', label: 'Super Admin' },
        { value: 'accountant', label: 'Accountant' },
        { value: 'cashier', label: 'Cashier' },
        { value: 'salesman', label: 'Salesman' },
        { value: 'warehouse', label: 'Warehouse Manager' },
        { value: 'client_panel', label: 'Client Panel User' },
        { value: 'vendor_user', label: 'Vendor User' },
        { value: 'salesman_user', label: 'Salesman User (Client Side)' },
        { value: 'custom_role', label: 'Custom Role' }
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
            default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
        }
    };

    return (
        <div className="account-mgmt-container" ref={containerRef}>
            <SEO title="Client Account Management | Admin" description="Manage client panel login credentials and roles." />

            <div className="page-header mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <div className="p-2 bg-indigo-500/20 rounded-xl text-indigo-500">
                            <Shield size={32} />
                        </div>
                        Client Account Management
                    </h1>
                    <p className="text-slate-400 mt-2">Create and manage role-based access for all panels.</p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchUsers}
                        className="p-2.5 rounded-xl bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700 transition-all border border-slate-700/50"
                        title="Refresh List"
                    >
                        <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                    </button>
                    <button
                        onClick={() => handleOpenModal()}
                        className="erp-button erp-button-primary shadow-lg shadow-indigo-500/20"
                    >
                        <UserPlus size={18} />
                        <span>Create New Account</span>
                    </button>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by name, username, email or mobile..."
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    Array(6).fill(0).map((_, i) => (
                        <div key={i} className="bg-slate-800/20 border border-slate-700/50 rounded-2xl h-48 animate-pulse"></div>
                    ))
                ) : currentItems.length > 0 ? (
                    currentItems.map((user) => (
                        <motion.div
                            key={user.id}
                            layout
                            className="user-card-anim group bg-slate-900/40 border border-slate-700/50 rounded-2xl p-5 hover:border-indigo-500/30 transition-all duration-300 relative overflow-hidden flex flex-col backdrop-blur-sm shadow-xl"
                        >
                            {/* Status Badge */}
                            <div className="absolute top-4 right-4 z-10">
                                <button
                                    onClick={(e) => { e.stopPropagation(); toggleStatus(user); }}
                                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider border transition-all ${user.account_status === 'active'
                                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                                        : 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20'
                                        }`}
                                >
                                    <div className={`w-1.5 h-1.5 rounded-full ${user.account_status === 'active' ? 'bg-emerald-400' : 'bg-red-400'}`}></div>
                                    {user.account_status}
                                </button>
                            </div>

                            <div className="flex gap-4 items-start mb-4">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform duration-300">
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0 pt-1">
                                    <h3 className="text-white font-bold text-lg truncate pr-16">{user.name}</h3>
                                    <div className="text-slate-500 text-sm font-mono truncate">@{user.username}</div>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2 mb-4">
                                <span className={`px-2.5 py-0.5 rounded-lg text-xs font-semibold border ${getRoleColor(user.role)}`}>
                                    {getRoleLabel(user.role)}
                                </span>
                                {user.email && (
                                    <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs bg-slate-800/50 text-slate-400 border border-slate-700/50">
                                        <Mail size={12} /> {user.email}
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center gap-3 text-slate-400 text-sm mt-auto pt-4 border-t border-slate-700/30">
                                <div className="flex items-center gap-1.5">
                                    <Phone size={14} className="text-slate-500" />
                                    {user.mobile_number || 'No Phone'}
                                </div>
                                <div className="ml-auto flex items-center gap-1">
                                    <button
                                        onClick={() => handleOpenModal(user)}
                                        className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-all"
                                        title="Edit User"
                                    >
                                        <Edit size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteUser(user.id)}
                                        className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                                        title="Delete User"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))
                ) : (
                    <div className="col-span-full py-20 flex flex-col items-center justify-center bg-slate-900/20 rounded-3xl border border-dashed border-slate-800">
                        <div className="p-4 bg-slate-800/50 rounded-full text-slate-600 mb-4">
                            <Users size={48} />
                        </div>
                        <h3 className="text-xl font-medium text-slate-300">No accounts found</h3>
                        <p className="text-slate-500 mt-2">Try adjusting your search or filters.</p>
                    </div>
                )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex justify-center mt-10 gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                        <button
                            key={number}
                            onClick={() => paginate(number)}
                            className={`w-10 h-10 rounded-xl font-bold transition-all ${currentPage === number
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                                : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700 hover:text-white border border-slate-700/50'
                                }`}
                        >
                            {number}
                        </button>
                    ))}
                </div>
            )}

            {/* Account Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-md"
                            onClick={handleCloseModal}
                        />

                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-slate-900 border border-slate-700/50 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden z-20"
                        >
                            <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-indigo-500/10 to-transparent">
                                <div>
                                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                        {editingUser ? <Edit size={20} className="text-indigo-400" /> : <UserPlus size={20} className="text-indigo-400" />}
                                        {editingUser ? 'Edit User Account' : 'Create New Account'}
                                    </h2>
                                    <p className="text-slate-400 text-sm mt-1">
                                        {editingUser ? `Update credentials for ${editingUser.name}` : 'Fill in the details to create a new access account'}
                                    </p>
                                </div>
                                <button
                                    onClick={handleCloseModal}
                                    className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-300">Full Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            required
                                            placeholder="e.g. John Doe"
                                            className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-indigo-500/50 transition-all"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-300">Username</label>
                                        <input
                                            type="text"
                                            name="username"
                                            required
                                            disabled={!!editingUser}
                                            placeholder="e.g. johndoe123"
                                            className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-indigo-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                            value={formData.username}
                                            onChange={handleInputChange}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-300">
                                            {editingUser ? 'New Password (Optional)' : 'Password'}
                                        </label>
                                        <div className="relative">
                                            <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                            <input
                                                type="password"
                                                name="password"
                                                required={!editingUser}
                                                placeholder={editingUser ? 'Leave blank to keep current' : '••••••••'}
                                                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-indigo-500/50 transition-all"
                                                value={formData.password}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-300">Role / Access Type</label>
                                        <div className="relative">
                                            <select
                                                name="role"
                                                required
                                                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl py-2.5 px-4 text-white appearance-none focus:outline-none focus:border-indigo-500/50 transition-all cursor-pointer"
                                                value={formData.role}
                                                onChange={handleInputChange}
                                            >
                                                {roles.map(r => (
                                                    <option key={r.value} value={r.value}>{r.label}</option>
                                                ))}
                                            </select>
                                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={16} />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-300">Mobile Number</label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                            <input
                                                type="tel"
                                                name="mobile_number"
                                                placeholder="e.g. +91 9876543210"
                                                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-indigo-500/50 transition-all"
                                                value={formData.mobile_number}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-300">Email Address (Optional)</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                            <input
                                                type="email"
                                                name="email"
                                                placeholder="e.g. john@example.com"
                                                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-indigo-500/50 transition-all"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-300">Account Status</label>
                                        <div className="flex gap-4">
                                            <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${formData.account_status === 'active' ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' : 'bg-slate-800/30 border-slate-700/50 text-slate-500'}`}>
                                                <input
                                                    type="radio"
                                                    name="account_status"
                                                    value="active"
                                                    className="hidden"
                                                    checked={formData.account_status === 'active'}
                                                    onChange={handleInputChange}
                                                />
                                                <CheckCircle size={16} />
                                                Active
                                            </label>
                                            <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${formData.account_status === 'inactive' ? 'bg-red-500/10 border-red-500/50 text-red-400' : 'bg-slate-800/30 border-slate-700/50 text-slate-500'}`}>
                                                <input
                                                    type="radio"
                                                    name="account_status"
                                                    value="inactive"
                                                    className="hidden"
                                                    checked={formData.account_status === 'inactive'}
                                                    onChange={handleInputChange}
                                                />
                                                <XCircle size={16} />
                                                Inactive
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={handleCloseModal}
                                        className="flex-1 py-3 bg-slate-800 text-white font-semibold rounded-xl hover:bg-slate-700 transition-all border border-slate-700/50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-[2] py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2"
                                    >
                                        <Save size={18} />
                                        {editingUser ? 'Save Changes' : 'Create Account'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <style>{`
        .account-mgmt-container {
          min-height: 100%;
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.05);
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(99, 102, 241, 0.2);
          border-radius: 10px;
        }

        .erp-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          border-radius: 0.75rem;
          font-weight: 600;
          transition: all 0.2s ease;
          border: 1px solid transparent;
        }

        .erp-button-primary {
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
          color: white;
        }

        .erp-button-primary:hover {
          transform: translateY(-2px);
          filter: brightness(1.1);
        }

        .erp-button-secondary {
          background: rgba(255, 255, 255, 0.05);
          color: white;
          border-color: rgba(255, 255, 255, 0.1);
        }

        .erp-button-secondary:hover {
          background: rgba(255, 255, 255, 0.1);
        }
      `}</style>
        </div>
    );
};

export default ClientAccountManagement;
