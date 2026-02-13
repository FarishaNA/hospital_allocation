from flask import Blueprint, jsonify
import json
import os
from datetime import datetime
from services.distance_calculator import calculate_haversine_distance

tracking_bp = Blueprint('tracking', __name__)

EMERGENCY_DATA_PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'active_emergencies.json')

# Helper to find current position based on elapsed time (Simulation)
def get_simulated_position(route, elapsed_seconds):
    if not route: return None
    
    # If time elapsed > last waypoint, return last waypoint (Arrived)
    if elapsed_seconds >= route[-1]['timestamp']:
        return route[-1], True # (Point, Arrived)
        
    # Find active segment
    for i in range(len(route) - 1):
        p1 = route[i]
        p2 = route[i+1]
        if p1['timestamp'] <= elapsed_seconds < p2['timestamp']:
            # Interpolate
            segment_duration = p2['timestamp'] - p1['timestamp']
            time_into_segment = elapsed_seconds - p1['timestamp']
            ratio = time_into_segment / segment_duration
            
            lat = p1['lat'] + (p2['lat'] - p1['lat']) * ratio
            lon = p1['lon'] + (p2['lon'] - p1['lon']) * ratio
            
            return {
                "lat": lat,
                "lon": lon,
                "timestamp": elapsed_seconds
            }, False
            
    return route[0], False

def load_json(path):
    if not os.path.exists(path): return {}
    with open(path, 'r') as f: return json.load(f)

@tracking_bp.route('/<emergency_id>', methods=['GET'])
def get_tracking(emergency_id):
    emergencies_data = load_json(EMERGENCY_DATA_PATH)
    emergency = next((e for e in emergencies_data.get('emergencies', []) if e['id'] == emergency_id), None)
    
    if not emergency:
        return jsonify({"error": "Emergency not found"}), 404
        
    start_time = datetime.fromisoformat(emergency['start_time'])
    elapsed_seconds = (datetime.utcnow() - start_time).total_seconds()
    
    current_pos, arrived = get_simulated_position(emergency['route'], elapsed_seconds)
    
    # Calculate stats
    total_time = emergency['route'][-1]['timestamp']
    eta_seconds = max(0, total_time - elapsed_seconds)
    
    dest = emergency['route'][-1]
    distance_remaining = calculate_haversine_distance(
        (current_pos['lat'], current_pos['lon']),
        (dest['lat'], dest['lon'])
    )
    
    return jsonify({
        "lat": current_pos['lat'],
        "lon": current_pos['lon'],
        "eta_seconds": int(eta_seconds),
        "distance_remaining_km": distance_remaining,
        "status": "arrived" if arrived else "en_route",
        "speed_kmh": 45 + (elapsed_seconds % 10) # Fake speed variation
    })
