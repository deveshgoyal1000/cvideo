import os
from google import genai
from google.genai import types

client = genai.Client(api_key="AIzaSyAIovaAj36WMTNcSEokm3-WXin4k1Hn1xk", http_options={'api_version': 'v1alpha'})

try:
    response = client.models.generate_content(
        model='gemini-2.5-flash',
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
    print("Error 2.5:", e)

try:
    response = client.models.generate_content(
        model='gemini-2.0-flash-exp',
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
    print("Success 2.0-exp:", len(response.candidates[0].content.parts[0].inline_data.data))
except Exception as e:
    print("Error 2.0-exp:", e)
