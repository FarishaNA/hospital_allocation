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
    return jsonify({"hospitals": load_hospitals()})

@hospitals_bp.route('/match', methods=['POST'])
def match_hospital():
    data = request.json
    condition = data.get('condition')
    severity = data.get('severity')
    location = data.get('location') # {lat, lon}
    
    hospitals = load_hospitals()
    
    result = select_optimal_hospital(condition, severity, location, hospitals)
    
    return jsonify(result)
