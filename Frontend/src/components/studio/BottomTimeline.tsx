import { useRef, useEffect, MouseEvent } from "react";
import { useProjectStore } from "../../stores/useProjectStore";

export default function BottomTimeline() {
    const { projectData, currentTime, duration, setCurrentTime, isPlaying, setIsPlaying } = useProjectStore();
    const timelineRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Zoom level: Pixels per second
    const PX_PER_SEC = 50;
    
    // Auto-scroll timeline to keep playhead in view when playing
    useEffect(() => {
        if (!scrollContainerRef.current || !isPlaying) return;
        
        const container = scrollContainerRef.current;
        const playheadX = currentTime * PX_PER_SEC;
        
        // If playhead is getting close to the right edge of the visible area, scroll right
        const scrollLeft = container.scrollLeft;
        const containerWidth = container.clientWidth;
        
        if (playheadX > scrollLeft + containerWidth * 0.8) {
            container.scrollTo({ left: playheadX - containerWidth * 0.2, behavior: "smooth" });
        } else if (playheadX < scrollLeft) {
            // Jumped backwards
            container.scrollTo({ left: playheadX - containerWidth * 0.2, behavior: "auto" });
        }
    }, [currentTime, isPlaying]);

    if (!projectData) {
        return (
            <div className="h-full bg-[var(--color-surface)] border-t border-[var(--color-border-subtle)] flex items-center justify-center text-[var(--color-foreground-secondary)] text-sm shadow-[0_-10px_20px_rgba(0,0,0,0.2)]">
                Timeline requires an active project.
            </div>
        );
    }

    const totalWidth = Math.max(duration * PX_PER_SEC, 1000); // Minimum width

    const handleTimelineClick = (e: MouseEvent<HTMLDivElement>) => {
        if (!timelineRef.current) return;
        const rect = timelineRef.current.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const newTime = Math.max(0, Math.min(duration, clickX / PX_PER_SEC));
        setCurrentTime(newTime);
    };

    return (
        <div className="h-full bg-[var(--color-surface)] border-t border-[var(--color-border-subtle)] flex flex-col shadow-[0_-10px_30px_rgba(0,0,0,0.5)] z-20 relative">
            
            {/* Timeline Toolbar */}
            <div className="h-10 border-b border-[var(--color-border-subtle)] flex items-center px-4 bg-[var(--color-background)]/80 backdrop-blur">
                <span className="text-xs font-bold font-mono text-[var(--color-foreground)]">
                    {currentTime.toFixed(2)}s / {duration.toFixed(2)}s
                </span>
                
                <div className="mx-auto flex gap-2">
                    {/* Could add zoom controls here */}
                </div>
            </div>

            {/* Scrollable Timeline Area */}
            <div 
                ref={scrollContainerRef}
                className="flex-1 overflow-x-auto overflow-y-hidden custom-scrollbar relative bg-[#111]"
            >
                {/* The Timeline Track Container */}
                <div 
                    ref={timelineRef}
                    className="relative h-full"
                    style={{ width: `${totalWidth}px` }}
                    onClick={handleTimelineClick}
                >
                    {/* Time markers (ruler) */}
                    <div className="absolute top-0 w-full h-5 border-b border-[var(--color-border-subtle)] flex">
                        {/* We could render markers here based on duration */}
                    </div>
                    
                    {/* Captions Track */}
                    <div className="absolute top-8 w-full h-12 bg-black/20 border-y border-[var(--color-border-subtle)]/30 rounded">
                        <div className="absolute left-2 top-1 text-[10px] text-[var(--color-foreground-secondary)] uppercase font-bold tracking-widest z-10 pointer-events-none">
                            Captions
                        </div>
                        {projectData.captions.map((cap: any, i: number) => {
                            const left = cap.start * PX_PER_SEC;
                            const width = (cap.end - cap.start) * PX_PER_SEC;
                            return (
                                <div 
                                    key={cap.id || i}
                                    className="absolute top-1 bottom-1 bg-[var(--color-primary)]/80 hover:bg-[var(--color-primary)] border border-[var(--color-primary)] rounded-md overflow-hidden text-[10px] text-white px-1 shadow-md cursor-pointer transition-colors"
                                    style={{ left: `${left}px`, width: `${width}px` }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setCurrentTime(cap.start);
                                    }}
                                    title={cap.words.map((w: any) => w.text).join(" ")}
                                >
                                    <div className="truncate w-full h-full flex items-center font-bold">
                                        {cap.words.map((w: any) => w.text).join(" ")}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Playhead */}
                    <div 
                        className="absolute top-0 bottom-0 w-[2px] bg-red-500 z-30 shadow-[0_0_10px_rgba(255,0,0,0.8)] pointer-events-none"
                        style={{ left: `${currentTime * PX_PER_SEC}px` }}
                    >
                        <div className="w-3 h-3 bg-red-500 absolute -top-1 -left-[5px] rotate-45"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
