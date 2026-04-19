"use client";
import { Segment } from "@/lib/srt";
import { segmentWords } from "@/lib/thai-tokenizer";
import { secondsToSrtTime, srtTimeToSeconds } from "@/lib/srt";

interface Props {
  segments: Segment[];
  onChange: (segs: Segment[]) => void;
}

export default function CaptionEditor({ segments, onChange }: Props) {
  const update = (i: number, patch: Partial<Segment>) => {
    const next = segments.map((s, idx) => (idx === i ? { ...s, ...patch } : s));
    onChange(next);
  };

  const remove = (i: number) => onChange(segments.filter((_, idx) => idx !== i));

  const breakAt = (i: number) => {
    const seg = segments[i];
    const halves = segmentWords(seg.text, Math.ceil(seg.text.length / 2));
    if (halves.length < 2) return;
    const mid = seg.start + (seg.end - seg.start) / 2;
    const a = { start: seg.start, end: mid, text: halves[0] };
    const b = { start: mid, end: seg.end, text: halves.slice(1).join("") };
    const next = [...segments.slice(0, i), a, b, ...segments.slice(i + 1)];
    onChange(next);
  };

  if (segments.length === 0) return null;

  return (
    <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
      {segments.map((seg, i) => (
        <div key={i} className="bg-gray-800 rounded-lg p-3 flex gap-3 items-start">
          <span className="text-gray-500 text-xs pt-1 w-5 shrink-0">{i + 1}</span>
          <div className="flex-1 space-y-2">
            <input
              className="w-full bg-gray-700 rounded px-2 py-1 text-sm"
              value={seg.text}
              onChange={(e) => update(i, { text: e.target.value })}
            />
            <div className="flex gap-2 text-xs">
              <label className="flex items-center gap-1 text-gray-400">
                Start
                <input
                  className="bg-gray-700 rounded px-2 py-0.5 w-32"
                  value={secondsToSrtTime(seg.start)}
                  onChange={(e) => {
                    try { update(i, { start: srtTimeToSeconds(e.target.value) }); } catch { /* invalid input */ }
                  }}
                />
              </label>
              <label className="flex items-center gap-1 text-gray-400">
                End
                <input
                  className="bg-gray-700 rounded px-2 py-0.5 w-32"
                  value={secondsToSrtTime(seg.end)}
                  onChange={(e) => {
                    try { update(i, { end: srtTimeToSeconds(e.target.value) }); } catch { /* invalid input */ }
                  }}
                />
              </label>
            </div>
          </div>
          <div className="flex flex-col gap-1 shrink-0">
            <button
              onClick={() => breakAt(i)}
              className="text-xs bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded"
              title="ตัดบรรทัด"
            >
              ↩
            </button>
            <button
              onClick={() => remove(i)}
              className="text-xs bg-red-900 hover:bg-red-700 px-2 py-1 rounded"
              title="ลบ"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
