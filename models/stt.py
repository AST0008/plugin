import requests
import speech_recognition as sr
from pydub import AudioSegment
import os

# Function to convert webm to wav
def convert_webm_to_wav(webm_path, wav_path):
    try:
        print("Converting webm to wav...")
        audio = AudioSegment.from_file(webm_path, format="webm")
        audio.export(wav_path, format="wav")
        print("Conversion complete.")
    except Exception as e:
        print("Error during conversion:", str(e))
        raise e

# Function to process audio from a file
def process_audio_file(file_path):
    try:
        # Load the audio file
        recognizer = sr.Recognizer()
        with sr.AudioFile(file_path) as source:
            print("Loading audio file...")
            audio_data = recognizer.record(source)  # Read the entire file

        # Convert audio to binary data for the payload
        audio_content = audio_data.get_wav_data()

        # Define the API endpoint and headers
        url = "https://api.sarvam.ai/speech-to-text"
        headers = {
            "api-subscription-key": "6b07c5b1-50c9-48ab-b3c9-50142674e695"
        }

        # Prepare the multipart form data
        files = {
            "file": ("audio.wav", audio_content, "audio/wav"),
            "language_code": (None, "hi-IN"),
            "model": (None, "saarika:v1"),
            "with_timestamps": (None, "true")
        }

        # Send the POST request
        response = requests.post(url, headers=headers, files=files)

        # Print the transcription
        print("Transcription:", response.text)
    except Exception as e:
        print("Error during transcription:", str(e))

# Main function to handle webm input
def process_webm_file(webm_path):
    try:
        # Define a temporary wav file path
        wav_path = "temp_audio.wav"

        # Convert webm to wav
        convert_webm_to_wav(webm_path, wav_path)

        # Process the wav file
        process_audio_file(wav_path)

        # Clean up the temporary wav file
        if os.path.exists(wav_path):
            os.remove(wav_path)
    except Exception as e:
        print("Error during the process:", str(e))

# Specify the path to the webm file
webm_path = "path_to_your_audio_file.webm"  # Replace with the actual file path

# Process the webm file
process_webm_file(webm_path)
