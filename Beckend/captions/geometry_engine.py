from core.orchestrator import BaseEngine
from models.core import Project, GeometryBox
from core.state_machine import ProjectState
from fonts.font_manager import font_manager

class GeometryEngine(BaseEngine):
    def process(self, project: Project) -> Project:
        if project.state != ProjectState.CHUNKED:
            return project
            
        # For geometry calculation, we need basic style info.
        # If styles haven't been resolved yet, we use a default metric.
        default_font_size = 48
        default_font_family = "Arial"
        
        for caption in project.captions:
            caption_width = 0.0
            caption_height = 0.0
            
            for word in caption.words:
                size = word.style.font_size or default_font_size
                family = word.style.font_family or default_font_family
                
                metrics = font_manager.measure_text(word.text, family, size)
                word.bounding_box = GeometryBox(
                    width=metrics["width"],
                    height=metrics["height"]
                )
                
                # Very rough initial estimation for caption bounding box
                caption_width += metrics["width"] + (size * 0.2) # space width
                caption_height = max(caption_height, metrics["height"])
                
            caption.bounding_box = GeometryBox(
                width=caption_width,
                height=caption_height
            )
            
        project.state = ProjectState.GEOMETRY
        return project
