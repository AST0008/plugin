from transformers import T5Tokenizer, T5ForConditionalGeneration, Trainer, TrainingArguments
from datasets import Dataset
import pandas as pd

data = pd.read_csv("./grammar_dataset.csv")

hf_dataset = Dataset.from_pandas(data)

print(hf_dataset[0])

def preprocess(sentance):
	incorrect = sentance["Ungrammatical Statement"]
	corrected = sentance["Standard English"]
	err_type = sentance["Error Type"]  
	prompt = f"Correct the following sentence:\n{incorrect}\n\nCorrected Sentence:"
	target = corrected
	return {"input_text": prompt, "target_text": target}

dataset_init = Dataset.from_pandas(data)

dataset = dataset_init.map(lambda row: {
    "input": f"diagnose: {row['Ungrammatical Statement']}", 
    "target": f"Error: {row['Error Type']}. Correction: {row['Standard English']}"
})

train_test_split = dataset.train_test_split(test_size=0.2)
train_dataset = train_test_split["train"]
test_dataset = train_test_split["test"]

tokenizer = T5Tokenizer.from_pretrained("t5-small")
model = T5ForConditionalGeneration.from_pretrained("t5-small")

def preprocess_data(examples):
    inputs = tokenizer(examples["input"], max_length=128, truncation=True, padding="max_length")
    labels = tokenizer(examples["target"], max_length=128, truncation=True, padding="max_length").input_ids
    inputs["labels"] = labels
    return inputs

tokenized_train = train_dataset.map(preprocess_data, batched=True)
tokenized_test = test_dataset.map(preprocess_data, batched=True)

training_args = TrainingArguments(
    output_dir="./results",
    evaluation_strategy="epoch",
    learning_rate=5e-5,
    per_device_train_batch_size=4,
    num_train_epochs=3,
    save_strategy="epoch",
    weight_decay=0.01,
    push_to_hub=False,
)

trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=tokenized_train,
    eval_dataset=tokenized_test,
    tokenizer=tokenizer,
)

trainer.train()

model.save_pretrained("./diagnostic_grammar_model")
tokenizer.save_pretrained("./diagnostic_grammar_model")

def diagnose_grammar(input_text):
    inputs = tokenizer(f"diagnose: {input_text}", return_tensors="pt", max_length=128, truncation=True)
    outputs = model.generate(inputs.input_ids, max_length=128, num_beams=5, early_stopping=True)
    result = tokenizer.decode(outputs[0], skip_special_tokens=True)
    return result

user_input = "Kya tumhe hindi aata hai?"
diagnostic_feedback = diagnose_grammar(user_input)
print(diagnostic_feedback)