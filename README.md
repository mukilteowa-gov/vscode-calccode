# Calc Code for VS Code

Editor support for Finance Enterprise (CentralSquare) payroll calc code:
the formula text on a contribution, deduction or hour definition (PYUPCC, PYUPDD,
PYUPHH). Save the text as a `.calc` file and open it in VS Code.

The extension is self-contained. It needs no server access, no runtime and no other
extension.

## Features

**Syntax coloring** for comments (`<< ... >>`), keywords, NVAR and CVAR registers,
`CLUSTER.ATTR{n}`, strings, numbers, operators, GOTO labels and `CVAR[start,len]`
substrings. IF and DO blocks fold.

**Cluster and attribute library.** Every cluster and attribute in the Finance
Enterprise cluster catalog (PYUPCL): 75 clusters, about 1,450 attributes, with
description, type, array size and screen mask.

- Hover a `CLUSTER.ATTR` for its description and type. Hover a cluster name for what it
  is and its LOAD form when it has one.
- Type a cluster name and `.` to list its attributes. Array attributes come with the
  `{n}` index ready to fill. After `:=` or an operator the list offers clusters and
  registers. Inside `LOAD(` it offers the documented LOAD forms. After `=` or `<>` it
  offers the usual values for that attribute, such as `"FAILED"` or `"P"`.
- Right-click, Calc Code: Open cluster & attribute reference, shows the whole library.

The library lists what the product defines. Which clusters a calc can reach at run time
depends on the site. Site-specific clusters can be added with the
`calccode.library.extraClusters` setting (see Settings).

**Checking as you type.** Squiggles for:

- lines over 58 characters (the FE editor wraps the 59th and merges tokens on paste)
- paste corruption (`PYPX.BEG1DO`, `HOURSX`, `ENDIFIF`), tabs, comments never closed
- block structure: ENDIF without IF, UNTIL closing an IF, a second ELSE, blocks never
  closed (reported at the line that opened them)
- statements that are not calc code: `=` used to assign, `==`, `!=`, THEN, ENDDO,
  ELSEIF, END IF, a second `:=` on a line, a bare word
- cluster or attribute names not in the library, with a "did you mean" suggestion
- array attributes without `{n}`, `{n}` out of range, `{n}` on a scalar
- LOAD with a key other than the documented one, and a LOAD not followed by an
  MSCX.STATUS check
- GOTO to a missing label, labels never used
- `NVAR := "text"`, `CVAR := 5`, a numeric register compared to a string, ROUND2 on
  something that is not an NVAR, substring on an NVAR
- registers read but never assigned

Quick fixes (the lightbulb) handle the mechanical ones: `=` to `:=`, `==` to `=`, add
`{1}`, apply the suggested spelling.

**Formatting.** Format Document re-indents IF/ELSE/ENDIF and DO/UNTIL nesting at two
spaces per level and never touches comments. IF and DO auto-indent as you type.

**Navigation.** Go to Definition on a GOTO target jumps to the label. The outline lists
labels and `<< SECTION >>` comment lines.

**Snippets.** `calc-template` (header box and change log), `calc-changelog`,
`calc-load` (LOAD plus status check), `calc-loop-pypx`, `calc-loop-eadt`,
`calc-nucd`, `calc-debug`, `calc-if`, `calc-answer`, `calc-init`.

## Import your calc codes

To see what the checker says about the calc codes on your own system, pull them all in
one step. Nothing leaves your machine: the import reads the report file and writes
`.calc` files, with no network access.

1. In Finance Enterprise, run the CDD report Payroll CDH Calculation Source (PY0080).
   Under Selection Criteria Options choose No Criteria, so it prints every CDH. Save
   the PDF.
2. In VS Code, open the command palette and run
   Calc Code: Import calc codes from a report export.
3. Pick the PDF, then the folder for the calc files.

The import writes one file per CDH, checks them all, lists every finding in the Problems
panel and opens a summary under Show report.

**File layout.** Each import asks how to name the files:

- `1196.calc`: one folder, one file per CDH.
- `1196.<label>.calc`: asks for a label such as `prod` or `test`. Use this to pull the
  codes as they are on a system without touching the files you are working on, or to
  keep production and test side by side and compare them.
- `PYUPCC/1196.calc` or `PYUPCC/1196.<label>.calc`: a folder per kind of CDH, by the first
  digit of the number (1 contributions, 2 deductions, 3 hours). Rename the folders with
  the `calccode.import.typeFolders` setting.
- Your own pattern from the `calccode.import.filePattern` setting, for example
  `${type}/${cdh}/${label}.calc`.

**Importing again.** Files whose text already matches are left alone, and the report
lists the ones that changed, so a second import shows what changed on the system since
the first. Before a file with different text is overwritten the import asks. When the
folder is a git repository it also checks each of those files: one that is committed
with no pending changes is safe to overwrite, because the change is an ordinary diff.
Files with uncommitted changes, untracked files and folders without git are named in
the warning, and Overwrite committed files only leaves them alone.

The PDF holds every source line exactly as stored, indentation and tabs included, and
the import reads those strings directly. It does not work on a scanned or re-printed
copy of the report, only on the PDF that Finance Enterprise produced.

Other sources work too:

- The Cognos report CDH Calc Source (FEPY0080D), Run as XML or CSV. This report drops
  the blanks at the start of each line. When an export has no indentation at all, the
  import re-indents IF and DO blocks the way Format Document does: the code is the same
  as on your system, the indentation is not.
- Any comma or tab delimited export with a header row and one row per source line.
  Column names recognized: `CDH`, `Sequence` or `Line #`, `Calculation`, or the table's
  own `py_cdh_no`, `pys_seq`, `pys_src`. A fourth column named `Title` or `Description`
  is available to a file pattern as `${title}` (`1196-medical-premium.calc`). From SQL:

```sql
SELECT py_cdh_no, pys_seq, pys_src FROM pys_src_dtl ORDER BY py_cdh_no, pys_seq
```

The import also reports a CDH whose stored source has the same sequence more than once.
The text alone cannot show that. It means rows were duplicated when the calc was saved,
and that calc is worth a look on the system.

Calc Code: Check all calc files runs the same check on every `.calc` file in the open
folder at any time.

## Settings

| Setting | Default | Purpose |
|---|---|---|
| `calccode.lint.enabled` | `true` | Check files as you type. |
| `calccode.lint.unknownNameSeverity` | `warning` | Severity for a cluster or attribute not in the library. |
| `calccode.lint.loadUncheckedSeverity` | `hint` | Severity for a LOAD with no MSCX.STATUS check. |
| `calccode.lint.rules` | `{}` | Turn any check off or change its severity, by rule code (see below). |
| `calccode.library.extraClusters` | `{}` | Site-specific clusters and attributes to add. |
| `calccode.import.filePattern` | empty | Your own import file layout, from `${cdh}`, `${label}`, `${type}`, `${title}`. |
| `calccode.import.typeFolders` | `PYUPCC`, `PYUPDD`, `PYUPHH` | Folder names for `${type}`, by first digit of the CDH number. |

Example of a site addition in `settings.json`:

```json
"calccode.library.extraClusters": {
  "XYZM": {
    "desc": "Our custom master",
    "attrs": {
      "CD":  { "desc": "code" },
      "VAL": { "desc": "values", "n": 10 }
    }
  }
}
```

Attributes given for an existing cluster are merged into it.

### Turning checks off or changing their severity

Every finding ends with its rule code in brackets, such as `[tab]`. Set a code to `off`,
`hint`, `info`, `warning` or `error` in `calccode.lint.rules`:

```json
"calccode.lint.rules": {
  "tab": "off",
  "load-unchecked": "warning",
  "uninit": "hint"
}
```

| Rule code | What it covers |
|---|---|
| `width` | line over 58 characters (the editor wraps the 59th and merges tokens) |
| `tab` | tab character |
| `corrupt` | paste corruption such as PYPX.BEG1DO, HOURSX, ENDIFIF |
| `comment` | comment never closed, or a stray >> |
| `block` | IF/ELSE/ENDIF and DO/UNTIL structure |
| `syntax` | statements that are not calc code |
| `operator` | words and operators from other languages: ==, !=, THEN, ELSEIF, ENDDO |
| `assign-eq` | = used where := is meant |
| `lhs` | assignment to something that cannot be assigned |
| `paren` | unmatched parentheses |
| `quote` | string not closed on its line |
| `cluster-unknown` | cluster name not in the library |
| `attr-unknown` | attribute name not in the library |
| `array-index` | {n} missing, out of range, or used on a scalar |
| `load-form` | LOAD with a key other than the documented one |
| `load-unchecked` | LOAD not followed by an MSCX.STATUS check |
| `goto` | GOTO to a missing label, labels never used |
| `type` | NVAR and CVAR type mix-ups |
| `round-arg` | ROUND on something that is not an NVAR |
| `rate-round` | a rounded register assigned to .RATE |
| `uninit` | register read but never assigned |
| `unknown-word` | unknown function, or a bare word |

A severity set here applies to every finding of that rule. Some rules report at more
than one level by default (`type` has errors and warnings), and `off` is the usual use.

### Colors

Colors come from your color theme: the extension only labels each piece of text
(comment, keyword, cluster, attribute, register, string) and the theme paints it. To
change one color for calc code only, add a rule for its scope to `settings.json`:

```json
"editor.tokenColorCustomizations": {
  "textMateRules": [
    { "scope": "support.class.record.calccode", "settings": { "foreground": "#4EC9B0" } },
    { "scope": "comment.block.calccode", "settings": { "foreground": "#6A9955", "fontStyle": "italic" } }
  ]
}
```

| Scope | Text |
|---|---|
| `comment.block.calccode` | `<< ... >>` comments |
| `keyword.control.calccode` | IF, ELSE, ENDIF, DO, UNTIL, GOTO, STOP |
| `keyword.operator.logical.calccode` | AND, OR, NOT |
| `support.function.calccode` | LOAD, WARN, ROUND2 and the other functions |
| `support.class.record.calccode` | the cluster in `CLUSTER.ATTR` |
| `support.variable.field.calccode` | the attribute in `CLUSTER.ATTR` |
| `variable.other.numeric.calccode` | NVAR registers |
| `variable.other.character.calccode` | CVAR registers |
| `entity.name.label.calccode` | GOTO labels |
| `string.quoted.double.calccode` | strings |
| `constant.numeric.calccode` | numbers |

Developer: Inspect Editor Tokens and Scopes in the command palette shows the scope of
whatever is under the cursor.

## Rules the checker encodes

1. Every line is 58 characters or fewer.
2. An unknown cluster name only warns at run time. An invalid attribute on a known
   cluster makes FE skip the calc silently, with no WARNs and nothing in WARN200.
3. LOAD takes a cluster key and a value: `NUCD.CC`, `EADT.ID`, `HBSX.CLS`, `PBSX.CLS`,
   `PYPX.CLS`, `CNTX.NO`, `DEDX.NO`, `HRSX.NO`, `FORM.FORMNM`.
4. After every LOAD: `IF MSCX.STATUS = "FAILED"`. FAILED means the LOAD found nothing.
   Empty means the engine ignored the LOAD.
5. On an hours CDH, `HRSX.AMT` is the hours quantity. FE pays hours times rate.

## Data, license and trademarks

The extension code is MIT licensed (see LICENSE). The bundled library contains cluster
and attribute names, short labels, data types and array sizes taken from the product's
own cluster catalog screen. These are the identifiers a calc has to use to work at all;
no vendor documentation text is included. Finance Enterprise and IFAS are trademarks of
CentralSquare Technologies. This project is not affiliated with or endorsed by
CentralSquare.

## Feedback

Open an issue in the repository named in the extension details, or send the `.calc`
file and a note of what you expected to the maintainers.
