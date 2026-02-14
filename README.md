# HospitalBid - AI-Powered Emergency Medical Dispatch System

A real-time emergency medical dispatch platform that uses AI to intelligently match ambulances with the most suitable hospitals based on patient condition, hospital capacity, traffic conditions, and medical specialties.

## 🚀 Features

- **AI-Assisted Triage**: Gemini AI analyzes patient descriptions to auto-detect conditions and severity
- **Smart Hospital Matching**: AI-powered algorithm considers multiple factors:
  - Patient condition and required specialties
  - Hospital bed availability (ICU, General, Emergency)
  - Real-time traffic conditions via Google Routes API
  - Distance and estimated arrival time
- **Live Tracking**: Real-time ambulance tracking with animated routes on interactive maps
- **Auto-Generated Vitals**: Sensor simulation generates realistic patient vitals based on severity
- **Hospital Dashboard**: Command center for hospitals to monitor incoming emergencies
- **Dual Interface**: Separate views for ambulance crews and hospital staff

## 🏗️ Architecture

### Frontend (React + Vite)
- **Framework**: React 18 with Vite
- **Routing**: React Router v6
- **Maps**: Leaflet.js with React-Leaflet
- **Animations**: Framer Motion
- **Styling**: Tailwind CSS
- **Icons**: Lucide React

### Backend (Python + Flask)
- **Framework**: Flask with CORS support
- **AI Integration**: Google Gemini API for intelligent decision-making
- **Maps Integration**: Google Routes API for traffic and routing
- **Data Storage**: JSON-based (hospitals, tracking data)

## 📋 Prerequisites

- **Node.js**: v16 or higher
- **Python**: 3.10 or higher
- **API Keys**:
  - Google Gemini API Key ([Get it here](https://ai.google.dev/))
  - Google Maps API Key with Routes API enabled ([Get it here](https://console.cloud.google.com/))

## 🔧 Installation & Setup

### 1. Clone the Repository
```bash
cd hospitalbid
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
# Copy the example below and add your API keys
```

**Create `backend/.env` file:**
```env
GEMINI_API_KEY=your_gemini_api_key_here
MAPS_API_KEY=your_google_maps_api_key_here
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install dependencies
npm install
```

## 🚀 Running the Application

### Start Backend Server

```bash
# From backend directory
cd backend
python app.py
```

Backend will run on: `http://localhost:5000`

### Start Frontend Development Server

```bash
# From frontend directory (in a new terminal)
cd frontend
npm run dev
```

Frontend will run on: `http://localhost:5173`

## 📱 Usage

### Ambulance Interface (`http://localhost:5173/`)

1. **Emergency Input**:
   - Use AI-assisted triage by describing the patient's condition
   - Or manually select condition and severity
   - Vitals are auto-generated from "sensors" based on severity

2. **AI Processing**:
   - Gemini AI analyzes patient data
   - Google Routes API calculates traffic-aware routes
   - System ranks hospitals by suitability

3. **Hospital Selection**:
   - View AI's recommended hospital with reasoning
   - See alternative options
   - Click "INITIATE TRANSPORT PROTOCOL"

4. **Live Tracking**:
   - Real-time map with animated route
   - Live ETA and distance updates
   - Speed telemetry display

### Hospital Dashboard (`http://localhost:5173/hospital`)

1. **Command Center View**:
   - Monitors for incoming emergencies
   - Displays patient vitals in real-time
   - Shows ambulance location on map

2. **Alert Panel**:
   - Critical incoming patient information
   - Auto-generated vitals from ambulance sensors
   - Preparation checklist for trauma team

## 🗂️ Project Structure

```
hospitalbid/
├── backend/
│   ├── app.py                 # Flask application entry point
│   ├── requirements.txt       # Python dependencies
│   ├── .env                   # API keys (create this)
│   ├── data/
│   │   ├── hospitals.json     # Hospital database
│   │   ├── emergencies.json   # Active emergencies
│   │   └── ambulance_tracking.json  # Tracking data
│   ├── routes/
│   │   ├── hospitals.py       # Hospital matching endpoints
│   │   ├── emergency.py       # Emergency management
│   │   └── tracking.py        # Live tracking endpoints
│   └── services/
│       ├── gemini_service.py  # Gemini AI integration
│       ├── google_maps_service.py  # Google Routes API
│       └── matching_algorithm.py   # Hospital matching logic
│
└── frontend/
    ├── package.json           # Node dependencies
    ├── vite.config.js         # Vite configuration
    ├── tailwind.config.js     # Tailwind CSS config
    └── src/
        ├── main.jsx           # App entry point
        ├── App.jsx            # Route configuration
        ├── pages/
        │   ├── AmbulanceApp.jsx      # Ambulance interface
        │   └── HospitalDashboard.jsx # Hospital interface
        ├── components/
        │   ├── ambulance/     # Ambulance-specific components
        │   ├── hospital/      # Hospital-specific components
        │   └── shared/        # Shared components (Map, etc.)
        ├── context/
        │   └── EmergencyContext.jsx  # Global state
        └── services/
            └── api.js         # API client
```

## 🔑 API Endpoints

### Hospital Matching
- `POST /api/hospitals/match` - Find best hospital for patient

### Emergency Management
- `POST /api/emergency/create` - Create new emergency
- `GET /api/emergency/active` - Get active emergencies

### Tracking
- `GET /api/tracking/:id` - Get live tracking data for emergency

## 🎨 Key Technologies

| Technology | Purpose |
|------------|---------|
| **Gemini AI** | Intelligent hospital selection reasoning |
| **Google Routes API** | Real-time traffic data and route polylines |
| **Leaflet.js** | Interactive map rendering |
| **React Context** | Global state management |
| **Framer Motion** | Smooth UI animations |
| **Flask-CORS** | Cross-origin resource sharing |

## 🐛 Troubleshooting

### Backend Issues

**API Key Errors:**
- Ensure `.env` file exists in `backend/` directory
- Verify API keys are valid and have proper permissions
- Google Maps API requires Routes API to be enabled

**Port Already in Use:**
```bash
# Change port in backend/app.py
app.run(debug=True, port=5001)  # Use different port
```

### Frontend Issues

**Map Not Displaying:**
- Check browser console for errors
- Verify backend is running on `http://localhost:5000`
- Ensure CORS is enabled in Flask

**Build Errors:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 🔒 Security Notes

- **Never commit `.env` files** to version control
- API keys should be kept secret and rotated regularly
- In production, use environment variables instead of `.env` files
- Implement proper authentication for hospital dashboards

## 📄 License

This project is for educational and demonstration purposes.

## 🤝 Contributing

This is a demonstration project. For improvements or bug reports, please create an issue.

## 📞 Support

For questions or issues:
1. Check the troubleshooting section above
2. Review browser console and terminal logs
3. Verify all dependencies are installed correctly
4. Ensure API keys are valid and properly configured

---

**Built with ❤️ using AI-powered intelligent dispatch**
