from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from uuid import UUID, uuid4

class GeometryBox(BaseModel):
    x: float = 0.0
    y: float = 0.0
    width: float = 0.0
    height: float = 0.0

class Style(BaseModel):
    font_family: Optional[str] = None
    font_weight: Optional[int] = None
    color: Optional[str] = None
    font_size: Optional[int] = None
    custom_props: Dict[str, Any] = Field(default_factory=dict)

class Keyframe(BaseModel):
    property: str
    value: float
    time_offset: float

class Effect(BaseModel):
    type: str
    params: Dict[str, Any] = Field(default_factory=dict)

class Word(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    text: str
    normalized: str
    start: float
    end: float
    confidence: float = 1.0
    highlight: bool = False
    emoji: Optional[str] = None
    style: Style = Field(default_factory=Style)
    animations: List[Keyframe] = Field(default_factory=list)
    effects: List[Effect] = Field(default_factory=list)
    bounding_box: GeometryBox = Field(default_factory=GeometryBox)

class Caption(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    start: float
    end: float
    speaker: str = "speaker_0"
    layout_type: str = "bottom"
    words: List[Word] = Field(default_factory=list)
    bounding_box: GeometryBox = Field(default_factory=GeometryBox)

class RenderContext(BaseModel):
    fps: float = 30.0
    resolution_x: int = 1080
    resolution_y: int = 1920
    aspect_ratio: str = "9:16"
    safe_zone_margin: int = 100
    preview_mode: bool = False
    quality: str = "high"

class GlobalStyle(BaseModel):
    font_family: str = "Arial"
    font_size: int = 48
    primary_color: str = "#FFFFFF"
    outline_color: str = "#000000"
    back_color: str = "#000000"
    alignment: int = 2
    margin_v: int = 150
    margin_l: int = 10
    margin_r: int = 10

class Project(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    video_path: str
    state: str = "NEW"
    language: str = "en"
    template_id: str = "modern"
    global_style: GlobalStyle = Field(default_factory=GlobalStyle)
    captions: List[Caption] = Field(default_factory=list)
    render_context: RenderContext = Field(default_factory=RenderContext)
    metrics: Dict[str, Any] = Field(default_factory=dict)

