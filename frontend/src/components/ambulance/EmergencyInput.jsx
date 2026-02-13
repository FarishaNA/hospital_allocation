import { useState, useEffect } from 'react';
import { AlertCircle, Activity, Heart, Car, Brain, Stethoscope, Bone, MapPin, Check, Mic, Wand2, Loader2 } from 'lucide-react';
import { aiTriage } from '../../services/api';

const CONDITIONS = [
    { id: 'cardiac_arrest', label: 'Cardiac Arrest', icon: Heart },
    { id: 'trauma', label: 'Trauma / Accident', icon: Car },
    { id: 'stroke', label: 'Stroke (CVA)', icon: Brain },
    { id: 'respiratory', label: 'Respiratory Failure', icon: Activity },
    { id: 'fracture', label: 'Severe Fracture', icon: Bone },
    { id: 'other', label: 'Other / General', icon: Stethoscope },
];

const SEVERITIES = [
    { id: 'critical', label: 'CRITICAL', desc: 'Immediate Threat', color: 'bg-red-600 text-white', border: 'border-red-700' },
    { id: 'moderate', label: 'MODERATE', desc: 'Urgent Intervention', color: 'bg-amber-500 text-white', border: 'border-amber-600' },
    { id: 'stable', label: 'STABLE', desc: 'Routine Transport', color: 'bg-emerald-600 text-white', border: 'border-emerald-700' },
];

export default function EmergencyInput({ onSubmit, locationName }) {
    const [condition, setCondition] = useState(null);
    const [severity, setSeverity] = useState(null);
    const [vitals, setVitals] = useState({ bp: '', hr: '', spo2: '' });
    const [description, setDescription] = useState('');
    const [isanalyzing, setIsAnalyzing] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const handleAnalyze = async () => {
        if (!description.trim()) return;
        setIsAnalyzing(true);
        try {
            const result = await aiTriage(description);
            if (result) {
                if (result.condition) setCondition(result.condition.toLowerCase().replace(' ', '_')); // naive check
                // Better mapping
                const foundCond = CONDITIONS.find(c => c.id === result.condition || result.condition.includes(c.id));
                if (foundCond) setCondition(foundCond.id);

                if (result.severity) setSeverity(result.severity.toLowerCase());
            }
        } catch (error) {
            console.error("Triage failed", error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleSubmit = () => {
        if (!condition || !severity) return;
        onSubmit({ condition, severity, vitals });
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100">

            {/* Clinical Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-50 px-6 py-4 shadow-sm flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="bg-blue-700 text-white p-2 rounded-md">
                        <Activity size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-800 leading-none">HospitalBid</h1>
                        <p className="text-xs text-slate-500 font-medium">EMS Dispatch Interface</p>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="text-right hidden md:block">
                        <div className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Location</div>
                        <div className="flex items-center gap-1 text-sm font-semibold text-slate-700">
                            <MapPin size={14} className="text-blue-600" />
                            {locationName || "Unknown Location"}
                        </div>
                    </div>
                    <div className="h-8 w-px bg-slate-200 hidden md:block"></div>
                    <div className="font-mono text-lg font-bold text-slate-600">
                        {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Left Column: AI Triage & Assessment */}
                <div className="lg:col-span-8 space-y-6">

                    {/* AI Intake */}
                    <section className="bg-white p-6 rounded-xl border border-blue-100 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                        <h3 className="text-sm font-bold text-blue-800 uppercase tracking-wide mb-4 flex items-center gap-2">
                            <Wand2 size={18} />
                            Ai Assisted Triage
                        </h3>
                        <div className="flex gap-4">
                            <textarea
                                className="flex-1 bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                rows={3}
                                placeholder="Describe patient status (e.g. 'Male 55 detected high HR 140, complaining of chest pressure')..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                            <button
                                onClick={handleAnalyze}
                                disabled={isanalyzing || !description}
                                className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white px-6 rounded-lg font-bold text-sm flex flex-col items-center justify-center gap-1 transition-all min-w-[100px]"
                            >
                                {isanalyzing ? (
                                    <>
                                        <Loader2 size={20} className="animate-spin" />
                                        Analyzing
                                    </>
                                ) : (
                                    <>
                                        <Wand2 size={20} />
                                        Auto-Detect
                                    </>
                                )}
                            </button>
                        </div>
                    </section>

                    {/* Manual / Verified Input */}
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-6">Clinical Assessment</h3>

                        <div className="space-y-6">
                            <div>
                                <label className="text-xs font-semibold text-slate-400 uppercase mb-2 block">Primary Condition</label>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {CONDITIONS.map((c) => {
                                        const Icon = c.icon;
                                        const isSelected = condition === c.id;
                                        return (
                                            <button
                                                key={c.id}
                                                onClick={() => setCondition(c.id)}
                                                className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-all
                                    ${isSelected ? 'border-blue-500 bg-blue-50 text-blue-900 shadow-sm ring-1 ring-blue-500' : 'border-slate-200 hover:border-slate-300 text-slate-600'}
                                `}
                                            >
                                                <Icon size={20} className={isSelected ? 'text-blue-600' : 'text-slate-400'} />
                                                <span className="text-sm font-semibold">{c.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-slate-400 uppercase mb-2 block">Severity Index</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {SEVERITIES.map((s) => {
                                        const isSelected = severity === s.id;
                                        return (
                                            <button
                                                key={s.id}
                                                onClick={() => setSeverity(s.id)}
                                                className={`p-3 rounded-lg border transition-all text-center
                                    ${isSelected ? `${s.color} border-transparent shadow-md` : 'border-slate-200 hover:border-slate-300 text-slate-500'}
                                `}
                                            >
                                                <div className="font-bold text-sm uppercase">{s.label}</div>
                                                <div className={`text-[10px] ${isSelected ? 'text-white/80' : 'text-slate-400'}`}>{s.desc}</div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Right Column: Vitals */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex-1">
                        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-6 flex items-center gap-2">
                            <Activity size={18} /> Vital Signs
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">Blood Pressure</label>
                                <input
                                    type="text"
                                    placeholder="120/80"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-md p-3 font-mono text-xl text-slate-900 focus:border-blue-500 outline-none"
                                    value={vitals.bp}
                                    onChange={(e) => setVitals({ ...vitals, bp: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">Heart Rate</label>
                                    <input
                                        type="number"
                                        placeholder="--"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-md p-3 font-mono text-xl text-slate-900 focus:border-blue-500 outline-none"
                                        value={vitals.hr}
                                        onChange={(e) => setVitals({ ...vitals, hr: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">SPO2 (%)</label>
                                    <input
                                        type="number"
                                        placeholder="--"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-md p-3 font-mono text-xl text-slate-900 focus:border-blue-500 outline-none"
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
                        className={`w-full py-5 rounded-xl font-bold text-lg shadow-xl flex items-center justify-center gap-3 transition-all
                ${(!condition || !severity)
                                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-900/20'}
              `}
                    >
                        FIND HOSPITAL
                        <MapPin size={20} />
                    </button>
                </div>

            </main>
        </div>
    );
}
