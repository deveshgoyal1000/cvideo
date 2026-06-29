from core.orchestrator import BaseEngine
from models.core import Project, Keyframe
from core.state_machine import ProjectState

class AnimationEngine(BaseEngine):
    def process(self, project: Project) -> Project:
        if project.state != ProjectState.EFFECTS:
            return project
            
        template = project.metrics.get("compiled_template", {})
        anim_type = template.get("animation", "pop")
        
        for caption in project.captions:
            for word in caption.words:
                # Example Pop Animation mapping
                if anim_type == "pop" and word.highlight:
                    # Pop scale effect
                    kf = Keyframe(
                        property="scale",
                        value=1.5,
                        time_offset=0.0
                    )
                    kf2 = Keyframe(
                        property="scale",
                        value=1.0,
                        time_offset=0.1
                    )
                    word.animations.extend([kf, kf2])
                    
        project.state = ProjectState.ANIMATED
        return project
