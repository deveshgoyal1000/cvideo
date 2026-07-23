import { Play, Loader2, Palette, LayoutTemplate, AlignVerticalJustifyCenter, ArrowUp, ArrowDown, Type as TypeIcon } from "lucide-react";
import { useProjectStore } from "../../stores/useProjectStore";

export default function RightProperties() {
    const { 
        projectData, 
        activeTab, 
        rendering, 
        loading,
        setActiveTab,
        updateGlobalStyle,
        updateWord,
        setRendering,
        setFinalVideoUrl,
        setLoading,
        updateProjectField
    } = useProjectStore();

    const handleWordEdit = (cIdx: number, wIdx: number, field: string, value: string) => {
        if (field === "text") {
            updateWord(cIdx, wIdx, field as any, value);
        } else {
            updateWord(cIdx, wIdx, field as any, parseFloat(value) || 0);
        }
    };

    const handleTemplateChange = (templateId: string) => {
        updateProjectField("template_id", templateId);
        
        const baseStyle = projectData?.global_style || {};
        let newStyle = { ...baseStyle };
        
        switch (templateId) {
            case "modern":
                newStyle = { ...newStyle, font_family: "Impact", font_size: 140, primary_color: "#ffff00", outline_color: "#000000", back_color: "#000000", bold: 1, outline: 4, shadow: 0 };
                break;
            case "neon":
                newStyle = { ...newStyle, font_family: "Montserrat", font_size: 120, primary_color: "#00ffff", outline_color: "#ff00ff", back_color: "#000000", bold: 1, outline: 2, shadow: 4 };
                break;
            case "minimal":
                newStyle = { ...newStyle, font_family: "Arial", font_size: 100, primary_color: "#ffffff", outline_color: "#000000", back_color: "#000000", bold: 0, outline: 0, shadow: 2 };
                break;
        }
        
        updateProjectField("global_style", newStyle);
    };


    const handleRender = async () => {
        if (!projectData) return;
        setRendering(true, "Sending to Render Engine...");
        
        // Use global style directly in the payload
        const renderPayload = JSON.parse(JSON.stringify(projectData));

        try {
            const res = await fetch("https://cvideo-nlxn.onrender.com/api/captions/v3/render", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ project_data: renderPayload })
            });
            const data = await res.json();
            if (data.status === "success") {
                pollRendering(data.job_id);
            } else {
                alert("Render failed: " + data.detail);
                setRendering(false, "");
            }
        } catch (error) {
            console.error(error);
            alert("Render error.");
            setRendering(false, "");
        }
    };

    const pollRendering = async (jobId: string) => {
        setLoading(true, "Burning Captions into Video...");
        const interval = setInterval(async () => {
            try {
                const res = await fetch(`https://cvideo-nlxn.onrender.com/api/captions/v3/render_status/${jobId}`);
                const data = await res.json();
                
                if (data.status === "completed") {
                    clearInterval(interval);
                    setFinalVideoUrl(`https://cvideo-nlxn.onrender.com/api/captions/v3/download/${jobId}`);
                    setRendering(false, "");
                    setLoading(false, "");
                } else if (data.status === "failed") {
                    clearInterval(interval);
                    alert("Render failed: " + data.error);
                    setRendering(false, "");
                    setLoading(false, "");
                }
            } catch (err) {
                console.error("Polling error:", err);
            }
        }, 2000);
    };

    return (
        <div className="flex-1 bg-[var(--color-surface)] border border-[var(--color-border-subtle)] rounded-xl flex flex-col h-full overflow-hidden shadow-lg w-full max-w-[400px]">
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
                                
                                {/* Typography Section */}
                                <div className="flex flex-col gap-4">
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--color-foreground-secondary)]">Typography</h3>
                                    
                                    <div className="flex flex-col gap-2">
                                        <select 
                                            value={projectData.global_style?.font_family || "Arial"}
                                            onChange={(e) => updateGlobalStyle("font_family", e.target.value)}
                                            className="w-full p-3 rounded-lg border-2 border-[var(--color-border-subtle)] bg-[var(--color-background)] text-sm focus:border-[var(--color-primary)] focus:outline-none font-bold shadow-sm cursor-pointer"
                                        >
                                            <option value="Arial">Arial (Clean)</option>
                                            <option value="Montserrat">Montserrat (Modern)</option>
                                            <option value="Impact">Impact (Bold)</option>
                                            <option value="Comic Sans MS">Comic Sans (Playful)</option>
                                            <option value="Times New Roman">Times New Roman (Classic)</option>
                                        </select>
                                    </div>

                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => updateGlobalStyle("bold", projectData.global_style?.bold ? 0 : 1)}
                                            className={`flex-1 py-2 rounded font-serif font-bold border transition-colors ${projectData.global_style?.bold ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-white' : 'bg-[var(--color-surface)] border-[var(--color-border-subtle)] text-[var(--color-foreground)]'}`}
                                        >
                                            B
                                        </button>
                                        <button 
                                            onClick={() => updateGlobalStyle("italic", projectData.global_style?.italic ? 0 : 1)}
                                            className={`flex-1 py-2 rounded font-serif italic border transition-colors ${projectData.global_style?.italic ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-white' : 'bg-[var(--color-surface)] border-[var(--color-border-subtle)] text-[var(--color-foreground)]'}`}
                                        >
                                            I
                                        </button>
                                        <button 
                                            onClick={() => updateGlobalStyle("underline", projectData.global_style?.underline ? 0 : 1)}
                                            className={`flex-1 py-2 rounded font-serif underline border transition-colors ${projectData.global_style?.underline ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-white' : 'bg-[var(--color-surface)] border-[var(--color-border-subtle)] text-[var(--color-foreground)]'}`}
                                        >
                                            U
                                        </button>
                                        <button 
                                            onClick={() => updateGlobalStyle("strikeout", projectData.global_style?.strikeout ? 0 : 1)}
                                            className={`flex-1 py-2 rounded font-serif line-through border transition-colors ${projectData.global_style?.strikeout ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-white' : 'bg-[var(--color-surface)] border-[var(--color-border-subtle)] text-[var(--color-foreground)]'}`}
                                        >
                                            S
                                        </button>
                                    </div>

                                    <div className="flex flex-col gap-2 p-4 bg-[var(--color-background)]/50 border border-[var(--color-border-subtle)] rounded-xl">
                                        <div className="flex justify-between items-center">
                                            <label className="text-sm font-bold text-[var(--color-foreground)]">Font Size</label>
                                            <span className="text-sm text-[var(--color-primary)] font-mono font-bold bg-[var(--color-primary)]/10 px-3 py-1 rounded-md">{projectData.global_style?.font_size || 120}px</span>
                                        </div>
                                        <input 
                                            type="range" min="20" max="400" 
                                            value={projectData.global_style?.font_size || 120}
                                            onChange={(e) => updateGlobalStyle("font_size", parseInt(e.target.value))}
                                            className="w-full accent-[var(--color-primary)] mt-2"
                                        />
                                    </div>
                                    
                                    <div className="flex flex-col gap-2 p-4 bg-[var(--color-background)]/50 border border-[var(--color-border-subtle)] rounded-xl">
                                        <div className="flex justify-between items-center">
                                            <label className="text-sm font-bold text-[var(--color-foreground)]">Letter Spacing</label>
                                            <span className="text-sm text-[var(--color-primary)] font-mono font-bold bg-[var(--color-primary)]/10 px-3 py-1 rounded-md">{projectData.global_style?.spacing || 0}px</span>
                                        </div>
                                        <input 
                                            type="range" min="-10" max="50" 
                                            value={projectData.global_style?.spacing || 0}
                                            onChange={(e) => updateGlobalStyle("spacing", parseInt(e.target.value))}
                                            className="w-full accent-[var(--color-primary)] mt-2"
                                        />
                                    </div>
                                </div>

                                <div className="w-full h-px bg-[var(--color-border-subtle)] my-2"></div>

                                {/* Colors Section */}
                                <div className="flex flex-col gap-4">
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--color-foreground-secondary)]">Colors & Effects</h3>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex flex-col gap-2">
                                            <label className="text-sm font-bold text-[var(--color-foreground)]">Text Color</label>
                                            <div className="flex gap-2">
                                                <input 
                                                    type="color" 
                                                    value={projectData.global_style?.primary_color || "#FFFFFF"}
                                                    onChange={(e) => updateGlobalStyle("primary_color", e.target.value)}
                                                    className="w-10 h-10 rounded cursor-pointer border-0 p-0 shadow-sm"
                                                />
                                                <input 
                                                    type="text" 
                                                    value={projectData.global_style?.primary_color || "#FFFFFF"}
                                                    onChange={(e) => updateGlobalStyle("primary_color", e.target.value)}
                                                    className="flex-1 p-2 rounded border border-[var(--color-border-subtle)] bg-[var(--color-background)] font-mono text-xs focus:outline-none uppercase font-bold text-center"
                                                />
                                            </div>
                                        </div>
                                        
                                        <div className="flex flex-col gap-2">
                                            <label className="text-sm font-bold text-[var(--color-foreground)]">Background</label>
                                            <div className="flex gap-2">
                                                <input 
                                                    type="color" 
                                                    value={projectData.global_style?.back_color || "#000000"}
                                                    onChange={(e) => updateGlobalStyle("back_color", e.target.value)}
                                                    className="w-10 h-10 rounded cursor-pointer border-0 p-0 shadow-sm"
                                                />
                                                <input 
                                                    type="text" 
                                                    value={projectData.global_style?.back_color || "#000000"}
                                                    onChange={(e) => updateGlobalStyle("back_color", e.target.value)}
                                                    className="flex-1 p-2 rounded border border-[var(--color-border-subtle)] bg-[var(--color-background)] font-mono text-xs focus:outline-none uppercase font-bold text-center"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm font-bold text-[var(--color-foreground)]">Outline Color</label>
                                        <div className="flex gap-2">
                                            <input 
                                                type="color" 
                                                value={projectData.global_style?.outline_color || "#000000"}
                                                onChange={(e) => updateGlobalStyle("outline_color", e.target.value)}
                                                className="w-10 h-10 rounded cursor-pointer border-0 p-0 shadow-sm"
                                            />
                                            <input 
                                                type="range" min="0" max="20" 
                                                value={projectData.global_style?.outline || 3}
                                                onChange={(e) => updateGlobalStyle("outline", parseInt(e.target.value))}
                                                className="flex-1 accent-[var(--color-primary)] ml-2"
                                            />
                                            <span className="text-xs font-mono w-6 text-right">{projectData.global_style?.outline || 3}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="flex flex-col gap-2 mt-2">
                                        <label className="text-sm font-bold text-[var(--color-foreground)]">Drop Shadow</label>
                                        <div className="flex gap-2 items-center">
                                            <input 
                                                type="range" min="0" max="30" 
                                                value={projectData.global_style?.shadow || 2}
                                                onChange={(e) => updateGlobalStyle("shadow", parseInt(e.target.value))}
                                                className="flex-1 accent-[var(--color-primary)]"
                                            />
                                            <span className="text-xs font-mono w-6 text-right">{projectData.global_style?.shadow || 2}</span>
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
                                            onClick={() => updateGlobalStyle("alignment", 8)}
                                            className={`p-6 rounded-xl flex flex-col items-center justify-center gap-3 border-2 transition-all ${projectData.global_style?.alignment === 8 ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)] shadow-[var(--color-primary)]/20 shadow-lg scale-[1.02]' : 'border-[var(--color-border-subtle)] bg-[var(--color-surface)] text-[var(--color-foreground-secondary)] hover:border-[var(--color-foreground-secondary)]'}`}
                                        >
                                            <ArrowUp size={28} />
                                            <span className="text-xs font-bold uppercase tracking-widest">Top</span>
                                        </button>
                                        <button 
                                            onClick={() => updateGlobalStyle("alignment", 5)}
                                            className={`p-6 rounded-xl flex flex-col items-center justify-center gap-3 border-2 transition-all ${projectData.global_style?.alignment === 5 ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)] shadow-[var(--color-primary)]/20 shadow-lg scale-[1.02]' : 'border-[var(--color-border-subtle)] bg-[var(--color-surface)] text-[var(--color-foreground-secondary)] hover:border-[var(--color-foreground-secondary)]'}`}
                                        >
                                            <AlignVerticalJustifyCenter size={28} />
                                            <span className="text-xs font-bold uppercase tracking-widest">Middle</span>
                                        </button>
                                        <button 
                                            onClick={() => updateGlobalStyle("alignment", 2)}
                                            className={`p-6 rounded-xl flex flex-col items-center justify-center gap-3 border-2 transition-all ${projectData.global_style?.alignment === 2 ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)] shadow-[var(--color-primary)]/20 shadow-lg scale-[1.02]' : 'border-[var(--color-border-subtle)] bg-[var(--color-surface)] text-[var(--color-foreground-secondary)] hover:border-[var(--color-foreground-secondary)]'}`}
                                        >
                                            <ArrowDown size={28} />
                                            <span className="text-xs font-bold uppercase tracking-widest">Bottom</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2 mt-2 p-4 bg-[var(--color-background)]/50 border border-[var(--color-border-subtle)] rounded-xl">
                                    <div className="flex justify-between items-center">
                                        <label className="text-sm font-bold text-[var(--color-foreground)]">Vertical Margin</label>
                                        <span className="text-sm text-[var(--color-primary)] font-mono font-bold bg-[var(--color-primary)]/10 px-3 py-1 rounded-md">{projectData.global_style?.margin_v || 150}px</span>
                                    </div>
                                    <input 
                                        type="range" min="0" max="1000" 
                                        value={projectData.global_style?.margin_v || 150}
                                        onChange={(e) => updateGlobalStyle("margin_v", parseInt(e.target.value))}
                                        className="w-full accent-[var(--color-primary)] mt-2"
                                    />
                                    <p className="text-xs text-[var(--color-foreground-secondary)] mt-2 text-center">Distance from Top/Bottom edge</p>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Render Action Footer */}
            <div className="p-4 border-t border-[var(--color-border-subtle)] bg-[var(--color-background)] flex flex-col gap-3">
                <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-[var(--color-foreground-secondary)] uppercase tracking-wider mb-1">Animation Engine</span>
                    <select 
                        value={projectData?.template_id || "modern"}
                        onChange={(e) => handleTemplateChange(e.target.value)}
                        className="bg-[var(--color-surface)] border border-[var(--color-border-subtle)] text-[var(--color-foreground)] text-sm font-bold p-2 rounded focus:outline-none focus:border-[var(--color-primary)] cursor-pointer"
                    >
                        <option value="modern">Modern Pop</option>
                        <option value="neon">Neon Glow</option>
                        <option value="minimal">Minimal Clean</option>
                    </select>
                </div>
                <button 
                    onClick={handleRender}
                    disabled={!projectData || rendering || loading}
                    className="w-full py-3 bg-[var(--color-primary)] text-white rounded-xl font-bold hover:opacity-90 transition-all disabled:opacity-50 flex justify-center items-center gap-2 shadow-lg shadow-[var(--color-primary)]/30 hover:scale-[1.02] active:scale-95 cursor-pointer"
                >
                    {rendering ? <Loader2 className="animate-spin" size={18} /> : <Play size={18} fill="currentColor" />}
                    {rendering ? 'Rendering Video...' : 'Render Captions'}
                </button>
            </div>
        </div>
    );
}
