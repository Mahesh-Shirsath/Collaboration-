#!/bin/bash

echo "🚀 Setting up Framework Hub Backend (No Docker)"

# Check if Python 3 is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8+ first."
    exit 1
fi

# Check if pip is installed
if ! command -v pip3 &> /dev/null; then
    echo "❌ pip3 is not installed. Please install pip first."
    exit 1
fi

# Create virtual environment
echo "📦 Creating virtual environment..."
python3 -m venv venv

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Upgrade pip
echo "⬆️ Upgrading pip..."
pip install --upgrade pip

# Install dependencies
echo "📚 Installing Python dependencies..."
pip install -r requirements.txt

echo "✅ Backend setup complete!"
echo ""
echo "🔗 Next steps:"
echo "   1. Start MongoDB (if using database features):"
echo "      - Install MongoDB: https://docs.mongodb.com/manual/installation/"
echo "      - Start MongoDB: mongod --dbpath ./data"
echo ""
echo "   2. Start the FastAPI server:"
echo "      - Run: ./start.sh"
echo "      - Or manually: source venv/bin/activate && python main.py"
echo ""
echo "   3. Access the API:"
echo "      - API: http://localhost:8000"
echo "      - Docs: http://localhost:8000/docs"
echo "      - Health: http://localhost:8000/api/health"
