import os
from models.core import Project
from core.state_machine import ProjectState

class ASSRenderer:
    def __init__(self, capabilities=None):
        from render.capabilities import ASS_CAPABILITIES
        self.capabilities = capabilities or ASS_CAPABILITIES
        
    def _hex_to_ass(self, hex_str: str) -> str:
        hex_str = hex_str.lstrip('#')
        if len(hex_str) == 6:
            r, g, b = hex_str[0:2], hex_str[2:4], hex_str[4:6]
            return f"&H00{b}{g}{r}"
        return "&H00FFFFFF"
        
    def generate_ass(self, project: Project, output_path: str):
        if project.state != ProjectState.READY:
            raise ValueError(f"Project not in READY state, cannot render. Current state: {project.state}")
            
        style = project.global_style
        primary = self._hex_to_ass(style.primary_color)
        outline = self._hex_to_ass(style.outline_color)
        back = self._hex_to_ass(style.back_color)
            
        header = f"""[Script Info]
ScriptType: v4.00+
PlayResX: {project.render_context.resolution_x}
PlayResY: {project.render_context.resolution_y}
WrapStyle: 1

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: DynamicStyle,{style.font_family},{style.font_size},{primary},&H000000FF,{outline},{back},1,0,0,0,100,100,0,0,1,3,2,{style.alignment},{style.margin_l},{style.margin_r},{style.margin_v},1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
        with open(output_path, "w", encoding="utf-8") as f:
            f.write(header)
            
            for caption in project.captions:
                start_hms = self._format_time(caption.start)
                end_hms = self._format_time(caption.end)
                
                # Convert our structured words back to ASS tags
                text_line = ""
                for word in caption.words:
                    duration_cs = max(1, int((word.end - word.start) * 100))
                    
                    # Apply animations via ASS tags (e.g. Karaoke \k, transform \t)
                    anim_tags = ""
                    if any(a.property == "scale" for a in word.animations):
                        # Simple representation of a pop animation
                        anim_tags = r"{\fscx150\fscy150\t(0,100,\fscx100\fscy100)}"
                        
                    color_tag = f"{{\\c{word.style.color}}}" if word.style.color else ""
                    
                    # Add emoji if present
                    emoji_str = f" {word.emoji}" if word.emoji else ""
                    
                    text_line += f"{{\\k{duration_cs}}}{color_tag}{anim_tags}{word.text}{emoji_str} "
                    
                line = f"Dialogue: 0,{start_hms},{end_hms},DynamicStyle,,0,0,0,,{text_line.strip()}\n"
                f.write(line)
                
        project.state = ProjectState.RENDERING
        return output_path
        
    def _format_time(self, seconds: float) -> str:
        h = int(seconds // 3600)
        m = int((seconds % 3600) // 60)
        s = seconds % 60
        return f"{h}:{m:02d}:{s:05.2f}"
