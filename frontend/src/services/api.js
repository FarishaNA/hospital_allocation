const API_BASE = 'http://localhost:5000/api';

/**
 * Match optimal hospital for patient
 * @param {Object} data - {condition, severity, location: {lat, lon}, vitals}
 * @returns {Promise<Object>} - {selected, alternatives}
 */
export async function matchHospital(data) {
    const response = await fetch(`${API_BASE}/hospitals/match`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    
    if (!response.ok) {
        throw new Error(`Hospital matching failed: ${response.statusText}`);
    }
    
    return response.json();
}

/**
 * Create emergency and initialize tracking
 * @param {Object} data - {hospital_id, patient, current_location}
 * @returns {Promise<Object>} - Emergency object with route
 */
export async function createEmergency(data) {
    const response = await fetch(`${API_BASE}/emergency/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    
    if (!response.ok) {
        throw new Error(`Emergency creation failed: ${response.statusText}`);
    }
    
    return response.json();
}

/**
 * Get active emergency (for hospital dashboard)
 * @returns {Promise<Object|null>} - Active emergency or null
 */
export async function getActiveEmergency() {
    const response = await fetch(`${API_BASE}/emergency/active`);
    
    if (!response.ok) {
        throw new Error(`Failed to fetch active emergency: ${response.statusText}`);
    }
    
    return response.json();
}

/**
 * Get real-time tracking data for ambulance
 * @param {string} emergencyId - Emergency ID
 * @returns {Promise<Object>} - {lat, lon, eta_seconds, distance_remaining_km, speed_kmh, status}
 */
export async function getTracking(emergencyId) {
    const response = await fetch(`${API_BASE}/tracking/${emergencyId}`);
    
    if (!response.ok) {
        throw new Error(`Tracking failed: ${response.statusText}`);
    }
    
    return response.json();
}

/**
 * AI-assisted triage (calls Gemini via backend)
 * Note: This would require a new backend endpoint. For now, we'll skip this
 * and rely on manual input + backend AI hospital selection.
 */
export async function aiTriage(description) {
    // TODO: Backend endpoint for AI triage of patient description
    // For now, return null and let user select manually
    console.warn('AI Triage not implemented - using manual input');
    return null;
}