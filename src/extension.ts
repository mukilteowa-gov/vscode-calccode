import * as vscode from 'vscode';
import { join } from 'path';
import { reindent } from './format';
import { lint, type Issue, type Severity } from '../lib/lint-core';
import { assembleCalcs, calcPath, decodeExport, parseExport, patternNeedsLabel, DEFAULT_FILE_PATTERN, DEFAULT_TYPE_FOLDERS } from '../lib/import-core';
import { isPdf, parsePdfExport } from '../lib/import-pdf';
// Bundled at build time (esbuild) so the .vsix is self-contained.
import libraryJson from '../lib/library.json';
import rulesJson from '../lib/rules.json';

const LANG = 'calccode';

// ---------------------------------------------------------------------------
// Library (lib/library.json, generated; see DEVELOPING.md) plus site additions
// from the calccode.library.extraClusters setting.
// ---------------------------------------------------------------------------
interface LibAttr {
  desc: string;
  type?: string;
  typeLabel?: string;
  len?: number;
  n?: number;
  catalog: boolean;
}
interface LibCluster {
  desc: string;
  kind: string;
  key?: string;
  table?: string;
  mask?: string;
  title?: string;
  note?: string;
  catalog: boolean;
  attrs: Record<string, LibAttr>;
}
interface Library {
  generated: string;
  loadForms: { form: string; returns: string }[];
  keywords: string[];
  functions: string[];
  values: Record<string, { code: string; label?: string; p?: number }[]>;
  clusters: Record<string, LibCluster>;
}
const BASE = libraryJson as unknown as Library;
let LIB: Library = BASE;

/** Merge calccode.library.extraClusters into a fresh copy of the bundled library. */
function loadLibrary(): Library {
  const extra = vscode.workspace.getConfiguration('calccode').get<Record<string, Partial<LibCluster>>>('library.extraClusters', {}) ?? {};
  if (!Object.keys(extra).length) return BASE;
  const lib: Library = { ...BASE, clusters: { ...BASE.clusters } };
  for (const [rawId, def] of Object.entries(extra)) {
    const id = rawId.toUpperCase();
    if (!/^[A-Z][A-Z0-9]{3}$/.test(id) || !def || typeof def !== 'object') continue;
    const base = lib.clusters[id];
    const attrs: Record<string, LibAttr> = { ...(base?.attrs ?? {}) };
    for (const [rawAt, a] of Object.entries(def.attrs ?? {})) {
      const at = rawAt.toUpperCase();
      attrs[at] = { desc: a?.desc ?? '', n: a?.n, type: a?.type, typeLabel: a?.typeLabel, catalog: false };
    }
    lib.clusters[id] = { desc: def.desc ?? base?.desc ?? '', kind: def.kind ?? base?.kind ?? 'site', key: def.key ?? base?.key, mask: def.mask ?? base?.mask, note: def.note ?? base?.note ?? 'site-specific cluster (calccode.library.extraClusters)', catalog: base?.catalog ?? false, attrs };
  }
  return lib;
}
const RULES = rulesJson as { maxLineWidth: number; comment: { open: string; close: string }; corruptionPatterns: string[] };


const KEYWORD_DOC: Record<string, string> = {
  IF: '`IF condition` ... `ELSE` ... `ENDIF`. Compare with = <> > < >= <=, join with AND / OR. A condition may continue on a following line that starts with AND / OR.',
  ELSE: 'Alternative branch of the enclosing `IF`. Alone on its line.',
  ENDIF: 'Closes the nearest open `IF`. Alone on its line.',
  DO: '`DO` ... `UNTIL condition` loop. The body runs at least once, the test is on the UNTIL line. Typical: LOAD(PYPX.CLS, NVAR5) per pass until MSCX.STATUS = "FAILED".',
  UNTIL: 'Closes the nearest open `DO` and gives the exit condition.',
  GOTO: '`GOTO LABEL` jumps to a label, the bare label name alone on a line. Used to skip the rest of a calc.',
  STOP: 'Ends the calc immediately. Whatever was assigned to `CNTX/DEDX/HRSX.AMT` so far is the result.',
  AND: 'Logical AND in a condition.',
  OR: 'Logical OR in a condition.',
  LOAD: '`LOAD(CLUSTER.KEY, value)` fetches a record into a cluster. Only the proven forms work, anything else is ignored and MSCX.STATUS stays empty. Follow with IF MSCX.STATUS = "FAILED".',
  WARN: '`WARN("label", value)` prints a line to the WARN200 report.',
  ROUND0: 'Rounds an NVAR in place to 0 decimals.',
  ROUND2: 'Rounds an NVAR in place to 2 decimals. Do this before assigning the AMT.',
  TRUNC2: 'Truncates an NVAR in place to 2 decimals.',
};

function attrMarkdown(id: string, at: string, a: LibAttr): vscode.MarkdownString {
  const c = LIB.clusters[id];
  const name = a.n && a.n > 1 ? `${id}.${at}{1..${a.n}}` : `${id}.${at}`;
  const md = new vscode.MarkdownString();
  md.appendMarkdown(`**\`${name}\`** ${a.desc || '(no description)'}\n\n`);
  const type = [a.typeLabel ?? a.type, a.len ? `len ${a.len}` : ''].filter(Boolean).join(', ');
  if (type) md.appendMarkdown(`Type: ${type}\n\n`);
  if (!a.catalog) md.appendMarkdown(`Listed in the Cluster_attribute_PY Reference workbook, not in the PYUPCL catalog dump.\n\n`);
  md.appendMarkdown(`---\n\n**${id}** ${c?.desc ?? ''}${c?.mask ? `, mask ${c.mask}` : ''}`);
  if (c?.note) md.appendMarkdown(`\n\n${c.note}`);
  return md;
}

function clusterMarkdown(id: string, c: LibCluster): vscode.MarkdownString {
  const md = new vscode.MarkdownString();
  md.appendMarkdown(`**${id}** ${c.desc || c.title || ''}\n\n`);
  md.appendMarkdown(`${[c.mask ? `mask ${c.mask}` : '', c.kind ? `${c.kind} cluster` : '', c.key ? `key ${c.key}` : '', c.table ? `table ${c.table}` : ''].filter(Boolean).join(', ')}\n\n`);
  if (c.note) md.appendMarkdown(`${c.note}\n\n`);
  const forms = LIB.loadForms.filter((f) => f.form.includes(`${id}.`));
  for (const f of forms) md.appendMarkdown(`\`${f.form}\` returns ${f.returns}\n\n`);
  md.appendMarkdown(`${Object.keys(c.attrs).length} attributes`);
  return md;
}

// ---------------------------------------------------------------------------
// Activation
// ---------------------------------------------------------------------------
export function activate(context: vscode.ExtensionContext) {
  LIB = loadLibrary();
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((e) => { if (e.affectsConfiguration('calccode.library')) LIB = loadLibrary(); }),
    vscode.languages.registerCompletionItemProvider(LANG, new FecalcCompletionProvider(), '.', '=', '"', '(', '{', ' ', ','),
    vscode.languages.registerHoverProvider(LANG, new FecalcHoverProvider()),
    vscode.languages.registerDefinitionProvider(LANG, new FecalcDefinitionProvider()),
    vscode.languages.registerDocumentSymbolProvider(LANG, new FecalcSymbolProvider()),
    vscode.languages.registerDocumentFormattingEditProvider(LANG, new FecalcFormatter()),
    vscode.languages.registerCodeActionsProvider(LANG, new FecalcCodeActions(), { providedCodeActionKinds: [vscode.CodeActionKind.QuickFix] }),
    vscode.commands.registerCommand('calccode.openReference', () => {
      const uri = vscode.Uri.file(join(context.extensionPath, 'reference.md'));
      void vscode.commands.executeCommand('markdown.showPreview', uri);
    }),
    vscode.commands.registerCommand('calccode.lintFile', () => {
      const doc = vscode.window.activeTextEditor?.document;
      if (doc && doc.languageId === LANG) void lintDocument(doc, diagnostics);
    }),
    vscode.commands.registerCommand('calccode.lintWorkspace', () => lintWorkspace(diagnostics)),
    vscode.commands.registerCommand('calccode.importExport', () => importExport(diagnostics, context)),
  );
  const diagnostics = registerDiagnostics(context);
}

export function deactivate() {}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const ATTR_RE = /\b([A-Z][A-Z0-9]{3})\.([A-Za-z][A-Za-z0-9]*)(?:\s*\{[^}]*\})?/g;

function tokenAt(document: vscode.TextDocument, position: vscode.Position): { kind: 'attr' | 'cluster' | 'word'; cluster?: string; attr?: string; word?: string; range: vscode.Range } | undefined {
  const line = document.lineAt(position.line).text;
  for (const m of line.matchAll(ATTR_RE)) {
    const s = m.index!, e = s + m[0].length;
    if (position.character >= s && position.character <= e) {
      const dot = s + m[1].length;
      if (position.character <= dot) return { kind: 'cluster', cluster: m[1], range: new vscode.Range(position.line, s, position.line, dot) };
      return { kind: 'attr', cluster: m[1], attr: m[2].toUpperCase(), range: new vscode.Range(position.line, s, position.line, e) };
    }
  }
  const wr = document.getWordRangeAtPosition(position, /[A-Za-z][A-Za-z0-9]*/);
  if (wr) {
    const w = document.getText(wr).toUpperCase();
    if (LIB.clusters[w]) return { kind: 'cluster', cluster: w, range: wr };
    return { kind: 'word', word: w, range: wr };
  }
  return undefined;
}

function isInComment(document: vscode.TextDocument, position: vscode.Position): boolean {
  const before = document.getText(new vscode.Range(new vscode.Position(0, 0), position));
  const opens = before.split(RULES.comment.open).length - 1;
  const closes = before.split(RULES.comment.close).length - 1;
  return opens > closes;
}

function labelsIn(document: vscode.TextDocument): Map<string, number> {
  const labels = new Map<string, number>();
  const kw = new Set([...LIB.keywords, ...LIB.functions]);
  for (let i = 0; i < document.lineCount; i++) {
    const t = document.lineAt(i).text.trim();
    if (/^[A-Z][A-Z0-9_]*$/.test(t) && !kw.has(t) && !LIB.clusters[t] && !/^[NC]VAR[0-9]$/.test(t)) labels.set(t, i);
  }
  return labels;
}

// ---------------------------------------------------------------------------
// Completions
// ---------------------------------------------------------------------------
class FecalcCompletionProvider implements vscode.CompletionItemProvider {
  provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, _token: vscode.CancellationToken, context: vscode.CompletionContext): vscode.CompletionItem[] {
    if (isInComment(document, position)) return [];
    const linePrefix = document.lineAt(position.line).text.slice(0, position.character);
    // space / comma as a trigger only counts right after an operator, a comma or GOTO
    if (context.triggerKind === vscode.CompletionTriggerKind.TriggerCharacter && (context.triggerCharacter === ' ' || context.triggerCharacter === ',')
        && !/(?::=|<>|>=|<=|[=<>(,+\-*\/]|\bGOTO)\s*$/.test(linePrefix)) return [];

    // inside LOAD( -> the proven forms
    if (/\bLOAD\s*\(\s*[A-Z.]*$/.test(linePrefix)) {
      return LIB.loadForms.map((f, i) => {
        const inner = f.form.replace(/^LOAD\(\s*/, '').replace(/\)\s*(in .*)?$/i, '').replace(/\)$/, '');
        const item = new vscode.CompletionItem(inner, vscode.CompletionItemKind.Snippet);
        item.detail = f.returns;
        item.documentation = new vscode.MarkdownString(`\`${f.form}\``);
        item.sortText = String(i).padStart(2, '0');
        return item;
      });
    }

    // `CLUSTER.ATTR =` / `<>` -> that attribute's known values
    const valMatch = /\b[A-Z]{4}\.([A-Z][A-Z0-9]*)(?:\s*\{[^}]*\})?\s*(?:<>|>=|<=|[=<>])\s*("?)\w*$/.exec(linePrefix);
    if (valMatch) {
      const values = LIB.values[valMatch[1]];
      if (!values?.length) return [];
      const alreadyQuoted = valMatch[2] === '"';
      return values.map((v, i) => {
        const item = new vscode.CompletionItem(v.code, vscode.CompletionItemKind.EnumMember);
        item.detail = [v.label, v.p ? `${v.p} uses in live calcs` : ''].filter(Boolean).join(', ');
        item.insertText = alreadyQuoted ? v.code : `"${v.code}"`;
        item.sortText = String(i).padStart(3, '0');
        return item;
      });
    }

    // `CLUSTER.` -> attributes
    const dotMatch = /\b([A-Z][A-Z0-9]{3})\.([A-Za-z0-9]*)$/.exec(linePrefix);
    if (dotMatch) {
      const id = dotMatch[1];
      const c = LIB.clusters[id];
      if (!c) return [];
      return Object.entries(c.attrs).map(([at, a]) => {
        const item = new vscode.CompletionItem(at, vscode.CompletionItemKind.Field);
        const isArray = (a.n ?? 1) > 1;
        item.label = { label: at, detail: isArray ? `{1..${a.n}}` : '', description: a.desc };
        item.detail = a.typeLabel ?? a.type;
        item.documentation = attrMarkdown(id, at, a);
        if (isArray) item.insertText = new vscode.SnippetString(`${at}{\${1:1}}`);
        return item;
      });
    }

    if (/\bGOTO\s+[A-Z0-9_]*$/.test(linePrefix)) {
      return [...labelsIn(document).keys()].map((l) => new vscode.CompletionItem(l, vscode.CompletionItemKind.Reference));
    }

    // statement start -> keywords, functions, clusters, registers
    // expression position (after := = <> ( , + - * /) -> clusters, registers, functions
    const items: vscode.CompletionItem[] = [];
    const atStart = /^\s*[A-Za-z]*$/.test(linePrefix);
    const inExpr = /(?::=|<>|>=|<=|[=<>(,+\-*\/])\s*[A-Za-z0-9]*$/.test(linePrefix);
    for (let i = 0; i <= 9; i++) {
      for (const r of [`NVAR${i}`, `CVAR${i}`]) {
        const item = new vscode.CompletionItem(r, vscode.CompletionItemKind.Variable);
        item.detail = r.startsWith('N') ? 'numeric register' : 'character register';
        item.sortText = '1' + r;
        items.push(item);
      }
    }
    for (const kw of LIB.keywords) {
      if (inExpr && !['AND', 'OR'].includes(kw)) continue;
      const item = new vscode.CompletionItem(kw, vscode.CompletionItemKind.Keyword);
      item.documentation = new vscode.MarkdownString(KEYWORD_DOC[kw] ?? '');
      item.sortText = '0' + kw;
      if (kw === 'IF' && atStart) { item.insertText = new vscode.SnippetString('IF ${1:condition}\n  $0\nENDIF'); item.label = { label: 'IF', description: 'IF ... ENDIF block' }; }
      if (kw === 'DO' && atStart) { item.insertText = new vscode.SnippetString('DO\n  $0\nUNTIL ${1:MSCX.STATUS = "FAILED"}'); item.label = { label: 'DO', description: 'DO ... UNTIL loop' }; }
      items.push(item);
    }
    for (const fn of LIB.functions) {
      if (inExpr && (fn === 'LOAD' || fn === 'WARN' || /^(ROUND|TRUNC)/.test(fn))) continue;
      const item = new vscode.CompletionItem(fn, vscode.CompletionItemKind.Function);
      item.insertText = new vscode.SnippetString(fn === 'WARN' ? 'WARN("${1:LABEL}", ${2:value})' : fn === 'LOAD' ? 'LOAD(${1:PBSX.CLS}, ${2:1})' : `${fn}(\${1:NVAR9})`);
      item.documentation = new vscode.MarkdownString(KEYWORD_DOC[fn] ?? '');
      item.sortText = '1' + fn;
      items.push(item);
    }
    for (const [id, c] of Object.entries(LIB.clusters)) {
      const item = new vscode.CompletionItem(id, vscode.CompletionItemKind.Class);
      item.label = { label: id, description: c.desc || c.title };
      item.detail = c.mask ? `mask ${c.mask}` : undefined;
      item.documentation = clusterMarkdown(id, c);
      item.sortText = (inExpr ? '0' : '2') + id;
      item.commitCharacters = ['.'];
      items.push(item);
    }
    return items;
  }
}

// ---------------------------------------------------------------------------
// Hover
// ---------------------------------------------------------------------------
class FecalcHoverProvider implements vscode.HoverProvider {
  provideHover(document: vscode.TextDocument, position: vscode.Position): vscode.Hover | undefined {
    if (isInComment(document, position)) return undefined;
    const tok = tokenAt(document, position);
    if (!tok) return undefined;
    if (tok.kind === 'attr') {
      const c = LIB.clusters[tok.cluster!];
      if (!c) return new vscode.Hover(new vscode.MarkdownString(`**${tok.cluster}** is not in the cluster library.`), tok.range);
      const a = c.attrs[tok.attr!];
      if (!a) return new vscode.Hover(new vscode.MarkdownString(`**${tok.cluster}** has no attribute **${tok.attr}** in the library. FE skips the whole calc silently on a bad attribute.`), tok.range);
      return new vscode.Hover(attrMarkdown(tok.cluster!, tok.attr!, a), tok.range);
    }
    if (tok.kind === 'cluster') {
      const c = LIB.clusters[tok.cluster!];
      return c ? new vscode.Hover(clusterMarkdown(tok.cluster!, c), tok.range) : undefined;
    }
    if (tok.word && KEYWORD_DOC[tok.word]) return new vscode.Hover(new vscode.MarkdownString(`**${tok.word}**: ${KEYWORD_DOC[tok.word]}`), tok.range);
    if (tok.word && /^[NC]VAR[0-9]$/.test(tok.word)) {
      const kind = tok.word.startsWith('N') ? 'numeric' : 'character';
      // show the line where it is first assigned, and any trailing comment on it
      for (let i = 0; i < document.lineCount; i++) {
        const t = document.lineAt(i).text;
        if (new RegExp(`\\b${tok.word}\\s*:=`).test(t)) {
          const cm = /<<\s*(.*?)\s*>>/.exec(t);
          return new vscode.Hover(new vscode.MarkdownString(`**${tok.word}**, ${kind} register${cm ? `: ${cm[1]}` : ''}\n\nfirst assigned on line ${i + 1}: \`${t.trim()}\``), tok.range);
        }
      }
      return new vscode.Hover(new vscode.MarkdownString(`**${tok.word}**, ${kind} register, never assigned in this calc`), tok.range);
    }
    return undefined;
  }
}

// ---------------------------------------------------------------------------
// GOTO -> label definition; labels + section comments as symbols
// ---------------------------------------------------------------------------
class FecalcDefinitionProvider implements vscode.DefinitionProvider {
  provideDefinition(document: vscode.TextDocument, position: vscode.Position): vscode.Location | undefined {
    const wr = document.getWordRangeAtPosition(position, /[A-Z][A-Z0-9_]*/);
    if (!wr) return undefined;
    const line = document.lineAt(position.line).text;
    if (!/\bGOTO\s+/.test(line)) return undefined;
    const name = document.getText(wr);
    const at = labelsIn(document).get(name);
    return at === undefined ? undefined : new vscode.Location(document.uri, new vscode.Position(at, 0));
  }
}

class FecalcSymbolProvider implements vscode.DocumentSymbolProvider {
  provideDocumentSymbols(document: vscode.TextDocument): vscode.DocumentSymbol[] {
    const out: vscode.DocumentSymbol[] = [];
    for (const [name, line] of labelsIn(document)) {
      const r = document.lineAt(line).range;
      out.push(new vscode.DocumentSymbol(name, 'label', vscode.SymbolKind.Key, r, r));
    }
    for (let i = 0; i < document.lineCount; i++) {
      const t = document.lineAt(i).text.trim();
      const m = /^<<\s*([^<>]{3,50}?)\s*>>$/.exec(t);
      if (m && !/^[*=-]+$/.test(m[1])) {
        const r = document.lineAt(i).range;
        out.push(new vscode.DocumentSymbol(m[1], 'section', vscode.SymbolKind.String, r, r));
      }
    }
    return out.sort((a, b) => a.range.start.line - b.range.start.line);
  }
}

// ---------------------------------------------------------------------------
// Formatter
// ---------------------------------------------------------------------------
class FecalcFormatter implements vscode.DocumentFormattingEditProvider {
  provideDocumentFormattingEdits(document: vscode.TextDocument): vscode.TextEdit[] {
    const lines: string[] = [];
    for (let i = 0; i < document.lineCount; i++) lines.push(document.lineAt(i).text);
    const formatted = reindent(lines).join('\n');
    const fullRange = new vscode.Range(document.positionAt(0), document.positionAt(document.getText().length));
    return [vscode.TextEdit.replace(fullRange, formatted)];
  }
}

// ---------------------------------------------------------------------------
// Quick fixes for the mechanical diagnostics
// ---------------------------------------------------------------------------
class FecalcCodeActions implements vscode.CodeActionProvider {
  provideCodeActions(document: vscode.TextDocument, _range: vscode.Range, ctx: vscode.CodeActionContext): vscode.CodeAction[] {
    const out: vscode.CodeAction[] = [];
    for (const d of ctx.diagnostics) {
      if (d.source !== 'calccode') continue;
      const code = String(d.code ?? '');
      const text = document.getText(d.range);
      const fix = (title: string, replacement: string) => {
        const a = new vscode.CodeAction(title, vscode.CodeActionKind.QuickFix);
        a.edit = new vscode.WorkspaceEdit();
        a.edit.replace(document.uri, d.range, replacement);
        a.diagnostics = [d];
        a.isPreferred = true;
        out.push(a);
      };
      if (code === 'assign-eq' && text === '=') fix('Change = to :=', ':=');
      if (code === 'operator' && text === '==') fix('Change == to =', '=');
      if (code === 'operator' && text === '!=') fix('Change != to <>', '<>');
      if (code === 'operator' && /^THEN$/i.test(text)) fix('Remove THEN', '');
      if (code === 'operator' && /^ENDDO$/i.test(text)) fix('Change ENDDO to UNTIL', 'UNTIL ');
      if (code === 'array-index' && /add an index/.test(d.message) && !/\{/.test(text)) fix(`Add {1}`, `${text}{1}`);
      if (code === 'tab') fix('Replace tab with spaces', '  ');
      const dym = /did you mean ([A-Z]{4}(?:\.[A-Z0-9]+)?|[A-Z0-9]+)/.exec(d.message);
      if (dym && (code === 'cluster-unknown' || code === 'attr-unknown' || code === 'unknown-word' || code === 'syntax')) {
        const suggestion = dym[1];
        if (code === 'attr-unknown' && suggestion.includes('.')) {
          // range covers the attribute only; replace with the attribute part
          fix(`Change to ${suggestion}`, suggestion.split('.')[1]);
        } else if (code === 'cluster-unknown') fix(`Change to ${suggestion}`, suggestion);
        else fix(`Change to ${suggestion}`, suggestion);
      }
    }
    return out;
  }
}

// ---------------------------------------------------------------------------
// Diagnostics
// ---------------------------------------------------------------------------
function registerDiagnostics(context: vscode.ExtensionContext): vscode.DiagnosticCollection {
  const collection = vscode.languages.createDiagnosticCollection('calccode');
  context.subscriptions.push(collection);
  const timers = new Map<string, NodeJS.Timeout>();
  const schedule = (doc: vscode.TextDocument, delay: number) => {
    if (doc.languageId !== LANG) return;
    const key = doc.uri.toString();
    const existing = timers.get(key);
    if (existing) clearTimeout(existing);
    timers.set(key, setTimeout(() => { timers.delete(key); void lintDocument(doc, collection); }, delay));
  };
  context.subscriptions.push(
    vscode.workspace.onDidOpenTextDocument((d) => schedule(d, 0)),
    vscode.workspace.onDidSaveTextDocument((d) => schedule(d, 0)),
    vscode.workspace.onDidChangeTextDocument((e) => schedule(e.document, 300)),
    vscode.workspace.onDidCloseTextDocument((d) => {
      // a file covered by "Check all calc files" keeps its findings, from the saved text
      if (folderChecked.has(d.uri.toString())) void lintUri(d.uri, collection).catch(() => collection.delete(d.uri));
      else collection.delete(d.uri);
    }),
    vscode.workspace.onDidChangeConfiguration((e) => { if (e.affectsConfiguration('calccode')) for (const doc of vscode.workspace.textDocuments) schedule(doc, 0); }),
  );
  for (const doc of vscode.workspace.textDocuments) schedule(doc, 0);
  return collection;
}

const SEV: Record<Severity, vscode.DiagnosticSeverity> = {
  error: vscode.DiagnosticSeverity.Error,
  warning: vscode.DiagnosticSeverity.Warning,
  info: vscode.DiagnosticSeverity.Information,
  hint: vscode.DiagnosticSeverity.Hint,
};

function toDiagnostic(lines: string[], i: Issue): vscode.Diagnostic {
  const line = Math.min(Math.max(0, (i.line || 1) - 1), Math.max(0, lines.length - 1));
  const text = lines[line] ?? '';
  const start = Math.max(0, (i.col || 1) - 1);
  const end = i.endCol ? Math.max(start + 1, i.endCol - 1) : Math.max(start + 1, text.length);
  const d = new vscode.Diagnostic(new vscode.Range(line, Math.min(start, text.length), line, Math.min(end, Math.max(text.length, start + 1))), i.msg, SEV[i.severity]);
  d.source = 'calccode';
  d.code = i.code;
  if (i.code === 'uninit' || i.code === 'goto') d.tags = [vscode.DiagnosticTag.Unnecessary];
  return d;
}

function lintText(text: string): Issue[] {
  const config = vscode.workspace.getConfiguration('calccode');
  return lint(text, {
    library: LIB,
    rules: RULES,
    unknownNameSeverity: config.get<Severity>('lint.unknownNameSeverity', 'warning'),
    loadUncheckedSeverity: config.get<Severity | 'off'>('lint.loadUncheckedSeverity', 'hint'),
    ruleSeverity: config.get<Record<string, Severity | 'off' | 'default'>>('lint.rules', {}),
  });
}

async function lintDocument(document: vscode.TextDocument, collection: vscode.DiagnosticCollection) {
  if (!vscode.workspace.getConfiguration('calccode').get<boolean>('lint.enabled', true)) { collection.delete(document.uri); return; }
  const text = document.getText();
  const lines = text.split(/\r?\n/);
  collection.set(document.uri, lintText(text).map((i) => toDiagnostic(lines, i)));
}

// ---------------------------------------------------------------------------
// Whole-folder check and import from a report export
// ---------------------------------------------------------------------------
const folderChecked = new Set<string>();
let reportChannel: vscode.OutputChannel | undefined;

/** Check a file from its saved text, without opening it in an editor. */
async function lintUri(uri: vscode.Uri, collection: vscode.DiagnosticCollection): Promise<Issue[]> {
  const open = vscode.workspace.textDocuments.find((d) => d.uri.toString() === uri.toString());
  const text = open ? open.getText() : new TextDecoder('utf-8').decode(await vscode.workspace.fs.readFile(uri));
  const lines = text.split(/\r?\n/);
  const issues = lintText(text);
  collection.set(uri, issues.map((i) => toDiagnostic(lines, i)));
  folderChecked.add(uri.toString());
  return issues;
}

async function checkFiles(uris: vscode.Uri[], collection: vscode.DiagnosticCollection, heading: string[], notes = new Map<string, string[]>()) {
  const count = (issues: Issue[], sev: Severity) => issues.filter((i) => i.severity === sev).length;
  const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;
  const body: string[] = [];
  let errors = 0, warnings = 0, flagged = 0;
  await vscode.window.withProgress({ location: vscode.ProgressLocation.Notification, title: 'Calc Code: checking files' }, async (progress) => {
    for (const uri of [...uris].sort((a, b) => a.fsPath.localeCompare(b.fsPath, undefined, { numeric: true }))) {
      progress.report({ increment: 100 / uris.length });
      let issues: Issue[];
      try { issues = await lintUri(uri, collection); } catch (e) { body.push(`${vscode.workspace.asRelativePath(uri)}  could not be read: ${String((e as Error)?.message ?? e)}`); continue; }
      const shown = issues.filter((i) => i.severity === 'error' || i.severity === 'warning');
      const fileNotes = notes.get(uri.toString()) ?? [];
      if (!shown.length && !fileNotes.length) continue;
      flagged++;
      errors += count(issues, 'error');
      warnings += count(issues, 'warning');
      body.push(`${vscode.workspace.asRelativePath(uri)}  ${plural(count(issues, 'error'), 'error')}, ${plural(count(issues, 'warning'), 'warning')}`);
      for (const note of fileNotes) body.push(`  import: ${note}`);
      for (const i of shown) body.push(`  ${String(i.line || 1).padStart(4)}: ${i.msg} [${i.code}]`);
    }
  });
  const summary = `${plural(uris.length, 'calc file')} checked, ${flagged} with findings (${plural(errors, 'error')}, ${plural(warnings, 'warning')})`;
  reportChannel ??= vscode.window.createOutputChannel('Calc Code');
  reportChannel.clear();
  for (const l of [...heading, summary, '', ...body]) reportChannel.appendLine(l);
  if (body.length) reportChannel.appendLine('');
  reportChannel.appendLine('Every finding is also in the Problems panel. Hints and info marks show there and in the editor only.');
  return summary;
}

async function lintWorkspace(collection: vscode.DiagnosticCollection) {
  const uris = await vscode.workspace.findFiles('**/*.calc', '**/node_modules/**');
  if (!uris.length) { void vscode.window.showInformationMessage('Calc Code: no .calc files in this workspace. Open a folder that holds calc files, or run "Calc Code: Import calc codes from a report export".'); return; }
  const summary = await checkFiles(uris, collection, []);
  const pick = await vscode.window.showInformationMessage(`Calc Code: ${summary}.`, 'Show report', 'Show Problems');
  if (pick === 'Show report') reportChannel?.show(true);
  if (pick === 'Show Problems') void vscode.commands.executeCommand('workbench.actions.view.problems');
}

async function importExport(collection: vscode.DiagnosticCollection, context: vscode.ExtensionContext) {
  const [file] = (await vscode.window.showOpenDialog({
    title: 'Calc Code: report to import (PY0080 PDF, or an export with CDH, sequence and source columns)',
    openLabel: 'Import',
    canSelectMany: false,
    filters: { 'Report export': ['pdf', 'xml', 'csv', 'tsv', 'tab', 'txt'], 'All files': ['*'] },
  })) ?? [];
  if (!file) return;

  const bytes = await vscode.workspace.fs.readFile(file);
  const parsed = isPdf(bytes) ? parsePdfExport(bytes) : parseExport(decodeExport(bytes));
  const calcs = assembleCalcs(parsed.rows, { reindent });
  if (!calcs.length) {
    void vscode.window.showErrorMessage('Calc Code: no calc source rows found. Use the PDF of report PY0080 (Payroll CDH Calculation Source), or an export with one row per source line and three columns: CDH number, sequence, source text. See "Import your calc codes" in the extension README.');
    return;
  }

  const [folder] = (await vscode.window.showOpenDialog({
    title: `Calc Code: folder for the ${calcs.length} imported calc files`,
    openLabel: 'Import here',
    canSelectFiles: false,
    canSelectFolders: true,
    canSelectMany: false,
    defaultUri: vscode.workspace.workspaceFolders?.[0]?.uri,
  })) ?? [];
  if (!folder) return;

  const layout = await pickLayout(context, folder);
  if (!layout) return;

  const enc = new TextEncoder();
  const targets = calcs.map((c) => ({ calc: c, uri: vscode.Uri.joinPath(folder, ...calcPath(c, layout.pattern, layout).split('/')), text: c.lines.join('\n') + '\n' }));
  if (new Set(targets.map((t) => t.uri.toString())).size !== targets.length) {
    void vscode.window.showErrorMessage(`Calc Code: the file pattern "${layout.pattern}" gives the same file for more than one CDH. It needs \${cdh} in it.`);
    return;
  }

  // what is already there: nothing, the same text, or different text
  const sameText = (a: string, b: string) => a.replace(/\r\n/g, '\n') === b.replace(/\r\n/g, '\n');
  const onDisk = await Promise.all(targets.map((t) => vscode.workspace.fs.readFile(t.uri).then((b) => new TextDecoder('utf-8').decode(b), () => undefined)));
  const differs = targets.filter((t, k) => onDisk[k] !== undefined && !sameText(onDisk[k]!, t.text));
  const unchanged = targets.filter((t, k) => onDisk[k] !== undefined && sameText(onDisk[k]!, t.text));
  const skip = new Set<string>();
  if (differs.length) {
    const committed = await committedInGit(differs.map((t) => t.uri));
    const exposed = differs.filter((t) => !committed.has(t.uri.toString()));
    const names = (list: typeof differs) => list.slice(0, 6).map((t) => vscode.workspace.asRelativePath(t.uri, false)).join(', ') + (list.length > 6 ? ', ...' : '');
    const message = `Calc Code: ${differs.length} existing calc ${differs.length === 1 ? 'file differs' : 'files differ'} from this import.`;
    const detail = exposed.length === 0
      ? 'Each one is committed in git with no pending changes, so overwriting shows up as an ordinary diff you can review or discard.'
      : `${exposed.length} of them ${exposed.length === 1 ? 'has' : 'have'} no committed copy (uncommitted changes, not tracked, or no git repository here): ${names(exposed)}. Overwriting replaces that text for good.\n\nTo import next to your own files instead, cancel and choose a layout with a label, such as 1196.prod.calc.`;
    const some = exposed.length > 0 && exposed.length < differs.length;
    const pick = await vscode.window.showWarningMessage(message, { modal: true, detail }, exposed.length ? 'Overwrite all' : 'Overwrite', ...(some ? ['Overwrite committed files only'] : []), 'Keep existing files');
    if (!pick) return;
    if (pick === 'Keep existing files') for (const t of differs) skip.add(t.uri.toString());
    if (pick === 'Overwrite committed files only') for (const t of exposed) skip.add(t.uri.toString());
  }

  const same = new Set(unchanged.map((t) => t.uri.toString()));
  const checked: vscode.Uri[] = [];
  const notes = new Map<string, string[]>();
  const madeDirs = new Set<string>();
  let added = 0, updated = 0;
  for (const [k, t] of targets.entries()) {
    const key = t.uri.toString();
    if (skip.has(key)) continue;
    if (!same.has(key)) {
      const dir = vscode.Uri.joinPath(t.uri, '..');
      if (!madeDirs.has(dir.toString())) { await vscode.workspace.fs.createDirectory(dir); madeDirs.add(dir.toString()); }
      await vscode.workspace.fs.writeFile(t.uri, enc.encode(t.text));
      if (onDisk[k] === undefined) added++; else updated++;
    }
    checked.push(t.uri);
    if (t.calc.notes.length) notes.set(key, t.calc.notes);
  }

  const counts = [`${added} new`, `${updated} updated`, `${unchanged.length} unchanged`, ...(skip.size ? [`${skip.size} kept as they were`] : [])].join(', ');
  const heading = [
    `Imported ${calcs.length} calc codes from ${file.fsPath}`,
    `  into ${folder.fsPath} as ${calcPath({ cdh: calcs[0].cdh, title: calcs[0].title }, layout.pattern, layout)}, ...`,
    `  ${counts}`,
    ...(updated ? ['  updated: ' + targets.filter((t, k) => onDisk[k] !== undefined && !same.has(t.uri.toString()) && !skip.has(t.uri.toString())).map((t) => vscode.workspace.asRelativePath(t.uri, false)).join(', ')] : []),
    ...(parsed.skipped ? [`  ${parsed.skipped} rows without a CDH number were skipped (titles, totals, blank rows)`] : []),
    '',
  ];
  const summary = checked.length ? await checkFiles(checked, collection, heading, notes) : 'nothing to check';
  const outside = !vscode.workspace.getWorkspaceFolder(folder);
  const pick = await vscode.window.showInformationMessage(`Calc Code: import done, ${counts}. ${summary}.`, 'Show report', ...(outside ? ['Open folder'] : []));
  if (pick === 'Show report') reportChannel?.show(true);
  if (pick === 'Open folder') void vscode.commands.executeCommand('vscode.openFolder', folder, { forceNewWindow: false });
}

/** File layout for this import: a few ready-made patterns, or the one from settings. */
async function pickLayout(context: vscode.ExtensionContext, folder: vscode.Uri): Promise<{ pattern: string; label?: string; typeFolders: Record<string, string> } | undefined> {
  const config = vscode.workspace.getConfiguration('calccode', folder);
  const typeFolders = { ...DEFAULT_TYPE_FOLDERS, ...(config.get<Record<string, string>>('import.typeFolders') ?? {}) };
  const custom = (config.get<string>('import.filePattern') ?? '').trim();
  const example = (pattern: string) => calcPath({ cdh: 1196, title: 'medical premium' }, pattern, { label: 'XLABELX', typeFolders }).replace('XLABELX', '<label>');
  const ready: [string, string][] = [
    [DEFAULT_FILE_PATTERN, 'one folder, one file per CDH'],
    ['${cdh}.${label}.calc', 'next to your own files: asks for a label such as prod or test'],
    ['${type}/${cdh}.calc', 'a folder per kind of CDH (names: calccode.import.typeFolders)'],
    ['${type}/${cdh}.${label}.calc', 'a folder per kind of CDH, with a label'],
  ];
  if (custom && !ready.some(([p]) => p === custom)) ready.unshift([custom, 'from the setting calccode.import.filePattern']);
  const last = context.globalState.get<string>('import.lastPattern');
  ready.sort((a, b) => Number(b[0] === last) - Number(a[0] === last));
  const pick = await vscode.window.showQuickPick(
    ready.map(([pattern, description]) => ({ label: example(pattern), description, pattern })),
    { title: 'Calc Code: how to name the imported files', placeHolder: 'File layout (example for CDH 1196)' },
  );
  if (!pick) return undefined;

  let label: string | undefined;
  if (patternNeedsLabel(pick.pattern)) {
    label = await vscode.window.showInputBox({
      title: 'Calc Code: label for this import',
      prompt: `Goes into every file name, for example ${example(pick.pattern).replace('<label>', 'prod')}`,
      placeHolder: 'prod, test, 2026-09-17',
      value: context.workspaceState.get<string>('import.lastLabel') ?? '',
      validateInput: (v) => (/^[A-Za-z0-9][A-Za-z0-9_-]{0,23}$/.test(v.trim()) ? undefined : 'Letters, digits, - and _ only, up to 24 characters'),
    });
    if (label === undefined) return undefined;
    label = label.trim();
    void context.workspaceState.update('import.lastLabel', label);
  }
  void context.globalState.update('import.lastPattern', pick.pattern);
  return { pattern: pick.pattern, label, typeFolders };
}

// The built-in Git extension, when it is there. Only the parts used here.
interface GitChange { uri: vscode.Uri }
interface GitRepository {
  state: { workingTreeChanges: GitChange[]; indexChanges: GitChange[]; mergeChanges: GitChange[]; untrackedChanges?: GitChange[] };
  status(): Promise<void>;
  show(ref: string, path: string): Promise<string>;
}
interface GitApi { getRepository(uri: vscode.Uri): GitRepository | null }

/** The files whose current text is safe in git: tracked at HEAD and no pending change of any kind. */
async function committedInGit(uris: vscode.Uri[]): Promise<Set<string>> {
  const safe = new Set<string>();
  try {
    const ext = vscode.extensions.getExtension<{ getAPI(version: 1): GitApi }>('vscode.git');
    if (!ext) return safe;
    const api = (ext.isActive ? ext.exports : await ext.activate()).getAPI(1);
    const pending = new Map<GitRepository, Set<string>>();
    const fold = (u: vscode.Uri) => (process.platform === 'win32' ? u.fsPath.toLowerCase() : u.fsPath);
    for (const uri of uris) {
      const repo = api.getRepository(uri);
      if (!repo) continue;
      if (!pending.has(repo)) {
        await repo.status();
        const st = repo.state;
        pending.set(repo, new Set([...st.workingTreeChanges, ...st.indexChanges, ...st.mergeChanges, ...(st.untrackedChanges ?? [])].map((c) => fold(c.uri))));
      }
      if (pending.get(repo)!.has(fold(uri))) continue;
      // not listed as changed can still mean ignored or hidden untracked: ask for the committed copy
      try { await repo.show('HEAD', uri.fsPath); safe.add(uri.toString()); } catch { /* not in HEAD */ }
    }
  } catch { /* no git: nothing is known to be safe */ }
  return safe;
}

