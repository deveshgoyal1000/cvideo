import pytest
import os
from models.core import Project, GlobalStyle
from render.ass_renderer import ASSRenderer
from core.state_machine import ProjectState

def test_ass_header_generation(tmp_path):
    project = Project(video_path="dummy.mp4")
    # Set a highly customized style
    project.global_style = GlobalStyle(
        font_family="Comic Sans MS",
        font_size=100,
        primary_color="#FF0000",
        outline_color="#00FF00",
        back_color="#0000FF",
        bold=1,
        italic=1,
        underline=1,
        strikeout=1,
        outline=10,
        shadow=15,
        spacing=5,
        margin_v=200
    )
    
    # Must be READY to render
    project.state = ProjectState.READY
    
    renderer = ASSRenderer()
    out_file = os.path.join(tmp_path, "test.ass")
    renderer.generate_ass(project, out_file)
    
    assert os.path.exists(out_file)
    
    with open(out_file, "r") as f:
        content = f.read()
        
    # Verify the dynamic properties were correctly injected into the Style line
    # Format: Style: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
    
    assert "Comic Sans MS" in content
    assert "100" in content
    
    # Hex conversion test (ASS uses BGR)
    # Primary: #FF0000 -> &H000000FF
    assert "&H000000FF" in content
    # Outline: #00FF00 -> &H0000FF00
    assert "&H0000FF00" in content
    
    # Check the exact style string mapping
    # ...1,1,1,1,100,100,5,0,1,10,15,2,10,10,200,1
    # bold=1, italic=1, underline=1, strike=1
    # spacing=5, outline=10, shadow=15, margin_v=200
    
    style_line = [line for line in content.split("\n") if line.startswith("Style: DynamicStyle")][0]
    parts = style_line.split(",")
    
    assert parts[1] == "Comic Sans MS"
    assert parts[2] == "100"
    assert parts[7] == "1" # Bold
    assert parts[8] == "1" # Italic
    assert parts[9] == "1" # Underline
    assert parts[10] == "1" # StrikeOut
    assert parts[13] == "5" # Spacing
    assert parts[16] == "10" # Outline
    assert parts[17] == "15" # Shadow
    assert parts[21] == "200" # MarginV
