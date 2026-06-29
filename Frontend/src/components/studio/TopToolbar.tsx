import { Play, Settings, Download, Loader2 } from "lucide-react";
import { useProjectStore } from "../../stores/useProjectStore";

export default function TopToolbar() {
    return (
        <div className="flex justify-between items-center bg-[var(--color-surface)] border-b border-[var(--color-border-subtle)] p-4">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-[var(--color-foreground)]">Enterprise Captions Editor V5</h1>
                <p className="text-[var(--color-foreground-secondary)]">AI-Powered Subtitle Engine</p>
            </div>
            <div className="flex gap-4">
                <button className="px-4 py-2 bg-[var(--color-background)] border border-[var(--color-border-subtle)] text-[var(--color-foreground)] rounded-md font-medium hover:bg-[var(--color-border-subtle)] transition-colors flex items-center gap-2">
                    <Settings size={18} /> Settings
                </button>
            </div>
        </div>
    );
}
