from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

from routes.hospitals import hospitals_bp
from routes.emergency import emergency_bp
from routes.tracking import tracking_bp

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend communication

# Register API Blueprints
app.register_blueprint(hospitals_bp, url_prefix='/api/hospitals')
app.register_blueprint(emergency_bp, url_prefix='/api/emergency')
app.register_blueprint(tracking_bp, url_prefix='/api/tracking')

@app.route('/')
def home():
    """Health check endpoint"""
    return jsonify({
        "message": "🚑 HospitalBid API is running",
        "status": "online",
        "endpoints": {
            "hospitals": "/api/hospitals",
            "match": "/api/hospitals/match",
            "emergency_create": "/api/emergency/create",
            "emergency_active": "/api/emergency/active",
            "tracking": "/api/tracking/<emergency_id>"
        }
    })

@app.route('/health')
def health():
    """Detailed health check with API key status"""
    gemini_configured = bool(os.getenv('GEMINI_API_KEY') and os.getenv('GEMINI_API_KEY') != 'YOUR_API_KEY')
    maps_configured = bool(os.getenv('MAPS_API_KEY') and os.getenv('MAPS_API_KEY') != 'YOUR_API_KEY')
    
    return jsonify({
        "status": "healthy",
        "api_keys": {
            "gemini": "✅ Configured" if gemini_configured else "❌ Not configured",
            "google_maps": "✅ Configured" if maps_configured else "❌ Not configured"
        },
        "note": "Application will use fallback logic if APIs are not configured"
    })

if __name__ == '__main__':
    print("\n" + "="*60)
    print("🚑 HospitalBid Emergency Dispatch System")
    print("="*60)
    print("\n📡 Starting backend server on http://localhost:5000")
    print("\n🔑 API Key Status:")
    print(f"   Gemini AI: {'✅ Configured' if os.getenv('GEMINI_API_KEY') and os.getenv('GEMINI_API_KEY') != 'YOUR_API_KEY' else '❌ Not configured (using fallback)'}")
    print(f"   Google Maps: {'✅ Configured' if os.getenv('MAPS_API_KEY') and os.getenv('MAPS_API_KEY') != 'YOUR_API_KEY' else '❌ Not configured (using fallback)'}")
    print("\n📝 Endpoints available:")
    print("   GET  /              - Health check")
    print("   GET  /health        - Detailed status")
    print("   POST /api/hospitals/match  - Match hospital")
    print("   POST /api/emergency/create - Create emergency")
    print("   GET  /api/emergency/active - Get active emergency")
    print("   GET  /api/tracking/<id>    - Track ambulance")
    print("\n" + "="*60 + "\n")
    
    app.run(debug=True, port=5000)