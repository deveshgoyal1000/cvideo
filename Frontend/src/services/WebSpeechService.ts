/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export class WebSpeechService {
  private recognition: any = null;
  private isRunning = false;

  constructor(
    private onResult: (text: string, isFinal: boolean) => void,
    private onError?: (error: string) => void
  ) {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'hi-IN';

      this.recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        if (finalTranscript) {
          this.onResult(finalTranscript, true);
        } else if (interimTranscript) {
          this.onResult(interimTranscript, false);
        }
      };

      this.recognition.onerror = (event: any) => {
        if (event.error === 'network') {
          console.warn('Web Speech Fallback STT: Network error. Disabling fallback.');
          this.isRunning = false;
          this.recognition.stop();
          if (this.onError) this.onError('network');
        } else {
          console.error('Web Speech Error:', event.error);
          if (this.onError) this.onError(event.error);
        }
      };

      this.recognition.onend = () => {
        if (this.isRunning) {
          this.recognition.start(); // Keep it running
        }
      };
    }
  }

  start() {
    if (this.recognition && !this.isRunning) {
      this.isRunning = true;
      try {
        this.recognition.start();
      } catch (e) {
        console.error("Speech recognition start failed", e);
      }
    }
  }

  stop() {
    this.isRunning = false;
    if (this.recognition) {
      this.recognition.stop();
    }
  }

  isSupported() {
    return !!this.recognition;
  }
}
