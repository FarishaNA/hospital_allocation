import { useState, useEffect } from 'react';
import { useEmergency } from '../context/EmergencyContext';
import { matchHospital, createEmergency, getTracking } from '../services/api';
import EmergencyInput from '../components/ambulance/EmergencyInput';
import AIProcessing from '../components/ambulance/AIProcessing';
import HospitalResult from '../components/ambulance/HospitalResult';
import { RefreshCcw } from 'lucide-react';

// Using components we just built
import Map from '../components/shared/Map';
import AnimatedRoute from '../components/shared/AnimatedRoute';
import { Navigation, Clock, Activity } from 'lucide-react';

// Mock current location for demo (Kottayam)
const CURRENT_LOCATION = { lat: 9.9400, lon: 76.2700 };

export default function AmbulanceApp() {
    const { activeEmergency, setActiveEmergency, selectedHospital, setSelectedHospital, ambulanceLocation, setAmbulanceLocation, resetEmergency } = useEmergency();

    const [view, setView] = useState('input'); // input, processing, result, tracking
    const [matchResult, setMatchResult] = useState(null);
    const [emergencyData, setEmergencyData] = useState(null);
    const [route, setRoute] = useState([]);
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
                location: CURRENT_LOCATION
            });
            setMatchResult(result);
        } catch (err) {
            console.error(err);
            setView('input'); // Error handling
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
        try {
            const emergency = await createEmergency({
                hospital_id: hospital.hospital.id,
                patient: emergencyData,
                current_location: CURRENT_LOCATION
            });

            setActiveEmergency(emergency);
            setSelectedHospital(hospital);
            setRoute(emergency.route); // Should return route waypoints
            setView('tracking');
        } catch (err) {
            console.error(err);
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

                    if (data.status === 'arrived') {
                        // Handle arrival logic if needed
                    }
                } catch (e) {
                    console.error("Tracking poll error", e);
                }
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [view, activeEmergency]);


    // Render Views
    if (view === 'input') return <EmergencyInput onSubmit={handleInputSubmit} />;
    if (view === 'processing') return <AIProcessing onComplete={handleAIComplete} />;
    if (view === 'result') return <HospitalResult result={matchResult} onConfirm={handleConfirmHospital} onCancel={() => setView('input')} />;

    if (view === 'tracking') return (
        <div className="h-screen w-screen flex flex-col">
            {/* Map Layer */}
            <div className="flex-1 relative z-0">
                <Map center={[CURRENT_LOCATION.lat, CURRENT_LOCATION.lon]} zoom={14}>
                    <AnimatedRoute route={route} ambulancePosition={ambulanceLocation} />
                </Map>

                {/* Navigation Overlay */}
                <div className="absolute top-4 left-4 right-4 z-[500]">
                    <div className="bg-white rounded-xl shadow-xl p-4 flex justify-between items-center border-l-8 border-green-500">
                        <div>
                            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Navigating To</div>
                            <div className="text-xl font-black text-gray-800">{activeEmergency.hospital_name}</div>
                        </div>
                        <div className="text-right">
                            <div className="text-3xl font-mono font-black text-green-600">
                                {Math.floor(trackingInfo.eta / 60)}<span className="text-sm text-gray-400">min</span>
                                {trackingInfo.eta % 60}<span className="text-sm text-gray-400">s</span>
                            </div>
                            <div className="text-sm font-bold text-gray-500">{trackingInfo.distance} km remaining</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Dashboard */}
            <div className="h-24 bg-gray-900 text-white flex items-center px-6 justify-between shadow-2xl relative z-20">
                <div className="flex items-center gap-6">
                    <div className="text-center">
                        <div className="text-xs text-gray-400 uppercase font-bold">Current Speed</div>
                        <div className="text-3xl font-black font-mono">{Math.round(trackingInfo.speed)} <span className="text-sm text-gray-500">km/h</span></div>
                    </div>
                    <div className="h-10 w-px bg-gray-700"></div>
                    <div className="flex items-center gap-3">
                        <div className="bg-green-500/20 p-2 rounded-full text-green-400 animate-pulse">
                            <Activity size={24} />
                        </div>
                        <div>
                            <div className="font-bold text-green-400">PATIENT STABLE</div>
                            <div className="text-xs text-gray-500">Vitals Monitoring Active</div>
                        </div>
                    </div>
                </div>

                <button
                    onClick={() => { resetEmergency(); setView('input'); }}
                    className="bg-gray-800 hover:bg-gray-700 p-3 rounded-lg text-gray-400 hover:text-white transition-colors"
                >
                    <RefreshCcw size={20} />
                </button>
            </div>
        </div>
    );
}
