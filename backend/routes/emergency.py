from flask import Blueprint, jsonify, request
import json
import os
import uuid
from datetime import datetime
from services.route_generator import generate_route_path
from services.distance_calculator import calculate_haversine_distance

emergency_bp = Blueprint('emergency', __name__)

EMERGENCY_DATA_PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'active_emergencies.json')
HOSPITALS_DATA_PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'hospitals.json')
TRACKING_DATA_PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'ambulance_tracking.json')

def load_json(path):
    if not os.path.exists(path): return {}
    with open(path, 'r') as f: return json.load(f)

def save_json(path, data):
    with open(path, 'w') as f: json.dump(data, f, indent=2)

@emergency_bp.route('/create', methods=['POST'])
def create_emergency():
    data = request.json
    hospital_id = data.get('hospital_id')
    patient = data.get('patient')
    current_location = data.get('current_location') # {lat, lon}
    
    # Get Hospital Details
    hospitals = load_json(HOSPITALS_DATA_PATH).get('hospitals', [])
    selected_hospital = next((h for h in hospitals if h['id'] == hospital_id), None)
    
    if not selected_hospital:
        return jsonify({"error": "Hospital not found"}), 404
        
    # Calculate Dist/Time
    hospital_loc = {"lat": selected_hospital['lat'], "lon": selected_hospital['lon']}
    distance_km = calculate_haversine_distance(
        (current_location['lat'], current_location['lon']),
        (hospital_loc['lat'], hospital_loc['lon'])
    )
    estimated_time_min = (distance_km / 50) * 60 # 50km/h avg
    
    # Generate Route
    route = generate_route_path(current_location, hospital_loc, estimated_time_min)
    
    # Create Emergency Record
    emergency_id = f"EMG-{datetime.now().strftime('%Y%m%d%H%M%S')}"
    new_emergency = {
        "id": emergency_id,
        "hospital_id": hospital_id,
        "hospital_name": selected_hospital['name'],
        "patient": patient,
        "start_time": datetime.utcnow().isoformat(),
        "status": "en_route",
        "route": route,
        "total_distance_km": distance_km,
        "total_time_min": estimated_time_min
    }
    
    # Save to active emergencies
    emergencies_data = load_json(EMERGENCY_DATA_PATH)
    emergencies_data['emergencies'] = [new_emergency] # Reset for demo (only 1 active)
    save_json(EMERGENCY_DATA_PATH, emergencies_data)
    
    # Initialize Tracking
    tracking_data = load_json(TRACKING_DATA_PATH)
    tracking_data['ambulances'] = [{
        "emergency_id": emergency_id,
        "current_position": current_location,
        "speed_kmh": 0,
        "heading": 0,
        "status": "en_route",
        "timestamp": datetime.utcnow().isoformat()
    }]
    save_json(TRACKING_DATA_PATH, tracking_data)
    
    return jsonify(new_emergency)

@emergency_bp.route('/active', methods=['GET'])
def get_active_emergency():
    data = load_json(EMERGENCY_DATA_PATH)
    emergencies = data.get('emergencies', [])
    if not emergencies:
        return jsonify(None)
    return jsonify(emergencies[0])
