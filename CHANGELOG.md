# Changelog

## 0.9.3

Review candidate. First build intended for use outside the site that wrote it.
Named calccode after the language itself (calc code), files are `.calc`.

- `calccode` language for Calc Code: syntax coloring, folding,
  58-column ruler, `<< >>` comment toggling, IF and DO auto-indent.
- Cluster and attribute library from the PYUPCL catalog
  (75 clusters, about 1,450 attributes): hover, completion, documented LOAD forms,
  common attribute values, and a bundled reference document.
- Site-specific clusters through the `calccode.library.extraClusters` setting.
- Built-in checker: line width, paste corruption, comment balance, IF/ELSE/ENDIF and
  DO/UNTIL structure, statements that are not calc code, cluster and attribute names
  with suggestions, array indexes, LOAD keys and status checks, GOTO labels, register
  types, ROUND arguments, substrings, unassigned registers.
- Quick fixes for the mechanical diagnostics.
- Format Document re-indents nesting and leaves comments alone.
- Go to Definition on GOTO targets; outline of labels and section comments.
- Snippets for the common calc shapes.
