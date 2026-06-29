"use client";

import { useEffect } from "react";
import TopToolbar from "../../../components/studio/TopToolbar";
import CenterCanvas from "../../../components/studio/CenterCanvas";
import RightProperties from "../../../components/studio/RightProperties";
import LeftSidebar from "../../../components/studio/LeftSidebar";
import BottomTimeline from "../../../components/studio/BottomTimeline";
import { useProjectStore } from "../../../stores/useProjectStore";

export default function CaptionsEditor() {
    const { isPlaying, setIsPlaying } = useProjectStore();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore if typing in an input
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
                return;
            }

            if (e.code === 'Space') {
                e.preventDefault();
                setIsPlaying(!isPlaying);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isPlaying, setIsPlaying]);

    return (
        <div className="flex flex-col h-[calc(100vh-2rem)] bg-[var(--color-background)] rounded-xl overflow-hidden shadow-xl border border-[var(--color-border-subtle)]">
            <TopToolbar />
            
            <div className="flex flex-1 overflow-hidden p-4 gap-4">
                {/* Left Sidebar */}
                <LeftSidebar />
                
                {/* Main Video Canvas */}
                <CenterCanvas />
                
                {/* Right Properties Panel */}
                <RightProperties />
            </div>
            
            {/* Timeline */}
            <div className="h-56">
                <BottomTimeline />
            </div>
        </div>
    );
}
