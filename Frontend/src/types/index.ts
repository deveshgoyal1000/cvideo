export interface ProjectData {
    id: string;
    video_path: string;
    state: string;
    language: string;
    template_id: string;
    global_style: GlobalStyle;
    captions: CaptionBlock[];
    render_context: RenderContext;
    metrics?: any;
}

export interface GlobalStyle {
    font_family: string;
    font_size: number;
    primary_color: string;
    outline_color: string;
    back_color: string;
    bold?: number;
    italic?: number;
    underline?: number;
    strikeout?: number;
    scale_x?: number;
    scale_y?: number;
    spacing?: number;
    angle?: number;
    border_style?: number;
    outline?: number;
    shadow?: number;
    alignment: number;
    margin_v: number;
    margin_l: number;
    margin_r: number;
}

export interface CaptionBlock {
    id: string;
    start: number;
    end: number;
    words: Word[];
    speaker?: string;
}

export interface Word {
    id: string;
    text: string;
    start: number;
    end: number;
    highlight: boolean;
    emoji?: string;
    style?: any;
    animations?: any[];
}

export interface RenderContext {
    fps: number;
    resolution_x: number;
    resolution_y: number;
    aspect_ratio: string;
    safe_zone_margin: number;
    preview_mode: boolean;
    quality: string;
}
