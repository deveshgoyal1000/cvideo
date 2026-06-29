from abc import ABC, abstractmethod
from typing import List
from models.core import Project
import time

class BaseEngine(ABC):
    """
    Interface for all pipeline engines.
    """
    @abstractmethod
    def process(self, project: Project) -> Project:
        pass

class PipelineManager:
    """
    Orchestrates the sequential execution of engines on the Project.
    """
    def __init__(self, engines: List[BaseEngine] = None):
        self.engines = engines or []
        
    def add_engine(self, engine: BaseEngine):
        self.engines.append(engine)
        
    def run(self, project: Project) -> Project:
        for engine in self.engines:
            engine_name = engine.__class__.__name__
            start_time = time.time()
            
            # Optionally check cache here (to be implemented)
            project = engine.process(project)
            
            elapsed = time.time() - start_time
            # Telemetry tracking
            project.metrics[engine_name] = elapsed
            print(f"[{engine_name}] completed in {elapsed:.3f}s. State: {project.state}")
            
        return project
