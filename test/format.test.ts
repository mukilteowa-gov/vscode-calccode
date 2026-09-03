// Plain Node test (no test runner needed): `npx tsx test/format.test.ts` or
// compile + run. Asserts the vscode-free reindent logic.
import { strict as assert } from 'assert';
import { reindent } from '../src/format';

function eq(name: string, input: string[], expected: string[]) {
  const got = reindent(input);
  assert.deepEqual(got, expected, `${name}\n got: ${JSON.stringify(got)}`);
  console.log(`  ✓ ${name}`);
}

// IF/ENDIF nests 2 spaces/level
eq(
  'simple IF/ENDIF',
  ['IF NVAR0 > 0', 'NVAR1 := 1', 'ENDIF'],
  ['IF NVAR0 > 0', '  NVAR1 := 1', 'ENDIF'],
);

// ELSE dedents itself, body re-indents
eq(
  'IF/ELSE/ENDIF',
  ['IF MSCX.STATUS <> "FAILED"', 'NVAR2 := PBSX.PTD', 'ELSE', 'WARN("x")', 'ENDIF'],
  ['IF MSCX.STATUS <> "FAILED"', '  NVAR2 := PBSX.PTD', 'ELSE', '  WARN("x")', 'ENDIF'],
);

// DO/UNTIL loop with nested IF
eq(
  'DO/UNTIL + nested IF',
  ['DO', 'NVAR5 := NVAR5 + 1', 'IF PYPX.FROM = "P"', 'NVAR0 := NVAR0 + 1', 'ENDIF', 'UNTIL MSCX.STATUS = "FAILED"'],
  ['DO', '  NVAR5 := NVAR5 + 1', '  IF PYPX.FROM = "P"', '    NVAR0 := NVAR0 + 1', '  ENDIF', 'UNTIL MSCX.STATUS = "FAILED"'],
);

// multi-line << >> comment block is left byte-for-byte
eq(
  'multi-line comment preserved',
  ['<<==== HEADER', '*  CALCID: SALADJ      *', '====>>', 'IF NVAR0 > 0', 'NVAR1 := 1', 'ENDIF'],
  ['<<==== HEADER', '*  CALCID: SALADJ      *', '====>>', 'IF NVAR0 > 0', '  NVAR1 := 1', 'ENDIF'],
);

// inline comment stays attached, code still reindents
eq(
  'inline comment on code line',
  ['IF NVAR0 > 0', 'NVAR1 := 0  << period salary >>', 'ENDIF'],
  ['IF NVAR0 > 0', '  NVAR1 := 0  << period salary >>', 'ENDIF'],
);

// pure-comment line keeps its own indentation (not reflowed)
eq(
  'pure comment line preserved',
  ['IF NVAR0 > 0', '    << note >>', 'NVAR1 := 1', 'ENDIF'],
  ['IF NVAR0 > 0', '    << note >>', '  NVAR1 := 1', 'ENDIF'],
);

console.log('\nall format tests passed');
