import { AlertTriangle, Activity, CheckSquare } from 'lucide-react';

export default function IncomingAlert({ emergency, eta }) {
    if (!emergency) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 p-8 bg-white">
                <div className="w-20 h-20 rounded-full border-2 border-gray-200 flex items-center justify-center mb-4">
                    <Activity size={32} className="text-gray-300" />
                </div>
                <h3 className="text-lg font-bold text-gray-400 uppercase">System Idle</h3>
                <p className="text-xs text-gray-400 mt-2">Monitoring for incoming emergencies...</p>
            </div>
        );
    }

    const { patient } = emergency;

    return (
        <div className="h-full flex flex-col bg-white overflow-y-auto">
            
            {/* Alert Header */}
            <div className="bg-red-50 border-b border-red-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="bg-red-500 text-white p-2 rounded-lg animate-pulse">
                        <AlertTriangle size={24} />
                    </div>
                    <h2 className="text-xl font-bold text-red-900 uppercase">Critical Incoming</h2>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <div className="text-red-400 text-xs font-semibold uppercase mb-1">Condition</div>
                        <div className="text-lg font-bold text-gray-900 uppercase">
                            {patient.condition?.replace('_', ' ')}
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-red-400 text-xs font-semibold uppercase mb-1">ETA</div>
                        <div className="text-3xl font-mono font-bold text-red-600">
                            {eta || '--'}<span className="text-sm ml-1">MIN</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Vitals */}
            <div className="p-6 space-y-6">
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-2">
                            <Activity size={12} className="text-blue-600" /> Vitals Telemetry
                        </h3>
                        <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded font-semibold">LIVE</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                            <span className="text-xs text-gray-500 font-semibold uppercase">Blood Pressure</span>
                            <div className="text-xl font-mono font-bold text-gray-900 mt-1">
                                {patient.vitals?.bp || '--/--'}
                            </div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                            <span className="text-xs text-gray-500 font-semibold uppercase">Heart Rate</span>
                            <div className="text-xl font-mono font-bold text-red-600 mt-1">
                                {patient.vitals?.hr || '--'} <span className="text-xs text-gray-400">bpm</span>
                            </div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                            <span className="text-xs text-gray-500 font-semibold uppercase">O2 Saturation</span>
                            <div className="text-xl font-mono font-bold text-blue-600 mt-1">
                                {patient.vitals?.spo2 || '--'} <span className="text-xs text-gray-400">%</span>
                            </div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                            <span className="text-xs text-gray-500 font-semibold uppercase">Severity</span>
                            <div className="text-sm font-bold text-red-600 uppercase mt-2">
                                {patient.severity}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Prep Checklist */}
                <section>
                    <h3 className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-2 mb-4">
                        <CheckSquare size={12} className="text-amber-600" /> Preparation Protocol
                    </h3>
                    <div className="space-y-2">
                        {['Notify Trauma Team', 'Prepare ICU Bed', 'Clear ER Entrance', 'Ventilator Standby'].map((item, i) => (
                            <label key={i} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-200 hover:bg-gray-100 cursor-pointer transition-all">
                                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                <span className="text-sm font-medium text-gray-700">{item}</span>
                            </label>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}