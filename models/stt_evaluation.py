###### THIS IS FOR INDIAN LANGUAGES ###################
import requests
from transformers import AutoTokenizer, AutoModelForCausalLM
import torch
from pydub import AudioSegment
import os

# Function to process a pre-recorded audio file for STT
def process_audio_file(file_path):
    try:
        # Convert WEBM to WAV if necessary
        if file_path.endswith(".webm"):
            audio = AudioSegment.from_file(file_path, format="webm")
            wav_path = file_path.replace(".webm", ".wav")
            audio.export(wav_path, format="wav")
            file_path = wav_path

        # Read the audio file in binary format
        with open(file_path, "rb") as audio_file:
            audio_content = audio_file.read()

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

        # Extract transcription from the response
        transcription = response.json().get("transcription", "")

        return transcription
    except Exception as e:
        print("Error during transcription:", str(e))
        return None

# Function to evaluate the transcription
def evaluate_transcription(transcription):
    """
    Evaluates a given transcription using the specified model and tokenizer.

    Args:
        transcription (str): Text from the STT function.

    Returns:
        str: Model-generated feedback report.
    """
    # Hugging Face model details
    hf_token = "your_hf_token"  # Replace with your Hugging Face token
    model_name = "Telugu-LLM-Labs/Indic-gemma-2b-finetuned-sft-Navarasa-2.0"

    # Load the model
    model = AutoModelForCausalLM.from_pretrained(
        model_name,
        load_in_4bit=False,
        token=hf_token
    )
    model.to("cuda")

    # Load the tokenizer
    tokenizer = AutoTokenizer.from_pretrained(model_name)

    # Define the input prompt
    input_prompt = """
    ### Instruction:
    Prompt for Generating a Communication Assessment Report

    Evaluate the user's speaking performance and generate a Communication Assessment Report with the following sections:

    Rating (Out of 10):
    Provide a score (0–10) based on grammar, pronunciation, clarity, and fluency, with a brief explanation.

    Corrections/What Went Wrong:
    List specific errors, including:

    Grammar mistakes (provide examples and corrections).
    Overuse of filler words (e.g., "um," "uh," "like").
    Unnatural pauses or hesitations.

    Things That Could Have Been Better:
    Suggest areas for refinement, such as sentence variety, vocabulary usage, or overall engagement.

    Suggestions:
    Recommend tailored improvements, including:

    Practice exercises (e.g., reading aloud, tongue twisters).
    Learning resources (e.g., apps for grammar or pronunciation).
    Interactive activities (e.g., speaking clubs, self-review).
    Expert guidance (e.g., tutors, workshops).

    Keep the feedback clear, actionable, and user-focused.

    ### Input:
    {}

    ### Response:
    """

    # Format the input prompt with the evaluation criteria
    formatted_input = input_prompt.format(transcription)

    # Tokenize and move inputs to GPU
    inputs = tokenizer([formatted_input], return_tensors="pt").to("cuda")

    # Generate the model response
    outputs = model.generate(**inputs, max_new_tokens=300, use_cache=True)

    # Decode the response
    decoded_output = tokenizer.batch_decode(outputs, skip_special_tokens=True)[0]

    # Extract the feedback part (after "### Response:")
    feedback = decoded_output.split("### Response:")[-1].strip()

    return feedback

# Specify the path to the pre-recorded audio file
audio_file_path = "path_to_audio_file.webm"  # Replace with the actual file path

# Process the audio file
transcription = process_audio_file(audio_file_path)
if transcription:
    print("Transcription:", transcription)

    # Evaluate the transcription
    feedback_report = evaluate_transcription(transcription)

    # Display the feedback report
    print("Feedback Report:\n", feedback_report)
else:
    print("No transcription received.")
