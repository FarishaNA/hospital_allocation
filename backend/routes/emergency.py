from flask import Blueprint, jsonify, request
import json
import os
from datetime import datetime
from services.route_generator import generate_route_path
from services.distance_calculator import calculate_haversine_distance

emergency_bp = Blueprint('emergency', __name__)

EMERGENCY_DATA_PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'active_emergencies.json')
HOSPITALS_DATA_PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'hospitals.json')
TRACKING_DATA_PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'ambulance_tracking.json')

def load_json(path):
    if not os.path.exists(path):
        return {}
    with open(path, 'r') as f:
        return json.load(f)

def save_json(path, data):
    with open(path, 'w') as f:
        json.dump(data, f, indent=2)

@emergency_bp.route('/create', methods=['POST'])
def create_emergency():
    """
    Create a new emergency and initialize tracking.
    
    Expects:
    {
        "hospital_id": 1,
        "patient": {
            "condition": "cardiac_arrest",
            "severity": "critical",
            "vitals": {"bp": "120/80", "hr": "110", "spo2": "95"}
        },
        "current_location": {"lat": 9.6667, "lon": 76.5667, "name": "Pickup Point"}
    }
    """
    data = request.json
    hospital_id = data.get('hospital_id')
    patient = data.get('patient')
    current_location = data.get('current_location')  # {lat, lon, name?}
    
    if not hospital_id or not patient or not current_location:
        return jsonify({"error": "Missing required fields"}), 400
    
    # Get Hospital Details
    hospitals = load_json(HOSPITALS_DATA_PATH).get('hospitals', [])
    selected_hospital = next((h for h in hospitals if h['id'] == hospital_id), None)
    
    if not selected_hospital:
        return jsonify({"error": "Hospital not found"}), 404
    
    # Calculate Distance/Time
    hospital_loc = {"lat": selected_hospital['lat'], "lon": selected_hospital['lon']}
    distance_km = calculate_haversine_distance(
        (current_location['lat'], current_location['lon']),
        (hospital_loc['lat'], hospital_loc['lon'])
    )
    
    # Estimate time: ~40 km/h average in urban Kerala
    estimated_time_min = (distance_km / 40) * 60
    
    # Generate Route Waypoints
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
        "total_distance_km": round(distance_km, 2),
        "total_time_min": round(estimated_time_min, 1)
    }
    
    # Save to active emergencies (replace for demo - only 1 active)
    emergencies_data = load_json(EMERGENCY_DATA_PATH)
    emergencies_data['emergencies'] = [new_emergency]
    save_json(EMERGENCY_DATA_PATH, emergencies_data)
    
    # Initialize Tracking
    tracking_data = load_json(TRACKING_DATA_PATH)
    tracking_data['ambulances'] = [{
        "emergency_id": emergency_id,
        "current_position": {
            "name": current_location.get('name', 'Pickup Point'),
            "lat": current_location['lat'],
            "lon": current_location['lon']
        },
        "speed_kmh": 0,
        "heading": 0,
        "status": "en_route",
        "timestamp": datetime.utcnow().isoformat()
    }]
    save_json(TRACKING_DATA_PATH, tracking_data)
    
    print(f"✅ Emergency {emergency_id} created - {distance_km}km to {selected_hospital['name']}")
    
    return jsonify(new_emergency)

@emergency_bp.route('/active', methods=['GET'])
def get_active_emergency():
    """Get the currently active emergency (if any)"""
    data = load_json(EMERGENCY_DATA_PATH)
    emergencies = data.get('emergencies', [])
    
    if not emergencies:
        return jsonify(None)
    
    return jsonify(emergencies[0])