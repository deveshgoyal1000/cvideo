import os
from google import genai
from google.genai import types

def test_tts():
    client = genai.Client(api_key="AIzaSyAIovaAj36WMTNcSEokm3-WXin4k1Hn1xk", http_options={'api_version': 'v1alpha'})
    
    config = types.GenerateContentConfig(
        response_modalities=["AUDIO"],
        speech_config=types.SpeechConfig(
            voice_config=types.VoiceConfig(
                prebuilt_voice_config=types.PrebuiltVoiceConfig(
                    voice_name="Fenrir"
                )
            )
        )
    )
    
    script_text = "This is a quick test to see if TTS works perfectly in a few seconds."
    
    print("Generating...")
    response = client.models.generate_content(
        model='gemini-2.5-flash-preview-tts',
        contents=f"Read exactly this in Hindi naturally, nothing else: {script_text}",
        config=config
    )
    
    audio_data = None
    if response.candidates and response.candidates[0].content and response.candidates[0].content.parts:
        for p in response.candidates[0].content.parts:
            if getattr(p, "inline_data", None) and getattr(p.inline_data, "data", None):
                audio_data = p.inline_data.data
                
    if audio_data:
        print(f"Success! Got {len(audio_data)} bytes of PCM audio.")
    else:
        print("Failed to get audio data.")

if __name__ == "__main__":
    test_tts()
