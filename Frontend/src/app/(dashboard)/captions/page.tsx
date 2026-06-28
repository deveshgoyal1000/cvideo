"use client";

import { useState, useRef } from "react";
import { Upload, Play, Type, Settings, Download, Loader2 } from "lucide-react";

type WordData = {
    Word: string;
    "Start (s)": number;
    "End (s)": number;
};

export default function CaptionsEditor() {
    const [file, setFile] = useState<File | null>(null);
    const [videoBase64, setVideoBase64] = useState<string>("");
    const [finalVideo, setFinalVideo] = useState<string>("");
    const [words, setWords] = useState<WordData[]>([]);
    const [loading, setLoading] = useState(false);
    const [rendering, setRendering] = useState(false);
    const [style, setStyle] = useState("Neon Highlight");
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return;
        const uploadedFile = e.target.files[0];
        setFile(uploadedFile);
        
        const formData = new FormData();
        formData.append("file", uploadedFile);

        setLoading(true);
        try {
            const res = await fetch("http://localhost:8000/api/captions/transcribe", {
                method: "POST",
                body: formData,
            });
            const data = await res.json();
            if (data.status === "success") {
                setWords(data.words);
                setVideoBase64(data.video_base64);
            } else {
                alert("Transcription failed: " + data.detail);
            }
        } catch (error) {
            console.error(error);
            alert("Transcription error.");
        }
        setLoading(false);
    };

    const handleWordEdit = (index: number, field: keyof WordData, value: string) => {
        const newWords = [...words];
        if (field === "Word") {
            newWords[index][field] = value;
        } else {
            newWords[index][field] = parseFloat(value) || 0;
        }
        setWords(newWords);
    };

    const handleRender = async () => {
        if (!videoBase64 || words.length === 0) return;
        setRendering(true);
        try {
            const res = await fetch("http://localhost:8000/api/captions/render", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    video_base64: videoBase64,
                    words_data: words,
                    style: style
                })
            });
            const data = await res.json();
            if (data.status === "success") {
                setFinalVideo(`data:video/mp4;base64,${data.video_base64}`);
            } else {
                alert("Render failed: " + data.detail);
            }
        } catch (error) {
            console.error(error);
            alert("Render error.");
        }
        setRendering(false);
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-[var(--color-foreground)]">Captions Editor</h1>
                    <p className="text-[var(--color-foreground-secondary)] mt-1">Add modern Kalakar-style animated captions to your videos.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column - Video Preview */}
                <div className="flex flex-col gap-4">
                    <div className="bg-[var(--color-surface)] border border-[var(--color-border-subtle)] rounded-xl p-4 flex flex-col items-center justify-center min-h-[400px] relative overflow-hidden">
                        {finalVideo ? (
                            <video src={finalVideo} controls className="w-full max-h-[600px] rounded-lg shadow-md" />
                        ) : videoBase64 ? (
                            <video src={`data:video/mp4;base64,${videoBase64}`} controls className="w-full max-h-[600px] rounded-lg shadow-md" />
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
                                        <span className="flex items-center gap-2"><Loader2 className="animate-spin" size={16} /> Transcribing...</span>
                                    ) : "Select Video"}
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column - Timeline Editor */}
                <div className="flex flex-col gap-4">
                    <div className="bg-[var(--color-surface)] border border-[var(--color-border-subtle)] rounded-xl p-6 flex flex-col h-full">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-bold flex items-center gap-2 text-[var(--color-foreground)]"><Type size={18} /> Transcript Editor</h2>
                            
                            <div className="flex items-center gap-2">
                                <select 
                                    value={style}
                                    onChange={(e) => setStyle(e.target.value)}
                                    className="px-3 py-1.5 border border-[var(--color-border-subtle)] rounded-md bg-[var(--color-background)] text-sm"
                                >
                                    <option value="Neon Highlight">Neon Highlight</option>
                                    <option value="Pop Scale">Pop Scale</option>
                                    <option value="Minimal Clean">Minimal Clean</option>
                                </select>
                                
                                <button 
                                    onClick={handleRender}
                                    disabled={words.length === 0 || rendering}
                                    className="px-4 py-1.5 bg-[var(--color-primary)] text-white rounded-md font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
                                >
                                    {rendering ? <Loader2 className="animate-spin" size={16} /> : <Play size={16} />}
                                    Render Captions
                                </button>
                            </div>
                        </div>

                        {words.length > 0 ? (
                            <div className="overflow-y-auto max-h-[500px] border border-[var(--color-border-subtle)] rounded-md">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs uppercase bg-[var(--color-background)] text-[var(--color-foreground-secondary)] border-b border-[var(--color-border-subtle)] sticky top-0">
                                        <tr>
                                            <th className="px-4 py-3">Word</th>
                                            <th className="px-4 py-3 w-24">Start (s)</th>
                                            <th className="px-4 py-3 w-24">End (s)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {words.map((w, idx) => (
                                            <tr key={idx} className="border-b border-[var(--color-border-subtle)] hover:bg-[var(--color-background)]/50">
                                                <td className="px-4 py-2">
                                                    <input 
                                                        type="text" 
                                                        value={w.Word}
                                                        onChange={(e) => handleWordEdit(idx, "Word", e.target.value)}
                                                        className="w-full bg-transparent border-b border-transparent hover:border-[var(--color-border-subtle)] focus:border-[var(--color-primary)] focus:outline-none px-1 py-0.5"
                                                    />
                                                </td>
                                                <td className="px-4 py-2">
                                                    <input 
                                                        type="number" 
                                                        step="0.1"
                                                        value={w["Start (s)"]}
                                                        onChange={(e) => handleWordEdit(idx, "Start (s)", e.target.value)}
                                                        className="w-full bg-transparent text-[var(--color-foreground-secondary)] focus:outline-none"
                                                    />
                                                </td>
                                                <td className="px-4 py-2">
                                                    <input 
                                                        type="number" 
                                                        step="0.1"
                                                        value={w["End (s)"]}
                                                        onChange={(e) => handleWordEdit(idx, "End (s)", e.target.value)}
                                                        className="w-full bg-transparent text-[var(--color-foreground-secondary)] focus:outline-none"
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="flex-1 flex items-center justify-center border border-dashed border-[var(--color-border-subtle)] rounded-md">
                                <p className="text-[var(--color-foreground-secondary)] text-sm">Upload a video to see the transcript here.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
