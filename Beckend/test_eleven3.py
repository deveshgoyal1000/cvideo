import os
from dotenv import load_dotenv
import json
import urllib.request
import base64

load_dotenv(dotenv_path="../Frontend/.env.local")
ELEVENLABS_API_KEY = os.environ.get("ELEVENLABS_API_KEY")
print("Key retrieved:", repr(ELEVENLABS_API_KEY))

voice_id = "IKne3meq5aSn9XLyUdCD"
url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"

headers = {
    "xi-api-key": ELEVENLABS_API_KEY,
    "Content-Type": "application/json",
    "User-Agent": "Mozilla/5.0"
}

data = {
    "text": "Hello, this is a test.",
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
    print("Error:", e)
    if hasattr(e, 'read'):
        print(e.read().decode())
