// The CDD report PY0080 "Payroll CDH Calculation Source" only produces a PDF.
// Text extraction tools rebuild the spacing of a PDF from glyph positions and
// get it wrong for a proportional font, but the file itself holds every source
// line as one exact string, leading blanks included. This reads those strings
// straight from the page content, with no PDF library: inflate each stream,
// walk the text operators, and sort the strings into the report's three
// columns by the x position of its column headings.
import { inflateSync } from 'zlib';
import { toRows, type ParseResult } from './import-core';

interface Shown { x: number; y: number; text: string }

export const isPdf = (bytes: Uint8Array) => bytes.length > 4 && bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46; // %PDF

const latin1 = (b: Uint8Array) => { let s = ''; for (let i = 0; i < b.length; i += 8192) s += String.fromCharCode(...b.subarray(i, i + 8192)); return s; };

/** Page content streams in file order, inflated. Streams that are not text are skipped. */
function contentStreams(bytes: Uint8Array): string[] {
  const out: string[] = [];
  const buf = Buffer.from(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let at = 0;
  for (;;) {
    const s = buf.indexOf('stream', at, 'latin1');
    if (s < 0) break;
    let start = s + 6;
    if (buf[start] === 0x0d) start++;
    if (buf[start] === 0x0a) start++;
    const end = buf.indexOf('endstream', start, 'latin1');
    if (end < 0) break;
    at = end + 9;
    if (buf.subarray(Math.max(0, s - 3), s).toString('latin1') === 'end') continue; // matched inside "endstream"
    let body: Buffer = buf.subarray(start, end);
    try { body = inflateSync(body); } catch { /* not deflated: read as is */ }
    const text = latin1(body);
    if (/\bBT\b/.test(text) && /\bTm\b/.test(text)) out.push(text);
  }
  return out;
}

/** Every string a content stream shows, with the position set by the last Tm. */
function shownStrings(stream: string): Shown[] {
  const out: Shown[] = [];
  const nums: number[] = [];
  let x = 0, y = 0;
  let pending: string[] = [];
  let i = 0;
  const n = stream.length;
  while (i < n) {
    const ch = stream[i];
    if (ch === '(') {
      // literal string: balanced parentheses, backslash escapes
      let depth = 1, text = '';
      i++;
      while (i < n && depth > 0) {
        const c = stream[i];
        if (c === '\\') {
          const e = stream[i + 1];
          const oct = /^[0-7]{1,3}/.exec(stream.slice(i + 1, i + 4));
          if (oct) { text += String.fromCharCode(parseInt(oct[0], 8)); i += 1 + oct[0].length; continue; }
          if (e === '\r' || e === '\n') { i += e === '\r' && stream[i + 2] === '\n' ? 3 : 2; continue; }
          text += ({ n: '\n', r: '\r', t: '\t', b: '\b', f: '\f' } as Record<string, string>)[e] ?? e;
          i += 2; continue;
        }
        if (c === '(') depth++;
        if (c === ')') { depth--; if (depth === 0) { i++; break; } }
        text += c; i++;
      }
      pending.push(text);
      continue;
    }
    if (/[-+.\d]/.test(ch)) {
      const m = /^[-+]?(\d+\.?\d*|\.\d+)/.exec(stream.slice(i, i + 32));
      if (m) { nums.push(parseFloat(m[0])); i += m[0].length; continue; }
    }
    if (/[A-Za-z'"*]/.test(ch)) {
      const m = /^[A-Za-z'"*]+\d?/.exec(stream.slice(i, i + 8))!;
      const op = m[0];
      if (op === 'Tm' && nums.length >= 6) { x = nums[nums.length - 2]; y = nums[nums.length - 1]; }
      if (op === 'Tj' || op === 'TJ' || op === "'" || op === '"') out.push({ x, y, text: pending.join('') });
      nums.length = 0;
      pending = [];
      i += op.length; continue;
    }
    i++;
  }
  return out;
}

export function parsePdfExport(bytes: Uint8Array): ParseResult {
  const table: string[][] = [];
  for (const stream of contentStreams(bytes)) {
    const shown = shownStrings(stream);
    // the column headings of this page give the column positions
    const head = (re: RegExp) => shown.find((s) => re.test(s.text.trim()));
    const hCdh = head(/^CDH$/i), hSeq = head(/^(Line\s*#|Seq(uence)?)$/i), hSrc = head(/^Calculation$/i);
    if (!hCdh || !hSeq || !hSrc) continue;
    let seq: string | undefined;
    for (const s of shown) {
      if (s === hCdh || s === hSeq || s === hSrc) continue;
      if (Math.abs(s.x - hSrc.x) < 1.5) { if (seq !== undefined) table.push(['', seq, s.text]); seq = undefined; continue; }
      const t = s.text.trim();
      if (s.x >= hSeq.x - 2 && s.x < hSrc.x - 2) { if (/^[0-9A-Za-z]{1,4}$/.test(t)) seq = t; continue; }
      if (s.x < hSeq.x - 2 && /^\d{1,5}$/.test(t)) table.push([t, '', '']);
    }
  }
  return toRows(table, ['CDH', 'Line #', 'Calculation'], 'cdd-pdf');
}
