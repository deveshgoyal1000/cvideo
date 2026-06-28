import os
import subprocess
import pandas as pd
from faster_whisper import WhisperModel
import json

def get_whisper_model():
    try:
        return WhisperModel("base", device="cuda", compute_type="float16")
    except Exception:
        return WhisperModel("base", device="cpu", compute_type="int8")

model = None

def transcribe_video(video_path: str):
    global model
    if model is None:
        model = get_whisper_model()
        
    audio_path = video_path + ".wav"
    try:
        command = [
            "ffmpeg", "-y", "-i", video_path, "-vn",
            "-acodec", "pcm_s16le", "-ar", "16000", "-ac", "1", audio_path
        ]
        subprocess.run(command, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        
        segments, info = model.transcribe(audio_path, word_timestamps=True)
        
        words_data = []
        for segment in segments:
            for word in segment.words:
                words_data.append({
                    "Word": word.word.strip(),
                    "Start (s)": round(word.start, 2),
                    "End (s)": round(word.end, 2)
                })
        return words_data
    finally:
        if os.path.exists(audio_path):
            os.remove(audio_path)

STYLES = {
    "Neon Highlight": {
        "font_family": "Arial", "font_size": 24, "primary": "&H0000FF00", "secondary": "&H00FFFFFF",
        "outline": "&H00000000", "outline_w": 2, "back": "&H80000000"
    },
    "Pop Scale": {
        "font_family": "Impact", "font_size": 28, "primary": "&H00FFFFFF", "secondary": "&H0000FFFF",
        "outline": "&H00000000", "outline_w": 3, "back": "&H00000000"
    },
    "Minimal Clean": {
        "font_family": "Helvetica", "font_size": 20, "primary": "&H00FFFFFF", "secondary": "&H00AAAAAA",
        "outline": "&H00000000", "outline_w": 1, "back": "&H80000000"
    }
}

def generate_ass(words_data, style_name: str, output_path: str):
    style = STYLES.get(style_name, STYLES["Neon Highlight"])
    
    header = f"""[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,{style["font_family"]},{style["font_size"]},{style["primary"]},{style["secondary"]},{style["outline"]},{style["back"]},0,0,0,0,100,100,0,0,1,{style["outline_w"]},0,2,10,10,40,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
    events = []
    
    def format_time(seconds: float) -> str:
        h = int(seconds // 3600)
        m = int((seconds % 3600) // 60)
        s = int(seconds % 60)
        cs = int((seconds - int(seconds)) * 100)
        return f"{h}:{m:02d}:{s:02d}.{cs:02d}"

    words_per_line = 5
    for i in range(0, len(words_data), words_per_line):
        line_words = words_data[i:i+words_per_line]
        if not line_words:
            continue
            
        line_start = format_time(float(line_words[0]["Start (s)"]))
        line_end = format_time(float(line_words[-1]["End (s)"]))
        
        text_parts = []
        for w in line_words:
            duration_cs = int((float(w["End (s)"]) - float(w["Start (s)"])) * 100)
            word_text = str(w["Word"]).strip()
            if not word_text: continue
            text_parts.append(f"{{\\k{duration_cs}}}{word_text}")
                
        text = " ".join(text_parts)
        events.append(f"Dialogue: 0,{line_start},{line_end},Default,,0,0,0,,{text}")

    with open(output_path, "w", encoding="utf-8") as f:
        f.write(header)
        f.write("\n".join(events))
        f.write("\n")

def render_captions(video_path: str, words_data: list, style_name: str, output_path: str) -> str:
    ass_path = output_path + ".ass"
    
    generate_ass(words_data, style_name, ass_path)
    
    ass_path_escaped = ass_path.replace('\\', '/')
    if len(ass_path_escaped) > 1 and ass_path_escaped[1] == ':':
        ass_path_escaped = ass_path_escaped[0] + '\\:' + ass_path_escaped[2:]

    command = [
        "ffmpeg", "-y", "-i", video_path,
        "-vf", f"ass='{ass_path_escaped}'",
        "-c:v", "libx264", "-preset", "veryfast", "-crf", "23",
        "-c:a", "copy", output_path
    ]
    subprocess.run(command, check=True)
    return output_path
