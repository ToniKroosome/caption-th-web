"use client";
import { useState, useRef, useCallback } from "react";
import { Segment } from "@/lib/srt";
import { splitSegment } from "@/lib/thai-tokenizer";

interface Props {
  onSegments: (segs: Segment[]) => void;
}

export default function Transcriber({ onSegments }: Props) {
  const [status, setStatus] = useState<"idle" | "loading-model" | "transcribing" | "done" | "error">("idle");
  const [progress, setProgress] = useState(0);
  const [modelSize, setModelSize] = useState("Xenova/whisper-tiny");
  const [charLimit, setCharLimit] = useState(30);
  const workerRef = useRef<Worker | null>(null);

  const handleFile = useCallback(
    (file: File) => {
      setStatus("loading-model");
      setProgress(0);

      if (!workerRef.current) {
        workerRef.current = new Worker(new URL("../workers/whisper.worker.ts", import.meta.url), { type: "module" });
      }

      const worker = workerRef.current;

      worker.onmessage = (e) => {
        const { type, data } = e.data;
        if (type === "progress") {
          setProgress(data);
          if (data > 0) setStatus("transcribing");
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

  return (
    <div className="space-y-4">
      <div className="flex gap-4 flex-wrap">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Model (accuracy vs speed)</label>
          <select
            className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm"
            value={modelSize}
            onChange={(e) => setModelSize(e.target.value)}
            disabled={status === "transcribing" || status === "loading-model"}
          >
            <option value="Xenova/whisper-tiny">Tiny — fastest (~150MB)</option>
            <option value="Xenova/whisper-base">Base — better (~290MB)</option>
            <option value="Xenova/whisper-small">Small — best (~970MB)</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Max chars per caption</label>
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
          ${status === "idle" || status === "done" ? "border-gray-600 hover:border-blue-500" : "border-gray-700 cursor-not-allowed opacity-60"}`}
      >
        <input
          type="file"
          accept="audio/*,video/*"
          className="hidden"
          disabled={status === "loading-model" || status === "transcribing"}
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
        {status === "loading-model" && <span className="text-gray-400 animate-pulse">กำลังโหลดโมเดล Whisper... (ครั้งแรกอาจช้า)</span>}
        {status === "transcribing" && (
          <div className="w-full max-w-xs">
            <div className="text-gray-400 text-center mb-2">กำลังถอดเสียง... {Math.round(progress)}%</div>
            <div className="bg-gray-700 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}
        {status === "done" && <span className="text-green-400">ถอดเสียงสำเร็จ — อัพโหลดไฟล์ใหม่เพื่อเริ่มใหม่</span>}
        {status === "error" && <span className="text-red-400">เกิดข้อผิดพลาด ลองใหม่อีกครั้ง</span>}
      </label>
    </div>
  );
}
