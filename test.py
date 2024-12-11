from transformers import T5Tokenizer, T5ForConditionalGeneration
from google.generativeai.types import HarmCategory, HarmBlockThreshold
import google.generativeai as genai

tokenizer = T5Tokenizer.from_pretrained("./diagnostic_grammar_model")
model = T5ForConditionalGeneration.from_pretrained("./diagnostic_grammar_model")

API_KEY = "AIzaSyBOZ4axsWeFDOekeJ_I23N8eEEIfOJqE-E"

genai.configure(api_key = API_KEY)

model_ = genai.GenerativeModel('gemini-pro')
chat = model_.start_chat(history=[])

def diagnose_grammar(input_text):
    inputs = tokenizer(f"diagnose: {input_text}", return_tensors="pt", max_length=128, truncation=True)
    outputs = model.generate(inputs.input_ids, max_length=128, num_beams=5, early_stopping=True)
    result = tokenizer.decode(outputs[0], skip_special_tokens=True)
    return result

def pass_to_gemini(input_text, diagnosed_grammar):
    prompt = f""" You are a grammar diagnosis tool. You will be given the user's sentance: {input_text}
                    and a grammar report by a specialised model: {diagnosed_grammar}.
                    Your task is to compile a comprehensive report on the user's sentance, including the grammar diagnosis and a few more things.
                    You must do an anaylsis of 'filler words' as well.

                    Ensure that the report is less than 400 words and more than 200 words. """
    try:
        output = ''
        response = chat.send_message(prompt, stream=True, safety_settings={
                HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_NONE, 
                HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_NONE,
                HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_NONE,
                HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_NONE
        })

        for chunk in response:
            if chunk.text:
                output += str(chunk.text)

    except Exception as e:
        print(f"Error generating GPT response: {e}")
        return 'Try again'

    return output

user_input = input('>>> ')
diagnosed_grammar = diagnose_grammar(user_input)

print("grammar: ", diagnosed_grammar)

report = pass_to_gemini(user_input, diagnosed_grammar)

print(report)
