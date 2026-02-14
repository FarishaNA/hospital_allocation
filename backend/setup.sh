#!/bin/bash

echo "=========================================="
echo "🚑 HospitalBid Backend Setup"
echo "=========================================="
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.10+"
    exit 1
fi

echo "✅ Python found: $(python3 --version)"
echo ""

# Check if pip is installed
if ! command -v pip3 &> /dev/null; then
    echo "❌ pip3 is not installed"
    exit 1
fi

echo "✅ pip found"
echo ""

# Install dependencies
echo "📦 Installing Python dependencies..."
pip3 install -r requirements.txt --quiet --break-system-packages 2>/dev/null || pip3 install -r requirements.txt --quiet

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi
echo ""

# Check for .env file
if [ ! -f .env ]; then
    echo "⚠️  No .env file found"
    echo "📝 Creating .env from template..."
    cp .env.example .env
    echo "✅ .env file created"
    echo ""
    echo "⚠️  IMPORTANT: Edit .env and add your API keys:"
    echo "   - GEMINI_API_KEY (get from: https://aistudio.google.com/app/apikey)"
    echo "   - MAPS_API_KEY (get from: https://console.cloud.google.com/)"
    echo ""
    echo "   Note: App will work without keys using fallback logic,"
    echo "         but AI features will be limited."
    echo ""
else
    echo "✅ .env file exists"
    
    # Check if keys are configured
    if grep -q "YOUR_API_KEY\|your_.*_key_here" .env; then
        echo "⚠️  API keys not configured in .env"
        echo "   Edit .env to add your actual API keys"
    else
        echo "✅ API keys appear to be configured"
    fi
fi
echo ""

# Check data files
if [ ! -f data/hospitals.json ]; then
    echo "❌ data/hospitals.json not found"
    exit 1
fi

if [ ! -f data/active_emergencies.json ]; then
    echo "📝 Creating active_emergencies.json..."
    echo '{"emergencies": []}' > data/active_emergencies.json
fi

if [ ! -f data/ambulance_tracking.json ]; then
    echo "📝 Creating ambulance_tracking.json..."
    echo '{"ambulances": []}' > data/ambulance_tracking.json
fi

echo "✅ Data files ready"
echo ""

echo "=========================================="
echo "✅ Setup Complete!"
echo "=========================================="
echo ""
echo "🚀 To start the server:"
echo "   python3 app.py"
echo ""
echo "🧪 To test the backend:"
echo "   python3 test_backend.py"
echo ""
echo "📚 For detailed setup info:"
echo "   cat SETUP.md"
echo ""