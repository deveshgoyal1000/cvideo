import { useRef, ChangeEvent, useState, useEffect } from "react";
import { Upload, Loader2, Download } from "lucide-react";
import { useProjectStore } from "../../stores/useProjectStore";

export default function CenterCanvas() {
    const { videoUrl, finalVideoUrl, loading, rendering, loadingStatus, projectData, currentTime, isPlaying, setVideoUrl, setLoading, setProjectData, setFinalVideoUrl, setCurrentTime, setDuration, setIsPlaying } = useProjectStore();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [containerHeight, setContainerHeight] = useState<number>(0);

    // Sync global playback commands from Timeline or Keyboard Shortcuts
    useEffect(() => {
        if (!videoRef.current) return;
        if (isPlaying && videoRef.current.paused) {
            videoRef.current.play().catch(e => console.error(e));
        } else if (!isPlaying && !videoRef.current.paused) {
            videoRef.current.pause();
        }
    }, [isPlaying]);

    // Sync global seek commands
    useEffect(() => {
        if (!videoRef.current) return;
        // Only update video if the difference is substantial to avoid loop
        if (Math.abs(videoRef.current.currentTime - currentTime) > 0.1) {
            videoRef.current.currentTime = currentTime;
        }
    }, [currentTime]);

    const pollTranscription = async (jobId: string) => {
        setLoading(true, "Processing AI Pipeline...");
        const interval = setInterval(async () => {
            try {
                const res = await fetch(`http://localhost:8000/api/captions/v3/status/${jobId}`);
                const data = await res.json();
                
                if (data.status === "completed") {
                    clearInterval(interval);
                    setProjectData(data.project_data[0]); 
                    setLoading(false, "");
                } else if (data.status === "failed") {
                    clearInterval(interval);
                    alert("Transcription failed: " + data.error);
                    setLoading(false, "");
                }
            } catch (err) {
                console.error("Polling error:", err);
            }
        }, 2000);
    };

    const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return;
        const uploadedFile = e.target.files[0];
        
        setVideoUrl(URL.createObjectURL(uploadedFile));
        
        const formData = new FormData();
        formData.append("file", uploadedFile);

        setLoading(true, "Uploading & Initializing...");
        setFinalVideoUrl(""); 
        setProjectData(null);
        
        try {
            const res = await fetch("http://localhost:8000/api/captions/v3/transcribe", {
                method: "POST",
                body: formData,
            });
            const data = await res.json();
            if (data.status === "success") {
                pollTranscription(data.job_id);
            } else {
                alert("Transcription failed: " + data.detail);
                setLoading(false, "");
            }
        } catch (error) {
            console.error(error);
            alert("Transcription error.");
            setLoading(false, "");
        }
    };

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            setCurrentTime(videoRef.current.currentTime);
        }
    };

    // Calculate active caption block
    let activeCaption = null;
    if (projectData && projectData.captions) {
        activeCaption = projectData.captions.find(
            (cap: any) => currentTime >= cap.start && currentTime <= cap.end
        );
    }

    // Map backend global styles to CSS
    const getOverlayStyle = (): React.CSSProperties => {
        if (!projectData?.global_style) return {};
        const gs = projectData.global_style;
        
        const isMiddle = gs.alignment === 5;
        const isTop = gs.alignment === 8;
        
        // Use ResizeObserver height for bulletproof scaling. If not measured yet, fallback to a safe guess.
        const ch = containerHeight || 800; 
        
        // Calculate the actual rendered bounding box of the video to match FFmpeg exactly!
        // We must know if the video is letterboxed (black bars top/bottom) or pillarboxed (black bars sides).
        const vw = videoRef.current?.videoWidth || 1080;
        const vh = videoRef.current?.videoHeight || 1920;
        const videoRatio = vw / vh;
        
        const cw = containerRef.current?.clientWidth || 400;
        const containerRatio = cw / ch;

        let renderedWidth, renderedHeight, topOffset, leftOffset;

        if (videoRatio > containerRatio) {
            // Video is wider than container (letterboxed with black bars top/bottom)
            renderedWidth = cw;
            renderedHeight = cw / videoRatio;
            topOffset = (ch - renderedHeight) / 2;
            leftOffset = 0;
        } else {
            // Video is taller than container (pillarboxed with black bars sides)
            renderedHeight = ch;
            renderedWidth = ch * videoRatio;
            topOffset = 0;
            leftOffset = (cw - renderedWidth) / 2;
        }

        // Now we scale relative to the actual rendered video height, exactly like FFmpeg does with PlayResY!
        const toPx = (val: number) => `${(val / 1920) * renderedHeight}px`;
        
        // CSS text-shadow for outline and drop shadow
        let textShadow = "";
        if (gs.outline && gs.outline > 0) {
            const oc = gs.outline_color || "#000000";
            const w = gs.outline;
            textShadow += `${toPx(w)} ${toPx(w)} 0 ${oc}, -${toPx(w)} -${toPx(w)} 0 ${oc}, ${toPx(w)} -${toPx(w)} 0 ${oc}, -${toPx(w)} ${toPx(w)} 0 ${oc}, 0 ${toPx(w)} 0 ${oc}, 0 -${toPx(w)} 0 ${oc}, ${toPx(w)} 0 0 ${oc}, -${toPx(w)} 0 0 ${oc}`;
        }
        if (gs.shadow && gs.shadow > 0) {
            const sc = "rgba(0,0,0,0.8)";
            const sw = (gs.shadow * 3) + (gs.outline || 0); // amplify shadow distance slightly
            const blur = gs.shadow * 2;
            textShadow += textShadow ? `, ${toPx(sw)} ${toPx(sw)} ${toPx(blur)} ${sc}` : `${toPx(sw)} ${toPx(sw)} ${toPx(blur)} ${sc}`;
        }

        return {
            position: "absolute",
            left: `${leftOffset + renderedWidth / 2}px`,
            transform: "translateX(-50%)",
            top: isTop ? `calc(${topOffset}px + ${toPx(gs.margin_v || 0)})` : isMiddle ? `${topOffset + renderedHeight / 2}px` : "auto",
            bottom: (!isTop && !isMiddle) ? `calc(${ch - (topOffset + renderedHeight)}px + ${toPx(gs.margin_v || 150)})` : "auto",
            transformOrigin: "center center",
            translate: isMiddle ? "-50% -50%" : "none",
            fontFamily: `"${gs.font_family || 'Arial'}", sans-serif`,
            fontSize: toPx(gs.font_size || 120),
            color: gs.primary_color || "#ffffff",
            textAlign: "center",
            fontWeight: gs.bold ? "bold" : "normal",
            fontStyle: gs.italic ? "italic" : "normal",
            textDecoration: gs.underline ? "underline" : (gs.strikeout ? "line-through" : "none"),
            textShadow: textShadow,
            letterSpacing: toPx(gs.spacing || 0),
            lineHeight: 1.2,
            width: `calc(${renderedWidth}px - ${(gs.margin_l || 0) * (renderedWidth / 1080)}px - ${(gs.margin_r || 0) * (renderedWidth / 1080)}px)`,
            pointerEvents: "none",
        };
    };

    return (
        <div className="flex-1 bg-[var(--color-surface)] border border-[var(--color-border-subtle)] rounded-xl p-6 flex flex-col items-center justify-center relative overflow-hidden shadow-lg h-full">
            {!videoUrl ? (
                <div className="flex flex-col items-center gap-4">
                    <div className="w-20 h-20 bg-[var(--color-background)] rounded-full flex items-center justify-center shadow-inner">
                        <Upload size={32} className="text-[var(--color-primary)]" />
                    </div>
                    <div className="text-center">
                        <h2 className="text-xl font-bold mb-1 text-[var(--color-foreground)]">Upload Video</h2>
                        <p className="text-[var(--color-foreground-secondary)] max-w-sm mb-6">Start your project by uploading an MP4 or MOV file. AI will automatically generate captions.</p>
                    </div>
                    
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileUpload}
                        className="hidden" 
                        accept="video/mp4,video/quicktime" 
                    />
                    
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="px-6 py-3 bg-[var(--color-primary)] text-white rounded-xl font-bold hover:opacity-90 transition-all shadow-lg hover:scale-105 active:scale-95"
                    >
                        Select Video File
                    </button>
                </div>
            ) : (
                <div className="w-full h-full flex flex-col relative">
                    <div className="absolute top-4 right-4 z-20 flex gap-2">
                        {finalVideoUrl ? (
                            <a 
                                href={finalVideoUrl}
                                download="captions_video.mp4"
                                className="px-4 py-2 bg-green-600 text-white rounded-md font-medium hover:opacity-90 transition-opacity flex items-center gap-2 shadow-lg"
                            >
                                <Download size={16} /> Export Video
                            </a>
                        ) : (
                            <button 
                                disabled
                                className="px-4 py-2 bg-[var(--color-surface)] border border-[var(--color-border-subtle)] text-[var(--color-foreground-secondary)] rounded-md font-medium opacity-50 cursor-not-allowed flex items-center gap-2"
                            >
                                <Download size={16} /> Export (Render First)
                            </button>
                        )}
                    </div>
                    
                    {/* Interactive Canvas Container */}
                    <div 
                        ref={containerRef}
                        className="relative w-full h-full bg-black rounded-lg overflow-hidden shadow-inner flex items-center justify-center"
                    >
                        {/* The actual video player */}
                        <video 
                            ref={videoRef}
                            src={finalVideoUrl || videoUrl} 
                            controls 
                            onTimeUpdate={handleTimeUpdate}
                            onDurationChange={(e) => setDuration(e.currentTarget.duration)}
                            onPlay={() => setIsPlaying(true)}
                            onPause={() => setIsPlaying(false)}
                            className="absolute inset-0 w-full h-full object-contain z-0"
                        />
                        
                        {/* Live Live Preview Overlay (Only show if we haven't rendered a final video yet) */}
                        {!finalVideoUrl && activeCaption && (
                            <div style={getOverlayStyle()} className="z-10 transition-all duration-75">
                                {activeCaption.words.map((w: any, idx: number) => {
                                    // Highlight logic: if current time is within this word's duration
                                    const isHighlight = currentTime >= w.start && currentTime <= w.end;
                                    
                                    return (
                                        <span 
                                            key={w.id || idx} 
                                            style={{
                                                color: isHighlight ? (projectData?.global_style?.back_color || '#FFD700') : 'inherit',
                                                transition: 'color 0.1s ease',
                                            }}
                                            className={`inline-block mx-[0.1em] transition-transform duration-150 ease-out origin-bottom ${
                                                isHighlight && projectData?.template_id === 'modern' ? 'scale-125' : 'scale-100'
                                            }`}
                                        >
                                            {w.text}{w.emoji ? ` ${w.emoji}` : ''}
                                        </span>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                    
                    {/* Loading Overlay */}
                    {(loading || rendering) && (
                        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white backdrop-blur-md rounded-xl z-30">
                            <Loader2 className="animate-spin h-16 w-16 mb-6 text-[var(--color-primary)]" />
                            <p className="font-bold text-xl tracking-wide">{loadingStatus}</p>
                            <p className="text-white/60 mt-2">Please do not close this tab.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
