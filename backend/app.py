from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
import json
import os
from routes.hospitals import hospitals_bp

# Load environment variables from .env
load_dotenv()

from routes.emergency import emergency_bp
from routes.tracking import tracking_bp

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Register Blueprints
app.register_blueprint(hospitals_bp, url_prefix='/api/hospitals')
app.register_blueprint(emergency_bp, url_prefix='/api/emergency')
app.register_blueprint(tracking_bp, url_prefix='/api/tracking')

@app.route('/')
def home():
    return jsonify({"message": "HospitalBid API is running", "status": "online"})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
