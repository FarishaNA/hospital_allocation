import { motion } from 'framer-motion';
import { Navigation, Clock, Activity, Bed, Award, AlertTriangle, ArrowRight } from 'lucide-react';

export default function HospitalResult({ result, onConfirm, onCancel }) {
    const { selected, alternatives } = result;

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8 flex items-center justify-center">
            <div className="w-full max-w-5xl space-y-6">

                {/* Main Success Banner */}
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="bg-green-600 text-white p-4 rounded-xl shadow-lg flex items-center justify-center gap-3"
                >
                    <div className="bg-white/20 p-1.5 rounded-full">
                        <Award size={20} className="text-white" />
                    </div>
                    <span className="font-bold tracking-wide">OPTIMAL HOSPITAL AUTOMATICALLY SELECTED</span>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* LEFT: Main Selection Card */}
                    <div className="lg:col-span-2">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white rounded-2xl shadow-xl border-2 border-green-500 overflow-hidden h-full flex flex-col"
                        >
                            <div className="bg-green-50 p-6 border-b border-green-100">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h2 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight mb-2">
                                            {selected.hospital.name}
                                        </h2>
                                        <div className="flex items-center gap-4 text-gray-700 font-medium">
                                            <span className="flex items-center gap-1"><Navigation size={18} /> {selected.distance_km} km</span>
                                            <span className="w-1 h-1 bg-gray-400 rounded-full" />
                                            <span className="flex items-center gap-1 text-green-700 font-bold"><Clock size={18} /> ~{selected.estimated_time_min} mins</span>
                                        </div>
                                    </div>
                                    <div className="bg-white px-4 py-2 rounded-lg border border-green-200 shadow-sm text-center">
                                        <div className="text-xs text-gray-500 font-bold uppercase">Match</div>
                                        <div className="text-2xl font-black text-green-600">{Math.round(selected.score * 100)}%</div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 md:p-8 flex-1 space-y-6">
                                <div>
                                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Why This Hospital?</h3>
                                    <div className="space-y-3">
                                        {selected.selection_reason.split(', ').map((reason, i) => (
                                            <motion.div
                                                initial={{ x: -10, opacity: 0 }}
                                                animate={{ x: 0, opacity: 1 }}
                                                transition={{ delay: 0.4 + (i * 0.1) }}
                                                key={i}
                                                className="flex items-start gap-3"
                                            >
                                                <div className="mt-0.5 bg-green-100 text-green-700 p-1 rounded-full">
                                                    <Activity size={16} />
                                                </div>
                                                <span className="font-medium text-gray-800 text-lg">{reason}</span>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-green-50 rounded-xl p-4 flex items-center justify-between border border-green-100">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-green-200 p-2 rounded-full text-green-800">
                                            <Clock size={20} />
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-900">TIME SAVED</div>
                                            <div className="text-sm text-gray-600">vs manual search</div>
                                        </div>
                                    </div>
                                    <div className="text-xl font-black text-green-700">14 MINUTES</div>
                                </div>
                            </div>

                            <div className="p-6 bg-gray-50 border-t border-gray-100">
                                <button
                                    onClick={() => onConfirm(selected)}
                                    className="w-full bg-green-600 hover:bg-green-700 text-white text-xl font-black py-5 rounded-xl shadow-lg hover:shadow-xl transform transition-all active:scale-95 flex items-center justify-center gap-3"
                                >
                                    <Navigation size={28} />
                                    START NAVIGATION
                                </button>
                            </div>
                        </motion.div>
                    </div>

                    {/* RIGHT: Alternatives */}
                    <div className="space-y-4">
                        <h3 className="font-bold text-gray-500 px-2 flex items-center gap-2">
                            <AlertTriangle size={16} /> ALT OPTIONS CONSIDERED
                        </h3>
                        {alternatives.map((alt, i) => (
                            <motion.div
                                initial={{ x: 20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.6 + (i * 0.1) }}
                                key={alt.hospital.id}
                                className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm opacity-75 hover:opacity-100 hover:shadow-md transition-all cursor-pointer"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-bold text-gray-800 leading-tight">{alt.hospital.name}</h4>
                                    <span className="text-sm font-bold text-gray-400">{Math.round(alt.score * 100)}%</span>
                                </div>
                                <div className="space-y-1 text-sm text-gray-500">
                                    <div className="flex items-center gap-2">
                                        <Clock size={14} /> {alt.estimated_time_min} mins ({alt.distance_km} km)
                                    </div>
                                    <div className="text-red-500 text-xs font-semibold mt-2">
                                        ⚠ {alt.selection_reason.includes('Not Available') ? 'Specialist unavailable' : 'Less optimal match'}
                                    </div>
                                </div>
                            </motion.div>
                        ))}

                        <button
                            onClick={onCancel}
                            className="w-full py-3 text-gray-500 font-semibold hover:text-gray-700 text-sm"
                        >
                            Start Over / Manual Selection
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}
