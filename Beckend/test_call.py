import os
from twilio.rest import Client

account_sid = "YOUR_ACCOUNT_SID"
auth_token  = "YOUR_AUTH_TOKEN"

# Get fresh local tunnel URL using Localtunnel (use output from `lt --port 8000`)
# Provide this URL EXACTLY when promoted (no http://, just the ngrok/localtunnel hostname)
# Example: my-app.loca.lt or my-ngrok-url.ngrok-free.app
TUNNEL_URL = "elle-unsatiating-sherwood.ngrok-free.dev"

client = Client(account_sid, auth_token)

print("Firing Twilio API...")
print("================================================================")
ngrok_url = f"https://{TUNNEL_URL}"

if not ngrok_url.endswith("/call/incoming"):
    ngrok_url = ngrok_url.rstrip("/") + "/call/incoming"

print(f"\nInitiating outbound call to +917597388556...")
print(f"Telling Twilio to fetch instructions from: {ngrok_url}\n")

try:
    call = client.calls.create(
        url=ngrok_url,
        to="+917597388556",
        from_="+16624395286"
    )
    print(f"Call initiated successfully! Your phone should ring shortly. (Call SID: {call.sid})")
except Exception as e:
    print(f"Error making call: {e}")
