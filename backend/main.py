from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
from datetime import datetime
import os

app = FastAPI()

# Configure CORS: adjust origins as necessary
origins = [
    "http://localhost:3000",  # Frontend URL
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load environment variables (or set them before running)
SUPABASE_URL = "https://umcncouxfntmvpnzgihw.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtY25jb3V4Zm50bXZwbnpnaWh3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMzkxNzk1MywiZXhwIjoyMDQ5NDkzOTUzfQ.xv9fJEEZCKsqhUnexYKJvvVNz75v_TMk4wmjcGLOHI4"

# if not SUPABASE_URL or not SUPABASE_KEY:
#     raise ValueError("Supabase URL and Key must be set in environment variables.")

# Initialize Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

BUCKET_NAME = "recordings"  # Your Supabase storage bucket name

@app.post("/upload")
async def upload_recordings(video: UploadFile = File(...), audio: UploadFile = File(...)):
    try:
        # Validate file types
        if video.content_type not in ["video/webm", "video/mp4"]:
            raise HTTPException(status_code=400, detail="Invalid video file type.")
        if audio.content_type not in ["audio/webm", "audio/mpeg"]:
            raise HTTPException(status_code=400, detail="Invalid audio file type.")

        # Create unique filenames to avoid conflicts
        timestamp = datetime.utcnow().strftime("%Y%m%d%H%M%S%f")
        video_filename = f"video_{timestamp}_{video.filename}"
        audio_filename = f"audio_{timestamp}_{audio.filename}"

        # Upload the video file
        video_data = await video.read()
        video_response = supabase.storage.from_(BUCKET_NAME).upload(video_filename, video_data, {"content-type": video.content_type})

        # Verify if the video upload succeeded
        # if not video_response or not video_response.get("data"):
        #     raise HTTPException(status_code=500, detail="Failed to upload video to Supabase storage.")

        # Upload the audio file
        audio_data = await audio.read()
        audio_response = supabase.storage.from_(BUCKET_NAME).upload(audio_filename, audio_data, {"content-type": audio.content_type})

        # Verify if the audio upload succeeded
        # if not audio_response or not audio_response.get("data"):
        #     raise HTTPException(status_code=500, detail="Failed to upload audio to Supabase storage.")

        # Generate public URLs if your bucket is public
        video_url = supabase.storage.from_(BUCKET_NAME).get_public_url(video_filename)
        audio_url = supabase.storage.from_(BUCKET_NAME).get_public_url(audio_filename)

        # Insert metadata into a 'recordings' table in Supabase
        data = {
            "video_url": video_url,
            "audio_url": audio_url,
        }
        insert_response = supabase.table("recordings").insert(data).execute()
        # if not insert_response or not insert_response.get("data"):
        #     raise HTTPException(status_code=500, detail="Failed to insert metadata into the database.")

        return {"message": "Files uploaded successfully.", "video_url": video_url, "audio_url": audio_url}

    except Exception as e:
        print("Error uploading recordings:", e)
        raise HTTPException(status_code=500, detail="Internal server error.")

#uvicorn main:app --host 0.0.0.0 --port 8000
