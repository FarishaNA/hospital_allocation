import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Server, Activity, Database, CheckCircle2, Lock, Share2 } from 'lucide-react';

const STEPS = [
    { icon: Activity, text: "Acquiring real-time telemetry..." },
    { icon: Database, text: "Querying National Hospital Registry..." },
    { icon: Server, text: "Analyzing traffic patterns (Google Routes v2)..." },
    { icon: Share2, text: "Establishing secure handshake with providers..." },
];

export default function AIProcessing({ onComplete }) {
    const [currentStep, setCurrentStep] = useState(0);

    useEffect(() => {
        if (currentStep < STEPS.length) {
            const timer = setTimeout(() => {
                setCurrentStep(prev => prev + 1);
            }, 1200);
            return () => clearTimeout(timer);
        } else {
            const timer = setTimeout(() => {
                onComplete();
            }, 800);
            return () => clearTimeout(timer);
        }
    }, [currentStep, onComplete]);

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">

            <div className="lg:w-1/2 w-full max-w-2xl bg-white p-12 rounded-2xl shadow-xl border border-slate-200 text-center">

                {/* Medical Loader */}
                <div className="relative w-24 h-24 mx-auto mb-8">
                    <svg className="animate-spin w-full h-full text-blue-200" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Activity className="text-blue-600" size={32} />
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-slate-800 mb-2">Processing Incident Data</h2>
                <p className="text-slate-500 mb-10 text-sm font-medium uppercase tracking-widest">Secure Medical Network</p>

                {/* Steps List */}
                <div className="space-y-4 text-left border-t border-slate-100 pt-8">
                    {STEPS.map((step, index) => {
                        const isActive = index === currentStep;
                        const isCompleted = index < currentStep;
                        const Icon = step.icon;

                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: isCompleted || isActive ? 1 : 0.4, y: 0 }}
                                className="flex items-center gap-4"
                            >
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300
                  ${isCompleted ? 'bg-emerald-100 text-emerald-600' : isActive ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-300'}
                `}>
                                    {isCompleted ? <CheckCircle2 size={14} /> : <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-blue-600 animate-pulse' : 'bg-slate-300'}`} />}
                                </div>

                                <div className="flex-1">
                                    <p className={`text-sm font-medium transition-colors duration-300
                    ${isCompleted ? 'text-slate-500' : isActive ? 'text-slate-800' : 'text-slate-400'}
                  `}>
                                        {step.text}
                                    </p>
                                </div>

                                {isActive && <span className="text-xs font-bold text-blue-600 animate-pulse">PROCESSING</span>}
                                {isCompleted && <span className="text-xs font-bold text-emerald-600">DONE</span>}
                            </motion.div>
                        );
                    })}
                </div>

                <div className="mt-12 flex justify-center items-center gap-2 text-xs text-slate-400">
                    <Lock size={12} />
                    <span>HIPAA Compliant • End-to-End Encrypted</span>
                </div>

            </div>
        </div>
    );
}
