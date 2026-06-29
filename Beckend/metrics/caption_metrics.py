import logging

# Basic telemetry logger
logger = logging.getLogger("CaptionMetrics")
logger.setLevel(logging.INFO)
handler = logging.FileHandler("metrics.log")
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler.setFormatter(formatter)
logger.addHandler(handler)

def log_pipeline_metrics(project):
    """Logs total processing times and caption stats."""
    total_time = sum([v for k, v in project.metrics.items() if isinstance(v, float)])
    num_words = sum([len(c.words) for c in project.captions])
    
    logger.info(f"Project {project.id} | Total Time: {total_time:.3f}s | Words: {num_words}")
