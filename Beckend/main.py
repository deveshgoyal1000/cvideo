import os
os.environ['KMP_DUPLICATE_LIB_OK'] = 'True'
import caption_utils

import json
import base64
import asyncio
import audioop
import time
import math
import struct
from fastapi import FastAPI, HTTPException, UploadFile, File, WebSocket, Request, Response, BackgroundTasks, Depends
from fastapi.responses import FileResponse
import uuid
import shutil
from sqlalchemy.orm import Session
from database import init_db, get_db, TranscriptionJob, RenderJob
from google import genai
from google.genai import types
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import urllib.request
import xml.etree.ElementTree as ET

def gen_beep():
    pcm = bytearray()
    for i in range(int(8000 * 0.1)):
        pcm.extend(struct.pack('<h', int(8000 * math.sin(2 * math.pi * 880 * i / 8000))))
    return base64.b64encode(audioop.lin2ulaw(pcm, 2)).decode('utf-8')

FILLER_BEEP_B64 = gen_beep()

load_dotenv(dotenv_path="../Frontend/.env.local", override=True)
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY") or os.environ.get("NEXT_PUBLIC_GEMINI_API_KEY")
PEXELS_API_KEY = os.environ.get("PEXELS_API_KEY")

if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY is missing in Frontend/.env.local")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    init_db()
    print("Startup complete. Twilio endpoints and Database ready.")

@app.post("/tts")
async def text_to_speech(text: str, language: str = "en", speaker_wav: UploadFile = File(None)):
    raise HTTPException(status_code=500, detail="Local XTTS is temporarily disabled.")

# ---------------------------------------------------------------------------
# Twilio Voice Assistant Pipeline
# ---------------------------------------------------------------------------

SYSTEM_INSTRUCTION = """
You are Rahul, a confident, friendly AI assistant.
Always greet first.
Keep responses short, clear, and slightly energetic.
Speak like a human, not robotic.
in hindi
You work as the receptionist for 'Royal Style Hair Salon' located at MG Road, Sector 18, Noida. Hours: 10AM-8PM.
Services: Haircut Men 500, Women 900.
"""

async def twilio_to_gemini(websocket: WebSocket, session, last_interaction: list):
    try:
        while True:
            try:
                message = await websocket.receive_text()
            except Exception:
                return "TWILIO_CLOSED"
                
            data = json.loads(message)
            if data["event"] == "media":
                try:
                    audio_payload = data["media"]["payload"]
                    chunk_mulaw = base64.b64decode(audio_payload)
                    # Twilio is ulaw 8kHz. Gemini natively needs PCM 16kHz
                    pcm_8k = audioop.ulaw2lin(chunk_mulaw, 2)
                    pcm_16k, _ = audioop.ratecv(pcm_8k, 2, 1, 8000, 16000, None)
                    
                    if audioop.rms(pcm_16k, 2) > 200:
                        last_interaction[0] = time.time()
                        
                    await session.send_realtime_input(
                        audio=types.Blob(data=pcm_16k, mime_type="audio/pcm;rate=16000")
                    )
                except Exception as ex:
                    print("Audio err:", ex)
            elif data["event"] == "stop":
                return "TWILIO_CLOSED"
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"Twilio receive error: {e}")

async def gemini_to_twilio(websocket: WebSocket, session, stream_sid: str, start_t: float):
    first_resp = True
    try:
        async for message in session.receive():
            if first_resp:
                print(f"[{time.time() - start_t:.2f}s] First Gemini Token Received!")
                first_resp = False
            server_content = getattr(message, "server_content", None)
            if server_content is not None:
                model_turn = getattr(server_content, "model_turn", None)
                if model_turn:
                    for part in getattr(model_turn, "parts", []):
                        if getattr(part, "inline_data", None) and getattr(part.inline_data, "data", None):
                            # Gemini replies in PCM 24kHz. Downsample to ulaw 8kHz for Twilio
                            pcm_24k = part.inline_data.data
                            pcm_8k, _ = audioop.ratecv(pcm_24k, 2, 1, 24000, 8000, None)
                            chunk_mulaw = audioop.lin2ulaw(pcm_8k, 2)
                            audio_payload = base64.b64encode(chunk_mulaw).decode("utf-8")
                            
                            media_message = {
                                "event": "media",
                                "streamSid": stream_sid,
                                "media": {
                                    "payload": audio_payload
                                }
                            }
                            await websocket.send_text(json.dumps(media_message))
        return "GEMINI_CLOSED"
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"Gemini receive error: {e}")
        return "GEMINI_CLOSED"

@app.post("/call/incoming", response_class=Response)
async def incoming_call(request: Request):
    """Twilio Webhook: Returns TwiML to open a WebSocket stream."""
    host = request.headers.get("host")
    xml_data = f'''<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Connect>
        <Stream url="wss://{host}/ws/twilio" />
    </Connect>
</Response>'''
    return Response(content=xml_data, media_type="application/xml")

@app.websocket("/ws/twilio")
async def twilio_ws(websocket: WebSocket):
    start_t = time.time()
    await websocket.accept()
    if not GEMINI_API_KEY:
        print("ERROR: GEMINI_API_KEY environment variable not set. Please add it to your .env file.")
        await websocket.close()
        return

    stream_sid = ""
    while True:
        msg = await websocket.receive_text()
        data = json.loads(msg)
        print(f"[Twilio event] {data.get('event', '?')}", flush=True)
        if data["event"] == "start":
            stream_sid = data["start"]["streamSid"]
            print(f"[{time.time() - start_t:.2f}s] Started Twilio stream: {stream_sid}", flush=True)
            break
            
    client = genai.Client(api_key=GEMINI_API_KEY, http_options={'api_version': 'v1alpha'})
    config = types.LiveConnectConfig(
        response_modalities=["AUDIO"],
        system_instruction=types.Content(parts=[types.Part.from_text(text=SYSTEM_INSTRUCTION)]),
        speech_config=types.SpeechConfig(
            voice_config=types.VoiceConfig(
                prebuilt_voice_config=types.PrebuiltVoiceConfig(
                    voice_name="Fenrir"
                )
            )
        ),
        realtime_input_config=types.RealtimeInputConfig(
            automatic_activity_detection=types.AutomaticActivityDetection(
                disabled=False,
                start_of_speech_sensitivity=types.StartSensitivity.START_SENSITIVITY_HIGH,
                end_of_speech_sensitivity=types.EndSensitivity.END_SENSITIVITY_HIGH,
            )
        ),
    )
    
    first_connect = True
    while True:
        try:
            # Native model that natively supports the real-time VAD
            print(f"[{time.time() - start_t:.2f}s] Initiating Gemini Bidi Socket...")
            async with client.aio.live.connect(model='gemini-2.5-flash-native-audio-preview-12-2025', config=config) as session:
                print(f"[{time.time() - start_t:.2f}s] Connected to Gemini Live API.")
                # Array holds: [last_time]
                last_interaction = [time.time()]
                
                async def fallback_monitor():
                    while True:
                        await asyncio.sleep(5)
                        if time.time() - last_interaction[0] > 15:
                            print("Triggering silence fallback!")
                            try:
                                await session.send_client_content(
                                    turns=[types.Content(role="user", parts=[types.Part.from_text(text="I haven't said anything for 15 seconds. Please ask me 'Are you still there?' in Hindi.")])],
                                    turn_complete=True
                                )
                            except Exception:
                                pass
                            last_interaction[0] = time.time()

                # Start tasks FIRST so Gemini receiver is ready before we send the greeting
                f_mon = asyncio.create_task(fallback_monitor())
                t_recv = asyncio.create_task(twilio_to_gemini(websocket, session, last_interaction))
                g_recv = asyncio.create_task(gemini_to_twilio(websocket, session, stream_sid, start_t))

                if first_connect:
                    first_connect = False
                    async def send_greeting():
                        await asyncio.sleep(0.3)  # ensure g_recv is fully listening
                        try:
                            print(f"[{time.time() - start_t:.2f}s] Sending greeting...")
                            await session.send_client_content(
                                turns=[types.Content(role="user", parts=[types.Part.from_text(text="Hello! The customer has just picked up the phone. Please say your opening greeting in Hindi immediately.")])],
                                turn_complete=True
                            )
                        except Exception as ex:
                            print(f"Greeting error: {ex}")
                    asyncio.create_task(send_greeting())
                
                # Robust auto-recovery wait mapping!
                done, pending = await asyncio.wait([t_recv, g_recv], return_when=asyncio.FIRST_COMPLETED)
                for task in pending:
                    task.cancel()
                f_mon.cancel()
                
                for task in done:
                    if task.result() == "TWILIO_CLOSED":
                        print("Twilio hung up successfully! Ending webhook.")
                        return 
                        
            print("Gemini session ended. Reconnecting internally...")
            await asyncio.sleep(1)
            
        except Exception as e:
            import traceback
            traceback.print_exc()
            print(f"Session dropped with error: {e}. Retrying connection...")
            await asyncio.sleep(1)

class ScriptRequest(BaseModel):
    news_text: str

class AudioRequest(BaseModel):
    script_text: str
    voice: str = "Fenrir"

@app.get("/api/fetch-news")
async def fetch_news():
    # Expanded list of high-quality, frequently updated AI feeds focusing on global & industry news
    feeds = [
        "https://techcrunch.com/category/artificial-intelligence/feed/",
        "https://venturebeat.com/category/ai/feed/",
        "https://www.theverge.com/rss/artificial-intelligence/index.xml",
        "https://www.artificialintelligence-news.com/feed/"
    ]
    
    # Priority keywords relating to "collabs", "partnerships", and "world news"
    priority_keywords = ["collab", "partner", "join", "team up", "world", "global", "acquire", "merge", "invest", "launch"]
    
    news = []
    try:
        import re
        for feed in feeds:
            try:
                req = urllib.request.Request(feed, headers={'User-Agent': 'Mozilla/5.0'})
                with urllib.request.urlopen(req, timeout=5) as response:
                    xml_data = response.read()
                    
                    # Remove namespaces to make parsing both RSS and Atom much easier
                    xml_str = xml_data.decode('utf-8')
                    xml_str = re.sub(r'\sxmlns="[^"]+"', '', xml_str, count=1)
                    root = ET.fromstring(xml_str)
                    
                    # Instead of top 5, extract up to 10 to give our sorting engine more to work with
                    items = root.findall('./channel/item')
                    if not items:
                        # Fallback for Atom feeds
                        items = root.findall('./entry')
                        
                    for item in items[:12]:
                        title_el = item.find('title')
                        desc_el = item.find('description')
                        if desc_el is None:
                            desc_el = item.find('summary') # Atom feed
                            if desc_el is None:
                                desc_el = item.find('content')
                            
                        title = title_el.text if title_el is not None else ""
                        desc = desc_el.text if desc_el is not None else ""
                        
                        # Clean up HTML tags from description
                        desc = re.sub('<[^<]+?>', '', desc).strip()
                        
                        if title:
                            # Calculate a 'hype score' to bubble up the best collab and global news
                            title_lower = title.lower()
                            score = 0
                            for pk in priority_keywords:
                                if pk in title_lower:
                                    score += 2
                                    
                            news.append({"title": title, "summary": desc[:200] + "..." if len(desc)>200 else desc, "score": score})
            except Exception as feed_e:
                print(f"Failed to parse feed {feed}: {feed_e}")
                
        # Sort news by score descending (highest priority first), then deduplicate
        news.sort(key=lambda x: x["score"], reverse=True)
        
        # Deduplicate titles (sometimes feeds report the same news)
        unique_news = []
        seen_titles = set()
        for item in news:
            if item["title"] not in seen_titles:
                unique_news.append(item)
                seen_titles.add(item["title"])
                
        # Return the top 8 most exciting stories!
        return {"status": "success", "data": unique_news[:8]}
    except Exception as e:
        import traceback
        traceback.print_exc()
        return {"status": "error", "message": str(e)}

@app.post("/api/generate-script")
async def generate_script(req: ScriptRequest):
    if not GEMINI_API_KEY:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY is missing.")
    
    prompt = f"""
    Write a highly engaging, fast-paced YouTube Shorts script based on the following AI news.
    Constraints:
    - Write the entire script strictly in Hindi but use English characters (Hinglish/Message Language, e.g., "Kya aapne socha hai").
    - DO NOT use Devanagari script.
    - CRITICAL: Translate all English vocabulary into common, conversational Hindi words! For example: do not say 'dangerous', say 'khatarnak'. Do not say 'discussions', say 'baatcheet' or 'charcha'. Do not say 'experts', say 'maahir'. Keep the English mixing to an absolute minimum!
    - 30 to 60 seconds spoken length max.
    - Start with a powerful 3-second hook to grab attention.
    - Explain the core idea simply (human tone, not robotic).
    - End with a clear Call To Action (CTA).
    - CRITICAL: Output ONLY the raw spoken dialogue. DO NOT include any headings, timestamps, time durations, stage directions, or labels like 'Hook', 'Main Content', or 'CTA'. It must be a single fluent paragraph.
    
    News context:
    {req.news_text}
    """
    
    try:
        import time
        client = genai.Client(api_key=GEMINI_API_KEY)
        
        for attempt in range(8):
            try:
                # Must use gemini-2.5-flash. Older models like 2.0 and 1.5 are deprecated for new API keys.
                # Your new API key gives you a fresh 20 limit quota for today!
                response = client.models.generate_content(
                    model='gemini-2.5-flash',
                    contents=prompt
                )
                return {"status": "success", "script": response.text.replace('*', '').strip()}
            except Exception as loop_e:
                err_str = str(loop_e)
                if '503' in err_str and attempt < 7:
                    print(f"API overloaded (503). Retrying in 6 seconds... (Attempt {attempt+1}/8)")
                    time.sleep(6)
                elif '429' in err_str:
                    # Detect if it's a hard DAILY limit vs a per-minute rate limit
                    is_daily_limit = 'PerDay' in err_str or 'per_day' in err_str.lower()
                    if is_daily_limit or attempt >= 2:
                        # Hard daily limit — no point waiting, go straight to fallback
                        raise loop_e
                    else:
                        # Per-minute rate limit — wait the suggested delay then retry
                        import re
                        delay_match = re.search(r'retry in (\d+(?:\.\d+)?)s', err_str)
                        wait = float(delay_match.group(1)) if delay_match else 15.0
                        wait = min(wait, 30.0)  # Cap at 30 seconds for RPM limits
                        print(f"Rate-limited (429 RPM). Waiting {wait:.0f}s before retry... (Attempt {attempt+1}/3)")
                        time.sleep(wait)
                else:
                    raise loop_e
                    
    except Exception as e:
        err_str = str(e)
        print(f"DEBUG API ERROR: {err_str}")
        if '429' in err_str or 'quota' in err_str.lower() or 'RESOURCE_EXHAUSTED' in err_str or '400' in err_str:
            print("WARNING: Gemini daily quota exhausted or request failed. Generating topic-specific offline fallback script.")
            # Extract the key topic from the news text for dynamic fallback generation
            news_words = req.news_text.replace('\n', ' ').strip()
            # Take first ~12 words as the headline hook
            headline_words = ' '.join(news_words.split()[:12])
            # Take next chunk as core idea
            body_words = ' '.join(news_words.split()[12:40]) if len(news_words.split()) > 12 else news_words
            
            # Clean punctuation from fallback to look perfect in UI and captions
            import re
            headline_words = re.sub(r'[^\w\s]', '', headline_words)
            body_words = re.sub(r'[^\w\s]', '', body_words)
            
            fallback = (
                f"Suniye! Abhi abhi ek badi khabar aayi hai {headline_words}. "
                f"Ye technology ki duniya mein ek game changing moment hai! "
                f"{body_words} "
                f"Experts ka maanna hai ki ye development AI aur tech industry ko poori tarah se naye direction mein le jaayegi. "
                f"Ye sirf shuruaat hai aane wale mahino mein aur bhi bade badlaav dekhne ko milenge. "
                f"Aapko kya lagta hai? Kya ye really itna bada hai? Comments mein zaroor batao "
                f"aur aise hi latest tech updates ke liye abhi channel ko follow karo!"
            )
            return {"status": "success", "script": fallback}
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=err_str)

@app.post("/api/generate-audio")
async def generate_audio(req: AudioRequest):
    try:
        from google.genai import types
        import asyncio
        import wave
        import io
        import base64
        
        client = genai.Client(api_key=GEMINI_API_KEY, http_options={'api_version': 'v1alpha'})
        
        # Clean text
        clean_text = req.script_text.replace('*', '').replace('_', '').strip()
        
        config = types.LiveConnectConfig(
            response_modalities=["AUDIO"],
            speech_config=types.SpeechConfig(
                voice_config=types.VoiceConfig(
                    prebuilt_voice_config=types.PrebuiltVoiceConfig(
                        voice_name="Fenrir" # Rahul
                    )
                )
            )
        )
        
        pcm_chunks = bytearray()
        
        for attempt in range(4):
            try:
                # Native Audio accent control
                prompt_text = (
                    f"Read this exactly as written using a fluent, energetic, native Indian Hindi accent. "
                    f"Pronounce all romanized words smoothly as conversational Hindi, with no stuttering or breaks. Do not translate. "
                    f"Script: {clean_text}"
                )
                
                async with client.aio.live.connect(model='gemini-2.5-flash-native-audio-preview-12-2025', config=config) as session:
                    await session.send_client_content(
                        turns=[types.Content(role="user", parts=[types.Part.from_text(text=prompt_text)])],
                        turn_complete=True
                    )
                    
                    async for message in session.receive():
                        server_content = getattr(message, "server_content", None)
                        if server_content is not None:
                            model_turn = getattr(server_content, "model_turn", None)
                            if model_turn:
                                for part in getattr(model_turn, "parts", []):
                                    if getattr(part, "inline_data", None) and getattr(part.inline_data, "data", None):
                                        pcm_chunks.extend(part.inline_data.data)
                            
                            if getattr(server_content, "turn_complete", False):
                                break
                                
                if len(pcm_chunks) == 0:
                    raise Exception("No PCM audio bytes received from Gemini.")
                
                # Wrap PCM in a WAV container (24kHz, 16-bit mono)
                wav_io = io.BytesIO()
                with wave.open(wav_io, 'wb') as wav_file:
                    wav_file.setnchannels(1)
                    wav_file.setsampwidth(2)
                    wav_file.setframerate(24000)
                    wav_file.writeframes(bytes(pcm_chunks))
                    
                b64_audio = base64.b64encode(wav_io.getvalue()).decode('utf-8')
                return {"status": "success", "audioBase64": b64_audio, "mimeType": "audio/wav"}
                
            except Exception as loop_e:
                if '503' in str(loop_e) and attempt < 3:
                    import time
                    print(f"Audio API overloaded (503). Retrying in 3 seconds... (Attempt {attempt+1}/4)")
                    time.sleep(3)
                elif '429' in str(loop_e) and attempt < 3:
                    import time
                    import re
                    m = re.search(r'retry in (\d+(?:\.\d+)?)s', str(loop_e))
                    wait_time = float(m.group(1)) if m else 10.0
                    print(f"Rate limited 429. Retrying in {wait_time} seconds...")
                    time.sleep(wait_time)
                else:
                    raise loop_e
                    
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Audio generation failed: {str(e)}")

class ClipSearchRequest(BaseModel):
    keyword: str
    duration: int = 25  # target duration in seconds (20-30)

@app.post("/api/search-clips")
async def search_clips(req: ClipSearchRequest):
    """Search Pexels for clips matching a keyword, combine them into a single 20-30s portrait video."""
    import shutil
    import subprocess
    import imageio_ffmpeg
    from concurrent.futures import ThreadPoolExecutor
    
    keyword = req.keyword.strip()
    target_duration = max(10, min(60, req.duration))
    
    if not keyword:
        raise HTTPException(status_code=400, detail="Keyword is required.")
    
    pexels_key = os.environ.get("PEXELS_API_KEY", "")
    if not pexels_key:
        raise HTTPException(status_code=500, detail="PEXELS_API_KEY is not configured.")

    # --- 1. AI Query Expansion for better relevancy ---
    # Helps with generic terms like "hii" -> "person waving hello"
    search_keyword = keyword
    try:
        client = genai.Client(api_key=GEMINI_API_KEY)
        expansion_prompt = (
            f"The user is searching for video clips with the keyword: '{keyword}'. "
            f"Suggest a more descriptive, 2-3 word English search term that would return high-quality, relevant stock footage on Pexels. "
            f"For example, 'hii' -> 'person waving hello', 'fast' -> 'racing car city'. "
            f"Output ONLY the improved search term."
        )
        response = client.models.generate_content(model='gemini-2.5-flash', contents=expansion_prompt)
        expanded = response.text.strip().replace('"', '').replace('*', '')
        if expanded and len(expanded) < 60:
            search_keyword = expanded
            print(f"[CLIP] AI Query Expansion: '{keyword}' -> '{search_keyword}'")
    except Exception as ex:
        print(f"[CLIP] Query expansion failed: {ex}")

    work_dir = os.path.abspath(f"temp_clips_{uuid.uuid4().hex[:6]}")
    os.makedirs(work_dir, exist_ok=True)
    
    try:
        # 2. Search Pexels
        encoded_kw = urllib.parse.quote(search_keyword)
        pexels_url = f"https://api.pexels.com/v1/videos/search?query={encoded_kw}&orientation=portrait&per_page=15&size=medium"
        req_obj = urllib.request.Request(pexels_url, headers={
            'Authorization': pexels_key,
            'User-Agent': 'Mozilla/5.0'
        })
        
        with urllib.request.urlopen(req_obj, timeout=30) as response:
            data = json.loads(response.read().decode('utf-8'))
        
        videos = data.get("videos", [])
        if not videos:
            raise HTTPException(status_code=404, detail=f"No clips found for '{search_keyword}'. Try a different word.")
        
        # 3. Parallel Downloads (Speed Boost!)
        downloaded = []
        def download_task(args):
            i, video = args
            all_files = video.get("video_files", [])
            # Prefer SD for much faster downloads and processing
            all_files.sort(key=lambda f: {"sd": 0, "hd": 1, "uhd": 2}.get(f.get("quality", ""), 3))
            download_link = all_files[0].get("link") if all_files else None
            if not download_link: return None
                
            out_vid = os.path.join(work_dir, f"raw_{i}.mp4")
            try:
                req_vid = urllib.request.Request(download_link, headers={'User-Agent': 'Mozilla/5.0'})
                with urllib.request.urlopen(req_vid, timeout=30) as down_res, open(out_vid, 'wb') as out_file:
                    shutil.copyfileobj(down_res, out_file)
                if os.path.getsize(out_vid) > 5000:
                    return out_vid
            except: pass
            return None

        # Use 5 threads for concurrent downloads
        with ThreadPoolExecutor(max_workers=5) as executor:
            download_results = list(executor.map(download_task, enumerate(videos[:8])))
            downloaded = [r for r in download_results if r]

        if not downloaded:
            raise HTTPException(status_code=500, detail="Failed to download any clips.")
        
        # 4. Parallel FFmpeg Processing (Major Speed Boost!)
        ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
        per_clip_duration = target_duration / len(downloaded)
        processed = []

        def process_task(args):
            i, raw_path = args
            out_clip = os.path.join(work_dir, f"clip_{i}.mp4")
            cmd = [
                ffmpeg_exe, "-y",
                "-i", raw_path,
                "-t", f"{per_clip_duration:.2f}",
                # Scale, crop to 9:16, ensure 25fps for concatenation stability
                "-vf", "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=25,setsar=1/1",
                "-c:v", "libx264",
                "-preset", "ultrafast", # Maximum speed
                "-pix_fmt", "yuv420p",
                "-an", # Remove audio to avoid sync issues during concat
                out_clip
            ]
            subprocess.run(cmd, capture_output=True)
            if os.path.exists(out_clip) and os.path.getsize(out_clip) > 5000:
                return out_clip
            return None

        # Process clips in parallel
        with ThreadPoolExecutor(max_workers=4) as executor:
            process_results = list(executor.map(process_task, enumerate(downloaded)))
            processed = [r for r in process_results if r]
        
        if not processed:
            raise HTTPException(status_code=500, detail="Failed to process any clips.")
        
        # 5. Concatenate (Near instant since files are pre-formatted)
        concat_list = os.path.join(work_dir, "concat.txt")
        with open(concat_list, "w") as f:
            for clip in processed:
                f.write(f"file '{os.path.basename(clip)}'\n")
        
        final_video = os.path.join(work_dir, "final.mp4")
        concat_cmd = [
            ffmpeg_exe, "-y",
            "-f", "concat",
            "-safe", "0",
            "-i", concat_list,
            "-c", "copy",
            final_video
        ]
        subprocess.run(concat_cmd, cwd=work_dir, capture_output=True)
        
        # 6. Return as base64
        with open(final_video, "rb") as f:
            video_b64 = base64.b64encode(f.read()).decode('utf-8')
        
        return {
            "status": "success",
            "videoBase64": video_b64,
            "mimeType": "video/mp4",
            "clipCount": len(processed),
            "keyword": keyword,
            "search_expanded": search_keyword
        }
        
    except HTTPException: raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Clip search failed: {str(e)}")
    finally:
        try: shutil.rmtree(work_dir)
        except: pass
        


class VideoRequest(BaseModel):
    script_text: str
    audio_base64: str

@app.post("/api/generate-video")
def generate_video(req: VideoRequest):
    try:
        from video_assembler import assemble_video
        video_b64 = assemble_video(req.audio_base64, req.script_text)
        return {"status": "success", "videoBase64": video_b64, "mimeType": "video/mp4"}
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Video Compilation failed: {str(e)}")

class RenderRequest(BaseModel):
    video_base64: str
    words_data: list
    style: str

@app.post("/api/captions/transcribe")
async def transcribe_captions(file: UploadFile = File(...)):
    import shutil
    from caption_utils import transcribe_video
    try:
        os.makedirs("temp", exist_ok=True)
        temp_vid = f"temp/{uuid.uuid4()}_{file.filename}"
        with open(temp_vid, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        words_data = transcribe_video(temp_vid)
        
        # Read the video back as base64 to send to frontend so we don't have to re-upload it
        with open(temp_vid, "rb") as f:
            video_b64 = base64.b64encode(f.read()).decode('utf-8')
            
        os.remove(temp_vid)
        
        return {"status": "success", "words": words_data, "video_base64": video_b64}
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/captions/render")
async def render_captions_api(req: RenderRequest):
    from caption_utils import render_captions
    try:
        os.makedirs("temp", exist_ok=True)
        temp_vid = f"temp/{uuid.uuid4()}.mp4"
        out_vid = f"temp/rendered_{uuid.uuid4()}.mp4"
        
        with open(temp_vid, "wb") as f:
            f.write(base64.b64decode(req.video_base64))
            
        render_captions(temp_vid, req.words_data, req.style, out_vid)
        
        with open(out_vid, "rb") as f:
            final_b64 = base64.b64encode(f.read()).decode('utf-8')
            
        try:
            os.remove(temp_vid)
            os.remove(out_vid)
            os.remove(out_vid + ".ass")
        except:
            pass
            
        return {"status": "success", "video_base64": final_b64}
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

# ---------------------------------------------------------------------------
# V2 ASYNC CAPTION ENDPOINTS
# ---------------------------------------------------------------------------

def background_transcribe(job_id: str, video_path: str, db: Session):
    try:
        from caption_utils import transcribe_video, enhance_transcript_with_ai
        words_data = transcribe_video(video_path)
        words_data = enhance_transcript_with_ai(words_data)
        
        job = db.query(TranscriptionJob).filter(TranscriptionJob.id == job_id).first()
        if job:
            job.status = "completed"
            job.words_data = words_data
            db.commit()
    except Exception as e:
        job = db.query(TranscriptionJob).filter(TranscriptionJob.id == job_id).first()
        if job:
            job.status = "failed"
            job.error_message = str(e)
            db.commit()

@app.post("/api/captions/v2/transcribe")
async def transcribe_captions_v2(background_tasks: BackgroundTasks, file: UploadFile = File(...), db: Session = Depends(get_db)):
    os.makedirs("temp", exist_ok=True)
    temp_vid = f"temp/{uuid.uuid4()}_{file.filename}"
    with open(temp_vid, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    job_id = str(uuid.uuid4())
    job = TranscriptionJob(id=job_id, status="processing")
    db.add(job)
    db.commit()
    
    # Needs a separate DB session for background task, or we can just pass the path. 
    # Passing the exact session across threads is dangerous in SQLAlchemy if check_same_thread=True, but we disabled it.
    # For safety, we will let background task manage its own, or just pass `db` since we disabled thread check.
    background_tasks.add_task(background_transcribe, job_id, temp_vid, db)
    return {"status": "success", "job_id": job_id, "video_path": temp_vid}

@app.get("/api/captions/v2/status/{job_id}")
async def get_transcribe_status(job_id: str, db: Session = Depends(get_db)):
    job = db.query(TranscriptionJob).filter(TranscriptionJob.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return {"job_id": job.id, "status": job.status, "words": job.words_data, "error": job.error_message}

class RenderRequestV2(BaseModel):
    words_data: list
    style: str
    video_path: str

def background_render(job_id: str, video_path: str, words_data: list, style: str, db: Session):
    try:
        from caption_utils import render_captions
        out_vid = f"temp/rendered_{job_id}.mp4"
        render_captions(video_path, words_data, style, out_vid)
        
        job = db.query(RenderJob).filter(RenderJob.id == job_id).first()
        if job:
            job.status = "completed"
            job.output_video_path = out_vid
            db.commit()
    except Exception as e:
        job = db.query(RenderJob).filter(RenderJob.id == job_id).first()
        if job:
            job.status = "failed"
            job.error_message = str(e)
            db.commit()

@app.post("/api/captions/v2/render")
async def render_captions_v2(req: RenderRequestV2, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    job_id = str(uuid.uuid4())
    job = RenderJob(id=job_id, status="processing", style=req.style)
    db.add(job)
    db.commit()
    
    background_tasks.add_task(background_render, job_id, req.video_path, req.words_data, req.style, db)
    return {"status": "success", "job_id": job_id}

# ---------------------------------------------------------------------------
# V3 Enterprise Pipeline Endpoints
# ---------------------------------------------------------------------------
def background_transcribe_v3(job_id: str, video_path: str, db: Session):
    try:
        from core.orchestrator import PipelineManager
        from captions.transcriber import TranscriberEngine
        from captions.timing_engine import TimingEngine
        from captions.nlp_engine import NLPEngine
        from captions.chunker_engine import ChunkerEngine
        from captions.geometry_engine import GeometryEngine
        from captions.layout_engine import LayoutEngine
        from captions.template_compiler import TemplateCompiler
        from captions.style_resolver import StyleResolver
        from captions.effects_engine import EffectsEngine
        from captions.animation_engine import AnimationEngine
        from rules.rule_engine import RuleEngine
        from models.core import Project
        from uuid import UUID

        pipeline = PipelineManager([
            TranscriberEngine(), TimingEngine(), NLPEngine(), ChunkerEngine(),
            GeometryEngine(), LayoutEngine(), TemplateCompiler(), StyleResolver(),
            EffectsEngine(), AnimationEngine(), RuleEngine()
        ])
        project = Project(id=UUID(job_id), video_path=video_path, language="en")
        project = pipeline.run(project)
        
        job = db.query(TranscriptionJob).filter(TranscriptionJob.id == job_id).first()
        if job:
            job.status = "completed"
            job.words_data = [project.model_dump(mode='json')]
            db.commit()
    except Exception as e:
        job = db.query(TranscriptionJob).filter(TranscriptionJob.id == job_id).first()
        if job:
            job.status = "failed"
            job.error_message = str(e)
            db.commit()

@app.post("/api/captions/v3/transcribe")
async def transcribe_captions_v3(background_tasks: BackgroundTasks, file: UploadFile = File(...), db: Session = Depends(get_db)):
    os.makedirs("temp", exist_ok=True)
    temp_vid = f"temp/{uuid.uuid4()}_{file.filename}"
    with open(temp_vid, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    job_id = str(uuid.uuid4())
    job = TranscriptionJob(id=job_id, status="processing")
    db.add(job)
    db.commit()
    
    background_tasks.add_task(background_transcribe_v3, job_id, temp_vid, db)
    return {"status": "success", "job_id": job_id, "video_path": temp_vid}

@app.get("/api/captions/v3/status/{job_id}")
async def get_transcribe_status_v3(job_id: str, db: Session = Depends(get_db)):
    job = db.query(TranscriptionJob).filter(TranscriptionJob.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return {"job_id": job.id, "status": job.status, "project_data": job.words_data, "error": job.error_message}

class RenderRequestV3(BaseModel):
    project_data: dict

def background_render_v3(job_id: str, project_dict: dict, db: Session):
    try:
        import subprocess
        from models.core import Project
        from render.ass_renderer import ASSRenderer
        import imageio_ffmpeg
        
        project = Project.model_validate(project_dict)
        ass_path = f"temp/rendered_{job_id}.ass"
        out_vid = f"temp/rendered_{job_id}.mp4"
        
        ASSRenderer().generate_ass(project, ass_path)
        
        ffmpeg_path = imageio_ffmpeg.get_ffmpeg_exe()
        
        ass_path_escaped = ass_path.replace('\\', '/')
        if len(ass_path_escaped) > 1 and ass_path_escaped[1] == ':':
            ass_path_escaped = ass_path_escaped[0] + '\\:' + ass_path_escaped[2:]

        command = [
            ffmpeg_path, "-y", "-i", project.video_path,
            "-vf", f"ass='{ass_path_escaped}'",
            "-c:v", "libx264", "-preset", "veryfast", "-crf", "23",
            "-c:a", "copy", out_vid
        ]
        subprocess.run(command, check=True)
        
        job = db.query(RenderJob).filter(RenderJob.id == job_id).first()
        if job:
            job.status = "completed"
            job.output_video_path = out_vid
            db.commit()
    except Exception as e:
        job = db.query(RenderJob).filter(RenderJob.id == job_id).first()
        if job:
            job.status = "failed"
            job.error_message = str(e)
            db.commit()

@app.post("/api/captions/v3/render")
async def render_captions_v3(req: RenderRequestV3, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    job_id = str(uuid.uuid4())
    job = RenderJob(id=job_id, status="processing", style=req.project_data.get("template_id", "modern"))
    db.add(job)
    db.commit()
    
    background_tasks.add_task(background_render_v3, job_id, req.project_data, db)
    return {"status": "success", "job_id": job_id}

@app.get("/api/captions/v3/render_status/{job_id}")
async def get_render_status_v3(job_id: str, db: Session = Depends(get_db)):
    job = db.query(RenderJob).filter(RenderJob.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return {"job_id": job.id, "status": job.status, "error": job.error_message}

@app.get("/api/captions/v3/download/{job_id}")
async def download_rendered_video_v3(job_id: str, db: Session = Depends(get_db)):
    job = db.query(RenderJob).filter(RenderJob.id == job_id).first()
    if not job or not job.output_video_path or not os.path.exists(job.output_video_path):
        raise HTTPException(status_code=404, detail="Video not found or not finished")
    return FileResponse(job.output_video_path, media_type="video/mp4", filename=f"rendered_{job_id}.mp4")

if __name__ == "__main__":
    import uvicorn
    # Use port 8000 as 3000 is in use
    uvicorn.run(app, host="0.0.0.0", port=8000)
