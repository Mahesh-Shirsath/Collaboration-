# Framework Hub Backend

A FastAPI-based backend for the Framework Hub platform with flexible storage options.

## Features

- **No Docker Required**: Simple Python virtual environment setup
- **Flexible Storage**: Automatically falls back to in-memory storage if MongoDB is not available
- **Jenkins Integration**: Trigger Jenkins jobs via `jenkins.py` script
- **CORS Enabled**: Ready for frontend integration
- **Auto-Documentation**: Swagger UI available at `/docs`

## Quick Start

### 1. Setup Backend

\`\`\`bash
# Navigate to backend directory
cd backend

# Make scripts executable
chmod +x setup.sh start.sh start-dev.sh

# Run setup (creates virtual environment and installs dependencies)
./setup.sh
\`\`\`

### 2. Start the Server

**Production Mode:**
\`\`\`bash
./start.sh
\`\`\`

**Development Mode (with auto-reload):**
\`\`\`bash
./start-dev.sh
\`\`\`

**Manual Start:**
\`\`\`bash
# Activate virtual environment
source venv/bin/activate

# Start server
python main.py
\`\`\`

## Storage Options

### Option 1: In-Memory Storage (Default)
- **No setup required**
- **Perfect for development and testing**
- **Data is lost when server restarts**

### Option 2: MongoDB Storage (Optional)
- **Persistent data storage**
- **Production ready**

**Install MongoDB:**
\`\`\`bash
# macOS
brew install mongodb-community

# Ubuntu/Debian
sudo apt-get install mongodb

# Or follow: https://docs.mongodb.com/manual/installation/
\`\`\`

**Start MongoDB:**
\`\`\`bash
# Create data directory
mkdir -p ./data

# Start MongoDB
mongod --dbpath ./data
\`\`\`

## API Endpoints

### Health Check
- `GET /api/health` - Check server status and storage type

### Build Logs
- `POST /api/build-logs` - Create build log
- `GET /api/build-logs` - List build logs (with filtering)
- `GET /api/build-logs/{build_id}` - Get specific build log
- `PUT /api/build-logs/{build_id}` - Update build log
- `DELETE /api/build-logs/{build_id}` - Delete build log
- `DELETE /api/build-logs` - Clear all build logs

### Generated Code
- `POST /api/generated-code` - Save generated code
- `GET /api/generated-code` - List generated code (max 10)
- `GET /api/generated-code/{code_id}` - Get specific code
- `DELETE /api/generated-code/{code_id}` - Delete code
- `DELETE /api/generated-code` - Clear all code

### Jenkins Integration
- `POST /api/jenkins/trigger` - Trigger Jenkins job

### Statistics
- `GET /api/stats` - Get platform statistics

## API Documentation

Once the server is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Environment Variables

\`\`\`bash
# MongoDB connection (optional)
export MONGODB_URL="mongodb://localhost:27017"

# For production
export ENVIRONMENT="production"
\`\`\`

## Development

### Project Structure
\`\`\`
backend/
├── main.py              # FastAPI application
├── jenkins.py           # Jenkins integration script
├── requirements.txt     # Python dependencies
├── setup.sh            # Setup script
├── start.sh            # Production start script
├── start-dev.sh        # Development start script
├── README.md           # This file
└── venv/               # Virtual environment (created by setup.sh)
\`\`\`

### Adding New Features

1. **Add new endpoints** in `main.py`
2. **Update models** using Pydantic
3. **Test with Swagger UI** at `/docs`
4. **Update frontend** API client in `lib/api.ts`

## Troubleshooting

### Common Issues

**1. Permission Denied on Scripts**
\`\`\`bash
chmod +x setup.sh start.sh start-dev.sh
\`\`\`

**2. Python Not Found**
\`\`\`bash
# Install Python 3.8+
# macOS: brew install python3
# Ubuntu: sudo apt-get install python3 python3-pip
\`\`\`

**3. MongoDB Connection Issues**
- The server will automatically fall back to in-memory storage
- Check if MongoDB is running: `pgrep mongod`
- Start MongoDB: `mongod --dbpath ./data`

**4. Port Already in Use**
\`\`\`bash
# Kill process on port 8000
lsof -ti:8000 | xargs kill -9

# Or use different port
uvicorn main:app --port 8001
\`\`\`

## Production Deployment

### Using systemd (Linux)

1. **Create service file:**
\`\`\`bash
sudo nano /etc/systemd/system/framework-hub.service
\`\`\`

2. **Service configuration:**
\`\`\`ini
[Unit]
Description=Framework Hub API
After=network.target

[Service]
Type=simple
User=your-user
WorkingDirectory=/path/to/backend
Environment=PATH=/path/to/backend/venv/bin
ExecStart=/path/to/backend/venv/bin/python main.py
Restart=always

[Install]
WantedBy=multi-user.target
\`\`\`

3. **Enable and start:**
\`\`\`bash
sudo systemctl enable framework-hub
sudo systemctl start framework-hub
\`\`\`

### Using PM2 (Node.js Process Manager)

\`\`\`bash
# Install PM2
npm install -g pm2

# Start application
pm2 start main.py --name framework-hub --interpreter python3

# Save PM2 configuration
pm2 save
pm2 startup
\`\`\`

## Security Notes

- **CORS**: Currently allows localhost origins for development
- **Authentication**: Not implemented (add JWT/OAuth as needed)
- **Rate Limiting**: Not implemented (add as needed)
- **Input Validation**: Basic validation via Pydantic models

For production, consider adding:
- Authentication middleware
- Rate limiting
- Input sanitization
- HTTPS termination
- Environment-specific CORS settings
