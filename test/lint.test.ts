// Plain assertion tests for the shared lint core (no test runner needed):
//   bun test/lint.test.ts
// Uses the real library.json + rules.json so the expectations track the data.
import { strict as assert } from 'assert';
import { readFileSync } from 'fs';
import { join } from 'path';
import { lint, type Issue } from '../lib/lint-core';

const LIB = join(__dirname, '..', 'lib');
const library = JSON.parse(readFileSync(join(LIB, 'library.json'), 'utf8'));
const rules = JSON.parse(readFileSync(join(LIB, 'rules.json'), 'utf8'));

const run = (src: string[]) => lint(src.join('\n'), { library, rules });
const codes = (issues: Issue[]) => issues.map((i) => `${i.severity}:${i.code}@${i.line}`);
const has = (issues: Issue[], code: string, line?: number, severity?: string) =>
  issues.some((i) => i.code === code && (line === undefined || i.line === line) && (severity === undefined || i.severity === severity));

let n = 0;
function t(name: string, fn: () => void) {
  fn();
  n++;
  console.log(`  ✓ ${name}`);
}

// A realistic clean calc (from the live corpus shape) must produce no errors.
t('clean calc has no errors', () => {
  const issues = run([
    '<< ELECTED SALARY PAY >>',
    'CVAR9 := HRSD.VALDS{10}',
    'NVAR0 := 0  << MONTHLY HOURS >>',
    'NVAR1 := 0',
    'NVAR8 := 0',
    'IF PYPX.PAYNO = 500 AND PERM.SQ = 1',
    '  IF PYPX.POS = "13101001"',
    '    NVAR0 := 160',
    '  ENDIF',
    '  NVAR1 := PYPX.SAL * 2',
    '  IF NVAR0 > 0',
    '    NVAR8 := NVAR1 / NVAR0',
    '  ENDIF',
    '  HRSX.RATE := NVAR8',
    '  HRSX.AMT := NVAR0',
    'ENDIF',
    'IF CVAR9 = "DEBUG"',
    '  WARN("PAY CLASS =", PYPX.PAYNO)',
    'ENDIF',
  ]);
  assert.deepEqual(issues.filter((i) => i.severity === 'error'), [], codes(issues).join(' '));
});

t('width: 59-char line is an error at col 59', () => {
  const issues = run(['NVAR0 := PYPX.SAL + PBSX.PTD + HBSX.PTD + HRSX.AMT + 123456']);
  const w = issues.find((i) => i.code === 'width')!;
  assert.ok(w && w.severity === 'error' && w.col === 59, codes(issues).join(' '));
});

t('unclosed comment swallows the IF -> comment error + block error', () => {
  const issues = run(['<< MONTHLY EMPLOYEE CHECK', 'IF PYPX.PAYNO = 500', '  << MAYOR HOURS >>', '  NVAR0 := 160', 'ENDIF']);
  assert.ok(has(issues, 'comment', 1, 'error') || has(issues, 'block', 5, 'error'), codes(issues).join(' '));
});

t('block structure: ENDIF without IF, unclosed DO, ELSE twice', () => {
  const issues = run(['ENDIF', 'DO', '  NVAR1 := 1', 'IF NVAR1 > 0', 'ELSE', 'ELSE', 'ENDIF']);
  assert.ok(has(issues, 'block', 1), 'ENDIF without IF');
  assert.ok(has(issues, 'block', 2), 'unclosed DO reported at its line');
  assert.ok(has(issues, 'block', 6), 'second ELSE');
});

t('UNTIL closing an IF is reported, not just counted', () => {
  const issues = run(['IF NVAR1 > 0', '  NVAR2 := 1', 'UNTIL NVAR2 = 1']);
  assert.ok(has(issues, 'block', 3, 'error'), codes(issues).join(' '));
});

t('assignment with = instead of :=', () => {
  const issues = run(['NVAR1 = 5']);
  assert.ok(has(issues, 'assign-eq', 1, 'error'), codes(issues).join(' '));
});

t('foreign syntax: == THEN ENDDO', () => {
  const issues = run(['IF NVAR1 == 1 THEN', 'ENDIF', 'DO', 'ENDDO']);
  assert.ok(has(issues, 'operator', 1), '==');
  assert.ok(issues.filter((i) => i.code === 'operator' && i.line === 1).length >= 2, 'THEN');
  assert.ok(has(issues, 'operator', 4), 'ENDDO');
});

t('unknown cluster with suggestion; 3-letter cluster', () => {
  const issues = run(['NVAR1 := PBXS.PTD', 'CVAR1 := JOB.WC']);
  const u = issues.find((i) => i.code === 'cluster-unknown' && i.line === 1)!;
  assert.ok(u && /PBSX/.test(u.msg), u?.msg);
  assert.ok(has(issues, 'cluster-unknown', 2, 'warning'), codes(issues).join(' '));
  const strict = lint(['NVAR1 := PBXS.PTD'].join('\n'), { library, rules, unknownNameSeverity: 'error' });
  assert.ok(has(strict, 'cluster-unknown', 1, 'error'), 'severity is configurable');
});

t('unknown attribute on a known cluster is a warning with a suggestion', () => {
  const issues = run(['NVAR1 := PBSX.YTD', 'NVAR2 := PYPX.SALARY']);
  const a = issues.find((i) => i.code === 'attr-unknown' && i.line === 1)!;
  assert.ok(a && a.severity === 'warning', codes(issues).join(' '));
  const b = issues.find((i) => i.code === 'attr-unknown' && i.line === 2)!;
  assert.ok(b && /PYPX\.SAL/.test(b.msg), b?.msg);
});

t('cluster names outside the library are warnings only, no verification claims', () => {
  const issues = run(['CVAR1 := JOBT.WC', 'CVAR2 := POSM.CD', 'CVAR3 := PYAS.CD']);
  assert.ok(has(issues, 'cluster-unknown', 1, 'warning'), 'JOBT is not in the catalog');
  assert.ok(!issues.some((i) => i.line >= 2), 'catalog names produce nothing: ' + codes(issues).join(' '));
});

t('array index: missing, out of range, on a scalar, with space before brace', () => {
  const issues = run(['NVAR1 := NUCD.ASVAL', 'NVAR2 := NUCD.ASVAL{6}', 'NVAR3 := PYPX.SAL{1}', 'NVAR4 := NUCD.ASVAL {2}']);
  assert.ok(has(issues, 'array-index', 1, 'warning'), 'missing');
  assert.ok(has(issues, 'array-index', 2, 'error'), 'range');
  assert.ok(has(issues, 'array-index', 3, 'error'), 'scalar');
  assert.ok(!has(issues, 'array-index', 4), 'space before brace is fine');
});

t('LOAD form: proven key, wrong key, unsupported target, unchecked status', () => {
  const issues = run([
    'LOAD(PBSX.CLS, 1)',
    'IF MSCX.STATUS <> "FAILED"',
    '  NVAR1 := PBSX.PTD',
    'ENDIF',
    'LOAD(HBSX.NO, 2)',
    'NVAR2 := HBSX.PTD',
    'LOAD(JOBM.CD, 1)',
    'NVAR3 := 1',
  ]);
  assert.ok(!has(issues, 'load-form', 1), 'PBSX.CLS is the proven key');
  assert.ok(!has(issues, 'load-unchecked', 1), 'status checked after first LOAD');
  assert.ok(has(issues, 'load-form', 5, 'warning'), 'HBSX loads by CLS');
  assert.ok(has(issues, 'load-unchecked', 5, 'hint'), 'no status check after second LOAD');
  assert.ok(!has(issues, 'load-form', 7), 'no LOAD-target claims for clusters without a documented form');
});

t('UNTIL MSCX.STATUS counts as the status check', () => {
  const issues = run(['DO', '  LOAD(EADT.ID, EMPM.ID)', '  CVAR1 := EADT.CD', 'UNTIL MSCX.STATUS = "FAILED"']);
  assert.ok(!has(issues, 'load-unchecked'), codes(issues).join(' '));
});

t('GOTO: undefined label error, unused label hint, label line is a statement', () => {
  const issues = run(['IF NVAR1 > 0', '  GOTO LABEL1', 'ENDIF', 'GOTO NOWHERE', 'LABEL1', 'LABEL2', 'NVAR1 := 1']);
  assert.ok(has(issues, 'goto', 4, 'error'), 'NOWHERE');
  assert.ok(has(issues, 'goto', 6, 'hint'), 'LABEL2 unused');
  assert.ok(!has(issues, 'syntax', 5), 'label line ok');
});

t('condition continued on an AND line is accepted; stray AND line is not', () => {
  const ok = run(['IF PYPX.PAYNO = 500', ' AND PERM.SQ = 2', '  NVAR1 := 1', 'ENDIF']);
  assert.ok(!has(ok, 'syntax'), codes(ok).join(' '));
  const bad = run(['NVAR1 := 1', 'AND PERM.SQ = 2']);
  assert.ok(has(bad, 'syntax', 2, 'error'), codes(bad).join(' '));
});

t('type hints: NVAR := "x" error, CVAR := 5 warning, NVAR compared to string', () => {
  const issues = run(['NVAR1 := "ABC"', 'CVAR1 := 5', 'IF NVAR1 = "P"', 'ENDIF']);
  assert.ok(has(issues, 'type', 1, 'error'));
  assert.ok(has(issues, 'type', 2, 'warning'));
  assert.ok(has(issues, 'type', 3, 'warning'));
});

t('substring on CVAR is fine, on NVAR is an error', () => {
  const issues = run(['CVAR3 := "PYWC"', 'CVAR1 := "5305"', 'CVAR3[5,4] := CVAR1', 'NVAR5 := CVAR3[1,4]', 'NVAR6 := NVAR5[1,2]']);
  assert.ok(!has(issues, 'lhs'), 'CVAR3[5,4] target ok');
  assert.ok(has(issues, 'type', 5, 'error'), 'NVAR substring');
});

t('ROUND2 argument must be an NVAR; unknown function suggested', () => {
  const issues = run(['NVAR9 := 1.005', 'ROUND2(NVAR9)', 'ROUND2(PBSX.PTD)', 'ROUND(NVAR9)']);
  assert.ok(!has(issues, 'round-arg', 2));
  assert.ok(has(issues, 'round-arg', 3, 'error'));
  assert.ok(has(issues, 'unknown-word', 4, 'error'));
});

t('uninitialised register warning, once', () => {
  const issues = run(['HRSX.AMT := NVAR7', 'NVAR1 := NVAR7 + 1']);
  assert.equal(issues.filter((i) => i.code === 'uninit').length, 1);
});

t('corruption token and unterminated string', () => {
  const issues = run(['NVAR6 := PYPX.BEG1DO', 'WARN("OOPS)']);
  assert.ok(has(issues, 'corrupt', 1, 'error'));
  assert.ok(has(issues, 'quote', 2, 'error'));
});

t('bare word is a warning; a bare cluster name is an error', () => {
  const issues = run(['NVAR1 := NVAR2 + BOGUS', 'NVAR2 := 1', 'NVAR3 := PBSX']);
  assert.ok(has(issues, 'unknown-word', 1, 'warning'));
  assert.ok(has(issues, 'syntax', 3, 'error'));
});

console.log(`\nall ${n} lint tests passed`);
