import { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Activity, Heart, Car, Brain, Stethoscope, Bone } from 'lucide-react';

const CONDITIONS = [
    { id: 'cardiac_arrest', label: 'CARDIAC ARREST', icon: Heart, color: 'bg-red-100 text-red-600' },
    { id: 'trauma', label: 'TRAUMA / ACCIDENT', icon: Car, color: 'bg-orange-100 text-orange-600' },
    { id: 'stroke', label: 'STROKE', icon: Brain, color: 'bg-purple-100 text-purple-600' },
    { id: 'respiratory', label: 'RESPIRATORY', icon: Activity, color: 'bg-blue-100 text-blue-600' },
    { id: 'fracture', label: 'FRACTURE', icon: Bone, color: 'bg-yellow-100 text-yellow-600' },
    { id: 'other', label: 'OTHER', icon: Stethoscope, color: 'bg-gray-100 text-gray-600' },
];

const SEVERITIES = [
    { id: 'critical', label: 'CRITICAL', desc: '(Life Threat)', color: 'bg-red-500 hover:bg-red-600 border-red-600' },
    { id: 'moderate', label: 'MODERATE', desc: '(Serious)', color: 'bg-yellow-500 hover:bg-yellow-600 border-yellow-600' },
    { id: 'stable', label: 'STABLE', desc: '(Controlled)', color: 'bg-green-500 hover:bg-green-600 border-green-600' },
];

export default function EmergencyInput({ onSubmit }) {
    const [condition, setCondition] = useState(null);
    const [severity, setSeverity] = useState(null);
    const [vitals, setVitals] = useState({ bp: '', hr: '', spo2: '' });

    const handleSubmit = () => {
        if (!condition || !severity) return;
        onSubmit({ condition, severity, vitals });
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8 flex items-center justify-center">
            <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">

                {/* Header */}
                <div className="bg-gray-900 text-white p-6 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="bg-red-600 p-2 rounded-lg">
                            <AlertCircle size={32} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">NEW EMERGENCY</h1>
                            <p className="text-gray-400 text-sm">HospitalBid Intelligent Allocation</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-xs text-gray-500 uppercase font-semibold">Location Auto-Detected</div>
                        <div className="text-lg font-medium text-green-400">📍 MG Road Junction, Kottayam</div>
                    </div>
                </div>

                <div className="p-6 md:p-8 space-y-8">

                    {/* Section 1: Condition */}
                    <section>
                        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <span className="bg-gray-200 text-gray-700 w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
                            Select Patient Condition
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {CONDITIONS.map((c) => {
                                const Icon = c.icon;
                                const isSelected = condition === c.id;
                                return (
                                    <motion.button
                                        key={c.id}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setCondition(c.id)}
                                        className={`p-6 rounded-xl border-2 flex flex-col items-center justify-center gap-3 transition-all h-32 md:h-40
                      ${isSelected
                                                ? 'border-blue-600 bg-blue-50 shadow-inner'
                                                : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                                            }`}
                                    >
                                        <Icon size={40} className={isSelected ? 'text-blue-600' : 'text-gray-500'} />
                                        <span className={`font-bold text-center ${isSelected ? 'text-blue-700' : 'text-gray-600'}`}>
                                            {c.label}
                                        </span>
                                    </motion.button>
                                );
                            })}
                        </div>
                    </section>

                    {/* Section 2: Severity */}
                    <section>
                        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <span className="bg-gray-200 text-gray-700 w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
                            Severity Level
                        </h2>
                        <div className="grid grid-cols-3 gap-4">
                            {SEVERITIES.map((s) => {
                                const isSelected = severity === s.id;
                                return (
                                    <motion.button
                                        key={s.id}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setSeverity(s.id)}
                                        className={`p-4 md:p-6 rounded-xl border-b-4 flex flex-col items-center justify-center gap-1 transition-all
                      ${isSelected ? 'ring-4 ring-offset-2 ring-blue-500 opacity-100' : 'opacity-60 hover:opacity-100'}
                      ${s.color} text-white border-black/20`}
                                    >
                                        <span className="text-lg md:text-2xl font-black tracking-wide">{s.label}</span>
                                        <span className="text-white/80 text-sm font-medium">{s.desc}</span>
                                    </motion.button>
                                );
                            })}
                        </div>
                    </section>

                    {/* Section 3: Vitals & Action */}
                    <div className="flex flex-col md:flex-row gap-8 items-end">
                        <div className="flex-1 w-full">
                            <h2 className="text-lg font-bold text-gray-800 mb-3 text-sm upppercase tracking-wider">Quick Vitals (Optional)</h2>
                            <div className="grid grid-cols-3 gap-3">
                                <div className="relative">
                                    <label className="text-xs font-semibold text-gray-500 mb-1 block">BP (mmHg)</label>
                                    <input
                                        type="text"
                                        placeholder="120/80"
                                        className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-mono text-lg"
                                        value={vitals.bp}
                                        onChange={(e) => setVitals({ ...vitals, bp: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 mb-1 block">HR (bpm)</label>
                                    <input
                                        type="number"
                                        placeholder="72"
                                        className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-lg"
                                        value={vitals.hr}
                                        onChange={(e) => setVitals({ ...vitals, hr: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 mb-1 block">SPO2 (%)</label>
                                    <input
                                        type="number"
                                        placeholder="98"
                                        className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-lg"
                                        value={vitals.spo2}
                                        onChange={(e) => setVitals({ ...vitals, spo2: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="w-full md:w-auto">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.95 }}
                                disabled={!condition || !severity}
                                onClick={handleSubmit}
                                className={`w-full md:w-80 p-5 rounded-xl font-black text-xl tracking-widest text-white shadow-xl flex items-center justify-center gap-3 transition-all
                  ${(!condition || !severity)
                                        ? 'bg-gray-300 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 animate-pulse-slow'
                                    }`}
                            >
                                <div className="bg-white/20 p-2 rounded-full">
                                    <AlertCircle size={24} />
                                </div>
                                FIND HOSPITAL NOW
                            </motion.button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
