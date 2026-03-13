import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline, LayersControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Truck, MapPin, RefreshCw, Navigation, Clock, Calendar, Play, Pause, Map as MapIcon, Users, Crosshair, Phone, AlertTriangle } from 'lucide-react';
import L from 'leaflet';
import toast from 'react-hot-toast';
import axios from 'axios';
import SEO from '../../../components/common/SEO';

// Leaflet default icons setup
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Icons
const warehouseIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34]
});

const deliveryLiveIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34]
});

const startIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34]
});

const endIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34]
});

const playbackIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-violet.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34]
});

// Haversine formula to calculate distance in km
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

// Component to handle auto-panning
const RecenterMap = ({ location, zoom = 15 }) => {
    const map = useMap();
    useEffect(() => {
        if (location) {
            map.flyTo(location, zoom, { animate: true, duration: 1.5 });
        }
    }, [location, map, zoom]);
    return null;
};

// Fit bounds component
const FitBounds = ({ path }) => {
    const map = useMap();
    useEffect(() => {
        if (path && path.length > 0) {
            const bounds = L.latLngBounds(path.map(p => [parseFloat(p.latitude), parseFloat(p.longitude)]));
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
        }
    }, [path, map]);
    return null;
};

const DeliveryTracking = () => {
    // Shared State
    const [activeTab, setActiveTab] = useState('live'); // 'live' or 'history'
    const warehouseLocation = [23.0225, 72.5714];
    const [focusLocation, setFocusLocation] = useState(null);

    // Live Tracking State
    const [liveLocations, setLiveLocations] = useState([]);
    const [loadingLive, setLoadingLive] = useState(true);
    const [autoRefresh, setAutoRefresh] = useState(true);

    // History Tracking State
    const [staffList, setStaffList] = useState([]);
    const [historyStaffId, setHistoryStaffId] = useState('');
    const [historyDate, setHistoryDate] = useState(new Date().toISOString().split('T')[0]);
    const [historyData, setHistoryData] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    // Playback State
    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackIndex, setPlaybackIndex] = useState(0);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const playbackTimer = useRef(null);

    // Fetch Live Tracking
    const fetchLiveLocations = async () => {
        try {
            const res = await axios.get('http://localhost/sales_manage/backend/api/delivery/tracking.php?action=map_data');
            if (res.data.success) {
                setLiveLocations(res.data.data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingLive(false);
        }
    };

    // Fetch Staff List
    const fetchStaff = async () => {
        try {
            const res = await axios.get('http://localhost/sales_manage/backend/api/delivery/tracking.php?action=get_staff');
            if (res.data.success) {
                setStaffList(res.data.data);
                if (res.data.data.length > 0 && !historyStaffId) {
                    setHistoryStaffId(res.data.data[0].delivery_person_id);
                }
            }
        } catch (err) {
            console.error("Failed to fetch delivery staff");
        }
    };

    // Fetch History Data
    const fetchHistoryData = async () => {
        if (!historyStaffId || !historyDate) return;
        setLoadingHistory(true);
        setIsPlaying(false);
        setPlaybackIndex(0);
        try {
            const res = await axios.get(`http://localhost/sales_manage/backend/api/delivery/tracking.php?action=get_history&delivery_person_id=${historyStaffId}&date=${historyDate}`);
            if (res.data.success) {
                setHistoryData(res.data.data);
                if (res.data.data.length === 0) {
                    toast.error("No tracking data found for this date.");
                } else {
                    toast.success(`Loaded ${res.data.data.length} location points.`);
                }
            } else {
                toast.error(res.data.error || 'Failed to fetch tracking history');
            }
        } catch (error) {
            console.error(error);
            toast.error('API Error');
        } finally {
            setLoadingHistory(false);
        }
    };

    // Auto Refresh for Live Locations
    useEffect(() => {
        fetchLiveLocations();
        fetchStaff();
        let interval;
        if (autoRefresh && activeTab === 'live') {
            interval = setInterval(fetchLiveLocations, 15000);
        }
        return () => clearInterval(interval);
    }, [autoRefresh, activeTab]);

    // Handle Playback
    useEffect(() => {
        if (isPlaying && historyData.length > 0) {
            playbackTimer.current = setInterval(() => {
                setPlaybackIndex(prev => {
                    if (prev >= historyData.length - 1) {
                        setIsPlaying(false);
                        return prev;
                    }
                    return prev + 1;
                });
            }, 1000 / playbackSpeed);
        } else {
            clearInterval(playbackTimer.current);
        }
        return () => clearInterval(playbackTimer.current);
    }, [isPlaying, historyData.length, playbackSpeed]);

    // Focus Handlers
    const handleFocus = (lat, lng) => {
        setFocusLocation([parseFloat(lat), parseFloat(lng)]);
    };

    // Polyline calculations for History
    const routeCoordinates = historyData.map(loc => [parseFloat(loc.latitude), parseFloat(loc.longitude)]);
    let totalDistanceKm = 0;
    for (let i = 1; i < routeCoordinates.length; i++) {
        totalDistanceKm += calculateDistance(
            routeCoordinates[i - 1][0], routeCoordinates[i - 1][1],
            routeCoordinates[i][0], routeCoordinates[i][1]
        );
    }

    let totalDuration = "0h 0m";
    if (historyData.length > 1) {
        const start = new Date(historyData[0].updated_at);
        const end = new Date(historyData[historyData.length - 1].updated_at);
        const diffMs = end - start;
        const diffHrs = Math.floor(diffMs / 3600000);
        const diffMins = Math.floor((diffMs % 3600000) / 60000);
        totalDuration = `${diffHrs}h ${diffMins}m`;
    }

    // Playback Marker Update
    useEffect(() => {
        if (activeTab === 'history' && historyData[playbackIndex]) {
            const currentLoc = historyData[playbackIndex];
            setFocusLocation([parseFloat(currentLoc.latitude), parseFloat(currentLoc.longitude)]);
        }
    }, [playbackIndex, activeTab, historyData]);

    return (
        <div className="flex flex-col h-full bg-slate-900/40 backdrop-blur-md rounded-2xl border border-slate-700/50 p-4">
             <SEO title="Live Delivery Tracking" description="Track delivery staff on map with history playback." />
             
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Navigation className="text-indigo-500" />
                        Delivery Staff Tracking
                    </h2>
                    <p className="text-white/60 text-sm">Real-time mapping and delivery route history</p>
                </div>

                <div className="flex items-center gap-2 bg-black/40 p-1.5 rounded-2xl border border-white/10">
                    <button
                        onClick={() => setActiveTab('live')}
                        className={`px-6 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'live' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-white/60 hover:text-white'}`}
                    >
                        <RefreshCw className="w-4 h-4" /> Live
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`px-6 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'history' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-white/60 hover:text-white'}`}
                    >
                        <MapIcon className="w-4 h-4" /> History
                    </button>
                </div>
            </div>

            <div className="flex gap-4 h-[calc(100vh-14rem)]">
                {/* Map Container */}
                <div className="flex-1 rounded-2xl overflow-hidden border border-slate-700/50 relative shadow-2xl z-0">
                    <MapContainer
                        center={warehouseLocation}
                        zoom={12}
                        style={{ height: '100%', width: '100%' }}
                        className="z-0"
                    >
                        <LayersControl position="topright">
                            <LayersControl.BaseLayer checked name="Dark Map">
                                 <TileLayer
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                                />
                            </LayersControl.BaseLayer>
                            <LayersControl.BaseLayer name="Street Map">
                                <TileLayer
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                />
                            </LayersControl.BaseLayer>
                            <LayersControl.BaseLayer name="Google Streets">
                                <TileLayer
                                    url="http://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
                                    attribution='&copy; Google Maps'
                                />
                            </LayersControl.BaseLayer>
                        </LayersControl>

                        {/* Warehouse Marker */}
                        <Marker position={warehouseLocation} icon={warehouseIcon}>
                            <Popup><div className="font-semibold text-gray-800">Main Warehouse</div></Popup>
                        </Marker>

                        {/* LIVE TRACKING RENDER */}
                        {activeTab === 'live' && liveLocations.map((loc, idx) => (
                            <Marker
                                key={idx}
                                position={[parseFloat(loc.latitude), parseFloat(loc.longitude)]}
                                icon={deliveryLiveIcon}
                            >
                                <Popup>
                                    <div className="text-gray-800 min-w-[200px]">
                                        <div className="font-bold border-b border-gray-200 pb-2 mb-2 flex items-center gap-2">
                                            <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
                                            {loc.name}
                                        </div>
                                        <div className="text-xs space-y-1 text-gray-600">
                                            <div className="flex justify-between">
                                                <span>Phone:</span> <strong>{loc.mobile}</strong>
                                            </div>
                                            <div className="flex justify-between items-center mt-1">
                                                <span>Orders:</span> 
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] ${loc.active_orders > 0 ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                                                    {loc.active_orders} Active
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-xs flex items-center gap-1 mt-2 bg-gray-100 p-2 rounded-lg text-gray-600">
                                            <Clock className="w-4 h-4 text-indigo-500" />
                                            {new Date(loc.updated_at).toLocaleTimeString()}
                                        </div>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}

                        {/* HISTORY TRACKING RENDER */}
                        {activeTab === 'history' && historyData.length > 0 && (
                            <>
                                <Polyline
                                    positions={routeCoordinates}
                                    color="#6366f1"
                                    weight={4}
                                    opacity={0.8}
                                    dashArray="10, 10"
                                />

                                <FitBounds path={historyData} />

                                {/* Start Location */}
                                <Marker position={routeCoordinates[0]} icon={startIcon}>
                                    <Popup>
                                        <div className="text-gray-800">
                                            <div className="font-bold text-green-600">Shift Started</div>
                                            <div className="text-xs mt-1">
                                                {new Date(historyData[0].updated_at).toLocaleString()}
                                            </div>
                                        </div>
                                    </Popup>
                                </Marker>

                                {/* End Location */}
                                {historyData.length > 1 && (
                                    <Marker position={routeCoordinates[historyData.length - 1]} icon={endIcon}>
                                        <Popup>
                                            <div className="text-gray-800">
                                                <div className="font-bold text-orange-600">Last Ping</div>
                                                <div className="text-xs mt-1">
                                                    {new Date(historyData[historyData.length - 1].updated_at).toLocaleString()}
                                                </div>
                                            </div>
                                        </Popup>
                                    </Marker>
                                )}

                                {/* Playback Marker */}
                                {historyData[playbackIndex] && (
                                    <Marker
                                        position={[parseFloat(historyData[playbackIndex].latitude), parseFloat(historyData[playbackIndex].longitude)]}
                                        icon={playbackIcon}
                                    >
                                        <Popup>
                                            <div className="text-gray-800 text-center">
                                                <div className="font-bold text-indigo-600">Timeline</div>
                                                <div className="text-xs mt-1 font-mono">
                                                    {new Date(historyData[playbackIndex].updated_at).toLocaleTimeString()}
                                                </div>
                                            </div>
                                        </Popup>
                                    </Marker>
                                )}
                            </>
                        )}

                        <RecenterMap location={focusLocation} zoom={activeTab === 'live' ? 15 : undefined} />
                    </MapContainer>
                </div>

                {/* Sidebar */}
                <div className="w-80 flex flex-col gap-4 overflow-y-auto custom-scrollbar">

                    {/* LIVE TRACKING SIDEBAR */}
                    {activeTab === 'live' && (
                        <>
                            <div className="flex justify-between items-center bg-white/5 border border-white/10 p-3 rounded-xl">
                                <h3 className="text-white font-medium flex items-center gap-2">
                                    <Users className="w-5 h-5 text-indigo-400" />
                                    Active Driver ({liveLocations.length})
                                </h3>
                                <button
                                    onClick={() => setAutoRefresh(!autoRefresh)}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${autoRefresh ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-white/10 text-white/70 border border-white/10'}`}
                                >
                                    <RefreshCw className={`w-3 h-3 ${autoRefresh ? 'animate-spin' : ''}`} />
                                    {autoRefresh ? 'Auto' : 'Off'}
                                </button>
                            </div>

                            {loadingLive && liveLocations.length === 0 && (
                                <div className="text-white/50 text-center py-4 text-sm animate-pulse">Scanning map...</div>
                            )}

                            {liveLocations.length === 0 && !loadingLive && (
                                <div className="text-white/40 text-center py-8 bg-black/20 rounded-xl border border-dashed border-white/10">
                                    No active drivers in last 24h
                                </div>
                            )}

                            {liveLocations.map((loc, i) => {
                                const lastUpdate = new Date(loc.updated_at);
                                const diffMins = Math.floor((new Date() - lastUpdate) / 60000);
                                const statusColor = diffMins < 5 ? 'bg-green-500' : (diffMins < 30 ? 'bg-yellow-500' : 'bg-red-500');

                                return (
                                    <div
                                        key={i}
                                        onClick={() => handleFocus(loc.latitude, loc.longitude)}
                                        className="group relative bg-white/5 hover:bg-white/10 border border-white/10 hover:border-indigo-500/50 rounded-xl p-4 cursor-pointer transition-all hover:scale-[1.02]"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="font-medium text-white flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${statusColor} shadow-[0_0_8px_rgba(255,255,255,0.2)]`}></div>
                                                {loc.name}
                                            </div>
                                            <button className="text-white/30 group-hover:text-indigo-400">
                                                <Crosshair size={16} />
                                            </button>
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                             <div className="text-xs text-white/60 flex items-center gap-1.5">
                                                <Phone size={12} className="text-slate-500" /> {loc.mobile}
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="text-[10px] text-white/40 font-mono">
                                                    {diffMins === 0 ? 'Recently active' : `${diffMins}m ago`}
                                                </div>
                                                <div className={`text-[10px] px-2 py-0.5 rounded-md ${loc.active_orders > 0 ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-500/20 text-slate-400'}`}>
                                                    {loc.active_orders} Orders
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </>
                    )}

                    {/* HISTORY TRACKING SIDEBAR */}
                    {activeTab === 'history' && (
                        <div className="flex flex-col gap-4">
                            <div className="bg-slate-800/40 border border-slate-700/50 p-4 rounded-2xl flex flex-col gap-4 shadow-inner">
                                <div>
                                    <label className="text-xs text-white/60 mb-1.5 block">Select Driver</label>
                                    <select
                                        value={historyStaffId}
                                        onChange={(e) => setHistoryStaffId(e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                                    >
                                        {staffList.map(s => (
                                            <option key={s.delivery_person_id} value={s.delivery_person_id} className="bg-slate-900">{s.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs text-white/60 mb-1.5 block">Select Date</label>
                                    <div className="relative">
                                        <input
                                            type="date"
                                            value={historyDate}
                                            onChange={(e) => setHistoryDate(e.target.value)}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors pl-10 custom-date-input"
                                        />
                                        <Calendar className="w-4 h-4 text-white/40 absolute left-3.5 top-3" />
                                    </div>
                                </div>
                                <button
                                    onClick={fetchHistoryData}
                                    disabled={loadingHistory}
                                    className="w-full bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-600/20 flex justify-center items-center gap-2"
                                >
                                    {loadingHistory ? <RefreshCw className="w-4 h-4 animate-spin" /> : <MapIcon className="w-4 h-4" />}
                                    Load Driver Log
                                </button>
                            </div>

                            {historyData.length > 0 && (
                                <>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                                            <div className="text-[10px] text-white/50 uppercase tracking-wider mb-1">Total Path</div>
                                            <div className="text-lg font-bold text-white">{totalDistanceKm.toFixed(2)} <span className="text-xs text-white/50 font-normal">km</span></div>
                                        </div>
                                        <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                                            <div className="text-[10px] text-white/50 uppercase tracking-wider mb-1">Time Range</div>
                                            <div className="text-lg font-bold text-white">{totalDuration}</div>
                                        </div>
                                    </div>

                                    {/* Playback Controls */}
                                    <div className="bg-indigo-600/10 border border-indigo-500/20 p-4 rounded-2xl flex flex-col gap-3">
                                        <h4 className="text-sm font-medium text-white flex items-center gap-2">
                                            <Play size={14} className="text-indigo-400" /> Route Replay
                                        </h4>
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => setIsPlaying(!isPlaying)}
                                                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isPlaying ? 'bg-red-500/20 text-red-500 border border-red-500/30' : 'bg-indigo-600 text-white shadow-lg'}`}
                                            >
                                                {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-1" />}
                                            </button>

                                            <input
                                                type="range"
                                                min="0"
                                                max={historyData.length - 1}
                                                value={playbackIndex}
                                                onChange={(e) => setPlaybackIndex(parseInt(e.target.value))}
                                                className="flex-1 accent-indigo-500"
                                            />
                                        </div>

                                        <div className="flex justify-between items-center text-xs mt-1">
                                            <div className="text-white bg-black/30 px-2 py-1 rounded font-mono">
                                                {new Date(historyData[playbackIndex]?.updated_at).toLocaleTimeString()}
                                            </div>

                                            <div className="flex gap-1 items-center font-mono">
                                                {[1, 5, 20].map(speed => (
                                                    <button 
                                                        key={speed}
                                                        onClick={() => setPlaybackSpeed(speed)} 
                                                        className={`px-2 py-1 rounded transition-colors ${playbackSpeed === speed ? 'bg-indigo-600 text-white' : 'text-white/40 hover:text-white/60'}`}
                                                    >
                                                        {speed}x
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Milestone Timeline */}
                                    <div className="bg-black/20 border border-white/5 p-4 rounded-2xl flex-1 overflow-y-auto custom-scrollbar">
                                        <h4 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <Clock size={12} /> Milestone Log
                                        </h4>
                                        <div className="text-xs space-y-4 relative border-l border-white/10 ml-2 pl-4">
                                            {/* Start Point */}
                                            <div className="relative group">
                                                <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-green-500 border-2 border-slate-900 group-hover:scale-125 transition-transform" />
                                                <div className="text-white font-medium">Logged In / Start</div>
                                                <div className="text-white/40 font-mono">{new Date(historyData[0].updated_at).toLocaleTimeString()}</div>
                                            </div>
                                            
                                            {/* Current Position (Marker) */}
                                             <div className="relative group italic">
                                                <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-indigo-500 border-2 border-slate-900" />
                                                <div className="text-indigo-400 font-medium">Tracking...</div>
                                                <div className="text-white/20 font-mono text-[10px]">Active Session</div>
                                            </div>

                                            {/* End Point */}
                                            {historyData.length > 1 && (
                                                <div className="relative group">
                                                    <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-orange-500 border-2 border-slate-900 group-hover:scale-125 transition-transform" />
                                                    <div className="text-white font-medium">Last Known Ping</div>
                                                    <div className="text-white/40 font-mono">{new Date(historyData[historyData.length - 1].updated_at).toLocaleTimeString()}</div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                .custom-date-input::-webkit-calendar-picker-indicator {
                    background: transparent; bottom: 0; color: transparent; cursor: pointer;
                    height: auto; left: 0; position: absolute; right: 0; top: 0; width: auto;
                }
                .leaflet-popup-content-wrapper { border-radius: 12px !important; }
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
            `}</style>
        </div>
    );
};

export default DeliveryTracking;
