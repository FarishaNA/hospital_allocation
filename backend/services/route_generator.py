def generate_route_path(start_location, end_location, estimated_time_min):
    """
    Generate realistic waypoints between start and end for ambulance tracking simulation.
    
    Args:
        start_location: Dict with 'lat', 'lon' keys
        end_location: Dict with 'lat', 'lon', optional 'name' keys
        estimated_time_min: Total estimated travel time in minutes
    
    Returns:
        List of waypoint dicts with lat, lon, timestamp, location
    """
    NUM_WAYPOINTS = 10  # Smooth animation with 10 intermediate points
    waypoints = []
    
    # Realistic location names for Kerala roads
    location_names = [
        "Pickup Point",
        "Pickup Point",  # Stay at start briefly
        "Main Road",
        "City Center",
        "Bypass Junction",
        "Highway Entry",
        "NH Route",
        "Hospital Junction",
        "Hospital Road",
        "Hospital Entrance",
        end_location.get('name', 'Hospital')
    ]
    
    total_seconds = int(estimated_time_min * 60)
    
    for i in range(NUM_WAYPOINTS + 1):
        ratio = i / NUM_WAYPOINTS
        
        # Linear interpolation between start and end
        lat = start_location['lat'] + (end_location['lat'] - start_location['lat']) * ratio
        lon = start_location['lon'] + (end_location['lon'] - start_location['lon']) * ratio
        
        # Timestamp progresses linearly
        timestamp = int(total_seconds * ratio)
        
        # Pick appropriate location name based on progress
        loc_idx = min(int(ratio * (len(location_names) - 1)), len(location_names) - 1)
        
        waypoints.append({
            "lat": round(lat, 6),
            "lon": round(lon, 6),
            "timestamp": timestamp,
            "location": location_names[loc_idx]
        })
    
    return waypoints