import os
import subprocess
from faster_whisper import WhisperModel
from core.orchestrator import BaseEngine
from models.core import Project, Caption, Word
from core.state_machine import ProjectState
import uuid

class TranscriberEngine(BaseEngine):
    def __init__(self, model_size="base"):
        try:
            self.model = WhisperModel(model_size, device="cuda", compute_type="float16")
        except Exception:
            self.model = WhisperModel(model_size, device="cpu", compute_type="int8")

    def process(self, project: Project) -> Project:
        if project.state != ProjectState.NEW:
            return project # Only run if new
            
        audio_path = project.video_path + ".wav"
        try:
            import imageio_ffmpeg
            ffmpeg_path = imageio_ffmpeg.get_ffmpeg_exe()
            
            command = [
                ffmpeg_path, "-y", "-i", project.video_path, "-vn",
                "-acodec", "pcm_s16le", "-ar", "16000", "-ac", "1", audio_path
            ]
            subprocess.run(command, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            
            segments, info = self.model.transcribe(audio_path, word_timestamps=True, language=project.language)
            
            all_words = []
            for segment in segments:
                for word in segment.words:
                    w = Word(
                        text=word.word.strip(),
                        normalized=word.word.strip().lower(),
                        start=round(word.start, 3),
                        end=round(word.end, 3),
                        confidence=word.probability
                    )
                    all_words.append(w)
            
            # Put all words into a single initial caption block for the chunker to process
            initial_caption = Caption(
                start=all_words[0].start if all_words else 0.0,
                end=all_words[-1].end if all_words else 0.0,
                words=all_words
            )
            
            project.captions = [initial_caption]
            project.state = ProjectState.TRANSCRIBED
            
        finally:
            if os.path.exists(audio_path):
                os.remove(audio_path)
                
        return project
