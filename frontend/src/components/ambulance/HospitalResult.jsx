import { useState } from 'react';
import { Navigation, Clock, CheckCircle, MapPin, ArrowRight, X } from 'lucide-react';

export default function HospitalResult({ result, onConfirm, onCancel }) {
    const { selected, alternatives } = result;
    const [loading, setLoading] = useState(false);

    const handleConfirm = () => {
        console.log('🔵 HospitalResult: handleConfirm called');
        console.log('🔵 Selected hospital data:', selected);
        console.log('🔵 onConfirm function type:', typeof onConfirm);
        
        if (typeof onConfirm !== 'function') {
            console.error('❌ onConfirm is not a function!', onConfirm);
            alert('Error: onConfirm callback is not a function');
            return;
        }
        
        setLoading(true);
        
        // Add a small delay to show loading state
        setTimeout(() => {
            console.log('🔵 Calling onConfirm...');
            onConfirm(selected);
        }, 100);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
            <div className="w-full max-w-5xl space-y-4">

                {/* Success Banner */}
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-lg flex items-center justify-center gap-2 text-sm font-medium">
                    <CheckCircle size={18} />
                    Optimal hospital identified based on real-time data
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Main Selection */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl border-2 border-blue-500 shadow-lg overflow-hidden">
                            
                            {/* Header */}
                            <div className="bg-blue-600 text-white p-6">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h2 className="text-2xl font-bold mb-2">{selected.hospital.name}</h2>
                                        <div className="flex items-center gap-2 text-sm opacity-90">
                                            <MapPin size={14} />
                                            {selected.hospital.address}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-3xl font-bold">{Math.round(selected.score * 100)}%</span>
                                        <div className="text-xs opacity-75">MATCH</div>
                                    </div>
                                </div>
                            </div>

                            {/* Metrics */}
                            <div className="p-6 space-y-6">
                                <div className="flex items-center gap-8 pb-6 border-b border-gray-100">
                                    <div className="flex-1">
                                        <div className="text-xs font-semibold text-gray-400 uppercase mb-1">Travel Time</div>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-4xl font-bold text-gray-900">{selected.estimated_time_min}</span>
                                            <span className="text-gray-500">min</span>
                                        </div>
                                        <div className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                                            <Navigation size={14} className="text-blue-600" />
                                            {selected.distance_km} km
                                        </div>
                                    </div>
                                    
                                    <div className="w-px h-16 bg-gray-200"></div>
                                    
                                    <div className="flex-1">
                                        <div className="text-xs font-semibold text-gray-400 uppercase mb-1">Availability</div>
                                        <div className="flex items-center gap-2">
                                            <div className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2">
                                                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                                                Ready Now
                                            </div>
                                        </div>
                                        <div className="text-sm text-gray-500 mt-2">
                                            ICU Beds: <span className="font-bold">{selected.hospital.beds?.icu_available || 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* AI Reasoning */}
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Selection Reasoning</h3>
                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                        <p className="text-gray-700 leading-relaxed">
                                            {selected.selection_reason || 'Optimal match based on distance, facilities, and availability.'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Action */}
                            <div className="p-6 bg-gray-50 border-t border-gray-200">
                                {/* Debug Info */}
                                <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                                    <strong>Debug:</strong> onConfirm is {typeof onConfirm === 'function' ? '✅ function' : '❌ ' + typeof onConfirm}
                                </div>
                                
                                <button
                                    onClick={handleConfirm}
                                    disabled={loading}
                                    className={`w-full bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold py-4 rounded-lg flex items-center justify-center gap-3 transition-all ${
                                        loading ? 'opacity-70 cursor-wait' : ''
                                    }`}
                                >
                                    {loading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                            Initiating Transport...
                                        </>
                                    ) : (
                                        <>
                                            CONFIRM TRANSPORT
                                            <ArrowRight size={20} />
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Alternatives */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase">Alternative Options</h3>

                        {alternatives && alternatives.length > 0 ? alternatives.map((alt, i) => (
                            <div
                                key={alt.hospital.id || i}
                                className="bg-white p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-all"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-bold text-gray-800">{alt.hospital.name}</h4>
                                    <span className="text-sm font-bold text-gray-400">{Math.round(alt.score * 100)}%</span>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                    <span className="flex items-center gap-1">
                                        <Clock size={14} /> {alt.estimated_time_min} min
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Navigation size={14} /> {alt.distance_km} km
                                    </span>
                                </div>
                            </div>
                        )) : (
                            <div className="bg-white p-4 rounded-lg border border-gray-200 text-center text-gray-500 text-sm">
                                No alternatives available
                            </div>
                        )}

                        <button
                            onClick={onCancel}
                            className="w-full py-3 text-gray-500 hover:text-red-600 font-medium text-sm flex items-center justify-center gap-2 transition-colors"
                        >
                            <X size={16} /> Cancel & Return
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}