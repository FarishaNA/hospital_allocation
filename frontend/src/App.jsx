import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { EmergencyProvider } from './context/EmergencyContext';
import AmbulanceApp from './pages/AmbulanceApp';
import HospitalDashboard from './pages/HospitalDashboard';

function App() {
    return (
        <EmergencyProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<Navigate to="/ambulance" replace />} />
                    <Route path="/ambulance" element={<AmbulanceApp />} />
                    <Route path="/hospital" element={<HospitalDashboard />} />
                </Routes>
            </Router>
        </EmergencyProvider>
    );
}

export default App;
