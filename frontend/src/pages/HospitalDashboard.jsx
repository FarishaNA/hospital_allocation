import { useState, useEffect } from 'react';
import { getActiveEmergency, getTracking } from '../services/api';
import { Activity, Bed, Clock, AlertCircle } from 'lucide-react';

// Hospital data (same as ambulance side for consistency)
const HOSPITAL_DATA = {
    id: 1,
    name: "Apollo Hospital Kottayam",
    beds: {
        icu_total: 20,
        icu_available: 3, // Will decrease when emergency arrives
        general_total: 150,
        general_available: 25
    }
};

export default function HospitalDashboard() {
    const [emergency, setEmergency] = useState(null);
    const [eta, setEta] = useState(null);
    const [beds, setBeds] = useState(HOSPITAL_DATA.beds);

    useEffect(() => {
        const pollEmergencies = async () => {
            try {
                const active = await getActiveEmergency();
                
                if (active) {
                    setEmergency(active);
                    
                    // Get ETA
                    try {
                        const tracking = await getTracking(active.id);
                        if (tracking) {
                            setEta(Math.ceil(tracking.eta_seconds / 60));
                        }
                    } catch (err) {
                        // Calculate ETA from start time
                        const elapsed = (Date.now() - new Date(active.start_time).getTime()) / 1000;
                        const remaining = Math.max(0, (active.total_time_min * 60) - elapsed);
                        setEta(Math.ceil(remaining / 60));
                    }

                    // Update bed count (simulate bed being reserved)
                    if (active.patient?.severity === 'critical') {
                        setBeds(prev => ({
                            ...prev,
                            icu_available: Math.max(0, HOSPITAL_DATA.beds.icu_available - 1)
                        }));
                    }
                } else {
                    setEmergency(null);
                    setEta(null);
                    setBeds(HOSPITAL_DATA.beds); // Reset beds
                }
            } catch (e) {
                console.error('Dashboard error:', e);
            }
        };

        pollEmergencies();
        const interval = setInterval(pollEmergencies, 2000);
        
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="h-screen flex flex-col bg-gray-50">
            
            {/* Header */}
            <div className="bg-white border-b px-6 py-4 shadow-sm">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{HOSPITAL_DATA.name}</h1>
                        <div className="text-sm text-gray-500">Emergency Department Dashboard</div>
                    </div>
                    <div className="text-right">
                        <div className="text-xs text-gray-500 font-semibold">Current Time</div>
                        <div className="text-lg font-mono font-bold text-gray-900">
                            {new Date().toLocaleTimeString()}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-6 overflow-y-auto">
                <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Bed Availability */}
                    <div className="bg-white rounded-xl shadow-lg border p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Bed size={20} className="text-blue-600" />
                            Bed Availability
                        </h2>
                        
                        <div className="space-y-4">
                            <div className={`p-4 rounded-lg border-2 ${
                                beds.icu_available < HOSPITAL_DATA.beds.icu_available 
                                    ? 'bg-amber-50 border-amber-300' 
                                    : 'bg-emerald-50 border-emerald-300'
                            }`}>
                                <div className="text-xs font-semibold text-gray-600 mb-1">ICU BEDS</div>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-bold text-gray-900">{beds.icu_available}</span>
                                    <span className="text-lg text-gray-500">/ {beds.icu_total}</span>
                                </div>
                                {beds.icu_available < HOSPITAL_DATA.beds.icu_available && (
                                    <div className="mt-2 text-xs text-amber-700 font-semibold">
                                        ⚠️ 1 bed reserved for incoming patient
                                    </div>
                                )}
                            </div>

                            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <div className="text-xs font-semibold text-gray-600 mb-1">GENERAL BEDS</div>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-bold text-gray-900">{beds.general_available}</span>
                                    <span className="text-lg text-gray-500">/ {beds.general_total}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Incoming Emergency */}
                    <div className="lg:col-span-2">
                        {emergency ? (
                            <div className="bg-red-50 rounded-xl shadow-lg border-2 border-red-300 p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-bold text-red-900 flex items-center gap-2">
                                        <AlertCircle size={20} className="animate-pulse" />
                                        INCOMING EMERGENCY
                                    </h2>
                                    <div className="bg-red-600 text-white px-4 py-2 rounded-lg">
                                        <div className="text-xs font-semibold">ETA</div>
                                        <div className="text-2xl font-mono font-bold">
                                            {eta || '--'} min
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    {/* Patient Info */}
                                    <div>
                                        <div className="text-sm font-semibold text-red-800 mb-3">Patient Condition</div>
                                        <div className="space-y-2">
                                            <div>
                                                <span className="text-xs text-gray-600">Condition:</span>
                                                <div className="text-lg font-bold text-gray-900 capitalize">
                                                    {emergency.patient?.condition?.replace('_', ' ')}
                                                </div>
                                            </div>
                                            <div>
                                                <span className="text-xs text-gray-600">Severity:</span>
                                                <div className="text-lg font-bold text-red-700 uppercase">
                                                    {emergency.patient?.severity}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Vitals */}
                                    {emergency.patient?.vitals && (
                                        <div>
                                            <div className="text-sm font-semibold text-red-800 mb-3">Live Vitals</div>
                                            <div className="grid grid-cols-3 gap-2">
                                                <div className="bg-white p-2 rounded">
                                                    <div className="text-xs text-gray-500">BP</div>
                                                    <div className="font-mono font-bold text-sm">{emergency.patient.vitals.bp}</div>
                                                </div>
                                                <div className="bg-white p-2 rounded">
                                                    <div className="text-xs text-gray-500">HR</div>
                                                    <div className="font-mono font-bold text-sm">{emergency.patient.vitals.hr}</div>
                                                </div>
                                                <div className="bg-white p-2 rounded">
                                                    <div className="text-xs text-gray-500">SpO2</div>
                                                    <div className="font-mono font-bold text-sm">{emergency.patient.vitals.spo2}%</div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Preparation Checklist */}
                                <div className="mt-6 pt-6 border-t border-red-200">
                                    <div className="text-sm font-semibold text-red-800 mb-3">Preparation Status</div>
                                    <div className="grid grid-cols-2 gap-2">
                                        {['ICU Bed Reserved', 'Trauma Team Notified', 'Equipment Ready', 'ER Cleared'].map((item, i) => (
                                            <div key={i} className="flex items-center gap-2 text-sm">
                                                <div className="w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center text-white text-xs">
                                                    ✓
                                                </div>
                                                <span className="text-gray-700">{item}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white rounded-xl shadow-lg border p-12 text-center">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Activity size={32} className="text-gray-400" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-400 mb-2">No Active Emergencies</h3>
                                <p className="text-sm text-gray-500">Monitoring for incoming ambulances...</p>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}