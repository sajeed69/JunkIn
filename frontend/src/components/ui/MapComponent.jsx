import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

// Sub-component to handle map center updates
function RecenterAutomatically({ lat, lng }) {
    const map = useMap();
    useEffect(() => {
        if (lat && lng) {
            map.setView([lat, lng], map.getZoom());
        }
    }, [lat, lng, map]);
    return null;
}

// Custom icon using CDN to avoid Vite asset resolution issues
const defaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

export default function MapComponent({ height = "100%", zoom = 13 }) {
    const [position, setPosition] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!navigator.geolocation) {
            setError("Geolocation is not supported by your browser");
            setLoading(false);
            return;
        }

        const watchId = navigator.geolocation.watchPosition(
            (pos) => {
                if (pos && pos.coords) {
                    setPosition([pos.coords.latitude, pos.coords.longitude]);
                    setLoading(false);
                    setError(null);
                }
            },
            (err) => {
                console.error("Geolocation error:", err);
                setError(`Location error: ${err.message}`);
                setLoading(false);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );

        return () => navigator.geolocation.clearWatch(watchId);
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-full min-h-[300px] bg-slate-50 dark:bg-slate-800 rounded-xl">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="mt-4 text-xs font-bold text-slate-500">Accessing location...</p>
            </div>
        );
    }

    if (error || !position) {
        return (
            <div className="flex flex-col items-center justify-center h-full min-h-[300px] bg-slate-50 dark:bg-slate-800 p-6 text-center rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="material-symbols-outlined text-4xl text-slate-400 mb-2">location_off</span>
                <p className="text-sm font-bold text-slate-600 dark:text-slate-300">{error || "Waiting for location..."}</p>
                <p className="text-[10px] text-slate-500 mt-2">Please ensure location services are enabled and permissions are granted.</p>
            </div>
        );
    }

    return (
        <div style={{ height, width: '100%', minHeight: '300px', position: 'relative' }} className="rounded-xl overflow-hidden shadow-inner">
            <MapContainer 
                center={position} 
                zoom={zoom} 
                scrollWheelZoom={true} 
                style={{ height: '100%', width: '100%', zIndex: 1 }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={position} icon={defaultIcon}>
                    <Popup>
                        <div className="text-xs font-bold">Your Current Location</div>
                    </Popup>
                </Marker>
                <RecenterAutomatically lat={position[0]} lng={position[1]} />
            </MapContainer>
        </div>
    );
}
