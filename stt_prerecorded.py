import requests
import speech_recognition as sr

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

# Specify the path to the audio file
file_path = "path_to_your_audio_file.wav"  # Replace with the actual file path

# Process the audio file
process_audio_file(file_path)
