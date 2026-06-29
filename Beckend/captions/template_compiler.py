from core.orchestrator import BaseEngine
from models.core import Project
from core.state_machine import ProjectState
import json
import os

class TemplateCompiler(BaseEngine):
    def process(self, project: Project) -> Project:
        if project.state != ProjectState.LAYOUT:
            return project
            
        # In a real app, this would load from the templates/ directory and handle inheritance.
        # For scaffolding, we provide a hardcoded modern template mapping.
        modern_template = {
            "font_family": "Arial",
            "font_size": 48,
            "font_weight": 800,
            "color": "&H00FFFFFF",
            "highlight_color": "&H0000FFFF",
            "effects": [
                {"type": "shadow", "params": {"color": "&H80000000", "depth": 2}}
            ],
            "animation": "pop"
        }
        
        # Attach the compiled template into project.render_context or a new field.
        # Since we just need to pass it to StyleResolver, we can store it in custom_props temporarily.
        project.metrics["compiled_template"] = modern_template
        
        project.state = ProjectState.TEMPLATE_COMPILED
        return project
