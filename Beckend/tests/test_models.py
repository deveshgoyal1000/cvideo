import pytest
from models.core import GlobalStyle, Project, Caption, Word

def test_global_style_defaults():
    style = GlobalStyle()
    assert style.font_family == "Arial"
    assert style.font_size == 48
    assert style.primary_color == "#FFFFFF"
    assert style.outline_color == "#000000"
    assert style.back_color == "#000000"
    assert style.bold == 1
    assert style.italic == 0
    assert style.outline == 3
    assert style.shadow == 2
    assert style.margin_v == 150

def test_global_style_custom():
    style = GlobalStyle(
        font_family="Impact",
        bold=1,
        spacing=10,
        margin_v=50
    )
    assert style.font_family == "Impact"
    assert style.bold == 1
    assert style.spacing == 10
    assert style.margin_v == 50

def test_project_initialization():
    project = Project(
        video_path="video.mp4"
    )
    assert project.id is not None
    assert project.global_style is not None
    assert project.captions == []
