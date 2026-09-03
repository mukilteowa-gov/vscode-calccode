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

## Settings

| Setting | Default | Purpose |
|---|---|---|
| `calccode.lint.enabled` | `true` | Check files as you type. |
| `calccode.lint.unknownNameSeverity` | `warning` | Severity for a cluster or attribute not in the library. |
| `calccode.lint.loadUncheckedSeverity` | `hint` | Severity for a LOAD with no MSCX.STATUS check. |
| `calccode.library.extraClusters` | `{}` | Site-specific clusters and attributes to add. |

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
