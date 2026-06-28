# Implementation Plan: True Bidirectional Gemini Live Voice Chat

You mentioned you want a true human-like, bidirectional voice chat with emotions, just like the Gemini Voice Live feature, rather than a turn-based chat. 

Currently, `DemoCallButton.tsx` uses the browser's built-in `SpeechRecognition` text-to-speech and `speechSynthesis`. This is why it feels robotic and turn-based, and it's also why it hit the REST API backend (`route.ts`) which threw the `systemInstruction` error.

To get the true emotional voice experience, we need to switch entirely to the **Gemini Multimodal Live WebSocket API**. I see you already have the foundational files for this in `src/lib/`. 

Here is the exact plan to implement this smoothly without any hallucination.

## Step 1: Update `GeminiLiveClient` (`src/lib/geminiLiveClient.ts`)
- Ensure the WebSocket connection is established correctly.
- Add support for sending system instructions during the `setup` message so the AI knows it's the LuxeSpa receptionist.
- Ensure the API Key is securely fetched or passed in a way that allows the client to connect. 

## Step 2: Refactor `DemoCallButton.tsx`
We will completely rewrite `DemoCallButton.tsx` to drop `SpeechRecognition` and use pure raw audio streaming.

**New State & Hooks:**
- Initialize `AudioRecorder`, `AudioStreamer`, and `GeminiLiveClient` in React refs.
- Manage state for `isConnected`, `isRecording`, and `isSpeaking`.

**Connecting & Streaming Flow:**
1. When the user clicks the "Mic" button, we initialize `GeminiLiveClient`.
2. Once the WebSocket opens (`onOpen`), we initialize the `AudioRecorder` to capture their microphone.
3. As `AudioRecorder` emits base64 PCM audio chunks (`onData`), we immediately blast those chunks to Gemini via `geminiClient.sendAudioChunk()`.
4. As Gemini responds with raw audio chunks (`onMessage`), we queue them directly into `AudioStreamer` to play the emotional AI voice back to the user instantly.

## Step 3: Handle Interruptions (Bidirectional)
Gemini Live supports interruptions natively. If the user speaks while the AI is talking:
- `AudioStreamer` will receive an empty response or new content.
- We will add a hook in the UI so if the user makes noise, we can interrupt the `AudioStreamer` playback queue (`streamer.current.interrupt()`) allowing the true conversational feel.

## Step 4: UI Updates
- Change the UI states from "Thinking..." to "Connected..." since it will represent a continuous live call rather than a turn-based request-response.
- Add an animated visualizer (or simply pulse the mic) based on audio intensity if possible, or keep the existing pulse CSS.

---

**Next steps:** Once you review and approve this plan, I will execute the changes to `DemoCallButton.tsx` and fix the remaining `geminiLiveClient.ts` plumbing to bring your emotional voice AI to life.
