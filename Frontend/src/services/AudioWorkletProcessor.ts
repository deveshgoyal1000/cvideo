/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Audio Worklet processor for low-latency capture
const processorCode = `
class AudioProcessor extends AudioWorkletProcessor {
  process(inputs, outputs, parameters) {
    const input = inputs[0];
    if (input.length > 0) {
      const channelData = input[0];
      // Convert Float32 to Int16 PCM
      const pcmData = new Int16Array(channelData.length);
      for (let i = 0; i < channelData.length; i++) {
        pcmData[i] = Math.max(-1, Math.min(1, channelData[i])) * 0x7FFF;
      }
      this.port.postMessage(pcmData.buffer, [pcmData.buffer]);
    }
    return true;
  }
}
registerProcessor('audio-processor', AudioProcessor);
`;

export const getAudioWorkletUrl = () => {
  const blob = new Blob([processorCode], { type: 'application/javascript' });
  return URL.createObjectURL(blob);
};
