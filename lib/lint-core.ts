/**
 * lint-core.ts: the FE calc-code (.calc) checker, as a pure function.
 *
 * Single source of truth for every diagnostic. The CLI (scripts/fe-calc-lint.ts)
 * and the VSCode extension (tools/vscode-calccode, which bundles this file and
 * library.json so the .vsix is self-contained) both call `lint()`.
 *
 * No Node / Bun / VSCode APIs in here: data in, issues out. Messages are short,
 * plain ASCII, one idea each (they show up as squiggle text).
 *
 * Issue codes:
 *   width            line over the editor width (58): FE wraps the rest and merges tokens
 *   tab              tab character
 *   corrupt          known paste-corruption tokens (HOURSX, ENDIFIF, PYPX.BEG1DO ...)
 *   comment          unclosed << or stray >>
 *   block            IF/ELSE/ENDIF and DO/UNTIL structure, at the offending line
 *   syntax           a line that is not a statement
 *   assign-eq        `NVAR1 = 5` at statement start (= compares, := assigns)
 *   operator         == != THEN ENDDO ELSEIF END IF (other languages)
 *   lhs              assignment target is not a register or CLUSTER.ATTR
 *   paren / quote    unbalanced ( ) or " on a line
 *   cluster-unknown  cluster name not in the library
 *   attr-unknown     attribute not on that cluster (FE skips the calc silently)
 *   array-index      {n} missing / on a scalar / out of range
 *   type             register or attribute used with the wrong kind of value
 *   load-form        LOAD() first argument is not a proven CLUSTER.KEY
 *   load-unchecked   LOAD with no MSCX.STATUS check before the next LOAD / end
 *   goto             GOTO to an undefined label / label never used
 *   round-arg        ROUNDn / TRUNCn argument is not an NVAR
 *   uninit           register read but never assigned
 *   unknown-word     bare word that is not a keyword, function, label or cluster
 */

export type Severity = 'error' | 'warning' | 'info' | 'hint';

export interface Issue {
  line: number; // 1-based; 0 = whole file
  col: number; // 1-based
  endCol?: number; // 1-based exclusive
  severity: Severity;
  code: string;
  msg: string;
}

export interface LibraryAttr {
  desc?: string;
  n?: number;
  type?: string;
  catalog?: boolean;
}
export interface LibraryCluster {
  desc?: string;
  key?: string;
  catalog?: boolean;
  attrs: Record<string, LibraryAttr>;
}
export interface LibraryLike {
  keywords: string[];
  functions: string[];
  loadForms?: { form: string }[];
  clusters: Record<string, LibraryCluster>;
}
export interface RulesLike {
  maxLineWidth: number;
  comment: { open: string; close: string };
  corruptionPatterns: string[];
}
export interface LintOptions {
  library: LibraryLike;
  rules: RulesLike;
  /** unknown cluster / attribute names (default 'warning'; sites can define their own clusters) */
  unknownNameSeverity?: Severity;
  /** LOAD without a following MSCX.STATUS check (default 'hint') */
  loadUncheckedSeverity?: Severity | 'off';
  /** per rule code (the [code] of an issue): a severity for every finding of that rule, or 'off' */
  ruleSeverity?: Record<string, Severity | 'off' | 'default' | undefined>;
}

/** Every rule code the checker reports, with what it covers. */
export const RULE_CODES: Record<string, string> = {
  'width': "line over 58 characters (the editor wraps the 59th and merges tokens)",
  'tab': "tab character",
  'corrupt': "paste corruption such as PYPX.BEG1DO, HOURSX, ENDIFIF",
  'comment': "comment never closed, or a stray >>",
  'block': "IF/ELSE/ENDIF and DO/UNTIL structure",
  'syntax': "statements that are not calc code",
  'operator': "words and operators from other languages: ==, !=, THEN, ELSEIF, ENDDO",
  'assign-eq': "= used where := is meant",
  'lhs': "assignment to something that cannot be assigned",
  'paren': "unmatched parentheses",
  'quote': "string not closed on its line",
  'cluster-unknown': "cluster name not in the library",
  'attr-unknown': "attribute name not in the library",
  'array-index': "{n} missing, out of range, or used on a scalar",
  'load-form': "LOAD with a key other than the documented one",
  'load-unchecked': "LOAD not followed by an MSCX.STATUS check",
  'goto': "GOTO to a missing label, labels never used",
  'type': "NVAR and CVAR type mix-ups",
  'round-arg': "ROUND on something that is not an NVAR",
  'rate-round': "a rounded register assigned to .RATE",
  'uninit': "register read but never assigned",
  'unknown-word': "unknown function, or a bare word",
};

const LOGICAL = new Set(['AND', 'OR', 'NOT']);
const FOREIGN: Record<string, string> = {
  '==': 'use = to compare',
  '!=': 'use <> for not equal',
  THEN: 'the block starts on the next line',
  ELSEIF: 'close with ENDIF and open a new IF',
  ELIF: 'close with ENDIF and open a new IF',
  ENDDO: 'loops close with UNTIL condition',
  LOOP: 'loops are DO ... UNTIL condition',
  WHILE: 'loops are DO ... UNTIL condition',
  'END IF': 'spell it ENDIF',
  ENDWHILE: 'loops close with UNTIL condition',
  RETURN: 'use STOP',
  EXIT: 'use STOP',
  PRINT: 'use WARN("TEXT", value)',
  NULL: 'compare to "" or 0',
};

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Comment-stripped copy that PRESERVES line count and column positions
 * (comment text becomes spaces), plus the line index of any unclosed opener.
 */
export function codeLines(text: string, open: string, close: string): { lines: string[]; unclosedAt: number; strayCloseAt: number[] } {
  const out: string[] = [];
  const strayCloseAt: number[] = [];
  let inComment = false;
  let openedAt = -1;
  const src = text.split(/\r?\n/);
  for (let i = 0; i < src.length; i++) {
    const line = src[i];
    let result = '';
    let pos = 0;
    while (pos < line.length) {
      if (inComment) {
        const ci = line.indexOf(close, pos);
        if (ci < 0) { result += ' '.repeat(line.length - pos); pos = line.length; break; }
        result += ' '.repeat(ci + close.length - pos);
        pos = ci + close.length;
        inComment = false;
        continue;
      }
      const oi = line.indexOf(open, pos);
      const ci = line.indexOf(close, pos);
      if (ci >= 0 && (oi < 0 || ci < oi)) {
        strayCloseAt.push(i);
        result += line.slice(pos, ci) + ' '.repeat(close.length);
        pos = ci + close.length;
        continue;
      }
      if (oi < 0) { result += line.slice(pos); pos = line.length; break; }
      result += line.slice(pos, oi) + ' '.repeat(open.length);
      pos = oi + open.length;
      inComment = true;
      openedAt = i;
    }
    out.push(result);
  }
  return { lines: out, unclosedAt: inComment ? openedAt : -1, strayCloseAt };
}

interface Tok { t: 'num' | 'str' | 'reg' | 'attr' | 'word' | 'op' | 'lp' | 'rp' | 'comma' | 'lb' | 'rb'; v: string; col: number; end: number; cluster?: string; attr?: string; index?: string }

function tokenize(line: string): Tok[] {
  const toks: Tok[] = [];
  // CLUSTER.ATTR{n}: FE accepts whitespace before the index brace (live 2003 has `NUCD.ASVAL {2}`).
  // A dotted name whose left part is not 4 chars is still captured so the cluster check can report it.
  const re = /("([^"]*)"?)|(\d+(?:\.\d+)?)|([NC]VAR[0-9]\b)|(([A-Z][A-Z0-9]*)\.([A-Za-z][A-Za-z0-9]*)(?:\s*(\{[^}]*\}))?)|([A-Za-z_][A-Za-z0-9_]*)|(:=|<>|>=|<=|==|!=|[=<>+\-*\/])|(\()|(\))|(,)|(\[)|(\])|(\S)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(line))) {
    const col = m.index + 1, end = m.index + m[0].length + 1;
    if (m[1] !== undefined) toks.push({ t: 'str', v: m[1], col, end });
    else if (m[3] !== undefined) toks.push({ t: 'num', v: m[3], col, end });
    else if (m[4] !== undefined) toks.push({ t: 'reg', v: m[4], col, end });
    else if (m[5] !== undefined) toks.push({ t: 'attr', v: m[5], col, end, cluster: m[6], attr: m[7], index: m[8] });
    else if (m[9] !== undefined) toks.push({ t: 'word', v: m[9], col, end });
    else if (m[10] !== undefined) toks.push({ t: 'op', v: m[10], col, end });
    else if (m[11] !== undefined) toks.push({ t: 'lp', v: '(', col, end });
    else if (m[12] !== undefined) toks.push({ t: 'rp', v: ')', col, end });
    else if (m[13] !== undefined) toks.push({ t: 'comma', v: ',', col, end });
    else if (m[14] !== undefined) toks.push({ t: 'lb', v: '[', col, end });
    else if (m[15] !== undefined) toks.push({ t: 'rb', v: ']', col, end });
    else toks.push({ t: 'op', v: m[0], col, end });
  }
  return toks;
}

/**
 * "did you mean": nearest candidate by optimal-string-alignment distance (a
 * transposition like PBXS -> PBSX costs 1), max distance 2, ties broken by the
 * shorter name.
 */
function similar(name: string, candidates: string[]): string | undefined {
  let best: string | undefined, bestD = 3;
  for (const c of candidates) {
    if (c === name) continue;
    let d = osa(name, c);
    if (d > 2 && c.length >= 3 && name.startsWith(c)) d = 2; // SALARY -> SAL
    if (d > 2) continue;
    if (d < bestD || (d === bestD && best && c.length < best.length)) { bestD = d; best = c; }
  }
  return best;
}
function osa(a: string, b: string): number {
  if (Math.abs(a.length - b.length) > 2) return 9;
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) dp[i][j] = Math.min(dp[i][j], dp[i - 2][j - 2] + 1);
    }
  return dp[a.length][b.length];
}

const dym = (s?: string) => (s ? `, did you mean ${s}` : '');

export function lint(text: string, opts: LintOptions): Issue[] {
  const { library, rules } = opts;
  const unknownSev: Severity = opts.unknownNameSeverity ?? 'warning';
  const loadUncheckedSev = opts.loadUncheckedSeverity ?? 'hint';
  const issues: Issue[] = [];
  const push = (line: number, col: number, severity: Severity, code: string, msg: string, endCol?: number) =>
    issues.push({ line, col, endCol, severity, code, msg });

  const rawLines = text.split(/\r?\n/);
  const { open, close } = rules.comment;

  // ---- per raw line: width, tabs, corruption --------------------------------
  rawLines.forEach((ln, i) => {
    if (ln.length > rules.maxLineWidth)
      push(i + 1, rules.maxLineWidth + 1, 'error', 'width', `line is ${ln.length} chars, limit ${rules.maxLineWidth}: FE wraps the rest and merges tokens`, ln.length + 1);
    const ti = ln.indexOf('\t');
    if (ti >= 0) push(i + 1, ti + 1, 'warning', 'tab', 'tab character, use spaces', ti + 2);
    for (const pat of rules.corruptionPatterns) {
      const ci = ln.indexOf(pat);
      if (ci >= 0) push(i + 1, ci + 1, 'error', 'corrupt', `corrupted token ${pat} (paste damage)`, ci + pat.length + 1);
    }
  });

  // ---- comments --------------------------------------------------------------
  const cl = codeLines(text, open, close);
  if (cl.unclosedAt >= 0) {
    const col = rawLines[cl.unclosedAt].lastIndexOf(open) + 1;
    push(cl.unclosedAt + 1, col, 'error', 'comment', `comment ${open} is never closed, the code after it is swallowed`, col + open.length);
  }
  for (const i of cl.strayCloseAt) {
    const col = rawLines[i].indexOf(close) + 1;
    push(i + 1, col, 'warning', 'comment', `stray ${close} with no ${open}`, col + close.length);
  }
  const code = cl.lines;

  // ---- library lookups ----------------------------------------------------------
  const clusters = library.clusters;
  const keywords = new Set(library.keywords.map((k) => k.toUpperCase()));
  const functions = new Set(library.functions.map((f) => f.toUpperCase()));
  // LOAD key attributes come from the documented load forms (the catalog's "key" column is
  // the table key, not what LOAD takes: HBSX is keyed NO but LOADs by CLS).
  const loadKeys = new Map<string, Set<string>>();
  for (const f of library.loadForms ?? [])
    for (const m of f.form.matchAll(/LOAD\(\s*([A-Z]{4})\.([A-Z]+)/g)) (loadKeys.get(m[1]) ?? loadKeys.set(m[1], new Set()).get(m[1])!).add(m[2]);

  // ---- pass 1: statements, tokens, structure --------------------------------------
  interface Frame { kw: 'IF' | 'DO'; line: number; hadElse?: boolean }
  const stack: Frame[] = [];
  const labelsDefined = new Map<string, number>();
  const gotos: { name: string; line: number; col: number }[] = [];
  const assigned = new Set<string>();
  const regReads: { v: string; line: number; col: number }[] = [];
  const loads: { line: number }[] = [];
  const statusChecks: number[] = [];

  const checkAttr = (tok: Tok, lineNo: number) => {
    const id = tok.cluster!, at = tok.attr!.toUpperCase();
    const c = clusters[id];
    if (id.length !== 4) {
      push(lineNo, tok.col, unknownSev, 'cluster-unknown', `${id} is not a cluster, cluster names are 4 characters${dym(similar(id, Object.keys(clusters)))}`, tok.col + id.length);
      return;
    }
    if (!c) {
      push(lineNo, tok.col, unknownSev, 'cluster-unknown', `unknown cluster ${id}${dym(similar(id, Object.keys(clusters)))}`, tok.col + id.length);
      return;
    }
    if (tok.attr !== at) push(lineNo, tok.col + id.length + 1, 'error', 'attr-unknown', `attributes are upper case: ${id}.${at}`, tok.end);
    const key = `${id}.${at}`;
    const a = c.attrs[at];
    if (!a) {
      const near = similar(at, Object.keys(c.attrs));
      push(lineNo, tok.col + id.length + 1, unknownSev, 'attr-unknown', `${id} has no attribute ${at}${dym(near ? `${id}.${near}` : undefined)}. FE skips the whole calc silently on a bad attribute`, tok.col + id.length + 1 + at.length);
      return;
    }
    // array index
    const n = a.n ?? 1;
    if (tok.index) {
      const inner = tok.index.slice(1, -1).trim();
      if (n <= 1) push(lineNo, tok.col, 'error', 'array-index', `${key} is not an array, remove {${inner}}`, tok.end);
      else if (/^\d+$/.test(inner)) {
        const i = parseInt(inner, 10);
        if (i < 1 || i > n) push(lineNo, tok.col, 'error', 'array-index', `${key} index ${i} is out of range 1..${n}`, tok.end);
      } else if (inner === '') push(lineNo, tok.col, 'error', 'array-index', `${key} needs an index 1..${n}`, tok.end);
    } else if (n > 1) {
      push(lineNo, tok.col, 'warning', 'array-index', `${key} is an array, add an index 1..${n}`, tok.end);
    }
  };

  for (let i = 0; i < code.length; i++) {
    const lineNo = i + 1;
    const ln = code[i];
    if (ln.trim() === '') continue;
    const toks = tokenize(ln);
    if (!toks.length) continue;

    // quotes / parens balance
    for (const t of toks) if (t.t === 'str' && !t.v.endsWith('"')) push(lineNo, t.col, 'error', 'quote', 'string is not closed on this line', t.end);
    let depth = 0;
    for (const t of toks) {
      if (t.t === 'lp') depth++;
      if (t.t === 'rp') { depth--; if (depth < 0) { push(lineNo, t.col, 'error', 'paren', 'unmatched )', t.end); depth = 0; } }
    }
    if (depth > 0) push(lineNo, toks[toks.length - 1].end, 'error', 'paren', 'missing )');

    // foreign syntax
    for (const t of toks) {
      const k = t.v.toUpperCase();
      if ((t.t === 'op' || t.t === 'word') && FOREIGN[k]) push(lineNo, t.col, 'error', 'operator', `${t.v} is not calc code, ${FOREIGN[k]}`, t.end);
    }
    if (toks.length >= 2 && toks[0].t === 'word' && toks[0].v.toUpperCase() === 'END' && toks[1].v.toUpperCase() === 'IF')
      push(lineNo, toks[0].col, 'error', 'operator', `END IF is not calc code, ${FOREIGN['END IF']}`, toks[1].end);

    const first = toks[0];
    const head = first.t === 'word' ? first.v.toUpperCase() : '';

    // A line that starts with AND / OR continues the condition of the previous IF or
    // UNTIL (FE joins the rows). Only allowed right after a condition line.
    const prevCode = (() => { for (let j = i - 1; j >= 0; j--) if (code[j].trim() !== '') return code[j].trim().toUpperCase(); return ''; })();
    const isContinuation = first.t === 'word' && (head === 'AND' || head === 'OR');
    if (isContinuation) {
      if (!/^(IF|UNTIL|AND|OR)\b/.test(prevCode))
        push(lineNo, first.col, 'error', 'syntax', `${head} continues a condition but the previous line is not an IF or UNTIL`, first.end);
      if (toks.length === 1) push(lineNo, first.col, 'error', 'syntax', `${head} needs a comparison after it`, first.end);
    }

    // ---- statement shape -------------------------------------------------------
    if (isContinuation) {
      /* token checks below still run */
    } else if (head === 'IF') {
      if (toks.length === 1) push(lineNo, first.col, 'error', 'syntax', 'IF needs a condition on the same line', first.end);
      const last = toks[toks.length - 1];
      const nextCode = (() => { for (let j = i + 1; j < code.length; j++) if (code[j].trim() !== '') return code[j].trim().toUpperCase(); return ''; })();
      if (last.t === 'word' && LOGICAL.has(last.v.toUpperCase()) && !/^(AND|OR)\b/.test(nextCode))
        push(lineNo, last.col, 'error', 'syntax', `condition ends with ${last.v.toUpperCase()}`, last.end);
      if (toks.some((t) => t.t === 'op' && t.v === ':=')) push(lineNo, first.col, 'error', 'syntax', ':= inside an IF condition, use = to compare', first.end);
      stack.push({ kw: 'IF', line: lineNo });
    } else if (head === 'ELSE') {
      const top = stack[stack.length - 1];
      if (!top || top.kw !== 'IF') push(lineNo, first.col, 'error', 'block', 'ELSE without an open IF', first.end);
      else if (top.hadElse) push(lineNo, first.col, 'error', 'block', `second ELSE for the IF on line ${top.line}`, first.end);
      else top.hadElse = true;
      if (toks.length > 1) push(lineNo, toks[1].col, 'error', 'syntax', 'nothing may follow ELSE on the same line', toks[toks.length - 1].end);
    } else if (head === 'ENDIF') {
      const top = stack[stack.length - 1];
      if (!top || top.kw !== 'IF') push(lineNo, first.col, 'error', 'block', top ? `ENDIF closes nothing, the open block is the DO on line ${top.line}` : 'ENDIF without an open IF', first.end);
      else stack.pop();
      if (toks.length > 1) push(lineNo, toks[1].col, 'error', 'syntax', 'nothing may follow ENDIF on the same line', toks[toks.length - 1].end);
    } else if (head === 'DO') {
      if (toks.length > 1) push(lineNo, toks[1].col, 'error', 'syntax', 'DO takes no condition, the loop test is on the UNTIL line', toks[toks.length - 1].end);
      stack.push({ kw: 'DO', line: lineNo });
    } else if (head === 'UNTIL') {
      const top = stack[stack.length - 1];
      if (!top || top.kw !== 'DO') push(lineNo, first.col, 'error', 'block', top ? `UNTIL closes nothing, the open block is the IF on line ${top.line}` : 'UNTIL without an open DO', first.end);
      else stack.pop();
      if (toks.length === 1) push(lineNo, first.col, 'error', 'syntax', 'UNTIL needs a condition', first.end);
      if (/MSCX\.STATUS/.test(ln)) statusChecks.push(lineNo);
    } else if (head === 'GOTO') {
      if (toks.length !== 2 || toks[1].t !== 'word') push(lineNo, first.col, 'error', 'syntax', 'GOTO needs exactly one label name', toks[toks.length - 1].end);
      else gotos.push({ name: toks[1].v.toUpperCase(), line: lineNo, col: toks[1].col });
    } else if (head === 'STOP') {
      if (toks.length > 1) push(lineNo, toks[1].col, 'error', 'syntax', 'nothing may follow STOP', toks[toks.length - 1].end);
    } else if (first.t === 'word' && toks.length === 1 && !keywords.has(head) && !functions.has(head)) {
      // label definition
      if (labelsDefined.has(head)) push(lineNo, first.col, 'error', 'goto', `label ${head} is defined twice, first on line ${labelsDefined.get(head)}`, first.end);
      labelsDefined.set(head, lineNo);
      continue;
    } else if (first.t === 'word' && toks[1]?.t === 'lp') {
      // function call statement: LOAD(...), WARN(...), ROUND2(...)
      const fn = head;
      if (!functions.has(fn) && !/^(ROUND|TRUNC)[0-9]$/.test(fn))
        push(lineNo, first.col, 'error', 'unknown-word', `unknown function ${fn}${dym(similar(fn, [...functions]))}`, first.end);
      if (fn === 'LOAD') {
        const a1 = toks[2];
        if (!a1 || a1.t !== 'attr') push(lineNo, a1?.col ?? first.end, 'error', 'load-form', 'LOAD(CLUSTER.KEY, value): first argument must be a cluster key, e.g. LOAD(PBSX.CLS, 1)', a1?.end);
        else {
          const c = clusters[a1.cluster!];
          if (c && loadKeys.has(a1.cluster!) && !loadKeys.get(a1.cluster!)!.has(a1.attr!.toUpperCase()))
            push(lineNo, a1.col, 'warning', 'load-form', `LOAD key for ${a1.cluster} is ${[...loadKeys.get(a1.cluster!)!].map((k) => `${a1.cluster}.${k}`).join(' or ')}`, a1.end);
          if (!toks.some((t) => t.t === 'comma')) push(lineNo, a1.end, 'error', 'load-form', 'LOAD needs a second argument, the value to look up', a1.end + 1);
        }
        loads.push({ line: lineNo });
      }
      if (/^(ROUND|TRUNC)[0-9]$/.test(fn)) {
        const a1 = toks[2];
        if (!a1 || a1.t !== 'reg' || !a1.v.startsWith('NVAR')) push(lineNo, a1?.col ?? first.end, 'error', 'round-arg', `${fn} works in place on an NVAR`, a1?.end);
      }
      if (fn === 'WARN') {
        const a1 = toks[2];
        if (a1 && a1.t !== 'str') push(lineNo, a1.col, 'hint', 'syntax', 'WARN usually starts with a quoted label: WARN("TEXT", value)', a1.end);
      }
    } else {
      // assignment?
      const eqi = toks.findIndex((t) => t.t === 'op' && t.v === ':=');
      const plainEq = toks.findIndex((t) => t.t === 'op' && t.v === '=');
      if (eqi < 0 && plainEq > 0 && (first.t === 'reg' || first.t === 'attr')) {
        push(lineNo, toks[plainEq].col, 'error', 'assign-eq', '= compares, use := to assign', toks[plainEq].end);
      } else if (eqi < 0) {
        if (first.t === 'word') push(lineNo, first.col, 'error', 'syntax', `${first.v} is not a statement${dym(similar(head, [...keywords, ...functions]))}`, first.end);
        else push(lineNo, first.col, 'error', 'syntax', 'not a statement: expected X := value, IF, ELSE, ENDIF, DO, UNTIL, GOTO, STOP, a label or a call', toks[toks.length - 1].end);
      } else {
        const lhs = toks.slice(0, eqi);
        const ok =
          (lhs.length === 1 && (lhs[0].t === 'reg' || lhs[0].t === 'attr')) ||
          (lhs[0].t === 'reg' && lhs[0].v.startsWith('CVAR') && lhs[1]?.t === 'lb' && lhs[lhs.length - 1].t === 'rb');
        if (!ok) push(lineNo, first.col, 'error', 'lhs', 'assign to NVARn, CVARn, CVARn[start,len] or CLUSTER.ATTR', toks[eqi].col);
        if (lhs[0].t === 'reg') assigned.add(lhs[0].v);
        if (eqi === toks.length - 1) push(lineNo, toks[eqi].end, 'error', 'syntax', 'nothing after :=');
        const rhs = toks.slice(eqi + 1);
        if (lhs[0].t === 'reg' && rhs.length === 1) {
          if (lhs[0].v.startsWith('NVAR') && rhs[0].t === 'str') push(lineNo, rhs[0].col, 'error', 'type', `${lhs[0].v} is numeric, it cannot hold a string`, rhs[0].end);
          if (lhs[0].v.startsWith('CVAR') && rhs[0].t === 'num') push(lineNo, rhs[0].col, 'warning', 'type', `${lhs[0].v} is a character register, assign a quoted string`, rhs[0].end);
        }
        if (toks.filter((t) => t.t === 'op' && t.v === ':=').length > 1) push(lineNo, toks[eqi].col, 'error', 'syntax', 'one assignment per line', toks[eqi].end);
      }
    }

    // ---- token-level checks on every statement ----------------------------------
    for (let k = 0; k < toks.length; k++) {
      const t = toks[k];
      if (t.t === 'attr') checkAttr(t, lineNo);
      else if (t.t === 'reg') {
        const isLhs = k === 0 && toks.some((x) => x.t === 'op' && x.v === ':=');
        const isRoundArg = k === 2 && toks[0].t === 'word' && /^(ROUND|TRUNC)[0-9]$/.test(toks[0].v.toUpperCase());
        if (!isLhs && !isRoundArg) regReads.push({ v: t.v, line: lineNo, col: t.col });
        if (t.v.startsWith('NVAR') && toks[k + 1]?.t === 'lb') push(lineNo, t.col, 'error', 'type', 'substring [start,len] only works on a CVAR', toks[k + 1].end);
      } else if (t.t === 'word' && k > 0) {
        const w = t.v.toUpperCase();
        if (head === 'GOTO') continue;
        if (keywords.has(w) || LOGICAL.has(w) || functions.has(w) || /^(ROUND|TRUNC)[0-9]$/.test(w)) continue;
        if (FOREIGN[w]) continue;
        if (toks[k + 1]?.t === 'lp') push(lineNo, t.col, 'error', 'unknown-word', `unknown function ${w}${dym(similar(w, [...functions]))}`, t.end);
        else if (/^[A-Z]{4}$/.test(w) && clusters[w]) push(lineNo, t.col, 'error', 'syntax', `${w} needs an attribute, e.g. ${w}.${clusters[w].key ?? 'ATTR'}`, t.end);
        else push(lineNo, t.col, 'warning', 'unknown-word', `${t.v} is not a keyword, register, cluster or label`, t.end);
      }
      // comparison type hints: register vs literal of the other kind
      if (t.t === 'op' && (t.v === '=' || t.v === '<>' || t.v === '>' || t.v === '<' || t.v === '>=' || t.v === '<=')) {
        const l = toks[k - 1], r = toks[k + 1];
        if (l?.t === 'reg' && r?.t === 'str' && l.v.startsWith('NVAR')) push(lineNo, r.col, 'warning', 'type', `${l.v} is numeric but is compared to a string`, r.end);
        if (l?.t === 'reg' && r?.t === 'num' && l.v.startsWith('CVAR')) push(lineNo, r.col, 'warning', 'type', `${l.v} is a character register but is compared to a number`, r.end);
        const lt = l?.t === 'attr' && l.cluster ? clusters[l.cluster]?.attrs[l.attr!.toUpperCase()]?.type : undefined;
        if (lt && r?.t === 'str' && !/^CH|^SS/.test(lt)) push(lineNo, r.col, 'warning', 'type', `${l!.cluster}.${l!.attr} is numeric (${lt}) but is compared to a string`, r.end);
      }
    }
    if (/MSCX\.STATUS/.test(ln)) statusChecks.push(lineNo);
  }

  // ---- unclosed blocks -------------------------------------------------------------
  for (const f of stack) push(f.line, 1, 'error', 'block', `${f.kw} on line ${f.line} has no ${f.kw === 'IF' ? 'ENDIF' : 'UNTIL'}`, 1 + f.kw.length);

  // ---- labels ----------------------------------------------------------------------
  const used = new Set<string>();
  for (const g of gotos) {
    used.add(g.name);
    if (!labelsDefined.has(g.name)) push(g.line, g.col, 'error', 'goto', `no label ${g.name}, a label is the bare name alone on a line`, g.col + g.name.length);
  }
  for (const [name, line] of labelsDefined) if (!used.has(name)) push(line, 1, 'hint', 'goto', `label ${name} is never used by a GOTO`, 1 + name.length);

  // ---- LOAD without a status check ---------------------------------------------------
  if (loadUncheckedSev !== 'off') {
    for (let k = 0; k < loads.length; k++) {
      const from = loads[k].line, to = loads[k + 1]?.line ?? Number.MAX_SAFE_INTEGER;
      if (!statusChecks.some((l) => l > from && l < to)) push(from, 1, loadUncheckedSev, 'load-unchecked', 'no MSCX.STATUS check after this LOAD', 5);
    }
  }

  // ---- uninitialised registers ---------------------------------------------------------
  const flagged = new Set<string>();
  for (const r of regReads) {
    if (!assigned.has(r.v) && !flagged.has(r.v)) {
      flagged.add(r.v);
      push(r.line, r.col, 'warning', 'uninit', `${r.v} is read but never assigned`, r.col + r.v.length);
    }
  }

  // ---- ROUND2 on a rate ------------------------------------------------------------------
  // The engine carries rates at five decimals and rounds only the money it derives from them.
  // Rounding a register that ends up in *.RATE shifts the amount (10 h x 55.69892 = 556.99, but
  // 10 h x 55.70 = 557.00). Flag ROUND2(X) when X is assigned to a .RATE attribute anywhere.
  {
    const rateRegs = new Set<string>();
    for (const ln of code) { const m = /\b\w+\.RATE\s*:=\s*([A-Z]VAR\d+)\b/i.exec(ln); if (m) rateRegs.add(m[1].toUpperCase()); }
    if (rateRegs.size) code.forEach((ln, i) => {
      const re = /\bROUND\d*\s*\(\s*([A-Z]VAR\d+)\s*\)/gi; let m: RegExpExecArray | null;
      while ((m = re.exec(ln))) if (rateRegs.has(m[1].toUpperCase()))
        push(i + 1, m.index + 1, 'warning', 'rate-round', `${m[1].toUpperCase()} is rounded but assigned to .RATE: rates keep 5 decimals, round only amounts`, m.index + m[0].length + 1);
    });
  }

  issues.sort((a, b) => a.line - b.line || a.col - b.col);
  const over = opts.ruleSeverity;
  if (!over) return issues;
  return issues.flatMap((i) => {
    const sev = over[i.code];
    if (sev === 'off') return [];
    return sev && sev !== 'default' ? [{ ...i, severity: sev }] : [i];
  });
}

/** True when any issue is an error (used for exit codes). */
export const hasErrors = (issues: Issue[]) => issues.some((i) => i.severity === 'error');
