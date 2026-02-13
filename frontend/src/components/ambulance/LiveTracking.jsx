import { useState, useEffect } from 'react';
import { useEmergency, getTracking } from '../../context/EmergencyContext';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Navigation, Clock, Activity, MapPin } from 'lucide-react';
import L from 'leaflet';

// Icons need to be properly imported or defined
const ambulanceIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/2893/2893049.png',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
});

const destIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
    iconSize: [30, 30],
    iconAnchor: [15, 30],
});

export default function LiveTracking() {
    const { activeEmergency } = useEmergency();
    const [trackingData, setTrackingData] = useState(null);

    useEffect(() => {
        if (!activeEmergency) return;

        const interval = setInterval(async () => {
            try {
                // In a real app, we'd fetch from API
                // const data = await getTracking(activeEmergency.id);

                // For demo visual smoothness, we might interpolate locally
                // But here we'll just poll as per plan
                // mock for now if backend not ready, but we have backend
            } catch (e) {
                console.error("Tracking error", e);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [activeEmergency]);

    // Placeholder for the main implementation which will be in the Page component
    // This component will likely just be the map view part
    return (
        <div className="h-full w-full flex flex-col">
            {/* Map View */}
            <div className="flex-1 bg-gray-200 relative">
                <div className="absolute top-4 left-4 z-[400] bg-white p-4 rounded-xl shadow-lg border border-gray-200">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                            <Navigation size={24} />
                        </div>
                        <div>
                            <div className="text-xs text-gray-500 font-bold uppercase">Destination</div>
                            <div className="font-bold text-gray-900">{activeEmergency?.hospital_name || "Hospital"}</div>
                        </div>
                    </div>
                    <div className="flex gap-4 text-sm">
                        <div>
                            <span className="block text-gray-500 text-xs">ETA</span>
                            <span className="font-mono font-bold text-lg">8 min</span>
                        </div>
                        <div>
                            <span className="block text-gray-500 text-xs">DIST</span>
                            <span className="font-mono font-bold text-lg">3.2 km</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Control Bar */}
            <div className="bg-white p-4 border-t border-gray-200 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <div className="text-3xl font-black text-gray-800">45 <span className="text-sm text-gray-500 font-normal">km/h</span></div>
                    <div className="h-8 w-px bg-gray-300"></div>
                    <div className="text-green-600 font-bold flex items-center gap-2">
                        <Activity size={18} className="animate-pulse" /> LIVE TRACKING ACTIVE
                    </div>
                </div>
                <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-bold">
                    CRITICAL ALERT
                </button>
            </div>
        </div>
    );
}
