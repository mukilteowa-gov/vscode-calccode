// Plain assertion tests for the import core (no test runner needed):
//   bun test/import.test.ts
import { strict as assert } from 'assert';
import { assembleCalcs, calcFileName, decodeExport, parseExport } from '../lib/import-core';
import { isPdf, parsePdfExport } from '../lib/import-pdf';
import { reindent } from '../src/format';

let n = 0;
function t(name: string, fn: () => void) {
  fn();
  n++;
  console.log(`  ✓ ${name}`);
}

// Shape of the delivered Cognos report FEPY0080D "CDH Calc Source", Run as XML.
const row = (cdh: number, seq: string, src: string) =>
  `<row><value>${cdh}</value><value>${seq}</value><value>${src}</value></row>`;
const XML = `<?xml version="1.0" encoding="utf-8"?>
<dataset  xmlns="http://developer.cognos.com/schemas/xmldata/1/"  xmlns:xs="http://www.w3.org/2001/XMLSchema-instance">
<!--
<dataset xs:schemaLocation="http://developer.cognos.com/schemas/xmldata/1/ xmldata.xsd">
-->
    <metadata>
          <item name="CDH" type="xs:short" precision="1"/>
          <item name="Sequence" type="xs:string" length="10"/>
          <item name="Calculation" type="xs:string" length="118"/>
    </metadata>
    <data>
        ${row(1196, '00  ', '&lt;&lt; PROBE &gt;&gt;')}
        ${row(1196, '01  ', 'NVAR1 := 0')}
        ${row(1196, '02  ', 'IF MSCX.STATUS &lt;&gt; &quot;FAILED&quot;')}
        ${row(1196, '03  ', 'NVAR1 := HBTD.ITD')}
        ${row(1196, '04  ', 'ENDIF')}
        ${row(1196, '05  ', 'WARN(&quot;HBTD ITD         =&quot;, NVAR1)')}
        <row><value>2003</value><value>00  </value><value xs:nil="true"/></row>
        ${row(2003, '01  ', 'DEDX.AMT := 0')}
    </data>
</dataset>`;

t('Cognos XML: columns, entities, padded sequence', () => {
  const p = parseExport(XML);
  assert.equal(p.format, 'cognos-xml');
  assert.deepEqual(p.columns, ['CDH', 'Sequence', 'Calculation']);
  assert.equal(p.rows.length, 8);
  assert.deepEqual(p.rows[2], { cdh: 1196, seq: '02', src: 'IF MSCX.STATUS <> "FAILED"', title: undefined, order: 2 });
  assert.equal(p.rows[5].src, 'WARN("HBTD ITD         =", NVAR1)');
  assert.equal(p.rows[6].src, '');
});

t('export without indentation is re-indented', () => {
  const calcs = assembleCalcs(parseExport(XML).rows, { reindent });
  assert.deepEqual(calcs.map((c) => c.cdh), [1196, 2003]);
  assert.deepEqual(calcs[0].lines.slice(2, 5), ['IF MSCX.STATUS <> "FAILED"', '  NVAR1 := HBTD.ITD', 'ENDIF']);
  assert.deepEqual(calcs[1].lines, ['', 'DEDX.AMT := 0']);
});

t('CSV: header names, quoting, indentation kept as exported', () => {
  const csv = [
    'py_cdh_no,pys_seq,pys_src,title',
    '3004,00,"IF NVAR0 > 0",SALARY ADJ',
    '3004,01,"  WARN(""A, B"", NVAR0)",SALARY ADJ',
    '3004,02,ENDIF,SALARY ADJ',
    'Overall - 3 rows,,,',
  ].join('\r\n');
  const p = parseExport(csv);
  assert.equal(p.format, 'delimited');
  assert.equal(p.skipped, 1);
  const [c] = assembleCalcs(p.rows, { reindent: () => { throw new Error('must not reindent'); } });
  assert.deepEqual(c.lines, ['IF NVAR0 > 0', '  WARN("A, B", NVAR0)', 'ENDIF']);
  assert.equal(calcFileName(c), '3004-salary-adj.calc');
});

t('Cognos CSV: UTF-16LE with BOM, tab delimited', () => {
  const text = 'CDH\tSequence\tCalculation\r\n1010\t00\tNVAR0 := 1\r\n1010\t01\tWARN("X =", NVAR0)\r\n';
  const bytes = new Uint8Array(2 + text.length * 2);
  bytes[0] = 0xff; bytes[1] = 0xfe;
  for (let i = 0; i < text.length; i++) { bytes[2 + i * 2] = text.charCodeAt(i); bytes[3 + i * 2] = 0; }
  const [c] = assembleCalcs(parseExport(decodeExport(bytes)).rows);
  assert.deepEqual(c.lines, ['NVAR0 := 1', 'WARN("X =", NVAR0)']);
  assert.equal(calcFileName(c), '1010.calc');
});

t('no header: columns by position', () => {
  const [c] = assembleCalcs(parseExport('2010\t00\tDEDX.AMT := 0\n2010\t01\tSTOP\n').rows);
  assert.deepEqual(c.lines, ['DEDX.AMT := 0', 'STOP']);
});

t('grouped report: CDH printed once per group', () => {
  const csv = ['CDH,Line #,Calculation', '1001,,', ',0000,NVAR0 := 1', ',0001,', ',0002,STOP', '1002,0000,STOP', ',0001,', 'Total,,'].join('\n');
  const p = parseExport(csv);
  assert.equal(p.skipped, 1);
  const calcs = assembleCalcs(p.rows);
  assert.deepEqual(calcs.map((c) => [c.cdh, c.lines]), [[1001, ['NVAR0 := 1', '', 'STOP']], [1002, ['STOP']]]);
});

t('mixed sequence shapes order by value, rows out of order', () => {
  const seqs = ['0U', '0001', '10', '0000', '0029', '0V'];
  const rows = seqs.map((seq, order) => ({ cdh: 1191, seq, src: ` ${seq}`, order }));
  const [c] = assembleCalcs(rows);
  assert.deepEqual(c.lines.map((l) => l.trim()), ['0000', '0001', '0029', '0U', '0V', '10']);
});

t('duplicate sequence rows are reported', () => {
  const rows = ['00', '01', '01', '02'].map((seq, order) => ({ cdh: 1115, seq, src: ` L${order}`, order }));
  const [c] = assembleCalcs(rows);
  assert.equal(c.lines.length, 4);
  assert.equal(c.notes.length, 1);
  assert.match(c.notes[0], /^sequence 01 appears more than once/);
});

// Shape of the CDD report PY0080 PDF: one exact string per field, placed with Tm.
// The CDH prints once per group, continuation pages repeat only the headings.
t('PY0080 PDF: exact strings, escapes, indentation, page break inside a calc', () => {
  const page = (body: string) => `1 0 obj\n<< /Length 0 >>\nstream\nBT\n/F0 10 Tf\n11.5 TL\n1 0 0 1 62 722.5 Tm\n(CDH)'\n1 0 0 1 129 722.5 Tm\n(Line #)'\n1 0 0 1 219 722.5 Tm\n(Calculation)'\n${body}1 0 0 1 90 40 Tm\n(JDOE - Jane Doe)Tj\n1 0 0 1 374 30 Tm\n(1)Tj\nET\nendstream\nendobj\n`;
  const line = (seq: string, src: string, y: number) => `1 0 0 1 137.5 ${y} Tm\n(${seq})Tj\n1 0 0 1 219 ${y + 11.5} Tm\n(${src})'\n`;
  const pdf = '%PDF-1.4\n'
    + page(`1 0 0 1 63 697 Tm\n(2003)Tj\n` + line('00', 'IF MSCX.STATUS <> "FAILED"', 685) + line('01', '  WARN \\("A   =", NVAR1\\)', 673))
    + page(line('02', '\\tENDIF', 697) + line('03', '', 685) + `1 0 0 1 63 673 Tm\n(3004)Tj\n` + line('0000', 'STOP', 661));
  const bytes = new TextEncoder().encode(pdf);
  assert.equal(isPdf(bytes), true);
  const p = parsePdfExport(bytes);
  assert.equal(p.format, 'cdd-pdf');
  const calcs = assembleCalcs(p.rows, { reindent: () => { throw new Error('must not reindent'); } });
  assert.deepEqual(calcs.map((c) => [c.cdh, c.lines]), [
    [2003, ['IF MSCX.STATUS <> "FAILED"', '  WARN ("A   =", NVAR1)', '\tENDIF']],
    [3004, ['STOP']],
  ]);
});

console.log(`\n${n} import tests passed`);
