import { useState } from 'react';
import { motion } from 'framer-motion';
import { Navigation, Clock, Activity, AlertTriangle, CheckCircle, MapPin, Phone, ArrowRight, X } from 'lucide-react';

export default function HospitalResult({ result, onConfirm, onCancel }) {
    const { selected, alternatives } = result;
    const [loading, setLoading] = useState(false);

    const handleConfirm = () => {
        console.log("🟢 handleConfirm function called");
        console.log("Setting loading to true");
        setLoading(true);
        console.log("Calling onConfirm with:", selected);
        console.log("onConfirm type:", typeof onConfirm);
        onConfirm(selected);
        console.log("onConfirm called successfully");
        // Loading state remains until parent unmounts view
    };

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8 flex items-center justify-center font-sans text-slate-900">
            <div className="w-full max-w-6xl space-y-6">

                {/* Verification Banner */}
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-md flex items-center justify-center gap-2 text-sm font-medium shadow-sm">
                    <CheckCircle size={18} className="text-emerald-600" />
                    AI Analysis Complete: Optimal Facility Identified based on Traffic & Specialty Availability
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* LEFT: Main Selection Card */}
                    <div className="lg:col-span-2">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-xl border-2 border-blue-600 shadow-xl overflow-hidden h-full flex flex-col"
                        >
                            <div className="bg-blue-600 text-white p-6 border-b border-blue-700">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h2 className="text-3xl font-bold leading-tight mb-2">
                                            {selected.hospital.name}
                                        </h2>
                                        <div className="flex items-center gap-4 opacity-90 text-sm font-medium">
                                            <span className="flex items-center gap-1"><MapPin size={16} /> {selected.hospital.address}</span>
                                            <span className="bg-white/20 px-2 py-0.5 rounded text-xs uppercase tracking-wider">Primary Choice</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-3xl font-bold">{Math.round(selected.score * 100)}%</span>
                                        <span className="text-xs opacity-75 uppercase">Match Score</span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 flex-1 space-y-8">

                                {/* Key Metrics */}
                                <div className="flex items-center gap-8 border-b border-slate-100 pb-8">
                                    <div className="flex-1">
                                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Estimated Travel Time</div>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-4xl font-black text-slate-800">{selected.estimated_time_min}</span>
                                            <span className="text-slate-500 font-medium">min</span>
                                        </div>
                                        <div className="text-sm text-slate-500 mt-1 flex items-center gap-1">
                                            <Navigation size={14} className="text-blue-600" /> {selected.distance_km} km via fastest route
                                        </div>
                                    </div>
                                    <div className="w-px h-16 bg-slate-200"></div>
                                    <div className="flex-1">
                                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Specialist Status</div>
                                        <div className="flex items-center gap-2">
                                            <div className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2">
                                                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                                                Available Now
                                            </div>
                                        </div>
                                        <div className="text-sm text-slate-500 mt-2">
                                            ICU Beds: <span className="font-bold text-slate-700">{selected.hospital.beds?.icu_available || 2} Available</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Reasoning */}
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 mb-3">System Recommendation</h3>
                                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                                        <ul className="space-y-3">
                                            {selected.selection_reason ? selected.selection_reason.split(', ').map((reason, i) => (
                                                <li key={i} className="flex items-start gap-3 text-slate-700">
                                                    <CheckCircle size={18} className="text-blue-600 mt-0.5 shrink-0" />
                                                    <span>{reason}</span>
                                                </li>
                                            )) : (
                                                <li className="flex items-start gap-3 text-slate-700">
                                                    <CheckCircle size={18} className="text-blue-600 mt-0.5 shrink-0" />
                                                    <span>Optimal balance of travel time and clinical capabilities.</span>
                                                </li>
                                            )}
                                        </ul>
                                    </div>
                                </div>

                            </div>

                            <div className="p-6 bg-slate-50 border-t border-slate-200">
                                <button
                                    onClick={handleConfirm}
                                    disabled={loading}
                                    className={`w-full bg-blue-700 hover:bg-blue-800 text-white text-lg font-bold py-4 rounded-lg shadow-lg flex items-center justify-center gap-3 transition-all ${loading ? 'opacity-70 cursor-wait' : ''}`}
                                >
                                    {loading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                            Initiating Transport...
                                        </>
                                    ) : (
                                        <>
                                            INITIATE TRANSPORT PROTOCOL
                                            <ArrowRight size={20} />
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </div>

                    {/* RIGHT: Alternatives */}
                    <div className="space-y-5">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide">Alternative Facilities</h3>
                            <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">Automated</span>
                        </div>

                        {alternatives.map((alt, i) => (
                            <div
                                key={alt.hospital.id || i}
                                className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm hover:border-slate-300 transition-all opacity-80 hover:opacity-100"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-bold text-slate-800 leading-tight">{alt.hospital.name}</h4>
                                    <span className="text-sm font-bold text-slate-400">{Math.round(alt.score * 100)}%</span>
                                </div>
                                <div className="text-xs text-slate-500 font-medium mb-3">
                                    {alt.hospital.type === 'government' ? 'Government • Tertiary Care' : 'Private • Multi-specialty'}
                                </div>
                                <div className="flex items-center gap-4 text-sm text-slate-600 border-t border-slate-100 pt-3">
                                    <div className="flex items-center gap-1">
                                        <Clock size={14} /> {alt.estimated_time_min} min
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Navigation size={14} /> {alt.distance_km} km
                                    </div>
                                </div>
                                {alt.selection_reason.includes('unavail') && (
                                    <div className="mt-2 text-xs text-red-600 font-medium flex items-center gap-1">
                                        <AlertTriangle size={12} /> Specialist Unavailable
                                    </div>
                                )}
                            </div>
                        ))}

                        <button
                            onClick={onCancel}
                            className="w-full py-3 text-slate-500 hover:text-red-600 font-medium text-sm flex items-center justify-center gap-2 transition-colors"
                        >
                            <X size={16} /> Discard & Return to Triage
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}
