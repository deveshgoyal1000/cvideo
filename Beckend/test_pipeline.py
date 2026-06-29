import os
import json
from uuid import uuid4
from models.core import Project
from core.orchestrator import PipelineManager

# Import all engines
from captions.transcriber import TranscriberEngine
from captions.timing_engine import TimingEngine
from captions.chunker_engine import ChunkerEngine
from captions.nlp_engine import NLPEngine
from captions.geometry_engine import GeometryEngine
from captions.layout_engine import LayoutEngine
from captions.template_compiler import TemplateCompiler
from captions.style_resolver import StyleResolver
from captions.effects_engine import EffectsEngine
from captions.animation_engine import AnimationEngine
from rules.rule_engine import RuleEngine

def run_test():
    video_path = "test_pexels.mp4"
    if not os.path.exists(video_path):
        print(f"Test video not found: {video_path}")
        return

    print("Initializing Enterprise Pipeline...")
    
    # Create the PipelineManager and load the engines in sequence
    pipeline = PipelineManager([
        TranscriberEngine(),
        TimingEngine(),
        NLPEngine(),
        ChunkerEngine(),
        GeometryEngine(),
        LayoutEngine(),
        TemplateCompiler(),
        StyleResolver(),
        EffectsEngine(),
        AnimationEngine(),
        RuleEngine()
    ])
    
    # Initialize the Caption Core JSON
    project = Project(
        id=uuid4(),
        video_path=video_path,
        language="en"
    )
    
    print(f"Starting Project State: {project.state}")
    
    # Execute the Pipeline
    project = pipeline.run(project)
    
    print("\n--- Pipeline Execution Complete ---")
    print(f"Final Project State: {project.state}")
    
    # Dump the mutated JSON to verify
    with open("test_project_output.json", "w", encoding="utf-8") as f:
        f.write(project.model_dump_json(indent=2))
        
    print(f"Project JSON saved to test_project_output.json")
    print("\n--- Telemetry Metrics ---")
    for key, value in project.metrics.items():
        if isinstance(value, float):
            print(f"{key}: {value:.3f}s")
        else:
            print(f"{key}: {value}")

if __name__ == "__main__":
    run_test()
