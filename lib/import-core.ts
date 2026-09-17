// Pure, vscode-free import logic: turn a report export of calc source rows
// (one row per source line: CDH number, sequence, source text) into one calc
// per CDH. Shared by the extension command and the plain Node tests.
//
// Accepted inputs:
//   - Cognos XML dataset (Run as > XML), e.g. the delivered report
//     FEPY0080D "CDH Calc Source" (columns CDH, Sequence, Calculation)
//   - delimited text with a header row: Cognos CSV (UTF-16, tab delimited),
//     or a comma/tab export of a query on the calc source table
//     (py_cdh_no, pys_seq, pys_src)
//   - the PDF of the CDD report PY0080: see import-pdf.ts

export interface SrcRow {
  cdh: number;
  seq: string; // trimmed
  src: string; // trailing whitespace removed, leading kept
  title?: string;
  order: number; // position in the file, the tiebreaker
}

export interface ParseResult {
  format: 'cognos-xml' | 'delimited' | 'cdd-pdf';
  columns: string[];
  rows: SrcRow[];
  skipped: number; // rows without a numeric CDH
}

export interface ImportedCalc {
  cdh: number;
  title?: string;
  lines: string[];
  notes: string[]; // things the row data shows that the text alone cannot
}

export interface AssembleOptions {
  /** Applied to every calc when the whole export carries no indentation. */
  reindent?: (lines: string[]) => string[];
}

// ---------------------------------------------------------------------------
// Decoding
// ---------------------------------------------------------------------------

/** Cognos CSV is UTF-16LE with a BOM; everything else is normally UTF-8. */
export function decodeExport(bytes: Uint8Array): string {
  const b = bytes;
  if (b.length >= 2 && b[0] === 0xff && b[1] === 0xfe) return new TextDecoder('utf-16le').decode(b.subarray(2));
  if (b.length >= 2 && b[0] === 0xfe && b[1] === 0xff) return new TextDecoder('utf-16be').decode(b.subarray(2));
  if (b.length >= 3 && b[0] === 0xef && b[1] === 0xbb && b[2] === 0xbf) return new TextDecoder('utf-8').decode(b.subarray(3));
  // UTF-16 without a BOM: ASCII text shows a NUL in every other byte
  const n = Math.min(b.length, 400);
  let oddNul = 0, evenNul = 0;
  for (let i = 0; i < n; i++) if (b[i] === 0) (i % 2 ? oddNul++ : evenNul++);
  if (n >= 8 && oddNul > n / 4 && evenNul === 0) return new TextDecoder('utf-16le').decode(b);
  if (n >= 8 && evenNul > n / 4 && oddNul === 0) return new TextDecoder('utf-16be').decode(b);
  return new TextDecoder('utf-8').decode(b);
}

// ---------------------------------------------------------------------------
// Column matching
// ---------------------------------------------------------------------------
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
const COLS = {
  cdh: ['cdh', 'cdhno', 'cdhnumber', 'cdhnum', 'pycdhno'],
  seq: ['seq', 'sequence', 'seqno', 'pysseq', 'line', 'lineno'],
  src: ['calculation', 'src', 'source', 'pyssrc', 'calc', 'calccode', 'calcsource', 'formula'],
  title: ['title', 'description', 'desc', 'cdhtitle', 'cdhdescription', 'cdhdesc', 'shortdesc', 'name'],
};

interface ColumnMap { cdh: number; seq: number; src: number; title: number }

function mapColumns(header: string[]): ColumnMap | undefined {
  const names = header.map(norm);
  const find = (keys: string[]) => names.findIndex((n) => keys.includes(n));
  const m = { cdh: find(COLS.cdh), seq: find(COLS.seq), src: find(COLS.src), title: find(COLS.title) };
  return m.cdh >= 0 && m.seq >= 0 && m.src >= 0 ? m : undefined;
}

export function toRows(table: string[][], header: string[] | undefined, format: ParseResult['format']): ParseResult {
  let map = header ? mapColumns(header) : undefined;
  let data = table;
  if (!map && data.length && !header) {
    // no separate header: the first record is either the header or data
    map = mapColumns(data[0]);
    if (map) { header = data[0]; data = data.slice(1); }
  }
  // no recognizable header: take the columns by position (CDH, sequence, source, title)
  if (!map) map = { cdh: 0, seq: 1, src: 2, title: (header ?? data[0] ?? []).length > 3 ? 3 : -1 };

  const rows: SrcRow[] = [];
  let skipped = 0;
  let lastCdh: number | undefined;
  data.forEach((rec, order) => {
    const cdhText = (rec[map!.cdh] ?? '').trim();
    const seq = (rec[map!.seq] ?? '').trim();
    const src = (rec[map!.src] ?? '').replace(/\s+$/, '');
    // A grouped report prints the CDH once: on its own row, or on the first
    // line of the group only. Rows under it carry a sequence and no CDH.
    const grouped = cdhText === '' && lastCdh !== undefined && /^[0-9A-Za-z]{1,4}$/.test(seq);
    if (!/^\d{1,5}$/.test(cdhText) && !grouped) { skipped++; return; }
    if (!grouped) lastCdh = parseInt(cdhText, 10);
    if (seq === '' && src === '') return; // group header row
    const title = map!.title >= 0 ? (rec[map!.title] ?? '').trim() : '';
    rows.push({
      cdh: lastCdh!,
      seq,
      src,
      title: title || undefined,
      order,
    });
  });
  return { format, columns: header ?? [], rows, skipped };
}

// ---------------------------------------------------------------------------
// Cognos XML dataset
// ---------------------------------------------------------------------------
const ENTITIES: Record<string, string> = { lt: '<', gt: '>', amp: '&', quot: '"', apos: "'" };
const decodeEntities = (s: string) =>
  s.replace(/&(#x[0-9a-fA-F]+|#\d+|[a-zA-Z]+);/g, (whole, e: string) => {
    if (e[0] === '#') {
      const cp = e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return Number.isFinite(cp) ? String.fromCodePoint(cp) : whole;
    }
    return ENTITIES[e] ?? whole;
  });

function parseCognosXml(text: string): ParseResult {
  const body = text.replace(/<!--[\s\S]*?-->/g, '');
  const header = [...body.matchAll(/<item\b[^>]*?\bname\s*=\s*"([^"]*)"/g)].map((m) => decodeEntities(m[1]));
  const table: string[][] = [];
  for (const row of body.matchAll(/<row\b[^>]*>([\s\S]*?)<\/row>/g)) {
    const rec: string[] = [];
    for (const v of row[1].matchAll(/<value\b[^>]*?\/>|<value\b[^>]*>([\s\S]*?)<\/value>/g)) rec.push(decodeEntities(v[1] ?? ''));
    table.push(rec);
  }
  return toRows(table, header.length ? header : undefined, 'cognos-xml');
}

// ---------------------------------------------------------------------------
// Delimited text (comma or tab, RFC 4180 quoting)
// ---------------------------------------------------------------------------
function parseDelimited(text: string): ParseResult {
  const firstLine = text.slice(0, text.search(/\r?\n|$/));
  const count = (ch: string) => firstLine.split(ch).length - 1;
  const delim = count('\t') >= count(',') && count('\t') > 0 ? '\t' : count(';') > count(',') ? ';' : ',';

  const table: string[][] = [];
  let rec: string[] = [];
  let field = '';
  let i = 0;
  let quoted = false;
  let fieldStart = true;
  const endField = () => { rec.push(field); field = ''; fieldStart = true; };
  const endRecord = () => { endField(); if (rec.length > 1 || rec[0] !== '') table.push(rec); rec = []; };
  while (i < text.length) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"') {
        if (text[i + 1] === '"') { field += '"'; i += 2; continue; }
        quoted = false; i++; continue;
      }
      field += ch; i++; continue;
    }
    if (ch === '"' && fieldStart) { quoted = true; fieldStart = false; i++; continue; }
    if (ch === delim) { endField(); i++; continue; }
    if (ch === '\r' || ch === '\n') { endRecord(); i += ch === '\r' && text[i + 1] === '\n' ? 2 : 1; continue; }
    field += ch; fieldStart = false; i++;
  }
  if (field !== '' || rec.length) endRecord();
  return toRows(table, undefined, 'delimited');
}

export function parseExport(text: string): ParseResult {
  const t = text.replace(/^﻿/, '');
  return /^\s*<(\?xml|dataset)\b/.test(t) ? parseCognosXml(t) : parseDelimited(t);
}

// ---------------------------------------------------------------------------
// Assembly
// ---------------------------------------------------------------------------

// Sequence comes in more than one shape on the same system: rows saved from
// the calc editor carry a 4-digit decimal sequence ("0000".."0029"), loaded
// rows a short base-36 one ("00".."ZZ"), and both can sit in one calc (the
// decimal rows first, the base-36 tail continuing the count). Order by value
// per shape, then by position in the file.
function seqKey(seq: string): number {
  if (/^\d{4,}$/.test(seq)) return parseInt(seq, 10);
  if (/^[0-9A-Za-z]{1,3}$/.test(seq)) return parseInt(seq, 36);
  return Number.NaN;
}

export function assembleCalcs(rows: SrcRow[], opts: AssembleOptions = {}): ImportedCalc[] {
  // A delivered report can trim leading blanks. When nothing in the whole
  // export is indented, the indentation was lost on the way out, not absent.
  const lostIndent = rows.length > 0 && !rows.some((r) => /^\s+\S/.test(r.src));

  const byCdh = new Map<number, SrcRow[]>();
  for (const r of rows) (byCdh.get(r.cdh) ?? byCdh.set(r.cdh, []).get(r.cdh)!).push(r);

  const out: ImportedCalc[] = [];
  for (const [cdh, rs] of [...byCdh].sort((a, b) => a[0] - b[0])) {
    const notes: string[] = [];
    rs.sort((a, b) => {
      const ka = seqKey(a.seq), kb = seqKey(b.seq);
      return (Number.isNaN(ka) || Number.isNaN(kb) ? 0 : ka - kb) || a.order - b.order;
    });

    const seen = new Map<string, number>();
    for (const r of rs) seen.set(r.seq, (seen.get(r.seq) ?? 0) + 1);
    const dups = [...seen].filter(([, n]) => n > 1).map(([s]) => s);
    if (dups.length) notes.push(`sequence ${dups.slice(0, 8).join(', ')}${dups.length > 8 ? ', ...' : ''} appears more than once: the stored source has duplicate rows, review this calc on the system`);

    let lines = rs.map((r) => r.src);
    while (lines.length && lines[lines.length - 1] === '') lines.pop();
    if (lostIndent && opts.reindent) lines = opts.reindent(lines);
    out.push({ cdh, title: rs.find((r) => r.title)?.title, lines, notes });
  }
  return out;
}

// ---------------------------------------------------------------------------
// Where each calc goes
// ---------------------------------------------------------------------------

/** Folder per kind of CDH, by the first digit of the number. */
export const DEFAULT_TYPE_FOLDERS: Record<string, string> = { '1': 'PYUPCC', '2': 'PYUPDD', '3': 'PYUPHH' };
export const DEFAULT_FILE_PATTERN = '${cdh}.calc';

export interface PathOptions {
  /** Replaces ${label}: what this import is, such as prod or test. */
  label?: string;
  /** Replaces ${type}: first digit of the CDH number to folder name. */
  typeFolders?: Record<string, string>;
}

export const patternNeedsLabel = (pattern: string) => pattern.includes('${label}');

const slugOf = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40).replace(/-+$/, '');
const cleanSegment = (s: string) => s.replace(/[<>:"|?*\\\x00-\x1f]/g, '').replace(/^\.+$/, '').trim();

/**
 * Path of a calc file under the import folder, '/' separated, from a pattern:
 *   ${cdh}                      the CDH number
 *   ${label}                    the label given for this import (prod, test, a date)
 *   ${type}                     folder for the kind of CDH (typeFolders, by first digit)
 *   ${title}                    the CDH title as a slug, when the export has one
 * An empty ${label} or ${title} takes the separator in front of it along, so
 * "${cdh}-${title}.calc" is "1196.calc" for an export without titles.
 */
export function calcPath(c: Pick<ImportedCalc, 'cdh' | 'title'>, pattern = DEFAULT_FILE_PATTERN, opts: PathOptions = {}): string {
  const folders = opts.typeFolders ?? DEFAULT_TYPE_FOLDERS;
  const values: Record<string, string> = {
    cdh: String(c.cdh),
    label: cleanSegment(opts.label ?? '').replace(/\//g, ''),
    type: cleanSegment(folders[String(c.cdh)[0]] ?? folders.other ?? 'other'),
    title: slugOf(c.title ?? ''),
  };
  let path = (pattern.trim() || DEFAULT_FILE_PATTERN).replace(/\\/g, '/');
  path = path.replace(/([-._ ]?)\$\{(\w+)\}/g, (whole, sep: string, key: string) => (key in values ? (values[key] ? sep + values[key] : '') : whole));
  const segments = path.split('/').map(cleanSegment).filter((seg) => seg !== '' && seg !== '.' && seg !== '..');
  let name = segments.pop() ?? '';
  if (!/\.calc$/i.test(name)) name += '.calc';
  if (name.toLowerCase() === '.calc') name = `${c.cdh}.calc`;
  return [...segments, name].join('/');
}
