import { useState, useEffect } from 'react';
import { useEmergency } from '../context/EmergencyContext';
import { matchHospital, createEmergency, getTracking } from '../services/api';
import EmergencyInput from '../components/ambulance/EmergencyInput';
import AIProcessing from '../components/ambulance/AIProcessing';
import HospitalResult from '../components/ambulance/HospitalResult';
import { RefreshCcw, Navigation, Activity, Map, Zap, Siren, MapPin, Gauge } from 'lucide-react';

// Using components we just built
import MapComponent from '../components/shared/Map';
import AnimatedRoute from '../components/shared/AnimatedRoute';

// Mock locations for demo flexibility
const PRESET_LOCATIONS = [
    { name: "Kottayam City (Traffic)", lat: 9.9312, lon: 76.2673 },
    { name: "Kumarakom (Remote)", lat: 9.6175, lon: 76.4300 },
    { name: "Ettumanoor (Highway)", lat: 9.6667, lon: 76.5667 },
    { name: "Changanassery (Suburb)", lat: 9.4443, lon: 76.5356 }
];

export default function AmbulanceApp() {
    const { activeEmergency, setActiveEmergency, selectedHospital, setSelectedHospital, ambulanceLocation, setAmbulanceLocation, resetEmergency } = useEmergency();

    // State for current simulation location
    const [currentLocation, setCurrentLocation] = useState(PRESET_LOCATIONS[0]);

    const [view, setView] = useState('input'); // input, processing, result, tracking
    const [matchResult, setMatchResult] = useState(null);
    const [emergencyData, setEmergencyData] = useState(null);
    const [route, setRoute] = useState([]); // Array of waypoints (fallback)
    const [polyline, setPolyline] = useState(null); // Encoded polyline string
    const [trackingInfo, setTrackingInfo] = useState({ speed: 0, eta: 0, distance: 0 });

    // Handle Input Submit -> Start AI
    const handleInputSubmit = async (data) => {
        setEmergencyData(data);
        setView('processing');

        // Simulate API delay slightly inside processing view, but fetch now
        try {
            const result = await matchHospital({
                condition: data.condition,
                severity: data.severity,
                location: currentLocation,
                vitals: data.vitals
            });
            setMatchResult(result);
        } catch (err) {
            // Fallback for demo if backend offline or keys missing
            console.error("API Error, using mock:", err);
            setTimeout(() => {
                setMatchResult({
                    selected: {
                        hospital: { id: 1, name: "Apollo Hospital (Mock)", lat: 9.9312, lon: 76.2673, address: "Kottayam Bypass Rd", beds: { icu_available: 2 } },
                        distance_km: 3.2,
                        estimated_time_min: 8,
                        score: 0.95,
                        selection_reason: "Trauma Surgeon Available, ICU Bed Open, Fastest Route",
                        polyline: null
                    },
                    alternatives: []
                });
            }, 3000);
        }
    };

    // AI Animation Complete -> Show Result
    const handleAIComplete = () => {
        if (matchResult) {
            setView('result');
        }
    };

    // Confirm Hospital -> Create Emergency -> Start Tracking
    const handleConfirmHospital = async (hospital) => {
        console.log("handleConfirmHospital Initiated:", hospital);

        // Define fallback immediately so it's available in catch block
        const fallbackId = "sim-" + Date.now();
        const fallbackEmergency = {
            id: fallbackId,
            hospital_name: hospital.hospital.name,
            status: 'en_route',
            total_time_min: hospital.estimated_time_min || 10,
            route: [currentLocation, { lat: hospital.hospital.lat, lon: hospital.hospital.lon }]
        };

        try {
            // 1. Backend Create Call
            const emergency = await createEmergency({
                hospital_id: hospital.hospital.id,
                patient: emergencyData,
                current_location: currentLocation,
            });

            console.log("Emergency Created Success:", emergency);
            setActiveEmergency(emergency);
            setSelectedHospital(hospital);
            setRoute(emergency.route || fallbackEmergency.route);
            setPolyline(hospital.polyline);
            setView('tracking');

        } catch (err) {
            console.warn("Backend Create Failed - SWITCHING TO SIMULATION MODE", err);

            // FORCE SIMULATION MODE
            setActiveEmergency(fallbackEmergency);
            setSelectedHospital(hospital);
            setRoute(fallbackEmergency.route);
            setPolyline(hospital.polyline); // Might still be null, but handled by AnimatedRoute

            // Mock tracking loop will pick this up
            setView('tracking');
        }
    };

    // Poll Tracking Data
    useEffect(() => {
        if (view === 'tracking' && activeEmergency) {
            const interval = setInterval(async () => {
                try {
                    const data = await getTracking(activeEmergency.id);
                    setTrackingInfo({
                        speed: data.speed_kmh,
                        eta: data.eta_seconds,
                        distance: data.distance_remaining_km
                    });
                    setAmbulanceLocation({ lat: data.lat, lon: data.lon });
                } catch (e) {
                    // Mock data if backend fails
                    setTrackingInfo(prev => ({
                        speed: 45 + Math.random() * 5,
                        eta: Math.max(0, prev.eta - 1),
                        distance: prev.distance
                    }));
                }
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [view, activeEmergency]);


    // Render Views
    if (view === 'input') return (
        <div className="relative">
            {/* Simulation Control - Hidden in production or styled discreetly */}
            <div className="fixed bottom-4 right-4 z-[9999] bg-slate-900 text-white p-2 rounded-lg text-xs opacity-50 hover:opacity-100 transition-opacity flex flex-col gap-2 shadow-xl border border-slate-700">
                <div className="font-bold uppercase tracking-widest text-[10px] text-slate-400">Simulation Config</div>
                <select
                    value={currentLocation.name}
                    onChange={(e) => setCurrentLocation(PRESET_LOCATIONS.find(l => l.name === e.target.value))}
                    className="bg-slate-800 border border-slate-700 rounded p-1 cursor-pointer hover:bg-slate-700"
                >
                    {PRESET_LOCATIONS.map(l => (
                        <option key={l.name} value={l.name}>{l.name}</option>
                    ))}
                </select>
            </div>
            <EmergencyInput onSubmit={handleInputSubmit} locationName={currentLocation.name} />
        </div>
    );

    if (view === 'processing') return <AIProcessing onComplete={handleAIComplete} />;

    if (view === 'result') return <HospitalResult result={matchResult} onConfirm={handleConfirmHospital} onCancel={() => setView('input')} />;

    if (view === 'tracking') return (
        <div className="h-screen w-screen flex flex-col bg-slate-100 font-sans">

            {/* Top Nav HUD */}
            <div className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center shadow-sm relative z-10">
                <div className="flex items-center gap-4">
                    <div className="bg-red-600 text-white p-2 rounded animate-pulse">
                        <Siren size={24} />
                    </div>
                    <div>
                        <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Priority Transport</div>
                        <h1 className="text-xl font-bold text-slate-900 leading-none">{activeEmergency?.hospital_name || "Unknown Hospital"}</h1>
                    </div>
                </div>
                <div className="flex gap-6 text-right">
                    <div>
                        <div className="text-xs font-bold text-slate-400 uppercase">ETA</div>
                        <div className="text-2xl font-black text-slate-800 font-mono">
                            {trackingInfo?.eta ? Math.floor(trackingInfo.eta / 60) : '--'}:
                            {trackingInfo?.eta ? (trackingInfo.eta % 60).toString().padStart(2, '0') : '--'}
                        </div>
                    </div>
                    <div>
                        <div className="text-xs font-bold text-slate-400 uppercase">Distance</div>
                        <div className="text-2xl font-black text-slate-800 font-mono">{trackingInfo.distance} <span className="text-sm text-slate-500">km</span></div>
                    </div>
                </div>
            </div>

            {/* Map Layer */}
            <div className="flex-1 relative z-0">
                <MapComponent center={[currentLocation.lat, currentLocation.lon]} zoom={14}>
                    <AnimatedRoute
                        route={route}
                        polylineString={polyline}
                        ambulancePosition={ambulanceLocation}
                    />
                </MapComponent>

                {/* On-Map Stats */}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur border border-slate-200 p-4 rounded-xl shadow-lg z-[400]">
                    <div className="flex items-center gap-3 mb-2">
                        <Gauge size={18} className="text-slate-500" />
                        <span className="text-sm font-bold text-slate-700">Telemetry</span>
                    </div>
                    <div className="flex items-end gap-1">
                        <span className="text-4xl font-mono font-black text-blue-600">{Math.round(trackingInfo.speed)}</span>
                        <span className="text-xs font-bold text-slate-400 mb-1">km/h</span>
                    </div>
                </div>
            </div>

            {/* Bottom Dashboard HUD */}
            <div className="bg-white border-t border-slate-200 p-4 px-6 flex items-center justify-between shadow-[0_-5px_20px_rgba(0,0,0,0.05)] relative z-10">

                <div className="flex items-center gap-6">
                    {/* Patient Status */}
                    <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 rounded-lg px-4 py-2">
                        <div className="relative">
                            <span className="absolute -right-0.5 -top-0.5 w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
                            <Activity size={24} className="text-emerald-600" />
                        </div>
                        <div>
                            <div className="text-xs font-bold text-emerald-800 uppercase">Vitals Monitor</div>
                            <div className="text-sm font-semibold text-emerald-700">Stable • Transmitting</div>
                        </div>
                    </div>

                    <div className="h-8 w-px bg-slate-200"></div>

                    <div className="text-xs text-slate-500">
                        <span className="font-bold">Protocol:</span> A-34 (Rapid Transport) <br />
                        <span className="font-bold">Unit:</span> ALS-04
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button className="hidden md:flex bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-3 rounded-lg font-bold text-xs uppercase items-center gap-2 transition-all">
                        Broadcast Status
                    </button>
                    <button
                        onClick={() => { resetEmergency(); setView('input'); }}
                        className="bg-slate-800 hover:bg-slate-700 py-3 px-4 rounded-lg text-white font-bold text-xs uppercase flex items-center gap-2 transition-all"
                    >
                        <RefreshCcw size={16} /> New Job
                    </button>
                </div>
            </div>
        </div>
    );
}
