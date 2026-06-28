import os
import json
import urllib.request
import base64

ELEVENLABS_API_KEY = "sk_6070fada236e6ba630046041ef46759e3e8a2742a2c67c1b"
voice_id = "pNInz6obpgDQGcFmaJcg"
url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"

headers = {
    "xi-api-key": ELEVENLABS_API_KEY,
    "Content-Type": "application/json",
    "User-Agent": "Mozilla/5.0"
}
data = {
    "text": "Hello, testing ElevenLabs.",
    "model_id": "eleven_monolingual_v1",
    "voice_settings": {
        "stability": 0.5,
        "similarity_boost": 0.5
    }
}

try:
    req_obj = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'), headers=headers, method='POST')
    with urllib.request.urlopen(req_obj, timeout=30) as response:
        audio_bytes = response.read()
        print("Success, audio length:", len(audio_bytes))
except Exception as e:
    print("Error with ElevenLabs:", e)
    if hasattr(e, 'read'):
        print(e.read().decode())
