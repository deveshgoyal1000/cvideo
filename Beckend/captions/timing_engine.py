from core.orchestrator import BaseEngine
from models.core import Project
from core.state_machine import ProjectState

class TimingEngine(BaseEngine):
    def __init__(self, min_duration=0.1, max_gap=0.05):
        self.min_duration = min_duration
        self.max_gap = max_gap

    def process(self, project: Project) -> Project:
        if project.state != ProjectState.TRANSCRIBED:
            return project
            
        if not project.captions:
            project.state = ProjectState.TIMED
            return project
            
        # All words are currently in project.captions[0]
        words = project.captions[0].words
        if not words:
            project.state = ProjectState.TIMED
            return project

        # 1. Extend short words
        for w in words:
            duration = w.end - w.start
            if duration < self.min_duration:
                w.end = w.start + self.min_duration

        # 2. Merge micro gaps
        for i in range(len(words) - 1):
            current_w = words[i]
            next_w = words[i + 1]
            gap = next_w.start - current_w.end
            
            # If next word overlaps due to our extension, push it forward or clip current
            if gap < 0:
                current_w.end = next_w.start
            elif gap > 0 and gap <= self.max_gap:
                # Merge the gap smoothly
                midpoint = current_w.end + (gap / 2)
                current_w.end = midpoint
                next_w.start = midpoint

        project.state = ProjectState.TIMED
        return project
