// Dynamically import transformers as an ES module (works with COEP)
let transformersPromise = null;

function loadTransformers() {
  if (!transformersPromise) {
    transformersPromise = import("https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2/dist/transformers.min.js");
  }
  return transformersPromise;
}

let asr = null;
let loadedModel = "";

self.onmessage = async (e) => {
  const { audioBuffer, model } = e.data;

  try {
    const mod = await loadTransformers();
    const pipeline = mod.pipeline ?? mod.default?.pipeline;

    if (!pipeline) {
      self.postMessage({ type: "error", data: "Could not load transformers pipeline" });
      return;
    }

    if (!asr || loadedModel !== model) {
      const fileTotals = {};
      const fileLoaded = {};

      asr = await pipeline("automatic-speech-recognition", model, {
        progress_callback: (p) => {
          if (p.status === "downloading" || p.status === "progress") {
            const file = p.file ?? "model";
            if (p.total) fileTotals[file] = p.total;
            if (p.loaded !== undefined) fileLoaded[file] = p.loaded;

            const totalBytes = Object.values(fileTotals).reduce((a, b) => a + b, 0);
            const loadedBytes = Object.values(fileLoaded).reduce((a, b) => a + b, 0);
            const pct = totalBytes > 0 ? (loadedBytes / totalBytes) * 100 : (p.progress ?? 0) * 100;

            self.postMessage({ type: "download", data: { loaded: loadedBytes, total: totalBytes, progress: pct, file: p.file ?? "" } });
          } else if (p.status === "initiate") {
            self.postMessage({ type: "download", data: { loaded: 0, total: 0, progress: 0, file: p.file ?? "" } });
          } else if (p.status === "done" || p.status === "ready") {
            self.postMessage({ type: "model-ready" });
          }
        },
      });
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

    const chunks = Array.isArray(result) ? result : (result.chunks ?? []);
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
