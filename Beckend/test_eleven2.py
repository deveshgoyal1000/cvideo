import os
import urllib.request
import json

ELEVENLABS_API_KEY = "sk_6070fada236e6ba630046041ef46759e3e8a2742a2c67c1b"
url = "https://api.elevenlabs.io/v1/voices"

headers = {
    "xi-api-key": ELEVENLABS_API_KEY
}

try:
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req) as response:
        data = json.loads(response.read().decode())
        print("Available voices:")
        for v in data.get("voices", [])[:5]:
            print(f"{v['name']} -> {v['voice_id']}")
except Exception as e:
    print("Error:", e)
