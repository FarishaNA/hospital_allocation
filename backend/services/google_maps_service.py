import requests
import os
import json

MAPS_API_KEY = os.getenv("MAPS_API_KEY", "")

def get_traffic_matrix(origin_lat, origin_lon, hospitals):
    """
    Calls Google Routes API ComputeRouteMatrix to get distance and duration with traffic.
    Returns a list of route info matching hospital order.
    """
    if not MAPS_API_KEY or MAPS_API_KEY == "YOUR_API_KEY":
        print("⚠️  No valid MAPS_API_KEY - using fallback calculations")
        return None
    
    url = "https://routes.googleapis.com/distanceMatrix/v2:computeRouteMatrix"
    
    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": MAPS_API_KEY,
        "X-Goog-FieldMask": "originIndex,destinationIndex,duration,distanceMeters,status,condition"
    }
    
    origins = [{
        "waypoint": {
            "location": {
                "latLng": {
                    "latitude": origin_lat,
                    "longitude": origin_lon
                }
            }
        }
    }]
    
    destinations = [{
        "waypoint": {
            "location": {
                "latLng": {
                    "latitude": h['lat'],
                    "longitude": h['lon']
                }
            }
        }
    } for h in hospitals]
    
    payload = {
        "origins": origins,
        "destinations": destinations,
        "travelMode": "DRIVE",
        "routingPreference": "TRAFFIC_AWARE_OPTIMAL"
    }
    
    try:
        response = requests.post(url, headers=headers, json=payload, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        # Parse the response correctly - it returns array of route elements
        results = []
        if data and isinstance(data, list):
            # Response is an array of route elements
            for element in data:
                if element.get('status') == 'OK':
                    results.append({
                        'distanceMeters': element.get('distanceMeters', 0),
                        'duration': element.get('duration', '0s'),
                        'destinationIndex': element.get('destinationIndex', 0)
                    })
        
        # Sort by destination index to match hospital order
        results.sort(key=lambda x: x.get('destinationIndex', 0))
        return results
        
    except requests.exceptions.HTTPError as e:
        if e.response.status_code == 400:
            print(f"❌ Google Maps API Error 400: {e.response.text[:200]}")
            print("   Check that Routes API is enabled in Google Cloud Console")
        elif e.response.status_code == 403:
            print("❌ Google Maps API Error 403: Invalid API key or API not enabled")
        else:
            print(f"❌ Google Maps API HTTP Error: {e}")
        return None
    except Exception as e:
        print(f"❌ Error fetching traffic matrix: {e}")
        return None


def get_route_polyline(origin_lat, origin_lon, dest_lat, dest_lon):
    """
    Calls Google Routes API ComputeRoutes to get the polyline for the selected route.
    """
    if not MAPS_API_KEY or MAPS_API_KEY == "YOUR_API_KEY":
        print("⚠️  No valid MAPS_API_KEY - skipping polyline fetch")
        return None
        
    url = "https://routes.googleapis.com/directions/v2:computeRoutes"
    
    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": MAPS_API_KEY,
        "X-Goog-FieldMask": "routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline"
    }
    
    payload = {
        "origin": {
            "location": {
                "latLng": {
                    "latitude": origin_lat,
                    "longitude": origin_lon
                }
            }
        },
        "destination": {
            "location": {
                "latLng": {
                    "latitude": dest_lat,
                    "longitude": dest_lon
                }
            }
        },
        "travelMode": "DRIVE",
        "routingPreference": "TRAFFIC_AWARE_OPTIMAL",
        "computeAlternativeRoutes": False
    }
    
    try:
        response = requests.post(url, headers=headers, json=payload, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        if data.get('routes') and len(data['routes']) > 0:
            route = data['routes'][0]
            return {
                'polyline': route.get('polyline', {}),
                'duration': route.get('duration', '0s'),
                'distanceMeters': route.get('distanceMeters', 0)
            }
        return None
        
    except requests.exceptions.HTTPError as e:
        print(f"❌ Error fetching route polyline (HTTP {e.response.status_code}): {e.response.text[:200]}")
        return None
    except Exception as e:
        print(f"❌ Error fetching route polyline: {e}")
        return None