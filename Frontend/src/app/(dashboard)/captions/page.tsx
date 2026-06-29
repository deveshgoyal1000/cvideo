"use client";

import { useState, useRef, useEffect } from "react";
import { Upload, Play, Settings, Download, Loader2, Palette, LayoutTemplate, AlignLeft, AlignCenter, AlignRight, AlignVerticalJustifyCenter, ArrowUp, ArrowDown, Type as TypeIcon } from "lucide-react";

export default function CaptionsEditor() {
    const [file, setFile] = useState<File | null>(null);
    const [videoUrl, setVideoUrl] = useState<string>("");
    const [finalVideoUrl, setFinalVideoUrl] = useState<string>("");
    const [projectData, setProjectData] = useState<any>(null);
    
    const [activeTab, setActiveTab] = useState<"captions" | "design" | "layout">("captions");
    const [loading, setLoading] = useState(false);
    const [rendering, setRendering] = useState(false);
    const [loadingStatus, setLoadingStatus] = useState("");
    const [style, setStyle] = useState("modern"); // Maps to template_id
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Polling logic for transcription
    const pollTranscription = async (jobId: string) => {
        setLoadingStatus("Processing AI Pipeline...");
        const interval = setInterval(async () => {
            try {
                const res = await fetch(`http://localhost:8000/api/captions/v3/status/${jobId}`);
                const data = await res.json();
                
                if (data.status === "completed") {
                    clearInterval(interval);
                    setProjectData(data.project_data[0]); // The massive JSON tree
                    setLoading(false);
                    setLoadingStatus("");
                } else if (data.status === "failed") {
                    clearInterval(interval);
                    alert("Transcription failed: " + data.error);
                    setLoading(false);
                    setLoadingStatus("");
                }
            } catch (err) {
                console.error("Polling error:", err);
            }
        }, 2000);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return;
        const uploadedFile = e.target.files[0];
        setFile(uploadedFile);
        
        // Generate a local blob URL for previewing the original video
        setVideoUrl(URL.createObjectURL(uploadedFile));
        
        const formData = new FormData();
        formData.append("file", uploadedFile);

        setLoading(true);
        setLoadingStatus("Uploading & Initializing...");
        setFinalVideoUrl(""); // Reset output
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
                setLoading(false);
            }
        } catch (error) {
            console.error(error);
            alert("Transcription error.");
            setLoading(false);
        }
    };

    // Deep mutation of the JSON tree
    const handleWordEdit = (cIdx: number, wIdx: number, field: string, value: string) => {
        if (!projectData) return;
        const newData = JSON.parse(JSON.stringify(projectData));
        if (field === "text") {
            newData.captions[cIdx].words[wIdx].text = value;
        } else {
            newData.captions[cIdx].words[wIdx][field] = parseFloat(value) || 0;
        }
        setProjectData(newData);
    };

    const handleStyleEdit = (field: string, value: any) => {
        if (!projectData) return;
        const newData = JSON.parse(JSON.stringify(projectData));
        if (!newData.global_style) {
            newData.global_style = { font_family: "Arial", font_size: 48, primary_color: "#FFFFFF", outline_color: "#000000", back_color: "#000000", alignment: 2, margin_v: 150, margin_l: 10, margin_r: 10 };
        }
        newData.global_style[field] = value;
        setProjectData(newData);
    };

    // Polling logic for rendering
    const pollRendering = async (jobId: string) => {
        setLoadingStatus("Burning Captions into Video...");
        const interval = setInterval(async () => {
            try {
                const res = await fetch(`http://localhost:8000/api/captions/v3/render_status/${jobId}`);
                const data = await res.json();
                
                if (data.status === "completed") {
                    clearInterval(interval);
                    // Fetch the actual video blob URL
                    setFinalVideoUrl(`http://localhost:8000/api/captions/v3/download/${jobId}`);
                    setRendering(false);
                    setLoadingStatus("");
                } else if (data.status === "failed") {
                    clearInterval(interval);
                    alert("Render failed: " + data.error);
                    setRendering(false);
                    setLoadingStatus("");
                }
            } catch (err) {
                console.error("Polling error:", err);
            }
        }, 2000);
    };

    const handleRender = async () => {
        if (!projectData) return;
        setRendering(true);
        setLoadingStatus("Sending to Render Engine...");
        
        // Update the template style before sending
        const renderPayload = JSON.parse(JSON.stringify(projectData));
        renderPayload.template_id = style;

        try {
            const res = await fetch("http://localhost:8000/api/captions/v3/render", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ project_data: renderPayload })
            });
            const data = await res.json();
            if (data.status === "success") {
                pollRendering(data.job_id);
            } else {
                alert("Render failed: " + data.detail);
                setRendering(false);
            }
        } catch (error) {
            console.error(error);
            alert("Render error.");
            setRendering(false);
        }
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-[var(--color-foreground)]">Enterprise Captions Editor</h1>
                    <p className="text-[var(--color-foreground-secondary)] mt-1">Powered by the new V3 Submagic-Level Render Engine.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column - Video Preview */}
                <div className="flex flex-col gap-4">
                    <div className="bg-[var(--color-surface)] border border-[var(--color-border-subtle)] rounded-xl p-4 flex flex-col items-center justify-center min-h-[400px] relative overflow-hidden">
                        {finalVideoUrl ? (
                            <div className="w-full flex flex-col items-center gap-4">
                                <video src={finalVideoUrl} controls autoPlay className="w-full max-h-[600px] rounded-lg shadow-md" />
                                <a 
                                    href={finalVideoUrl} 
                                    download="rendered_video.mp4"
                                    className="px-6 py-3 bg-[var(--color-primary)] text-white rounded-lg font-bold hover:opacity-90 transition-opacity flex items-center gap-2 shadow-lg w-full justify-center"
                                >
                                    <Download size={20} /> Export Video
                                </a>
                            </div>
                        ) : videoUrl ? (
                            <video src={videoUrl} controls className="w-full max-h-[600px] rounded-lg shadow-md opacity-70" />
                        ) : (
                            <div className="text-center">
                                <Upload className="mx-auto h-12 w-12 text-[var(--color-foreground-secondary)] mb-4" />
                                <h3 className="text-lg font-semibold text-[var(--color-foreground)]">Upload a Video</h3>
                                <p className="text-sm text-[var(--color-foreground-secondary)] mb-4">MP4, WebM up to 50MB</p>
                                <input type="file" accept="video/*" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
                                <button 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-md font-medium hover:opacity-90 transition-opacity"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <span className="flex items-center gap-2"><Loader2 className="animate-spin" size={16} /> {loadingStatus}</span>
                                    ) : "Select Video"}
                                </button>
                            </div>
                        )}
                        
                        {/* Loading Overlay */}
                        {(loading || rendering) && videoUrl && (
                            <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white backdrop-blur-sm rounded-xl z-10">
                                <Loader2 className="animate-spin h-12 w-12 mb-4" />
                                <p className="font-medium text-lg">{loadingStatus}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column - Editor Dashboard */}
                <div className="flex flex-col gap-4">
                    <div className="bg-[var(--color-surface)] border border-[var(--color-border-subtle)] rounded-xl flex flex-col h-[650px] overflow-hidden shadow-lg">
                        
                        {/* Tabs Header */}
                        <div className="flex border-b border-[var(--color-border-subtle)] bg-[var(--color-background)]/50">
                            <button 
                                onClick={() => setActiveTab("captions")}
                                className={`flex-1 py-3 px-4 flex justify-center items-center gap-2 font-bold text-sm transition-colors ${activeTab === 'captions' ? 'border-b-2 border-[var(--color-primary)] text-[var(--color-primary)] bg-[var(--color-primary)]/5' : 'text-[var(--color-foreground-secondary)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-background)]'}`}
                            >
                                <TypeIcon size={16} /> Captions
                            </button>
                            <button 
                                onClick={() => setActiveTab("design")}
                                className={`flex-1 py-3 px-4 flex justify-center items-center gap-2 font-bold text-sm transition-colors ${activeTab === 'design' ? 'border-b-2 border-[var(--color-primary)] text-[var(--color-primary)] bg-[var(--color-primary)]/5' : 'text-[var(--color-foreground-secondary)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-background)]'}`}
                            >
                                <Palette size={16} /> Design
                            </button>
                            <button 
                                onClick={() => setActiveTab("layout")}
                                className={`flex-1 py-3 px-4 flex justify-center items-center gap-2 font-bold text-sm transition-colors ${activeTab === 'layout' ? 'border-b-2 border-[var(--color-primary)] text-[var(--color-primary)] bg-[var(--color-primary)]/5' : 'text-[var(--color-foreground-secondary)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-background)]'}`}
                            >
                                <LayoutTemplate size={16} /> Layout
                            </button>
                        </div>
                        
                        {/* Tab Content Area */}
                        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
                            {!projectData ? (
                                <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-[var(--color-border-subtle)] rounded-xl m-2 opacity-60">
                                    <TypeIcon className="w-12 h-12 mb-4 text-[var(--color-foreground-secondary)]" />
                                    <p className="text-[var(--color-foreground)] font-bold text-lg">No Project Loaded</p>
                                    <p className="text-[var(--color-foreground-secondary)] text-sm text-center px-8 mt-2">Upload a video and wait for transcription to start editing.</p>
                                </div>
                            ) : (
                                <>
                                    {activeTab === "captions" && (
                                        <div className="flex flex-col gap-3">
                                            {projectData.captions.map((caption: any, cIdx: number) => (
                                                <div key={caption.id} className="border border-[var(--color-border-subtle)] rounded-lg bg-[var(--color-background)]/50 p-3 shadow-sm hover:border-[var(--color-primary)]/50 transition-colors">
                                                    <div className="text-xs text-[var(--color-primary)] mb-3 font-mono flex justify-between font-bold bg-[var(--color-primary)]/10 px-2 py-1.5 rounded">
                                                        <span>Block {cIdx + 1}</span>
                                                        <span>{caption.start.toFixed(2)}s - {caption.end.toFixed(2)}s</span>
                                                    </div>
                                                    <div className="grid grid-cols-1 gap-2">
                                                        {caption.words.map((w: any, wIdx: number) => (
                                                            <div key={w.id} className="flex gap-2 items-center bg-[var(--color-surface)] p-2 rounded border border-[var(--color-border-subtle)] focus-within:border-[var(--color-primary)] transition-colors shadow-sm">
                                                                <input 
                                                                    type="text" 
                                                                    value={w.text}
                                                                    onChange={(e) => handleWordEdit(cIdx, wIdx, "text", e.target.value)}
                                                                    className={`flex-1 bg-transparent focus:outline-none px-2 py-1 font-medium rounded ${w.highlight ? 'text-[var(--color-primary)] font-bold bg-[var(--color-primary)]/10' : 'text-[var(--color-foreground)] hover:bg-[var(--color-border-subtle)]/30'}`}
                                                                />
                                                                <input 
                                                                    type="number" step="0.1"
                                                                    value={w.start}
                                                                    onChange={(e) => handleWordEdit(cIdx, wIdx, "start", e.target.value)}
                                                                    className="w-14 text-xs bg-transparent text-[var(--color-foreground-secondary)] text-right focus:outline-none focus:text-[var(--color-primary)] font-mono"
                                                                />
                                                                <span className="text-[var(--color-border-subtle)] text-xs">-</span>
                                                                <input 
                                                                    type="number" step="0.1"
                                                                    value={w.end}
                                                                    onChange={(e) => handleWordEdit(cIdx, wIdx, "end", e.target.value)}
                                                                    className="w-14 text-xs bg-transparent text-[var(--color-foreground-secondary)] text-right focus:outline-none focus:text-[var(--color-primary)] font-mono"
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {activeTab === "design" && (
                                        <div className="flex flex-col gap-6 p-2">
                                            <div className="flex flex-col gap-2">
                                                <label className="text-sm font-bold text-[var(--color-foreground)]">Font Family</label>
                                                <select 
                                                    value={projectData.global_style?.font_family || "Arial"}
                                                    onChange={(e) => handleStyleEdit("font_family", e.target.value)}
                                                    className="w-full p-3 rounded-lg border-2 border-[var(--color-border-subtle)] bg-[var(--color-background)] text-sm focus:border-[var(--color-primary)] focus:outline-none font-bold shadow-sm cursor-pointer"
                                                >
                                                    <option value="Arial">Arial (Clean)</option>
                                                    <option value="Montserrat">Montserrat (Modern)</option>
                                                    <option value="Impact">Impact (Bold)</option>
                                                    <option value="Comic Sans MS">Comic Sans (Playful)</option>
                                                    <option value="Times New Roman">Times New Roman (Classic)</option>
                                                </select>
                                                <p className="text-xs text-[var(--color-foreground-secondary)] mt-1">Make sure the font is installed on the rendering server.</p>
                                            </div>

                                            <div className="flex flex-col gap-2 p-4 bg-[var(--color-background)]/50 border border-[var(--color-border-subtle)] rounded-xl">
                                                <div className="flex justify-between items-center">
                                                    <label className="text-sm font-bold text-[var(--color-foreground)]">Font Size</label>
                                                    <span className="text-sm text-[var(--color-primary)] font-mono font-bold bg-[var(--color-primary)]/10 px-3 py-1 rounded-md">{projectData.global_style?.font_size || 48}px</span>
                                                </div>
                                                <input 
                                                    type="range" min="16" max="150" 
                                                    value={projectData.global_style?.font_size || 48}
                                                    onChange={(e) => handleStyleEdit("font_size", parseInt(e.target.value))}
                                                    className="w-full accent-[var(--color-primary)] mt-2"
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="flex flex-col gap-2">
                                                    <label className="text-sm font-bold text-[var(--color-foreground)]">Primary Color</label>
                                                    <div className="flex gap-2">
                                                        <input 
                                                            type="color" 
                                                            value={projectData.global_style?.primary_color || "#FFFFFF"}
                                                            onChange={(e) => handleStyleEdit("primary_color", e.target.value)}
                                                            className="w-12 h-12 rounded-lg cursor-pointer border-0 p-0 shadow-sm"
                                                        />
                                                        <input 
                                                            type="text" 
                                                            value={projectData.global_style?.primary_color || "#FFFFFF"}
                                                            onChange={(e) => handleStyleEdit("primary_color", e.target.value)}
                                                            className="flex-1 p-2.5 rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-background)] font-mono text-sm focus:outline-none uppercase font-bold text-center"
                                                        />
                                                    </div>
                                                </div>
                                                
                                                <div className="flex flex-col gap-2">
                                                    <label className="text-sm font-bold text-[var(--color-foreground)]">Outline Color</label>
                                                    <div className="flex gap-2">
                                                        <input 
                                                            type="color" 
                                                            value={projectData.global_style?.outline_color || "#000000"}
                                                            onChange={(e) => handleStyleEdit("outline_color", e.target.value)}
                                                            className="w-12 h-12 rounded-lg cursor-pointer border-0 p-0 shadow-sm"
                                                        />
                                                        <input 
                                                            type="text" 
                                                            value={projectData.global_style?.outline_color || "#000000"}
                                                            onChange={(e) => handleStyleEdit("outline_color", e.target.value)}
                                                            className="flex-1 p-2.5 rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-background)] font-mono text-sm focus:outline-none uppercase font-bold text-center"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === "layout" && (
                                        <div className="flex flex-col gap-6 p-2">
                                            <div className="flex flex-col gap-3">
                                                <label className="text-sm font-bold text-[var(--color-foreground)]">Screen Alignment</label>
                                                <div className="grid grid-cols-3 gap-3">
                                                    <button 
                                                        onClick={() => handleStyleEdit("alignment", 8)}
                                                        className={`p-6 rounded-xl flex flex-col items-center justify-center gap-3 border-2 transition-all ${projectData.global_style?.alignment === 8 ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)] shadow-[var(--color-primary)]/20 shadow-lg scale-[1.02]' : 'border-[var(--color-border-subtle)] bg-[var(--color-surface)] text-[var(--color-foreground-secondary)] hover:border-[var(--color-foreground-secondary)]'}`}
                                                    >
                                                        <ArrowUp size={28} />
                                                        <span className="text-xs font-bold uppercase tracking-widest">Top</span>
                                                    </button>
                                                    <button 
                                                        onClick={() => handleStyleEdit("alignment", 5)}
                                                        className={`p-6 rounded-xl flex flex-col items-center justify-center gap-3 border-2 transition-all ${projectData.global_style?.alignment === 5 ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)] shadow-[var(--color-primary)]/20 shadow-lg scale-[1.02]' : 'border-[var(--color-border-subtle)] bg-[var(--color-surface)] text-[var(--color-foreground-secondary)] hover:border-[var(--color-foreground-secondary)]'}`}
                                                    >
                                                        <AlignVerticalJustifyCenter size={28} />
                                                        <span className="text-xs font-bold uppercase tracking-widest">Middle</span>
                                                    </button>
                                                    <button 
                                                        onClick={() => handleStyleEdit("alignment", 2)}
                                                        className={`p-6 rounded-xl flex flex-col items-center justify-center gap-3 border-2 transition-all ${projectData.global_style?.alignment === 2 ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)] shadow-[var(--color-primary)]/20 shadow-lg scale-[1.02]' : 'border-[var(--color-border-subtle)] bg-[var(--color-surface)] text-[var(--color-foreground-secondary)] hover:border-[var(--color-foreground-secondary)]'}`}
                                                    >
                                                        <ArrowDown size={28} />
                                                        <span className="text-xs font-bold uppercase tracking-widest">Bottom</span>
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-2 mt-4 p-5 bg-[var(--color-background)]/50 border border-[var(--color-border-subtle)] rounded-xl">
                                                <div className="flex justify-between items-center">
                                                    <label className="text-sm font-bold text-[var(--color-foreground)]">Vertical Offset Margin</label>
                                                    <span className="text-sm text-[var(--color-primary)] font-mono font-bold bg-[var(--color-primary)]/10 px-3 py-1 rounded-md">{projectData.global_style?.margin_v || 150}px</span>
                                                </div>
                                                <input 
                                                    type="range" min="0" max="800" 
                                                    value={projectData.global_style?.margin_v || 150}
                                                    onChange={(e) => handleStyleEdit("margin_v", parseInt(e.target.value))}
                                                    className="w-full accent-[var(--color-primary)] mt-3"
                                                />
                                                <p className="text-xs text-[var(--color-foreground-secondary)] mt-2">Adjusts the distance from the selected edge (Top or Bottom). Ignored if Middle is selected.</p>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Render Action Footer */}
                        <div className="p-4 border-t border-[var(--color-border-subtle)] bg-[var(--color-background)] flex justify-between items-center">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-[var(--color-foreground-secondary)] uppercase tracking-wider mb-1">Animation Engine</span>
                                <select 
                                    value={style}
                                    onChange={(e) => setStyle(e.target.value)}
                                    className="bg-[var(--color-surface)] border border-[var(--color-border-subtle)] text-[var(--color-foreground)] text-sm font-bold p-1.5 rounded focus:outline-none focus:border-[var(--color-primary)] cursor-pointer"
                                >
                                    <option value="modern">Modern Pop</option>
                                    <option value="neon">Neon Glow</option>
                                    <option value="minimal">Minimal Clean</option>
                                </select>
                            </div>
                            <button 
                                onClick={handleRender}
                                disabled={!projectData || rendering || loading}
                                className="px-6 py-3 bg-[var(--color-primary)] text-white rounded-xl font-bold hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-[var(--color-primary)]/30 hover:scale-[1.02] active:scale-95 cursor-pointer"
                            >
                                {rendering ? <Loader2 className="animate-spin" size={18} /> : <Play size={18} fill="currentColor" />}
                                {rendering ? 'Rendering Video...' : 'Render Captions'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
