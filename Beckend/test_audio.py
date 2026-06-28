import os
import base64
from google import genai
from google.genai import types

client = genai.Client(api_key="AIzaSyAIovaAj36WMTNcSEokm3-WXin4k1Hn1xk")

try:
    response = client.models.generate_content(
        model='gemini-2.0-flash',  # Testing 2.0 instead of 2.5 for audio
        contents="Say hello.",
        config=types.GenerateContentConfig(
            response_modalities=["AUDIO"],
            speech_config=types.SpeechConfig(
                voice_config=types.VoiceConfig(
                    prebuilt_voice_config=types.PrebuiltVoiceConfig(
                        voice_name="Fenrir"
                    )
                )
            )
        )
    )
    
    print("Success:", len(response.candidates[0].content.parts[0].inline_data.data))
except Exception as e:
    print("Error:", e)
