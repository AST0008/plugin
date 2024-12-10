import pyaudio
import wave
import requests
import time
import os

# Configuration for Sarvam AI STT
STT_API_URL = "https://api.sarvam.ai/speech-to-text"
API_KEY = "6b07c5b1-50c9-48ab-b3c9-50142674e695"  # Load API key from an environment variable

# Recording configuration
FORMAT = pyaudio.paInt16  # Audio format
CHANNELS = 1               # Mono channel
RATE = 16000               # Sample rate (16 kHz is typical for STT)
CHUNK = 1024               # Number of frames per buffer
SILENCE_THRESHOLD = 1000   # Silence threshold
SILENCE_TIMEOUT = 5        # Seconds of silence before stopping recording
MAX_RECORD_TIME = 60       # Maximum recording time in seconds


def is_silent(data):
    """Check if the audio data is silent."""
    return max(data) < SILENCE_THRESHOLD


def record_audio(output_file="output.wav"):
    """
    Records audio from the microphone until silence timeout or max time.

    Parameters:
        output_file (str): Path to save the recorded audio file.
    
    Returns:
        str: Path to the recorded audio file, or None if recording failed.
    """
    audio = pyaudio.PyAudio()
    try:
        stream = audio.open(format=FORMAT, channels=CHANNELS, rate=RATE, 
                            input=True, frames_per_buffer=CHUNK)
    except Exception as e:
        print(f"Error initializing audio input: {e}")
        return None

    print("Recording... Speak now.")
    frames = []
    silent_chunks = 0
    start_time = time.time()

    try:
        while True:
            data = stream.read(CHUNK, exception_on_overflow=False)
            frames.append(data)

            # Convert to integers for silence detection
            if len(data) == CHUNK * 2:  # Ensure buffer size matches CHUNK
                audio_data = wave.struct.unpack(f"{CHUNK}h", data)
                if is_silent(audio_data):
                    silent_chunks += 1
                else:
                    silent_chunks = 0

            # Stop recording after silence timeout or max record time
            if silent_chunks > (SILENCE_TIMEOUT * RATE / CHUNK) or \
               (time.time() - start_time) > MAX_RECORD_TIME:
                print("Recording stopped.")
                break
    finally:
        stream.stop_stream()
        stream.close()
        audio.terminate()

    # Save audio to file
    try:
        with wave.open(output_file, "wb") as wf:
            wf.setnchannels(CHANNELS)
            wf.setsampwidth(audio.get_sample_size(FORMAT))
            wf.setframerate(RATE)
            wf.writeframes(b"".join(frames))
    except Exception as e:
        print(f"Error saving audio file: {e}")
        return None

    return output_file


def check_audio_format(file_path):
    """Check if the audio file is in the correct format."""
    try:
        with wave.open(file_path, 'rb') as wf:
            frame_rate = wf.getframerate()
            return {
                'channels': wf.getnchannels(),
                'frame_rate': frame_rate,
                'duration': wf.getnframes() / frame_rate if frame_rate > 0 else 0
            }
    except Exception as e:
        print(f"Error checking audio format: {e}")
        return None


def transcribe_audio(file_path):
    """
    Transcribes audio using Sarvam AI's STT model.
    
    Parameters:
        file_path (str): Path to the audio file.
        
    Returns:
        str: Transcribed text from the audio.
    """
    data = {
        "language_code": "hi-IN",  # Language code
        "model": "saarika:v1",     # Model version
        "with_timestamps": "true"  # Include timestamps
    }

    try:
        with open(file_path, "rb") as audio_file:
            files = {
                "file": (os.path.basename(file_path), audio_file, "audio/wav")
            }

            headers = {
                "API-Subscription-Key": API_KEY
            }

            response = requests.post(STT_API_URL, headers=headers, data=data, files=files)

            if response.status_code == 200:
                result = response.json()
                transcription = result.get("transcription", "No transcription available.")
                return transcription
            else:
                print(f"Error: {response.status_code}")
                print(response.text)
                return None
    except Exception as e:
        print(f"Error during transcription: {e}")
        return None


def cleanup_file(file_path):
    """Remove the audio file if it exists."""
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
            print(f"Cleaned up: {file_path}")
    except Exception as e:
        print(f"Error during file cleanup: {e}")


# Main function to record audio and transcribe it
if __name__ == "__main__":
    audio_path = record_audio()  # Record audio and save it as output.wav

    if audio_path and os.path.isfile(audio_path):
        print("Valid audio file created.")

        # Check audio format details
        audio_info = check_audio_format(audio_path)
        if audio_info:
            print(f"Audio Info: Channels: {audio_info['channels']}, Frame Rate: {audio_info['frame_rate']} Hz")

            if audio_info['frame_rate'] == 16000 and audio_info['channels'] == 1:
                print("Audio format is valid. Now transcribing...")
                transcription = transcribe_audio(audio_path)
                print("\nTranscription:")
                print(transcription if transcription else "Failed to transcribe audio.")
            else:
                print("Invalid audio format: Ensure it's 16 kHz mono WAV.")
        else:
            print("Error: Could not retrieve audio format details.")
    else:
        print("Error: Invalid audio file.")

    # Cleanup the audio file
    cleanup_file(audio_path)
