import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Brain, CheckCircle2, Server, Activity, Map } from 'lucide-react';

const STEPS = [
    { icon: Map, text: "Scanning 5 hospitals within 15km radius..." },
    { icon: Activity, text: "Checking specialist availability (Cardiologist)..." },
    { icon: Server, text: "Queries real-time ICU Bed status..." },
    { icon: Brain, text: "Analyzes historical success rates & traffic data..." },
];

export default function AIProcessing({ onComplete }) {
    const [currentStep, setCurrentStep] = useState(0);

    useEffect(() => {
        if (currentStep < STEPS.length) {
            const timer = setTimeout(() => {
                setCurrentStep(prev => prev + 1);
            }, 800); // 800ms per step
            return () => clearTimeout(timer);
        } else {
            const timer = setTimeout(() => {
                onComplete();
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [currentStep, onComplete]);

    return (
        <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-6 relative overflow-hidden">

            {/* Background Pulse Effect */}
            <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                <motion.div
                    animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="w-[500px] h-[500px] bg-blue-500 rounded-full blur-3xl"
                />
            </div>

            <div className="w-full max-w-2xl text-center z-10">

                {/* Main Icon */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/20"
                >
                    <Brain size={48} className="text-white" />
                </motion.div>

                <h2 className="text-3xl font-bold text-white mb-2">AI ANALYZING HOSPITALS...</h2>
                <p className="text-gray-400 mb-12">Finding the optimal match for critical patient</p>

                {/* Steps List */}
                <div className="space-y-6 text-left max-w-lg mx-auto bg-gray-800/50 p-6 rounded-2xl border border-gray-700/50 backdrop-blur-sm">
                    {STEPS.map((step, index) => {
                        const isActive = index === currentStep;
                        const isCompleted = index < currentStep;
                        const Icon = step.icon;

                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: isCompleted || isActive ? 1 : 0.3, x: 0 }}
                                className="flex items-center gap-4"
                            >
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300
                  ${isCompleted ? 'bg-green-500/20 text-green-400' : isActive ? 'bg-blue-500/20 text-blue-400 animate-pulse' : 'bg-gray-700 text-gray-500'}
                `}>
                                    {isCompleted ? <CheckCircle2 size={18} /> : <Icon size={18} />}
                                </div>

                                <div className="flex-1">
                                    <p className={`font-mono text-sm md:text-base transition-colors duration-300
                    ${isCompleted ? 'text-gray-300' : isActive ? 'text-white font-semibold' : 'text-gray-600'}
                  `}>
                                        {step.text}
                                    </p>
                                    {isActive && (
                                        <motion.div
                                            layoutId="progress-bar"
                                            className="h-1 bg-blue-500 mt-2 rounded-full origin-left"
                                            initial={{ scaleX: 0 }}
                                            animate={{ scaleX: 1 }}
                                            transition={{ duration: 0.8 }}
                                        />
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: currentStep === STEPS.length ? 1 : 0 }}
                    className="text-green-400 font-bold mt-8 tracking-widest uppercase text-sm"
                >
                    OPTIMAL MATCH IDENTIFIED
                </motion.p>

            </div>
        </div>
    );
}
