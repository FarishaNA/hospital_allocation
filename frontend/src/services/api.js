import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

export const getHospitals = async () => {
    const response = await api.get('/hospitals');
    return response.data;
};

export const matchHospital = async (data) => {
    const response = await api.post('/hospitals/match', data);
    return response.data;
};

export const createEmergency = async (data) => {
    const response = await api.post('/emergency/create', data);
    return response.data;
};

export const getActiveEmergency = async () => {
    const response = await api.get('/emergency/active');
    return response.data;
};

export const getTracking = async (emergencyId) => {
    const response = await api.get(`/tracking/${emergencyId}`);
    return response.data;
};

export const aiTriage = async (text) => {
    const response = await api.post('/triage', { text });
    return response.data;
};

export default api;
