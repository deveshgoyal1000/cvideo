from core.orchestrator import BaseEngine
from models.core import Project, Effect
from core.state_machine import ProjectState

class EffectsEngine(BaseEngine):
    def process(self, project: Project) -> Project:
        if project.state != ProjectState.STYLED:
            return project
            
        template = project.metrics.get("compiled_template", {})
        effects_data = template.get("effects", [])
        
        for caption in project.captions:
            for word in caption.words:
                for ed in effects_data:
                    effect = Effect(
                        type=ed.get("type"),
                        params=ed.get("params", {})
                    )
                    word.effects.append(effect)
                    
        project.state = ProjectState.EFFECTS
        return project
