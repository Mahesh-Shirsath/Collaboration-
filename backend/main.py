from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
import os
import json
import subprocess
import asyncio
from contextlib import asynccontextmanager

# Try to import MongoDB dependencies, fallback to in-memory storage if not available
try:
    from motor.motor_asyncio import AsyncIOMotorClient
    from bson import ObjectId
    MONGODB_AVAILABLE = True
except ImportError:
    MONGODB_AVAILABLE = False
    print("⚠️  MongoDB dependencies not available. Using in-memory storage.")

# Database connection
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DATABASE_NAME = "framework_hub"

# Global database client and in-memory storage
db_client: Optional[AsyncIOMotorClient] = None
database = None
in_memory_storage = {
    "build_logs": [],
    "generated_code": []
}

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    global db_client, database
    
    if MONGODB_AVAILABLE:
        try:
            db_client = AsyncIOMotorClient(MONGODB_URL)
            database = db_client[DATABASE_NAME]
            
            # Test connection
            await database.command("ping")
            print("✅ Connected to MongoDB")
            
            # Create indexes
            await database.build_logs.create_index("build_id", unique=True)
            await database.generated_code.create_index("created_at")
            
        except Exception as e:
            print(f"⚠️  MongoDB connection failed: {e}")
            print("   Using in-memory storage instead")
            database = None
    else:
        print("📝 Using in-memory storage")
    
    yield
    
    # Shutdown
    if db_client:
        db_client.close()

app = FastAPI(
    title="Framework Hub API",
    description="Backend API for Framework Hub platform",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class BuildLog(BaseModel):
    build_id: str
    type: str  # "JTAF Framework", "Floating Framework", "OS Making"
    status: str  # "running", "completed", "failed"
    start_time: datetime
    end_time: Optional[datetime] = None
    config: Dict[str, Any]
    command: Optional[str] = None
    jenkins_job: str
    output_log: Optional[str] = None

class BuildLogResponse(BaseModel):
    id: str
    build_id: str
    type: str
    status: str
    start_time: datetime
    end_time: Optional[datetime] = None
    config: Dict[str, Any]
    command: Optional[str] = None
    jenkins_job: str
    output_log: Optional[str] = None

class GeneratedCode(BaseModel):
    language: str
    type: str  # "function", "class", "api", "component", etc.
    code: str
    description: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class GeneratedCodeResponse(BaseModel):
    id: str
    language: str
    type: str
    code: str
    description: str
    created_at: datetime

class UpdateBuildStatus(BaseModel):
    status: str
    end_time: Optional[datetime] = None
    output_log: Optional[str] = None

class JenkinsJobRequest(BaseModel):
    build_id: str
    job_type: str
    config: Dict[str, Any]
    command: str

# Helper functions for in-memory storage
def generate_id():
    """Generate a simple ID for in-memory storage"""
    return str(int(datetime.now().timestamp() * 1000000))

def build_log_to_response(log: dict) -> BuildLogResponse:
    """Convert build log dict to response model"""
    return BuildLogResponse(
        id=log.get("_id", log.get("id")),
        build_id=log["build_id"],
        type=log["type"],
        status=log["status"],
        start_time=log["start_time"],
        end_time=log.get("end_time"),
        config=log["config"],
        command=log.get("command"),
        jenkins_job=log["jenkins_job"],
        output_log=log.get("output_log")
    )

def generated_code_to_response(code: dict) -> GeneratedCodeResponse:
    """Convert generated code dict to response model"""
    return GeneratedCodeResponse(
        id=code.get("_id", code.get("id")),
        language=code["language"],
        type=code["type"],
        code=code["code"],
        description=code["description"],
        created_at=code["created_at"]
    )

# Dependency to get database or use in-memory storage
async def get_storage():
    return database if database else "memory"

# Jenkins Integration endpoints
@app.post("/api/jenkins/trigger", response_model=dict)
async def trigger_jenkins_job(job_request: JenkinsJobRequest):
    """Trigger a Jenkins job via jenkins.py script"""
    try:
        # Prepare data for jenkins.py script
        build_data = {
            "build_id": job_request.build_id,
            "job_type": job_request.job_type,
            "config": job_request.config,
            "command": job_request.command
        }
        
        # Convert to JSON string for command line argument
        build_data_json = json.dumps(build_data)
        
        # Execute jenkins.py script
        result = await execute_jenkins_script(build_data_json)
        
        return {
            "success": True,
            "message": "Jenkins job triggered successfully",
            "jenkins_result": result,
            "build_id": job_request.build_id
        }
        
    except Exception as e:
        print(f"Jenkins trigger error: {e}")
        return {
            "success": False,
            "message": f"Jenkins job trigger failed: {str(e)}",
            "build_id": job_request.build_id
        }

async def execute_jenkins_script(build_data_json: str) -> dict:
    """Execute the jenkins.py script asynchronously"""
    try:
        # Run jenkins.py script with build data
        process = await asyncio.create_subprocess_exec(
            "python3", "jenkins.py", build_data_json,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
            cwd=os.path.dirname(os.path.abspath(__file__))
        )
        
        stdout, stderr = await process.communicate()
        
        if process.returncode == 0:
            # Parse JSON output from jenkins.py
            result = json.loads(stdout.decode())
            return result
        else:
            error_msg = stderr.decode() if stderr else "Unknown error"
            raise Exception(f"Jenkins script failed: {error_msg}")
            
    except json.JSONDecodeError as e:
        raise Exception(f"Failed to parse Jenkins script output: {str(e)}")
    except Exception as e:
        raise Exception(f"Failed to execute Jenkins script: {str(e)}")

# Build Logs endpoints
@app.post("/api/build-logs", response_model=dict)
async def create_build_log(build_log: BuildLog, storage=Depends(get_storage)):
    """Create a new build log entry"""
    try:
        build_log_dict = build_log.model_dump()
        
        if storage == "memory":
            # In-memory storage
            build_log_dict["id"] = generate_id()
            build_log_dict["_id"] = build_log_dict["id"]
            in_memory_storage["build_logs"].append(build_log_dict)
            return {"id": build_log_dict["id"], "message": "Build log created successfully"}
        else:
            # MongoDB storage
            result = await storage.build_logs.insert_one(build_log_dict)
            return {"id": str(result.inserted_id), "message": "Build log created successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create build log: {str(e)}")

@app.get("/api/build-logs", response_model=List[BuildLogResponse])
async def get_build_logs(
    skip: int = 0, 
    limit: int = 100, 
    status: Optional[str] = None,
    type: Optional[str] = None,
    storage=Depends(get_storage)
):
    """Get build logs with optional filtering"""
    try:
        if storage == "memory":
            # In-memory storage
            logs = in_memory_storage["build_logs"]
            
            # Apply filters
            if status:
                logs = [log for log in logs if log.get("status") == status]
            if type:
                logs = [log for log in logs if log.get("type") == type]
            
            # Sort by start_time (newest first)
            logs = sorted(logs, key=lambda x: x.get("start_time", datetime.min), reverse=True)
            
            # Apply pagination
            logs = logs[skip:skip + limit]
            
            return [build_log_to_response(log) for log in logs]
        else:
            # MongoDB storage
            query = {}
            if status:
                query["status"] = status
            if type:
                query["type"] = type
                
            cursor = storage.build_logs.find(query).sort("start_time", -1).skip(skip).limit(limit)
            build_logs = []
            
            async for log in cursor:
                log["_id"] = str(log["_id"])
                build_logs.append(BuildLogResponse(**log))
                
            return build_logs
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch build logs: {str(e)}")

@app.get("/api/build-logs/{build_id}", response_model=BuildLogResponse)
async def get_build_log(build_id: str, storage=Depends(get_storage)):
    """Get a specific build log by build_id"""
    try:
        if storage == "memory":
            # In-memory storage
            log = next((log for log in in_memory_storage["build_logs"] if log.get("build_id") == build_id), None)
            if not log:
                raise HTTPException(status_code=404, detail="Build log not found")
            return build_log_to_response(log)
        else:
            # MongoDB storage
            log = await storage.build_logs.find_one({"build_id": build_id})
            if not log:
                raise HTTPException(status_code=404, detail="Build log not found")
            
            log["_id"] = str(log["_id"])
            return BuildLogResponse(**log)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch build log: {str(e)}")

@app.put("/api/build-logs/{build_id}", response_model=dict)
async def update_build_log(build_id: str, update_data: UpdateBuildStatus, storage=Depends(get_storage)):
    """Update build log status and other fields"""
    try:
        update_dict = {k: v for k, v in update_data.model_dump().items() if v is not None}
        
        if storage == "memory":
            # In-memory storage
            log = next((log for log in in_memory_storage["build_logs"] if log.get("build_id") == build_id), None)
            if not log:
                raise HTTPException(status_code=404, detail="Build log not found")
            
            log.update(update_dict)
            return {"message": "Build log updated successfully"}
        else:
            # MongoDB storage
            result = await storage.build_logs.update_one(
                {"build_id": build_id},
                {"$set": update_dict}
            )
            
            if result.matched_count == 0:
                raise HTTPException(status_code=404, detail="Build log not found")
                
            return {"message": "Build log updated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update build log: {str(e)}")

@app.delete("/api/build-logs/{build_id}", response_model=dict)
async def delete_build_log(build_id: str, storage=Depends(get_storage)):
    """Delete a build log"""
    try:
        if storage == "memory":
            # In-memory storage
            original_length = len(in_memory_storage["build_logs"])
            in_memory_storage["build_logs"] = [
                log for log in in_memory_storage["build_logs"] 
                if log.get("build_id") != build_id
            ]
            
            if len(in_memory_storage["build_logs"]) == original_length:
                raise HTTPException(status_code=404, detail="Build log not found")
                
            return {"message": "Build log deleted successfully"}
        else:
            # MongoDB storage
            result = await storage.build_logs.delete_one({"build_id": build_id})
            if result.deleted_count == 0:
                raise HTTPException(status_code=404, detail="Build log not found")
                
            return {"message": "Build log deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete build log: {str(e)}")

@app.delete("/api/build-logs", response_model=dict)
async def clear_all_build_logs(storage=Depends(get_storage)):
    """Clear all build logs"""
    try:
        if storage == "memory":
            # In-memory storage
            count = len(in_memory_storage["build_logs"])
            in_memory_storage["build_logs"] = []
            return {"message": f"Deleted {count} build logs"}
        else:
            # MongoDB storage
            result = await storage.build_logs.delete_many({})
            return {"message": f"Deleted {result.deleted_count} build logs"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to clear build logs: {str(e)}")

# Generated Code endpoints
@app.post("/api/generated-code", response_model=dict)
async def create_generated_code(code: GeneratedCode, storage=Depends(get_storage)):
    """Create a new generated code entry"""
    try:
        code_dict = code.model_dump()
        
        if storage == "memory":
            # In-memory storage
            # Keep only 10 most recent entries
            if len(in_memory_storage["generated_code"]) >= 10:
                # Sort by created_at and keep only 9 newest
                in_memory_storage["generated_code"] = sorted(
                    in_memory_storage["generated_code"], 
                    key=lambda x: x.get("created_at", datetime.min), 
                    reverse=True
                )[:9]
            
            code_dict["id"] = generate_id()
            code_dict["_id"] = code_dict["id"]
            in_memory_storage["generated_code"].append(code_dict)
            return {"id": code_dict["id"], "message": "Generated code saved successfully"}
        else:
            # MongoDB storage
            # Check if we have more than 10 entries, remove oldest if needed
            count = await storage.generated_code.count_documents({})
            if count >= 10:
                # Remove oldest entries to keep only 9, so we can add 1 more
                oldest_entries = await storage.generated_code.find().sort("created_at", 1).limit(count - 9).to_list(length=None)
                oldest_ids = [entry["_id"] for entry in oldest_entries]
                await storage.generated_code.delete_many({"_id": {"$in": oldest_ids}})
            
            result = await storage.generated_code.insert_one(code_dict)
            return {"id": str(result.inserted_id), "message": "Generated code saved successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save generated code: {str(e)}")

@app.get("/api/generated-code", response_model=List[GeneratedCodeResponse])
async def get_generated_code(skip: int = 0, limit: int = 10, storage=Depends(get_storage)):
    """Get generated code entries (limited to 10 most recent)"""
    try:
        if storage == "memory":
            # In-memory storage
            codes = sorted(
                in_memory_storage["generated_code"], 
                key=lambda x: x.get("created_at", datetime.min), 
                reverse=True
            )
            codes = codes[skip:skip + limit]
            return [generated_code_to_response(code) for code in codes]
        else:
            # MongoDB storage
            cursor = storage.generated_code.find().sort("created_at", -1).skip(skip).limit(limit)
            code_entries = []
            
            async for entry in cursor:
                entry["_id"] = str(entry["_id"])
                code_entries.append(GeneratedCodeResponse(**entry))
                
            return code_entries
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch generated code: {str(e)}")

@app.get("/api/generated-code/{code_id}", response_model=GeneratedCodeResponse)
async def get_generated_code_by_id(code_id: str, storage=Depends(get_storage)):
    """Get a specific generated code entry by ID"""
    try:
        if storage == "memory":
            # In-memory storage
            code = next((code for code in in_memory_storage["generated_code"] if code.get("id") == code_id), None)
            if not code:
                raise HTTPException(status_code=404, detail="Generated code not found")
            return generated_code_to_response(code)
        else:
            # MongoDB storage
            if not ObjectId.is_valid(code_id):
                raise HTTPException(status_code=400, detail="Invalid code ID format")
                
            entry = await storage.generated_code.find_one({"_id": ObjectId(code_id)})
            if not entry:
                raise HTTPException(status_code=404, detail="Generated code not found")
            
            entry["_id"] = str(entry["_id"])
            return GeneratedCodeResponse(**entry)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch generated code: {str(e)}")

@app.delete("/api/generated-code/{code_id}", response_model=dict)
async def delete_generated_code(code_id: str, storage=Depends(get_storage)):
    """Delete a specific generated code entry"""
    try:
        if storage == "memory":
            # In-memory storage
            original_length = len(in_memory_storage["generated_code"])
            in_memory_storage["generated_code"] = [
                code for code in in_memory_storage["generated_code"] 
                if code.get("id") != code_id
            ]
            
            if len(in_memory_storage["generated_code"]) == original_length:
                raise HTTPException(status_code=404, detail="Generated code not found")
                
            return {"message": "Generated code deleted successfully"}
        else:
            # MongoDB storage
            if not ObjectId.is_valid(code_id):
                raise HTTPException(status_code=400, detail="Invalid code ID format")
                
            result = await storage.generated_code.delete_one({"_id": ObjectId(code_id)})
            if result.deleted_count == 0:
                raise HTTPException(status_code=404, detail="Generated code not found")
                
            return {"message": "Generated code deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete generated code: {str(e)}")

@app.delete("/api/generated-code", response_model=dict)
async def clear_all_generated_code(storage=Depends(get_storage)):
    """Clear all generated code entries"""
    try:
        if storage == "memory":
            # In-memory storage
            count = len(in_memory_storage["generated_code"])
            in_memory_storage["generated_code"] = []
            return {"message": f"Deleted {count} generated code entries"}
        else:
            # MongoDB storage
            result = await storage.generated_code.delete_many({})
            return {"message": f"Deleted {result.deleted_count} generated code entries"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to clear generated code: {str(e)}")

# Statistics endpoint
@app.get("/api/stats", response_model=dict)
async def get_stats(storage=Depends(get_storage)):
    """Get platform statistics"""
    try:
        if storage == "memory":
            # In-memory storage
            build_logs = in_memory_storage["build_logs"]
            generated_code = in_memory_storage["generated_code"]
            
            total_builds = len(build_logs)
            running_builds = len([log for log in build_logs if log.get("status") == "running"])
            completed_builds = len([log for log in build_logs if log.get("status") == "completed"])
            failed_builds = len([log for log in build_logs if log.get("status") == "failed"])
            
            jtaf_builds = len([log for log in build_logs if log.get("type") == "JTAF Framework"])
            floating_builds = len([log for log in build_logs if log.get("type") == "Floating Framework"])
            os_builds = len([log for log in build_logs if log.get("type") == "OS Making"])
            
            return {
                "build_logs": {
                    "total": total_builds,
                    "running": running_builds,
                    "completed": completed_builds,
                    "failed": failed_builds,
                    "by_type": {
                        "jtaf": jtaf_builds,
                        "floating": floating_builds,
                        "os_making": os_builds
                    }
                },
                "generated_code": {
                    "total": len(generated_code),
                    "limit": 10
                }
            }
        else:
            # MongoDB storage
            # Build logs stats
            total_builds = await storage.build_logs.count_documents({})
            running_builds = await storage.build_logs.count_documents({"status": "running"})
            completed_builds = await storage.build_logs.count_documents({"status": "completed"})
            failed_builds = await storage.build_logs.count_documents({"status": "failed"})
            
            # Generated code stats
            total_generated_code = await storage.generated_code.count_documents({})
            
            # Build types stats
            jtaf_builds = await storage.build_logs.count_documents({"type": "JTAF Framework"})
            floating_builds = await storage.build_logs.count_documents({"type": "Floating Framework"})
            os_builds = await storage.build_logs.count_documents({"type": "OS Making"})
            
            return {
                "build_logs": {
                    "total": total_builds,
                    "running": running_builds,
                    "completed": completed_builds,
                    "failed": failed_builds,
                    "by_type": {
                        "jtaf": jtaf_builds,
                        "floating": floating_builds,
                        "os_making": os_builds
                    }
                },
                "generated_code": {
                    "total": total_generated_code,
                    "limit": 10
                }
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch stats: {str(e)}")

# Health check endpoint
@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    storage_type = "MongoDB" if database else "In-Memory"
    return {
        "status": "healthy", 
        "timestamp": datetime.utcnow(),
        "storage": storage_type,
        "mongodb_available": MONGODB_AVAILABLE,
        "database_connected": database is not None
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
