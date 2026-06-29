from models.core import Project, RenderContext

def build_render_context(project: Project) -> RenderContext:
    """
    Finalizes the context just before rendering.
    In a full app, this might pull video metadata from FFprobe to set the exact resolution/fps.
    """
    # Use defaults for now
    context = project.render_context
    return context
