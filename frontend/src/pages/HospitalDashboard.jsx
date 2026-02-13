import { useState, useEffect } from 'react';
import { useEmergency } from '../context/EmergencyContext';
import { getActiveEmergency, getTracking } from '../services/api';
import HospitalMap from '../components/hospital/HospitalMap';
import IncomingAlert from '../components/hospital/IncomingAlert';
import { Activity, ShieldCheck } from 'lucide-react';

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
                    try {
                        const tracking = await getTracking(active.id);
                        if (tracking) {
                            setAmbulancePos({ lat: tracking.lat, lon: tracking.lon });
                            setEta(Math.ceil(tracking.eta_seconds / 60));
                        }
                    } catch (err) {
                        console.warn("Tracking fetch failed", err);
                    }
                } else {
                    setEmergency(null);
                    setAmbulancePos(null);
                }
            } catch (e) {
                console.error("Dashboard poll error", e);
            }
        }, 2000); // Poll every 2s
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="h-screen w-screen flex bg-slate-50 overflow-hidden font-sans">

            {/* Sidebar - Alert Panel */}
            <div className="w-96 md:w-[450px] h-full shadow-2xl z-20 bg-white border-r border-slate-200">
                <IncomingAlert emergency={emergency} eta={eta} />
            </div>

            {/* Main Map Area */}
            <div className="flex-1 relative z-10">
                {/* Top Bar Overlay */}
                <div className="absolute top-0 left-0 right-0 bg-white/90 backdrop-blur-md p-4 shadow-sm z-[400] flex justify-between items-center px-8 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-600 p-2 rounded-lg text-white">
                            <ShieldCheck size={24} />
                        </div>
                        <div>
                            <h1 className="font-bold text-slate-800 text-lg leading-tight">Apollo Hospital Command Center</h1>
                            <div className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 uppercase tracking-wider">
                                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" /> System Online • Ready
                            </div>
                        </div>
                    </div>
                    <div className="text-sm font-medium text-slate-500 font-mono bg-slate-100 px-3 py-1 rounded">
                        {new Date().toLocaleTimeString()}
                    </div>
                </div>

                <HospitalMap ambulancePos={ambulancePos} hospitalPos={HOSPITAL_LOCATION} />
            </div>
        </div>
    );
}
