class RendererCapabilities:
    """
    Defines what a specific renderer can support.
    Used by the StyleResolver and RuleEngine to gracefully degrade unsupported effects.
    """
    def __init__(self, 
                 supports_shadow=True, 
                 supports_blur=False, 
                 supports_stroke=True, 
                 supports_motion_tracking=False):
        self.supports_shadow = supports_shadow
        self.supports_blur = supports_blur
        self.supports_stroke = supports_stroke
        self.supports_motion_tracking = supports_motion_tracking

# The ASS format renderer capabilities
ASS_CAPABILITIES = RendererCapabilities(
    supports_shadow=True,
    supports_blur=True,
    supports_stroke=True,
    supports_motion_tracking=False
)
