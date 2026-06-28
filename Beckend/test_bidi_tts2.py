import os
import asyncio
from google import genai
from google.genai import types
import re

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
    
    script_text = """
    क्या आप जानते हैं कि AI अब वीडियो भी बना सकता है?
    हाँ, आपने सही सुना! OpenAI का नया मॉडल 'Sora' सिर्फ टेक्स्ट से कमाल के वीडियो बना सकता है।
    यह तकनीक भविष्य में फिल्म मेकिंग को पूरी तरह बदल देगी।
    क्या आप इसके लिए तैयार हैं? नीचे कमेंट में बताएं!
    """
    
    sentences = [s.strip() for s in re.split(r'[.।?!]', script_text) if s.strip()]
    
    print("Connecting...")
    async with client.aio.live.connect(model='gemini-2.5-flash-native-audio-preview-12-2025', config=config) as session:
        for idx, sentence in enumerate(sentences):
            print(f"Sending sentence {idx+1}/{len(sentences)}: {sentence}")
            
            await session.send_client_content(
                turns=[types.Content(role="user", parts=[types.Part.from_text(text=f"Read exactly this naturally in Hindi (or Hinglish): {sentence}")])],
                turn_complete=True
            )
            
            print(f"Receiving {idx+1}...")
            async for message in session.receive():
                server_content = getattr(message, "server_content", None)
                if server_content is not None:
                    model_turn = getattr(server_content, "model_turn", None)
                    if model_turn:
                        for part in getattr(model_turn, "parts", []):
                            if getattr(part, "inline_data", None) and getattr(part.inline_data, "data", None):
                                pcm_chunks.extend(part.inline_data.data)
                    
                    if getattr(server_content, "turn_complete", False):
                        print(f"Turn {idx+1} complete!")
                        break
                        
    print(f"Total PCM bytes received: {len(pcm_chunks)}")

if __name__ == "__main__":
    asyncio.run(get_audio_from_gemini())
