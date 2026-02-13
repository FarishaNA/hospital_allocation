import { useState, useEffect } from 'react';
import { useEmergency } from '../context/EmergencyContext';
import { getActiveEmergency, getTracking } from '../services/api';
import HospitalMap from '../components/hospital/HospitalMap';
import IncomingAlert from '../components/hospital/IncomingAlert';
// Need to fetch hospital location from somewhere, hardcoding for demo or fetch from API
const HOSPITAL_LOCATION = { lat: 9.9312, lon: 76.2673 }; // Apollo

export default function HospitalDashboard() {
    const [emergency, setEmergency] = useState(null);
    const [ambulancePos, setAmbulancePos] = useState(null);
    const [eta, setEta] = useState(null);

    useEffect(() => {
        // Poll for active emergencies assigned to this hospital
        const interval = setInterval(async () => {
            try {
                const active = await getActiveEmergency();
                // In real app, check if active.hospital_id === MY_ID
                if (active) {
                    setEmergency(active);

                    // Get live tracking for this emergency
                    const tracking = await getTracking(active.id);
                    setAmbulancePos({ lat: tracking.lat, lon: tracking.lon });
                    setEta(Math.ceil(tracking.eta_seconds / 60));
                } else {
                    setEmergency(null);
                    setAmbulancePos(null);
                }
            } catch (e) {
                console.error("Dashboard poll error", e);
            }
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="h-screen w-screen flex bg-gray-100 overflow-hidden">

            {/* Sidebar - Alert Panel */}
            <div className="w-96 md:w-[450px] h-full shadow-2xl z-20">
                <IncomingAlert emergency={emergency} eta={eta} />
            </div>

            {/* Main Map Area */}
            <div className="flex-1 relative z-10">
                {/* Top Bar Overlay */}
                <div className="absolute top-0 left-0 right-0 bg-white/90 backdrop-blur-md p-4 shadow-sm z-[400] flex justify-between items-center px-8 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                            H
                        </div>
                        <div>
                            <h1 className="font-bold text-gray-800 text-lg">Apollo Hospital Command Center</h1>
                            <div className="text-xs text-green-600 font-bold flex items-center gap-1">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> SYSTEM ONLINE
                            </div>
                        </div>
                    </div>
                    <div className="text-sm font-medium text-gray-500">
                        {new Date().toLocaleDateString()}
                    </div>
                </div>

                <HospitalMap ambulancePos={ambulancePos} hospitalPos={HOSPITALS_LOCATION} />
            </div>
        </div>
    );
}

// Simple fix for undefined var in quick code
const HOSPITALS_LOCATION = { lat: 9.9312, lon: 76.2673 };
