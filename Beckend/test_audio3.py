import os
import base64
from google import genai
from google.genai import types

client = genai.Client(api_key="AIzaSyAIovaAj36WMTNcSEokm3-WXin4k1Hn1xk")

try:
    response = client.models.generate_content(
        model='gemini-2.5-flash-native-audio-preview-12-2025',  # Using exact model from Twilio method
        contents="Say hello.",
        config=types.GenerateContentConfig(
            response_modalities=["AUDIO"],
        )
    )
    
    print("Success:", len(response.candidates[0].content.parts[0].inline_data.data))
except Exception as e:
    print("Error:", e)
