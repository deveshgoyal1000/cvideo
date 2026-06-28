import os
from google import genai

client = genai.Client(api_key="AIzaSyAIovaAj36WMTNcSEokm3-WXin4k1Hn1xk")

try:
    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents='Reply precisely with the word OK.'
    )
    print("Success:", response.text)
except Exception as e:
    print("Error:", e)
