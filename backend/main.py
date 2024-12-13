from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
from datetime import datetime
import logging
import uuid

import os
import sys

from fastapi import APIRouter, HTTPException
import io
import httpx

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))) 
from models.stt_english import stt_eng                                                      # For english languages
from models.stt_evaluation import process_audio_files                                       # For non-english languages 
from models.stt import convert_webm_to_wav                          # First param --> webm file, Second param --> output path 

from models.evalutation import evaluate_transcription

user_language = {"language": None}

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
SUPABASE_URL = "https://umcncouxfntmvpnzgihw.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtY25jb3V4Zm50bXZwbnpnaWh3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMzkxNzk1MywiZXhwIjoyMDQ5NDkzOTUzfQ.xv9fJEEZCKsqhUnexYKJvvVNz75v_TMk4wmjcGLOHI4"
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

@app.post('/set-language')
async def set_language(payload: dict):
    """
    Receives and stores the selected language.
    Args:
        payload (dict): A dictionary containing the 'language'.

    Returns:
        dict: Confirmation message.
    """
    global user_language
    language = payload.get("language")
    if not language:
        raise HTTPException(status_code=400, detail="Language not provided.")

    user_language["language"] = language
    return {"message": f"Language set to {language}"}


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
        audio_urls = []

        for idx, (video, audio) in enumerate(zip(video_files, audio_files)):
            question_id = idx + 1
            unique_id = str(uuid.uuid4())
            video_filename = generate_unique_filename(f"video_{question_id}", "webm")
            audio_webm_filename = generate_unique_filename(f"audio_{question_id}", "webm")
            audio_wav_filename = generate_unique_filename(f'audio_{question_id}', 'wav')

            logger.info(f"Uploading video {video.filename} as {video_filename}")
            video_data = await video.read()
            logger.info(f"Uploading audio {audio.filename} as {audio_filename}")
            audio_data = await audio.read()

            audio_wav_data = convert_webm_to_wav(audio_data)

            # Upload to Supabase
            video_upload = upload_with_retries(supabase, BUCKET_NAME, video_filename, video_data)
            audio_upload = upload_with_retries(supabase, BUCKET_NAME, audio_wav_filename, audio_wav_data)

            # if video_upload.get("error"):
            #     logger.error(f"Error uploading video: {video_upload['error']}")
            #     raise HTTPException(status_code=500, detail=f"Failed to upload video {question_id}")

            # if audio_upload.get("error"):
            #     logger.error(f"Error uploading audio: {audio_upload['error']}")
            #     raise HTTPException(status_code=500, detail=f"Failed to upload audio {question_id}")

            video_url = supabase.storage.from_(BUCKET_NAME).get_public_url(video_filename)
            audio_wav_url = supabase.storage.from_(BUCKET_NAME).get_public_url(audio_wav_filename)

            uploaded_files.append({
                "session_id": timestamp,
                "question_id": question_id,
                "video_url": video_url,
                "audio_url": audio_wav_url,
            })

            audio_urls.append(audio_wav_url)
            
            insert_response = supabase.table("recordings").insert({
                "session_id": timestamp,
                "question_id": question_id,
                "video_url": video_url,
                "audio_url": audio_wav_url,
            }).execute();
            print(insert_response)


        logger.info(f"Successfully uploaded files: {uploaded_files}")
        return {"message": "Files uploaded successfully", "files": uploaded_files}

        # Here we are calling the /process endpoint to process the audio files
        async with httpx.AsyncClient() as client:
            language = user_language.get('language')
            if not language:
                raise HTTPException(status_code=400, detail = "language not set, please call /set-language first")

                # posting it to /process
            process_response = await client.post(
                "http://localhost:8000/process", 
                json={"audio_urls": audio_urls, "language": language}
            )
            if process_response.status_code != 200:
                raise HTTPException(status_code=500, detail="Error generating transcripts")
            transcripts = process_response.json()["transcripts"]

    except Exception as e:
        logger.exception("An error occurred during file upload")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/process")
async def process_audio_files(payload: dict):
    """
    Processes a list of audio files (WAV format), runs STT, and returns transcripts.
    Args: payload (dict): A dictionary containing "audio_urls".

    Returns: dict: A dictionary containing transcripts for each audio file.
    """
    try:
        audio_urls = payload.get("audio_urls", [])
        language = payload.get("language")

        if not audio_urls:
            raise HTTPException(status_code=400, detail="No audio URLs provided.")

        if not language:
            raise HTTPException(status_code=400, detail="Language not provided.")
        transcripts = []

        async with httpx.AsyncClient() as client:
            for idx, url in enumerate(audio_urls):              # These are the wav file urls
                
                # Downloading the file here
                response = await client.get(url)
                if response.status_code != 200:
                    raise HTTPException(status_code=500, detail=f"Failed to download audio file: {url}")   
                audio_bytes = response.content          # The audio bytes for the file
                
                if language.lower() == "english":           # ensure that the entire name is used and not just the code like EN    
                    transcript = stt_eng(audio_bytes)               # Returns the transcription text
                    transcripts.append({"file_index": idx + 1, "transcript": transcript})
                else:
                    transcript = process_audio_files(audio_bytes)               # ensure that process_audio_files can work with file bytes
                    transcripts.append({"file_index": idx + 1, "transcript": transcript})

        return {"transcripts": transcripts}                     # Dictionary with transcripts having a list of dictionaries

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate-report")
async def generate_report(payload: dict):
    '''
    Takes the transcripts dictionary as defined above and generates a report.
    This uses the evaluate_transcription function
    '''
    try:
        transcripts_data = payload.get("transcripts", [])
        if not transcripts_data:
            raise HTTPException(status_code=400, detail="No transcripts provided.")

        transcripts = [t['transcript'] for t in transcripts_data]                 # Getting the transcript for all 4 audio files in a list
        trans_dic = {}
        for ind, t in enumerate(transcripts):
            report = evaluate_transcription(t)
            trans_dic[f"audio_{ind}"] = report
        return trans_dic

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
