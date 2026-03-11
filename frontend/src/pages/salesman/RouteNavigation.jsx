import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Navigation2, MapPin, CheckCircle, XCircle, Clock, Navigation, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import L from 'leaflet';

// Icons setup
const clientIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});
const salesmanIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI / 180; // φ, λ in radians
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // in metres
    return d;
};

const RouteNavigation = () => {
    const { user } = useAuth();
    const [route, setRoute] = useState(null);
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentLocation, setCurrentLocation] = useState(null);
    const [verifying, setVerifying] = useState(false);
    const mapRef = useRef(null);

    // Placeholder OpenRouteService API Key - Should be in .env in production
    const ORS_API_KEY = import.meta.env.VITE_ORS_API_KEY || '5b3ce3597851110001cf6248383ac9f783144a8fb15fe2b7dc17b707';
    const [routePath, setRoutePath] = useState([]);
    const [routeInfo, setRouteInfo] = useState({ distance: 0, duration: 0 });

    useEffect(() => {
        fetchTodayRoute();
        // Start live location tracking
        if ("geolocation" in navigator) {
            const watchId = navigator.geolocation.watchPosition(
                (pos) => setCurrentLocation([pos.coords.latitude, pos.coords.longitude]),
                (err) => console.error("GPS Error", err),
                { enableHighAccuracy: true }
            );
            return () => navigator.geolocation.clearWatch(watchId);
        }
    }, [user]);

    // Fetch ORS Route Polyline once clients and current location are ready
    useEffect(() => {
        if (currentLocation && clients.length > 0) {
            fetchORSRoute();
        }
    }, [clients.length]);

    const fetchTodayRoute = async () => {
        try {
            const res = await fetch(`http://localhost/sales_manage/backend/api/route_navigation.php?action=get_todays_route&salesman_id=${user.id}`);
            const data = await res.json();
            if (data.success) {
                setRoute(data.data.route_id);
                setClients(data.data.clients);
            } else {
                toast.error(data.message || "No route assigned today");
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to load route");
        } finally {
            setLoading(false);
        }
    };

    const fetchORSRoute = async () => {
        if (!currentLocation || clients.length === 0) return;

        // Prepare coordinates for ORS format: [[long, lat], [long, lat]]
        // Filter out clients without lat/lng
        const validClients = clients.filter(c => c.latitude && c.longitude);
        if (validClients.length === 0) return;

        let coordinates = [
            [currentLocation[1], currentLocation[0]] // Start point
        ];

        validClients.forEach(c => {
            coordinates.push([parseFloat(c.longitude), parseFloat(c.latitude)]);
        });

        try {
            const res = await fetch('https://api.openrouteservice.org/v2/directions/driving-car/geojson', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8',
                    'Authorization': ORS_API_KEY,
                    'Content-Type': 'application/json; charset=utf-8'
                },
                body: JSON.stringify({
                    coordinates: coordinates,
                    instructions: false
                })
            });
            const data = await res.json();
            if (data.features && data.features.length > 0) {
                // swap coordinates from [lng, lat] to [lat, lng] for Leaflet Polyline
                const coords = data.features[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
                setRoutePath(coords);
                setRouteInfo({
                    distance: (data.features[0].properties.summary.distance / 1000).toFixed(2), // km
                    duration: (data.features[0].properties.summary.duration / 60).toFixed(0) // mins
                });
            }
        } catch (error) {
            console.error("Failed to fetch route geometry from ORS", error);
        }
    };

    const handleCheckIn = async (client, status) => {
        if (!currentLocation) {
            toast.error("Waiting for GPS location...");
            return;
        }

        if (status === 'visited') {
            // Verify Distance if client has coordinates
            if (client.latitude && client.longitude) {
                const distance = calculateDistance(
                    currentLocation[0], currentLocation[1],
                    parseFloat(client.latitude), parseFloat(client.longitude)
                );

                // Allow CheckIn within 150 meters
                if (distance > 150) {
                    toast.error(`You are too far from the client (${Math.round(distance)}m). Please get closer to check in.`);
                    return;
                }
            } else {
                toast.error("Client location not mapped, proceed with check-in warning.");
                // We'll allow checkin but log actual coordinates
            }
        }

        setVerifying(true);
        try {
            const payload = {
                salesman_id: user.id,
                client_id: client.client_id,
                route_id: route,
                latitude: currentLocation[0],
                longitude: currentLocation[1],
                status: status
            };

            const res = await fetch('http://localhost/sales_manage/backend/api/route_navigation.php?action=verify_visit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (data.success) {
                toast.success(`Client marked as ${status}`);
                // Update local status
                setClients(prev => prev.map(c => c.client_id === client.client_id ? { ...c, visit_status: status } : c));
            } else {
                toast.error(data.message || "Action failed");
            }
        } catch (error) {
            toast.error("Verification error");
        } finally {
            setVerifying(false);
        }
    };

    const openNavigation = (lat, lng, address) => {
        if (lat && lng) {
            window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
        } else {
            window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`, '_blank');
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center h-[400px]">
                <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-white">Loading today's route...</p>
            </div>
        );
    }

    if (!route) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-slate-900/50 rounded-3xl mt-10">
                <AlertCircle className="w-20 h-20 text-indigo-400 mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">No Route Assigned</h2>
                <p className="text-slate-400">You don't have any route plan assigned for today.</p>
            </div>
        );
    }

    const pendingCount = clients.filter(c => c.visit_status === 'pending').length;
    const visitedCount = clients.filter(c => c.visit_status === 'visited').length;

    return (
        <div className="p-4 lg:p-6 max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
            {/* Map Visualization (Phase 6) */}
            <div className="lg:col-span-8 bg-slate-900/60 rounded-3xl p-6 border border-white/10 shadow-xl flex flex-col h-[75vh]">
                <div className="flex justify-between items-center mb-6 text-white min-h-[40px]">
                    <h2 className="text-2xl font-black flex items-center gap-3">
                        <Navigation2 className="text-indigo-500" />
                        Live Map Navigation
                    </h2>
                    {routeInfo.distance > 0 && (
                        <div className="flex items-center gap-4 bg-indigo-500/20 px-4 py-2 rounded-xl text-indigo-300 font-medium text-sm border border-indigo-500/30">
                            <span><MapPin className="w-4 h-4 inline mr-1" /> {routeInfo.distance} km</span>
                            <span><Clock className="w-4 h-4 inline mr-1" /> {routeInfo.duration} mins</span>
                        </div>
                    )}
                </div>

                <div className="flex-1 rounded-2xl overflow-hidden border border-white/5 shadow-2xl relative">
                    {currentLocation ? (
                        <MapContainer
                            ref={mapRef}
                            center={currentLocation}
                            zoom={13}
                            style={{ height: '100%', width: '100%' }}
                        >
                            <TileLayer
                                url="http://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
                                attribution='&copy; <a href="https://www.google.com/maps">Google Maps</a>'
                            />

                            {/* Current Location Marker */}
                            <Marker position={currentLocation} icon={salesmanIcon}>
                                <Popup>Your Current Location</Popup>
                            </Marker>

                            {/* Client Markers */}
                            {clients.map(c => {
                                if (c.latitude && c.longitude) {
                                    return (
                                        <Marker
                                            key={c.client_id}
                                            position={[parseFloat(c.latitude), parseFloat(c.longitude)]}
                                            icon={clientIcon}
                                        >
                                            <Popup>
                                                <div className="text-slate-800 font-bold">{c.client_name}</div>
                                                <div className="text-sm">Status: {c.visit_status}</div>
                                            </Popup>
                                        </Marker>
                                    );
                                }
                                return null;
                            })}

                            {/* ORS Route Polyline */}
                            {routePath.length > 0 && (
                                <Polyline positions={routePath} color="#4F46E5" weight={5} opacity={0.7} />
                            )}
                        </MapContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center text-white/50 animate-pulse bg-slate-800">
                            Waiting for GPS Location array...
                        </div>
                    )}
                </div>
            </div>

            {/* Turn-by-turn list / Client Queue */}
            <div className="lg:col-span-4 flex flex-col h-[75vh]">
                <div className="bg-slate-900/60 rounded-3xl p-6 border border-white/10 shadow-xl flex flex-col h-full">
                    <h3 className="font-black text-white text-xl uppercase tracking-widest mb-6 border-b border-white/10 pb-4 flex justify-between">
                        Stop Sequence
                        <span className="bg-emerald-500 text-white text-[10px] px-2 py-1 rounded-md">{visitedCount} / {clients.length}</span>
                    </h3>

                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4">
                        {clients.map((client, idx) => {
                            const isVisited = client.visit_status === 'visited';
                            const isSkipped = client.visit_status === 'skipped';

                            return (
                                <div key={client.client_id} className={`p-4 rounded-2xl border transition-all ${isVisited ? 'bg-emerald-500/10 border-emerald-500/30' : isSkipped ? 'bg-rose-500/10 border-rose-500/30' : 'bg-slate-800/50 border-white/5 hover:border-indigo-500/50'}`}>
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center font-black text-indigo-400 shadow-md">
                                                {idx + 1}
                                            </div>
                                            <div>
                                                <h4 className={`font-black tracking-tight ${isVisited ? 'text-emerald-400' : isSkipped ? 'text-rose-400' : 'text-white'}`}>{client.client_name}</h4>
                                                <p className="text-xs text-slate-400 uppercase font-bold mt-1 line-clamp-2">{client.address}</p>
                                            </div>
                                        </div>
                                        {client.visit_status !== 'pending' && (
                                            <div className="text-xs font-black uppercase tracking-wider">
                                                {isVisited ? <span className="text-emerald-400 flex items-center"><CheckCircle className="w-4 h-4 mr-1" /> Done</span> : <span className="text-rose-400 flex items-center"><XCircle className="w-4 h-4 mr-1" /> Skipped</span>}
                                            </div>
                                        )}
                                    </div>

                                    {client.visit_status === 'pending' && (
                                        <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-2 gap-3">
                                            <button
                                                onClick={() => openNavigation(client.latitude, client.longitude, client.address)}
                                                className="col-span-2 py-2 bg-indigo-500 text-white rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-indigo-600 transition-colors shadow-lg"
                                            >
                                                <Navigation className="w-4 h-4" /> Steer & Navigate
                                            </button>

                                            <button
                                                onClick={() => handleCheckIn(client, 'visited')}
                                                disabled={verifying}
                                                className="py-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 rounded-xl font-bold text-xs uppercase hover:bg-emerald-500 hover:text-white transition-all disabled:opacity-50"
                                            >
                                                GPS Check-In
                                            </button>

                                            <button
                                                onClick={() => handleCheckIn(client, 'skipped')}
                                                disabled={verifying}
                                                className="py-2 bg-rose-500/20 text-rose-400 border border-rose-500/50 rounded-xl font-bold text-xs uppercase hover:bg-rose-500 hover:text-white transition-all disabled:opacity-50"
                                            >
                                                Skip Stop
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RouteNavigation;
