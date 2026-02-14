import json
from services.google_maps_service import get_traffic_matrix, get_route_polyline
from services.gemini_service import evaluate_hospitals_with_gemini
from services.distance_calculator import calculate_haversine_distance

def select_optimal_hospital(condition, severity, ambulance_location, hospitals):
    """
    Select the optimal hospital using Real-Time Traffic (Google Routes) and AI Decision (Gemini).
    Falls back gracefully to Haversine calculations if APIs are unavailable.
    """
    
    print(f"\n🚨 Emergency: {condition} ({severity})")
    print(f"📍 Ambulance at: {ambulance_location['lat']}, {ambulance_location['lon']}")
    
    # Step 1: Get real-time traffic data
    matrix_response = get_traffic_matrix(
        ambulance_location['lat'], 
        ambulance_location['lon'], 
        hospitals
    )
    
    # Step 2: Enrich hospital data with traffic/distance info
    hospitals_with_traffic = []
    
    for i, h in enumerate(hospitals):
        h_copy = h.copy()
        
        # Try to use real traffic data
        if matrix_response and i < len(matrix_response):
            element = matrix_response[i]
            distance_meters = element.get('distanceMeters', 0)
            duration_str = element.get('duration', '0s')
            
            # Parse duration string (e.g., "345s" -> 345)
            duration_seconds = int(duration_str.rstrip('s')) if duration_str.endswith('s') else 0
            
            h_copy['distance_meters'] = distance_meters
            h_copy['duration'] = duration_str
            h_copy['duration_seconds'] = duration_seconds
            
            print(f"  ✓ {h['name']}: {round(distance_meters/1000, 1)}km, {round(duration_seconds/60)}min (traffic-aware)")
        else:
            # Fallback: Haversine distance + estimate
            dist_km = calculate_haversine_distance(
                (ambulance_location['lat'], ambulance_location['lon']),
                (h['lat'], h['lon'])
            )
            
            # Estimate time: urban = 30km/h, highway = 50km/h
            avg_speed_kmh = 35  # Conservative urban estimate
            duration_seconds = int((dist_km / avg_speed_kmh) * 3600)
            
            h_copy['distance_meters'] = int(dist_km * 1000)
            h_copy['duration'] = f"{duration_seconds}s"
            h_copy['duration_seconds'] = duration_seconds
            
            print(f"  ⚠ {h['name']}: {dist_km}km, ~{round(duration_seconds/60)}min (estimated)")
        
        hospitals_with_traffic.append(h_copy)
    
    # Step 3: AI Decision Making
    patient_data = {
        "condition": condition,
        "severity": severity,
        "vitals": "Sensor data pending"
    }
    
    ai_decision = evaluate_hospitals_with_gemini(patient_data, hospitals_with_traffic)
    selected_id = ai_decision.get('selected_hospital_id')
    
    # Find the selected hospital
    selected_hospital = next(
        (h for h in hospitals_with_traffic if h['id'] == selected_id),
        hospitals_with_traffic[0]  # Fallback to first if ID not found
    )
    
    print(f"\n✅ SELECTED: {selected_hospital['name']}")
    print(f"   Reason: {ai_decision.get('reasoning', 'N/A')}")
    
    # Step 4: Get detailed route polyline for map visualization
    route_data = get_route_polyline(
        ambulance_location['lat'],
        ambulance_location['lon'],
        selected_hospital['lat'],
        selected_hospital['lon']
    )
    
    encoded_polyline = None
    if route_data and 'polyline' in route_data:
        encoded_polyline = route_data['polyline'].get('encodedPolyline')
        if encoded_polyline:
            print(f"   📍 Route polyline fetched ({len(encoded_polyline)} chars)")
    
    # Step 5: Format response
    return {
        'selected': {
            'hospital': selected_hospital,
            'distance_km': round(selected_hospital['distance_meters'] / 1000, 1),
            'estimated_time_min': round(selected_hospital['duration_seconds'] / 60),
            'score': 0.95,  # Confidence score
            'selection_reason': ai_decision.get('reasoning', "Selected by AI based on real-time data."),
            'polyline': encoded_polyline
        },
        'alternatives': [
            {
                'hospital': alt_hospital,
                'score': 0.75,
                'selection_reason': "Alternative option",
                'estimated_time_min': round(alt_hospital.get('duration_seconds', 0) / 60),
                'distance_km': round(alt_hospital.get('distance_meters', 0) / 1000, 1)
            }
            for alt_id in ai_decision.get('alternatives', [])
            if (alt_hospital := next((h for h in hospitals_with_traffic if h['id'] == alt_id), None))
        ]
    }