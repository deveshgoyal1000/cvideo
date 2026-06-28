/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, Modality, LiveServerMessage } from "@google/genai";
import { WebSpeechService } from "./WebSpeechService";
import { getAudioWorkletUrl } from "./AudioWorkletProcessor";

export interface ToneConfig {
  enthusiasm: number;  // 0-100
  calmness: number;    // 0-100
  formality: number;   // 0-100
  playfulness: number; // 0-100
  empathy: number;     // 0-100
  pitch: number;       // 0-100
}

export class LiveAudioService {
  private audioContext: AudioContext | null = null;
  private workletNode: AudioWorkletNode | null = null;
  private mediaStream: MediaStream | null = null;
  private sessionPromise: Promise<any> | null = null;
  private session: any = null;
  private nextStartTime = 0;
  private webSpeech: WebSpeechService;
  private lastGeminiTranscriptTime = 0;
  private fallbackActive = false;
  private activeSources: AudioBufferSourceNode[] = [];

  constructor(
    private voiceName: string,
    private tone: ToneConfig,
    private onTranscript: (text: string, isUser: boolean, isFallback?: boolean) => void,
    private onStatusChange: (status: string) => void
  ) {
    // Initialize Web Speech as a secondary STT service
    this.webSpeech = new WebSpeechService(
      (text, isFinal) => {
        if (isFinal) {
          const timeSinceLastGemini = Date.now() - this.lastGeminiTranscriptTime;
          if (timeSinceLastGemini > 2000 || this.fallbackActive) {
            console.log("Using Fallback STT (Web Speech)");
            this.onTranscript(text, true, true);
          }
        }
      },
      (error) => {
        if (error === 'network') {
          console.warn("Web Speech Fallback STT unavailable due to network issues. Primary STT remains active.");
        }
      }
    );
  }

  private getToneInstruction(): string {
    return `You are Rahul, the warm, professional, and friendly AI Receptionist for 'Royal Style Hair Salon' located at MG Road, Sector 18, Noida.
    
    CRITICAL CONVERSATION RULES:
    1. PRIMARY LANGUAGE: Always start the conversation in Hindi. You can switch to Hinglish if the customer prefers.
    2. RESPONSE STYLE: Keep responses very short (1-2 sentences). You are on a voice call; don't give long explanations.
    3. TONE: Polite, welcoming, and helpful.
    4. INITIAL GREETING: "नमस्ते! मेरा नाम राहुल है, मैं Royal Style Hair Salon का AI रिसेप्शनिस्ट हूँ। मैं आपकी अपॉइंटमेंट बुक करने या हमारी सेवाओं के बारे में जानकारी देने में मदद कर सकता हूँ। मैं आपकी कैसे सहायता कर सकता हूँ?"

    BUSINESS INFORMATION:
    - Address: MG Road, Sector 18, Noida, Uttar Pradesh (landmark: City Mall के सामने).
    - Hours: Mon-Thu: 10AM-8PM, Fri-Sat: 10AM-9PM, Sun: 11AM-7PM.

    SERVICES & PRICING (in INR):
    - Haircut: Men: 500, Women: 900, Kids: 350.
    - Hair Coloring: Global: 3500, Highlights: 4000, Balayage: 6500.
    - Hair Treatments: Hair Spa: 1800 (45 mins), Keratin: 7000 (3 hrs), Smoothening: 6000 (3 hrs), Botox: 7500 (2.5 hrs).
    - Men's Grooming: Beard Trim: 250, Beard Styling: 400, Clean Shave: 300.

    APPOINTMENT PROCESS:
    Ask for: 1. Service required, 2. Preferred date, 3. Preferred time, 4. Customer name, 5. Phone number.
    Confirm availability (within working hours) and finalize.

    If interrupted, stop immediately and listen.`;
  }

  async start() {
    try {
      this.onStatusChange("Initializing Audio...");

      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY || (import.meta as any).env?.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY is missing. Please set it in your environment variables.");
      }

      // Start Web Speech in parallel
      if (this.webSpeech.isSupported()) {
        this.webSpeech.start();
      }

      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 16000,
        latencyHint: 'interactive'
      });

      // Load Audio Worklet
      await this.audioContext.audioWorklet.addModule(getAudioWorkletUrl());

      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        },
      });

      this.onStatusChange("Connecting to Gemini...");
      const ai = new GoogleGenAI({ apiKey, httpOptions: { apiVersion: "v1alpha" } });

      this.sessionPromise = ai.live.connect({
        model: "gemini-2.5-flash-native-audio-preview-12-2025",
        config: {
          responseModalities: [Modality.AUDIO],
          enableAffectiveDialog: true,
          proactivity: { proactiveAudio: true },
          thinkingConfig: { thinkingBudget: 0 },
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: this.voiceName as any } },
          },
          systemInstruction: {
            parts: [{ text: this.getToneInstruction() }]
          } as any,
        } as any,
        callbacks: {
          onopen: () => {
            this.onStatusChange("Connected");
            this.fallbackActive = false;
            this.startStreaming();
          },
          onmessage: async (message: LiveServerMessage) => {
            // Handle Audio Output
            if (message.serverContent?.modelTurn?.parts) {
              for (const part of message.serverContent.modelTurn.parts) {
                if (part.inlineData?.data) {
                  this.handleAudioOutput(part.inlineData.data);
                }
                if (part.text) {
                  this.onTranscript(part.text, false);
                }
              }
            }

            if (message.serverContent?.interrupted) {
              this.stopPlayback();
            }

            // User transcription from Gemini (Primary)
            const userTranscript = message.serverContent?.inputTranscription?.text;
            if (userTranscript) {
              this.lastGeminiTranscriptTime = Date.now();
              this.onTranscript(userTranscript, true);
            }
          },
          onclose: () => {
            console.log("WebSocket Closed");
            this.onStatusChange("Disconnected");
            this.fallbackActive = true;
          },
          onerror: (error) => {
            console.error("Live API Error:", error);
            this.onStatusChange("Error: " + error.message);
            this.fallbackActive = true;
          }
        }
      });

      this.session = await this.sessionPromise;

    } catch (error: any) {
      console.error("Failed to start Live Audio Service:", error);
      this.onStatusChange("Error: " + (error.message || "Unknown error"));
      this.fallbackActive = true;
      throw error;
    }
  }

  sendText(text: string) {
    this.sessionPromise?.then(session => {
      session.sendRealtimeInput({
        text: text
      });
    });
  }

  private startStreaming() {
    if (!this.audioContext || !this.mediaStream || !this.sessionPromise) return;

    const source = this.audioContext.createMediaStreamSource(this.mediaStream);
    this.workletNode = new AudioWorkletNode(this.audioContext, 'audio-processor');

    this.workletNode.port.onmessage = (event) => {
      const pcmBuffer = event.data;
      const base64Data = btoa(String.fromCharCode(...new Uint8Array(pcmBuffer)));

      this.sessionPromise?.then(session => {
        session.sendRealtimeInput({
          media: { data: base64Data, mimeType: 'audio/pcm;rate=16000' }
        });
      });
    };

    source.connect(this.workletNode);
  }

  private handleAudioOutput(base64Data: string) {
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    const buffer = bytes.buffer;
    const pcmData = new Int16Array(buffer, 0, Math.floor(buffer.byteLength / 2));
    this.playAudioChunk(pcmData);
  }

  private playAudioChunk(pcmData: Int16Array) {
    if (!this.audioContext) return;

    const floatData = new Float32Array(pcmData.length);
    for (let i = 0; i < pcmData.length; i++) {
      floatData[i] = pcmData[i] / 0x7FFF;
    }

    // Gemini outputs at 24kHz
    const audioBuffer = this.audioContext.createBuffer(1, floatData.length, 24000);
    audioBuffer.getChannelData(0).set(floatData);

    const source = this.audioContext.createBufferSource();
    source.buffer = audioBuffer;

    const playbackRate = 1.0;
    source.playbackRate.value = playbackRate;

    source.connect(this.audioContext.destination);

    const currentTime = this.audioContext.currentTime;
    if (this.nextStartTime < currentTime) {
      this.nextStartTime = currentTime + 0.005;
    }

    source.start(this.nextStartTime);
    this.nextStartTime += audioBuffer.duration / playbackRate;

    this.activeSources.push(source);
    source.onended = () => {
      this.activeSources = this.activeSources.filter(s => s !== source);
    };
  }

  private stopPlayback() {
    this.activeSources.forEach(source => {
      try {
        source.stop();
      } catch (e) {
        // Source might have already stopped
      }
    });
    this.activeSources = [];
    this.nextStartTime = 0;
  }

  stop() {
    if (this.webSpeech) {
      this.webSpeech.stop();
    }
    if (this.workletNode) {
      this.workletNode.disconnect();
      this.workletNode = null;
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    if (this.session) {
      this.session.close();
      this.session = null;
    }
    this.onStatusChange("Idle");
  }
}
