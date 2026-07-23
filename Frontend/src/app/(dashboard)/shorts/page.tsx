"use client";

import React, { useState, useEffect } from "react";
import { Mic, FileText, Zap, Play, Download, Loader2, RefreshCw } from "lucide-react";

export default function ShortsGenerator() {
  const [news, setNews] = useState<{ title: string; summary: string }[]>([]);
  const [loadingNews, setLoadingNews] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  const [scriptText, setScriptText] = useState("");
  const [generatingScript, setGeneratingScript] = useState(false);

  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [generatingAudio, setGeneratingAudio] = useState(false);

  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [generatingVideo, setGeneratingVideo] = useState(false);

  const [runningAll, setRunningAll] = useState(false);

  const fetchNews = async () => {
    setLoadingNews(true);
    try {
      // Append a timestamp to perfectly bust the browser cache!
      const res = await fetch(`https://cvideo-nlxn.onrender.com/api/fetch-news?t=${new Date().getTime()}`);
      const data = await res.json();
      if (data.status === "success") {
        setNews(data.data);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to connect to backend. Please ensure the backend is running on port 8000.");
    }
    setLoadingNews(false);
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const [scriptError, setScriptError] = useState("");

  const handleGenerateScript = async (topic: { title: string; summary: string }) => {
    setSelectedTopic(topic.title);
    setGeneratingScript(true);
    setScriptError("");
    try {
      const res = await fetch("https://cvideo-nlxn.onrender.com/api/generate-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ news_text: topic.title + " " + topic.summary }),
      });
      const data = await res.json();
      if (data.script) {
        setScriptText(data.script);
      } else if (!res.ok) {
        setScriptError(`Backend error (${res.status}): ${data.detail || "Unknown error"}`);
      } else {
        setScriptError("Script generation returned an empty response.");
      }
    } catch (err) {
      console.error(err);
      setScriptError("Failed to connect to backend. Is it running on port 8000?");
    }
    setGeneratingScript(false);
  };

  const handleRunAll = async (topic: { title: string; summary: string }) => {
    setSelectedTopic(topic.title);
    setRunningAll(true);
    setGeneratingScript(true);
    setScriptError("");
    setAudioUrl(null);
    setVideoUrl(null);

    try {
      // 1. Script
      const scriptRes = await fetch("https://cvideo-nlxn.onrender.com/api/generate-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ news_text: topic.title + " " + topic.summary }),
      });
      const scriptData = await scriptRes.json();
      
      if (!scriptData.script) {
        setScriptError("Script generation failed during Run All.");
        setGeneratingScript(false);
        setRunningAll(false);
        return;
      }
      const generatedScript = scriptData.script;
      setScriptText(generatedScript);
      setGeneratingScript(false);

      // 2. Audio
      setGeneratingAudio(true);
      const audioRes = await fetch("https://cvideo-nlxn.onrender.com/api/generate-audio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ script_text: generatedScript, voice: "Fenrir" }),
      });
      const audioData = await audioRes.json();
      
      if (audioData.status !== "success") {
        alert("Audio generation failed during Run All.");
        setGeneratingAudio(false);
        setRunningAll(false);
        return;
      }
      const audioBase64 = audioData.audioBase64;
      const generatedAudioUrl = `data:${audioData.mimeType};base64,${audioBase64}`;
      setAudioUrl(generatedAudioUrl);
      setGeneratingAudio(false);

      // 3. Video
      setGeneratingVideo(true);
      const videoRes = await fetch("https://cvideo-nlxn.onrender.com/api/generate-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ script_text: generatedScript, audio_base64: audioBase64 }),
      });
      const videoData = await videoRes.json();
      
      if (videoData.status === "success") {
        setVideoUrl(`data:${videoData.mimeType};base64,${videoData.videoBase64}`);
      } else {
        alert("Video generation failed during Run All.");
      }
      setGeneratingVideo(false);
    } catch (err) {
      console.error(err);
      alert("Network error during Run All.");
      setGeneratingScript(false);
      setGeneratingAudio(false);
      setGeneratingVideo(false);
    }
    setRunningAll(false);
  };

  const handleGenerateAudio = async () => {
    if (!scriptText) return;
    setGeneratingAudio(true);
    setAudioUrl(null);
    try {
      const res = await fetch("https://cvideo-nlxn.onrender.com/api/generate-audio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ script_text: scriptText, voice: "Fenrir" }),
      });
      const data = await res.json();
      if (data.status === "success") {
        const audioSrc = `data:${data.mimeType};base64,${data.audioBase64}`;
        setAudioUrl(audioSrc);
      }
    } catch (err) {
      console.error(err);
    }
    setGeneratingAudio(false);
  };

  const handleGenerateVideo = async () => {
    if (!audioUrl || !scriptText) return;
    setGeneratingVideo(true);
    setVideoUrl(null);
    try {
      const audioBase64 = audioUrl.split(',')[1];
      const res = await fetch("https://cvideo-nlxn.onrender.com/api/generate-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ script_text: scriptText, audio_base64: audioBase64 }),
      });
      const data = await res.json();
      if (data.status === "success") {
        const videoSrc = `data:${data.mimeType};base64,${data.videoBase64}`;
        setVideoUrl(videoSrc);
      } else {
        alert("Failed to render video: " + (data.detail || JSON.stringify(data)));
      }
    } catch (err) {
      console.error(err);
      alert("Compilation timeout or backend error.");
    }
    setGeneratingVideo(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-8">
      <header className="mb-10">
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent flex items-center gap-3">
          <Zap className="w-8 h-8 text-yellow-400" />
          AI Shorts Generator
        </h1>
        <p className="text-gray-400 mt-2">Automatically transform AI news into viral YouTube Shorts.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Trending News */}
        <section className="bg-[#111] border border-gray-800 rounded-2xl p-6 shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <FileText className="w-6 h-6 text-orange-400" />
              Trending AI News
            </h2>
            <button
              onClick={fetchNews}
              className="p-2 bg-gray-800 hover:bg-gray-700 rounded-full transition"
            >
              <RefreshCw className={`w-4 h-4 ${loadingNews ? "animate-spin" : ""}`} />
            </button>
          </div>

          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {loadingNews ? (
              <div className="flex justify-center py-10">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
              </div>
            ) : news.length > 0 ? (
              news.map((item, i) => (
                <div key={i} className="bg-gradient-to-br from-gray-900 to-[#1a1a1a] p-4 rounded-xl border border-gray-800 hover:border-yellow-500/30 transition group">
                  <h3 className="font-semibold text-lg text-gray-100 group-hover:text-yellow-400 transition">{item.title}</h3>
                  <p className="text-sm text-gray-500 mt-2 line-clamp-2">{item.summary.replace(/<[^>]+>/g, '')}</p>
                  
                  <div className="mt-6 flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => handleGenerateScript(item)}
                      disabled={runningAll || generatingScript}
                      className="flex-1 text-sm font-medium bg-gray-800 hover:bg-yellow-500 hover:text-black py-2.5 px-4 rounded-xl transition disabled:opacity-50"
                    >
                      Step 1: Script
                    </button>
                    <button
                      onClick={() => handleRunAll(item)}
                      disabled={runningAll || generatingScript}
                      className="flex-1 text-sm font-bold bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400 text-white py-2.5 px-4 rounded-xl shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {runningAll && selectedTopic === item.title ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Zap className="w-4 h-4 text-white" />
                      )}
                      {runningAll && selectedTopic === item.title ? "Running All..." : "Run All (Auto)"}
                    </button>
                  </div>

                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-10">No news found.</p>
            )}
          </div>
        </section>

        {/* Right Column: Studio (Script + Audio) */}
        <section className="space-y-6">
          {/* Script Editor */}
          <div className="bg-[#111] border border-gray-800 rounded-2xl p-6 shadow-2xl">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Mic className="w-6 h-6 text-yellow-400" />
              Script Studio
            </h2>
            
            {generatingScript ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4 text-orange-400">
                <Loader2 className="w-10 h-10 animate-spin" />
                <p>Writing viral script...</p>
              </div>
            ) : scriptError ? (
              <div className="flex flex-col items-center justify-center py-10 gap-3">
                <p className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/30 rounded-xl p-4 w-full">{scriptError}</p>
                <p className="text-gray-500 text-xs">Tip: Your daily Gemini quota may be exhausted. Try again tomorrow or use a new API key.</p>
              </div>
            ) : (
              <>
                <textarea
                  value={scriptText}
                  onChange={(e) => setScriptText(e.target.value)}
                  placeholder="Select a trending news topic or paste your manual script here..."
                  className="w-full h-64 bg-black border border-gray-800 rounded-xl p-4 text-gray-200 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 resize-none transition"
                />
                
                <div className="mt-4 flex justify-between items-center">
                  <p className="text-xs text-gray-500">
                    {scriptText.split(' ').filter(w => w.length > 0).length} words ~ {Math.round(scriptText.split(' ').length / 2.5)} seconds read time.
                  </p>
                  <button
                    onClick={handleGenerateAudio}
                    disabled={!scriptText || generatingAudio || runningAll}
                    className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-bold py-2 px-6 rounded-xl flex items-center gap-2 transition disabled:opacity-50"
                  >
                    {generatingAudio ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
                    Generate 'Rahul' Voice
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Audio Output */}
          {audioUrl && (
            <div className="bg-[#111] border border-yellow-500/50 rounded-2xl p-6 shadow-[0_0_20px_rgba(234,179,8,0.1)] relative overflow-hidden mt-6">
              <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 blur-3xl -mr-10 -mt-10"></div>
              <h2 className="text-xl font-bold mb-4 z-10 relative">Final Audio</h2>
              <div className="relative z-10 flex flex-col gap-4">
                <audio src={audioUrl} controls className="w-full h-12" />
                <div className="flex gap-4">
                  <a
                    href={audioUrl}
                    download="AI_Shorts_Rahul.mp3"
                    className="flex flex-1 items-center justify-center gap-2 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl transition"
                  >
                    <Download className="w-5 h-5" /> Download Audio
                  </a>
                  <button
                    onClick={handleGenerateVideo}
                    disabled={generatingVideo || runningAll}
                    className="flex flex-1 items-center justify-center gap-2 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 font-bold text-white rounded-xl transition disabled:opacity-50"
                  >
                    {generatingVideo ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
                    Compile Final Shorts Video
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Video Output */}
          {videoUrl && (
             <div className="bg-[#111] border border-blue-500/50 rounded-2xl p-6 shadow-[0_0_20px_rgba(59,130,246,0.15)] mt-6 text-center">
                <h2 className="text-xl font-bold mb-4 text-blue-400">Ready for YouTube!</h2>
                <video src={videoUrl} controls className="w-full max-w-[350px] mx-auto rounded-xl shadow-2xl" style={{ aspectRatio: '9/16' }} />
                <a
                  href={videoUrl}
                  download="Final_AI_Short.mp4"
                  className="mt-6 flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-500 font-bold text-white rounded-xl transition"
                >
                  <Download className="w-5 h-5" /> Download MP4 Video
                </a>
             </div>
          )}
        </section>
      </div>
    </div>
  );
}
