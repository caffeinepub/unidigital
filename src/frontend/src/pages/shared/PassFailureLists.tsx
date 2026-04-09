import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChevronDown,
  ChevronUp,
  FileCheck,
  Filter,
  ListChecks,
  Printer,
  X,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface PassFailureListsProps {
  userRole?: "hod" | "admin" | "faculty";
  /** Pre-filter: programme type key */
  defaultProgramme?: ProgrammeKey;
  /** Pre-filter: department key e.g. "CSC" */
  defaultDept?: string;
  /** Pre-filter: level "1"–"4" */
  defaultLevel?: string;
  /** Pre-filter: semester "1"|"2" */
  defaultSemester?: string;
}

type ProgrammeKey =
  | "university"
  | "polytechnic"
  | "college_of_education"
  | "postgraduate"
  | "certificate"
  | "distance_learning"
  | "part_time";

type Remark = "PROMOTED" | "PROBATION" | "WITHDRAWN" | "FAILED";

interface InstitutionProfile {
  name: string;
  institutionType: string;
  city?: string;
  address?: string;
}

interface StudentRow {
  sn: number;
  matric: string;
  name: string;
  edu: string;
  tp: string;
  gse: string;
  sub1: string;
  sub2: string;
  cgpa: number;
  outstanding: string;
  remark: Remark;
  gradYear: string;
  programme: ProgrammeKey;
  dept: string;
  level: string;
  semester: string;
  session: string;
}

interface SectionGroup {
  programme: ProgrammeKey;
  dept: string;
  level: string;
  semester: string;
  session: string;
  rows: StudentRow[];
}

// ── Constants ─────────────────────────────────────────────────────────────────

const SESSIONS = ["2024/2025", "2023/2024", "2022/2023"];

const PROGRAMME_OPTIONS: { key: ProgrammeKey; label: string }[] = [
  { key: "university", label: "University (B.Sc / B.Ed)" },
  { key: "polytechnic", label: "Polytechnic (OND / HND)" },
  { key: "college_of_education", label: "College of Education (NCE)" },
  { key: "postgraduate", label: "Postgraduate (PGD / MSc / PhD)" },
  { key: "certificate", label: "Certificate Programme" },
  { key: "distance_learning", label: "Distance Learning" },
  { key: "part_time", label: "Part-Time Studies" },
];

const DEPT_PROGRAMME_NAMES: Record<string, string> = {
  CSC: "B.Sc (Ed) Computer Science",
  BIO: "B.Sc (Ed) Biology",
  PHY: "B.Sc (Ed) Physics",
  CHM: "B.Sc (Ed) Chemistry",
  MTH: "B.Sc (Ed) Mathematics",
  EIS: "B.Sc (Ed) Integrated Science",
  HKE: "B.Sc (Ed) Human Kinetics",
  EHE: "B.Sc (Ed) Health Education",
  EED: "B.Ed Environmental Education",
};

const DEPT_FULL_NAMES: Record<string, string> = {
  CSC: "Department of Computer Science",
  BIO: "Department of Biology",
  PHY: "Department of Physics",
  CHM: "Department of Chemistry",
  MTH: "Department of Mathematics",
  EIS: "Department of Integrated Science",
  HKE: "Department of Human Kinetics",
  EHE: "Department of Health Education",
  EED: "Department of Environmental Education",
  "OND-HND": "School of Engineering Technology",
  NCE: "School of Education",
  PG: "Postgraduate School",
  CERT: "Centre for Continuing Education",
};

const UNIVERSITY_DEPTS = Object.keys(DEPT_PROGRAMME_NAMES);

const POLY_LEVELS: Record<string, string> = {
  "1": "OND Year I",
  "2": "OND Year II",
  "3": "HND Year I",
  "4": "HND Year II",
};
const NCE_LEVELS: Record<string, string> = {
  "1": "NCE Year I",
  "2": "NCE Year II",
  "3": "NCE Year III",
};
const PG_LEVELS: Record<string, string> = {
  "5": "PGD",
  "6": "PGDE",
  "7": "M.Sc",
  "8": "M.Phil",
  "9": "PhD",
};
const CERT_BATCHES = [
  "Batch 1 (Jan–Mar)",
  "Batch 2 (May–Jul)",
  "Batch 3 (Sep–Nov)",
];

const PAGE_ROWS = 20;

// ── Helpers ───────────────────────────────────────────────────────────────────

function loadInstitutionProfile(): InstitutionProfile {
  try {
    const raw = localStorage.getItem("unidigital_institution_settings");
    if (raw) {
      const parsed = JSON.parse(raw) as {
        profile?: InstitutionProfile;
      } & InstitutionProfile;
      const p = parsed?.profile ?? parsed;
      if (p?.name) return p as InstitutionProfile;
    }
  } catch {
    /* empty */
  }
  return {
    name: "Federal University of Education, Kontagora",
    institutionType: "university",
    city: "Kontagora",
  };
}

function deriveAcronym(name: string): string {
  const skip = new Set(["of", "and", "the", "for", "in", "at", "to"]);
  return name
    .split(/\s+/)
    .filter((w) => w.length > 0 && !skip.has(w.toLowerCase()))
    .map((w) => w[0].toUpperCase())
    .join("");
}

function getProgrammeLabel(
  programme: ProgrammeKey,
  dept: string,
  level: string,
): string {
  const batchIndex = Number.parseInt(level, 10) - 1;
  switch (programme) {
    case "university":
      return DEPT_PROGRAMME_NAMES[dept] ?? `B.Sc (Ed) ${dept}`;
    case "polytechnic":
      return POLY_LEVELS[level] ?? `Level ${level}`;
    case "college_of_education":
      return NCE_LEVELS[level] ?? `NCE Year ${level}`;
    case "postgraduate":
      return PG_LEVELS[level] ?? "Postgraduate";
    case "certificate":
      return `Certificate Programme — ${CERT_BATCHES[batchIndex] ?? `Batch ${level}`}`;
    case "distance_learning":
      return `Distance Learning — ${DEPT_PROGRAMME_NAMES[dept] ?? dept}`;
    case "part_time":
      return `Part-Time Studies — ${DEPT_PROGRAMME_NAMES[dept] ?? dept}`;
  }
}

function getLevelLabel(programme: ProgrammeKey, level: string): string {
  switch (programme) {
    case "university":
      return `${level}00 Level`;
    case "polytechnic":
      return POLY_LEVELS[level] ?? `Level ${level}`;
    case "college_of_education":
      return NCE_LEVELS[level] ?? `NCE Year ${level}`;
    case "postgraduate":
      return PG_LEVELS[level] ?? "Postgraduate";
    case "certificate":
      return `Batch ${level}`;
    case "distance_learning":
      return `${level}00 Level (DL)`;
    case "part_time":
      return `${level}00 Level (PT)`;
  }
}

function gradeLabel(code: string): string {
  const map: Record<string, string> = {
    D: "DISTINCTION",
    C: "CREDIT",
    M: "MERIT",
    P: "PASS",
    F: "FAIL",
  };
  return map[code] ?? code;
}

function cgpaToGrade(cgpa: number): string {
  if (cgpa >= 4.5) return "DISTINCTION";
  if (cgpa >= 3.5) return "CREDIT";
  if (cgpa >= 2.4) return "MERIT";
  if (cgpa >= 1.0) return "PASS";
  return "FAIL";
}

function chunkRows(rows: StudentRow[]): StudentRow[][] {
  const chunks: StudentRow[][] = [];
  for (let i = 0; i < rows.length; i += PAGE_ROWS)
    chunks.push(rows.slice(i, i + PAGE_ROWS));
  if (chunks.length === 0) chunks.push([]);
  return chunks;
}

// ── Sample Data ───────────────────────────────────────────────────────────────

function makeName(i: number): string {
  const first = [
    "IBRAHIM",
    "ALIYU",
    "BELLO",
    "MUSA",
    "AHMED",
    "GARBA",
    "LAWAL",
    "SANI",
    "USMAN",
    "DANLADI",
    "ADAMU",
    "HARUNA",
    "KALU",
    "TANKO",
    "YAKUBU",
    "NWACHUKWU",
    "OKONKWO",
    "CHUKWU",
    "EZIKE",
    "OBINNA",
    "ABUBAKAR",
    "JIBRIL",
    "NAKANDE",
    "ZUBAIR",
  ];
  const mid = [
    "Amina",
    "Fatima",
    "Hauwa",
    "Maryam",
    "Rashida",
    "Grace",
    "Mary",
    "Patience",
    "Rebecca",
    "Stella",
    "Chioma",
    "Ngozi",
    "Adaeze",
    "Chiamaka",
    "Blessing",
    "Ibrahim",
    "Musa",
    "Suleiman",
    "Ahmed",
    "Kabiru",
    "Emeka",
    "Chukwu",
    "Obi",
    "Eze",
  ];
  return `${first[((i + 1) * 17) % first.length]}, ${mid[((i + 3) * 13) % mid.length]}`;
}

function makeGrade(seed: number): string {
  const g = ["D", "C", "C", "M", "M", "P", "P", "F"];
  return g[seed % g.length];
}

function makeCGPA(seed: number): number {
  const b = [
    4.85, 4.62, 4.4, 4.18, 3.95, 3.72, 3.45, 3.2, 2.88, 2.51, 2.15, 1.87, 1.32,
    0.87, 0.61,
  ];
  return b[seed % b.length];
}

function generateStudents(
  programme: ProgrammeKey,
  dept: string,
  level: string,
  semester: string,
  session: string,
  count: number,
  matricPrefix: string,
  startMatric: number,
): StudentRow[] {
  const yearStr = session.split("/")[0];
  const baseYear = Number.parseInt(yearStr, 10);
  return Array.from({ length: count }, (_, i) => {
    const cgpa = makeCGPA((i + startMatric) % 15);
    const remark: Remark =
      cgpa >= 1.0 ? (cgpa >= 2.4 ? "PROMOTED" : "PROBATION") : "WITHDRAWN";
    const outstanding =
      remark !== "PROMOTED"
        ? `${dept} ${200 + i * 11} / EDU ${220 + i * 7}`
        : "";
    return {
      sn: i + 1,
      matric: `${yearStr}/${matricPrefix}/${String(startMatric + i).padStart(5, "0")}`,
      name: makeName(i + startMatric),
      edu: makeGrade((i + 1) * 3),
      tp: makeGrade((i + 2) * 5),
      gse: makeGrade((i + 3) * 7),
      sub1: makeGrade((i + 4) * 11),
      sub2: makeGrade((i + 5) * 13),
      cgpa,
      outstanding,
      remark,
      gradYear: remark === "PROMOTED" ? String(baseYear + 1) : "—",
      programme,
      dept,
      level,
      semester,
      session,
    };
  });
}

function groupKey(row: StudentRow): string {
  return `${row.programme}|${row.dept}|${row.level}|${row.semester}|${row.session}`;
}

function buildSampleData(): StudentRow[] {
  const rows: StudentRow[] = [];
  const p = (s: string) => Number.parseInt(s, 10);
  // University — all 9 departments, levels 1–4, semesters 1–2
  for (const [di, dept] of UNIVERSITY_DEPTS.entries()) {
    for (const lv of ["1", "2", "3", "4"]) {
      for (const sem of ["1", "2"]) {
        const count = 18 + ((di + p(lv)) % 8);
        rows.push(
          ...generateStudents(
            "university",
            dept,
            lv,
            sem,
            "2024/2025",
            count,
            "SC",
            580 + di * 100 + p(lv) * 20 + p(sem) * 10,
          ),
        );
      }
    }
  }
  // Polytechnic — OND I/II, HND I/II
  for (const lv of ["1", "2", "3", "4"]) {
    for (const sem of ["1", "2"]) {
      rows.push(
        ...generateStudents(
          "polytechnic",
          "OND-HND",
          lv,
          sem,
          "2024/2025",
          15 + p(lv) * 2,
          "PT",
          100 + p(lv) * 30 + p(sem) * 5,
        ),
      );
    }
  }
  // College of Education — NCE I/II/III
  for (const lv of ["1", "2", "3"]) {
    for (const sem of ["1", "2"]) {
      rows.push(
        ...generateStudents(
          "college_of_education",
          "NCE",
          lv,
          sem,
          "2024/2025",
          20 + p(lv),
          "CE",
          200 + p(lv) * 40 + p(sem) * 5,
        ),
      );
    }
  }
  // Postgraduate
  for (const lv of ["5", "6", "7"]) {
    rows.push(
      ...generateStudents(
        "postgraduate",
        "PG",
        lv,
        "1",
        "2024/2025",
        8 + p(lv),
        "PG",
        300 + p(lv) * 10,
      ),
    );
  }
  // Certificate
  for (const batch of ["1", "2", "3"]) {
    rows.push(
      ...generateStudents(
        "certificate",
        "CERT",
        batch,
        "1",
        "2024/2025",
        12 + p(batch) * 2,
        "CRT",
        400 + p(batch) * 20,
      ),
    );
  }
  // Distance Learning — CSC, MTH, BIO
  for (const [di, dept] of (["CSC", "MTH", "BIO"] as const).entries()) {
    for (const lv of ["1", "2", "3"]) {
      rows.push(
        ...generateStudents(
          "distance_learning",
          dept,
          lv,
          "1",
          "2024/2025",
          10 + di * 2,
          "DL",
          500 + di * 50 + p(lv) * 10,
        ),
      );
    }
  }
  // Part-Time — CSC, MTH
  for (const [di, dept] of (["CSC", "MTH"] as const).entries()) {
    for (const lv of ["1", "2"]) {
      rows.push(
        ...generateStudents(
          "part_time",
          dept,
          lv,
          "1",
          "2024/2025",
          12 + di,
          "PT2",
          600 + di * 30 + p(lv) * 10,
        ),
      );
    }
  }
  return rows;
}

const ALL_SAMPLE_DATA = buildSampleData();

// ── Print CSS ─────────────────────────────────────────────────────────────────

const PRINT_CSS = `
@media print {
  body * { visibility: hidden !important; }
  #pass-fail-print-area, #pass-fail-print-area * { visibility: visible !important; }
  #pass-fail-print-area { position: absolute; left: 0; top: 0; width: 100%; }
  .no-print { display: none !important; }
  .print-only { display: block !important; }
  .print-page-break { page-break-before: always; }
  @page { size: A4 landscape; margin: 1.5cm 1.5cm 2.5cm 1.5cm; }
  table { border-collapse: collapse !important; width: 100% !important; }
  th, td { border: 1px solid #000 !important; padding: 3px 4px !important; font-size: 8.5pt !important; font-family: serif !important; }
  th { background: #f0f0f0 !important; font-weight: bold !important; }
  .doc-header { text-align: center; margin-bottom: 8px; font-family: serif; }
  .doc-header h1 { font-size: 13pt; font-weight: bold; margin: 0 0 2px 0; text-transform: uppercase; }
  .doc-header .prog-label { font-size: 11pt; font-weight: bold; margin: 2px 0; }
  .doc-header h3 { font-size: 9.5pt; font-weight: normal; margin: 0 0 2px 0; }
  .doc-header .list-title { font-size: 12pt; font-weight: bold; text-decoration: underline; margin: 3px 0 0 0; }
  .summary-section { margin-top: 16px; page-break-inside: avoid; }
  .print-footer-bar { display: flex; justify-content: space-between; font-size: 8pt; border-top: 1px solid #000; margin-top: 8px; padding-top: 3px; font-family: serif; }
  .section-break { page-break-before: always; }
}
`;

// ── Table Styles ──────────────────────────────────────────────────────────────

const thStyle: React.CSSProperties = {
  border: "1px solid #000",
  padding: "4px 5px",
  textAlign: "center",
  fontWeight: 700,
  backgroundColor: "#e8e8e8",
  whiteSpace: "nowrap",
  fontSize: "0.77rem",
};

const tdStyle: React.CSSProperties = {
  border: "1px solid #000",
  padding: "3px 4px",
  verticalAlign: "top",
  fontSize: "0.77rem",
};

const tdCenterStyle: React.CSSProperties = {
  ...tdStyle,
  textAlign: "center",
  whiteSpace: "pre-line",
};

// ── DocPage ───────────────────────────────────────────────────────────────────

interface DocPageProps {
  institution: InstitutionProfile;
  acronym: string;
  section: SectionGroup;
  rows: StudentRow[];
  listType: "PASS" | "FAILURE";
  pageNum: number;
  totalPages: number;
  printedAt: string;
  isLastPage: boolean;
  examOfficerName: string;
  examOfficerDate: string;
  deanName: string;
  deanDate: string;
  allSectionRows: StudentRow[];
  globalPageOffset: number;
  globalTotalPages: number;
}

function DocPage({
  institution,
  acronym,
  section,
  rows,
  listType,
  pageNum,
  totalPages,
  printedAt,
  isLastPage,
  examOfficerName,
  examOfficerDate,
  deanName,
  deanDate,
  allSectionRows,
  globalPageOffset,
  globalTotalPages,
}: DocPageProps) {
  const { programme, dept, level, semester, session } = section;
  const programmeLabel = getProgrammeLabel(programme, dept, level);
  const levelLabel = getLevelLabel(programme, level);
  const semLabel = semester === "1" ? "First Semester" : "Second Semester";
  const deptFullName = DEPT_FULL_NAMES[dept] ?? `Department of ${dept}`;

  const passCount = allSectionRows.filter(
    (r) => r.remark === "PROMOTED",
  ).length;
  const failCount = allSectionRows.filter(
    (r) => r.remark !== "PROMOTED",
  ).length;
  const total = allSectionRows.length;
  const passPercent =
    total > 0 ? ((passCount / total) * 100).toFixed(1) : "0.0";
  const failPercent =
    total > 0 ? ((failCount / total) * 100).toFixed(1) : "0.0";
  const isPassList = listType === "PASS";

  const sub1Code =
    dept === "OND-HND"
      ? "SUB1"
      : dept === "NCE"
        ? "METH1"
        : dept === "PG"
          ? "CRS1"
          : dept === "CERT"
            ? "UNIT"
            : dept;
  const sub2Code =
    dept === "OND-HND"
      ? "SUB2"
      : dept === "NCE"
        ? "METH2"
        : dept === "PG"
          ? "CRS2"
          : dept === "CERT"
            ? "PROJ"
            : "EDU";

  const globalPage = globalPageOffset + pageNum;

  return (
    <div className="mb-6 print-page-section">
      {/* Document Header */}
      <div className="doc-header text-center mb-3">
        <h1
          className="text-lg font-bold uppercase tracking-wide"
          style={{ fontFamily: "serif" }}
        >
          {institution.name.toUpperCase()}
        </h1>
        {institution.address && (
          <h3 className="text-xs" style={{ fontFamily: "serif" }}>
            {institution.address}
          </h3>
        )}
        <div
          className="prog-label text-sm font-bold mt-1"
          style={{ fontFamily: "serif" }}
        >
          {programmeLabel.toUpperCase()}
        </div>
        <h3 className="text-sm font-semibold" style={{ fontFamily: "serif" }}>
          {deptFullName.toUpperCase()}
        </h3>
        <h3 className="text-xs" style={{ fontFamily: "serif" }}>
          {levelLabel.toUpperCase()} — {semLabel.toUpperCase()} — {session}{" "}
          SESSION
        </h3>
        <div
          className="list-title text-base font-bold underline mt-2"
          style={{ fontFamily: "serif" }}
        >
          {listType} LIST
        </div>
        <div className="text-xs mt-1" style={{ fontFamily: "serif" }}>
          Page {pageNum} of {totalPages} (Section) &nbsp;|&nbsp; Global Page{" "}
          {globalPage} of {globalTotalPages}
        </div>
      </div>

      {/* Table */}
      <table
        style={{
          borderCollapse: "collapse",
          width: "100%",
          fontSize: "0.77rem",
        }}
        className="border border-black"
      >
        <thead>
          <tr style={{ backgroundColor: "#e8e8e8" }}>
            <th style={{ ...thStyle, minWidth: 36 }}>S/N</th>
            <th style={{ ...thStyle, minWidth: 110 }}>MATRIC NO</th>
            <th style={{ ...thStyle, textAlign: "left", minWidth: 155 }}>
              NAME
            </th>
            <th style={thStyle}>EDU</th>
            <th style={thStyle}>TP</th>
            <th style={thStyle}>GSE</th>
            <th style={thStyle}>{sub1Code}</th>
            <th style={thStyle}>{sub2Code}</th>
            <th style={thStyle}>CGPA</th>
            <th style={{ ...thStyle, minWidth: 130 }}>CARRY OVERS</th>
            {isPassList ? (
              <th style={thStyle}>GRADUATION DATE</th>
            ) : (
              <th style={{ ...thStyle, minWidth: 90 }}>REMARK</th>
            )}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={row.matric}
              style={{ backgroundColor: i % 2 === 0 ? "#fff" : "#fafafa" }}
            >
              <td style={tdCenterStyle}>{row.sn}</td>
              <td style={tdCenterStyle}>{row.matric}</td>
              <td style={{ ...tdStyle, textAlign: "left" }}>{row.name}</td>
              <td style={tdCenterStyle}>{gradeLabel(row.edu)}</td>
              <td style={tdCenterStyle}>{gradeLabel(row.tp)}</td>
              <td style={tdCenterStyle}>{gradeLabel(row.gse)}</td>
              <td style={tdCenterStyle}>{gradeLabel(row.sub1)}</td>
              <td style={tdCenterStyle}>{gradeLabel(row.sub2)}</td>
              <td style={tdCenterStyle}>
                {row.cgpa.toFixed(2)}
                <br />
                <span style={{ fontSize: "0.65rem", fontWeight: 600 }}>
                  ({cgpaToGrade(row.cgpa)})
                </span>
              </td>
              <td
                style={{
                  ...tdStyle,
                  textAlign: "left",
                  fontSize: "0.7rem",
                  wordBreak: "break-word",
                }}
              >
                {row.outstanding || "—"}
              </td>
              {isPassList ? (
                <td style={tdCenterStyle}>{row.gradYear}</td>
              ) : (
                <td
                  style={{
                    ...tdCenterStyle,
                    fontWeight: 700,
                    color: row.remark === "WITHDRAWN" ? "#b91c1c" : "#b45309",
                  }}
                >
                  {row.remark}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Last page: summary + signatures */}
      {isLastPage && (
        <div className="summary-section mt-5">
          <p style={{ fontSize: "0.72rem", marginBottom: 8 }}>
            <strong>GRADING KEYS:</strong> [4.5–5.0: DISTINCTION] [3.5–4.49:
            CREDIT] [2.4–3.49: MERIT] [1.0–2.39: PASS] [0–0.99: FAIL]
          </p>
          <div
            style={{
              display: "flex",
              gap: 32,
              alignItems: "flex-start",
              flexWrap: "wrap",
            }}
          >
            <table
              style={{
                borderCollapse: "collapse",
                fontSize: "0.77rem",
                minWidth: 330,
                flex: "0 0 auto",
              }}
            >
              <tbody>
                {(
                  [
                    ["Total number of students", total],
                    ["Number of students that passed", passCount],
                    ["Number of students that failed/probation", failCount],
                    ["Percentage that passed", `${passPercent}%`],
                    ["Percentage that failed", `${failPercent}%`],
                  ] as [string, string | number][]
                ).map(([label, value]) => (
                  <tr key={label}>
                    <td
                      style={{
                        border: "1px solid #000",
                        padding: "3px 8px",
                        fontWeight: 500,
                      }}
                    >
                      {label}
                    </td>
                    <td
                      style={{
                        border: "1px solid #000",
                        padding: "3px 8px",
                        textAlign: "center",
                        fontWeight: 700,
                        minWidth: 50,
                      }}
                    >
                      {value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div
              style={{
                display: "flex",
                gap: 48,
                flex: 1,
                justifyContent: "flex-end",
                flexWrap: "wrap",
              }}
            >
              <div style={{ minWidth: 200 }}>
                <p
                  style={{
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    marginBottom: 4,
                  }}
                >
                  School Exam Officer
                </p>
                <p style={{ fontSize: "0.75rem" }}>
                  Name: {examOfficerName || "____________________________"}
                </p>
                <div
                  style={{
                    borderBottom: "1px solid #000",
                    marginTop: 24,
                    marginBottom: 4,
                  }}
                />
                <p style={{ fontSize: "0.72rem" }}>
                  Signature &amp; Date: {examOfficerDate || "______________"}
                </p>
              </div>
              <div style={{ minWidth: 200 }}>
                <p
                  style={{
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    marginBottom: 4,
                  }}
                >
                  Dean of School/Faculty
                </p>
                <p style={{ fontSize: "0.75rem" }}>
                  Name: {deanName || "____________________________"}
                </p>
                <div
                  style={{
                    borderBottom: "1px solid #000",
                    marginTop: 24,
                    marginBottom: 4,
                  }}
                />
                <p style={{ fontSize: "0.72rem" }}>
                  Signature &amp; Date: {deanDate || "______________"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Page footer */}
      <div
        className="print-footer-bar"
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: "0.68rem",
          borderTop: "1px solid #000",
          marginTop: 10,
          paddingTop: 3,
          fontFamily: "serif",
        }}
      >
        <span>{acronym} MIS</span>
        <span>Printed: {printedAt}</span>
        <span>
          Page {pageNum}/{totalPages}
        </span>
      </div>
    </div>
  );
}

// ── SectionDisplay (print-only) ───────────────────────────────────────────────

interface SectionDisplayProps {
  institution: InstitutionProfile;
  acronym: string;
  section: SectionGroup;
  listType: "PASS" | "FAILURE";
  printedAt: string;
  examOfficerName: string;
  examOfficerDate: string;
  deanName: string;
  deanDate: string;
  globalPageOffset: number;
  globalTotalPages: number;
  firstSectionBreak: boolean;
}

function SectionDisplay({
  institution,
  acronym,
  section,
  listType,
  printedAt,
  examOfficerName,
  examOfficerDate,
  deanName,
  deanDate,
  globalPageOffset,
  globalTotalPages,
  firstSectionBreak,
}: SectionDisplayProps) {
  const sourceRows =
    listType === "PASS"
      ? section.rows.filter((r) => r.remark === "PROMOTED")
      : section.rows.filter((r) => r.remark !== "PROMOTED");

  // Re-number S/N from 1 for this section
  const numbered = sourceRows.map((r, i) => ({ ...r, sn: i + 1 }));
  const chunks = chunkRows(numbered);

  return (
    <>
      {firstSectionBreak && (
        <div className="section-break" style={{ breakBefore: "page" }} />
      )}
      {chunks.map((chunk, i) => (
        <div key={`${section.dept}-${section.level}-p${i}`}>
          {i > 0 && (
            <div className="print-page-break" style={{ breakBefore: "page" }} />
          )}
          <DocPage
            institution={institution}
            acronym={acronym}
            section={section}
            rows={chunk}
            listType={listType}
            pageNum={i + 1}
            totalPages={chunks.length}
            printedAt={printedAt}
            isLastPage={i === chunks.length - 1}
            examOfficerName={examOfficerName}
            examOfficerDate={examOfficerDate}
            deanName={deanName}
            deanDate={deanDate}
            allSectionRows={numbered}
            globalPageOffset={globalPageOffset}
            globalTotalPages={globalTotalPages}
          />
        </div>
      ))}
    </>
  );
}

// ── SectionAccordion (screen UI) ──────────────────────────────────────────────

interface SectionAccordionProps {
  institution: InstitutionProfile;
  acronym: string;
  section: SectionGroup;
  listType: "PASS" | "FAILURE";
  printedAt: string;
  examOfficerName: string;
  examOfficerDate: string;
  deanName: string;
  deanDate: string;
  defaultOpen?: boolean;
}

function SectionAccordion({
  institution,
  acronym,
  section,
  listType,
  printedAt,
  examOfficerName,
  examOfficerDate,
  deanName,
  deanDate,
  defaultOpen = false,
}: SectionAccordionProps) {
  const [open, setOpen] = useState(defaultOpen);

  const sourceRows =
    listType === "PASS"
      ? section.rows.filter((r) => r.remark === "PROMOTED")
      : section.rows.filter((r) => r.remark !== "PROMOTED");

  const programmeLabel = getProgrammeLabel(
    section.programme,
    section.dept,
    section.level,
  );
  const levelLabel = getLevelLabel(section.programme, section.level);
  const semLabel = section.semester === "1" ? "1st Sem" : "2nd Sem";
  const progShortLabel =
    PROGRAMME_OPTIONS.find((p) => p.key === section.programme)?.label.split(
      " ",
    )[0] ?? "";

  const passCount = sourceRows.filter((r) => r.remark === "PROMOTED").length;
  const failCount = sourceRows.filter((r) => r.remark !== "PROMOTED").length;

  return (
    <Card
      className="mb-3 border border-border"
      data-ocid={`section.${section.programme}.${section.dept}.${section.level}.${section.semester}`}
    >
      <button
        type="button"
        className="w-full text-left px-4 py-3 flex items-center justify-between hover:bg-muted/30 transition-colors rounded-t-lg"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <div className="flex items-center gap-3 flex-wrap min-w-0">
          <Badge variant="secondary" className="text-xs shrink-0">
            {progShortLabel}
          </Badge>
          <span className="font-semibold text-sm text-foreground truncate">
            {programmeLabel} — {levelLabel}, {semLabel}
          </span>
          <span className="text-xs text-muted-foreground">
            {section.session}
          </span>
        </div>
        <div className="flex items-center gap-3 shrink-0 ml-2">
          {listType === "PASS" ? (
            <span className="text-xs font-medium text-green-700">
              {passCount} students
            </span>
          ) : (
            <span className="text-xs font-medium text-red-700">
              {failCount} students
            </span>
          )}
          {open ? (
            <ChevronUp size={16} className="text-muted-foreground" />
          ) : (
            <ChevronDown size={16} className="text-muted-foreground" />
          )}
        </div>
      </button>
      {open && (
        <CardContent className="p-4 overflow-x-auto border-t border-border">
          <SectionDisplay
            institution={institution}
            acronym={acronym}
            section={section}
            listType={listType}
            printedAt={printedAt}
            examOfficerName={examOfficerName}
            examOfficerDate={examOfficerDate}
            deanName={deanName}
            deanDate={deanDate}
            globalPageOffset={0}
            globalTotalPages={1}
            firstSectionBreak={false}
          />
        </CardContent>
      )}
    </Card>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export function PassFailureLists({
  userRole: _userRole = "admin",
  defaultProgramme,
  defaultDept,
  defaultLevel,
  defaultSemester,
}: PassFailureListsProps) {
  const institution = useMemo(() => loadInstitutionProfile(), []);
  const acronym = useMemo(
    () => deriveAcronym(institution.name),
    [institution.name],
  );

  const [progFilter, setProgFilter] = useState<ProgrammeKey>(
    defaultProgramme ?? "university",
  );
  const [deptFilter, setDeptFilter] = useState<string>(defaultDept ?? "all");
  const [levelFilter, setLevelFilter] = useState<string>(defaultLevel ?? "all");
  const [semFilter, setSemFilter] = useState<string>(defaultSemester ?? "all");
  const [sessionFilter, setSessionFilter] = useState<string>(SESSIONS[0]);
  const [showFilters, setShowFilters] = useState(false);

  const [examOfficerName, setExamOfficerName] = useState("");
  const [examOfficerDate, setExamOfficerDate] = useState("");
  const [deanName, setDeanName] = useState("");
  const [deanDate, setDeanDate] = useState("");

  const [printMode, setPrintMode] = useState<"none" | "pass" | "failure">(
    "none",
  );
  const printRef = useRef<HTMLDivElement>(null);

  const printedAt = useMemo(() => {
    const d = new Date();
    return d.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, []);

  // Available depts for current programme
  const availableDepts = useMemo((): { key: string; label: string }[] => {
    if (progFilter === "university")
      return UNIVERSITY_DEPTS.map((d) => ({
        key: d,
        label: `${d} — ${DEPT_PROGRAMME_NAMES[d]}`,
      }));
    if (progFilter === "polytechnic")
      return [{ key: "OND-HND", label: "OND / HND Programme" }];
    if (progFilter === "college_of_education")
      return [{ key: "NCE", label: "NCE Programme" }];
    if (progFilter === "postgraduate")
      return [{ key: "PG", label: "Postgraduate Programme" }];
    if (progFilter === "certificate")
      return [{ key: "CERT", label: "Certificate Programme" }];
    if (progFilter === "distance_learning")
      return ["CSC", "MTH", "BIO"].map((d) => ({
        key: d,
        label: `${d} — ${DEPT_PROGRAMME_NAMES[d]}`,
      }));
    if (progFilter === "part_time")
      return ["CSC", "MTH"].map((d) => ({
        key: d,
        label: `${d} — ${DEPT_PROGRAMME_NAMES[d]}`,
      }));
    return [];
  }, [progFilter]);

  const availableLevels = useMemo((): { value: string; label: string }[] => {
    if (
      progFilter === "university" ||
      progFilter === "distance_learning" ||
      progFilter === "part_time"
    )
      return [
        { value: "1", label: "100 Level" },
        { value: "2", label: "200 Level" },
        { value: "3", label: "300 Level" },
        { value: "4", label: "400 Level" },
      ];
    if (progFilter === "polytechnic")
      return Object.entries(POLY_LEVELS).map(([v, l]) => ({
        value: v,
        label: l,
      }));
    if (progFilter === "college_of_education")
      return Object.entries(NCE_LEVELS).map(([v, l]) => ({
        value: v,
        label: l,
      }));
    if (progFilter === "postgraduate")
      return Object.entries(PG_LEVELS).map(([v, l]) => ({
        value: v,
        label: l,
      }));
    if (progFilter === "certificate")
      return [
        { value: "1", label: "Batch 1" },
        { value: "2", label: "Batch 2" },
        { value: "3", label: "Batch 3" },
      ];
    return [];
  }, [progFilter]);

  // Filter sections
  const filteredSections = useMemo((): SectionGroup[] => {
    const filtered = ALL_SAMPLE_DATA.filter((r) => {
      if (r.programme !== progFilter) return false;
      if (deptFilter !== "all" && r.dept !== deptFilter) return false;
      if (levelFilter !== "all" && r.level !== levelFilter) return false;
      if (semFilter !== "all" && r.semester !== semFilter) return false;
      if (r.session !== sessionFilter) return false;
      return true;
    });

    const groups = new Map<string, SectionGroup>();
    for (const row of filtered) {
      const key = groupKey(row);
      if (!groups.has(key)) {
        groups.set(key, {
          programme: row.programme,
          dept: row.dept,
          level: row.level,
          semester: row.semester,
          session: row.session,
          rows: [],
        });
      }
      groups.get(key)!.rows.push(row);
    }
    return Array.from(groups.values());
  }, [progFilter, deptFilter, levelFilter, semFilter, sessionFilter]);

  const totalStudents = useMemo(
    () => filteredSections.reduce((s, g) => s + g.rows.length, 0),
    [filteredSections],
  );
  const totalPass = useMemo(
    () =>
      filteredSections.reduce(
        (s, g) => s + g.rows.filter((r) => r.remark === "PROMOTED").length,
        0,
      ),
    [filteredSections],
  );
  const totalFail = useMemo(
    () =>
      filteredSections.reduce(
        (s, g) => s + g.rows.filter((r) => r.remark !== "PROMOTED").length,
        0,
      ),
    [filteredSections],
  );

  function computeGlobalPages(
    listType: "PASS" | "FAILURE",
  ): { section: SectionGroup; offset: number }[] {
    let offset = 0;
    return filteredSections.map((section) => {
      const src =
        listType === "PASS"
          ? section.rows.filter((r) => r.remark === "PROMOTED")
          : section.rows.filter((r) => r.remark !== "PROMOTED");
      const pages = Math.max(1, Math.ceil(src.length / PAGE_ROWS));
      const entry = { section, offset };
      offset += pages;
      return entry;
    });
  }

  const globalTotalPass = useMemo(
    () =>
      filteredSections.reduce(
        (s, sec) =>
          s +
          Math.max(
            1,
            Math.ceil(
              sec.rows.filter((r) => r.remark === "PROMOTED").length /
                PAGE_ROWS,
            ),
          ),
        0,
      ),
    [filteredSections],
  );

  const globalTotalFail = useMemo(
    () =>
      filteredSections.reduce(
        (s, sec) =>
          s +
          Math.max(
            1,
            Math.ceil(
              sec.rows.filter((r) => r.remark !== "PROMOTED").length /
                PAGE_ROWS,
            ),
          ),
        0,
      ),
    [filteredSections],
  );

  function handlePrint(type: "pass" | "failure") {
    setPrintMode(type);
    setTimeout(() => {
      window.print();
      setTimeout(() => setPrintMode("none"), 500);
    }, 100);
  }

  const renderPrintDocument = (listType: "PASS" | "FAILURE") => {
    const withOffsets = computeGlobalPages(listType);
    const globalTotal = listType === "PASS" ? globalTotalPass : globalTotalFail;
    return withOffsets.map(({ section, offset }, si) => (
      <SectionDisplay
        key={`${section.programme}-${section.dept}-${section.level}-${section.semester}-${listType}`}
        institution={institution}
        acronym={acronym}
        section={section}
        listType={listType}
        printedAt={printedAt}
        examOfficerName={examOfficerName}
        examOfficerDate={examOfficerDate}
        deanName={deanName}
        deanDate={deanDate}
        globalPageOffset={offset}
        globalTotalPages={globalTotal}
        firstSectionBreak={si > 0}
      />
    ));
  };

  const renderAccordions = (listType: "PASS" | "FAILURE") => {
    if (filteredSections.length === 0) {
      return (
        <div
          className="text-center py-12 text-muted-foreground"
          data-ocid="passlist.empty-state"
        >
          <ListChecks size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">
            No data for the selected filters.
          </p>
          <p className="text-xs mt-1">
            Adjust the programme type, department, level, or session.
          </p>
        </div>
      );
    }
    return filteredSections.map((section, i) => (
      <SectionAccordion
        key={`${section.programme}-${section.dept}-${section.level}-${section.semester}-${listType}`}
        institution={institution}
        acronym={acronym}
        section={section}
        listType={listType}
        printedAt={printedAt}
        examOfficerName={examOfficerName}
        examOfficerDate={examOfficerDate}
        deanName={deanName}
        deanDate={deanDate}
        defaultOpen={i === 0}
      />
    ));
  };

  return (
    <div className="p-4 md:p-6 bg-background min-h-screen">
      <style>{PRINT_CSS}</style>

      {/* ── Screen UI ── */}
      <div className="no-print">
        {/* Page header */}
        <div className="flex items-start justify-between gap-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <ListChecks className="text-primary" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Pass &amp; Failure Lists
              </h1>
              <p className="text-sm text-muted-foreground">
                Institution-branded, serialised per programme — printable A4
                landscape
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-2 shrink-0"
            onClick={() => setShowFilters((v) => !v)}
            data-ocid="passlist.toggle-filters.button"
          >
            <Filter size={14} />
            {showFilters ? "Hide Filters" : "Filters & Options"}
          </Button>
        </div>

        {/* Programme tab bar */}
        <div
          className="flex flex-wrap gap-2 mb-4"
          role="tablist"
          aria-label="Programme type"
        >
          {PROGRAMME_OPTIONS.map((p) => (
            <button
              type="button"
              key={p.key}
              role="tab"
              aria-selected={progFilter === p.key}
              onClick={() => {
                setProgFilter(p.key);
                setDeptFilter("all");
                setLevelFilter("all");
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                progFilter === p.key
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-muted text-muted-foreground border-border hover:bg-accent hover:text-accent-foreground"
              }`}
              data-ocid={`passlist.prog-tab.${p.key}`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <Card className="mb-5 border border-border">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-semibold text-foreground">
                Filters &amp; Signature Options
              </CardTitle>
              <button
                type="button"
                onClick={() => setShowFilters(false)}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Close filters"
              >
                <X size={16} />
              </button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
                <div>
                  <Label className="text-xs mb-1 block">Session</Label>
                  <Select
                    value={sessionFilter}
                    onValueChange={setSessionFilter}
                  >
                    <SelectTrigger data-ocid="passlist.session.select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SESSIONS.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs mb-1 block">Department</Label>
                  <Select value={deptFilter} onValueChange={setDeptFilter}>
                    <SelectTrigger data-ocid="passlist.dept.select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      {availableDepts.map((d) => (
                        <SelectItem key={d.key} value={d.key}>
                          {d.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs mb-1 block">Level / Year</Label>
                  <Select value={levelFilter} onValueChange={setLevelFilter}>
                    <SelectTrigger data-ocid="passlist.level.select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      {availableLevels.map((l) => (
                        <SelectItem key={l.value} value={l.value}>
                          {l.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs mb-1 block">Semester</Label>
                  <Select value={semFilter} onValueChange={setSemFilter}>
                    <SelectTrigger data-ocid="passlist.semester.select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Both Semesters</SelectItem>
                      <SelectItem value="1">First Semester</SelectItem>
                      <SelectItem value="2">Second Semester</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Signature fields */}
              <div className="border-t border-border pt-4">
                <p className="text-xs font-semibold text-muted-foreground mb-3">
                  Signature Information (printed on documents)
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <Label className="text-xs mb-1 block">
                      School Exam Officer
                    </Label>
                    <Input
                      data-ocid="passlist.examofficer.input"
                      value={examOfficerName}
                      onChange={(e) => setExamOfficerName(e.target.value)}
                      placeholder="e.g. Dr. A. Musa"
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs mb-1 block">
                      Exam Officer Date
                    </Label>
                    <Input
                      data-ocid="passlist.examofficerdate.input"
                      value={examOfficerDate}
                      onChange={(e) => setExamOfficerDate(e.target.value)}
                      placeholder="e.g. 01/04/2025"
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs mb-1 block">
                      Dean of School/Faculty
                    </Label>
                    <Input
                      data-ocid="passlist.dean.input"
                      value={deanName}
                      onChange={(e) => setDeanName(e.target.value)}
                      placeholder="e.g. Prof. B. Aliyu"
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs mb-1 block">Dean Date</Label>
                    <Input
                      data-ocid="passlist.deandate.input"
                      value={deanDate}
                      onChange={(e) => setDeanDate(e.target.value)}
                      placeholder="e.g. 01/04/2025"
                      className="text-sm"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats bar */}
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <div className="flex items-center gap-2 bg-muted rounded-full px-4 py-1.5 text-sm font-medium">
            <span className="text-muted-foreground">Sections:</span>
            <span className="font-bold text-foreground">
              {filteredSections.length}
            </span>
          </div>
          <div className="flex items-center gap-2 bg-muted rounded-full px-4 py-1.5 text-sm font-medium">
            <span className="text-muted-foreground">Total Students:</span>
            <span className="font-bold text-foreground">{totalStudents}</span>
          </div>
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-4 py-1.5 text-sm font-medium">
            <FileCheck size={13} className="text-green-600" />
            <span className="text-green-700">Passed: {totalPass}</span>
          </div>
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-full px-4 py-1.5 text-sm font-medium">
            <span className="text-red-600 font-bold text-xs">✗</span>
            <span className="text-red-700">Failed/Prob: {totalFail}</span>
          </div>
          <div className="ml-auto flex gap-2">
            <Button
              type="button"
              data-ocid="passlist.print_pass.button"
              onClick={() => handlePrint("pass")}
              className="bg-green-700 hover:bg-green-800 text-white text-sm gap-2"
              disabled={totalStudents === 0}
            >
              <Printer size={14} /> Print Pass List
            </Button>
            <Button
              type="button"
              data-ocid="passlist.print_failure.button"
              onClick={() => handlePrint("failure")}
              className="bg-red-700 hover:bg-red-800 text-white text-sm gap-2"
              disabled={totalStudents === 0}
            >
              <Printer size={14} /> Print Failure List
            </Button>
          </div>
        </div>

        {filteredSections.length > 1 && (
          <p className="text-xs text-muted-foreground mb-3 flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-primary/60 shrink-0" />
            Each section has its own S/N sequence (starting from 1), its own
            summary table, and its own signature block.
          </p>
        )}

        {/* Pass / Failure Tabs */}
        <Tabs defaultValue="failure">
          <TabsList data-ocid="passlist.tab" className="mb-4">
            <TabsTrigger value="pass" data-ocid="passlist.pass.tab">
              Pass List ({totalPass})
            </TabsTrigger>
            <TabsTrigger value="failure" data-ocid="passlist.failure.tab">
              Failure List ({totalFail})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pass">{renderAccordions("PASS")}</TabsContent>
          <TabsContent value="failure">
            {renderAccordions("FAILURE")}
          </TabsContent>
        </Tabs>
      </div>

      {/* ── Print Area ── */}
      <div
        id="pass-fail-print-area"
        ref={printRef}
        style={{ display: printMode === "none" ? "none" : "block" }}
        className="print-only"
      >
        {printMode === "pass" && renderPrintDocument("PASS")}
        {printMode === "failure" && renderPrintDocument("FAILURE")}
      </div>
    </div>
  );
}
