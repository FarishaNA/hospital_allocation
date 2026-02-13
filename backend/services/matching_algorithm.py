import math
import json

# Mapping: Patient condition -> Required specialist
CONDITION_TO_SPECIALTY = {
    "cardiac_arrest": "cardiologist",
    "trauma": "trauma_surgeon",
    "stroke": "neurologist",
    "fracture": "orthopedic_surgeon",
    "respiratory": "pulmonologist",
    "other": "general_physician"
}

def calculate_haversine_distance(coord1, coord2):
    """
    Calculate distance between two lat/lon points in kilometers
    """
    lat1, lon1 = coord1
    lat2, lon2 = coord2
    
    R = 6371  # Earth's radius in km
    
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    
    a = (math.sin(dlat/2) ** 2 + 
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * 
         math.sin(dlon/2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    
    return round(R * c, 2)

def generate_selection_reason(hospital, specialist_info, beds_available, success_rate, distance_km):
    reasons = []
    if specialist_info.get('available', False):
        reasons.append(f"{specialist_info.get('name', 'Specialist')} available NOW")
    if beds_available > 0:
        reasons.append(f"{beds_available} bed(s) available")
    if success_rate >= 0.90:
        reasons.append(f"{int(success_rate*100)}% success rate")
    if distance_km < 5:
        reasons.append("Fastest option")
    if not reasons:
        reasons.append("Best available option")
    return ", ".join(reasons)

def select_optimal_hospital(condition, severity, ambulance_location, hospitals):
    """
    Select the best hospital using multi-factor scoring
    """
    scored_hospitals = []
    required_specialty = CONDITION_TO_SPECIALTY.get(condition, "general_physician")
    
    for hospital in hospitals:
        # 1. DISTANCE SCORE (40%)
        distance_km = calculate_haversine_distance(
            (ambulance_location['lat'], ambulance_location['lon']),
            (hospital['lat'], hospital['lon'])
        )
        distance_score = max(0.0, 1 - (distance_km / 15)) if distance_km <= 15 else 0.0
        
        # 2. SPECIALTY MATCH (30%)
        specialist_info = hospital['specialists'].get(required_specialty, {})
        specialty_score = 0.0
        if specialist_info.get('available', False):
            specialty_score = 1.0
        elif "20 min" in specialist_info.get('availability_text', ''):
            specialty_score = 0.6
        elif "30 min" in specialist_info.get('availability_text', ''):
            specialty_score = 0.4
        
        # 3. BED AVAILABILITY (20%)
        required_bed_type = "icu_available" if severity == "critical" else "general_available"
        beds_available = hospital['beds'].get(required_bed_type, 0)
        bed_score = 1.0 if beds_available > 0 else 0.0
        
        # 4. SUCCESS RATE (10%)
        success_rate = hospital['success_rates'].get(condition, 0.75)
        success_score = success_rate
        
        # Total Weighted Score
        total_score = (
            distance_score * 0.4 +
            specialty_score * 0.3 +
            bed_score * 0.2 +
            success_score * 0.1
        )
        
        scored_hospitals.append({
            'hospital': hospital,
            'score': round(total_score, 3),
            'distance_km': distance_km,
            'estimated_time_min': round((distance_km / 50) * 60, 0), # 50 km/h avg
            'selection_reason': generate_selection_reason(
                hospital, specialist_info, beds_available, success_rate, distance_km
            )
        })
    
    # Sort and return
    scored_hospitals.sort(key=lambda x: x['score'], reverse=True)
    return {
        'selected': scored_hospitals[0],
        'alternatives': scored_hospitals[1:3]
    }
