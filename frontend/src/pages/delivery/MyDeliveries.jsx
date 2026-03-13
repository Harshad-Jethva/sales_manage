import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Truck, MapPin, Package, Phone, CheckCircle, XCircle, AlertTriangle, Navigation, Clock, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import SEO from '../../components/common/SEO';
import gsap from 'gsap';

const MyDeliveries = () => {
    const { token } = useAuth();
    const [deliveries, setDeliveries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [locationSyncing, setLocationSyncing] = useState(false);
    const containerRef = useRef(null);
    const trackingInterval = useRef(null);

    // Initial Fetch & Setup Tracking
    useEffect(() => {
        fetchDeliveries();

        // Location Tracking Setup
        if (navigator.geolocation) {
            startTracking();
        } else {
            toast.error("Geolocation is not supported by your browser");
        }

        return () => {
             if(trackingInterval.current) clearInterval(trackingInterval.current);
        };
    }, []);

    const startTracking = () => {
        // Send initial location
        syncLocation();
        // Send location every 15 seconds
        trackingInterval.current = setInterval(syncLocation, 15000);
    };

    const syncLocation = () => {
        setLocationSyncing(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    await axios.post('http://localhost/sales_manage/backend/api/delivery/my_deliveries.php?action=update_location', {
                        latitude, longitude
                    }, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                } catch (err) {
                    console.error("GPS Sync error", err);
                } finally {
                    setLocationSyncing(false);
                }
            },
            (error) => {
                console.error("Geolocation error:", error);
                setLocationSyncing(false);
            },
            { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );
    };

    const fetchDeliveries = async () => {
        setLoading(true);
        try {
            const res = await axios.get('http://localhost/sales_manage/backend/api/delivery/my_deliveries.php?action=list', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.data.success) {
                setDeliveries(res.data.data);
                // Animate entrance
                if (containerRef.current) {
                    gsap.fromTo(".delivery-card-anim", 
                        { y: 30, opacity: 0, scale: 0.95 },
                        { y: 0, opacity: 1, scale: 1, stagger: 0.1, duration: 0.4, ease: "back.out(1.2)" }
                    );
                }
            } else {
                toast.error(res.data.error || 'Failed to fetch deliveries');
            }
        } catch (err) {
            console.error(err);
            toast.error('Network error fetching deliveries');
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (orderId, newStatus, requiresRemarks = false) => {
        let remarks = `Status updated to ${newStatus}`;
        if (requiresRemarks) {
            remarks = window.prompt(`Please enter reason for ${newStatus}:`);
            if (remarks === null) return; // User cancelled
        }

        const loadingToast = toast.loading(`Marking as ${newStatus}...`);
        try {
            const res = await axios.post('http://localhost/sales_manage/backend/api/delivery/my_deliveries.php?action=update_status', {
                order_id: orderId,
                status: newStatus,
                remarks
            }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.data.success) {
                toast.success(`Order is now ${newStatus}`, { id: loadingToast });
                fetchDeliveries(); // Refresh list
            } else {
                toast.error(res.data.error || 'Update failed', { id: loadingToast });
            }
        } catch (err) {
            toast.error(err.response?.data?.error || 'Update failed', { id: loadingToast });
        }
    };

    const openInMaps = (address) => {
        const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
        window.open(url, '_blank');
    };

    return (
        <div className="my-deliveries-container max-w-lg mx-auto pb-16" ref={containerRef}>
            <SEO title="My Deliveries" description="Delivery Task List" />

            <div className="sticky top-0 z-20 bg-slate-900/80 backdrop-blur-md pt-4 pb-4 px-4 border-b border-slate-800 flex justify-between items-center shadow-lg">
                <h1 className="text-xl font-bold text-white flex items-center gap-2">
                    <Truck className="text-indigo-400" /> Active Tasks
                </h1>
                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-semibold bg-slate-800/50 px-2 py-1 rounded-full border border-slate-700">
                    <div className={`w-2 h-2 rounded-full ${locationSyncing ? 'bg-indigo-400 animate-ping' : 'bg-emerald-400'}`}></div> GPS Sync
                </div>
            </div>

            <div className="p-4 space-y-4">
                {loading ? (
                    Array(3).fill(0).map((_, i) => (
                        <div key={i} className="bg-slate-800/40 border border-slate-700/50 rounded-2xl h-40 animate-pulse" />
                    ))
                ) : deliveries.length > 0 ? (
                    deliveries.map((delivery) => (
                        <div key={delivery.order_id} className="delivery-card-anim bg-slate-900 border border-slate-700/50 rounded-2xl p-4 shadow-xl relative overflow-hidden backdrop-blur-sm flex flex-col h-full ring-1 ring-slate-800">
                            {/* Priority Indicator */}
                            {delivery.delivery_priority === 'Urgent' && (
                                <div className="absolute top-0 right-0 bg-rose-500/20 text-rose-400 px-3 py-1 rounded-bl-xl text-[10px] font-black tracking-widest uppercase flex items-center gap-1 border-b border-l border-rose-500/30">
                                    <AlertTriangle size={10} /> Urgent
                                </div>
                            )}

                            <div className="flex justify-between items-center mb-3 pr-16">
                                <div className="font-mono text-indigo-400 font-bold text-sm">Order #{delivery.order_number || delivery.order_id}</div>
                                <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border
                                    ${delivery.delivery_status === 'Pending' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 
                                      delivery.delivery_status === 'Accepted' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                                      'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}
                                >
                                    {delivery.delivery_status}
                                </span>
                            </div>

                            <div className="space-y-3 mb-4">
                                <div>
                                    <div className="flex items-center gap-2 text-white font-bold text-lg leading-tight">
                                        <Package size={16} className="text-slate-500"/> {delivery.client_name}
                                    </div>
                                </div>

                                <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50">
                                    <div className="flex items-start gap-2 text-slate-300 text-sm mb-2">
                                        <MapPin size={16} className="text-rose-400 shrink-0 mt-0.5" />
                                        <span className="leading-snug">{delivery.client_address || 'No Address Provided'}</span>
                                    </div>
                                    <div className="flex items-center justify-between border-t border-slate-700/50 pt-2 mt-2">
                                        <a href={`tel:${delivery.client_mobile}`} className="flex items-center gap-1.5 text-blue-400 text-xs font-bold hover:text-blue-300 transition-colors">
                                            <Phone size={12} /> Call Client
                                        </a>
                                        <button onClick={() => openInMaps(delivery.client_address)} className="flex items-center gap-1.5 text-indigo-400 text-xs font-bold hover:text-indigo-300 transition-colors">
                                            <Navigation size={12} /> Navigate
                                        </button>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center text-xs text-slate-400">
                                    <div className="flex gap-1 items-center bg-slate-800 px-2 py-1 rounded"><Package size={12} /> {delivery.item_count} Items</div>
                                    <div className="flex gap-1 items-center bg-slate-800 px-2 py-1 rounded font-mono font-bold text-emerald-400">₹{parseFloat(delivery.total_amount).toLocaleString()}</div>
                                    <div className="flex gap-1 items-center bg-slate-800 px-2 py-1 rounded text-slate-400"><Clock size={12} /> {delivery.assigned_date}</div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="mt-auto grid grid-cols-2 gap-2 border-t border-slate-800 pt-3">
                                {delivery.delivery_status === 'Pending' && (
                                    <button onClick={() => updateStatus(delivery.order_id, 'Accepted')} className="col-span-2 py-3 bg-emerald-600/20 text-emerald-400 border border-emerald-600/50 rounded-xl font-bold uppercase tracking-wider text-xs hover:bg-emerald-600/30 transition shadow-lg shadow-emerald-900/20">
                                        Accept Delivery
                                    </button>
                                )}
                                
                                {delivery.delivery_status === 'Accepted' && (
                                    <button onClick={() => updateStatus(delivery.order_id, 'Out for Delivery')} className="col-span-2 py-3 bg-indigo-600 text-white rounded-xl font-bold uppercase tracking-wider text-xs shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition">
                                        🚀 Start Delivery
                                    </button>
                                )}

                                {delivery.delivery_status === 'Out for Delivery' && (
                                    <>
                                        <button onClick={() => updateStatus(delivery.order_id, 'Failed Delivery', true)} className="py-3 bg-red-600/20 text-red-500 border border-red-600/30 rounded-xl font-bold uppercase tracking-wider text-[10px] hover:bg-red-600/30 transition flex items-center justify-center gap-1">
                                            <XCircle size={14} /> Failed
                                        </button>
                                        <button onClick={() => updateStatus(delivery.order_id, 'Delivered')} className="py-3 bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 rounded-xl font-black uppercase tracking-wider text-xs hover:bg-emerald-500 transition flex items-center justify-center gap-1.5">
                                            <CheckCircle size={16} /> Delivered
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 bg-slate-900/40 rounded-3xl border border-dashed border-slate-700/50">
                        <CheckCircle size={56} className="text-emerald-500/50 mb-4" />
                        <h3 className="text-lg font-bold text-white">All caught up!</h3>
                        <p className="text-sm text-slate-400 text-center px-6 mt-2">You don't have any active deliveries assigned right now. Relax or check with warehouse.</p>
                        <button onClick={fetchDeliveries} className="mt-6 px-4 py-2 bg-indigo-500/20 text-indigo-400 rounded-lg text-sm font-bold flex gap-2 items-center hover:bg-indigo-500/30 transition">
                            <RefreshCw size={14} /> Refresh List
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyDeliveries;
