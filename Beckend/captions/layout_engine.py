from core.orchestrator import BaseEngine
from models.core import Project
from core.state_machine import ProjectState

class LayoutEngine(BaseEngine):
    def process(self, project: Project) -> Project:
        if project.state != ProjectState.GEOMETRY:
            return project
            
        context = project.render_context
        safe_margin = context.safe_zone_margin
        
        # Bottom-center layout default
        center_x = context.resolution_x / 2
        bottom_y = context.resolution_y - safe_margin
        
        for caption in project.captions:
            # We assume words have geometry boxes. We need to set their absolute X, Y.
            # Multi-line wrapping logic would go here. For now, simple centering.
            total_width = caption.bounding_box.width
            
            # Start X for the whole caption
            start_x = center_x - (total_width / 2)
            
            current_x = start_x
            caption_y = bottom_y - caption.bounding_box.height
            
            for word in caption.words:
                word.bounding_box.x = current_x
                word.bounding_box.y = caption_y
                
                # Advance X for next word
                space_width = (word.style.font_size or 48) * 0.2
                current_x += word.bounding_box.width + space_width
                
            caption.bounding_box.x = start_x
            caption.bounding_box.y = caption_y
            
        project.state = ProjectState.LAYOUT
        return project
