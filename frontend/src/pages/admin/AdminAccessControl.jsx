import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Users, Shield, Receipt, Truck, Wallet, Briefcase, ChevronRight, LogIn } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useFloatingWindows } from '../../context/FloatingWindowContext';

const AdminAccessControl = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const { login } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await fetch('http://localhost/sales_manage/backend/api/users.php');
            const result = await response.json();
            if (result.success) {
                setUsers(result.data);
            } else {
                toast.error('Failed to fetch users');
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error('Network error while fetching users');
        } finally {
            setLoading(false);
        }
    };

    const { openWindow } = useFloatingWindows();

    const handleLoginAs = (user, panel) => {
        const adminToken = sessionStorage.getItem('token');
        if (!adminToken) {
            toast.error('Admin session not found');
            return;
        }

        const contextId = `panel_${user.id}_${panel.id}`;
        const loginUrl = `${window.location.origin}/admin/panel-login?user_id=${user.id}&role=${user.role}&admin_token=${adminToken}&context_id=${contextId}`;

        openWindow({
            id: contextId,
            title: `${panel.title} - ${user.name}`,
            url: loginUrl,
            icon: panel.icon,
            width: 1000,
            height: 700
        });

        toast.success(`Opening ${panel.title} for ${user.name}`);
    };

    const panels = [
        {
            id: 'account',
            title: 'Account Panel',
            icon: <Wallet size={24} className="text-indigo-400" />,
            roles: ['accountant'],
            bgClass: 'from-indigo-900/40 to-indigo-800/20',
            borderClass: 'border-indigo-500/30'
        },
        {
            id: 'pos',
            title: 'POS Panel',
            icon: <Receipt size={24} className="text-emerald-400" />,
            roles: ['cashier'],
            bgClass: 'from-emerald-900/40 to-emerald-800/20',
            borderClass: 'border-emerald-500/30'
        },
        {
            id: 'salesman',
            title: 'Salesman Panel',
            icon: <Briefcase size={24} className="text-amber-400" />,
            roles: ['salesman'],
            bgClass: 'from-amber-900/40 to-amber-800/20',
            borderClass: 'border-amber-500/30'
        },
        {
            id: 'warehouse',
            title: 'Warehouse Panel',
            icon: <Truck size={24} className="text-blue-400" />,
            roles: ['warehouse'],
            bgClass: 'from-blue-900/40 to-blue-800/20',
            borderClass: 'border-blue-500/30'
        },
        {
            id: 'admin',
            title: 'Admin Panel',
            icon: <Shield size={24} className="text-purple-400" />,
            roles: ['admin'],
            bgClass: 'from-purple-900/40 to-purple-800/20',
            borderClass: 'border-purple-500/30'
        }
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                    <Shield className="text-indigo-500" />
                    Panel Access Control
                </h1>
                <p className="text-slate-400">
                    Access any panel directly without needing a password. Select a user to switch access.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {panels.map((panel, index) => {
                    const panelUsers = users.filter(u => panel.roles.includes(u.role));

                    return (
                        <motion.div
                            key={panel.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`rounded-xl border ${panel.borderClass} bg-gradient-to-br ${panel.bgClass} backdrop-blur-sm overflow-hidden`}
                        >
                            <div className="p-4 border-b border-white/5 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-black/20">
                                        {panel.icon}
                                    </div>
                                    <h3 className="font-semibold text-white">{panel.title}</h3>
                                </div>
                                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-black/40 text-slate-300">
                                    {panelUsers.length} Users
                                </span>
                            </div>

                            <div className="p-2 flex flex-col gap-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                                {panelUsers.length > 0 ? (
                                    panelUsers.map(user => (
                                        <div
                                            key={user.id}
                                            onClick={() => handleLoginAs(user, panel)}
                                            className="group flex items-center justify-between p-3 rounded-lg hover:bg-white/10 transition-colors cursor-pointer border border-transparent hover:border-white/10"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-sm font-bold text-white shadow-lg">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors">
                                                        {user.name}
                                                    </p>
                                                    <p className="text-xs text-slate-400">
                                                        @{user.username}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <span className="text-xs font-medium">Access</span>
                                                <LogIn size={16} />
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-4 text-center text-sm text-slate-500">
                                        No users assigned to this panel.
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    );
                })}
            </div>
            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.2);
                }
            `}</style>
        </div>
    );
};

export default AdminAccessControl;
