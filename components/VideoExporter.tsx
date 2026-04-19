"use client";
import { useState, useRef } from "react";
import { Segment, buildSrt } from "@/lib/srt";
import type { Tier } from "@/lib/license";

interface Props {
  segments: Segment[];
  videoFile: File | null;
  tier: Tier;
}

const WATERMARK_TEXT = "tum-mu-sub-bu.vercel.app";

export default function VideoExporter({ segments, videoFile, tier }: Props) {
  const [status, setStatus] = useState<"idle" | "loading" | "processing" | "done" | "error">("idle");
  const [progress, setProgress] = useState(0);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const ffmpegRef = useRef<import("@ffmpeg/ffmpeg").FFmpeg | null>(null);

  const srtContent = buildSrt(segments);

  const downloadSrt = () => {
    const blob = new Blob([srtContent], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "captions.srt";
    a.click();
  };

  const downloadTxt = () => {
    const txt = segments.map((s) => s.text).join("\n");
    const blob = new Blob([txt], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "transcript.txt";
    a.click();
  };

  const burnSubtitles = async () => {
    if (!videoFile || segments.length === 0) return;
    setStatus("loading");
    setProgress(0);
    setOutputUrl(null);

    const { FFmpeg } = await import("@ffmpeg/ffmpeg");
    const { fetchFile, toBlobURL } = await import("@ffmpeg/util");

    if (!ffmpegRef.current) {
      const ff = new FFmpeg();
      ff.on("progress", ({ progress: p }) => {
        setProgress(Math.round(p * 100));
        setStatus("processing");
      });
      const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
      await ff.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
      });
      ffmpegRef.current = ff;
    }

    const ff = ffmpegRef.current;
    setStatus("processing");

    const inputExt = videoFile.name.split(".").pop() || "mp4";
    const inputName = `input.${inputExt}`;
    await ff.writeFile(inputName, await fetchFile(videoFile));
    await ff.writeFile("captions.srt", srtContent);

    const subtitleFilter = `subtitles=captions.srt:force_style='FontSize=24,PrimaryColour=&H00FFFFFF,OutlineColour=&H00000000,BorderStyle=3,Outline=2,Shadow=1,Alignment=2,MarginV=20'`;
    const watermarkFilter = tier === "free" ? `,drawtext=text='${WATERMARK_TEXT}':fontcolor=white@0.5:fontsize=20:x=(w-text_w)/2:y=h-50` : "";
    const vf = subtitleFilter + watermarkFilter;

    try {
      await ff.exec(["-y", "-i", inputName, "-vf", vf, "-c:a", "copy", "output.mp4"]);
      const data = await ff.readFile("output.mp4") as Uint8Array;
      const blob = new Blob([new Uint8Array(data)], { type: "video/mp4" });
      setOutputUrl(URL.createObjectURL(blob));
      setStatus("done");
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  };

  if (segments.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex gap-3 flex-wrap">
        <button onClick={downloadSrt} className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg text-sm">
          ดาวน์โหลด .SRT
        </button>
        <button onClick={downloadTxt} className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg text-sm">
          ดาวน์โหลด .TXT
        </button>
      </div>

      {videoFile && (
        <div>
          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={burnSubtitles}
              disabled={status === "loading" || status === "processing"}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 px-4 py-2 rounded-lg text-sm font-medium"
            >
              {status === "loading" ? "กำลังโหลด FFmpeg..." : status === "processing" ? `กำลัง Export... ${progress}%` : "Export วิดีโอพร้อม Subtitle"}
            </button>
            {tier === "free" && (
              <span className="text-xs text-yellow-400 bg-yellow-900/30 px-2 py-1 rounded">
                Free — มี watermark
              </span>
            )}
          </div>

          {(status === "loading" || status === "processing") && (
            <div className="bg-gray-700 rounded-full h-2 w-full max-w-sm">
              <div className="bg-blue-500 h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
          )}

          {status === "done" && outputUrl && (
            <a
              href={outputUrl}
              download="captioned-video.mp4"
              className="inline-block bg-green-600 hover:bg-green-500 px-4 py-2 rounded-lg text-sm font-medium"
            >
              ดาวน์โหลดวิดีโอ
            </a>
          )}
          {status === "error" && <p className="text-red-400 text-sm">Export ล้มเหลว ลองใหม่อีกครั้ง</p>}
        </div>
      )}
    </div>
  );
}
