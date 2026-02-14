import { useState, useEffect } from 'react';
import { Heart, Car, Brain, Activity, Bone, Stethoscope, MapPin } from 'lucide-react';

const CONDITIONS = [
    { id: 'cardiac_arrest', label: 'Cardiac Arrest', icon: Heart },
    { id: 'trauma', label: 'Trauma', icon: Car },
    { id: 'stroke', label: 'Stroke', icon: Brain },
    { id: 'respiratory', label: 'Respiratory', icon: Activity },
    { id: 'fracture', label: 'Fracture', icon: Bone },
    { id: 'other', label: 'Other', icon: Stethoscope },
];

const SEVERITIES = [
    { id: 'critical', label: 'CRITICAL', color: 'bg-red-100 border-red-300 text-red-800 hover:bg-red-200' },
    { id: 'moderate', label: 'MODERATE', color: 'bg-amber-100 border-amber-300 text-amber-800 hover:bg-amber-200' },
    { id: 'stable', label: 'STABLE', color: 'bg-emerald-100 border-emerald-300 text-emerald-800 hover:bg-emerald-200' },
];

export default function EmergencyInput({ onSubmit, locationName }) {
    const [condition, setCondition] = useState(null);
    const [severity, setSeverity] = useState(null);
    const [vitals, setVitals] = useState({ bp: '', hr: '', spo2: '' });
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const generateVitalsFromSensors = (severity) => {
        const severityMap = {
            critical: { bpRange: [80, 100], hrRange: [120, 160], spo2Range: [75, 88] },
            moderate: { bpRange: [100, 120], hrRange: [90, 120], spo2Range: [88, 94] },
            stable: { bpRange: [110, 130], hrRange: [70, 90], spo2Range: [95, 99] }
        };

        const ranges = severityMap[severity] || severityMap.stable;
        const bp1 = Math.floor(Math.random() * (ranges.bpRange[1] - ranges.bpRange[0]) + ranges.bpRange[0]);
        const bp2 = Math.floor(bp1 * 0.6);
        const hr = Math.floor(Math.random() * (ranges.hrRange[1] - ranges.hrRange[0]) + ranges.hrRange[0]);
        const spo2 = Math.floor(Math.random() * (ranges.spo2Range[1] - ranges.spo2Range[0]) + ranges.spo2Range[0]);

        return { bp: `${bp1}/${bp2}`, hr: hr, spo2: spo2 };
    };

    const handleSubmit = () => {
        if (!condition || !severity) return;

        const autoVitals = generateVitalsFromSensors(severity);
        const finalVitals = {
            bp: vitals.bp || autoVitals.bp,
            hr: vitals.hr || String(autoVitals.hr),
            spo2: vitals.spo2 || String(autoVitals.spo2)
        };

        onSubmit({ condition, severity, vitals: finalVitals });
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="bg-blue-600 text-white p-2 rounded-lg">
                        <Activity size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">HospitalBid EMS</h1>
                        <p className="text-xs text-gray-500">Emergency Dispatch System</p>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="text-right hidden md:block">
                        <div className="text-xs text-gray-400 font-semibold">Location</div>
                        <div className="flex items-center gap-1 text-sm font-semibold text-gray-700">
                            <MapPin size={14} className="text-blue-600" />
                            {locationName || "Unknown"}
                        </div>
                    </div>
                    <div className="font-mono text-lg font-bold text-gray-600">
                        {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto p-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Left: Assessment */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-4">Primary Condition</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {CONDITIONS.map((c) => {
                                    const Icon = c.icon;
                                    const isSelected = condition === c.id;
                                    return (
                                        <button
                                            key={c.id}
                                            onClick={() => setCondition(c.id)}
                                            className={`flex items-center gap-3 p-3 rounded-lg border transition-all
                                                ${isSelected 
                                                    ? 'border-blue-500 bg-blue-50 text-blue-900 shadow-sm' 
                                                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                                                }`}
                                        >
                                            <Icon size={20} className={isSelected ? 'text-blue-600' : 'text-gray-400'} />
                                            <span className="text-sm font-semibold">{c.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-4">Severity Level</h3>
                            <div className="grid grid-cols-3 gap-3">
                                {SEVERITIES.map((s) => {
                                    const isSelected = severity === s.id;
                                    return (
                                        <button
                                            key={s.id}
                                            onClick={() => setSeverity(s.id)}
                                            className={`p-4 rounded-lg border-2 transition-all text-center font-semibold
                                                ${isSelected ? s.color + ' shadow-md' : 'border-gray-200 hover:border-gray-300 text-gray-500'}`}
                                        >
                                            {s.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Right: Vitals & Submit */}
                    <div className="flex flex-col gap-6">
                        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex-1">
                            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-4 flex items-center gap-2">
                                <Activity size={18} /> Vital Signs
                            </h3>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 text-xs text-blue-700">
                                💡 Vitals auto-generated from severity. Manual entry optional.
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Blood Pressure</label>
                                    <input
                                        type="text"
                                        placeholder="120/80"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-md p-3 text-lg font-mono focus:border-blue-500 outline-none"
                                        value={vitals.bp}
                                        onChange={(e) => setVitals({ ...vitals, bp: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Heart Rate</label>
                                        <input
                                            type="number"
                                            placeholder="--"
                                            className="w-full bg-gray-50 border border-gray-200 rounded-md p-3 text-lg font-mono focus:border-blue-500 outline-none"
                                            value={vitals.hr}
                                            onChange={(e) => setVitals({ ...vitals, hr: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">SPO2 (%)</label>
                                        <input
                                            type="number"
                                            placeholder="--"
                                            className="w-full bg-gray-50 border border-gray-200 rounded-md p-3 text-lg font-mono focus:border-blue-500 outline-none"
                                            value={vitals.spo2}
                                            onChange={(e) => setVitals({ ...vitals, spo2: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            disabled={!condition || !severity}
                            onClick={handleSubmit}
                            className={`w-full py-5 rounded-lg font-bold text-lg shadow-lg flex items-center justify-center gap-3 transition-all
                                ${(!condition || !severity)
                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                                }`}
                        >
                            FIND OPTIMAL HOSPITAL
                            <MapPin size={20} />
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}