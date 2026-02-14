import google.generativeai as genai
import os
import json
import re

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

if GEMINI_API_KEY and GEMINI_API_KEY != "YOUR_API_KEY":
    genai.configure(api_key=GEMINI_API_KEY)

def evaluate_hospitals_with_gemini(patient, hospitals_with_traffic):
    """
    Uses Gemini AI to select the optimal hospital based on patient condition and traffic.
    Falls back to heuristic if API is unavailable.
    """
    
    if not GEMINI_API_KEY or GEMINI_API_KEY == "YOUR_API_KEY":
        print("⚠️  No valid GEMINI_API_KEY - using heuristic fallback")
        return heuristic_hospital_selection(patient, hospitals_with_traffic)
    
    try:
        model = genai.GenerativeModel('gemini-2.0-flash-exp')
        
        # Create simplified hospital data for AI (remove clutter)
        simplified_hospitals = []
        for h in hospitals_with_traffic:
            simplified_hospitals.append({
                'id': h['id'],
                'name': h['name'],
                'specialties': h.get('specialties', []),
                'distance_km': round(h.get('distance_meters', 0) / 1000, 1),
                'travel_time_min': round(h.get('duration_seconds', 0) / 60),
                'icu_available': h.get('beds', {}).get('icu_available', 0),
                'general_beds_available': h.get('beds', {}).get('general_available', 0),
                'specialists': h.get('specialists', {}),
                'facilities': h.get('facilities', {}),
                'success_rate': h.get('success_rates', {}).get(patient.get('condition'), 0.8)
            })
        
        prompt = f"""You are an AI Emergency Dispatcher. Select the BEST hospital to save this patient's life.

PATIENT:
- Condition: {patient.get('condition')}
- Severity: {patient.get('severity')}

HOSPITALS (with real-time traffic):
{json.dumps(simplified_hospitals, indent=2)}

DECISION RULES:
1. CRITICAL severity → Prioritize SPEED (shortest travel_time_min) + specialist availability
2. MODERATE/STABLE → Balance success_rate, specialist match, and reasonable travel time
3. Always check if hospital has required specialty
4. ICU beds matter for critical cases

Return ONLY valid JSON (no markdown):
{{
  "selected_hospital_id": <number>,
  "reasoning": "<1-2 sentence explanation mentioning time/specialist/success rate>",
  "alternatives": [<2nd best id>, <3rd best id>]
}}"""
        
        response = model.generate_content(prompt)
        text = response.text.strip()
        
        # Clean markdown formatting if present
        text = re.sub(r'```json\s*', '', text)
        text = re.sub(r'```\s*', '', text)
        text = text.strip()
        
        result = json.loads(text)
        
        # Validate response
        if 'selected_hospital_id' not in result:
            raise ValueError("AI response missing selected_hospital_id")
        
        print(f"✅ Gemini AI selected Hospital #{result['selected_hospital_id']}")
        return result
        
    except json.JSONDecodeError as e:
        print(f"❌ Gemini returned invalid JSON: {e}")
        print(f"   Raw response: {text[:200]}")
        return heuristic_hospital_selection(patient, hospitals_with_traffic)
    except Exception as e:
        print(f"❌ Gemini API Error: {e}")
        return heuristic_hospital_selection(patient, hospitals_with_traffic)


def heuristic_hospital_selection(patient, hospitals_with_traffic):
    """
    Fallback logic when AI is unavailable.
    Prioritizes based on severity, specialty match, and distance.
    """
    condition = patient.get('condition', '')
    severity = patient.get('severity', 'moderate')
    
    scored_hospitals = []
    
    for h in hospitals_with_traffic:
        score = 0
        
        # Check specialty match
        specialties = h.get('specialties', [])
        specialty_match = condition in specialties or any(
            condition in s for s in specialties
        )
        if specialty_match:
            score += 50
        
        # ICU availability (critical for severe cases)
        icu_available = h.get('beds', {}).get('icu_available', 0)
        if severity == 'critical' and icu_available > 0:
            score += 30
        elif icu_available > 0:
            score += 10
        
        # Travel time penalty (less time = higher score)
        travel_time_min = h.get('duration_seconds', 9999) / 60
        if severity == 'critical':
            score += max(0, 100 - travel_time_min * 5)  # Heavy penalty for time
        else:
            score += max(0, 50 - travel_time_min * 2)
        
        # Success rate bonus
        success_rate = h.get('success_rates', {}).get(condition, 0.8)
        score += success_rate * 20
        
        scored_hospitals.append((h, score))
    
    # Sort by score descending
    scored_hospitals.sort(key=lambda x: x[1], reverse=True)
    
    best = scored_hospitals[0][0]
    alternatives = [h[0]['id'] for h in scored_hospitals[1:3]]
    
    return {
        "selected_hospital_id": best['id'],
        "reasoning": f"Heuristic selection: {best['name']} chosen for {condition} based on specialty match, {round(best.get('duration_seconds', 0)/60)} min travel time, and facility availability.",
        "alternatives": alternatives
    }