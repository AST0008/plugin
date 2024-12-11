import requests
import speech_recognition as sr
import time

# Initialize the recognizer
recognizer = sr.Recognizer()

# Function to record audio with custom silence detection
def record_audio():
    with sr.Microphone() as source:
        print("Listening...")
        recognizer.adjust_for_ambient_noise(source)
        audio_data = []  # Store chunks of audio
        start_time = time.time()
        silence_start = None

        while True:
            try:
                # Capture short chunks of audio
                audio_chunk = recognizer.listen(source, timeout=5, phrase_time_limit=5)
                audio_data.append(audio_chunk)
                
                # Check audio energy for silence
                energy = recognizer.energy_threshold
                if audio_chunk.get_raw_data():
                    chunk_energy = max(audio_chunk.frame_data)  # Maximum amplitude
                    if chunk_energy < energy:
                        if silence_start is None:
                            silence_start = time.time()
                        elif time.time() - silence_start > 1.5:  # Silence for 1.5 seconds
                            print("Silence detected. Stopping recording.")
                            break
                    else:
                        silence_start = None  # Reset silence timer on speech

                # Check if the maximum recording time (60 seconds) is reached
                if time.time() - start_time > 60:
                    print("Maximum recording time reached.")
                    break
            except sr.WaitTimeoutError:
                if silence_start is None:
                    silence_start = time.time()  # Mark when silence started
                elif time.time() - silence_start > 1.5:
                    print("Silence detected. Stopping recording.")
                    break

        if audio_data:
            # Combine all chunks into a single audio object
            combined_audio = sr.AudioData(
                b"".join(chunk.get_raw_data() for chunk in audio_data),
                audio_data[0].sample_rate,
                audio_data[0].sample_width
            )
            return combined_audio
        else:
            return None

# Record audio
audio_data = record_audio()
if audio_data:
    try:
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
else:
    print("No audio to process.")
