import requests
import os
import json

# You should set MAPS_API_KEY in your environment variables
# For hackathon quick usage, we check env or fallback (user must provide key if not in env)
MAPS_API_KEY = os.getenv("MAPS_API_KEY", "YOUR_API_KEY") 

def get_traffic_matrix(origin_lat, origin_lon, hospitals):
    """
    Calls Google Routes API ComputeRouteMatrix to get distance and duration (TRAFFIC_AWARE_OPTIMAL)
    for a list of hospitals.
    """
    url = "https://routes.googleapis.com/distanceMatrix/v2:computeRouteMatrix"
    
    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": MAPS_API_KEY,
        "X-Goog-FieldMask": "originIndex,destinationIndex,duration,distanceMeters,condition"
    }
    
    # Format Origin
    origins = [
        {"waypoint": {"location": {"latLng": {"latitude": origin_lat, "longitude": origin_lon}}}}
    ]
    
    # Format Destinations
    destinations = []
    for h in hospitals:
        destinations.append(
            {"waypoint": {"location": {"latLng": {"latitude": h['lat'], "longitude": h['lon']}}}}
        )
    
    payload = {
        "origins": origins,
        "destinations": destinations,
        "travelMode": "DRIVE",
        "routingPreference": "TRAFFIC_AWARE_OPTIMAL"
    }
    
    try:
        response = requests.post(url, headers=headers, json=payload)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"Error fetching traffic matrix: {e}")
        return []

def get_route_polyline(origin_lat, origin_lon, dest_lat, dest_lon):
    """
    Calls Google Routes API ComputeRoutes to get the polyline for the selected route.
    """
    url = "https://routes.googleapis.com/directions/v2:computeRoutes"
    
    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": MAPS_API_KEY,
        "X-Goog-FieldMask": "routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline"
    }
    
    payload = {
        "origin": {"location": {"latLng": {"latitude": origin_lat, "longitude": origin_lon}}},
        "destination": {"location": {"latLng": {"latitude": dest_lat, "longitude": dest_lon}}},
        "travelMode": "DRIVE",
        "routingPreference": "TRAFFIC_AWARE_OPTIMAL",
        "computeAlternativeRoutes": False
    }
    
    try:
        response = requests.post(url, headers=headers, json=payload)
        response.raise_for_status()
        data = response.json()
        if data.get('routes'):
            return data['routes'][0]
        return None
    except requests.exceptions.HTTPError as e:
        if e.response.status_code == 400:
             print("Google Maps API-Key Error or Bad Request (Verify Keys in .env)")
        else:
             print(f"Error fetching route polyline: {e}")
        return None
    except Exception as e:
        print(f"Error fetching route polyline: {e}")
        return None
