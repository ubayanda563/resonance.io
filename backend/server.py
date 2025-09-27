from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from pathlib import Path
import os
import logging
import asyncio

# Import routes
from .routes import tracks, youtube, artwork
from .database import create_indexes

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Create the main app without a prefix
app = FastAPI(title="Resonance Music Player API", version="1.0.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Include all route modules
api_router.include_router(tracks.router)
api_router.include_router(youtube.router)
api_router.include_router(artwork.router)

# Legacy hello world endpoint
@api_router.get("/")
async def root():
    return {"message": "Resonance Music Player API"}

# Include the router in the main app
app.include_router(api_router)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@app.on_event("startup")
async def startup_event():
    """Initialize database indexes on startup"""
    logger.info("Starting Resonance Music Player API...")
    await create_indexes()
    logger.info("Resonance Music Player API started successfully")


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    logger.info("Shutting down Resonance Music Player API...")
    
    # Close MongoDB connection
    from .database import client
    client.close()
    
    logger.info("Resonance Music Player API shut down successfully")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)