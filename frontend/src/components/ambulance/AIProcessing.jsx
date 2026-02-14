import { useEffect, useState } from 'react';
import { Server, Activity, Database, CheckCircle2 } from 'lucide-react';

const STEPS = [
    { icon: Activity, text: "Analyzing patient condition..." },
    { icon: Database, text: "Querying hospital availability..." },
    { icon: Server, text: "Calculating traffic-aware routes..." },
    { icon: CheckCircle2, text: "Matching optimal facility..." },
];

export default function AIProcessing({ onComplete }) {
    const [currentStep, setCurrentStep] = useState(0);

    useEffect(() => {
        if (currentStep < STEPS.length) {
            const timer = setTimeout(() => {
                setCurrentStep(prev => prev + 1);
            }, 1000);
            return () => clearTimeout(timer);
        } else {
            const timer = setTimeout(() => {
                onComplete();
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [currentStep, onComplete]);

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
            <div className="w-full max-w-md bg-white p-10 rounded-xl shadow-lg border border-gray-200">
                
                {/* Loader */}
                <div className="relative w-20 h-20 mx-auto mb-8">
                    <svg className="animate-spin w-full h-full text-blue-200" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Activity className="text-blue-600" size={28} />
                    </div>
                </div>

                <h2 className="text-xl font-bold text-gray-900 mb-2 text-center">Processing Emergency</h2>
                <p className="text-gray-500 mb-8 text-sm text-center">AI-powered hospital matching</p>

                {/* Steps */}
                <div className="space-y-3">
                    {STEPS.map((step, index) => {
                        const isActive = index === currentStep;
                        const isCompleted = index < currentStep;
                        const Icon = step.icon;

                        return (
                            <div
                                key={index}
                                className={`flex items-center gap-3 transition-opacity duration-300 ${
                                    isCompleted || isActive ? 'opacity-100' : 'opacity-40'
                                }`}
                            >
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all
                                    ${isCompleted ? 'bg-emerald-100 text-emerald-600' : isActive ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-300'}`}>
                                    {isCompleted ? (
                                        <CheckCircle2 size={16} />
                                    ) : (
                                        <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-blue-600 animate-pulse' : 'bg-gray-300'}`} />
                                    )}
                                </div>

                                <p className={`text-sm font-medium flex-1 transition-colors
                                    ${isCompleted ? 'text-gray-500' : isActive ? 'text-gray-900' : 'text-gray-400'}`}>
                                    {step.text}
                                </p>

                                {isActive && <span className="text-xs font-bold text-blue-600 animate-pulse">ACTIVE</span>}
                                {isCompleted && <span className="text-xs font-bold text-emerald-600">✓</span>}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}