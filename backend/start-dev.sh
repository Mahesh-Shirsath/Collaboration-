#!/bin/bash

echo "🚀 Starting Framework Hub Backend (Development Mode)..."

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "❌ Virtual environment not found. Please run ./setup.sh first."
    exit 1
fi

# Activate virtual environment
source venv/bin/activate

# Set environment variables for development
export MONGODB_URL=${MONGODB_URL:-"mongodb://localhost:27017"}
export PYTHONPATH="${PYTHONPATH}:$(pwd)"

# Start FastAPI server with auto-reload
echo "🌟 Starting FastAPI server in development mode (auto-reload enabled)..."
echo "   API: http://localhost:8000"
echo "   Docs: http://localhost:8000/docs"
echo "   Health: http://localhost:8000/api/health"
echo ""
echo "Press Ctrl+C to stop the server"

uvicorn main:app --host 0.0.0.0 --port 8000 --reload
