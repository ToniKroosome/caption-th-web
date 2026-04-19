import { pipeline, AutomaticSpeechRecognitionPipeline } from "@xenova/transformers";

let asr: AutomaticSpeechRecognitionPipeline | null = null;
let loadedModel = "";

self.onmessage = async (e: MessageEvent) => {
  const { audioBuffer, model } = e.data;

  try {
    if (!asr || loadedModel !== model) {
      asr = await pipeline("automatic-speech-recognition", model, {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        progress_callback: (p: any) => {
          if (p.status === "downloading" || p.status === "loading") {
            self.postMessage({
              type: "download",
              data: {
                loaded: p.loaded ?? 0,
                total: p.total ?? 0,
                progress: p.progress ?? 0,
                file: p.file ?? "",
              },
            });
          } else if (p.status === "ready") {
            self.postMessage({ type: "model-ready" });
          }
        },
      }) as AutomaticSpeechRecognitionPipeline;
      loadedModel = model;
    } else {
      self.postMessage({ type: "model-ready" });
    }

    const audioCtx = new AudioContext({ sampleRate: 16000 });
    const decoded = await audioCtx.decodeAudioData(audioBuffer);
    const float32 = decoded.getChannelData(0);

    const result = await asr(float32, {
      language: "thai",
      task: "transcribe",
      return_timestamps: true,
      chunk_length_s: 30,
      stride_length_s: 5,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const chunks: any[] = Array.isArray(result) ? result : (result as any).chunks ?? [];
    const segments = chunks.map((c) => ({
      start: c.timestamp[0] ?? 0,
      end: c.timestamp[1] ?? c.timestamp[0] + 2,
      text: c.text,
    }));

    self.postMessage({ type: "result", data: segments });
  } catch (err) {
    self.postMessage({ type: "error", data: String(err) });
  }
};
