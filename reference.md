# Calc Code cluster and attribute reference

Generated 2026-09-16 from the Finance Enterprise PYUPCL cluster catalog (75 clusters, 1377 attributes) and the Cluster_attribute_PY Reference workbook. Names, short labels, types and array sizes only: which clusters exist and what their attributes are called. Which ones your site's calcs can reach at run time depends on the install. Finance Enterprise and IFAS are trademarks of CentralSquare Technologies; this reference is not affiliated with or endorsed by them.

## Rules that apply everywhere

1. Every source line is 58 characters or fewer. The FE editor wraps the 59th and merges tokens on paste.
2. An unknown cluster name only warns at run time. An invalid attribute on a known cluster makes FE skip the calc silently: no WARNs, nothing in WARN200. Test one new token per run.
3. LOAD() takes a cluster key and a value. After every LOAD that matters: IF MSCX.STATUS = "FAILED". Empty status means the engine ignored the LOAD.

## LOAD forms

| Form | Returns |
|---|---|
| `LOAD(NUCD.CC, "CCCCVVVVVVVV")` | one common code (category + value) |
| `LOAD(EADT.ID, EMPM.ID)  in DO ... UNTIL MSCX.STATUS = "FAILED"` | the employee's association-code rows, one per pass |
| `LOAD(HBSX.CLS, n)` | hour-base accumulator n |
| `LOAD(PBSX.CLS, n)` | pay-base accumulator n |
| `LOAD(PYPX.CLS, n)  in a DO ... UNTIL loop` | the employee's n-th pay assignment |
| `LOAD(CNTX.NO, n) / LOAD(DEDX.NO, n) / LOAD(HRSX.NO, n)` | another CDH's computed transaction |
| `LOAD(FORM.FORMNM, "W-4")` | the employee's withholding form by form name (calc 2003: CVAR0 := "W-4" then LOAD(FORM.FORMNM, CVAR0)) |

## Clusters

### ARBL

AR BALANCE CLUSTER, runtime cluster, key REF

| Attribute | Description | Type |
|---|---|---|
| `ACCTCC` | AR-ACCT-CC | char, len 14 |
| `BAL` | BALANCE | long number (2 dp), len 8 |
| `CDHNO` | CDH NUMBER | integer, len 2 |
| `REF` | ar-ref | char, len 16 |

### CHRM

Character Code Definition, master cluster, key CD, table PY-CHR-MSTR

| Attribute | Description | Type |
|---|---|---|
| `CD` | Character Code | char, len 72 |

### CLDD

Calendar Entry, detail cluster, key CLDCD, table PYC-CLD-DTL

| Attribute | Description | Type |
|---|---|---|
| `BEG` | Calendar Entry Begin | date (YYYYMMDD), len 8 |
| `CLDCD` | Calendar Code | char, len 8 |
| `DAYS` | Calendar Work Days | number (2 dp), len 4 |
| `END` | Calendar Entry End | date (YYYYMMDD), len 8 |
| `HRSBW` | Calendar B-Week Hours | number (5 dp), len 4 |
| `HRSDD` | Calendar Daily Hours | number (5 dp), len 4 |
| `HRSMM` | Calendar Monthly Hours | number (5 dp), len 4 |
| `HRSSM` | Calendar S-Monthly Hours | number (5 dp), len 4 |
| `HRSWW` | Calendar Weekly Hours | number (5 dp), len 4 |
| `HRSYY` | Calendar Annual Hours | number (5 dp), len 4 |
| `MONTH{1..14}` | Calendar Month | char, len 434 |
| `OPEN` | OPEN AREA | char, len 8 |
| `OPENNU` | OPEN NUM AREA | number (2 dp), len 4 |
| `SCHCD` | Calendar Schedule Code | char, len 6 |
| `VECT{1..32}` | Calendar Switches | char, len 32 |
| `YR` | Calendar Entry Year | char, len 4 |

### CLDM

Calendar Definition, master cluster, key CD

| Attribute | Description | Type |
|---|---|---|
| `BEG` | Calendar Begin Date | date (YYYYMMDD), len 8 |
| `CD` | Calendar Code | char, len 8 |
| `DS` | Calendar Desc. | char, len 30 |
| `END` | Calendar End | date (YYYYMMDD), len 8 |
| `HRDEXT` | Schedule HR Extention | char, len 2 |
| `HRMEXT` | Calendar HR Extention | char, len 2 |

### CNTD: CONTRIBUTION DEFINITION

Contribution Entry, mask PYUPCC, detail cluster, key NO, table PYM-CDH-DTL

| Attribute | Description | Type |
|---|---|---|
| `BEG` | Contribution Begin Date | date (YYYYMMDD), len 8 |
| `CVECT{1..42}` | Contribution Switches | char, len 42 |
| `END` | Contribution End Date | date (YYYYMMDD), len 8 |
| `FQ` | Cnt. Frequency | char, len 2 |
| `FQTYPE` | Cnt. Frequency Type | integer, len 2 |
| `HBASE` | Hour Base | integer, len 2 |
| `HVECT{1..42}` | Hour Base Vector | char, len 42 |
| `KEY{1..4}` | KEY VECTOR | char, len 40 |
| `NO` | Contribution No | integer, len 2 |
| `OBJ{1..4}` | Cnt. Object Code | char, len 32 |
| `OPEN1` | OPEN AREA 1 | char, len 8 |
| `OPEN2` | OPEN AREA 2 | char, len 8 |
| `OPENN1` | OPEN NUM AREA 1 | number (2 dp), len 4 |
| `OPENN2` | OPEN NUM 2 | number (2 dp), len 4 |
| `PBASE` | Pay Base | integer, len 2 |
| `PRI` | Contribution Priority | char, len 4 |
| `PVECT{1..42}` | Pay Base Vector | char, len 42 |
| `ST` | Cnt. Status | char, len 2 |
| `VAL{1..10}` | Cnt. Associated Value | long number (5 dp), len 80 |
| `VALDS{1..10}` | Cnt. Value Description | char, len 200 |

### CNTM: CONTRIBUTION DEFINITION

Contribution Definition, mask PYUPCC, master cluster, key NO, table PY-CDH-MSTR

| Attribute | Description | Type |
|---|---|---|
| `BEG` | Contribution Begin Date | date (YYYYMMDD), len 8 |
| `CD` | Contribution Code | char, len 8 |
| `END` | Contribution End | date (YYYYMMDD), len 8 |
| `HRDEXT` | CNT.-D HR Extention | char, len 2 |
| `HRMEXT` | CNT.-M HR Extension | char, len 2 |
| `MISC{1..8}` | Contribution MISC. Code | char, len 32 |
| `NO` | Contribution Number | integer, len 2 |
| `REL{1..8}` | Cnt. Relate Code | char, len 48 |
| `TITLE` | Contribution Title | char, len 20 |
| `XTD` | Contribution XTD Flag | char, len 2 |

### CNTX: CONTRIBUTION AMOUNTS

Contribution for PY200C, mask NONE, runtime cluster, key NO, table PY-CDH-MSTR

| Attribute | Description | Type |
|---|---|---|
| `ADDR` | CNT. Assignment Address | number (2 dp), len 4 |
| `AMT` | CNT. Calculated Amount | number (2 dp), len 4 |
| `ARRAMT` | (Not used for CNTs) | number (2 dp), len 4 |
| `ARRBAL` | (Not used for CNTs) | number (2 dp), len 4 |
| `C10TD` | DUMMY | long number (2 dp), len 8 |
| `C1TD` | DUMMY | long number (2 dp), len 8 |
| `C2TD` | DUMMY | long number (2 dp), len 8 |
| `C3TD` | DUMMY | long number (2 dp), len 8 |
| `C4TD` | DUMMY | long number (2 dp), len 8 |
| `C5TD` | DUMMY | long number (2 dp), len 8 |
| `C6TD` | DUMMY | long number (2 dp), len 8 |
| `C7TD` | DUMMY | long number (2 dp), len 8 |
| `C8TD` | DUMMY | long number (2 dp), len 8 |
| `C9TD` | DUMMY | long number (2 dp), len 8 |
| `CTD` | CNT. CYR-To-Date | long number (2 dp), len 8 |
| `FTD` | CNT. FYR-To-Date | long number (2 dp), len 8 |
| `LCTD` | LAST CALENDAR YR TO DATE | long number (2 dp), len 8 |
| `LFTD` | LAST FISCAL YEAR TO DATE | long number (2 dp), len 8 |
| `LTTD` | LAST TAX YEAR TO DATE | long number (2 dp), len 8 |
| `M1TD` | month1 to dt | long number (2 dp), len 8 |
| `M2TD` | Month 2 to dt | long number (2 dp), len 8 |
| `MTD` | CNT. Month-To-Date | long number (2 dp), len 8 |
| `NO` | Contribution Number | integer, len 2 |
| `PAYAMT` | pay amt (not used) | number (2 dp), len 4 |
| `PRCENT` | % rel. to MSCX.PRCENT | number (5 dp), len 4 |
| `PRDS` | Number of periods | integer, len 2 |
| `PRI` | CNT Assignment Priority | char, len 4 |
| `QTD` | CNT. Quarter-To-Date | long number (2 dp), len 8 |
| `RATE` | Pay rate | number (5 dp), len 4 |
| `RTD` | CNT. Range-To-Date | long number (2 dp), len 8 |
| `STATUS` | status of assignment | char, len 2 |
| `TKL` | CNT. Trickle Amount | number (2 dp), len 4 |
| `TTD` | CNT. TYR-To-Date | long number (2 dp), len 8 |
| `WKDOL1` | FLSA Dollars for Week 1 | number (2 dp), len 4 |
| `WKDOL2` | FLSA Dollars for Week 2 | number (2 dp), len 4 |
| `WKDOL3` | FLSA Dollars for Week 3 | number (2 dp), len 4 |
| `WKDOL4` | FLSA Dollars for Week 4 | number (2 dp), len 4 |
| `WKDOL5` | FLSA Dollars for Week 5 | number (2 dp), len 4 |
| `WKHRS1` | Hours N/A for CNTX | number (5 dp), len 4 |
| `WKHRS2` | Hours N/A for CNTX | number (5 dp), len 4 |
| `WKHRS3` | Hours N/A for CNTX | number (5 dp), len 4 |
| `WKHRS4` | Hours N/A for CNTX | number (5 dp), len 4 |
| `WKHRS5` | Hours N/A for CNTX | number (5 dp), len 4 |

### CTFC

Contract Force Calc Cluster, runtime cluster, key CTID

| Attribute | Description | Type |
|---|---|---|
| `BEG` | begin date | date (YYYYMMDD), len 8 |
| `BEG1` | Begin Date (first split) | date (YYYYMMDD), len 8 |
| `BEG2` | Begin Date (2nd Split) | date (YYYYMMDD), len 8 |
| `CALND1` | calendar 1 (workbook only) |  |
| `CALND2` | Calendar 2 (workbook only) |  |
| `CDHAMT` | cdh amt from calcexec | number (2 dp), len 4 |
| `CDHHRS` | cdh hours from calcexec | long number (5 dp), len 8 |
| `CDHPAY` | cdh pay from calcexec | number (2 dp), len 4 |
| `CLS` | CTFC dummy reference | integer, len 2 |
| `CTID` | contract Id | char, len 32 |
| `EARN1` | Earned dollars 1 (workbook only) |  |
| `EARN2` | Earned dollars 2 (workbook only) |  |
| `EMPSDY` | employee scheduled days | long number (5 dp), len 8 |
| `EMPSHR` | employee scheduled hours | long number (5 dp), len 8 |
| `END` | end date | date (YYYYMMDD), len 8 |
| `END1` | End Date (First Split) | date (YYYYMMDD), len 8 |
| `END2` | End Date (2nd Split) | date (YYYYMMDD), len 8 |
| `EPRDR` | Remaining Earning Period | number (0 dp), len 4 |
| `EPRDT` | Total Earning Periods | number (0 dp), len 4 |
| `FROM` | From flag (workbook only) |  |
| `FTEARN` | Future earnings (workbook only) |  |
| `FTEND` | Future End date (workbook only) |  |
| `FTPERS` | Future periods to pay. (workbook only) |  |
| `FTRATE` | Future rate (workbook only) |  |
| `FTTYPE` | Future Type (workbook only) |  |
| `GALLHR` | grand total all hours (workbook only) |  |
| `GALLPY` | grand total all pay (workbook only) |  |
| `GBAL` | grand total balance | number (2 dp), len 4 |
| `GDEP` | grand total deposits | number (2 dp), len 4 |
| `GFUTEN` | Grand Total Future Earn | number (2 dp), len 4 |
| `GFUTHR` | Grand Total Future Hours | long number (5 dp), len 8 |
| `GFUTPD` | Grand Total Future Pay | number (2 dp), len 4 |
| `GPDHRS` | grand total paid hours (workbook only) |  |
| `GPDPAY` | grand total paid dolla (workbook only) |  |
| `GRTREN` | Grand Total Retro Earned | number (2 dp), len 4 |
| `GRTRHR` | Grand Total Retro Hours | long number (5 dp), len 8 |
| `GRTRPD` | Grand Total Retro Pay | number (2 dp), len 4 |
| `GUAMT{1..20}` | Grand Total User Amounts | long number (5 dp), len 160 |
| `GWITH` | grand total withdrawals | number (2 dp), len 4 |
| `GWOPEN` | Grand Total LWOP Earned | number (2 dp), len 4 |
| `GWOPHR` | Grand Total LWOP Hours | long number (5 dp), len 8 |
| `GWOPPY` | grand total wop dollar (workbook only) |  |
| `GYTDEN` | Grand Total Earnings | number (2 dp), len 4 |
| `GYTDHR` | Grand Total Reg Hours | long number (5 dp), len 8 |
| `GYTDPD` | Grand Total Reg Paid | number (2 dp), len 4 |
| `PAID` | Total paid on Contract (workbook only) |  |
| `PALLHR` | period total all hours (workbook only) |  |
| `PALLPY` | period total all pay (workbook only) |  |
| `PBAL` | period escrow balance | number (2 dp), len 4 |
| `PDEP` | period deposits | number (2 dp), len 4 |
| `PENDEN` | Pending Retro Earnings | number (2 dp), len 4 |
| `PENDHR` | Pending Retro Hours | long number (5 dp), len 8 |
| `PENDPD` | Pending Retro Paid | number (2 dp), len 4 |
| `PENDPR` | Pending Retro Periods | number (0 dp), len 4 |
| `PFUTEN` | Period Total Fut Earned | number (2 dp), len 4 |
| `PFUTHR` | Period Total Fut Hours | long number (5 dp), len 8 |
| `PFUTPD` | Period Total Future Pay | number (2 dp), len 4 |
| `POTHHR` | period other hours (workbook only) |  |
| `POTHPY` | period other pay (workbook only) |  |
| `PPDHRS` | period paid hours (workbook only) |  |
| `PPDPAY` | period paid dollars (workbook only) |  |
| `PPRDR` | Remaining Paid Periods | number (0 dp), len 4 |
| `PPRDT` | Total Paid Periods | number (0 dp), len 4 |
| `PRBEG` | Present Begin date (workbook only) |  |
| `PRDPAY` | Period Pay | number (2 dp), len 4 |
| `PREAMT` | pre cdh amt | number (2 dp), len 4 |
| `PREGHR` | period regular hours (workbook only) |  |
| `PREGPY` | period regular pay (workbook only) |  |
| `PREHRS` | pre hours amount | long number (5 dp), len 8 |
| `PREND` | PRESENT END DATE (workbook only) |  |
| `PREPAY` | pre pay amount | number (2 dp), len 4 |
| `PRETHR` | period retro hours (workbook only) |  |
| `PRETPY` | period retro pay (workbook only) |  |
| `PRTREN` | Period Total Retro Earn | number (2 dp), len 4 |
| `PRTRHR` | Period Total Retro Hours | long number (5 dp), len 8 |
| `PRTRPD` | Period Total Retro Pay | number (2 dp), len 4 |
| `PSCHDY` | period scheduled days | long number (5 dp), len 8 |
| `PSCHHR` | period scheduled hours | long number (5 dp), len 8 |
| `PSCKHR` | period sick hours (workbook only) |  |
| `PSCKPY` | period sick pay (workbook only) |  |
| `PUAMT{1..20}` | period user amt | long number (5 dp), len 160 |
| `PVACHR` | period vacation hours (workbook only) |  |
| `PVACPY` | period vacation pay (workbook only) |  |
| `PWITH` | period withdrawals | number (2 dp), len 4 |
| `PWOPEN` | Period LWOP Earned | number (2 dp), len 4 |
| `PWOPHR` | Period Total LWOP Hours | long number (5 dp), len 8 |
| `PWOPPY` | period without pay dol (workbook only) |  |
| `PWOTHH` | period wop other hours (workbook only) |  |
| `PWOTHP` | period wop other pay (workbook only) |  |
| `PWREGH` | period wop regular hou (workbook only) |  |
| `PWREGP` | period wop regular pay (workbook only) |  |
| `PYTDEN` | Period Total Reg Earned | number (2 dp), len 4 |
| `PYTDHR` | Period Total Regular Hrs | long number (5 dp), len 8 |
| `PYTDPD` | Period Total Regular Pay | number (2 dp), len 4 |
| `RTRBAL` | Retro Balance | number (2 dp), len 4 |
| `SPYBAL` | Spread Pay Balance | number (2 dp), len 4 |
| `TARRT1` | Target Rt 1 (workbook only) |  |
| `TARRT2` | Target Rate 2 (workbook only) |  |
| `TARSAL` | Target Salary | number (2 dp), len 4 |
| `TARSL1` | Target Sal First Split | number (2 dp), len 4 |
| `TARSL2` | Target Sal 2nd Split | number (2 dp), len 4 |
| `TARSL3` | Tar Sal 1st split NP | number (2 dp), len 4 |
| `TARSL4` | Target Sal 2nd Split NP | number (2 dp), len 4 |
| `TCV` | Total Contract Value | number (2 dp), len 4 |
| `TCVOVR` | Total Contract Val Over | number (2 dp), len 4 |
| `WOPBAL` | LWOP Balance | number (2 dp), len 4 |
| `WOPIN` | LWOP Deposit | number (2 dp), len 4 |
| `WOPOUT` | LWOP Withdrawal | number (2 dp), len 4 |
| `XALLHR` | cxtd total all hours (workbook only) |  |
| `XALLPY` | cxtd total all pay (workbook only) |  |
| `XBAL` | cxtd escrow balance | number (2 dp), len 4 |
| `XDEP` | cxtd deposits | number (2 dp), len 4 |
| `XFUTEN` | XTD Total Future Earned | number (2 dp), len 4 |
| `XFUTHR` | XTD Total Future Hours | long number (5 dp), len 8 |
| `XFUTPD` | XTD Total Future Pay | number (2 dp), len 4 |
| `XOTHHR` | cxtd other hours (workbook only) |  |
| `XOTHPY` | cxtd other pay (workbook only) |  |
| `XPDHRS` | cxtd paid hours (workbook only) |  |
| `XPDPAY` | cxtd paid dollars (workbook only) |  |
| `XREGHR` | cxtd reg hours (workbook only) |  |
| `XREGPY` | cxtd regular pay (workbook only) |  |
| `XRETHR` | cxtd retro hours (workbook only) |  |
| `XRETPY` | cxtd retro pay (workbook only) |  |
| `XRTREN` | XTD Total Retro Earned | number (2 dp), len 4 |
| `XRTRHR` | XTD Total Retro Hours | long number (5 dp), len 8 |
| `XRTRPD` | XTD Total Retro Pay | number (2 dp), len 4 |
| `XSCKHR` | cxtd sick hours (workbook only) |  |
| `XSCKPY` | cxtd sick pay (workbook only) |  |
| `XUAMT{1..20}` | cxtd user amounts | long number (5 dp), len 160 |
| `XVACHR` | cxtd vacation hours (workbook only) |  |
| `XVACPY` | cxtd vacation pay (workbook only) |  |
| `XWITH` | cxtd withdrawals | number (2 dp), len 4 |
| `XWOPEN` | XTD Total LWOP Earned | number (2 dp), len 4 |
| `XWOPHR` | XTD Total LWOP Hours | long number (5 dp), len 8 |
| `XWOPPY` | cxtd without pay dolla (workbook only) |  |
| `XWOTHH` | cxtd wop other hours (workbook only) |  |
| `XWOTHP` | cxtd wop other pay (workbook only) |  |
| `XWREGH` | cxtd wop regular hours (workbook only) |  |
| `XWREGP` | cxtd wop regular pay (workbook only) |  |
| `XYTDEN` | XTD Total Regular Earn | number (2 dp), len 4 |
| `XYTDHR` | XTD Total Regular Hours | long number (5 dp), len 8 |
| `XYTDPD` | XTD Total Regular Pay | number (2 dp), len 4 |

### CXTD

Contribution XTD entry, detail cluster, key ID, table PYX-XTD-DTL

| Attribute | Description | Type |
|---|---|---|
| `CTD` | Cnt. CYR-to-Date | long number (2 dp), len 8 |
| `FTD` | Cnt. FYR-to-Date | long number (2 dp), len 8 |
| `ID` | Employee ID | char, len 12 |
| `ITD` | Cnt. Inception-to-Date | long number (2 dp), len 8 |
| `MTD{1..12}` | Cnt. Month-to-Date | long number (2 dp), len 96 |
| `NO` | Cnt. XTD No. | number (0 dp), len 4 |
| `OPEN` | Open area | char, len 8 |
| `OVR` | Cnt XTD Override | number (0 dp), len 4 |
| `PERNO` | Cnt. Period No for PTD | number (0 dp), len 4 |
| `PERNUM` | Periods | integer, len 2 |
| `PTD` | Cnt. Period Amount | long number (2 dp), len 8 |
| `QTD{1..4}` | Cnt. Quarter-to-Date | long number (2 dp), len 32 |
| `TTD` | Cnt. TYR-to-Date | long number (2 dp), len 8 |
| `YR` | Cnt. XTD Year | char, len 4 |

### DATM

DATE MANAGEMENT CLUSTER, runtime cluster, key DATE1

| Attribute | Description | Type |
|---|---|---|
| `CONTRL` | DATE CONTROL FIELD | char, len 4 |
| `DATE1` | Date 1 | char, len 8 |
| `DATE2` | DATE 2 USED BY DATE MAN | char, len 8 |
| `DAYNM` | DAY NAME | char, len 10 |
| `DAYS` | DAYS DIFFERENCE | number (0 dp), len 4 |
| `DOIT` | DOIT | char, len 4 |
| `FORMAT` | DATE FORMATED | char, len 20 |
| `MNTHNM` | MONTH NAME | char, len 10 |
| `MONTHS` | MONTHS DIFFERENCE | number (2 dp), len 4 |
| `WEEKS` | WEEKS DIFFERENCE | number (2 dp), len 4 |
| `YEARS` | YEARS DIFF | number (2 dp), len 4 |

### DEDD: DEDUCTION DEFINITION

Deduction Entry, mask PYUPDD, detail cluster, key NO, table PYM-CDH-DTL

| Attribute | Description | Type |
|---|---|---|
| `BEG` | Deduction Begin Date | date (YYYYMMDD), len 8 |
| `CVECT{1..42}` | Deduction Switches | char, len 42 |
| `END` | Deduction End Date | date (YYYYMMDD), len 8 |
| `FQ` | Ded. Frequency | char, len 2 |
| `FQTYPE` | Ded. Frequency Type | integer, len 2 |
| `HBASE` | Hour Base | integer, len 2 |
| `HVECT{1..42}` | Hour Base Vector | char, len 42 |
| `KEY{1..4}` | Key Vector | char, len 40 |
| `NO` | Deduction No | integer, len 2 |
| `OBJ{1..4}` | Ded. Object Code | char, len 32 |
| `OPEN1` | OPEN AREA 1 | char, len 8 |
| `OPEN2` | OPEN AREA 2 | char, len 8 |
| `OPENN1` | OPEN NUM 1 | number (2 dp), len 4 |
| `OPENN2` | OPEN NUM AREA 2 | number (2 dp), len 4 |
| `PBASE` | Pay Base | integer, len 2 |
| `PRI` | Deduction Priority | char, len 4 |
| `PVECT{1..42}` | Pay Base Vector | char, len 42 |
| `ST` | Ded. Status | char, len 2 |
| `VAL{1..10}` | Ded. Associated Value | long number (5 dp), len 80 |
| `VALDS{1..10}` | Ded. Value Description | char, len 200 |

### DEDM: DEDUCTION DEFINITION

Deduction Definition, mask PYUPDD, master cluster, key NO, table PY-CDH-MSTR

| Attribute | Description | Type |
|---|---|---|
| `BEG` | Deduction Begin Date | date (YYYYMMDD), len 8 |
| `CD` | Deduction Code | char, len 8 |
| `END` | Deduction End | date (YYYYMMDD), len 8 |
| `HRDEXT` | DED.-D HR Extention | char, len 2 |
| `HRMEXT` | DED.-M HR Extension | char, len 2 |
| `MISC{1..8}` | Deduction MISC. Code | char, len 32 |
| `NO` | Deduction Number | integer, len 2 |
| `REL{1..8}` | DED. Relate Code | char, len 48 |
| `TITLE` | Deduction Title | char, len 20 |
| `XTD` | Deduction XTD Flag | char, len 2 |

### DEDX: DEDUCTION AMOUNTS

Deduction for PY200C, mask NONE, runtime cluster, key NO, table PY-CDH-MSTR

| Attribute | Description | Type |
|---|---|---|
| `ADDR` | DED. Assignment Address | number (2 dp), len 4 |
| `AMT` | DED. Calculated Amount | number (2 dp), len 4 |
| `ARRAMT` | Calculated Arrears Amt | number (2 dp), len 4 |
| `ARRBAL` | Arrears Balance | number (2 dp), len 4 |
| `C10TD` | dummy | long number (2 dp), len 8 |
| `C1TD` | dummy | long number (2 dp), len 8 |
| `C2TD` | dummy | long number (2 dp), len 8 |
| `C3TD` | dummy | long number (2 dp), len 8 |
| `C4TD` | dummy | long number (2 dp), len 8 |
| `C5TD` | dummy | long number (2 dp), len 8 |
| `C6TD` | dummy | long number (2 dp), len 8 |
| `C7TD` | dummy | long number (2 dp), len 8 |
| `C8TD` | dummy | long number (2 dp), len 8 |
| `C9TD` | dummy | long number (2 dp), len 8 |
| `CTD` | DED. CYR-To-Date | long number (2 dp), len 8 |
| `FTD` | DED. FYR-To-Date | long number (2 dp), len 8 |
| `LCTD` | LAST CALENDAR YR TO DATE | long number (2 dp), len 8 |
| `LFTD` | LAST FISCAL YR TO DATE | long number (2 dp), len 8 |
| `LTTD` | LAST TAX YEAR TO DATE | long number (2 dp), len 8 |
| `M1TD` | month1 to dt | long number (2 dp), len 8 |
| `M2TD` | month 2 to dt | long number (2 dp), len 8 |
| `MTD` | DED. Month-To-Date | long number (2 dp), len 8 |
| `NO` | Deduction Number | integer, len 2 |
| `PAYAMT` | pay amt (not used) | number (5 dp), len 4 |
| `PRCENT` | % rel. to MSCX.PRCENT | number (5 dp), len 4 |
| `PRDS` | Number of periods | integer, len 2 |
| `PRI` | DED Assignment Priority | char, len 4 |
| `QTD` | DED. Quarter-To-Date | long number (2 dp), len 8 |
| `RATE` | rate (not used for DEDs) | number (5 dp), len 4 |
| `RTD` | DED. Range-To-Date | long number (2 dp), len 8 |
| `STATUS` | Status of assignment | char, len 2 |
| `TKL` | DED. Trickle Amount | number (2 dp), len 4 |
| `TTD` | DED. TYR-To-Date | long number (2 dp), len 8 |
| `WKDOL1` | FLSA Dollars for Week 1 | number (2 dp), len 4 |
| `WKDOL2` | FLSA Dollars for Week 2 | number (2 dp), len 4 |
| `WKDOL3` | FLSA Dollars for Week 3 | number (2 dp), len 4 |
| `WKDOL4` | FLSA Dollars for Week 4 | number (2 dp), len 4 |
| `WKDOL5` | FLSA Dollars for Week 5 | number (2 dp), len 4 |
| `WKHRS1` | FLSA Hours for Week 1 | number (5 dp), len 4 |
| `WKHRS2` | FLSA Hours for Week 2 | number (5 dp), len 4 |
| `WKHRS3` | FLSA Hours for Week 3 | number (5 dp), len 4 |
| `WKHRS4` | FLSA Hours for Week 4 | number (5 dp), len 4 |
| `WKHRS5` | FLSA Hours for Week 5 | number (5 dp), len 4 |

### DXTD

Deduction XTD Entry, detail cluster, key ID, table PYX-XTD-DTL

| Attribute | Description | Type |
|---|---|---|
| `CTD` | Ded. CYR-to-Date | number (2 dp), len 4 |
| `FTD` | Ded. FYR-to-Date | number (2 dp), len 4 |
| `ID` | Employee ID | char, len 12 |
| `ITD` | Ded. Inception-to-Date | number (2 dp), len 4 |
| `MTD{1..12}` | Ded. Month-to-Date | number (2 dp), len 48 |
| `NO` | Ded. XTD No. | number (0 dp), len 4 |
| `OPEN` | Open Area | char, len 8 |
| `OVR` | Ded. XTD Override | number (0 dp), len 4 |
| `PERNO` | Ded. Per No for PTD | number (0 dp), len 4 |
| `PERNUM` | Periods | integer, len 2 |
| `PTD` | Ded. Period Amount | number (2 dp), len 4 |
| `QTD{1..4}` | Ded. Quarter-to-Date | number (2 dp), len 16 |
| `TTD` | Ded. TYR-to-Date | number (2 dp), len 4 |
| `YR` | Ded. XTD Year | char, len 4 |

### EADT

Employee Associated Detail, detail cluster, key ID, table PYA-ASSOC-DTL

| Attribute | Description | Type |
|---|---|---|
| `CD` | Associated code | char, len 12 |
| `DESC` | Associated Description | char, len 20 |
| `DESC2` | SECOND PART DESC FIELD | char, len 10 |
| `ID` | Employee ID | char, len 12 |

### ECNT: EMPLOYEE CONTRIBUTION ASSIGNMENTS

Employee Cnt. Assignment, mask PYUPEC, detail cluster, key ID, table PYD-CDH-DTL

| Attribute | Description | Type |
|---|---|---|
| `ADDAMT` | Cnt. Additive Amount | number (2 dp), len 4 |
| `ADDBEG` | Cnt. Additive Begin | date (YYYYMMDD), len 8 |
| `ADDEND` | Cnt. Additive End | date (YYYYMMDD), len 8 |
| `AMT` | Cnt. Amount | number (2 dp), len 4 |
| `AXP` | Cnt. Amt. Expressed As | char, len 2 |
| `BEG` | Cnt. Beginning Date | date (YYYYMMDD), len 8 |
| `CD{1..4}` | Cnt. Special Code | char, len 16 |
| `END` | Cnt. Ending Date | date (YYYYMMDD), len 8 |
| `FQ` | Cnt. Frequency | char, len 2 |
| `FQTYPE` | Cnt. Frequency Type | integer, len 2 |
| `ID` | Employee ID | char, len 12 |
| `LMTAMT` | Cnt. Limit Amount | number (2 dp), len 4 |
| `LXP` | Cnt. Limit Expressed As | char, len 2 |
| `MISCL` | Long Misc Field | char, len 20 |
| `MISCM` | Medium Misc Field | char, len 12 |
| `MISCS` | Short Misc Field | char, len 2 |
| `NO` | Cnt. No. | integer, len 2 |
| `ST` | Cnt. Status | char, len 2 |

### EDED: EMPLOYEE DEDUCTION ASSIGNMENTS

Employee Ded. Assignment, mask PYUPED, detail cluster, key ID, table PYD-CDH-DTL

| Attribute | Description | Type |
|---|---|---|
| `ADDAMT` | Ded. Additive Amount | number (2 dp), len 4 |
| `ADDBEG` | Ded. Additive Begin | date (YYYYMMDD), len 8 |
| `ADDEND` | Ded. Additive End | date (YYYYMMDD), len 8 |
| `AMT` | Ded. Amount | number (2 dp), len 4 |
| `AXP` | Ded. Amt. Expressed As | char, len 2 |
| `BEG` | Ded. Beginning Date | date (YYYYMMDD), len 8 |
| `CD{1..4}` | Ded. Special Code | char, len 16 |
| `END` | Ded. Ending Date | date (YYYYMMDD), len 8 |
| `FQ` | Ded. Frequency | char, len 2 |
| `FQTYPE` | Ded. Frequency Type | integer, len 2 |
| `ID` | Employee ID | char, len 12 |
| `LMTAMT` | Ded. Limit Amount | number (2 dp), len 4 |
| `LXP` | Ded. Limit Expressed As | char, len 2 |
| `MISCL` | Long Misc Field | char, len 20 |
| `MISCM` | Medium Misc Field | char, len 12 |
| `MISCS` | Short Misc Field | char, len 2 |
| `NO` | Ded. No. | integer, len 2 |
| `ST` | Ded. Status | char, len 2 |

### EHRS: EMPLOYEE HOURS ASSIGNMENT

Employee Hrs. Assignment, mask PYUPEH, detail cluster, key ID, table PYD-CDH-DTL

| Attribute | Description | Type |
|---|---|---|
| `ADDAMT` | Hrs. Additive Amount | number (5 dp), len 4 |
| `ADDBEG` | Hrs. Additive Begin | date (YYYYMMDD), len 8 |
| `ADDEND` | Hrs. Additive End | date (YYYYMMDD), len 8 |
| `AMT` | Hrs. Amount | number (5 dp), len 4 |
| `AXP` | Hrs. Amt. Expressed As | char, len 2 |
| `BEG` | Hrs. Beginning Date | date (YYYYMMDD), len 8 |
| `CD{1..4}` | Hrs. Special Code | char, len 16 |
| `END` | Hrs. Ending Date | date (YYYYMMDD), len 8 |
| `FQ` | Hrs. Frequency | char, len 2 |
| `FQTYPE` | Hrs. Frequency Type | integer, len 2 |
| `ID` | Employee ID | char, len 12 |
| `LMTAMT` | Hrs. Limit Amount | number (5 dp), len 4 |
| `LXP` | Hrs. Limit Expressed As | char, len 2 |
| `MISCL` | Long Misc Field | char, len 20 |
| `MISCM` | Medium Misc Field | char, len 12 |
| `MISCS` | Short Misc Field | char, len 2 |
| `NO` | Hrs. No. | integer, len 2 |
| `ST` | Hrs. Status | char, len 2 |

### EHST

Employee History Entry, detail cluster, key ID, table PYH-HST-DTL

| Attribute | Description | Type |
|---|---|---|
| `AMT{1..15}` | History Entry Amount | number (0 dp), len 60 |
| `BATCH` | Time Card Batch | char, len 8 |
| `CHNGDT` | Change Date | char, len 8 |
| `CKDT` | History Check Date | char, len 8 |
| `CKNO` | History Check No. | number (0 dp), len 4 |
| `CKNOTE` | History Check Note | char, len 2 |
| `CKSTCK` | Check Stock | char, len 2 |
| `DAYS` | History Days Worked | integer, len 2 |
| `ID` | Employee ID | char, len 12 |
| `JOBNO` | IFAS Job Number | number (0 dp), len 4 |
| `NO{1..15}` | History Entry No. | integer, len 30 |
| `NUMCD` | History Assignment Code | number (0 dp), len 4 |
| `OPEN` | OPEN AREA | char, len 8 |
| `OPENNU` | OPEN NUM AREA | number (2 dp), len 4 |
| `OVRD` | History Override Flag | number (0 dp), len 4 |
| `PAIDCC` | History Period Paid | number (0 dp), len 4 |
| `PART1` | Emp. History Part 1 | char, len 12 |
| `PART2` | Emp. History Part 2 | char, len 12 |
| `PART3` | Emp. Hist Part 3 | char, len 12 |
| `PART4` | Emp. History Part 4 | char, len 12 |
| `PECC` | PEID and Period Number | char, len 16 |
| `POSTDT` | History Post Date | char, len 8 |
| `RECTP` | Record Type | char, len 2 |
| `SPREAD` | Spread Indormation | char, len 12 |
| `WEEKS` | History Weeks Worked | integer, len 2 |

### EMPM: EMPLOYEE MASTER

Employee Definition, mask PYUPEM, master cluster, key ID, table HR-PE-MSTR

| Attribute | Description | Type |
|---|---|---|
| `AA` | Employee Affirm. Action | char, len 8 |
| `ADDRCD` | Employee Address Code | char, len 2 |
| `ADDRDB` | Employee Address Flag | char, len 2 |
| `ADJ` | Employee Seniority Adj. | integer, len 2 |
| `BDT` | Employee Birth Date | date (YYYYMMDD), len 8 |
| `BEG` | Employee Begin Date | date (YYYYMMDD), len 8 |
| `CITY` | Employee City | char, len 20 |
| `CKPER` | Employee Message Period | number (0 dp), len 4 |
| `CLDCD` | Employee Calendar Code | char, len 8 |
| `CMNT` | Employee Ck. Comment | char, len 50 |
| `CNTRY` | Employee Country | char, len 4 |
| `CYCLE` | Employee Pay Cycle | integer, len 2 |
| `EDUC{1..5}` | Employee Educ. Codes | char, len 20 |
| `END` | Employee End Date | date (YYYYMMDD), len 8 |
| `FLSA` | Employee FLSA Type | char, len 2 |
| `FNAME` | Employee First Name | char, len 20 |
| `FTE` | Employee FTE | number (5 dp), len 4 |
| `GENCD` | Employee Entity Code | char, len 4 |
| `HDT` | Employee Hire Date | date (YYYYMMDD), len 8 |
| `HRAUDT` | HRIS Audit | number (0 dp), len 10 |
| `HRDEXT` | Employee-D HR Extention | char, len 2 |
| `HREC` | HRIS PE Record | char, len 200 |
| `HRFOID` | HR FOID | char, len 12 |
| `HRMEXT` | Employee-M HR Extention | char, len 2 |
| `HRSEC{1..4}` | HR Security Code | char, len 56 |
| `HRUPDT` | HRIS Update Date | number (0 dp), len 4 |
| `ID` | Employee ID | char, len 12 |
| `LDATE` | Employee Leave Date | date (YYYYMMDD), len 8 |
| `LNAME` | Employee Last Name | char, len 20 |
| `MAXPAY` | Employee Maximum Pay | number (2 dp), len 4 |
| `MLCHR{1..16}` | Miscellaneous X8 string | char, len 128 |
| `MNAME` | Employee Middle Name | char, len 10 |
| `MNUM{1..15}` | Miscellaneous Numbers | number (2 dp), len 60 |
| `MRT` | Employee Marital Status | char, len 2 |
| `MSCHR{1..12}` | Miscellaneous X4 string | char, len 48 |
| `NAME` | Employee Name | char, len 30 |
| `NNAME` | Employee Nickname | char, len 20 |
| `PART1` | Employee Part 1 | char, len 12 |
| `PART2` | Employee Part 2 | char, len 12 |
| `PART3` | Employee Part 3 | char, len 12 |
| `PART4` | Employee Part 4 | char, len 12 |
| `PAYSEL` | Employee Pay Selection | char, len 2 |
| `PERCX` | Employee Per. Calculated | number (0 dp), len 4 |
| `SALUTE` | Employee Salutation | char, len 4 |
| `SDT` | Employee Separation Date | date (YYYYMMDD), len 8 |
| `SEL{1..2}` | Employee Selection Codes | char, len 16 |
| `SEX` | Employee Sex | char, len 2 |
| `SKILL{1..5}` | Employee Skill Code | char, len 20 |
| `SSN` | Employee SSN | char, len 10 |
| `ST1` | Street1 | char, len 30 |
| `ST2` | street2 | char, len 30 |
| `STATE` | Employee State | char, len 2 |
| `STATUS` | Employee Status | char, len 2 |
| `SUFFIX` | Employee Suffix | char, len 4 |
| `TYPE` | Employee Type | char, len 4 |
| `UNIT` | Employee Unit | char, len 8 |
| `VAL{1..4}` | Employee Associated Val. | number (2 dp), len 16 |
| `VECT{1..32}` | Employee Switches | char, len 32 |
| `XTDCX` | Employee XTD Calculated | date (YYYYMMDD), len 8 |
| `ZIP` | Employee Zip | char, len 10 |
| `ZIPEXT` | Employee Zip Code Ext. | char, len 6 |

### EPAY: EMPLOYEE PAY ASSIGNMENT

Employee Pay Assignment, mask PYUPEP, detail cluster, key ID, table PYP-PAY-DTL

| Attribute | Description | Type |
|---|---|---|
| `AUXSAL` | Auxillary Salary | number (2 dp), len 4 |
| `BEG` | Pay Beginning Date | date (YYYYMMDD), len 8 |
| `CLD` | Calendar Code | char, len 8 |
| `CLDPCT` | Calendar Percent | number (5 dp), len 4 |
| `CXNDX` | Contract Count Index | integer, len 2 |
| `DOLDAY` | Dollars per Day | number (2 dp), len 4 |
| `DSVECT{1..3}` | CDH Distribution Vect. | char, len 18 |
| `EFFORT` | Work Effort | number (5 dp), len 4 |
| `END` | Pay Ending Date | date (YYYYMMDD), len 8 |
| `FACTOR` | RETRO FACTOR | number (2 dp), len 4 |
| `FQ` | Pay Frequency | char, len 2 |
| `FQTYPE` | Pay Frequency Type | integer, len 2 |
| `HRSDAY` | Hours per Day | number (5 dp), len 4 |
| `ID` | Employee ID | char, len 12 |
| `LMTAMT` | Pay Limit Amount | number (2 dp), len 4 |
| `LXP` | Pay Limit Expressed As | char, len 2 |
| `MISC{1..8}` | Misc Codes | char, len 32 |
| `MSCCHR{1..5}` | Miscellaneous Strings | char, len 40 |
| `MSCNUM{1..5}` | Miscellaneous Numbers | number (2 dp), len 20 |
| `NUMCD` | Pay Assignment Code | number (0 dp), len 4 |
| `OPEN1` | OPEN AREA | char, len 8 |
| `OT` | Overtime Rate | number (5 dp), len 4 |
| `PDBEG` | PAID BEGIN DATE | date (YYYYMMDD), len 8 |
| `PDEND` | PAID END DATE | date (YYYYMMDD), len 8 |
| `POTYPE` | Payout Type | char, len 2 |
| `PTBEG` | Patch Beg | date (YYYYMMDD), len 8 |
| `PTEND` | Patch End | date (YYYYMMDD), len 8 |
| `PTFLAG` | Patch Flag | char, len 2 |
| `REG` | Regular Rate | number (5 dp), len 4 |
| `RETRDT` | Retro Date | date (YYYYMMDD), len 8 |
| `RETRTP` | Retro Type | char, len 2 |
| `SAL` | Salary Amount | number (2 dp), len 4 |
| `SPREAD` | Spread Information | char, len 12 |
| `ST` | Pay Assingment Status | char, len 2 |
| `SXP` | Salary Expressed As | char, len 2 |
| `TYPE` | Pay Assignemnt Type | char, len 2 |
| `UNIT` | Bargaining Unit | char, len 8 |

### EPYM

Employee Pay Assignment, detail cluster, key ID, table PYP-PAY-DTL

| Attribute | Description | Type |
|---|---|---|
| `AUXSAL` | Auxillary Salary (workbook only) |  |
| `BEG` | Pay Beginning Date | date (YYYYMMDD), len 8 |
| `CLD` | Calendar Code (workbook only) |  |
| `CLDPCT` | Calendar Percent (workbook only) |  |
| `DSVECT{1..3}` | CDH Distribution Vect. | char, len 18 |
| `EFFORT` | Work Effort | number (5 dp), len 4 |
| `END` | Pay Ending Date | date (YYYYMMDD), len 8 |
| `FQ` | Pay Frequency | char, len 2 |
| `FQTYPE` | PYM Frequency Type | integer, len 2 |
| `GL` | Pay - GL | char, len 2 |
| `GLKEY` | Pay - GLKEY | char, len 10 |
| `GLOBJ` | Pay - GLOBJ | char, len 8 |
| `HRSDAY` | Hours per Day (workbook only) |  |
| `ID` | Employee ID | char, len 12 |
| `JL` | Pay - JL | char, len 2 |
| `JLKEY` | Pay - JLKEY | char, len 10 |
| `JLOBJ` | Pay - JLOBJ | char, len 8 |
| `LMTAMT` | Pay Limit Amount | number (2 dp), len 4 |
| `LXP` | Pay Limit Expressed As | char, len 2 |
| `MISC{1..8}` | Misc Codes. | char, len 32 |
| `MSCCHR` | Miscellaneous Strings (workbook only) |  |
| `MSCNUM` | Miscellaneous Numbers (workbook only) |  |
| `NUMCD` | Pay Assignment Code | number (0 dp), len 4 |
| `OPEN` | OPEN AREA | char, len 126 |
| `OT` | Overtime Rate | number (5 dp), len 4 |
| `PAIDBG` | Paid Begin Date (workbook only) |  |
| `PAIDED` | Paid End Date (workbook only) |  |
| `PAY` | Pay - PAY | char, len 3 |
| `POS` | Pay - POS | char, len 10 |
| `POTYPE` | Payout Type (workbook only) |  |
| `PTBEG` | Patch Beg (workbook only) |  |
| `PTEND` | Patch End (workbook only) |  |
| `PTFLAG` | Patch Flag (workbook only) |  |
| `REG` | Regular Rate | number (5 dp), len 4 |
| `RETRDT` | Retro Date (workbook only) |  |
| `RETRFA` | Retro Factor (workbook only) |  |
| `RETRTP` | Retro Type (workbook only) |  |
| `SAL` | Salary Amount | number (2 dp), len 4 |
| `SPREAD` | Spread Information | char, len 12 |
| `ST` | Pay Assignment Status | char, len 2 |
| `STEP` | Pay - STEP | char, len 4 |
| `SXP` | Salary Expressed As | char, len 2 |
| `TYPE` | Pay Assignemnt Type | char, len 2 |
| `UNIT` | Bargaining Unit (workbook only) |  |
| `UPRT10` | Paystring User Part 10 | char, len 20 |
| `UPRT11` | Paystring User Part 11 | char, len 20 |
| `UPRT12` | Paystring User Part 12 | char, len 20 |
| `UPRT13` | Paystring User Part 13 | char, len 20 |
| `UPRT14` | Paystring User Part 14 | char, len 20 |
| `UPRT15` | Paystring User Part 15 | char, len 20 |
| `UPRT16` | Paystring User Part 16 | char, len 20 |
| `UPRT17` | Paystring User Part 17 | char, len 20 |
| `UPRT18` | Paystring User Part 18 | char, len 20 |

### EXED

Execution Formula, detail cluster, key NO, table PYE-EXC-DTL

| Attribute | Description | Type |
|---|---|---|
| `EXE` | Execution Formula | char, len 58 |
| `NO` | Cnt/Ded/Hrs Entry | integer, len 2 |
| `SQ` | Execution Sequence | char, len 4 |

### FLEX

FLEX PROCESSING CLUSTER, runtime cluster, key CMELEC

| Attribute | Description | Type |
|---|---|---|
| `CDCLMS` | CURR YR DEPC CLAIMS AMT | number (2 dp), len 4 |
| `CDELEC` | CURR YR DEPC ELEC AMT | number (2 dp), len 4 |
| `CMCLMS` | CURR YR MEDI CLAIMS AMT | number (2 dp), len 4 |
| `CMELEC` | CURR YR MEDI ELEC AMT | number (2 dp), len 4 |
| `COCLMS` | CURR YR OTHI CLAIMS AMT | number (2 dp), len 4 |
| `COELEC` | CURR YEAR OTHI ELEC AMT | number (2 dp), len 4 |
| `PDCLMS` | PREV YR DEPC CLAIMS AMT | number (2 dp), len 4 |
| `PDELEC` | PREV YR DEPC ELEC AMT | number (2 dp), len 4 |
| `PMCLMS` | PREV YR MEDI CLAIMS AMT | number (2 dp), len 4 |
| `PMELEC` | PREV YR MEDI ELEC AMT | number (2 dp), len 4 |
| `POCLMS` | PRIOR YR OTHI CLAIMS AMT | number (2 dp), len 4 |
| `POELEC` | PRIOR YR OTHI ELEC AMT | number (2 dp), len 4 |

### FORM

Withholding Allowance Info, detail cluster, key ID, table PYW-WA-DTL

| Attribute | Description | Type |
|---|---|---|
| `ADDITL` | Additional Withholding | number (2 dp), len 4 |
| `DEPAMT` | Dependent Amount | number (2 dp), len 4 |
| `EFFDT` | Effective Date | date (YYYYMMDD), len 8 |
| `EXEMPT` | Exempt | char, len 1 |
| `FORM` | STATUS | char, len 1 |
| `FORMNM` | Form Name | char, len 8 |
| `ID` | Employee ID | char, len 12 |
| `MISCCD{1..4}` | Misc Code | char, len 16 |
| `MSCAMT{1..2}` | Misc Amount | number (2 dp), len 8 |
| `MULT` | Multiple Jobs | char, len 1 |
| `OTRINC` | Other Income | number (2 dp), len 4 |
| `REDUCT` | Reductions | number (2 dp), len 4 |
| `STATUS` | Filing Status | char, len 2 |
| `XMPTNO` | Number of Exemption | integer, len 2 |

### GENM

Entity Definition, master cluster, key CD, table PY-GEN-MSTR

| Attribute | Description | Type |
|---|---|---|
| `BEG` | Entity Begin Date | date (YYYYMMDD), len 8 |
| `CD` | Entity Code | char, len 10 |
| `CITY` | Entity City | char, len 20 |
| `CNTRY` | Entity Country | char, len 40 |
| `CNTY` | Entity County | char, len 20 |
| `CTRYCD` | Entity Country Code | char, len 4 |
| `CTRYNO` | Entity Country No. | char, len 4 |
| `END` | Entity End Date | date (YYYYMMDD), len 8 |
| `FID{1..4}` | Entity FID | char, len 48 |
| `FMONTH` | Entity F. Month End | integer, len 2 |
| `GLDEPT` | PC - GL Dept. Index | integer, len 2 |
| `HRMEXT` | HR Extention - Master | char, len 2 |
| `HXVECT{1..42}` | Hour XTD Switches | char, len 42 |
| `IVECT{1..32}` | Interface Switches | char, len 32 |
| `JLDEPT` | PC - JL Dept. Index | integer, len 2 |
| `MPAY` | Maximum Pay | number (2 dp), len 4 |
| `NAME` | Organization Name | char, len 60 |
| `PART1` | PY Gen Part1 | integer, len 2 |
| `PART1D` | PY Gen Part 1 Desc | char, len 16 |
| `PART2` | PY Gen Part 2 | integer, len 2 |
| `PART2D` | PY Gen Part2 Desc | char, len 16 |
| `PART3` | PY Gen Part 3 | integer, len 2 |
| `PART3D` | PY Gen Part 3 Desc | char, len 16 |
| `PART4` | PY Gen Part 4 | integer, len 2 |
| `PART4D` | PY Gen Part 4 Desc | char, len 16 |
| `PARTDL` | Part Delemeter | char, len 2 |
| `PARTHD{1..18}` | Part Heading | char, len 144 |
| `PARTLN{1..18}` | Part Length | integer, len 36 |
| `PARTSQ{1..18}` | Part Sequence | integer, len 36 |
| `PERSON` | Contact Person | char, len 50 |
| `PHONE{1..2}` | Contact Phone | char, len 32 |
| `PVECT{1..42}` | Process Switches | char, len 42 |
| `PXVECT{1..42}` | Pay XTD Switches | char, len 42 |
| `SEED` | Seed Number | number (0 dp), len 4 |
| `SID{1..4}` | State ID | char, len 48 |
| `STCD` | State Code | char, len 2 |
| `STNAME` | State Name | char, len 20 |
| `STNO` | State No. | char, len 2 |
| `STRT1` | First Street Address | char, len 30 |
| `STRT2` | Second Street Address | char, len 30 |
| `TTLFTE` | Total FTE | number (5 dp), len 4 |
| `ZIP` | Zip Code | char, len 10 |
| `ZIPEXT` | Zip Extention | char, len 6 |

### GRDM

Salary Grade Definition, master cluster, key CD, table PY-GRD-MSTR

| Attribute | Description | Type |
|---|---|---|
| `BEG` | Salary Grade Begin | date (YYYYMMDD), len 8 |
| `CD` | Salary Grade Code | char, len 8 |
| `CLDCD` | Salary Grade Calendar | char, len 8 |
| `END` | Salary Grade End | date (YYYYMMDD), len 8 |
| `HRDEXT` | HR Step Extention | char, len 2 |
| `HRMXTD` | HR Grade Extention | char, len 2 |
| `MISC{1..8}` | Salary Grade MISC Code | char, len 32 |
| `RANGE` | Salary Grade Range | char, len 8 |
| `TITLE` | Salary Grade Title | char, len 30 |

### HBSA

Hrs Bases for PY902C, runtime cluster, key CLS

| Attribute | Description | Type |
|---|---|---|
| `CLS` | Dummy reference | integer, len 4 |
| `CTD` | Hrs CYR-To-Date | number (5 dp), len 4 |
| `FTD` | Hrs FYR-To-Date | number (5 dp), len 4 |
| `MTD{1..12}` | Hrs Month-To-Date | number (5 dp), len 48 |
| `PTD` | Hrs Period-To-Date | number (5 dp), len 4 |
| `QTD{1..4}` | Hrs Quarter-To-Date | number (5 dp), len 16 |
| `RTD` | Hrs Range-To-Date | number (5 dp), len 4 |
| `TTD` | Hrs TYR-To-Date | number (5 dp), len 4 |

### HBSX

Hour Base for PY200C, mask NONE - HOUR BASES, runtime cluster, key NO, table PYX-XTD-DTL

| Attribute | Description | Type |
|---|---|---|
| `C10TD` | CYCLE 10 TO DT | long number (5 dp), len 8 |
| `C1TD` | CYCLE 1 TO DATE | long number (5 dp), len 8 |
| `C2TD` | CYCLE 2 TO DT | long number (5 dp), len 8 |
| `C3TD` | CYCLE 3 TO DT | long number (5 dp), len 8 |
| `C4TD` | CYCLE 4 TO DT | long number (5 dp), len 8 |
| `C5TD` | CYCLE 5 TO DT | long number (5 dp), len 8 |
| `C6TD` | CYCLE 6 TO DT | long number (5 dp), len 8 |
| `C7TD` | CYCLE 7 TO DT | long number (5 dp), len 8 |
| `C8TD` | CYCLE 8 TO DT | long number (5 dp), len 8 |
| `C9TD` | CYCLE 9 TO DT | long number (5 dp), len 8 |
| `CLS` | Dummy reference | integer, len 2 |
| `CTD` | HRS Base CTD | long number (5 dp), len 8 |
| `FTD` | HRS Base FTD | long number (5 dp), len 8 |
| `LCTD` | LAST CALENDAR YR TO DATE | long number (5 dp), len 8 |
| `LFTD` | LAST FISCAL YR TO DATE | long number (5 dp), len 8 |
| `LTTD` | LAST TAX YEAR TO DATE | long number (5 dp), len 8 |
| `M1TD` | MONTH 1 TO DATE | long number (5 dp), len 8 |
| `M2TD` | MONTH 2 TO DT | long number (5 dp), len 8 |
| `MTD` | HRS Base MTD | long number (5 dp), len 8 |
| `PTD` | HRS Base PTD | long number (5 dp), len 8 |
| `QTD` | HRS Base QTD | long number (5 dp), len 8 |
| `RTD` | HRS Base RTD | long number (5 dp), len 8 |
| `TTD` | HRS Base TTD | long number (5 dp), len 8 |
| `WEEK01` | HBS FLSA Week 1 | long number (5 dp), len 8 |
| `WEEK02` | HBS FLSA Week 2 | long number (5 dp), len 8 |
| `WEEK03` | HBS FLSA Week 3 | long number (5 dp), len 8 |
| `WEEK04` | HBS FLSA Week 4 | long number (5 dp), len 8 |
| `WEEK05` | HBS FLSA Week 5 | long number (5 dp), len 8 |

### HBTD

Hour Base XTD entry, detail cluster, key ID, table PYX-XTD-DTL

| Attribute | Description | Type |
|---|---|---|
| `CTD` | HB CYR-to-Date | long number (5 dp), len 8 |
| `FTD` | HB FYR-to-Date | long number (5 dp), len 8 |
| `ID` | Employee ID | char, len 12 |
| `ITD` | HB Inception-to-Date | long number (5 dp), len 8 |
| `MTD{1..12}` | HB Month-to-Date | number (5 dp), len 48 |
| `NO` | HB XTD No. | number (0 dp), len 4 |
| `OPEN` | Open Area | char, len 8 |
| `OVR` | HB XTD Override | number (0 dp), len 4 |
| `PERNO` | Period for PTD | number (0 dp), len 4 |
| `PERNUM` | Periods | integer, len 2 |
| `PTD` | Hour Base Period Amt. | long number (2 dp), len 8 |
| `QTD{1..4}` | HB Quarter-to-Date | number (5 dp), len 16 |
| `TTD` | HB TYR-to-Date | long number (5 dp), len 8 |
| `YR` | HB XTD Year | char, len 4 |

### HRSD: HOURS DEFINITION

Hour Entry, mask PYUPHH, detail cluster, key NO, table PYM-CDH-DTL

| Attribute | Description | Type |
|---|---|---|
| `BEG` | Hour Begin Date | date (YYYYMMDD), len 8 |
| `CVECT{1..42}` | Hour Switches | char, len 42 |
| `END` | Hour End Date | date (YYYYMMDD), len 8 |
| `FQ` | Hrs. Frequency | char, len 2 |
| `FQTYPE` | Frequency Type | integer, len 2 |
| `HBASE` | Hour Base | integer, len 2 |
| `HVECT{1..42}` | Hour Base Vector | char, len 42 |
| `KEY{1..4}` | Key vector | char, len 40 |
| `NO` | Hour No | integer, len 2 |
| `OBJ{1..4}` | Hrs. Object Code | char, len 32 |
| `OPEN1` | OPEN AREA 1 | char, len 8 |
| `OPEN2` | OPEN AREA 2 | char, len 8 |
| `OPENN1` | OPEN NUM 1 | number (2 dp), len 4 |
| `OPENN2` | OPEN AREA NUM 2 | number (2 dp), len 4 |
| `PBASE` | Pay Base | integer, len 2 |
| `PRI` | Hour Priority | char, len 4 |
| `PVECT{1..42}` | Pay Base Vector | char, len 42 |
| `ST` | Status | char, len 2 |
| `VAL{1..10}` | Hrs. Associated Value | long number (5 dp), len 80 |
| `VALDS{1..10}` | Hrs. Value Description | char, len 200 |

### HRSM

Hour Definition, master cluster, key NO, table PY-CDH-MSTR

| Attribute | Description | Type |
|---|---|---|
| `BEG` | Hour Begin Date | date (YYYYMMDD), len 8 |
| `CD` | Hour Code | char, len 8 |
| `END` | Hour End | date (YYYYMMDD), len 8 |
| `HRDEXT` | HRS.-D HR Extention | char, len 2 |
| `HRMEXT` | HRS.-M HR Extension | char, len 2 |
| `MISC{1..8}` | Hour MISC. Code | char, len 32 |
| `NO` | Hour Number | integer, len 2 |
| `REL{1..8}` | HRS. Relate Code | char, len 48 |
| `TITLE` | Hour Title | char, len 20 |
| `XTD` | Hour XTD Flag | char, len 2 |

### HRSX: HOURS AMOUNTS

Hour for PY200C, mask NONE, runtime cluster, key NO, table PY-CDH-MSTR

| Attribute | Description | Type |
|---|---|---|
| `ADDR` | HRS. Assignment Address | number (5 dp), len 4 |
| `AMT` | HRS. Calculated Amount | number (5 dp), len 4 |
| `ARRAMT` | (Not used for Hours) | number (2 dp), len 4 |
| `ARRBAL` | (Not used for Hours) | number (2 dp), len 4 |
| `C10TD` | cycle10 to dt | long number (5 dp), len 8 |
| `C1TD` | cycle1 to dt | long number (5 dp), len 8 |
| `C2TD` | cycle2 to dt | long number (5 dp), len 8 |
| `C3TD` | cycle3 to dt | long number (5 dp), len 8 |
| `C4TD` | cycle4 to dt | long number (5 dp), len 8 |
| `C5TD` | cycle5 to dt | long number (5 dp), len 8 |
| `C6TD` | cycle6 to dt | long number (5 dp), len 8 |
| `C7TD` | cycle7 to dt | long number (5 dp), len 8 |
| `C8TD` | cycle8 to dt | long number (5 dp), len 8 |
| `C9TD` | cycle9 to dt | long number (5 dp), len 8 |
| `CTD` | HRS. CYR-To-Date | long number (5 dp), len 8 |
| `FTD` | HRS. FYR-To-Date | long number (5 dp), len 8 |
| `LCTD` | LAST CALENDAR YR TO DATE | long number (5 dp), len 8 |
| `LFTD` | LAST FISCAL YR TO DATE | long number (5 dp), len 8 |
| `LTTD` | LAST TAX YEAR TO DATE | long number (5 dp), len 8 |
| `M1TD` | month1 to dt | long number (5 dp), len 8 |
| `M2TD` | month2 to dt | long number (5 dp), len 8 |
| `MTD` | HRS. Month-To-Date | long number (5 dp), len 8 |
| `NO` | Hour Number | integer, len 2 |
| `PAYAMT` | pay amt | number (2 dp), len 4 |
| `PRCENT` | % rel. to MSCX.PRCENT | number (5 dp), len 4 |
| `PRDS` | Number of periods | integer, len 2 |
| `PRI` | HRS Assignment Priority | char, len 4 |
| `QTD` | HRS. Quarter-To-Date | long number (5 dp), len 8 |
| `RATE` | rate | number (5 dp), len 4 |
| `RTD` | HRS. Range-To-Date | long number (5 dp), len 8 |
| `STATUS` | status | char, len 2 |
| `TKL` | HRS. Trickle Amount | number (5 dp), len 4 |
| `TTD` | HRS. TYR-To-Date | long number (5 dp), len 8 |
| `WKDOL1` | FLSA Dollars for Week 1 | number (2 dp), len 4 |
| `WKDOL2` | FLSA Dollars for Week 2 | number (2 dp), len 4 |
| `WKDOL3` | FLSA Dollars for Week 3 | number (2 dp), len 4 |
| `WKDOL4` | FLSA Dollars for Week 4 | number (2 dp), len 4 |
| `WKDOL5` | FLSA Dollars for Week 5 | number (2 dp), len 4 |
| `WKHRS1` | FLSA Hours for Week 1 | number (5 dp), len 4 |
| `WKHRS2` | FLSA Hours for Week 2 | number (5 dp), len 4 |
| `WKHRS3` | FLSA Hours for Week 3 | number (5 dp), len 4 |
| `WKHRS4` | FLSA Hours for Week 4 | number (5 dp), len 4 |
| `WKHRS5` | FLSA Hours for Week 5 | number (5 dp), len 4 |

### HSTX

Employee History for PY200C, runtime cluster, key CDHNO

| Attribute | Description | Type |
|---|---|---|
| `CDHAMT` | History CDH amount | number (5 dp), len 4 |
| `CDHDPT` | pointer to the cdhd tble | integer, len 2 |
| `CDHNO` | History CDH No | integer, len 2 |
| `DTEND` | END OF DAILY TC ENTRY | integer, len 2 |
| `DTSTRT` | START OF DAILY TC ENTRY | integer, len 2 |
| `ORGAMT` | ORIGINAL AMOUNT | number (5 dp), len 4 |
| `OVRFLG` | History override flag | char, len 1 |
| `PYPD` | History PYPD Pointer | integer, len 2 |
| `SAFLAG` | History SA flag | integer, len 2 |

### HXTD

Hour XTD entry, detail cluster, key ID, table PYX-XTD-DTL

| Attribute | Description | Type |
|---|---|---|
| `CTD` | Hour CYR-to-Date | long number (5 dp), len 8 |
| `FTD` | Hour FYR-to-Date | long number (5 dp), len 8 |
| `ID` | Employee ID | char, len 12 |
| `ITD` | Hour Inception-to-Date | long number (5 dp), len 8 |
| `MTD{1..12}` | Hour Month-to-Date | long number (5 dp), len 96 |
| `NO` | Hour XTD No. | number (0 dp), len 4 |
| `OPEN` | Open Area | char, len 8 |
| `OVR` | Hour XTD Override | number (0 dp), len 4 |
| `PERNO` | Per no for PTD amt | number (0 dp), len 4 |
| `PERNUM` | Periods | integer, len 2 |
| `PTD` | Period Amount | long number (5 dp), len 8 |
| `QTD{1..4}` | Hour Quarter-to-Date | long number (5 dp), len 32 |
| `TTD` | Hour TYR-to-Date | long number (5 dp), len 8 |
| `YR` | Hour XTD Year | char, len 4 |

### JOBM

Job Definition, master cluster, key CD, table PY-JOB-MSTR

| Attribute | Description | Type |
|---|---|---|
| `BEG` | Job Begin Date | date (YYYYMMDD), len 8 |
| `CD` | Job Code | char, len 10 |
| `CLDCD` | Job Calendar Code | char, len 8 |
| `DS{1..2}` | Job Description | char, len 120 |
| `EEOC` | Job EEOC Code | char, len 4 |
| `END` | Job End Date | date (YYYYMMDD), len 8 |
| `FAMILY` | Job Family | char, len 4 |
| `FLSAQ` | Job FLSA Type | char, len 2 |
| `HRDEXT` | Position HR Extention | char, len 2 |
| `HRMEXT` | HR Job Extention | char, len 2 |
| `MISC{1..4}` | Job Misc. Code | char, len 16 |
| `MISCV{1..4}` | Job Misc. Value | number (2 dp), len 16 |
| `SALGRD` | Job Salary Grade | char, len 8 |
| `SUPRQ` | Job Supervisory Flag | char, len 2 |
| `TITLE` | Job Title | char, len 30 |
| `TTLFTE` | Job Total FTE | number (5 dp), len 4 |
| `WC` | JOB Workmen's Comp. | char, len 8 |

### MSCA

Miscellaneous for PY200C, runtime cluster, key STATUS

| Attribute | Description | Type |
|---|---|---|
| `CY` | Calendar Year Flag | integer, len 2 |
| `FY` | Fiscal Year Flag | integer, len 2 |
| `HI` | High day range | date (YYYYMMDD), len 8 |
| `LO` | Low day range | date (YYYYMMDD), len 8 |
| `PERCD` | Period Type Code | char, len 2 |
| `RANGE` | Range Flag | integer, len 2 |
| `STATUS` | Status | char, len 20 |
| `TARGET` | Targe year | char, len 4 |
| `TM` | Tax Month Flag | integer, len 2 |
| `TQ` | Tax Quarter Flag | integer, len 2 |
| `TY` | Tax Year Flag | integer, len 2 |

### MSCX: MISC AMOUNTS CALCULATED BY SYSTEM

Miscellaneous for PY200C, mask NONE, runtime cluster, key EMPAGE

| Attribute | Description | Type |
|---|---|---|
| `ANNIV` | Is this period the anniv | char, len 1 |
| `ANUPAY` | ANNUAL PAY1 | number (2 dp), len 4 |
| `ANUPY2` | ANNUAL PAY2 | number (2 dp), len 4 |
| `ANUPY3` | ANNUAL PAY3 | number (2 dp), len 4 |
| `ANUPY4` | ANNUAL PAY 4 | number (2 dp), len 4 |
| `ANVPCT` | Anniversary Percent | number (5 dp), len 4 |
| `ARREAR` | ARREARS AMOUNT | number (2 dp), len 4 |
| `CAPDED` | Sec. 125 Ded. Amount | number (2 dp), len 4 |
| `CAPPTD` | Sec. 125 Period Total | number (2 dp), len 4 |
| `CHR1` | MISC CVAR | char, len 20 |
| `CHR10` | MISC CVAR | char, len 20 |
| `CHR11` | MISC CVAR | char, len 20 |
| `CHR12` | MISC CVAR | char, len 20 |
| `CHR13` | MISC CVAR | char, len 20 |
| `CHR14` | MISC CVAR | char, len 20 |
| `CHR15` | MISC CVAR | char, len 20 |
| `CHR16` | MISC CVAR | char, len 20 |
| `CHR17` | MISC CVAR | char, len 20 |
| `CHR18` | MISC CVAR | char, len 20 |
| `CHR19` | MISC CVAR | char, len 20 |
| `CHR2` | MISC CVAR | char, len 20 |
| `CHR20` | MISC CVAR | char, len 20 |
| `CHR3` | MISC CVAR | char, len 20 |
| `CHR4` | MISC CVAR | char, len 20 |
| `CHR5` | MISC CVAR | char, len 20 |
| `CHR6` | MISC CVAR | char, len 20 |
| `CHR7` | MISC CVAR | char, len 20 |
| `CHR8` | MISC CVAR | char, len 20 |
| `CHR9` | MISC CVAR | char, len 20 |
| `CSUP` | Original CSUP amount | number (2 dp), len 4 |
| `CYESQ` | CYE Seq. for PY200 | integer, len 2 |
| `DAYCTR{1..5}` | Day Counter | integer, len 10 |
| `DAYS` | Days Worked | integer, len 2 |
| `EFTNET` | Original NET for EFT | number (2 dp), len 4 |
| `EMPAGE` | Employee' Age | integer, len 2 |
| `EMPDHR` | DAILY HOURS | number (5 dp), len 4 |
| `EMPDYS` | Emp days of service | number (5 dp), len 4 |
| `EMPHOL` | EMP HOLIDAY HRS | number (5 dp), len 4 |
| `EMPHRA` | GENERIC EMP HR1 | number (5 dp), len 4 |
| `EMPHRB` | GENERIC EMP HR2 | number (5 dp), len 4 |
| `EMPHRS` | Sys. Derived Default HRS | number (5 dp), len 4 |
| `EMPMOS` | Employee Month of Serv. | integer, len 2 |
| `FICA` | Calculated FICA | number (2 dp), len 4 |
| `FIT` | Calculated FIT | number (2 dp), len 4 |
| `FYESQ` | FYE Seq. for PY200 | integer, len 2 |
| `GARN` | Original GARN amount | number (2 dp), len 4 |
| `HRSOVR{1..5}` | Hours Over Limit | number (5 dp), len 20 |
| `LEVY` | Original LEVY amount | number (2 dp), len 4 |
| `MASK` | MASK | char, len 10 |
| `MEDI` | Calculated MEDI | number (2 dp), len 4 |
| `NUM1` | MISC NVAR | long number (5 dp), len 8 |
| `NUM10` | MISC NVAR | long number (5 dp), len 8 |
| `NUM11` | MISC NVAR | long number (5 dp), len 8 |
| `NUM12` | MISC NVAR | long number (5 dp), len 8 |
| `NUM13` | MISC NVAR | long number (5 dp), len 8 |
| `NUM14` | MISC NVAR | long number (5 dp), len 8 |
| `NUM15` | MISC NVAR | long number (5 dp), len 8 |
| `NUM16` | MISC NVAR | long number (5 dp), len 8 |
| `NUM17` | MISC NVAR | long number (5 dp), len 8 |
| `NUM18` | MISC NVAR | long number (5 dp), len 8 |
| `NUM19` | MISC NVAR | long number (5 dp), len 8 |
| `NUM2` | MISC NVAR | long number (5 dp), len 8 |
| `NUM20` | MISC NVAR | long number (5 dp), len 8 |
| `NUM3` | MISC NVAR | long number (5 dp), len 8 |
| `NUM4` | MISC NVAR | long number (5 dp), len 8 |
| `NUM5` | MISC NVAR | long number (5 dp), len 8 |
| `NUM6` | MISC NVAR | long number (5 dp), len 8 |
| `NUM7` | MISC NVAR | long number (5 dp), len 8 |
| `NUM8` | MISC NVAR | long number (5 dp), len 8 |
| `NUM9` | MISC NVAR | long number (5 dp), len 8 |
| `PDDAYS` | PAID DAYS THIS PERIOD | integer, len 2 |
| `PERDAY` | TOTAL DAYS THIS PERIOD | integer, len 2 |
| `PERHRS` | Hours for the period | number (5 dp), len 4 |
| `PM` | PRIMARY PAY ASSGN | integer, len 2 |
| `PMRATE` | Primary Rate | number (5 dp), len 4 |
| `PRCENT` | % covered by day range | number (5 dp), len 4 |
| `STATUS` | Operation status | char, len 20 |
| `WEEKS` | Weeks Worked | integer, len 2 |
| `WKHRS{1..5}` | FLSA Hours in Week | number (5 dp), len 20 |
| `WKHRST` | FLSA Hours Tot All Wks | number (5 dp), len 4 |
| `WKMAXH` | FLSA Weekly Threshold | number (5 dp), len 4 |
| `WKOVR{1..5}` | FLSA OT Hours in Week | number (5 dp), len 20 |
| `WKOVRT` | FLSA OT Hr Tot all Wks | number (5 dp), len 4 |
| `WKPAY{1..5}` | FLSA Pay in Week | number (5 dp), len 20 |
| `WKPAYT` | FLSA Pay Tot in all Wks | number (5 dp), len 4 |

### MSGX

Program cluster for MSG CNTR, runtime cluster, key STATUS

| Attribute | Description | Type |
|---|---|---|
| `CDHMOD` | CDH MODE | integer, len 2 |
| `DBSTAT` | Status of PUT,UPDATE,DEL | integer, len 2 |
| `MODE` | MESSAGE CENTER MODE | integer, len 2 |
| `PEID` | Person Entity in MSG | char, len 12 |
| `PERBEG` | Message Cntr. Period Beg | date (YYYYMMDD), len 8 |
| `PEREND` | Message Cntr. Period End | date (YYYYMMDD), len 8 |
| `PERIOD` | msg center period number | number (0 dp), len 4 |
| `REWIND` | Rewind directive | integer, len 2 |
| `RWCLS` | REWIND CLUSTER NAME | char, len 4 |
| `STATUS` | STATUS OF LAST LOAD | integer, len 2 |
| `TODAY` | TODAY'S DATE | date (YYYYMMDD), len 8 |

### NAME

NAME AND IDENTIFICATION, system cluster, key PEID

| Attribute | Description | Type |
|---|---|---|
| `DEPT` | Primary Department | char, len 12 |
| `DEPT2` | First Secondary Dept | char, len 12 |
| `DEPT3` | Second Secondary Dept | char, len 12 |
| `DEPT4` | Third Secondary Dept. | char, len 12 |
| `NAME` | Name of person | char, len 30 |
| `PEID` | Person/Entity ID | char, len 12 |
| `SSN{1..4}` | Social Security Number | SSN, len 10 |
| `TYPE` | Primary Type | char, len 2 |
| `TYPE2` | First Secondary Type | char, len 2 |
| `TYPE3` | Second Secondary Type | char, len 2 |
| `TYPE4` | Third Secondary Type | char, len 2 |

### NUCD: COMMON CODES

ROOTDB Common Codes, mask NUUPCD, master cluster, key CC, table CD-CODES-MSTR

| Attribute | Description | Type |
|---|---|---|
| `ASCODE{1..5}` | Associated Code | char, len 60 |
| `ASDESC{1..5}` | Associated Desc. | char, len 150 |
| `ASVAL{1..5}` | Associated Value | long number (5 dp), len 40 |
| `CC` | Code Category | char, len 14 |
| `DESCL` | Long Description | char, len 72 |
| `DESCM` | Medium Description | char, len 30 |
| `DESCS` | Short Desc. | char, len 12 |

### NUMD

Code Entry, detail cluster, key NUMCD, table PYN-NUM-DTL

| Attribute | Description | Type |
|---|---|---|
| `CHRCD` | Character Code | char, len 72 |
| `NUMCD` | Numeric Code | number (0 dp), len 4 |

### NUMM

Numeric Code Definition, master cluster, key CD, table PY-NUM-MSTR

| Attribute | Description | Type |
|---|---|---|
| `CD` | Numeric Code | number (0 dp), len 4 |

### OPAY

Outside pay asgns in py200, runtime cluster, key CLS

| Attribute | Description | Type |
|---|---|---|
| `BEG` | begin date | date (YYYYMMDD), len 8 |
| `CLS` | dummy attribute | integer, len 2 |
| `CNTID` | Contract ID | char, len 32 |
| `END` | end date | date (YYYYMMDD), len 8 |
| `MSCNUM{1..5}` | Misc Numbers | number (2 dp), len 4 |
| `NUMCD` | numcd | number (0 dp), len 4 |
| `OT` | overtime | number (5 dp), len 4 |
| `PREM` | premium rate | number (5 dp), len 4 |
| `REG` | regular | number (5 dp), len 4 |
| `SAL` | salary | number (2 dp), len 4 |
| `SORT` | Sort Fields | char, len 16 |
| `ST` | status | char, len 2 |
| `TYPE` | record type | char, len 2 |
| `XP` | expressed as | char, len 2 |

### PAYM

Pay Definition, master cluster, key NO, table PY-PAY-MSTR

| Attribute | Description | Type |
|---|---|---|
| `BEG` | Pay Begin Date | date (YYYYMMDD), len 8 |
| `CD` | Pay Code | char, len 8 |
| `END` | Pay End Date | date (YYYYMMDD), len 8 |
| `HRDEXT` | Pay-D HR Extention | char, len 2 |
| `HRMXTD` | Pay-M HR Extention | char, len 2 |
| `MISC{1..8}` | Pay MISC Code | char, len 32 |
| `NO` | Pay No. | integer, len 2 |
| `PVECT{1..32}` | Pay Switches | char, len 32 |
| `REL{1..8}` | Pay Relate-to Code | char, len 48 |
| `TITLE` | Pay Title | char, len 20 |

### PBSA

Pay Bases for PY902C, runtime cluster, key CLS

| Attribute | Description | Type |
|---|---|---|
| `CLS` | Dummy reference | integer, len 2 |
| `CTD` | Pay CYR-To-Date | number (2 dp), len 4 |
| `FTD` | Pay FYR-To-Date | number (2 dp), len 4 |
| `MTD{1..12}` | Pay Month-To-Date | number (2 dp), len 48 |
| `PTD` | Pay Period-To-Date | number (2 dp), len 4 |
| `QTD{1..4}` | Pay Quarter-To-Date | number (2 dp), len 16 |
| `RTD` | Pay Range-To-Date | number (2 dp), len 4 |
| `TTD` | Pay TYR-To-Date | number (2 dp), len 4 |

### PBSX

Pay Bases for PY200C, mask NONE PAY BASES, runtime cluster, key NO, table PYX-XTD-DTL

| Attribute | Description | Type |
|---|---|---|
| `C10TD` | CYCLE 10 TO DT | long number (2 dp), len 8 |
| `C1TD` | CYCLE 1 TO DATE | long number (2 dp), len 8 |
| `C2TD` | CYCLE 2 TO DT | long number (2 dp), len 8 |
| `C3TD` | CYCLE 3 TO DT | long number (2 dp), len 8 |
| `C4TD` | CYCLE 4 TO DT | long number (2 dp), len 8 |
| `C5TD` | CYCLE 5 TO DT | long number (2 dp), len 8 |
| `C6TD` | CYCLE 6 TO DT | long number (2 dp), len 8 |
| `C7TD` | CYCLE 7 TO DT | long number (2 dp), len 8 |
| `C8TD` | CYCLE 8 TO DT | long number (2 dp), len 8 |
| `C9TD` | CYCLE 9 TO DT | long number (2 dp), len 8 |
| `CLS` | Dummy reference | integer, len 2 |
| `CTD` | Pay Base CTD | long number (2 dp), len 8 |
| `FTD` | Pay Base FTD | long number (2 dp), len 8 |
| `LCTD` | LAST CALENDAR YR TO DATE | long number (2 dp), len 8 |
| `LFTD` | LAST FISCAL YR TO DATE | long number (2 dp), len 8 |
| `LTTD` | LAST TAX YR TO DATE | long number (2 dp), len 8 |
| `M1TD` | MONTH 1 TO DT | long number (2 dp), len 8 |
| `M2TD` | MONTH 2 TO DT | long number (2 dp), len 8 |
| `MTD` | Pay Base MTD | long number (2 dp), len 8 |
| `PTD` | Pay Base PTD | long number (2 dp), len 8 |
| `QTD` | Pay Base QTD | long number (2 dp), len 8 |
| `RTD` | Pay Base RTD | long number (2 dp), len 8 |
| `TTD` | Pay Base TTD | long number (2 dp), len 8 |
| `WEEK01` | PBS FLSA Week 1 | long number (2 dp), len 8 |
| `WEEK02` | PBS FLSA Week 2 | long number (2 dp), len 8 |
| `WEEK03` | PBS FLSA Week 3 | long number (2 dp), len 8 |
| `WEEK04` | PBS FLSA Week 4 | long number (2 dp), len 8 |
| `WEEK05` | PBS FLSA Week 5 | long number (2 dp), len 8 |

### PBTD

Pay Base XTD entry, detail cluster, key ID, table PYX-XTD-DTL

| Attribute | Description | Type |
|---|---|---|
| `CTD` | PB CYR-to-Date | long number (2 dp), len 8 |
| `FTD` | PB FYR-to-Date | long number (2 dp), len 8 |
| `ID` | Employee ID | char, len 12 |
| `ITD` | PB Inception-to-Date | long number (2 dp), len 8 |
| `MTD{1..12}` | PB Month-to-Date | long number (2 dp), len 96 |
| `NO` | PB XTD No. | number (0 dp), len 4 |
| `OPEN` | Open Area | char, len 8 |
| `OVR` | PB XTD Override | number (0 dp), len 4 |
| `PERNO` | Period for PTD | number (0 dp), len 4 |
| `PERNUM` | Periods | integer, len 2 |
| `PTD` | Period Amount | long number (2 dp), len 8 |
| `QTD{1..4}` | PB Quarter-to-Date | long number (2 dp), len 32 |
| `TTD` | PB TYR-to-Date | long number (2 dp), len 8 |
| `YR` | PB XTD Year | char, len 4 |

### PCDX

Payroll Codes, runtime cluster, key CLSAT, table PYC-CODES-DTL

| Attribute | Description | Type |
|---|---|---|
| `CDCODE` | Class Code | char, len 16 |
| `CLS` | PCDX Dummy Reference | integer, len 2 |
| `CLSAT` | Cluster/Attr | char, len 20 |
| `DESCL` | Long Desc | char, len 30 |
| `DESCS` | Short Desc | char, len 16 |
| `GROUP` | Group | char, len 8 |
| `MISC1` | Misc Code1 | char, len 16 |
| `MISC2` | Misc Code 2 | char, len 16 |
| `MISC3` | Misc Code 3 | char, len 16 |
| `MISC4` | Misc Code 4 | char, len 16 |
| `MISC5` | Misc Code 5 | char, len 16 |
| `SEQNO` | Sequence No. | integer, len 2 |
| `VAL1` | Misc Value 1 | long number (5 dp), len 8 |
| `VAL2` | Misc Value 2 | long number (5 dp), len 8 |
| `VAL3` | Misc Value 3 | long number (5 dp), len 8 |
| `VAL4` | Misc Value 4 | long number (5 dp), len 8 |
| `VAL5` | Misc Value 5 | long number (5 dp), len 8 |

### PECC

Emp./Period No. Entry, master cluster, key PECC, table PY-PEC-MSTR

| Attribute | Description | Type |
|---|---|---|
| `PECC` | Emp./Period No. Code | char, len 16 |

### PERM: PAY PERIOD DEFINITION

Period Definition, mask PYUPPR, master cluster, key CC, table PY-PER-MSTR

| Attribute | Description | Type |
|---|---|---|
| `ASCPER{1..10}` | Associated periods | number (0 dp), len 40 |
| `BEG` | Period Begin Date | date (YYYYMMDD), len 8 |
| `BSFLAG` | Base flags (PB or HB) | char, len 2 |
| `CALC` | Period Being Calculated | char, len 2 |
| `CC` | Period Number | number (0 dp), len 4 |
| `CD` | Period Code | char, len 8 |
| `CKDT` | Period Check Date | date (YYYYMMDD), len 8 |
| `CKID` | Period Check ID | char, len 2 |
| `CMNTH` | Period Calendar Month | integer, len 2 |
| `CQTR` | Period Calendar QTR | integer, len 2 |
| `CXTYPE` | Contract Type Codes | char, len 10 |
| `CYR` | Period Calendar Year | integer, len 2 |
| `EFTDT` | EFT Effective Date | date (YYYYMMDD), len 8 |
| `EFTID` | EFT Stock ID | char, len 2 |
| `END` | Period End Date | date (YYYYMMDD), len 8 |
| `FMNTH` | Period Fiscal Month | integer, len 2 |
| `FQTR` | Period Fiscal QTR | integer, len 2 |
| `FREQ` | Period Frequency | char, len 2 |
| `FVECT{1..10}` | Period Frequency Vect. | char, len 20 |
| `FYR` | Period Fiscal Year | integer, len 2 |
| `HRMEXT` | Period HR Extention | char, len 2 |
| `OPEN` | Open Area | char, len 2 |
| `PAID` | Period Paid Flag | char, len 2 |
| `POSTDT` | Period Post Date | date (YYYYMMDD), len 8 |
| `SQ` | Period Seq. in Month | integer, len 2 |
| `TCLOCK` | Timecard Lock Flag | char, len 1 |
| `TMNTH` | Period Tax Month | integer, len 2 |
| `TMPERS` | Periods in TMNTH | integer, len 2 |
| `TQTR` | Period Tax QTR | integer, len 2 |
| `TYPE` | Period Type (REG/SUPPL) | char, len 4 |
| `TYPERS` | Periods in TYR | integer, len 2 |

### PHRD

Pay Hour Entry, master cluster, key NO, table PYH-HRS-DTL

| Attribute | Description | Type |
|---|---|---|
| `HRSNO` | Hour No. | integer, len 2 |
| `PAYNO` | Pay No. | integer, len 2 |

### POSD

Position Entry, detail cluster, key POSCD

| Attribute | Description | Type |
|---|---|---|
| `BEG` | Position Begin Date | date (YYYYMMDD), len 8 |
| `CLDCD` | Position Calendar Code | char, len 8 |
| `DESC` | Position Description | char, len 30 |
| `END` | Position End Date | date (YYYYMMDD), len 8 |
| `GENCD` | Position Entity Code | char, len 4 |
| `JOBCD` | Postion Job Code | char, len 10 |
| `MISC{1..8}` | Position MISC. Code | char, len 32 |
| `PEID` | Position PEID | char, len 12 |
| `POSCD` | Position Code | char, len 10 |
| `SHARE` | Position Share Flag | char, len 2 |
| `SUPRID` | Position Supervisor ID | char, len 12 |
| `TTLFTE` | Position Total FTE | number (5 dp), len 4 |
| `TYPE` | Position Type | char, len 2 |

### POSM

Position Definition, master cluster, key CD, table PY-POS-MSTR

| Attribute | Description | Type |
|---|---|---|
| `CD` | Position Code | char, len 10 |

### PXTD

Pay XTD entry, detail cluster, key ID, table PYX-XTD-DTL

| Attribute | Description | Type |
|---|---|---|
| `CTD` | PAY CYR-TO-DATE | long number (2 dp), len 8 |
| `FTD` | Pay FYR-to-Date | long number (2 dp), len 8 |
| `ID` | Employee ID | char, len 12 |
| `ITD` | Pay Inception-to-Date | long number (2 dp), len 8 |
| `MTD{1..12}` | Pay Month-to-Date | long number (2 dp), len 96 |
| `NO` | Pay XTD No. | number (0 dp), len 4 |
| `OPEN` | Open Area | char, len 8 |
| `OVR` | Pay XTD Override | number (0 dp), len 4 |
| `PERNO` | Period for PTD | number (0 dp), len 4 |
| `PERNUM` | Periods Paid | integer, len 2 |
| `PTD` | Period Amount | long number (2 dp), len 8 |
| `QTD{1..4}` | Pay Quarter-to-Date | long number (2 dp), len 32 |
| `TTD` | Pay TYR-to-Date | long number (2 dp), len 8 |
| `YR` | Pay XTD Year | char, len 4 |

### PYAS

PY EMP ASSOC DTL CLUSTER, detail cluster, key ID

| Attribute | Description | Type |
|---|---|---|
| `ACCTID` | emp account number id | char, len 20 |
| `BANKID` | bank id | char, len 10 |
| `CD` | ASSOCIATED CODE | char, len 12 |
| `ID` | emp id | char, len 12 |

### PYPX

Pay Assignment for PY200C, mask PYUPEP - USED FOR LOOPING THRU PAY ASSIGNMENTS, runtime cluster, key NUM

| Attribute | Description | Type |
|---|---|---|
| `AMT` | PYPD amount | number (5 dp), len 8 |
| `AUXSAL` | Auxillary Salary | number (2 dp), len 4 |
| `BEG1` | Beg DT of 1st rate | date (YYYYMMDD), len 8 |
| `BEG2` | Beg DT of 2nd rate | date (YYYYMMDD), len 8 |
| `CALND1` | CALENDAR1 | char, len 8 |
| `CALND2` | CALENDAR 2 | char, len 8 |
| `CHGDT` | Change Date | date (YYYYMMDD), len 8 |
| `CLD` | Calendar Code | char, len 8 |
| `CLDPCT` | Calendar Percent | number (5 dp), len 4 |
| `CLS` | PYPX Dummy Reference | integer, len 2 |
| `CNTID` | contract id | char, len 32 |
| `CXNDX` | Contract Index | number (0 dp), len 2 |
| `DOLDAY` | Dollars per Day | number (2 dp), len 4 |
| `EFFORT` | PYPX Effort | number (5 dp), len 4 |
| `END1` | End DT of 1st rate | date (YYYYMMDD), len 8 |
| `END2` | End DT of 2nd rate | date (YYYYMMDD), len 8 |
| `FACTOR` | Retro Factor | number (5 dp), len 4 |
| `FROM` | FROM FLAG | char, len 1 |
| `GL` | GL LEDGER | char, len 2 |
| `GLKEY` | GL ORG KEY | char, len 30 |
| `GLOBJ` | GL OBJECT | char, len 8 |
| `HBASE{1..42}` | PYPX Hour Bases | number (5 dp), len 168 |
| `HRSDAY` | Hours per Day | number (5 dp), len 4 |
| `JL` | JL LEDGER | char, len 2 |
| `JLKEY` | JL ORG KEY | char, len 30 |
| `JLOBJ` | JL OBJECT CODE | char, len 8 |
| `LMT` | PYPX Limit amount | number (2 dp), len 4 |
| `LMTXP` | PYPX Limit Expression | char, len 2 |
| `MISCCD{1..8}` | MISC CODES | char, len 32 |
| `MSCCHR{1..5}` | Miscellaneous Strings | char, len 40 |
| `MSCNU2{1..5}` | 2nd Misc Numbers | number (2 dp), len 20 |
| `MSCNUM{1..5}` | Miscellaneous Numbers | number (2 dp), len 20 |
| `NUMCD` | PYPX Numeric Code | number (0 dp), len 4 |
| `OPEN` | pyp-open field | char, len 8 |
| `OT` | PYPX Overtime Rate | number (5 dp), len 4 |
| `OT2` | 2nd OT rate | number (5 dp), len 4 |
| `OVR` | numcd override flag | char, len 1 |
| `PATCDH{1..50}` | patch cdhs | integer, len 100 |
| `PATHWM` | patch hwm | integer, len 2 |
| `PATRT1` | Patch Prorate Pct 1 | number (5 dp), len 4 |
| `PATRT2` | Patch Prorate Pct 2 | number (5 dp), len 4 |
| `PATTP1` | Patch Type 1 | char, len 2 |
| `PATTP2` | Patch Type 2 | char, len 2 |
| `PAYBEG` | Actual Begin date | date (YYYYMMDD), len 8 |
| `PAYEND` | Payassignment end date | date (YYYYMMDD), len 8 |
| `PAYNO` | PYPX Pay Number | integer, len 2 |
| `PBASE{1..42}` | PYPX Pay bases | number (2 dp), len 168 |
| `PDBEG1` | Paid Begin Date | date (YYYYMMDD), len 8 |
| `PDBEG2` | Paid Beg Date | date (YYYYMMDD), len 8 |
| `PDEND1` | Paid End Date | date (YYYYMMDD), len 8 |
| `PDEND2` | Paid End Date | date (YYYYMMDD), len 8 |
| `POS` | POSITION CODE | char, len 10 |
| `POTYPE` | Payout Type | char, len 2 |
| `PRCENT` | % rel. to EMPM.PRCENT | number (5 dp), len 4 |
| `PREM2` | 2nd premium rate | number (5 dp), len 4 |
| `PREMUM` | PYPX Premium Rate | number (5 dp), len 4 |
| `PTBEG` | Patch Begin Date | date (YYYYMMDD), len 8 |
| `PTEND` | Patch end Date | date (YYYYMMDD), len 8 |
| `PTFLAG` | Patch Flag | char, len 2 |
| `RECTP` | rec type | char, len 4 |
| `RECTYP` | PYPD-RT | char, len 2 |
| `REG` | PYPX Regular Rate | number (5 dp), len 4 |
| `REG2` | 2nd regular rate | number (5 dp), len 4 |
| `RETRDT` | Retro Date | date (YYYYMMDD), len 8 |
| `RETRTP` | Retro Type | char, len 2 |
| `SAL` | PYPX Salary Amount | number (2 dp), len 4 |
| `SAL2` | 2nd salary | number (2 dp), len 4 |
| `SPDIFF` | Diff. of SPLIT1 & 2 | number (5 dp), len 4 |
| `SPLIT` | 1st split rate % | number (5 dp), len 4 |
| `SPREAD` | PYPX Spread Flag | integer, len 2 |
| `SPRVAL` | Spread Value | number (2 dp), len 4 |
| `SPVECT` | Special Vector | char, len 12 |
| `ST` | PYPX Status | char, len 2 |
| `STEP` | STEP | char, len 4 |
| `TCBTCH` | Time Card Batch | char, len 16 |
| `UNIT` | Bargaining Unit | char, len 8 |
| `UPRT10` | paystr user part 10 | char, len 20 |
| `UPRT11` | user paystr part 11 | char, len 20 |
| `UPRT12` | user paystr part 12 | char, len 20 |
| `UPRT13` | user pystr part 13 | char, len 20 |
| `UPRT14` | user pystr part 14 | char, len 20 |
| `UPRT15` | user pystr part 15 | char, len 20 |
| `UPRT16` | user pystr part 16 | char, len 20 |
| `UPRT17` | user pystr part 17 | char, len 20 |
| `UPRT18` | user pystr part 18 | char, len 20 |
| `VECT{1..3}` | PYPX Spread Vectors | char, len 18 |
| `WCOMP` | PYPX WORKCOMP Rate | number (5 dp), len 4 |
| `XP` | PYPX Salary Expression | char, len 2 |
| `XP2` | XP CODE FOR SAL2 | char, len 2 |
| `XTD` | PYPD XTD amount | long number (2 dp), len 8 |

### PYTH

Daily Time Entries, detail cluster, key ID

| Attribute | Description | Type |
|---|---|---|
| `AMT{1..25}` | PAY AMOUNT FROM HOUR | number (2 dp), len 100 |
| `AMTOVR{1..25}` | PAY OVERWRITE | char, len 50 |
| `AUDIT` | PYT-AUDIT | date (YYYYMMDD), len 24 |
| `BATCH` | PYT-BATCH-NAME | char, len 12 |
| `BATCHN` | Batch Name | char, len 12 |
| `DATE{1..25}` | Date | date (YYYYMMDD), len 200 |
| `HOURS{1..25}` | NUMBER OF HOURS | number (5 dp), len 100 |
| `HRSNO{1..25}` | HOURS NUMBER | integer, len 50 |
| `HRSOVR{1..17}` | HOUR OVERWRITE | char, len 50 |
| `ID` | EMPLOYEE ID | char, len 12 |
| `JOBNO` | Job number | number (2 dp), len 4 |
| `NUMCD` | PYT-NUM-CD | number (0 dp), len 4 |
| `NUMOVR` | NUM OVERWRITE FLAG | char, len 2 |
| `OPEN{1..25}` | DETAIL OPEN | char, len 100 |
| `OPEN1` | OPEN 1 | char, len 8 |
| `OPEN2` | OPEN 2 | char, len 8 |
| `OPENN2` | OPEN NUM 2 | number (2 dp), len 4 |
| `PART1` | PART 1 | char, len 12 |
| `PART2` | PART 2 | char, len 12 |
| `PART3` | PART 3 | char, len 12 |
| `PART4` | PART 4 | char, len 12 |
| `PERCC` | PERIOD | number (0 dp), len 4 |
| `RATE{1..25}` | RATE | number (5 dp), len 100 |
| `RECNO` | RECORD NUMBER | char, len 6 |
| `RECTP` | RECORD TYPE | char, len 2 |
| `RTADJ{1..25}` | RATE ADJUSTMENT | number (5 dp), len 100 |
| `RTOVR{1..25}` | RATE OVERWRITE | char, len 50 |
| `SPREAD` | SPREAD INFO | char, len 12 |
| `STATUS` | STATUS | char, len 2 |
| `TMCCC` | PY-TMC-CC | char, len 16 |

### RING

Hourly Time Entry, detail cluster, key ID

| Attribute | Description | Type |
|---|---|---|
| `CLNDR` | Calendar | char, len 8 |
| `DATETM{1..10}` | DATE-TIME | char, len 200 |
| `DTLOPN{1..10}` | Open area | char, len 40 |
| `ID` | Employee ID | char, len 12 |
| `OPEN1` | Open area 1 | char, len 8 |
| `OPEN2` | Open area 2 | char, len 8 |
| `OPENN1` | OPEN NUM 1 | number (2 dp), len 4 |
| `OPENN2` | OPEN NUM 2 | number (2 dp), len 4 |
| `PERCC` | Ring Timecard Period | integer, len 4 |
| `RINGCC` | PY-RNG-CC | char, len 16 |
| `SCHEDU` | SCHEDULE | char, len 8 |
| `STATUS` | STATUS FLAG | char, len 2 |

### SASG

CDH Assgn. Cluster STRS, runtime cluster, key NO

| Attribute | Description | Type |
|---|---|---|
| `ADDAMT` | CDH assgn. additive amt | number (2 dp), len 4 |
| `ADDBEG` | CDH assgn. add start | date (YYYYMMDD), len 8 |
| `ADDEND` | CDH assgn. add end | date (YYYYMMDD), len 8 |
| `AMT` | CDH assgn. amount | number (2 dp), len 4 |
| `AXP` | CDH assgn. amt. express | char, len 2 |
| `BEG` | CDH assgn. start date | date (YYYYMMDD), len 8 |
| `CD{1..4}` | CDH assgn. spec. codes | char, len 16 |
| `END` | CDH assgn. end date | date (YYYYMMDD), len 8 |
| `FQ` | CDH assgn. frequency | char, len 2 |
| `FQTYPE` | CDH assgn. freq. type | integer, len 2 |
| `LMTAMT` | CDH assgn. limit amount | number (2 dp), len 4 |
| `LXP` | CDH assgn. lmt express | char, len 2 |
| `NO` | CDH assgn. number | integer, len 2 |
| `SDEFPT` | CDH assgn. index to SDEF | integer, len 2 |
| `ST` | CDH assgn. status | char, len 2 |

### SCHD

Schedule Entry, detail cluster, key CC, table PYS-SCH-DTL

| Attribute | Description | Type |
|---|---|---|
| `CC` | Schedule Code | char, len 8 |
| `HRS` | Schedule Hours | number (5 dp), len 4 |
| `HRSNO` | Schedule Hour Number | integer, len 2 |
| `HRSTP` | Hours Type | char, len 4 |
| `OPEN` | OPEN AREA | char, len 4 |
| `RINGIN` | Schedule Punch In | integer, len 2 |
| `RINGOT` | Schedule Punch Out | integer, len 2 |
| `SEQ` | Schedule Seq. Number | char, len 2 |

### SCHM

Schedule Definition, master cluster, key CC, table PY-SCH-MSTR

| Attribute | Description | Type |
|---|---|---|
| `CC` | Schedule Code | char, len 8 |
| `DESC` | Schedule Description | char, len 30 |
| `TCFLAG` | Timecard Flag | char, len 1 |
| `VECT` | Schedule Vector | char, len 6 |

### SCHR

Pay assignment code, runtime cluster, key NUMCD

| Attribute | Description | Type |
|---|---|---|
| `NUMCD` | Pay Assgn. NUM-CD | number (0 dp), len 4 |
| `PART1` | Pay assgn. part 1 | char, len 8 |
| `PART2` | Pay assgn. part 2 | char, len 8 |
| `PART3` | Pay assgn. part 3 | char, len 8 |
| `PART4` | Pay assgn. part 4 | char, len 8 |
| `PART5` | Pay assgn. part 5 | char, len 8 |
| `PART6` | Pay assgn. part 6 | char, len 8 |
| `PART7` | Pay assgn. part 7 | char, len 8 |
| `PART8` | Pay assgn. part 8 | char, len 8 |
| `PART9` | Pay assgn. part 9 | char, len 8 |
| `POSTP` | Pay assgn. position type | char, len 2 |

### SDEF

CDH Def. Cluster STRS, runtime cluster, key NO

| Attribute | Description | Type |
|---|---|---|
| `BEG` | CDH start date | date (YYYYMMDD), len 8 |
| `CD` | CDH code | char, len 8 |
| `END` | CDH end date | date (YYYYMMDD), len 8 |
| `FLAG` | CDH process flags | char, len 32 |
| `GLKEY` | CDH GL key | char, len 60 |
| `HBASE` | CDH hour base | integer, len 2 |
| `HRDEXT` | CDH HRIS dtl. extention | char, len 2 |
| `HRMEXT` | CDH HRIS mstr. extention | char, len 2 |
| `HVECT` | CDH hour flags | char, len 32 |
| `JLKEY` | CDH JL key | char, len 60 |
| `MISC{1..8}` | CDH misc. codes | char, len 32 |
| `NO` | CDH def. number | integer, len 2 |
| `OBJ{1..4}` | CDH object codes | char, len 32 |
| `PBASE` | CDH pay base | integer, len 2 |
| `PRI` | CDH priority | char, len 4 |
| `PVECT` | CDH pay flags | char, len 32 |
| `REL{1..8}` | CDH relating-to code | char, len 48 |
| `TITLE` | CDH Title | char, len 20 |
| `VAL{1..10}` | CDH associated values | long number (5 dp), len 80 |
| `VALDS{1..10}` | CDH value desc. | char, len 200 |
| `XTD` | CDH xtd flag | char, len 2 |

### SDHR

Daily Hrs. Cluster STRS, runtime cluster, key NUMCD

| Attribute | Description | Type |
|---|---|---|
| `AMT` | DHR pay amount | number (2 dp), len 4 |
| `HRS` | DHR hours | number (5 dp), len 4 |
| `HRSPTR` | DHR index to CDH def. | integer, len 2 |
| `NO` | DHR hour number | integer, len 2 |
| `NUMCD` | DHR pay assgn. num. code | number (0 dp), len 4 |
| `PERCC` | DHR period number | number (0 dp), len 4 |
| `RATE` | DHR hourly rate | number (5 dp), len 4 |
| `TYPE` | DHR type | char, len 1 |

### SHST

Pay Hst. Cluster STRS, runtime cluster, key NUMCD

| Attribute | Description | Type |
|---|---|---|
| `ASGAMT{1..75}` | HST NUM-CD amount | number (2 dp), len 300 |
| `NO{1..75}` | HST CDH numbers | integer, len 150 |
| `NUMCD` | HST pay assgn. number | number (0 dp), len 4 |
| `OVRD` | HST override flags | char, len 75 |
| `PERCC` | HST period number | number (0 dp), len 4 |
| `PTDAMT{1..75}` | HST period amount | number (2 dp), len 300 |
| `SASGPT{1..75}` | HST index to CDH assgn. | integer, len 150 |
| `SCHRPT` | HST index to SCHR | integer, len 2 |
| `SDEFPT{1..75}` | HST index to CDH def. | integer, len 150 |
| `SPYPPT` | HST index to SPYP | integer, len 2 |
| `USEDFG` | HST element visited flag | char, len 75 |

### SMSC

Misc. Cluster STRS, runtime cluster, key FYR

| Attribute | Description | Type |
|---|---|---|
| `CHRSV{1..10}` | Misc. ascii save value | char, len 100 |
| `CMND` | Misc. command | char, len 8 |
| `CNTPTR{1..9}` | Misc. STRS CNT index | integer, len 18 |
| `DEDPTR{1..9}` | Misc. STRS DED index | integer, len 18 |
| `FYR` | Misc. fiscal year | char, len 2 |
| `NUMSV{1..10}` | Misc. numeric save value | long number (5 dp), len 80 |
| `PAYPTR{1..9}` | Misc. STRS pay index | integer, len 18 |
| `PERBEG` | Misc. reporting start | char, len 4 |
| `PEREND` | SMSC reporting end | char, len 4 |
| `PMSPYP` | Misc. primary pay assgn. | integer, len 2 |
| `RPTPER` | Misc. reporting period | char, len 2 |
| `SASGDX` | Misc. SASG index | integer, len 2 |
| `SASGHM` | Misc. SASG HWM | integer, len 2 |
| `SASGMX` | Misc. SASG max | integer, len 2 |
| `SCHRDX` | Misc. SCHR index | integer, len 2 |
| `SCHRHM` | Misc. SCHR HWM | integer, len 2 |
| `SCHRMX` | Misc. SCHR max | integer, len 2 |
| `SDEFDX` | Misc. SDEF index | integer, len 2 |
| `SDEFHM` | Misc. SDEF HWM | integer, len 2 |
| `SDEFMX` | Misc. SDEF max | integer, len 2 |
| `SDHRDX` | Misc. SDHR index | integer, len 2 |
| `SDHRHM` | Misc. SDHR HWM | integer, len 2 |
| `SDHRMX` | Misc. SDHR max | integer, len 2 |
| `SHSTDX` | Misc. SHST index | integer, len 2 |
| `SHSTHM` | Misc. SHST HWM | integer, len 2 |
| `SHSTMX` | Misc. SHST max | integer, len 2 |
| `SPYPDX` | Misc. SPYP index | integer, len 2 |
| `SPYPHM` | Misc. SPYP HWM | integer, len 2 |
| `SPYPMX` | Misc. SPYP max | integer, len 2 |
| `STATUS` | Misc. status | char, len 8 |

### SPBS

Pay bases for STRS reporting, runtime cluster, key PTD

| Attribute | Description | Type |
|---|---|---|
| `ASGAMT{1..32}` | Pay base assignment amt | number (2 dp), len 128 |
| `PTDAMT{1..32}` | Pay base period amount | number (2 dp), len 128 |

### SPYP

Pay assgn. cluster SRTS, runtime cluster, key NUMCD

| Attribute | Description | Type |
|---|---|---|
| `BEG` | Pay assgn. begin date | date (YYYYMMDD), len 8 |
| `DSVECT{1..3}` | Pay assgn. dist. vector | char, len 18 |
| `EFFORT` | Pay assgn. effort | number (5 dp), len 4 |
| `END` | Pay assgn. end date | date (YYYYMMDD), len 8 |
| `FQ` | Pay assgn. frequency | char, len 2 |
| `FQTYPE` | Pay assgn. freq. type | integer, len 2 |
| `LMTAMT` | Pay assgn. lmt. amount | number (2 dp), len 4 |
| `LXP` | Pay assgn. lmt. express | char, len 2 |
| `NUMCD` | Pay assgn. num. code | number (0 dp), len 4 |
| `OT` | Pay assgn. OT rate | number (5 dp), len 4 |
| `REG` | Pay assgn. reg. rate | number (5 dp), len 4 |
| `SAL` | Pay assgn. salary | number (2 dp), len 4 |
| `SCHRPT` | Pay assgn. index to SCHR | integer, len 2 |
| `ST` | Pay assgn. status | char, len 2 |
| `SXP` | Pay assgn. sal. express | char, len 2 |
| `TYPE` | Pay assgn. type | char, len 2 |

### SRCD

Calculation Formula, detail cluster, key NO, table PYS-SRC-DTL

| Attribute | Description | Type |
|---|---|---|
| `NO` | Cnt/Ded/Hrs No | integer, len 2 |
| `SQ` | Formula Sequence Number | char, len 4 |
| `SRC` | Formula | char, len 58 |

### STPD

Salary Step Entry, detail cluster, key CC, table PYS-STP-DTL

| Attribute | Description | Type |
|---|---|---|
| `BEG` | Step Begin Date | date (YYYYMMDD), len 8 |
| `END` | Step End Date | date (YYYYMMDD), len 8 |
| `GRDCD` | Step Grade Code | char, len 8 |
| `RATE` | Step Hourly Rate | number (5 dp), len 4 |
| `SALAMT{1..5}` | Step Salary Amount | number (2 dp), len 20 |
| `STPCC` | Step Code | char, len 12 |

### STPM

Salary Step Definition, master cluster, key CC, table PY-STP-MSTR

| Attribute | Description | Type |
|---|---|---|
| `CC` | Salary Step Code | char, len 12 |

### STRS

STRS Rec. Cluster STRS, runtime cluster, key FYR

| Attribute | Description | Type |
|---|---|---|
| `ASSN` | STRS account code | integer, len 2 |
| `COUNTY` | STRS county | integer, len 2 |
| `DISTCT` | STRS district | integer, len 2 |
| `EARN` | STRS earnings | number (2 dp), len 4 |
| `EARNID` | STRS earning ID | char, len 1 |
| `EMPRAM` | STRS EMPR. cnt. amount | number (2 dp), len 4 |
| `EMPRRT` | STRS EMPR cnt. rate | number (4 dp), len 4 |
| `EPMCAM` | STRS EPMC amount | number (2 dp), len 4 |
| `EPMCRT` | STRS EPMC rate | number (4 dp), len 4 |
| `FINIT` | STRS first initial | char, len 1 |
| `FNAME` | STRS first name | char, len 8 |
| `FYR` | STRS fiscal year | integer, len 2 |
| `LINECD` | STRS line code | char, len 1 |
| `LINENO` | STRS record line number | number (0 dp), len 4 |
| `LNAME` | STRS last name | char, len 10 |
| `MBRCD` | STRS member code | integer, len 2 |
| `MCAM` | STRS mbr. cont. amount | number (2 dp), len 4 |
| `MCCD` | STRS contribution code | integer, len 2 |
| `MCRT` | STRS member rate | number (4 dp), len 4 |
| `MINIT` | STRS middle initial | char, len 1 |
| `PAYCD` | STRS pay code | integer, len 2 |
| `PAYRT` | STRS pay rate | number (3 dp), len 4 |
| `PERBEG` | STRS srv. period start | integer, len 2 |
| `PEREND` | STRS srv. period end | integer, len 2 |
| `PERMM` | STRS report month | integer, len 2 |
| `PERYR` | STRS report year | integer, len 2 |
| `RPTPER` | STRS reporting period | integer, len 2 |
| `SSN` | STRS SSN | char, len 9 |
| `TRANCD` | STRS transaction code | char, len 1 |

### TCBT

Time Card Interface, runtime cluster, key PERIOD

| Attribute | Description | Type |
|---|---|---|
| `DAYWK` | Day Worked | integer, len 2 |
| `GLKEY` | GLKEY | char, len 40 |
| `GLLG` | GL LEDGER | char, len 2 |
| `GLOBJ` | General Ledger Object | char, len 8 |
| `HRS` | Num Hrs Worked | number (5 dp), len 4 |
| `HRSNO` | Hours Number | integer, len 2 |
| `JLKEY` | JL KEY | char, len 40 |
| `JLLG` | JL Ledger | char, len 2 |
| `JLOBJ` | JL OBJECT CODE | char, len 8 |
| `MISC` | Miscell | char, len 4 |
| `NUMOVR` | Pay num override | char, len 2 |
| `OPEN` | Open area | char, len 336 |
| `PAYAMT` | Pay Amount | number (5 dp), len 4 |
| `PAYCLS` | Pay Class | char, len 4 |
| `PAYOVR` | Pay Override | char, len 2 |
| `PEID` | Person/Entity ID | char, len 12 |
| `PERIOD` | Pay PERIOD | char, len 8 |
| `POS` | Position | char, len 8 |
| `RECTP` | Record Type | char, len 2 |
| `RT` | Rate | number (5 dp), len 4 |
| `RTADH` | Rate Adjustment | number (5 dp), len 4 |
| `RTOVR` | Rate override flag | char, len 2 |
| `STEP` | Step | char, len 4 |
| `WEEK` | WEEK WORKED | char, len 2 |
| `WONUM` | Work Order Num | char, len 8 |

### URCL

PY User Def. Report PY602C, runtime cluster, key STATUS

| Attribute | Description | Type |
|---|---|---|
| `CDHHWM` | High water mark of CDHP | integer, len 2 |
| `CDHMAX` | Max number of CDHP | integer, len 2 |
| `CDHNDX` | CDHP index | integer, len 2 |
| `CDHNO{1..90}` | CDHP number | integer, len 180 |
| `CDHPTD{1..90}` | CDHP PTD amount | number (2 dp), len 360 |
| `HBSMAX` | Max number of hour base | integer, len 2 |
| `HBSNDX` | Hour base index | integer, len 2 |
| `HBSPTD{1..32}` | Hour base PTD amount | number (5 dp), len 128 |
| `PBSMAX` | Max. number of pay base | integer, len 2 |
| `PBSNDX` | Pay base index | integer, len 2 |
| `PBSPTD{1..32}` | Pay base PTD amount | number (2 dp), len 28 |
| `STATUS` | URCL execution status | char, len 20 |
