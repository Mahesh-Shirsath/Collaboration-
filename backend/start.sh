#!/bin/bash

echo "🚀 Starting Framework Hub Backend..."

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "❌ Virtual environment not found. Please run ./setup.sh first."
    exit 1
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Check if MongoDB is needed and running (optional)
if command -v mongod &> /dev/null; then
    if ! pgrep -x "mongod" > /dev/null; then
        echo "⚠️  MongoDB is not running. Database features will use fallback mode."
        echo "   To start MongoDB: mongod --dbpath ./data"
        echo "   Or install MongoDB: https://docs.mongodb.com/manual/installation/"
    else
        echo "✅ MongoDB is running"
    fi
else
    echo "⚠️  MongoDB not installed. Database features will use fallback mode."
fi

# Set environment variables
export MONGODB_URL=${MONGODB_URL:-"mongodb://localhost:27017"}
export PYTHONPATH="${PYTHONPATH}:$(pwd)"

# Start FastAPI server
echo "🌟 Starting FastAPI server..."
echo "   API: http://localhost:8000"
echo "   Docs: http://localhost:8000/docs"
echo "   Health: http://localhost:8000/api/health"
echo ""
echo "Press Ctrl+C to stop the server"

python main.py
