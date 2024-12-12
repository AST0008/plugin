import os
from openai import OpenAI

client = OpenAI(api_key="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")

# Full path to your audio file
audio_file_path = "/path/to/file/audio.mp3"

# Open the audio file in binary read mode
audio_file = open(audio_file_path, "rb")

# Create the transcription
transcription = client.audio.transcriptions.create(
    model="whisper-1", 
    file=audio_file
)

# Print the transcribed text
print(transcription.text)
