"use client";
import { useState, useEffect, useRef } from "react";
import { UserButton } from "@clerk/nextjs";
import Transcriber from "@/components/Transcriber";
import CaptionEditor from "@/components/CaptionEditor";
import VideoExporter from "@/components/VideoExporter";
import { Segment } from "@/lib/srt";
import { fetchTier, type Tier } from "@/lib/license";
import Link from "next/link";

export default function ToolPage() {
  const [segments, setSegments] = useState<Segment[]>([]);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [tier, setTier] = useState<Tier>("free");
  const fileRef = useRef<File | null>(null);

  useEffect(() => {
    fetchTier().then(setTier);
  }, []);

  const handleSegments = (segs: Segment[]) => {
    setSegments(segs);
    setVideoFile(fileRef.current);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-lg font-bold text-blue-400">CaptionTH</Link>
        <div className="flex items-center gap-4">
          {tier === "free" && (
            <Link href="/pricing" className="text-xs bg-yellow-500 text-black font-medium px-3 py-1 rounded-full hover:bg-yellow-400">
              อัพเกรดเพื่อลบ Watermark
            </Link>
          )}
          {tier === "paid" && (
            <span className="text-xs bg-green-800 text-green-200 px-3 py-1 rounded-full">Pro</span>
          )}
          <UserButton />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        <section>
          <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">1. อัพโหลดไฟล์</h2>
          {/* Hidden file input to capture video file separately for FFmpeg */}
          <input
            type="file"
            accept="video/*"
            className="hidden"
            id="video-file-input"
            onChange={(e) => { fileRef.current = e.target.files?.[0] ?? null; }}
          />
          <Transcriber
            onSegments={handleSegments}
          />
        </section>

        {segments.length > 0 && (
          <>
            <section>
              <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">
                2. แก้ไข Caption ({segments.length} รายการ)
              </h2>
              <CaptionEditor segments={segments} onChange={setSegments} />
            </section>

            <section>
              <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">3. Export</h2>
              <VideoExporter segments={segments} videoFile={videoFile} tier={tier} />
            </section>
          </>
        )}
      </main>
    </div>
  );
}
