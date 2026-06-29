from core.orchestrator import BaseEngine
from models.core import Project
from core.state_machine import ProjectState

class RuleEngine(BaseEngine):
    def process(self, project: Project) -> Project:
        if project.state != ProjectState.ANIMATED:
            return project
            
        warnings = []
        errors = []
        
        for caption in project.captions:
            # Rule 1: Check safe zones
            if caption.bounding_box.y < 0:
                warnings.append(f"Caption {caption.id} exceeds upper safe zone.")
            
            # Rule 2: Reading speed
            duration = caption.end - caption.start
            if duration > 0:
                wps = len(caption.words) / duration
                if wps > 4.0: # more than 4 words per second is too fast
                    warnings.append(f"Caption {caption.id} reading speed too high ({wps:.1f} wps).")
        
        project.metrics["validation_warnings"] = warnings
        project.metrics["validation_errors"] = errors
        
        if errors:
            project.state = ProjectState.FAILED
        else:
            project.state = ProjectState.READY
            
        return project
