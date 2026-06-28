import os
from google import genai

# Using Vertex AI 
client = genai.Client(
    vertexai=True,
    project="projects/261003122356",  # project ID or number 
    location="us-central1",            # common default
    api_key="YOUR_API_KEY"
)

try:
    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents='Hello, how are you?'
    )
    print("Success Vertex:", response.text)
except Exception as e:
    print("Error Vertex:", e)
