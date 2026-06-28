import os
import asyncio
from google import genai
from google.genai import types
import base64

async def get_audio_from_gemini():
    client = genai.Client(api_key="AIzaSyAIovaAj36WMTNcSEokm3-WXin4k1Hn1xk", http_options={'api_version': 'v1alpha'})
    
    config = types.LiveConnectConfig(
        response_modalities=["AUDIO"],
        speech_config=types.SpeechConfig(
            voice_config=types.VoiceConfig(
                prebuilt_voice_config=types.PrebuiltVoiceConfig(
                    voice_name="Fenrir" # Rahul's proxy
                )
            )
        )
    )
    
    pcm_chunks = bytearray()
    
    print("Connecting...")
    async with client.aio.live.connect(model='gemini-2.5-flash-native-audio-preview-12-2025', config=config) as session:
        print("Sending prompt...")
        
        # Send the exact script for it to speak
        await session.send_client_content(
            turns=[types.Content(role="user", parts=[types.Part.from_text(text="Read exactly this Hindi sentence in a confident voice, nothing else: नमस्ते, मैं राहुल हूँ।")])],
            turn_complete=True
        )
        
        print("Receiving...")
        async for message in session.receive():
            server_content = getattr(message, "server_content", None)
            if server_content is not None:
                model_turn = getattr(server_content, "model_turn", None)
                if model_turn:
                    for part in getattr(model_turn, "parts", []):
                        if getattr(part, "inline_data", None) and getattr(part.inline_data, "data", None):
                            # It's PCM 24kHz
                            pcm_chunks.extend(part.inline_data.data)
                
                # Check for turn_complete
                if getattr(server_content, "turn_complete", False):
                    print("Turn complete received!")
                    break
                    
    print(f"Total PCM bytes received: {len(pcm_chunks)}")
    
if __name__ == "__main__":
    asyncio.run(get_audio_from_gemini())
