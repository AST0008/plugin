from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
from datetime import datetime
import logging
import uuid
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = FastAPI()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configure CORS
origins = [
    "http://localhost:3000",  # Frontend URL
    "https://plugin-brown.vercel.app/"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Supabase client
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

BUCKET_NAME = "recordings"  # Supabase bucket name



async def get_file_size(file: UploadFile) -> int:
    """
    Get the size of an uploaded file in bytes.
    """
    file.file.seek(0, 2)  # Move the pointer to the end of the file
    size = file.file.tell()  # Get the current position of the pointer
    file.file.seek(0)  # Reset the pointer to the start of the file
    return size

def generate_unique_filename(base_name: str, extension: str) -> str:
    """
    Generates a unique filename using a base name, current timestamp, and a UUID.
    """
    timestamp = datetime.utcnow().strftime("%Y%m%d%H%M%S%f")
    unique_id = str(uuid.uuid4())
    return f"{base_name}_{timestamp}_{unique_id}.{extension}"

def upload_with_retries(client, bucket_name, file_name, data, retries=3):
    """
    Attempts to upload a file to Supabase with retry logic and handles duplicates by removing existing files.
    """
    for attempt in range(retries):
        try:
            # Check if the file exists
            existing_files = client.storage.from_(bucket_name).list("", {"prefix": file_name})
            if existing_files:
                logger.warning(f"File {file_name} already exists. Deleting it.")
                client.storage.from_(bucket_name).remove([file_name])

            # Attempt to upload the file
            response = client.storage.from_(bucket_name).upload(file_name, data)
            # if response.get("error"):
            #     raise Exception(f"Upload failed: {response['error']}")
            return response

        except Exception as e:
            if attempt < retries - 1:
                logger.warning(f"Upload attempt {attempt + 1} failed for {file_name}. Retrying...")
            else:
                logger.error(f"Failed to upload {file_name} after {retries} attempts. Error: {str(e)}")
                raise HTTPException(status_code=500, detail=f"Failed to upload {file_name}. Error: {str(e)}")




@app.post("/upload")
async def upload_recordings(files: list[UploadFile] = File(...)):
    try:
        logger.info(f"Received {len(files)} files for upload")
        if len(files) != 8:
            raise HTTPException(status_code=400, detail="Expected 8 files (4 video + 4 audio)")

        video_files = [f for f in files if f.content_type.startswith("video")]
        audio_files = [f for f in files if f.content_type.startswith("audio")]

        if len(video_files) != len(audio_files):
            raise HTTPException(status_code=400, detail="Mismatched number of video and audio files")

        max_size_mb = 50
        for file in files:
            size = await get_file_size(file)
            if size > max_size_mb * 1024 * 1024:  # Convert MB to bytes
                raise HTTPException(status_code=400, detail=f"File {file.filename} exceeds the size limit of {max_size_mb}MB")
        timestamp = datetime.utcnow().strftime("%Y%m%d%H%M%S%f")
        uploaded_files = []

        for idx, (video, audio) in enumerate(zip(video_files, audio_files)):
            question_id = idx + 1
            unique_id = str(uuid.uuid4())
            video_filename = generate_unique_filename(f"video_{question_id}", "webm")
            audio_filename = generate_unique_filename(f"audio_{question_id}", "webm")

            logger.info(f"Uploading video {video.filename} as {video_filename}")
            video_data = await video.read()
            logger.info(f"Uploading audio {audio.filename} as {audio_filename}")
            audio_data = await audio.read()

            # Upload to Supabase
            video_upload = upload_with_retries(supabase, BUCKET_NAME, video_filename, video_data)
            audio_upload = upload_with_retries(supabase, BUCKET_NAME, audio_filename, audio_data)


            # if video_upload.get("error"):
            #     logger.error(f"Error uploading video: {video_upload['error']}")
            #     raise HTTPException(status_code=500, detail=f"Failed to upload video {question_id}")

            # if audio_upload.get("error"):
            #     logger.error(f"Error uploading audio: {audio_upload['error']}")
            #     raise HTTPException(status_code=500, detail=f"Failed to upload audio {question_id}")

            video_url = supabase.storage.from_(BUCKET_NAME).get_public_url(video_filename)
            audio_url = supabase.storage.from_(BUCKET_NAME).get_public_url(audio_filename)

            uploaded_files.append({
                "session_id": timestamp,
                "question_id": question_id,
                "video_url": video_url,
                "audio_url": audio_url,
            })
            
            insert_response = supabase.table("recordings").insert({
                "session_id": timestamp,
                "question_id": question_id,
                "video_url": video_url,
                "audio_url": audio_url,
            }).execute();
            print(insert_response)


        logger.info(f"Successfully uploaded files: {uploaded_files}")
        return {"message": "Files uploaded successfully", "files": uploaded_files}

    except Exception as e:
        logger.exception("An error occurred during file upload")
        raise HTTPException(status_code=500, detail=str(e))
     
#uvicorn main:app --host 0.0.0.0 --port 8000