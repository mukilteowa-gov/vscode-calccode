# Changelog

## 0.10.0

- Import calc codes from a report: the PDF of the CDD report Payroll CDH Calculation
  Source (PY0080), read exactly as stored with no PDF library; Cognos XML or CSV of the
  report CDH Calc Source (FEPY0080D); or any comma or tab delimited export with CDH,
  sequence and source columns. Writes one `.calc` file per CDH, restores indentation
  when the export dropped it, reports duplicate sequence rows, then checks every
  imported file.
- Check all calc files: checks every `.calc` file in the open folder without opening
  them, fills the Problems panel and writes a summary report.

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
