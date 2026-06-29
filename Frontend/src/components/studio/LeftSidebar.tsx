import { useState } from "react";
import { Search, AlignLeft, Clock } from "lucide-react";
import { useProjectStore } from "../../stores/useProjectStore";

export default function LeftSidebar() {
    const { projectData } = useProjectStore();
    const [searchQuery, setSearchQuery] = useState("");

    if (!projectData) {
        return (
            <div className="w-[300px] h-[650px] bg-[var(--color-surface)] border border-[var(--color-border-subtle)] rounded-xl flex flex-col shadow-lg opacity-50">
                <div className="p-4 border-b border-[var(--color-border-subtle)] flex gap-2 items-center">
                    <AlignLeft size={18} />
                    <h2 className="font-bold">Caption List</h2>
                </div>
                <div className="flex-1 flex items-center justify-center text-sm text-[var(--color-foreground-secondary)] p-4 text-center">
                    Upload a video to see captions here.
                </div>
            </div>
        );
    }

    const filteredCaptions = projectData.captions.filter((cap: any) => {
        if (!searchQuery) return true;
        const fullText = cap.words.map((w: any) => w.text).join(" ").toLowerCase();
        return fullText.includes(searchQuery.toLowerCase());
    });

    // Helper to format seconds into MM:SS.ms
    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        const ms = Math.floor((seconds % 1) * 10);
        return `${m}:${s.toString().padStart(2, '0')}.${ms}`;
    };

    return (
        <div className="w-[300px] h-full bg-[var(--color-surface)] border border-[var(--color-border-subtle)] rounded-xl flex flex-col shadow-lg overflow-hidden">
            <div className="p-4 border-b border-[var(--color-border-subtle)] flex gap-2 items-center bg-[var(--color-background)]">
                <AlignLeft size={18} className="text-[var(--color-primary)]" />
                <h2 className="font-bold text-[var(--color-foreground)]">Captions</h2>
                <span className="ml-auto text-xs bg-[var(--color-primary)]/10 text-[var(--color-primary)] px-2 py-1 rounded-full font-bold">
                    {projectData.captions.length}
                </span>
            </div>
            
            <div className="p-3 border-b border-[var(--color-border-subtle)] bg-[var(--color-surface)]">
                <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-foreground-secondary)]" />
                    <input 
                        type="text" 
                        placeholder="Search captions..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-[var(--color-background)] border border-[var(--color-border-subtle)] rounded-lg py-2 pl-9 pr-3 text-sm focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1 custom-scrollbar">
                {filteredCaptions.length === 0 ? (
                    <div className="p-4 text-center text-sm text-[var(--color-foreground-secondary)]">
                        No captions found for "{searchQuery}"
                    </div>
                ) : (
                    filteredCaptions.map((cap: any, idx: number) => (
                        <div 
                            key={cap.id || idx}
                            className="p-3 rounded-lg border border-transparent hover:border-[var(--color-border-subtle)] hover:bg-[var(--color-background)]/50 transition-colors cursor-pointer group"
                            onClick={() => {
                                // Find the video element and set its time
                                const videoElement = document.querySelector('video');
                                if (videoElement) {
                                    videoElement.currentTime = cap.start;
                                }
                            }}
                        >
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-xs font-mono font-bold text-[var(--color-primary)] flex items-center gap-1">
                                    <Clock size={12} /> {formatTime(cap.start)}
                                </span>
                            </div>
                            <p className="text-sm text-[var(--color-foreground)] leading-snug">
                                {cap.words.map((w: any) => w.text).join(" ")}
                            </p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
