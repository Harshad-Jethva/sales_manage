import { useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const GPSTracker = () => {
    const { user } = useAuth();
    const intervalRef = useRef(null);

    useEffect(() => {
        // Only run for salesman
        if (!user || user.role !== 'salesman') return;

        const sendLocationUpdate = async (position) => {
            if (!navigator.onLine) return; // Wait for network

            try {
                const payload = {
                    salesman_id: user.id,
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                };

                await fetch('http://localhost/sales_manage/backend/api/gps.php?action=update', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            } catch (error) {
                console.error("Failed to sync GPS location:", error);
            }
        };

        const captureLocation = () => {
            if ("geolocation" in navigator) {
                navigator.geolocation.getCurrentPosition(
                    (position) => sendLocationUpdate(position),
                    (error) => {
                        console.error("GPS Error:", error);
                        if (error.code === error.PERMISSION_DENIED) {
                            if (!sessionStorage.getItem('gps_denied_toast')) {
                                toast.error("GPS Permission Denied. Live tracking is disabled.");
                                sessionStorage.setItem('gps_denied_toast', 'true');
                            }
                        }
                    },
                    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
                );
            }
        };

        // Request immediately on login
        captureLocation();

        // Then every 15 seconds
        intervalRef.current = setInterval(captureLocation, 15000);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [user]);

    return null; // Background component
};

export default GPSTracker;
