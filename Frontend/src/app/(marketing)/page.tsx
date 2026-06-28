import Link from "next/link";
import { ArrowRight, Bot, Clock, Video, TrendingUp, CheckCircle2, Star, Zap, Shield, Sparkles } from "lucide-react";
import { FadeIn } from "@/components/animations/FadeIn";
import { StaggerContainer, StaggerItem } from "@/components/animations/StaggerContainer";
import { HeroBackground } from "@/components/animations/HeroBackground";
export default function Home() {
    return (
        <div className="flex flex-col min-h-screen">

            {/* Hero Section */}
            <section className="relative overflow-hidden pt-24 pb-32 flex flex-col items-center text-center px-6">
                <HeroBackground />

                <FadeIn delay={0.1} direction="up" className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-[var(--color-primary)] dark:text-blue-300 text-sm font-medium mb-8">
                    <span className="relative flex h-1.5 w-1.5 ml-1">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
                    </span>
                    <span>Introducing TheSpinity AI Shorts</span>
                </FadeIn>

                <FadeIn delay={0.2} direction="up">
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-[var(--color-foreground)] max-w-5xl lg:max-w-6xl mx-auto mb-6 leading-tight">
                        Create viral <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-primary)] to-blue-400">Shorts</span> <br />
                        <span className="whitespace-nowrap">in just seconds</span> <br />
                        <span className="whitespace-nowrap text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-primary)] to-blue-400">Grow your channel 24/7</span>
                    </h1>
                </FadeIn>

                <FadeIn delay={0.3} direction="up">
                    <p className="text-base md:text-lg text-[var(--color-foreground-secondary)] max-w-2xl mx-auto mb-10">
                        An intelligent AI platform that curates trending news, writes engaging scripts, and synthesizes them into high-quality human-like voiceovers instantly.
                    </p>
                </FadeIn>

                <FadeIn delay={0.4} direction="up" className="flex flex-col sm:flex-row items-center gap-4">
                    <Link href="/shorts" className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[var(--color-primary)] text-white font-semibold text-lg hover:bg-blue-700 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/20 transition-all flex items-center justify-center gap-2 group">
                        Try Generator Now
                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link href="#how-it-works" className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border-subtle)] text-[var(--color-foreground)] font-semibold text-lg hover:bg-gray-50 dark:hover:bg-gray-800 hover:scale-105 transition-all flex items-center justify-center gap-2 shadow-sm">
                        <Video size={20} className="text-[var(--color-foreground-secondary)]" />
                        See how it works
                    </Link>
                </FadeIn>
            </section>

            {/* Spacer after Hero */}
            <div className="h-12 w-full bg-[var(--color-background)]"></div>

            {/* Trust Indicators */}
            <section className="py-12 border-y border-[var(--color-border-subtle)] bg-[var(--color-surface)]">
                <FadeIn direction="up" delay={0.2} className="container mx-auto px-6 text-center">
                    <p className="text-sm font-semibold text-[var(--color-foreground-secondary)] uppercase tracking-wider mb-8">Trusted by 500+ local businesses</p>
                    <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-60 grayscale">
                        {/* Logos placeholders */}
                        <div className="text-xl font-bold flex items-center gap-2"><div className="w-6 h-6 bg-current rounded-sm"></div>LuxeSpa</div>
                        <div className="text-xl font-bold flex items-center gap-2"><div className="w-6 h-6 bg-current rounded-full"></div>PrimeDental</div>
                        <div className="text-xl font-bold flex items-center gap-2"><div className="w-6 h-6 bg-current rounded-tl-lg rounded-br-lg"></div>AutoFixers</div>
                        <div className="text-xl font-bold flex items-center gap-2"><div className="w-6 h-6 bg-current rotate-45"></div>EliteLaw</div>
                    </div>
                </FadeIn>
            </section>

            {/* Benefits Section */}
            <section className="py-24 bg-[var(--color-background)]">
                <div className="container mx-auto px-6 max-w-6xl">
                    <FadeIn direction="up" className="text-center mb-16 max-w-3xl mx-auto">
                        <h2 className="text-3xl md:text-4xl font-bold mb-6 text-[var(--color-foreground)] tracking-tight">Everything a content creator needs.</h2>
                        <p className="text-base md:text-lg text-[var(--color-foreground-secondary)]">
                            TheSpinity doesn&apos;t just generate generic text—it crafts highly engaging hooks, writes pacing suited for videos, and synthesizes voices that sound identically human.
                        </p>
                    </FadeIn>

                    <StaggerContainer staggerDelay={0.15} className="grid md:grid-cols-3 gap-8">
                        <StaggerItem className="bg-[var(--color-surface)] p-8 rounded-2xl border border-[var(--color-border-subtle)] shadow-sm hover:shadow-md hover:-translate-y-1 transition-all">
                            <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 text-[var(--color-primary)] flex items-center justify-center rounded-xl mb-6">
                                <Sparkles size={20} />
                            </div>
                            <h3 className="text-lg font-bold mb-3 text-[var(--color-foreground)]">AI Trending Curation</h3>
                            <p className="text-sm text-[var(--color-foreground-secondary)] leading-relaxed">No more scanning feeds. Our AI engine curates the latest, most engaging AI news automatically for you to pick from.</p>
                        </StaggerItem>

                        <StaggerItem className="bg-[var(--color-surface)] p-8 rounded-2xl border border-[var(--color-border-subtle)] shadow-sm hover:shadow-md hover:-translate-y-1 transition-all">
                            <div className="w-10 h-10 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 flex items-center justify-center rounded-xl mb-6">
                                <Zap size={20} />
                            </div>
                            <h3 className="text-lg font-bold mb-3 text-[var(--color-foreground)]">Generate in Seconds</h3>
                            <p className="text-sm text-[var(--color-foreground-secondary)] leading-relaxed">Convert a single news headline into a fully-fledged 60-second YouTube shorts script with captivating hooks.</p>
                        </StaggerItem>

                        <StaggerItem className="bg-[var(--color-surface)] p-8 rounded-2xl border border-[var(--color-border-subtle)] shadow-sm hover:shadow-md hover:-translate-y-1 transition-all">
                            <div className="w-10 h-10 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 flex items-center justify-center rounded-xl mb-6">
                                <Bot size={20} />
                            </div>
                            <h3 className="text-lg font-bold mb-3 text-[var(--color-foreground)]">Ultra-Realistic Voiceover</h3>
                            <p className="text-sm text-[var(--color-foreground-secondary)] leading-relaxed">Instantly synthesize your script into high-quality audio using advanced voice models like Gemini 2.5 Flash Native.</p>
                        </StaggerItem>
                    </StaggerContainer>
                </div>
            </section>

            {/* How it Works */}
            <section id="how-it-works" className="py-24 bg-[var(--color-surface)] border-y border-[var(--color-border-subtle)]">
                <div className="container mx-auto px-6 max-w-6xl">
                    <div className="flex flex-col md:flex-row gap-16 items-center">

                        <FadeIn direction="right" className="flex-1 space-y-8">
                            <div>
                                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[var(--color-foreground)] tracking-tight">How TheSpinity Works</h2>
                                <p className="text-base md:text-lg text-[var(--color-foreground-secondary)]">From idea to voiceover in less than 60 seconds.</p>
                            </div>

                            <StaggerContainer staggerDelay={0.2} className="space-y-6">
                                <StaggerItem className="flex gap-4">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--color-foreground)] text-[var(--color-surface)] flex items-center justify-center font-bold text-sm">1</div>
                                    <div>
                                        <h3 className="text-lg font-bold mb-1 text-[var(--color-foreground)]">Select a news topic</h3>
                                        <p className="text-sm text-[var(--color-foreground-secondary)] shrink">Our dashboard pulls in the latest trending headlines. Pick the one that fits your channel&apos;s vibe.</p>
                                    </div>
                                </StaggerItem>

                                <StaggerItem className="flex gap-4">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--color-foreground)] text-[var(--color-surface)] flex items-center justify-center font-bold text-sm">2</div>
                                    <div>
                                        <h3 className="text-lg font-bold mb-1 text-[var(--color-foreground)]">AI creates the script</h3>
                                        <p className="text-sm text-[var(--color-foreground-secondary)] shrink">Using Gemini 2.5, we instantly generate a dynamic, fast-paced script perfectly formatted for shorts.</p>
                                    </div>
                                </StaggerItem>

                                <StaggerItem className="flex gap-4">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--color-foreground)] text-[var(--color-surface)] flex items-center justify-center font-bold text-sm">3</div>
                                    <div>
                                        <h3 className="text-lg font-bold mb-1 text-[var(--color-foreground)]">Synthesize Voiceover</h3>
                                        <p className="text-sm text-[var(--color-foreground-secondary)] shrink">Click a button, and &apos;Fenrir&apos;—our ultra-realistic AI voice—speaks your script with perfect emotion and cadence.</p>
                                    </div>
                                </StaggerItem>
                            </StaggerContainer>
                        </FadeIn>

                        <FadeIn direction="left" delay={0.3} className="flex-1 w-full flex justify-center lg:justify-end">
                            <div className="w-full max-w-[400px] aspect-[9/16] bg-gray-100 dark:bg-gray-800 rounded-3xl border-8 border-gray-900 overflow-hidden relative shadow-2xl">
                                <div className="absolute inset-0 bg-gradient-to-b from-blue-500/20 to-purple-500/20" />
                                <div className="absolute bottom-10 left-6 right-6">
                                    <div className="bg-black/50 backdrop-blur-md rounded-xl p-4 border border-white/10">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="h-6 w-6 rounded-full bg-[var(--color-primary)]"></div>
                                            <div className="h-2 w-24 bg-white/50 rounded-full"></div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="h-2 w-full bg-white/30 rounded-full"></div>
                                            <div className="h-2 w-3/4 bg-white/30 rounded-full"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </FadeIn>

                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-24 bg-[var(--color-background)]">
                <div className="container mx-auto px-6 max-w-6xl">
                    <FadeIn direction="up" className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[var(--color-foreground)] tracking-tight">Loved by Content Creators</h2>
                        <p className="text-base md:text-lg text-[var(--color-foreground-secondary)] max-w-2xl mx-auto">
                            See what YouTubers are saying about how TheSpinity scaled their output.
                        </p>
                    </FadeIn>

                    <StaggerContainer staggerDelay={0.2} className="grid md:grid-cols-2 gap-6">
                        <StaggerItem className="bg-[var(--color-surface)] p-8 rounded-2xl border border-[var(--color-border-subtle)] hover:border-[var(--color-primary)] transition-colors duration-300">
                            <div className="flex text-amber-400 mb-4"><Star fill="currentColor" size={16} /><Star fill="currentColor" size={16} /><Star fill="currentColor" size={16} /><Star fill="currentColor" size={16} /><Star fill="currentColor" size={16} /></div>
                            <p className="text-base text-[var(--color-foreground)] font-medium mb-6">&quot;I used to take 3 hours per Short between research, scripting, and voice recording. Now I produce 5 highly-engaging Shorts in 30 minutes!&quot;</p>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center font-bold text-gray-500 text-xs">AI</div>
                                <div>
                                    <p className="font-semibold text-sm text-[var(--color-foreground)]">AI Insider</p>
                                    <p className="text-xs text-[var(--color-foreground-secondary)]">200K Subscribers</p>
                                </div>
                            </div>
                        </StaggerItem>

                        <StaggerItem className="bg-[var(--color-surface)] p-8 rounded-2xl border border-[var(--color-border-subtle)] hover:border-[var(--color-primary)] transition-colors duration-300">
                            <div className="flex text-amber-400 mb-4"><Star fill="currentColor" size={16} /><Star fill="currentColor" size={16} /><Star fill="currentColor" size={16} /><Star fill="currentColor" size={16} /><Star fill="currentColor" size={16} /></div>
                            <p className="text-base text-[var(--color-foreground)] font-medium mb-6">&quot;The pacing and hooks generated by Gemini are crazy good. My retention rate went up by 15% and the synthesized voice sounds literally identical to a human.&quot;</p>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center font-bold text-gray-500 text-xs">TD</div>
                                <div>
                                    <p className="font-semibold text-sm text-[var(--color-foreground)]">Tech Daily</p>
                                    <p className="text-xs text-[var(--color-foreground-secondary)]">Tech Creator</p>
                                </div>
                            </div>
                        </StaggerItem>
                    </StaggerContainer>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-24 bg-[var(--color-surface)] border-t border-[var(--color-border-subtle)] relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-blue-500/10 dark:bg-blue-500/5 blur-3xl rounded-full -z-10 pointer-events-none" />
                <FadeIn direction="up" className="container mx-auto px-6 max-w-4xl text-center">
                    <Zap size={36} className="mx-auto text-[var(--color-primary)] mb-6 opacity-80" />
                    <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-[var(--color-foreground)] mb-6">
                        Ready to upgrade your content game?
                    </h2>
                    <p className="text-lg text-[var(--color-foreground-secondary)] mb-10">
                        Join hundreds of creators saving hours every week. Try TheSpinity generator today.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                        <Link href="/shorts" className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[var(--color-primary)] text-white font-semibold text-base hover:bg-blue-700 hover:scale-105 transition-all flex items-center justify-center gap-2">
                            Go to Generator
                        </Link>
                        <Link href="/pricing" className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[var(--color-background)] border border-[var(--color-border-subtle)] text-[var(--color-foreground)] font-semibold text-base hover:bg-gray-50 dark:hover:bg-gray-800 hover:scale-105 transition-all flex items-center justify-center">
                            View Pricing
                        </Link>
                    </div>
                </FadeIn>
            </section>

        </div>
    );
}
