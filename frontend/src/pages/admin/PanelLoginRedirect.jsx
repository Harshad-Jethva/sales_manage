import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';

const PanelLoginRedirect = () => {
    const [status, setStatus] = useState('Authenticating and loading panel...');
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const performLogin = async () => {
            const params = new URLSearchParams(location.search);
            const targetUserId = params.get('user_id');
            const role = params.get('role');
            const adminToken = params.get('admin_token');

            if (!targetUserId || !adminToken) {
                setStatus('Invalid access parameters.');
                return;
            }

            try {
                const response = await fetch('http://localhost/sales_manage/backend/api/admin_login_as.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ admin_token: adminToken, target_user_id: targetUserId })
                });

                const data = await response.json();

                if (data.success) {
                    login(data.user, data.token);

                    // Redirect based on role
                    switch (role) {
                        case 'cashier':
                            navigate('/pos');
                            break;
                        case 'salesman':
                            navigate('/salesman/dashboard');
                            break;
                        case 'warehouse':
                            navigate('/warehouse/dashboard');
                            break;
                        case 'accountant':
                            navigate('/');
                            break;
                        case 'admin':
                            navigate('/admin/dashboard');
                            break;
                        default:
                            navigate('/');
                    }
                } else {
                    setStatus('Authentication failed: ' + (data.message || 'Unknown error'));
                    toast.error(data.message || 'Login failed');
                }
            } catch (error) {
                console.error('Login as error:', error);
                setStatus('Network error during authentication.');
            }
        };

        performLogin();
    }, [location.search, navigate, login]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-transparent">
            <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
            <p className="text-white font-medium">{status}</p>
        </div>
    );
};

export default PanelLoginRedirect;
