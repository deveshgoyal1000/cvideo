from core.orchestrator import BaseEngine
from models.core import Project
from core.state_machine import ProjectState

class StyleResolver(BaseEngine):
    def process(self, project: Project) -> Project:
        if project.state != ProjectState.TEMPLATE_COMPILED:
            return project
            
        template = project.metrics.get("compiled_template", {})
        
        for caption in project.captions:
            for word in caption.words:
                word.style.font_family = template.get("font_family", "Arial")
                word.style.font_size = template.get("font_size", 48)
                word.style.font_weight = template.get("font_weight", 400)
                
                # Apply highlight color if the word is marked by NLPEngine
                if word.highlight:
                    word.style.color = template.get("highlight_color", "&H000000FF")
                else:
                    word.style.color = template.get("color", "&H00FFFFFF")
                    
        project.state = ProjectState.STYLED
        return project
