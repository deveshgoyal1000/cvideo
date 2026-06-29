# AI Captions Studio - Professional Caption Engine (Submagic-Level) Technical Specification

## Objective

Build a production-ready AI Caption Engine comparable to Submagic, Captions.ai, and Kalakar.

This engine is NOT a subtitle generator.

It is a complete Caption Rendering Engine where captions are structured objects that support:

* Word-level timestamps
* Per-word animations
* Dynamic highlighting
* Editable transcript
* Template system
* Brand presets
* Multi-language support
* Future motion tracking
* Future GPU rendering

The implementation must be modular and extensible.

---

# Existing Stack (Must Keep)

Frontend

* Next.js 16 (App Router)
* React 19
* TailwindCSS v4
* Framer Motion
* Lucide React

Backend

* FastAPI
* Python 3.10+
* SQLAlchemy
* SQLite (development)
* PostgreSQL (production)
* FFmpeg
* ffmpeg-python

DO NOT replace the existing backend.

Integrate the Caption Engine into the existing FastAPI application.

---

# Core Design Principle

The engine must NEVER use .ass subtitles as the source of truth.

Instead:

Video

↓

Speech Recognition

↓

Caption JSON

↓

AI Enhancement

↓

Chunking

↓

Template Engine

↓

Animation Engine

↓

Renderer

↓

ASS (temporary renderer)

↓

FFmpeg

↓

Final MP4

ASS files are ONLY render artifacts.

The source of truth is Project JSON.

---

# Required Architecture

backend/
api/
captions/
```
transcriber.py
chunker.py
parser.py
renderer.py
template_engine.py
animation_engine.py
ass_renderer.py
validator.py
```
ai/
```
transcript_cleanup.py
keyword_detection.py
emoji_suggester.py
translation.py
```
models/
workers/
storage/
database/
ffmpeg/
utils/

---

# Pipeline

Upload Video
↓
Extract Audio
↓
Speech Recognition
↓
Word Timestamp JSON
↓
Transcript Cleanup
↓
Keyword Detection
↓
Emoji Detection
↓
Caption Chunking
↓
Template Application
↓
Animation Assignment
↓
Caption Validation
↓
Renderer
↓
Export

Each stage must be independent.

No stage should depend directly on FFmpeg.

---

# Caption Data Model

Every caption must be stored as JSON.

Never store subtitles as plain text.

Example:

```json
{
  "project": {
    "id": "uuid",
    "video": "video.mp4",
    "fps": 30,
    "aspectRatio": "9:16",
    "language": "en",
    "captions": [
      {
        "id": "caption_1",
        "start": 0.0,
        "end": 3.2,
        "layout": "bottom",
        "template": "modern",
        "speaker": "speaker1",
        "words": [
          {
            "id": "word_1",
            "text": "Hello",
            "normalized": "hello",
            "start": 0.10,
            "end": 0.40,
            "confidence": 0.99,
            "highlight": true,
            "emoji": "👋",
            "animation": "pop",
            "color": "#FFD400",
            "effects": [
              "shadow",
              "stroke"
            ]
          }
        ]
      }
    ]
  }
}
```

Everything edits this JSON.

Nothing edits ASS.

---

# Speech Recognition

Use Faster Whisper.

Return:

* word timestamps
* confidence
* language
* speaker placeholder
* sentence timestamps

Do not discard confidence.

---

# Transcript Cleanup

Create independent AI modules.

Modules:

Transcript Cleanup
Capitalization
Punctuation
Sentence detection
Filler removal
Keyword detection
Emoji suggestion
Translation
Emotion detection

Each module returns JSON.

No module modifies timestamps.

---

# Caption Chunking Engine

Rules:

Maximum 2 lines.

Maximum 5 words per line.

Break on punctuation.

Break on pauses.

Break on speaker changes.

Optimize reading speed.

Avoid orphan words.

Keep noun phrases together.

Output:

Caption objects.

---

# Template Engine

Create a JSON-driven template system.

Example:

templates/
modern.json
hormozi.json
podcast.json
gaming.json
minimal.json

Each template contains:

Font
Weight
Stroke
Shadow
Highlight
Background
Animation
Padding
Margins
Alignment
Position
Safe area

Users must be able to create custom templates without changing backend code.

---

# Animation Engine

Animations must NOT be hardcoded.

Create reusable animation primitives.

animations/
pop.py
bounce.py
zoom.py
slide.py
fade.py
shake.py
rotate.py
glow.py
pulse.py

Each animation returns keyframes.

Example:

Scale
Opacity
Rotation
Position
Duration
Delay

Renderer consumes these keyframes.

---

# Rendering

Create a renderer interface.

Renderer Base
↓
ASS Renderer
↓
Future Remotion Renderer
↓
Future GPU Renderer

Never tie business logic to ASS.

ASS renderer is temporary.

---

# Project Model

Database tables:

Project
Video
Caption JSON
Template
Export
History
Undo/Redo
Render Job

---

# Queue System

Use Celery + Redis.

Jobs:

Upload
↓
Transcribe
↓
Cleanup
↓
Chunk
↓
Render
↓
Export
↓
Cleanup

Never render synchronously.

---

# API Endpoints

POST /projects
POST /projects/upload
POST /projects/transcribe
GET /projects/{id}
PUT /projects/{id}/captions
PUT /projects/{id}/template
PUT /projects/{id}/animation
POST /projects/{id}/render
GET /jobs/{id}
GET /exports/{id}

---

# Future Features

Architecture must support:

Motion Tracking
Face Detection
Object Tracking
Speaker Detection
Auto Zoom
AI Hooks
AI Titles
Auto B-Roll
Brand Kit
Version History
Plugin Templates
Plugin Animations
GPU Rendering
Real-Time Preview
Multi-user Collaboration

---

# Performance Goals

1-minute video:

Transcription <15 seconds
Caption generation <2 seconds
ASS generation <1 second
Rendering <30 seconds

Memory efficient.
Support 4K.
Support long-form videos.
Support thousands of concurrent jobs using queues.

---

# Coding Requirements

* Use SOLID principles.
* Use dependency injection where appropriate.
* Strong typing with Pydantic models.
* Separate business logic from rendering logic.
* Unit tests for each engine.
* Modular architecture with no circular dependencies.
* Design for future replacement of the renderer without rewriting the caption engine.

The final implementation should resemble a professional AI video editing backend rather than a simple subtitle generator.
