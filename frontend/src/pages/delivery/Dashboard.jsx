import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Package, Truck, CheckCircle, MapPin, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';
import SEO from '../../components/common/SEO';

const Dashboard = () => {
    const { user, token } = useAuth();
    const [assigned, setAssigned] = useState(0);
    const [completed, setCompleted] = useState(0);
    
    // Quick GPS location update on dashboard load
    useEffect(() => {
        if (navigator.geolocation && token) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    try {
                        await axios.post('http://localhost/sales_manage/backend/api/delivery/my_deliveries.php?action=update_location', {
                            latitude, longitude
                        }, {
                            headers: { 'Authorization': `Bearer ${token}` }
                        });
                        console.log("Initial GPS Location Sent");
                    } catch (err) {
                        console.error("GPS Sync error", err);
                    }
                },
                (error) => console.error(error),
                { enableHighAccuracy: true }
            );
        }
    }, [user, token]);

    useEffect(() => {
        const fetchStats = async () => {
            if (!token) return;
            try {
                const headers = { 'Authorization': `Bearer ${token}` };
                const res = await axios.get('http://localhost/sales_manage/backend/api/delivery/my_deliveries.php?action=list', { headers });
                
                if (res.data.success) {
                    setAssigned(res.data.data.length);
                }

                const res2 = await axios.get('http://localhost/sales_manage/backend/api/delivery/my_deliveries.php?action=history', { headers });
                if(res2.data.success){
                    const del = res2.data.data.filter(d => d.delivery_status === 'Delivered').length;
                    setCompleted(del);
                }
            } catch(e) { console.error(e) }
        }
        fetchStats();
    }, [token]);

    return (
        <div className="delivery-person-dashboard container mx-auto p-4 max-w-4xl">
            <SEO title="Delivery Dashboard" description="Delivery Person Home" />

            <div className="mb-8">
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Welcome Back, {user?.name || 'Driver'}!</h1>
                <p className="text-slate-400">Here's your delivery overview for today.</p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-slate-900 border border-slate-700/50 p-6 rounded-2xl flex flex-col items-center justify-center shadow-xl">
                    <div className="w-12 h-12 bg-indigo-500/20 text-indigo-400 rounded-full flex justify-center items-center mb-3">
                        <Package size={24} />
                    </div>
                    <div className="text-3xl font-black text-white">{assigned}</div>
                    <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold mt-1">Active Deliveries</div>
                </div>

                <div className="bg-slate-900 border border-slate-700/50 p-6 rounded-2xl flex flex-col items-center justify-center shadow-xl">
                    <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex justify-center items-center mb-3">
                        <CheckCircle size={24} />
                    </div>
                    <div className="text-3xl font-black text-white">{completed}</div>
                    <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold mt-1">Recent Completed</div>
                </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-900/40 to-slate-900 border border-indigo-500/20 rounded-2xl p-6 text-center shadow-2xl relative overflow-hidden backdrop-blur-md">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <MapPin size={120} />
                </div>
                <h2 className="text-xl font-bold text-white mb-2 relative z-10">Ready to Hit the Road?</h2>
                <p className="text-slate-400 text-sm mb-6 max-w-md mx-auto relative z-10">
                    Your location is tracked automatically while active. Please head over to your task list to manage orders.
                </p>
                <Link to="/delivery/my-deliveries" className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-8 rounded-xl shadow-[0_0_20px_rgba(79,70,229,0.4)] transition-all relative z-10">
                    <Truck size={20} /> Go to My Deliveries
                </Link>
            </div>
        </div>
    );
};

export default Dashboard;
