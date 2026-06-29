import os
import json
from google import genai
from core.orchestrator import BaseEngine
from models.core import Project
from core.state_machine import ProjectState

class NLPEngine(BaseEngine):
    def process(self, project: Project) -> Project:
        if project.state != ProjectState.TIMED:
            return project
            
        api_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("NEXT_PUBLIC_GEMINI_API_KEY")
        if not api_key:
            print("[NLPEngine] No Gemini API key found, skipping enhancement.")
            return project
            
        if not project.captions or not project.captions[0].words:
            return project
            
        all_words = project.captions[0].words
        transcript_text = " ".join([w.text for w in all_words])
        
        client = genai.Client(api_key=api_key)
        prompt = f"""
        Analyze the following transcript. Identify 3 to 5 important keywords that should be highlighted.
        Also, suggest a single relevant emoji to be appended at the end of some sentences.
        Return a JSON object exactly in this format without markdown formatting:
        {{
          "highlights": ["word1", "word2"],
          "emojis": {{"word_before_emoji": "🔥"}}
        }}
        Transcript: {transcript_text}
        """
        try:
            response = client.models.generate_content(
                model='gemini-2.5-flash',
                contents=prompt
            )
            result = json.loads(response.text.replace('```json', '').replace('```', '').strip())
            highlights = [h.lower().strip() for h in result.get("highlights", [])]
            emojis_map = {k.lower().strip(): v for k, v in result.get("emojis", {}).items()}
            
            for w in all_words:
                clean_word = w.normalized.strip(',.!?')
                if clean_word in highlights:
                    w.highlight = True
                if clean_word in emojis_map:
                    w.emoji = emojis_map[clean_word]
                    
        except Exception as e:
            print(f"[NLPEngine] Failed to enhance transcript: {e}")
            
        return project
