import { AlertTriangle, Clock, Activity, Thermometer, User, CheckSquare } from 'lucide-react';
import { motion } from 'framer-motion';

export default function IncomingAlert({ emergency, eta }) {
    if (!emergency) return (
        <div className="h-full flex flex-col items-center justify-center text-gray-400 p-8 text-center">
            <div className="bg-gray-100 p-4 rounded-full mb-4">
                <Activity size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-600">No Active Emergencies</h3>
            <p className="text-sm">System is monitoring for incoming requests...</p>
        </div>
    );

    const { patient } = emergency;

    return (
        <div className="h-full flex flex-col bg-white border-r border-gray-200 overflow-y-auto">

            {/* Header Alert */}
            <div className="bg-red-600 text-white p-6 animate-pulse">
                <div className="flex items-center gap-3 mb-2">
                    <AlertTriangle size={28} />
                    <h2 className="text-2xl font-black tracking-wide">CRITICAL INCOMING</h2>
                </div>
                <div className="flex justify-between items-end">
                    <div>
                        <div className="text-red-200 text-xs font-bold uppercase">Condition</div>
                        <div className="text-xl font-bold uppercase">{patient.condition.replace('_', ' ')}</div>
                    </div>
                    <div className="text-right">
                        <div className="text-red-200 text-xs font-bold uppercase">ETA</div>
                        <div className="text-3xl font-mono font-black">{eta || '--'} min</div>
                    </div>
                </div>
            </div>

            <div className="p-6 space-y-8">

                {/* Patient Vitals */}
                <section>
                    <h3 className="section-title flex items-center gap-2 text-gray-800 font-bold mb-4">
                        <Activity size={18} className="text-blue-500" /> Patient Vitals
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                            <span className="text-xs text-gray-500 font-bold">BP</span>
                            <div className="text-xl font-mono font-bold text-gray-900">{patient.vitals?.bp || '--/--'}</div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                            <span className="text-xs text-gray-500 font-bold">HR</span>
                            <div className="text-xl font-mono font-bold text-red-600">{patient.vitals?.hr || '--'} <span className="text-xs text-gray-400">bpm</span></div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                            <span className="text-xs text-gray-500 font-bold">SPO2</span>
                            <div className="text-xl font-mono font-bold text-blue-600">{patient.vitals?.spo2 || '--'} <span className="text-xs text-gray-400">%</span></div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                            <span className="text-xs text-gray-500 font-bold">Severity</span>
                            <div className="text-sm font-bold text-red-600 uppercase pt-1">{patient.severity}</div>
                        </div>
                    </div>
                </section>

                {/* Prep Checklist */}
                <section>
                    <h3 className="section-title flex items-center gap-2 text-gray-800 font-bold mb-4">
                        <CheckSquare size={18} className="text-green-500" /> Preparation Checklist
                    </h3>
                    <div className="space-y-3">
                        {['Notify Trauma Team', 'Prepare ICU Bed #04', 'Clear ER Entrance', 'Ventilator Standby'].map((item, i) => (
                            <label key={i} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-200 cursor-pointer transition-all">
                                <input type="checkbox" className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500" />
                                <span className="font-medium text-gray-700">{item}</span>
                            </label>
                        ))}
                    </div>
                </section>

            </div>

            {/* Footer Actions */}
            <div className="mt-auto p-6 bg-gray-50 border-t border-gray-200">
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2">
                    <User size={20} /> VIEW FULL PATIENT PROFILE
                </button>
            </div>

        </div>
    );
}
