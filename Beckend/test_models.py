import os
from google import genai

client = genai.Client(api_key="AIzaSyAIovaAj36WMTNcSEokm3-WXin4k1Hn1xk")

try:
    for m in client.models.list_models():
        if "audio" in m.name or "flash" in m.name:
            print(m.name, m.supported_generation_methods)
except Exception as e:
    print("Error:", e)
