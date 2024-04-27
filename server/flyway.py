import spacy
from datetime import datetime
import re
import json
import sys

# Load the English language model
nlp = spacy.load("en_core_web_sm")

def format_date(date_string):
    # Remove ordinal indicators
    date_string = re.sub(r'(?<=\d)(st|nd|rd|th)\b', '', date_string)
    # Convert the string to a datetime object
    date_object = datetime.strptime(date_string, "%d %B %Y")
    # Format the datetime object in the desired format (YYYY-MM-DD)
    formatted_date = date_object.strftime("%Y-%m-%d")
    return formatted_date

def process_text(text):
    # Process the text
    doc = nlp(text)
    
    # Initialize dictionaries to hold extracted entities
    entities = {"names": [], "from_location": None, "to_location": None, "dates": []}
    
    # Temporary variables to store from and to locations
    from_location = None
    to_location = None
    
    # Flag to track if "from" or "to" is encountered
    is_from = False
    is_to = False
    # Flag to stop extracting words after "on"
    stop_extracting = False
    
    # Iterate over the tokens in the text
    for token in doc:
        if token.text.lower() == "from":
            is_from = True
            is_to = False # Reset "to" flag
        elif token.text.lower() == "to":
            is_from = False # Reset "from" flag
            is_to = True
        elif token.text.lower() == "on":
            stop_extracting = True # Stop extracting words after "on"
        
        if is_from and token.pos_ == "PROPN" and not stop_extracting:
            if from_location is None:
                from_location = token.text
            else:
                from_location += " " + token.text
        elif is_to and token.pos_ == "PROPN" and not stop_extracting:
            if to_location is None:
                to_location = token.text
            else:
                to_location += " " + token.text
    
    # Add extracted locations to the entities dictionary   
    entities["from_location"] = from_location
    entities["to_location"] = to_location
    
    # Iterate over the entities predicted by spaCy to extract other entities
    for ent in doc.ents:
        if ent.label_ == "PERSON":
            entities["names"].append(ent.text)
        elif ent.label_ == "DATE":
            # Format the date before appending
            formatted_date = format_date(ent.text)
            entities["dates"].append(formatted_date)
    
    return entities

# Read live transcription from command-line argument
live_transcription = sys.argv[1]

# Process live transcription
extracted_info = process_text(live_transcription)

# Convert extracted_info to JSON string
json_data = json.dumps(extracted_info)

# Print JSON data
print(json_data)
