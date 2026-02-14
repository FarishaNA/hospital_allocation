from flask import Blueprint, jsonify
import json
import os
from datetime import datetime
from services.distance_calculator import calculate_haversine_distance

tracking_bp = Blueprint('tracking', __name__)

EMERGENCY_DATA_PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'active_emergencies.json')

def load_json(path):
    if not os.path.exists(path):
        return {}
    with open(path, 'r') as f:
        return json.load(f)

def get_simulated_position(route, elapsed_seconds):
    """
    Calculate current position along route based on elapsed time.
    Returns: (position_dict, arrived_boolean)
    """
    if not route:
        return None, False
    
    # If time exceeded, ambulance has arrived
    if elapsed_seconds >= route[-1]['timestamp']:
        return route[-1], True
    
    # Find the current segment
    for i in range(len(route) - 1):
        p1 = route[i]
        p2 = route[i + 1]
        
        if p1['timestamp'] <= elapsed_seconds < p2['timestamp']:
            # Interpolate position within this segment
            segment_duration = p2['timestamp'] - p1['timestamp']
            time_into_segment = elapsed_seconds - p1['timestamp']
            ratio = time_into_segment / segment_duration if segment_duration > 0 else 0
            
            lat = p1['lat'] + (p2['lat'] - p1['lat']) * ratio
            lon = p1['lon'] + (p2['lon'] - p1['lon']) * ratio
            
            return {
                "lat": lat,
                "lon": lon,
                "timestamp": elapsed_seconds,
                "location": p1.get('location', 'En Route')
            }, False
    
    # Fallback to start
    return route[0], False

@tracking_bp.route('/<emergency_id>', methods=['GET'])
def get_tracking(emergency_id):
    """
    Get real-time tracking data for an emergency.
    Simulates ambulance movement along the pre-calculated route.
    """
    emergencies_data = load_json(EMERGENCY_DATA_PATH)
    emergency = next(
        (e for e in emergencies_data.get('emergencies', []) if e['id'] == emergency_id),
        None
    )
    
    if not emergency:
        return jsonify({"error": "Emergency not found"}), 404
    
    # Calculate elapsed time since emergency started
    start_time = datetime.fromisoformat(emergency['start_time'])
    elapsed_seconds = (datetime.utcnow() - start_time).total_seconds()
    
    # Get current position along route
    current_pos, arrived = get_simulated_position(emergency['route'], elapsed_seconds)
    
    if not current_pos:
        return jsonify({"error": "Unable to calculate position"}), 500
    
    # Calculate remaining time and distance
    total_time = emergency['route'][-1]['timestamp']
    eta_seconds = max(0, total_time - elapsed_seconds)
    
    destination = emergency['route'][-1]
    distance_remaining = calculate_haversine_distance(
        (current_pos['lat'], current_pos['lon']),
        (destination['lat'], destination['lon'])
    )
    
    # Simulate speed variation (35-55 km/h)
    speed_kmh = 45 + (elapsed_seconds % 20) - 10
    if arrived:
        speed_kmh = 0
    
    return jsonify({
        "lat": round(current_pos['lat'], 6),
        "lon": round(current_pos['lon'], 6),
        "eta_seconds": int(eta_seconds),
        "distance_remaining_km": distance_remaining,
        "status": "arrived" if arrived else "en_route",
        "speed_kmh": round(speed_kmh, 1),
        "location": current_pos.get('location', 'En Route')
    })