import json
from services.google_maps_service import get_traffic_matrix, get_route_polyline
from services.gemini_service import evaluate_hospitals_with_gemini
from services.distance_calculator import calculate_haversine_distance

def select_optimal_hospital(condition, severity, ambulance_location, hospitals):
    """
    Select the optimal hospital using Real-Time Traffic (Google Routes) and AI Decision (Gemini).
    """
    
    # 1. Get Real-Time Traffic Data
    # For hackathon, if API keys fail/missing, fallback to Haversine + Heuristic
    try:
        matrix_response = get_traffic_matrix(
            ambulance_location['lat'], 
            ambulance_location['lon'], 
            hospitals
        )
        
        # Merge traffic data into hospital objects
        hospitals_with_traffic = []
        for i, h in enumerate(hospitals):
            traffic_info = {}
            if matrix_response and len(matrix_response) > i:
                 element = matrix_response[i]
                 traffic_info = {
                     "distance_meters": element.get('distanceMeters', 0),
                     "duration": element.get('duration', '0s'), # e.g. "345s"
                     "duration_seconds": int(element.get('duration', '0s').rstrip('s'))
                 }
            
            # Fallback if matrix fails for specific element
            if not traffic_info:
                 dist = calculate_haversine_distance(
                     (ambulance_location['lat'], ambulance_location['lon']),
                     (h['lat'], h['lon'])
                 )
                 traffic_info = {
                     "distance_meters": int(dist * 1000),
                     "duration": f"{int(dist*60*60/50)}s", # 50km/h avg
                     "duration_seconds": int(dist*60*60/50)
                 }

            h_copy = h.copy()
            h_copy.update(traffic_info)
            hospitals_with_traffic.append(h_copy)
            
        # 2. AI Decision Making
        patient_data = {"condition": condition, "severity": severity, "vitals": "See Input"}
        
        ai_decision = evaluate_hospitals_with_gemini(patient_data, hospitals_with_traffic)
        selected_id = ai_decision.get('selected_hospital_id')
        
        selected_hospital = next((h for h in hospitals_with_traffic if h['id'] == selected_id), hospitals_with_traffic[0])
        
        # 3. Get Polyline for Selected Route
        route_data = get_route_polyline(
            ambulance_location['lat'], ambulance_location['lon'],
            selected_hospital['lat'], selected_hospital['lon']
        )
        
        encoded_polyline = None
        if route_data:
            encoded_polyline = route_data['polyline']['encodedPolyline']

        # Format Result
        return {
            'selected': {
                'hospital': selected_hospital,
                'distance_km': round(selected_hospital['distance_meters'] / 1000, 1),
                'estimated_time_min': round(selected_hospital['duration_seconds'] / 60),
                'score': 0.99, # Semantic score from AI isn't numeric usually, mocking high confidence
                'selection_reason': ai_decision.get('reasoning', "Selected by AI based on real-time data."),
                'polyline': encoded_polyline
            },
            'alternatives': [
                {
                    'hospital': (h_obj := next((h for h in hospitals_with_traffic if h['id'] == alt_id), {})),
                    'score': 0.8,
                    'selection_reason': "Alternative option",
                    'estimated_time_min': round(h_obj.get('duration_seconds', 0) / 60),
                    'distance_km': round(h_obj.get('distance_meters', 0) / 1000, 1)
                }
                for alt_id in ai_decision.get('alternatives', [])
            ]
        }

    except Exception as e:
        print(f"Orchestration Error: {e}")
        # COMPLETE FALLBACK (Original Logic or simplified)
        # For safety, return the first hospital
        return {
            'selected': {
                'hospital': hospitals[0],
                'distance_km': 5.0,
                'estimated_time_min': 10,
                'score': 0.5,
                'selection_reason': "System Fallback: AI Service Unavailable",
                'polyline': None
            },
            'alternatives': []
        }
