from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
import os

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL')
db_name = os.environ.get('DB_NAME', 'resonance')

client = AsyncIOMotorClient(mongo_url)
database = client[db_name]


def get_database() -> AsyncIOMotorDatabase:
    """Dependency to get database instance"""
    return database


async def create_indexes():
    """Create database indexes for better performance"""
    try:
        # Tracks collection indexes
        await database.tracks.create_index("title")
        await database.tracks.create_index("artist")
        await database.tracks.create_index("album")
        await database.tracks.create_index("upload_date")
        await database.tracks.create_index("play_count")
        await database.tracks.create_index("youtube_id", sparse=True)
        await database.tracks.create_index(
            [("title", "text"), ("artist", "text"), ("album", "text")]
        )
        
        # Playlists collection indexes
        await database.playlists.create_index("name")
        await database.playlists.create_index("created_date")
        
        print("Database indexes created successfully")
    except Exception as e:
        print(f"Error creating indexes: {str(e)}")