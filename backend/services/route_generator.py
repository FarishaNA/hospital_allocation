from services.distance_calculator import calculate_haversine_distance

def generate_route_path(start_location, end_location, estimated_time_min):
    """
    Generate realistic waypoints between start and end
    """
    NUM_WAYPOINTS = 10  # More points for smoother animation (if needed for interpolation)
    waypoints = []
    
    location_names = [
        "Pickup Point",
        "Main Street",
        "City Center Junction", 
        "Bypass Junction",
        "Highway Exit",
        "Hospital Road",
        f"{end_location.get('name', 'Hospital')}"
    ]
    
    total_seconds = int(estimated_time_min * 60)
    
    for i in range(NUM_WAYPOINTS + 1):
        ratio = i / NUM_WAYPOINTS
        
        # Linear interpolation
        lat = start_location['lat'] + (end_location['lat'] - start_location['lat']) * ratio
        lon = start_location['lon'] + (end_location['lon'] - start_location['lon']) * ratio
        
        timestamp = int(total_seconds * ratio)
        
        # Pick a location display name roughly based on progress
        loc_idx = min(int(ratio * (len(location_names) - 1)), len(location_names) - 1)
        
        waypoints.append({
            "lat": round(lat, 6),
            "lon": round(lon, 6),
            "timestamp": timestamp,
            "location": location_names[loc_idx]
        })
        
    return waypoints
