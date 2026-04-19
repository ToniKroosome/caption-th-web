// Longest-match Thai word segmentation (simplified newmm-style)
// Uses a built-in Thai character pattern to split at natural boundaries

export function visualLen(text: string): number {
  // Exclude Thai combining marks (tone marks, vowel signs above/below)
  return [...text].filter((c) => {
    const cp = c.codePointAt(0)!;
    // Thai combining range: 0x0E31, 0x0E34-0x0E3A, 0x0E47-0x0E4E
    return !(cp === 0x0e31 || (cp >= 0x0e34 && cp <= 0x0e3a) || (cp >= 0x0e47 && cp <= 0x0e4e));
  }).length;
}

export function cleanThai(text: string): string {
  return text.replace(/[\s\u200b]/g, "");
}

// Split Thai text into tokens using character-class transitions
// Groups: Thai consonants/vowels, Latin+digits, punctuation
function tokenize(text: string): string[] {
  const tokens: string[] = [];
  let buf = "";
  let prevType = "";

  for (const ch of text) {
    const cp = ch.codePointAt(0)!;
    const isThai = cp >= 0x0e00 && cp <= 0x0e7f;
    const isLatin = (cp >= 0x41 && cp <= 0x5a) || (cp >= 0x61 && cp <= 0x7a) || (cp >= 0x30 && cp <= 0x39);
    const type = isThai ? "thai" : isLatin ? "latin" : "other";

    if (type !== prevType && buf) {
      tokens.push(buf);
      buf = "";
    }
    buf += ch;
    prevType = type;
  }
  if (buf) tokens.push(buf);
  return tokens;
}

export function segmentWords(text: string, limit: number): string[] {
  const cleaned = cleanThai(text);
  const tokens = tokenize(cleaned);
  const boxes: string[] = [];
  let current = "";

  for (const token of tokens) {
    const candidate = current + token;
    if (visualLen(candidate) <= limit) {
      current = candidate;
    } else {
      if (current) boxes.push(current);
      // If single token exceeds limit, force-split it
      if (visualLen(token) > limit) {
        let chunk = "";
        for (const ch of token) {
          if (visualLen(chunk + ch) > limit) {
            boxes.push(chunk);
            chunk = ch;
          } else {
            chunk += ch;
          }
        }
        current = chunk;
      } else {
        current = token;
      }
    }
  }
  if (current) boxes.push(current);
  return boxes;
}

export function splitSegment(seg: { start: number; end: number; text: string }, limit: number) {
  const boxes = segmentWords(seg.text, limit);
  if (boxes.length <= 1) return [seg];
  const duration = seg.end - seg.start;
  const chunk = duration / boxes.length;
  return boxes.map((text, i) => ({
    start: seg.start + i * chunk,
    end: seg.start + (i + 1) * chunk,
    text,
  }));
}
