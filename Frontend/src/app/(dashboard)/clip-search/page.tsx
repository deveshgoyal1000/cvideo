"use client";

import React, { useState, useRef } from "react";
import { Search, Film, Download, Loader2, Sparkles, Clock, Scissors, X, Play } from "lucide-react";

export default function ClipSearchPage() {
  const [keyword, setKeyword] = useState("");
  const [duration, setDuration] = useState(25);
  const [loading, setLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [clipCount, setClipCount] = useState(0);
  const [error, setError] = useState("");
  const [searchedKeyword, setSearchedKeyword] = useState("");
  const [expandedKeyword, setExpandedKeyword] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const popularTags = ["Robot", "Space", "Coding", "Nature", "City", "Ocean", "Fire", "Technology", "Cars", "Dancing", "Cooking", "Rain"];

  const handleSearch = async () => {
    const trimmed = keyword.trim();
    if (!trimmed) return;

    setLoading(true);
    setError("");
    setVideoUrl(null);
    setClipCount(0);
    setSearchedKeyword(trimmed);

    try {
      const res = await fetch("http://localhost:8000/api/search-clips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword: trimmed, duration }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.detail || `Server error (${res.status})`);
        setLoading(false);
        return;
      }

      if (data.status === "success") {
        setVideoUrl(`data:${data.mimeType};base64,${data.videoBase64}`);
        setClipCount(data.clipCount || 0);
        setExpandedKeyword(data.search_expanded || null);
      } else {
        setError("Unexpected response from server.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to connect to backend. Is it running on port 8000?");
    }
    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !loading) handleSearch();
  };

  const handleTagClick = (tag: string) => {
    setKeyword(tag);
    // Auto-search
    setTimeout(() => {
      const trimmed = tag.trim();
      if (!trimmed) return;
      setLoading(true);
      setError("");
      setVideoUrl(null);
      setClipCount(0);
      setSearchedKeyword(trimmed);

      fetch("http://localhost:8000/api/search-clips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword: trimmed, duration }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.status === "success") {
            setVideoUrl(`data:${data.mimeType};base64,${data.videoBase64}`);
            setClipCount(data.clipCount || 0);
            setExpandedKeyword(data.search_expanded || null);
          } else {
            setError(data.detail || "Search failed.");
          }
        })
        .catch(() => setError("Connection failed."))
        .finally(() => setLoading(false));
    }, 50);
  };

  return (
    <div className="min-h-screen">
      {/* Page Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-xl text-white shadow-lg shadow-violet-500/20">
            <Film size={22} />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[var(--color-foreground)]">
            Clip Search
          </h1>
        </div>
        <p className="text-[var(--color-foreground-secondary)] text-base ml-[52px]">
          Search any English word → get a combined 20-30s portrait video instantly.
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border-subtle)] rounded-2xl p-6 shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Input */}
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-foreground-secondary)]" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a word... (e.g. robot, ocean, fire)"
              className="w-full pl-11 pr-10 py-3.5 bg-[var(--color-background)] border border-[var(--color-border-subtle)] rounded-xl text-base text-[var(--color-foreground)] placeholder:text-[var(--color-foreground-secondary)]/50 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500/50 transition-all"
              disabled={loading}
            />
            {keyword && !loading && (
              <button
                onClick={() => setKeyword("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[var(--color-foreground-secondary)] hover:text-[var(--color-foreground)] transition-colors rounded-full hover:bg-[var(--color-background)]"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Duration Selector */}
          <div className="flex items-center gap-2 bg-[var(--color-background)] border border-[var(--color-border-subtle)] rounded-xl px-4 py-2 min-w-[160px]">
            <Clock size={16} className="text-[var(--color-foreground-secondary)] flex-shrink-0" />
            <select
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="bg-transparent text-[var(--color-foreground)] text-sm font-medium focus:outline-none cursor-pointer flex-1"
              disabled={loading}
            >
              <option value={15}>15 seconds</option>
              <option value={20}>20 seconds</option>
              <option value={25}>25 seconds</option>
              <option value={30}>30 seconds</option>
              <option value={45}>45 seconds</option>
              <option value={60}>60 seconds</option>
            </select>
          </div>

          {/* Search Button */}
          <button
            onClick={handleSearch}
            disabled={!keyword.trim() || loading}
            className="px-8 py-3.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30 hover:scale-[1.02] active:scale-[0.98]"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Scissors size={18} />
            )}
            {loading ? "Compiling..." : "Generate"}
          </button>
        </div>

        {/* Popular Tags */}
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="text-xs text-[var(--color-foreground-secondary)] font-medium self-center mr-1">Popular:</span>
          {popularTags.map((tag) => (
            <button
              key={tag}
              onClick={() => handleTagClick(tag)}
              disabled={loading}
              className="px-3 py-1.5 text-xs font-medium bg-[var(--color-background)] border border-[var(--color-border-subtle)] text-[var(--color-foreground-secondary)] rounded-lg hover:border-violet-500/40 hover:text-violet-500 hover:bg-violet-500/5 transition-all disabled:opacity-40"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Left: Status / Loading Animation */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border-subtle)] rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center min-h-[400px]">
          {loading ? (
            <div className="flex flex-col items-center gap-6 text-center animate-in fade-in duration-300">
              {/* Animated loader */}
              <div className="relative">
                <div className="w-24 h-24 rounded-full border-4 border-violet-500/20 border-t-violet-500 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Film size={28} className="text-violet-500" />
                </div>
              </div>
              <div>
                <p className="text-lg font-semibold text-[var(--color-foreground)] mb-1">
                  Searching &quot;{searchedKeyword}&quot;
                </p>
                <p className="text-sm text-[var(--color-foreground-secondary)]">
                  Fetching clips from Pexels, processing & combining...
                </p>
              </div>

              {/* Progress Steps */}
              <div className="space-y-3 w-full max-w-xs text-left">
                <LoadingStep text="Searching Pexels library" active />
                <LoadingStep text="Downloading HD clips" active />
                <LoadingStep text="Resizing to 1080×1920" active />
                <LoadingStep text="Combining into final video" active />
              </div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center gap-4 text-center animate-in fade-in duration-300">
              <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
                <X size={28} className="text-red-400" />
              </div>
              <div>
                <p className="text-base font-semibold text-red-400 mb-1">Search Failed</p>
                <p className="text-sm text-[var(--color-foreground-secondary)] max-w-sm">{error}</p>
              </div>
              <button
                onClick={handleSearch}
                className="mt-2 px-5 py-2 text-sm bg-[var(--color-background)] border border-[var(--color-border-subtle)] rounded-lg hover:border-violet-500/30 transition-colors text-[var(--color-foreground)]"
              >
                Try again
              </button>
            </div>
          ) : videoUrl ? (
            <div className="flex flex-col items-center gap-4 text-center animate-in fade-in duration-500">
              <div className="w-14 h-14 rounded-full bg-green-500/10 flex items-center justify-center">
                <Sparkles size={24} className="text-green-400" />
              </div>
              <div>
                <p className="text-lg font-bold text-[var(--color-foreground)]">Video Ready!</p>
                <p className="text-sm text-[var(--color-foreground-secondary)]">
                  Combined <span className="font-semibold text-violet-400">{clipCount} clips</span> for &quot;{searchedKeyword}&quot;
                </p>
                {expandedKeyword && expandedKeyword.toLowerCase() !== searchedKeyword.toLowerCase() && (
                  <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-violet-500/10 border border-violet-500/20 rounded-full">
                    <Sparkles size={12} className="text-violet-400" />
                    <span className="text-[10px] font-medium text-violet-400 uppercase tracking-wider">AI Expanded: {expandedKeyword}</span>
                  </div>
                )}
              </div>
              <div className="flex gap-3 mt-2">
                <a
                  href={videoUrl}
                  download={`${searchedKeyword}_clips.mp4`}
                  className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-semibold rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-violet-500/20 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Download size={16} /> Download MP4
                </a>
                <button
                  onClick={() => videoRef.current?.play()}
                  className="px-5 py-2.5 bg-[var(--color-background)] border border-[var(--color-border-subtle)] text-[var(--color-foreground)] font-medium rounded-xl flex items-center gap-2 hover:border-violet-500/30 transition-all"
                >
                  <Play size={16} /> Play
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 text-center opacity-60">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 flex items-center justify-center">
                <Search size={32} className="text-violet-400" />
              </div>
              <div>
                <p className="text-base font-semibold text-[var(--color-foreground)]">
                  Search for any keyword
                </p>
                <p className="text-sm text-[var(--color-foreground-secondary)] max-w-xs">
                  Type an English word and we&apos;ll find matching clips, combine them into a seamless portrait video.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right: Video Preview */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border-subtle)] rounded-2xl p-6 shadow-sm flex items-center justify-center min-h-[400px]">
          {videoUrl ? (
            <div className="w-full flex flex-col items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="relative w-full max-w-[280px] rounded-2xl overflow-hidden shadow-2xl shadow-black/30 border border-white/5">
                <video
                  ref={videoRef}
                  src={videoUrl}
                  controls
                  className="w-full"
                  style={{ aspectRatio: "9/16" }}
                  playsInline
                />
                {/* Gradient overlay at top */}
                <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-black/30 to-transparent pointer-events-none" />
              </div>
              <p className="text-xs text-[var(--color-foreground-secondary)]">
                {duration}s • {clipCount} clips • 1080×1920
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 opacity-30">
              <div className="w-[200px] rounded-2xl bg-[var(--color-background)] border border-[var(--color-border-subtle)] overflow-hidden" style={{ aspectRatio: "9/16" }}>
                <div className="w-full h-full flex items-center justify-center">
                  <Film size={40} className="text-[var(--color-foreground-secondary)]" />
                </div>
              </div>
              <p className="text-xs text-[var(--color-foreground-secondary)]">Video preview</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function LoadingStep({ text, active }: { text: string; active: boolean }) {
  return (
    <div className="flex items-center gap-3">
      {active ? (
        <div className="w-5 h-5 rounded-full border-2 border-violet-500/30 border-t-violet-500 animate-spin flex-shrink-0" />
      ) : (
        <div className="w-5 h-5 rounded-full bg-[var(--color-border-subtle)] flex-shrink-0" />
      )}
      <span className={`text-sm ${active ? "text-[var(--color-foreground)]" : "text-[var(--color-foreground-secondary)]"}`}>
        {text}
      </span>
    </div>
  );
}
