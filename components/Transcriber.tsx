"use client";
import { useState, useRef, useCallback } from "react";
import { Segment } from "@/lib/srt";
import { splitSegment } from "@/lib/thai-tokenizer";

interface Props {
  onSegments: (segs: Segment[]) => void;
}

const MODELS = [
  { id: "Xenova/whisper-large-v3", label: "Large v3 — แม่นที่สุด (~3GB)", size: 3000 },
  { id: "Xenova/whisper-medium", label: "Medium — แม่นมาก (~1.5GB)", size: 1500 },
  { id: "Xenova/whisper-small", label: "Small — ดี (~970MB)", size: 970 },
  { id: "Xenova/whisper-base", label: "Base — เร็วกว่า (~290MB)", size: 290 },
  { id: "Xenova/whisper-tiny", label: "Tiny — เร็วที่สุด (~150MB)", size: 150 },
];

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatETA(loadedBytes: number, totalBytes: number, elapsedMs: number): string {
  if (loadedBytes <= 0 || totalBytes <= 0 || elapsedMs <= 0) return "";
  const speed = loadedBytes / (elapsedMs / 1000); // bytes/sec
  const remaining = totalBytes - loadedBytes;
  const etaSec = remaining / speed;
  if (etaSec < 60) return `~${Math.ceil(etaSec)}s`;
  return `~${Math.ceil(etaSec / 60)}m`;
}

export default function Transcriber({ onSegments }: Props) {
  const [status, setStatus] = useState<"idle" | "downloading" | "model-ready" | "transcribing" | "done" | "error">("idle");
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadLoaded, setDownloadLoaded] = useState(0);
  const [downloadTotal, setDownloadTotal] = useState(0);
  const [downloadFile, setDownloadFile] = useState("");
  const [modelSize, setModelSize] = useState("Xenova/whisper-large-v3");
  const [charLimit, setCharLimit] = useState(30);
  const workerRef = useRef<Worker | null>(null);
  const downloadStartRef = useRef<number>(0);

  const handleFile = useCallback(
    (file: File) => {
      setStatus("downloading");
      setDownloadProgress(0);
      setDownloadLoaded(0);
      setDownloadTotal(0);
      downloadStartRef.current = Date.now();

      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
      // Load from /public to avoid Turbopack bundling the transformers library
      workerRef.current = new Worker("/whisper.worker.js");
      const worker = workerRef.current;

      worker.onmessage = (e) => {
        const { type, data } = e.data;
        if (type === "download") {
          setDownloadProgress(data.progress ?? 0);
          setDownloadLoaded(data.loaded ?? 0);
          setDownloadTotal(data.total ?? 0);
          setDownloadFile(data.file ?? "");
          setStatus("downloading");
        } else if (type === "model-ready") {
          setStatus("model-ready");
          setTimeout(() => setStatus("transcribing"), 300);
        } else if (type === "transcribe-progress") {
          setStatus("transcribing");
        } else if (type === "result") {
          const raw: Segment[] = data;
          const expanded = raw.flatMap((seg) => splitSegment(seg, charLimit));
          onSegments(expanded);
          setStatus("done");
        } else if (type === "error") {
          console.error(data);
          setStatus("error");
        }
      };

      file.arrayBuffer().then((buf) => {
        worker.postMessage({ audioBuffer: buf, model: modelSize });
      });
    },
    [modelSize, charLimit, onSegments]
  );

  const elapsed = Date.now() - downloadStartRef.current;
  const eta = formatETA(downloadLoaded, downloadTotal, elapsed);
  const selectedModel = MODELS.find((m) => m.id === modelSize);

  return (
    <div className="space-y-4">
      {/* First-time notice */}
      <div className="bg-blue-950 border border-blue-800 rounded-lg px-4 py-3 text-sm text-blue-200">
        ครั้งแรกที่ใช้งานบนอุปกรณ์นี้ โมเดลจะถูกดาวน์โหลดและเก็บไว้ในเบราว์เซอร์ของคุณ
        ครั้งถัดไปจะเร็วกว่ามาก เพราะไม่ต้องดาวน์โหลดใหม่
      </div>

      <div className="flex gap-4 flex-wrap">
        <div>
          <label className="block text-xs text-gray-400 mb-1">โมเดล (ความแม่น vs ความเร็ว)</label>
          <select
            className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm"
            value={modelSize}
            onChange={(e) => setModelSize(e.target.value)}
            disabled={status === "transcribing" || status === "downloading"}
          >
            {MODELS.map((m) => (
              <option key={m.id} value={m.id}>{m.label}</option>
            ))}
          </select>
          {selectedModel && (
            <p className="text-xs text-gray-600 mt-1">ขนาดดาวน์โหลด: ~{selectedModel.size >= 1000 ? `${(selectedModel.size / 1000).toFixed(1)}GB` : `${selectedModel.size}MB`}</p>
          )}
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">ตัวอักษรสูงสุดต่อ Caption</label>
          <input
            type="number"
            min={10}
            max={60}
            className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm w-24"
            value={charLimit}
            onChange={(e) => setCharLimit(Number(e.target.value))}
          />
        </div>
      </div>

      <label
        className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-10 cursor-pointer transition
          ${status === "idle" || status === "done" ? "border-gray-600 hover:border-blue-500" : "border-gray-700 cursor-not-allowed opacity-80"}`}
      >
        <input
          type="file"
          accept="audio/*,video/*"
          className="hidden"
          disabled={status === "downloading" || status === "transcribing" || status === "model-ready"}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />

        {status === "idle" && (
          <>
            <span className="text-4xl mb-2">🎙️</span>
            <span className="text-gray-400">อัพโหลดไฟล์เสียงหรือวิดีโอ</span>
            <span className="text-xs text-gray-600 mt-1">MP3, WAV, MP4, MOV ...</span>
          </>
        )}

        {status === "downloading" && (
          <div className="w-full max-w-sm space-y-2">
            <div className="flex justify-between text-xs text-gray-400">
              <span>กำลังดาวน์โหลดโมเดล{downloadFile ? ` (${downloadFile.split("/").pop()})` : ""}...</span>
              <span>{eta}</span>
            </div>
            <div className="bg-gray-700 rounded-full h-3 overflow-hidden">
              <div
                className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${downloadProgress}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>{formatBytes(downloadLoaded)} / {downloadTotal > 0 ? formatBytes(downloadTotal) : "?"}</span>
              <span>{Math.round(downloadProgress)}%</span>
            </div>
            <p className="text-xs text-gray-600 text-center mt-1">
              ครั้งถัดไปจะไม่ต้องดาวน์โหลดใหม่ — โมเดลถูกเก็บไว้ในเบราว์เซอร์ของคุณแล้ว
            </p>
          </div>
        )}

        {status === "model-ready" && (
          <span className="text-blue-400 animate-pulse">โมเดลพร้อมแล้ว กำลังเริ่มถอดเสียง...</span>
        )}

        {status === "transcribing" && (
          <div className="w-full max-w-sm space-y-2 text-center">
            <div className="text-gray-400 animate-pulse">กำลังถอดเสียง...</div>
            <div className="flex justify-center gap-1 mt-2">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
            <p className="text-xs text-gray-600">ขึ้นอยู่กับความยาวไฟล์และสเปคเครื่อง</p>
          </div>
        )}

        {status === "done" && (
          <span className="text-green-400">ถอดเสียงสำเร็จ — อัพโหลดไฟล์ใหม่เพื่อเริ่มใหม่</span>
        )}
        {status === "error" && (
          <span className="text-red-400">เกิดข้อผิดพลาด ลองใหม่อีกครั้ง</span>
        )}
      </label>
    </div>
  );
}
