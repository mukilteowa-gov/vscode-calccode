// Pure, vscode-free re-indentation logic so it can be unit-tested in plain Node.
//
// Re-indents IF/ELSE/ENDIF/DO/UNTIL nesting at 2 spaces/level. Never reflows or
// reindents comments: a multi-line << >> block and any pure-comment line keep
// their exact text.

const countOf = (s: string, sub: string) => s.split(sub).length - 1;

export function reindent(lines: string[]): string[] {
  const out: string[] = [];
  let depth = 0;
  let inComment = false;

  for (const raw of lines) {
    if (inComment) {
      out.push(raw);
      if (raw.includes('>>')) inComment = false;
      continue;
    }

    const t = raw.trim();
    if (t === '') {
      out.push('');
      continue;
    }

    // opens more << than it closes -> start of a multi-line comment
    if (countOf(t, '<<') > countOf(t, '>>')) {
      out.push(raw);
      inComment = true;
      continue;
    }

    // strip complete inline comments to reveal the actual code
    const code = t.replace(/<<[\s\S]*?>>/g, ' ').trim();
    if (code === '') {
      out.push(raw); // pure comment line: preserve indentation
      continue;
    }

    const dedentSelf = /^(ENDIF|UNTIL)\b/.test(code);
    const neutralDedent = /^ELSE\b/.test(code);
    if (dedentSelf) depth = Math.max(0, depth - 1);
    const indent = neutralDedent ? Math.max(0, depth - 1) : depth;
    out.push('  '.repeat(indent) + t);
    if (/^(IF|DO)\b/.test(code)) depth++;
  }
  return out;
}
