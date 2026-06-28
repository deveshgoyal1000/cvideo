import os
import time
import json
import uuid
import base64
import math
import shutil
import urllib.request
import urllib.parse
import subprocess
from pydub import AudioSegment
import imageio_ffmpeg
from google import genai
from dotenv import load_dotenv

load_dotenv(dotenv_path="../Frontend/.env.local")
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")

def format_timestamp(seconds):
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    secs = int(seconds % 60)
    millis = int((seconds % 1) * 1000)
    return f"{hours:02d}:{minutes:02d}:{secs:02d},{millis:03d}"

def generate_srt(script_text, start_sec, end_sec, output_path):
    import re
    # Clean out all punctuation (including dashes, commas, periods) and make UPPERCASE
    # This creates punchy, modern, clean captions without awkward symbols hanging around.
    clean_text = re.sub(r'[^\w\s]', '', script_text).upper()
    words = re.split(r'\s+', clean_text.strip())
    
    # Dynamic chunking: combine small words so they don't flash by too fast
    captions = []
    current_chunk = []
    
    for word in words:
        current_chunk.append(word)
        # Group moderately: 5-6 words OR 30 chars
        # This keeps them slow and readable without being too bulky
        if len(current_chunk) >= 5 or len(" ".join(current_chunk)) >= 30:
            captions.append(" ".join(current_chunk))
            current_chunk = []
            
    if current_chunk:
        captions.append(" ".join(current_chunk))
            
    # Calculate total characters to assign proportional time
    total_chars = sum(len(c) for c in captions)
    if total_chars == 0: total_chars = 1
    
    with open(output_path, "w", encoding="utf-8") as f:
        current_t = start_sec
        active_duration = end_sec - start_sec
        for i, caption in enumerate(captions):
            # Proportional duration ensures short words flash fast, long words stay longer
            duration_per_cap = active_duration * (len(caption) / total_chars)
            start_t = current_t
            end_t = current_t + duration_per_cap
            current_t = end_t
            
            f.write(f"{i+1}\n")
            f.write(f"{format_timestamp(start_t)} --> {format_timestamp(end_t)}\n")
            f.write(f"{caption}\n\n")

# Removed fetch_image_prompts as we are switching to instant static visualizer

def assemble_video(b64_audio, script_text):
    # Setup Paths
    work_dir = os.path.abspath(f"temp_video_{uuid.uuid4().hex[:6]}")
    os.makedirs(work_dir, exist_ok=True)
    
    bg_music_path = os.path.abspath(os.path.join("assets", "music", "bg_music.mp3"))
    has_music = os.path.exists(bg_music_path)
    
    try:
        # 1. Parse Audio correctly without relying on system FFprobe which is missing on Windows native
        import io, wave, re
        
        audio_bytes = base64.b64decode(b64_audio)
        audio_path = os.path.join(work_dir, "speech.wav")
        
        with open(audio_path, "wb") as f:
            f.write(audio_bytes)
            
        # 1. Parse Audio Duration robustly using exact FFmpeg natively
        ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
        cmd = [ffmpeg_exe, "-i", audio_path, "-f", "null", "-"]
        res = subprocess.run(cmd, stderr=subprocess.PIPE, text=True)
        match = re.search(r"Duration:\s*(\d+):(\d+):(\d+\.\d+)", res.stderr)
        if match:
            duration_sec = int(match.group(1))*3600 + int(match.group(2))*60 + float(match.group(3))
        else:
            print("FFmpeg probe failed, falling back to 15s")
            duration_sec = 15.0
            
        start_sec = 0.0
        end_sec = duration_sec
        
        # 2. Get Captions perfectly synced to speech start/end
        srt_path = os.path.join(work_dir, "captions.srt")
        generate_srt(script_text, start_sec, end_sec, srt_path)
        
        # 3. Dynamic Timeline Mapping & Semantic Extract
        import re
        clean_text = script_text.replace('\n', ' ')
        raw_sentences = re.split(r'(?<=[.!?]) +', clean_text)
        
        scenes = []
        current_scene = ""
        for sent in raw_sentences:
            current_scene += " " + sent if current_scene else sent
            if len(current_scene.split()) >= 12:
                scenes.append(current_scene.strip())
                current_scene = ""
        if current_scene:
            if scenes:
                scenes[-1] += " " + current_scene.strip()
            else:
                scenes.append(current_scene.strip())
                
        # Allocate exact durations to each Scene based on spoken word velocity
        total_words = len(script_text.split())
        time_per_word = duration_sec / max(1, total_words)
        
        # ---------- Tech-Aware Keyword Extraction System ----------
        
        # Tier 1: Priority tech visual keywords - if ANY of these appear in the scene, use them
        TECH_VISUAL_KEYWORDS = {
            # AI / ML
            "artificial intelligence": "artificial intelligence visualization",
            "machine learning": "machine learning neural network",
            "deep learning": "deep learning AI",
            "neural network": "neural network visualization",
            "llm": "large language model AI",
            "chatgpt": "AI chatbot interface",
            "openai": "AI technology server",
            "gemini": "AI technology futuristic",
            "gpt": "AI language model",
            "transformer": "AI transformer model",
            # Hardware
            "gpu": "GPU chip hardware",
            "chip": "semiconductor chip",
            "semiconductor": "semiconductor chip factory",
            "processor": "processor chip technology",
            "nvidia": "GPU chip hardware",
            "quantum": "quantum computer",
            "supercomputer": "supercomputer data center",
            # Space / Orbital
            "satellite": "satellite space orbit",
            "orbital": "satellite space orbit",
            "orbit": "earth orbit satellite",
            "rocket": "rocket launch space",
            "space": "outer space technology",
            "kepler": "satellite space orbit",
            # Cloud / Data
            "cloud": "cloud computing server",
            "server": "server room data center",
            "data center": "data center servers",
            "compute": "data center computing",
            "cluster": "server cluster data center",
            # Robotics / Automation
            "robot": "robot automation",
            "robotics": "robotics automation",
            "automation": "factory automation robot",
            "autonomous": "autonomous robot drone",
            "drone": "drone technology flying",
            # Software / Models
            "model": "AI model training",
            "algorithm": "algorithm code programming",
            "software": "software code programming",
            "code": "programming code developer",
            "api": "API technology software",
            # Biotech / General Tech
            "healthcare": "medical AI technology",
            "cybersecurity": "cybersecurity hacker network",
            "blockchain": "blockchain technology digital",
            "crypto": "cryptocurrency blockchain",
            "startup": "startup technology office",
            "investment": "technology investment finance",
        }
        
        # Tier 2: Generic stopwords + Hinglish words to NEVER use as Pexels query
        BLOCKED_WORDS = {
            # English stopwords
            "this","that","what","where","when","why","how","with","from","they","them",
            "their","will","would","could","should","have","been","there","then","about",
            "which","these","those","very","just","also","even","more","most","only",
            "some","such","than","then","into","over","after","before","also","both",
            "each","many","much","other","same","than","too","very","well","also",
            # Visual non-useful words
            "game","changing","moment","latest","really","truly","actually","simply",
            "amazing","incredible","beautiful","powerful","biggest","better","best",
            # CTA / Hinglish words that would give zero Pexels results
            "suniye","abhi","badi","khabar","aayi","duniya","mein","technology",
            "ki","hai","aur","ke","baare","karenge","badalne","wali","aane",
            "wale","mahino","bade","badlaav","dekhne","milenge","aapko","lagta",
            "kya","zaroor","batao","aise","liye","channel","follow","karo",
            "shuruaat","sirf","taraf","poori","tarah","naye","direction","jaayegi",
            "experts","maanna","ki","ye","development","comments","follow",
            "subscribe","video","shorts","watch","like","share","join",
        }
        
        scene_data = []
        print("Generating English Semantic Keywords via Gemini...")
        try:
            client = genai.Client(api_key=GEMINI_API_KEY)
            kw_prompt = "You are a stock footage visualizer. Give EXACTLY one generic English visual noun (e.g. 'smartphone', 'server', 'robot', 'office', 'finance', 'typing', 'hacker') for each of the following Hinglish scenes to search stock videos. Return ONLY a comma-separated list of English words in order, nothing else.\n"
            kw_prompt += "\n".join([f"{i}. {s}" for i, s in enumerate(scenes)])
            
            response = client.models.generate_content(
                model='gemini-2.5-flash',
                contents=kw_prompt
            )
            english_keywords = [k.strip().replace('.','') for k in response.text.split(',')]
        except Exception as e:
            print(f"Gemini keyword extract failed: {e}")
            english_keywords = []

        print("Generated Semantic Scenes:")
        for i, scene_text in enumerate(scenes):
            scene_words = len(scene_text.split())
            scene_duration = scene_words * time_per_word
            if scene_duration < 1.0: scene_duration = 1.0
            
            # Safely grab the English keyword generated by Gemini, fallback to basic tech keywords
            fallback_kws = ["technology innovation", "artificial intelligence", "data center", "robotics", "futuristic tech", "matrix code"]
            kw = english_keywords[i] if i < len(english_keywords) and len(english_keywords[i]) >= 3 else fallback_kws[i % len(fallback_kws)]
            
            s = {
                "text": scene_text,
                "duration": scene_duration,
                "keyword": kw
            }
            scene_data.append(s)
            print(f"- [\"{kw}\" -> {scene_duration:.2f}s] {scene_text}")
            
        # 4. Fetch Clips in PARALLEL (all scenes download simultaneously)
        from concurrent.futures import ThreadPoolExecutor, as_completed
        
        def fetch_scene_clip(args):
            i, scene = args
            kw = scene['keyword']
            for attempt in range(3):
                try:
                    encoded_kw = urllib.parse.quote(kw)
                    pexels_url = f"https://api.pexels.com/v1/videos/search?query={encoded_kw}&orientation=portrait&per_page=15"
                    req = urllib.request.Request(pexels_url, headers={
                        'Authorization': os.environ.get("PEXELS_API_KEY", ""),
                        'User-Agent': 'Mozilla/5.0'
                    })
                    # Boosted timeout to 60s for slow SSL handshakes
                    with urllib.request.urlopen(req, timeout=60) as v_res:
                        data = json.loads(v_res.read().decode('utf-8'))
                    
                    if data and data.get("videos"):
                        videos = data["videos"]
                        
                        # Pick a different video file index (based on scene #) so we don't spam the exact same video
                        chosen_video = videos[i % len(videos)]
                        all_files = chosen_video.get("video_files", [])
                        
                        def quality_rank(f):
                            q = f.get("quality", "")
                            return {"sd": 0, "hd": 1, "uhd": 2}.get(q, 3)
                        
                        all_files.sort(key=quality_rank)
                        download_link = all_files[0].get("link") if all_files else None
                        
                        if download_link:
                            out_vid = os.path.join(work_dir, f"vid_{i}.mp4")
                            req_vid = urllib.request.Request(download_link, headers={'User-Agent': 'Mozilla/5.0'})
                            with urllib.request.urlopen(req_vid, timeout=60) as down_res, open(out_vid, 'wb') as out_file:
                                shutil.copyfileobj(down_res, out_file)
                            
                            sz = os.path.getsize(out_vid) // 1024
                            print(f"[DL] ✓ Scene {i}: '{kw}' ({sz}KB, attempt {attempt+1})")
                            return i, out_vid
                    
                    print(f"[DL] Retry {attempt+1} for Scene {i} ('{kw}')...")
                    time.sleep(2 * (attempt + 1)) # Backoff
                except Exception as e:
                    print(f"[DL] Attempt {attempt+1} failed for Scene {i}: {e}")
                    if attempt == 2: return i, None
                    time.sleep(2 * (attempt + 1))
            return i, None
        
        print(f"[DL] Downloading {len(scene_data)} clips with stability (max_workers=2)...")
        with ThreadPoolExecutor(max_workers=2) as pool:
            results = list(pool.map(fetch_scene_clip, enumerate(scene_data)))
        
        # Apply results in order, using fallback for failed downloads
        for i, vid_path in sorted(results):
            if vid_path:
                scene_data[i]['vid'] = vid_path
            else:
                # Fallback to nearest available clip
                for j in range(i-1, -1, -1):
                    if 'vid' in scene_data[j]:
                        scene_data[i]['vid'] = scene_data[j]['vid']
                        break
        
        if not any('vid' in s for s in scene_data):
            raise Exception("Failed to fetch primary root Pexels video stream.")
                        
        # 5. Multi-Step FFmpeg Pipeline (avoids memory crashes from complex filter graphs)
        ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
        output_mp4 = os.path.join(work_dir, "final.mp4")
        
        # Step A: Pre-process each clip individually — run in PARALLEL
        processed_clips = [None] * len(scene_data)
        
        def process_clip(args):
            i, scene = args
            if 'vid' not in scene:
                return i, None
            dur = scene['duration']
            out_clip = os.path.join(work_dir, f"clip_{i}.mp4")
            cmd = [
                ffmpeg_exe, "-y",
                "-i", scene['vid'],
                "-t", f"{dur:.3f}",
                "-vf", "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=25,setsar=1/1",
                "-c:v", "libx264",
                "-preset", "ultrafast",
                "-pix_fmt", "yuv420p",
                "-an",
                out_clip
            ]
            r = subprocess.run(cmd, capture_output=True, text=True)
            if os.path.exists(out_clip) and os.path.getsize(out_clip) > 10000:
                print(f"[ENC] ✓ Clip {i} encoded properly")
                return i, out_clip
            else:
                print(f"[ENC] ✗ Clip {i} failed: {r.stderr[-200:]}")
                return i, None
        
        print(f"[ENC] Encoding {len(scene_data)} clips in parallel...")
        with ThreadPoolExecutor(max_workers=4) as pool:
            enc_results = list(pool.map(process_clip, enumerate(scene_data)))
        
        processed_clips = []
        for i, clip_path in sorted(enc_results):
            if clip_path:
                processed_clips.append(clip_path)
            elif processed_clips:
                processed_clips.append(processed_clips[-1])  # reuse last good clip
            
        # Step B: Concatenate all processed clips using concat demuxer
        concat_list = os.path.join(work_dir, "concat.txt")
        with open(concat_list, "w") as f:
            for clip in processed_clips:
                f.write(f"file '{os.path.basename(clip)}'\n")
                
        raw_video = os.path.join(work_dir, "raw_video.mp4")
        concat_cmd = [
            ffmpeg_exe, "-y",
            "-f", "concat",
            "-safe", "0",
            "-i", concat_list,
            "-c", "copy",
            raw_video
        ]
        r = subprocess.run(concat_cmd, cwd=work_dir, capture_output=True, text=True)
        if r.returncode != 0:
            print(f"Concat failed: {r.stderr[-500:]}")
            raise Exception("FFmpeg concat step failed")
            
        # Step C: Mix audio with the concatenated video
        intermediate_mp4 = os.path.join(work_dir, "intermediate.mp4")
        mix_cmd = [
            ffmpeg_exe, "-y",
            "-i", raw_video,
            "-i", audio_path,
            "-c:v", "copy",
            "-c:a", "aac",
            "-map", "0:v:0",
            "-map", "1:a:0",
            "-shortest",
            intermediate_mp4
        ]
        r = subprocess.run(mix_cmd, capture_output=True, text=True)
        if r.returncode != 0:
            print(f"Audio mix failed: {r.stderr[-500:]}")
            raise Exception("FFmpeg audio mix step failed")
            
        # Steps D+E COMBINED: Fetch logos in parallel with audio mix, then burn subtitles+logos in ONE pass
        COMPANY_MAP = {
            # AI / Tech Companies
            "openai":("openai.com","OpenAI"), "chatgpt":("openai.com","ChatGPT"),
            "hiro":("openai.com","OpenAI•Hiro"), "anthropic":("anthropic.com","Anthropic"),
            "claude":("anthropic.com","Claude"), "google":("google.com","Google"),
            "deepmind":("deepmind.com","DeepMind"), "gemini":("google.com","Gemini"),
            "mistral":("mistral.ai","Mistral"), "meta":("meta.com","Meta AI"),
            "llama":("meta.com","LLaMA"), "perplexity":("perplexity.ai","Perplexity"),
            "microsoft":("microsoft.com","Microsoft"), "apple":("apple.com","Apple"),
            "amazon":("amazon.com","Amazon"), "aws":("amazon.com","AWS"),
            "nvidia":("nvidia.com","NVIDIA"), "intel":("intel.com","Intel"),
            "tesla":("tesla.com","Tesla"), "spacex":("spacex.com","SpaceX"),
            "kepler":("kepler.space","Kepler"), "github":("github.com","GitHub"),
            "samsung":("samsung.com","Samsung"), "ibm":("ibm.com","IBM"),

            # Universities & Research
            "stanford":("stanford.edu","Stanford"), "mit":("mit.edu","MIT"),
            "harvard":("harvard.edu","Harvard"), "oxford":("ox.ac.uk","Oxford"),
            "berkeley":("berkeley.edu","Berkeley"), "research":("nature.com","Research"),
            "science":("science.org","Science"), "report":("reuters.com","Report")
        }

        # Detect tech mentions per scene OR fallback to Generative AI Image for concepts
        logo_events = []
        current_t = 0.0
        seen = set()
        for scene in scene_data:
            scene_lower = scene['text'].lower()
            matched = False
            for kw, (domain, label) in COMPANY_MAP.items():
                if kw in scene_lower and domain not in seen:
                    logo_events.append({'domain': domain, 'label': label,
                                        'start': current_t, 'end': current_t + scene['duration'],
                                        'is_company': True})
                    seen.add(domain)
                    matched = True
                    break
            
            # Fallback: Generate an actual contextual image using free Generative AI Image API!
            if not matched:
                concept_word = scene['keyword'].split()[0] if scene['keyword'] else "Tech"
                domain = f"ai_gen_{concept_word.lower()}"
                if domain not in seen:
                    logo_events.append({'domain': domain, 'label': concept_word.capitalize(),
                                        'start': current_t, 'end': current_t + scene['duration'],
                                        'is_company': False, 'concept': concept_word})
                    seen.add(domain)
            
            current_t += scene['duration']

        # Fetch logos/images in a background thread while audio mix runs
        fetched = []
        def fetch_logos():
            for ev in logo_events:
                safe = ev['domain'].replace('.', '_')
                logo_path = os.path.join(work_dir, f"logo_{safe}.png")
                
                # If fallback -> Fetch actual image using Pollinations AI (free generative image api)
                if not ev.get('is_company'):
                    # Create a prompt for a nice clean graphic representation of the concept
                    c_url = urllib.parse.quote(f"minimalist 3d icon of {ev['concept']}, flat white background, high quality")
                    urls = [f"https://image.pollinations.ai/prompt/{c_url}?width=256&height=256&nologo=true"]
                else:
                    urls = [
                        f"https://www.google.com/s2/favicons?domain={ev['domain']}&sz=256",
                        f"https://logo.clearbit.com/{ev['domain']}?size=200&format=png",
                    ]

                for url in urls:
                    try:
                        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
                        with urllib.request.urlopen(req, timeout=8) as resp:
                            data = resp.read()
                        is_img = (data[:4]==b'\x89PNG' or data[:2]==b'\xff\xd8'
                                  or data[:4]==b'\x00\x00\x01\x00' or data[:3]==b'GIF')
                        if len(data) > 100 and is_img:
                            with open(logo_path, 'wb') as f:
                                f.write(data)
                            ev['file'] = logo_path
                            fetched.append(ev)
                            print(f"[OVERLAY] ✓ {ev['label']} ({len(data)}b)")
                            break
                    except Exception as ex:
                        pass

        import threading
        logo_thread = threading.Thread(target=fetch_logos, daemon=True)
        logo_thread.start()

        # Step C: Mix audio (while logos are fetching in background)
        intermediate_mp4 = os.path.join(work_dir, "intermediate.mp4")
        mix_cmd = [
            ffmpeg_exe, "-y",
            "-i", raw_video, "-i", audio_path,
            "-c:v", "copy", "-c:a", "aac",
            "-map", "0:v:0", "-map", "1:a:0",
            intermediate_mp4
        ]
        r = subprocess.run(mix_cmd, capture_output=True, text=True)
        if r.returncode != 0:
            print(f"Audio mix failed: {r.stderr[-300:]}")
            raise Exception("FFmpeg audio mix step failed")

        # Wait for logo fetch to complete (it started while audio mixed)
        logo_thread.join(timeout=15)
        print(f"[LOGO] {len(fetched)} logo(s) ready")

        # Single combined pass: subtitles + logo overlay
        final_out = os.path.join(work_dir, "final_out.mp4")
        if fetched:
            # Build filter_complex: subtitles on video, then overlay logos
            # [0:v] → pad → subtitles → [vs]; [vs][lg0] → overlay → [lo0]; etc.
            fc = ["[0:v]tpad=stop_mode=clone:stop_duration=5,subtitles=captions.srt:force_style='FontSize=22,PrimaryColour=&H00FFFF&,Bold=1,Alignment=2,MarginV=90,Outline=2'[vs]"]
            prev = "vs"
            combined_cmd = [ffmpeg_exe, "-y", "-i", intermediate_mp4]
            for i, ev in enumerate(fetched):
                combined_cmd.extend(["-i", ev['file']])
                scaled = f"lg{i}"
                out = f"lo{i}"
                fc.append(f"[{i+1}:v]scale=200:200:force_original_aspect_ratio=decrease,pad=220:220:(ow-iw)/2:(oh-ih)/2:color=white[{scaled}]")
                fc.append(f"[{prev}][{scaled}]overlay=x=(W-w)/2:y=(H-h)/3.5:enable='between(t,{ev['start']:.2f},{ev['end']:.2f})'[{out}]")
                prev = out
            combined_cmd += [
                "-filter_complex", ";".join(fc),
                "-map", f"[{prev}]", "-map", "0:a",
                "-c:v", "libx264", "-preset", "ultrafast",
                "-c:a", "copy", "-pix_fmt", "yuv420p", 
                "-shortest", final_out
            ]
            r = subprocess.run(combined_cmd, cwd=work_dir, capture_output=True, text=True)
            if r.returncode == 0:
                final_path = final_out
                print(f"[LOGO] ✓ Subtitles + logo overlays applied in one pass!")
            else:
                print(f"[LOGO] Combined pass failed, trying subtitle-only: {r.stderr[-300:]}")
                # Fallback: subtitle only
                sub_cmd = [ffmpeg_exe, "-y", "-i", intermediate_mp4,
                           "-vf", "tpad=stop_mode=clone:stop_duration=5,subtitles=captions.srt:force_style='FontSize=22,PrimaryColour=&H00FFFF&,Bold=1,Alignment=2,MarginV=90,Outline=2'",
                           "-c:v", "libx264", "-preset", "ultrafast", "-c:a", "copy",
                           "-pix_fmt", "yuv420p", "-shortest", final_out]
                r2 = subprocess.run(sub_cmd, cwd=work_dir, capture_output=True, text=True)
                final_path = final_out if r2.returncode == 0 else intermediate_mp4
        else:
            # No logos — just burn subtitles
            sub_cmd = [ffmpeg_exe, "-y", "-i", intermediate_mp4,
                       "-vf", "tpad=stop_mode=clone:stop_duration=5,subtitles=captions.srt:force_style='FontSize=22,PrimaryColour=&H00FFFF&,Bold=1,Alignment=2,MarginV=90,Outline=2'",
                       "-c:v", "libx264", "-preset", "ultrafast", "-c:a", "copy",
                       "-pix_fmt", "yuv420p", "-shortest", final_out]
            r = subprocess.run(sub_cmd, cwd=work_dir, capture_output=True, text=True)
            final_path = final_out if r.returncode == 0 else intermediate_mp4
        
        with open(final_path, "rb") as f:
            final_b64 = base64.b64encode(f.read()).decode('utf-8')
            
        return final_b64
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise e
    finally:
        # Cleanup
        try:
            shutil.rmtree(work_dir)
        except:
            pass
