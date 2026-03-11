import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline, LayersControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Users, Crosshair, RefreshCw, Navigation, Clock, Calendar, Play, Pause, Map as MapIcon, Layers, FastForward, Rewind } from 'lucide-react';
import L from 'leaflet';
import toast from 'react-hot-toast';

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

const salesmanLiveIcon = new L.Icon({
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

const LiveTracking = () => {
    // Shared State
    const [activeTab, setActiveTab] = useState('live'); // 'live' or 'history'
    const warehouseLocation = [23.0225, 72.5714];
    const [focusLocation, setFocusLocation] = useState(null);

    // Live Tracking State
    const [liveLocations, setLiveLocations] = useState([]);
    const [loadingLive, setLoadingLive] = useState(true);
    const [autoRefresh, setAutoRefresh] = useState(true);

    // History Tracking State
    const [salesmenList, setSalesmenList] = useState([]);
    const [historySalesmanId, setHistorySalesmanId] = useState('');
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
            const res = await fetch('http://localhost/sales_manage/backend/api/gps.php?action=get_live');
            const data = await res.json();
            if (data.success) {
                setLiveLocations(data.data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingLive(false);
        }
    };

    // Fetch Salesmen List
    const fetchSalesmen = async () => {
        try {
            const res = await fetch('http://localhost/sales_manage/backend/api/gps.php?action=get_salesmen');
            const data = await res.json();
            if (data.success) {
                setSalesmenList(data.data);
                if (data.data.length > 0) {
                    setHistorySalesmanId(data.data[0].salesman_id);
                }
            }
        } catch (err) {
            console.error("Failed to fetch salesmen");
        }
    };

    // Fetch History Data
    const fetchHistoryData = async () => {
        if (!historySalesmanId || !historyDate) return;
        setLoadingHistory(true);
        setIsPlaying(false);
        setPlaybackIndex(0);
        try {
            const res = await fetch(`http://localhost/sales_manage/backend/api/gps.php?action=get_history&salesman_id=${historySalesmanId}&date=${historyDate}`);
            const data = await res.json();
            if (data.success) {
                setHistoryData(data.data);
                if (data.data.length === 0) {
                    toast.error("No tracking data found for this date.");
                } else {
                    toast.success(`Loaded ${data.data.length} location points.`);
                }
            } else {
                toast.error(data.message || 'Failed to fetch tracking history');
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
        fetchSalesmen();
        let interval;
        if (autoRefresh && activeTab === 'live') {
            interval = setInterval(fetchLiveLocations, 10000);
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
        <div className="flex flex-col h-full bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-4">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Navigation className="text-blue-500" />
                        Salesman GPS Tracking
                    </h2>
                    <p className="text-white/60 text-sm">Real-time mapping and historical route playback</p>
                </div>

                <div className="flex items-center gap-2 bg-black/40 p-1.5 rounded-2xl border border-white/10">
                    <button
                        onClick={() => setActiveTab('live')}
                        className={`px-6 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'live' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' : 'text-white/60 hover:text-white'}`}
                    >
                        <RefreshCw className="w-4 h-4" /> Live
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`px-6 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'history' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30' : 'text-white/60 hover:text-white'}`}
                    >
                        <MapIcon className="w-4 h-4" /> History
                    </button>
                </div>
            </div>

            <div className="flex gap-4 h-[calc(100vh-14rem)]">
                {/* Fixed Map Container */}
                <div className="flex-1 rounded-2xl overflow-hidden border border-white/10 relative shadow-2xl z-0">
                    <MapContainer
                        center={warehouseLocation}
                        zoom={12}
                        style={{ height: '100%', width: '100%' }}
                        className="z-0"
                    >
                        <LayersControl position="topright">
                            <LayersControl.BaseLayer checked name="Google Streets">
                                <TileLayer
                                    url="http://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
                                    attribution='&copy; <a href="https://www.google.com/maps">Google Maps</a>'
                                />
                            </LayersControl.BaseLayer>
                            <LayersControl.BaseLayer name="Google Satellite">
                                <TileLayer
                                    url="http://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
                                    attribution='&copy; <a href="https://www.google.com/maps">Google Maps</a>'
                                />
                            </LayersControl.BaseLayer>
                            <LayersControl.BaseLayer name="Google Hybrid">
                                <TileLayer
                                    url="http://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
                                    attribution='&copy; <a href="https://www.google.com/maps">Google Maps</a>'
                                />
                            </LayersControl.BaseLayer>
                            <LayersControl.BaseLayer name="Google Terrain">
                                <TileLayer
                                    url="http://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}"
                                    attribution='&copy; <a href="https://www.google.com/maps">Google Maps</a>'
                                />
                            </LayersControl.BaseLayer>
                        </LayersControl>

                        {/* Warehouse Marker */}
                        <Marker position={warehouseLocation} icon={warehouseIcon}>
                            <Popup><div className="font-semibold text-gray-800">Main Warehouse</div></Popup>
                        </Marker>

                        {/* LIVE TRACKING RENDER */}
                        {activeTab === 'live' && liveLocations.map((loc) => (
                            <Marker
                                key={loc.salesman_id}
                                position={[parseFloat(loc.latitude), parseFloat(loc.longitude)]}
                                icon={salesmanLiveIcon}
                            >
                                <Popup>
                                    <div className="text-gray-800 min-w-[200px]">
                                        <div className="font-bold border-b border-gray-200 pb-2 mb-2 flex items-center gap-2">
                                            <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
                                            {loc.salesman_name}
                                        </div>
                                        <div className="text-xs space-y-1 text-gray-600">
                                            <div className="flex justify-between">
                                                <span>Lat:</span> <strong>{parseFloat(loc.latitude).toFixed(5)}</strong>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Lng:</span> <strong>{parseFloat(loc.longitude).toFixed(5)}</strong>
                                            </div>
                                        </div>
                                        <div className="text-xs flex items-center gap-1 mt-2 bg-gray-100 p-2 rounded-lg text-gray-600">
                                            <Clock className="w-4 h-4 text-blue-500" />
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
                                            <div className="font-bold text-green-600">Login / Route Start</div>
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
                                                <div className="font-bold text-orange-600">Logout / Route End</div>
                                                <div className="text-xs mt-1">
                                                    {new Date(historyData[historyData.length - 1].updated_at).toLocaleString()}
                                                </div>
                                            </div>
                                        </Popup>
                                    </Marker>
                                )}

                                {/* Playback Current Marker */}
                                {historyData[playbackIndex] && (
                                    <Marker
                                        position={[parseFloat(historyData[playbackIndex].latitude), parseFloat(historyData[playbackIndex].longitude)]}
                                        icon={playbackIcon}
                                    >
                                        <Popup>
                                            <div className="text-gray-800">
                                                <div className="font-bold text-indigo-600">Timeline Position</div>
                                                <div className="text-xs mt-1">
                                                    {new Date(historyData[playbackIndex].updated_at).toLocaleString()}
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
                                    <Users className="w-5 h-5 text-blue-400" />
                                    Active ({liveLocations.length})
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
                                <div className="text-white/50 text-center py-4 text-sm animate-pulse">Loading tracking data...</div>
                            )}

                            {liveLocations.map((loc) => {
                                const lastUpdate = new Date(loc.updated_at);
                                const diffMins = Math.floor((new Date() - lastUpdate) / 60000);
                                const statusColor = diffMins < 5 ? 'bg-green-500' : (diffMins < 15 ? 'bg-yellow-500' : 'bg-red-500');

                                return (
                                    <div
                                        key={loc.salesman_id}
                                        onClick={() => handleFocus(loc.latitude, loc.longitude)}
                                        className="group relative bg-white/5 hover:bg-white/10 border border-white/10 hover:border-blue-500/50 rounded-xl p-4 cursor-pointer transition-all hover:scale-[1.02]"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="font-medium text-white flex items-center gap-2">
                                                <div className={`w-2.5 h-2.5 rounded-full ${statusColor} shadow-[0_0_8px_rgba(34,197,94,0.6)]`}></div>
                                                {loc.salesman_name}
                                            </div>
                                            <button className="text-white/30 group-hover:text-blue-400 transition-colors">
                                                <Crosshair className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <div className="text-xs text-white/60 flex items-center gap-1.5 mt-2 bg-black/20 px-2 py-1 rounded inline-flex">
                                            <Clock className="w-3 h-3" />
                                            Last: {diffMins === 0 ? 'Just now' : `${diffMins} min ago`}
                                        </div>
                                    </div>
                                );
                            })}
                        </>
                    )}

                    {/* HISTORY TRACKING SIDEBAR */}
                    {activeTab === 'history' && (
                        <div className="flex flex-col gap-4">
                            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex flex-col gap-4">
                                <div>
                                    <label className="text-xs text-white/60 mb-1.5 block">Select Salesman</label>
                                    <select
                                        value={historySalesmanId}
                                        onChange={(e) => setHistorySalesmanId(e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                                    >
                                        {salesmenList.map(s => (
                                            <option key={s.salesman_id} value={s.salesman_id} className="bg-gray-900">{s.salesman_name}</option>
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
                                    className="w-full bg-indigo-500 hover:bg-indigo-600 active:bg-indigo-700 text-white font-medium py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-500/30 flex justify-center items-center gap-2"
                                >
                                    {loadingHistory ? <RefreshCw className="w-4 h-4 animate-spin" /> : <MapIcon className="w-4 h-4" />}
                                    Load Route Path
                                </button>
                            </div>

                            {historyData.length > 0 && (
                                <>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                                            <div className="text-xs text-white/50 mb-1">Total Distance</div>
                                            <div className="text-lg font-bold text-white">{totalDistanceKm.toFixed(2)} <span className="text-xs text-white/50 font-normal">km</span></div>
                                        </div>
                                        <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                                            <div className="text-xs text-white/50 mb-1">Duration</div>
                                            <div className="text-lg font-bold text-white">{totalDuration}</div>
                                        </div>
                                    </div>

                                    {/* Playback Controls */}
                                    <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex flex-col gap-3">
                                        <h4 className="text-sm font-medium text-white flex items-center gap-2">
                                            <Play className="w-4 h-4 text-indigo-400" /> Route Playback
                                        </h4>
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => setIsPlaying(!isPlaying)}
                                                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isPlaying ? 'bg-red-500/20 text-red-500 border border-red-500/30' : 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'}`}
                                            >
                                                {isPlaying ? <Pause className="w-5 h-5 ml-0.5" /> : <Play className="w-5 h-5 ml-1" />}
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
                                            <div className="text-white bg-black/30 px-2 py-1 rounded">
                                                {new Date(historyData[playbackIndex]?.updated_at).toLocaleTimeString()}
                                            </div>

                                            <div className="flex gap-1 items-center">
                                                <button onClick={() => setPlaybackSpeed(1)} className={`px-2 py-1 rounded ${playbackSpeed === 1 ? 'bg-white/20 text-white' : 'text-white/40'}`}>1x</button>
                                                <button onClick={() => setPlaybackSpeed(3)} className={`px-2 py-1 rounded ${playbackSpeed === 3 ? 'bg-white/20 text-white' : 'text-white/40'}`}>3x</button>
                                                <button onClick={() => setPlaybackSpeed(10)} className={`px-2 py-1 rounded ${playbackSpeed === 10 ? 'bg-white/20 text-white' : 'text-white/40'}`}>10x</button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Location Timeline */}
                                    <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex-1 overflow-y-auto custom-scrollbar">
                                        <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2 border-b border-white/10 pb-2">
                                            <Clock className="w-4 h-4 text-blue-400" /> Timeline Progress
                                        </h4>
                                        <div className="text-xs text-white/70 space-y-3 relative before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/20 before:to-transparent">
                                            {/* Start Point */}
                                            <div className="relative flex items-center justify-between group">
                                                <div className="flex items-center">
                                                    <div className="h-6 w-6 rounded-full border border-white/20 bg-green-500/20 text-green-400 flex items-center justify-center z-10 mr-3 shrink-0 backdrop-blur-sm">S</div>
                                                    <div>
                                                        <div className="text-white font-medium">Started Route</div>
                                                        <div className="text-white/40">{new Date(historyData[0].updated_at).toLocaleTimeString()}</div>
                                                    </div>
                                                </div>
                                            </div>
                                            {/* End Point */}
                                            {historyData.length > 1 && (
                                                <div className="relative flex items-center justify-between group">
                                                    <div className="flex items-center">
                                                        <div className="h-6 w-6 rounded-full border border-white/20 bg-orange-500/20 text-orange-400 flex items-center justify-center z-10 mr-3 shrink-0 backdrop-blur-sm">E</div>
                                                        <div>
                                                            <div className="text-white font-medium">Ended Route</div>
                                                            <div className="text-white/40">{new Date(historyData[historyData.length - 1].updated_at).toLocaleTimeString()}</div>
                                                        </div>
                                                    </div>
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

            <style jsx>{`
                /* Hide native datepicker icon */
                .custom-date-input::-webkit-calendar-picker-indicator {
                    background: transparent;
                    bottom: 0;
                    color: transparent;
                    cursor: pointer;
                    height: auto;
                    left: 0;
                    position: absolute;
                    right: 0;
                    top: 0;
                    width: auto;
                }
            `}</style>
        </div>
    );
};

export default LiveTracking;
