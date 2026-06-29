from core.orchestrator import BaseEngine
from models.core import Project, Caption
from core.state_machine import ProjectState

class ChunkerEngine(BaseEngine):
    def __init__(self, max_words=5, max_lines=2):
        self.max_words = max_words
        self.max_lines = max_lines
        self.punctuation_marks = ['.', '?', '!', ',', ';', ':']

    def process(self, project: Project) -> Project:
        if project.state != ProjectState.TIMED:
            return project
            
        if not project.captions or not project.captions[0].words:
            project.state = ProjectState.CHUNKED
            return project
            
        all_words = project.captions[0].words
        new_captions = []
        
        current_words = []
        
        def push_caption():
            nonlocal current_words
            if current_words:
                c = Caption(
                    start=current_words[0].start,
                    end=current_words[-1].end,
                    words=list(current_words)
                )
                new_captions.append(c)
                current_words.clear()

        for word in all_words:
            current_words.append(word)
            
            # Break conditions
            has_punctuation = any(p in word.text for p in self.punctuation_marks)
            is_max_length = len(current_words) >= (self.max_words * self.max_lines)
            
            if has_punctuation or is_max_length:
                push_caption()
                
        # Push any remaining words
        push_caption()

        project.captions = new_captions
        project.state = ProjectState.CHUNKED
        return project
