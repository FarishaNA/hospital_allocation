import google.generativeai as genai
import os
import json

# Setup Gemini
# Ensure GEMINI_API_KEY is in env or replace here
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "YOUR_API_KEY")

genai.configure(api_key=GEMINI_API_KEY)

def evaluate_hospitals_with_gemini(patient, hospitals_with_traffic):
    """
    Uses Gemini 2.5 Flash to select the optimal hospital.
    """
    
    model = genai.GenerativeModel('gemini-2.0-flash-exp')
    
    prompt = f"""
    You are an AI Dispatcher for Emergency Services. Your goal is to select the OPTIMAL hospital for a patient to save their life.
    
    PATIENT DATA:
    - Condition: {patient.get('condition')}
    - Severity: {patient.get('severity')}
    - Vitals: {patient.get('vitals')}
    
    CANDIDATE HOSPITALS (Real-time Traffic Data Included):
    {json.dumps(hospitals_with_traffic, indent=2)}
    
    DECISION LOGIC:
    1. CRITICAL PRIORITY: If Severity is CRITICAL, prioritize Travel Time (duration) and ICU/Specialist availability. A slightly further hospital is okay ONLY if the nearest one lacks the specific specialist needed.
    2. STABLE PRIORITY: Prioritize Highest Success Rate and Specialist Match over Speed.
    3. TRAFFIC AWARENESS: 'duration' is the real-time drive time in seconds. Use this for speed comparison.
    
    OUTPUT FORMAT (JSON ONLY):
    {{
      "selected_hospital_id": <id>,
      "reasoning": "<Concise, professional reason explaining why this specific hospital was chosen over others. Mention time saved or specialist availability.>",
      "alternatives": [<id_of_2nd_best>, <id_of_3rd_best>]
    }}
    
    Do not include markdown formatting like ```json. Just return the raw JSON string.
    """
    
    try:
        response = model.generate_content(prompt)
        # Clean response if it has markdown
        text = response.text.replace('```json', '').replace('```', '').strip()
        return json.loads(text)
    except Exception as e:
        print(f"Gemini API Error: {e}")
        # Fallback to simple logic if AI fails
        sorted_hospitals = sorted(hospitals_with_traffic, key=lambda x: x.get('duration_seconds', 9999))
        return {
            "selected_hospital_id": sorted_hospitals[0]['id'],
            "reasoning": "Fallback: Nearest hospital selected (AI Unavailable).",
            "alternatives": [h['id'] for h in sorted_hospitals[1:3]]
        }
