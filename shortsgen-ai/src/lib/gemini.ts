import { GoogleGenAI, Modality, Type } from "@google/genai";

const apiKey = typeof process !== 'undefined' && process.env ? process.env.GEMINI_API_KEY : (import.meta as any).env?.VITE_GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: apiKey || "" });

export interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  contentSnippet: string;
  source: string;
}

export interface ShortScript {
  hook: string;
  body: string[];
  cta: string;
}

export async function generateShortScript(news: NewsItem): Promise<ShortScript> {
  const prompt = `Generate a high-retention YouTube Shorts script based on this AI news:
  Title: ${news.title}
  Summary: ${news.contentSnippet}
  
  The script should be optimized for a 30-60 second video.
  Include:
  1. A punchy hook (first 3 seconds).
  2. 3-4 core body points (simple, human-toned).
  3. A call-to-action (CTA).
  
  Return the result in JSON format.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          hook: { type: Type.STRING },
          body: { 
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          cta: { type: Type.STRING }
        },
        required: ["hook", "body", "cta"]
      }
    }
  });

  return JSON.parse(response.text);
}

export async function generateVoiceover(text: string): Promise<string> {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: `Say with high energy and professional tone: ${text}` }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: "Fenrir" },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) throw new Error("Failed to generate audio");

  // Wrap raw PCM in WAV header
  return wrapPcmInWav(base64Audio);
}

/**
 * Wraps raw 24kHz 16-bit Mono PCM data in a WAV header.
 */
function wrapPcmInWav(base64Pcm: string): string {
  const binaryString = atob(base64Pcm);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  const wavHeader = new ArrayBuffer(44);
  const view = new DataView(wavHeader);

  // RIFF identifier
  view.setUint32(0, 0x52494646, false); // "RIFF"
  view.setUint32(4, 36 + len, true);    // file length - 8
  view.setUint32(8, 0x57415645, false); // "WAVE"

  // fmt chunk
  view.setUint32(12, 0x666d7420, false); // "fmt "
  view.setUint32(16, 16, true);          // length of fmt chunk
  view.setUint16(20, 1, true);           // PCM format
  view.setUint16(22, 1, true);           // Mono
  view.setUint32(24, 24000, true);       // Sample rate
  view.setUint32(28, 24000 * 2, true);   // Byte rate
  view.setUint16(32, 2, true);           // Block align
  view.setUint16(34, 16, true);          // Bits per sample

  // data chunk
  view.setUint32(36, 0x64617461, false); // "data"
  view.setUint32(40, len, true);         // data length

  const combined = new Uint8Array(44 + len);
  combined.set(new Uint8Array(wavHeader), 0);
  combined.set(bytes, 44);

  // Use a loop to build the binary string to avoid stack overflow with large arrays
  let binary = "";
  for (let i = 0; i < combined.length; i++) {
    binary += String.fromCharCode(combined[i]);
  }
  
  return btoa(binary);
}
