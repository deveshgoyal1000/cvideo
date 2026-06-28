import { useState, useEffect } from "react";
import { 
  Newspaper, 
  FileText, 
  Mic2, 
  Play, 
  Download, 
  RefreshCw, 
  Sparkles, 
  ArrowRight,
  TrendingUp,
  Clock,
  ExternalLink,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { generateShortScript, generateVoiceover, type NewsItem, type ShortScript } from "@/lib/gemini";

export default function App() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loadingNews, setLoadingNews] = useState(true);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [script, setScript] = useState<ShortScript | null>(null);
  const [generatingScript, setGeneratingScript] = useState(false);
  const [voiceoverUrl, setVoiceoverUrl] = useState<string | null>(null);
  const [generatingVoice, setGeneratingVoice] = useState(false);
  const [activeTab, setActiveTab] = useState("news");

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    setLoadingNews(true);
    try {
      const res = await fetch("/api/news");
      const data = await res.json();
      setNews(data);
    } catch (error) {
      toast.error("Failed to fetch latest AI news");
    } finally {
      setLoadingNews(false);
    }
  };

  const handleGenerateScript = async (item: NewsItem) => {
    setSelectedNews(item);
    setGeneratingScript(true);
    setActiveTab("script");
    try {
      const generatedScript = await generateShortScript(item);
      setScript(generatedScript);
      toast.success("Script generated successfully!");
    } catch (error) {
      toast.error("Failed to generate script");
    } finally {
      setGeneratingScript(false);
    }
  };

  const handleGenerateVoice = async () => {
    if (!script) return;
    setGeneratingVoice(true);
    try {
      const fullText = `${script.hook}. ${script.body.join(". ")}. ${script.cta}`;
      const base64Wav = await generateVoiceover(fullText);
      const url = `data:audio/wav;base64,${base64Wav}`;
      setVoiceoverUrl(url);
      toast.success("Voiceover synthesized!");
    } catch (error) {
      toast.error("Failed to synthesize voiceover");
    } finally {
      setGeneratingVoice(false);
    }
  };

  const downloadAudio = () => {
    if (!voiceoverUrl) return;
    const link = document.createElement("a");
    link.href = voiceoverUrl;
    link.download = `shorts-voiceover-${Date.now()}.wav`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 font-sans selection:bg-orange-500/30">
      <Toaster position="top-center" theme="dark" />
      
      {/* Sidebar Navigation */}
      <aside className="fixed left-0 top-0 h-full w-64 border-r border-zinc-800 bg-[#0d0d0d] hidden lg:flex flex-col p-6 z-50">
        <div className="flex items-center gap-2 mb-10">
          <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">ShortsGen <span className="text-orange-500">AI</span></h1>
        </div>

        <nav className="space-y-2 flex-1">
          <button 
            onClick={() => setActiveTab("news")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'news' ? 'bg-orange-500/10 text-orange-500' : 'hover:bg-zinc-800 text-zinc-400'}`}
          >
            <Newspaper className="w-5 h-5" />
            <span className="font-medium">News Feed</span>
          </button>
          <button 
            onClick={() => setActiveTab("script")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'script' ? 'bg-orange-500/10 text-orange-500' : 'hover:bg-zinc-800 text-zinc-400'}`}
          >
            <FileText className="w-5 h-5" />
            <span className="font-medium">Script Lab</span>
          </button>
          <button 
            onClick={() => setActiveTab("voice")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'voice' ? 'bg-orange-500/10 text-orange-500' : 'hover:bg-zinc-800 text-zinc-400'}`}
          >
            <Mic2 className="w-5 h-5" />
            <span className="font-medium">Voice Studio</span>
          </button>
        </nav>

        <div className="mt-auto pt-6 border-t border-zinc-800">
          <div className="bg-zinc-900/50 rounded-2xl p-4 border border-zinc-800">
            <p className="text-xs text-zinc-500 mb-2 uppercase tracking-wider font-semibold">Credits Remaining</p>
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold">Unlimited</span>
              <Badge variant="outline" className="border-orange-500/50 text-orange-500">PRO</Badge>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 p-4 md:p-8 lg:p-12 max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h2 className="text-3xl font-bold tracking-tight mb-1">
              {activeTab === 'news' && "Trending AI News"}
              {activeTab === 'script' && "Script Generation Lab"}
              {activeTab === 'voice' && "Voice Synthesis Studio"}
            </h2>
            <p className="text-zinc-500">
              {activeTab === 'news' && "Curated breakthroughs from the world of Artificial Intelligence."}
              {activeTab === 'script' && "Transforming news into high-retention video scripts."}
              {activeTab === 'voice' && "Professional human-like voiceovers for your content."}
            </p>
          </div>
          {activeTab === 'news' && (
            <Button 
              variant="outline" 
              onClick={fetchNews} 
              disabled={loadingNews}
              className="border-zinc-800 hover:bg-zinc-800"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loadingNews ? 'animate-spin' : ''}`} />
              Refresh Feed
            </Button>
          )}
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsContent value="news" className="mt-0 outline-none">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {loadingNews ? (
                Array(6).fill(0).map((_, i) => (
                  <Card key={i} className="bg-[#0d0d0d] border-zinc-800">
                    <CardHeader>
                      <Skeleton className="h-4 w-24 mb-2 bg-zinc-800" />
                      <Skeleton className="h-6 w-full bg-zinc-800" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-20 w-full bg-zinc-800" />
                    </CardContent>
                  </Card>
                ))
              ) : (
                news.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Card className="bg-[#0d0d0d] border-zinc-800 hover:border-orange-500/50 transition-all group flex flex-col h-full">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="secondary" className="bg-zinc-800 text-zinc-400 font-normal">
                            {item.source}
                          </Badge>
                          <div className="flex items-center text-xs text-zinc-500">
                            <Clock className="w-3 h-3 mr-1" />
                            {new Date(item.pubDate).toLocaleDateString()}
                          </div>
                        </div>
                        <CardTitle className="text-lg leading-snug group-hover:text-orange-500 transition-colors">
                          {item.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="flex-1">
                        <p className="text-zinc-400 text-sm line-clamp-3 leading-relaxed">
                          {item.contentSnippet}
                        </p>
                      </CardContent>
                      <CardFooter className="pt-0 flex gap-2">
                        <Button 
                          className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
                          onClick={() => handleGenerateScript(item)}
                        >
                          Generate Script
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-zinc-500 hover:text-zinc-100" asChild>
                          <a href={item.link} target="_blank" rel="noreferrer">
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="script" className="mt-0 outline-none">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <Card className="bg-[#0d0d0d] border-zinc-800 overflow-hidden">
                  <div className="h-1 bg-orange-600" />
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-orange-500" />
                        Script Editor
                      </CardTitle>
                      {script && (
                        <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Optimized
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {generatingScript ? (
                      <div className="space-y-4">
                        <Skeleton className="h-12 w-full bg-zinc-800" />
                        <Skeleton className="h-32 w-full bg-zinc-800" />
                        <Skeleton className="h-12 w-full bg-zinc-800" />
                      </div>
                    ) : script ? (
                      <div className="space-y-6">
                        <div className="p-4 bg-zinc-900/50 rounded-xl border border-zinc-800">
                          <p className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-2">The Hook (0-3s)</p>
                          <p className="text-lg font-medium italic">"{script.hook}"</p>
                        </div>
                        
                        <div className="space-y-3">
                          <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">The Core Body (3-50s)</p>
                          {script.body.map((line, i) => (
                            <div key={i} className="flex gap-4 p-3 hover:bg-zinc-800/30 rounded-lg transition-colors">
                              <span className="text-orange-500 font-mono text-sm">{String(i + 1).padStart(2, '0')}</span>
                              <p className="text-zinc-300">{line}</p>
                            </div>
                          ))}
                        </div>

                        <div className="p-4 bg-zinc-900/50 rounded-xl border border-zinc-800">
                          <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">The Call to Action (50-60s)</p>
                          <p className="text-zinc-300">"{script.cta}"</p>
                        </div>
                      </div>
                    ) : (
                      <div className="py-20 text-center">
                        <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-zinc-800">
                          <FileText className="w-8 h-8 text-zinc-700" />
                        </div>
                        <h3 className="text-lg font-medium text-zinc-400">No script generated yet</h3>
                        <p className="text-zinc-600 text-sm max-w-xs mx-auto mt-1">Select a news item from the feed to start generating your viral script.</p>
                      </div>
                    )}
                  </CardContent>
                  {script && (
                    <CardFooter className="bg-zinc-900/30 border-t border-zinc-800 p-4">
                      <Button 
                        className="w-full bg-orange-600 hover:bg-orange-700"
                        onClick={() => setActiveTab("voice")}
                      >
                        Proceed to Voice Studio
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </CardFooter>
                  )}
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="bg-[#0d0d0d] border-zinc-800">
                  <CardHeader>
                    <CardTitle className="text-sm font-bold uppercase tracking-wider text-zinc-500">Source Context</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedNews ? (
                      <div className="space-y-4">
                        <h4 className="font-bold text-zinc-200">{selectedNews.title}</h4>
                        <p className="text-sm text-zinc-400 leading-relaxed">{selectedNews.contentSnippet}</p>
                        <Separator className="bg-zinc-800" />
                        <div className="flex items-center justify-between text-xs text-zinc-500">
                          <span>Source: {selectedNews.source}</span>
                          <a href={selectedNews.link} target="_blank" rel="noreferrer" className="text-orange-500 hover:underline flex items-center">
                            Read Original <ExternalLink className="w-3 h-3 ml-1" />
                          </a>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-zinc-600 italic">Select news to see context</p>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-[#0d0d0d] border-zinc-800">
                  <CardHeader>
                    <CardTitle className="text-sm font-bold uppercase tracking-wider text-zinc-500">Optimization Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-zinc-400">Estimated Length</span>
                      <span className="text-sm font-mono text-orange-500">45-55s</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-zinc-400">Engagement Score</span>
                      <span className="text-sm font-mono text-green-500">High</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-zinc-400">Target Platform</span>
                      <span className="text-sm font-mono text-blue-500">Shorts/Reels</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="voice" className="mt-0 outline-none">
            <div className="max-w-2xl mx-auto">
              <Card className="bg-[#0d0d0d] border-zinc-800 overflow-hidden">
                <div className="h-1 bg-orange-600" />
                <CardHeader className="text-center">
                  <div className="w-20 h-20 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-orange-500/20">
                    <Mic2 className="w-10 h-10 text-orange-500" />
                  </div>
                  <CardTitle className="text-2xl">Voice Synthesis</CardTitle>
                  <CardDescription>Using Gemini 2.5 Flash "Fenrir" for high-fidelity voice generation.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  <div className="p-6 bg-zinc-900/50 rounded-2xl border border-zinc-800 text-center">
                    {generatingVoice ? (
                      <div className="space-y-4 py-4">
                        <div className="flex justify-center gap-1">
                          {[0, 1, 2, 3, 4].map(i => (
                            <motion.div 
                              key={i}
                              animate={{ height: [10, 30, 10] }}
                              transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.1 }}
                              className="w-1 bg-orange-500 rounded-full"
                            />
                          ))}
                        </div>
                        <p className="text-sm text-zinc-500 animate-pulse">Synthesizing human-like voiceover...</p>
                      </div>
                    ) : voiceoverUrl ? (
                      <div className="space-y-6">
                        <div className="flex items-center justify-center gap-4">
                          <audio controls src={voiceoverUrl} className="w-full max-w-md accent-orange-500" />
                        </div>
                        <div className="flex gap-4">
                          <Button 
                            variant="outline" 
                            className="flex-1 border-zinc-800 hover:bg-zinc-800"
                            onClick={() => setVoiceoverUrl(null)}
                          >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Regenerate
                          </Button>
                          <Button 
                            className="flex-1 bg-orange-600 hover:bg-orange-700"
                            onClick={downloadAudio}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download .WAV
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="py-6">
                        <Button 
                          size="lg"
                          disabled={!script || generatingVoice}
                          className="bg-orange-600 hover:bg-orange-700 px-10"
                          onClick={handleGenerateVoice}
                        >
                          <Sparkles className="w-5 h-5 mr-2" />
                          Generate Voiceover
                        </Button>
                        {!script && (
                          <p className="text-xs text-zinc-600 mt-4 flex items-center justify-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            Please generate a script first
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-zinc-900/30 rounded-xl border border-zinc-800">
                      <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Voice Profile</p>
                      <p className="font-bold">Fenrir (Male)</p>
                    </div>
                    <div className="p-4 bg-zinc-900/30 rounded-xl border border-zinc-800">
                      <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Sample Rate</p>
                      <p className="font-bold">24.0 kHz</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Mobile Navigation */}
      <nav className="fixed bottom-0 left-0 w-full bg-[#0d0d0d] border-t border-zinc-800 flex lg:hidden justify-around p-4 z-50">
        <button onClick={() => setActiveTab("news")} className={`p-2 ${activeTab === 'news' ? 'text-orange-500' : 'text-zinc-500'}`}>
          <Newspaper className="w-6 h-6" />
        </button>
        <button onClick={() => setActiveTab("script")} className={`p-2 ${activeTab === 'script' ? 'text-orange-500' : 'text-zinc-500'}`}>
          <FileText className="w-6 h-6" />
        </button>
        <button onClick={() => setActiveTab("voice")} className={`p-2 ${activeTab === 'voice' ? 'text-orange-500' : 'text-zinc-500'}`}>
          <Mic2 className="w-6 h-6" />
        </button>
      </nav>
    </div>
  );
}
