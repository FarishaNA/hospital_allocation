from flask import Blueprint, jsonify, request
import json
import os
from services.matching_algorithm import select_optimal_hospital

hospitals_bp = Blueprint('hospitals', __name__)

DATA_PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'hospitals.json')

def load_hospitals():
    with open(DATA_PATH, 'r') as f:
        return json.load(f).get('hospitals', [])

@hospitals_bp.route('/', methods=['GET'])
def get_hospitals():
    """Get all hospitals"""
    return jsonify({"hospitals": load_hospitals()})

@hospitals_bp.route('/match', methods=['POST'])
def match_hospital():
    """
    Match optimal hospital for a patient.
    
    Expects:
    {
        "condition": "cardiac_arrest",
        "severity": "critical",
        "location": {"lat": 9.6667, "lon": 76.5667}
    }
    
    Returns:
    {
        "selected": {...},
        "alternatives": [...]
    }
    """
    data = request.json
    condition = data.get('condition')
    severity = data.get('severity')
    location = data.get('location')  # {lat, lon}
    
    if not condition or not severity or not location:
        return jsonify({"error": "Missing required fields: condition, severity, location"}), 400
    
    hospitals = load_hospitals()
    
    result = select_optimal_hospital(condition, severity, location, hospitals)
    
    return jsonify(result)