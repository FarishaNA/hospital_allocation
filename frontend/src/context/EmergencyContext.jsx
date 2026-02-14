import { createContext, useContext, useState } from 'react';

const EmergencyContext = createContext();

export const EmergencyProvider = ({ children }) => {
    const [activeEmergency, setActiveEmergency] = useState(null);
    const [selectedHospital, setSelectedHospital] = useState(null);
    const [ambulanceLocation, setAmbulanceLocation] = useState(null);

    const resetEmergency = () => {
        setActiveEmergency(null);
        setSelectedHospital(null);
        setAmbulanceLocation(null);
    };

    return (
        <EmergencyContext.Provider value={{
            activeEmergency,
            setActiveEmergency,
            selectedHospital,
            setSelectedHospital,
            ambulanceLocation,
            setAmbulanceLocation,
            resetEmergency
        }}>
            {children}
        </EmergencyContext.Provider>
    );
};

export const useEmergency = () => {
    const context = useContext(EmergencyContext);
    if (!context) {
        throw new Error('useEmergency must be used within EmergencyProvider');
    }
    return context;
};