import math

def calculate_haversine_distance(coord1, coord2):
    """
    Calculate distance between two lat/lon points in kilometers using Haversine formula.
    
    Args:
        coord1: Tuple of (latitude, longitude)
        coord2: Tuple of (latitude, longitude)
    
    Returns:
        Distance in kilometers (float)
    """
    lat1, lon1 = coord1
    lat2, lon2 = coord2
    
    # Earth's radius in kilometers
    R = 6371
    
    # Convert to radians
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    
    # Haversine formula
    a = (math.sin(dlat/2) ** 2 + 
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * 
         math.sin(dlon/2) ** 2)
    
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    
    distance = R * c
    
    return round(distance, 2)