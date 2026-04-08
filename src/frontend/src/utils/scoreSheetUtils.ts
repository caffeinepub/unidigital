/**
 * Score Sheet Utilities
 * Handles download, print, and grade helpers for score sheets.
 */

import { getInstitutionSettings } from "../hooks/useInstitutionSettings";
import { downloadCSV } from "./csvUtils";

export interface ScoreSheetStudent {
  sn: number;
  name: string;
  matricNumber: string;
  ca: number | string;
  exam: number | string;
  total: number | string;
  grade: string;
  remarks: string;
}

export interface ScoreSheetMeta {
  faculty: string;
  department: string;
  courseTitle: string;
  courseCode: string;
  semester: string;
  session: string;
}

export interface SignatureBlock {
  lecturerName: string;
  hodName: string;
  deanName: string;
  moderatorName: string;
  lecturerDate: string;
  hodDate: string;
  deanDate: string;
  moderatorDate: string;
}

/** Compute grade from total score using standard FUEK scale */
export function computeGrade(total: number): {
  grade: string;
  remarks: string;
} {
  if (total >= 70) return { grade: "A", remarks: "Pass" };
  if (total >= 60) return { grade: "B", remarks: "Pass" };
  if (total >= 50) return { grade: "C", remarks: "Pass" };
  if (total >= 45) return { grade: "D", remarks: "Pass" };
  if (total >= 40) return { grade: "E", remarks: "Pass" };
  return { grade: "F", remarks: "Fail" };
}

/** Get grade badge colour class */
export function gradeColorClass(grade: string): string {
  const map: Record<string, string> = {
    A: "bg-green-100 text-green-800",
    B: "bg-blue-100 text-blue-800",
    C: "bg-amber-100 text-amber-800",
    D: "bg-orange-100 text-orange-800",
    E: "bg-red-100 text-red-700",
    F: "bg-red-200 text-red-900",
  };
  return map[grade] ?? "bg-slate-100 text-slate-700";
}

function buildHeaderRows(meta: ScoreSheetMeta): string[][] {
  const settings = getInstitutionSettings();
  const instName =
    settings.profile.name || "Federal University of Education Kontagora";
  const address =
    [settings.profile.address, settings.profile.city, settings.profile.state]
      .filter(Boolean)
      .join(", ") || "P.M.B. 1039, Kontagora, Niger State, Nigeria";
  return [
    [instName],
    [address],
    [`Faculty/School: ${meta.faculty}`],
    [`Department: ${meta.department}`],
    [`Course Title: ${meta.courseTitle}`, `Course Code: ${meta.courseCode}`],
    [`Semester: ${meta.semester}`, `Session: ${meta.session}`],
    [
      "Instructions: Fill in CA scores (max 40) and Exam scores (max 60). Total, Grade and Remarks are auto-calculated.",
    ],
    [],
    [
      "S/N",
      "Student Name",
      "Matric Number",
      "CA (40)",
      "Exam (60)",
      "Total (100)",
      "Grade",
      "Remarks",
    ],
  ];
}

function buildSignatureRows(sig: SignatureBlock): string[][] {
  return [
    [],
    ["--- SIGNATURES ---"],
    ["Lecturer in Charge", "", "HOD", "", "Dean", "", "Moderator"],
    [
      `Name: ${sig.lecturerName || "___________________"}`,
      "",
      `Name: ${sig.hodName || "___________________"}`,
      "",
      `Name: ${sig.deanName || "___________________"}`,
      "",
      `Name: ${sig.moderatorName || "___________________"}`,
    ],
    [
      "Signature: ___________________",
      "",
      "Signature: ___________________",
      "",
      "Signature: ___________________",
      "",
      "Signature: ___________________",
    ],
    [
      `Date: ${sig.lecturerDate || "___________________"}`,
      "",
      `Date: ${sig.hodDate || "___________________"}`,
      "",
      `Date: ${sig.deanDate || "___________________"}`,
      "",
      `Date: ${sig.moderatorDate || "___________________"}`,
    ],
  ];
}

export function downloadBlankTemplate(
  meta: ScoreSheetMeta,
  students: { name: string; matricNumber: string }[],
  sig?: Partial<SignatureBlock>,
) {
  const header = buildHeaderRows(meta);
  const dataRows = students.map((s, i) => [
    String(i + 1),
    s.name,
    s.matricNumber,
    "",
    "",
    "",
    "",
    "",
  ]);
  const sigBlock = buildSignatureRows({
    lecturerName: sig?.lecturerName ?? "",
    hodName: sig?.hodName ?? "",
    deanName: sig?.deanName ?? "",
    moderatorName: sig?.moderatorName ?? "",
    lecturerDate: sig?.lecturerDate ?? "",
    hodDate: sig?.hodDate ?? "",
    deanDate: sig?.deanDate ?? "",
    moderatorDate: sig?.moderatorDate ?? "",
  });
  const filename = `score-sheet-blank-${meta.courseCode}-${meta.semester.replace(/ /g, "-")}.csv`;
  downloadCSV(filename, [...header, ...dataRows, ...sigBlock]);
}

export function downloadFilledScoreSheet(
  meta: ScoreSheetMeta,
  students: ScoreSheetStudent[],
  sig?: Partial<SignatureBlock>,
) {
  const header = buildHeaderRows(meta);
  const dataRows = students.map((s) => [
    String(s.sn),
    s.name,
    s.matricNumber,
    String(s.ca),
    String(s.exam),
    String(s.total),
    s.grade,
    s.remarks,
  ]);
  const sigBlock = buildSignatureRows({
    lecturerName: sig?.lecturerName ?? "",
    hodName: sig?.hodName ?? "",
    deanName: sig?.deanName ?? "",
    moderatorName: sig?.moderatorName ?? "",
    lecturerDate: sig?.lecturerDate ?? "",
    hodDate: sig?.hodDate ?? "",
    deanDate: sig?.deanDate ?? "",
    moderatorDate: sig?.moderatorDate ?? "",
  });
  const filename = `score-sheet-${meta.courseCode}-${meta.semester.replace(/ /g, "-")}.csv`;
  downloadCSV(filename, [...header, ...dataRows, ...sigBlock]);
}

export function printScoreSheet(
  meta: ScoreSheetMeta,
  students: ScoreSheetStudent[],
  sig: Partial<SignatureBlock> = {},
) {
  const settings = getInstitutionSettings();
  const instName =
    settings.profile.name || "Federal University of Education Kontagora";
  const address =
    [settings.profile.address, settings.profile.city, settings.profile.state]
      .filter(Boolean)
      .join(", ") || "P.M.B. 1039, Kontagora, Niger State, Nigeria";
  const misName = `${instName
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .toUpperCase()} MIS`;
  const datePrinted = new Date().toLocaleDateString("en-GB");

  const rows = students
    .map(
      (s, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${s.name}</td>
        <td class="mono">${s.matricNumber}</td>
        <td class="center">${s.ca}</td>
        <td class="center">${s.exam}</td>
        <td class="center bold">${s.total}</td>
        <td class="center bold grade-${s.grade}">${s.grade}</td>
        <td class="center ${s.remarks === "Pass" ? "pass" : "fail"}">${s.remarks}</td>
      </tr>`,
    )
    .join("");

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <title>Score Sheet - ${meta.courseCode}</title>
  <style>
    @page { size: A4 landscape; margin: 15mm; }
    * { box-sizing: border-box; }
    body { font-family: Arial, sans-serif; font-size: 10pt; color: #000; }
    .header { text-align: center; margin-bottom: 12px; }
    .header h1 { font-size: 14pt; font-weight: bold; margin: 0 0 2px; text-transform: uppercase; }
    .meta { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 9pt; }
    .meta .meta-col { flex: 1; }
    .instructions { font-size: 8pt; font-style: italic; color: #444; margin-bottom: 8px; padding: 4px 6px; border: 1px dashed #aaa; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
    th { background: #1e3a5f; color: #fff; padding: 5px 6px; text-align: left; font-size: 8.5pt; }
    td { padding: 4px 6px; border-bottom: 1px solid #ddd; font-size: 8.5pt; }
    tr:nth-child(even) { background: #f5f5f5; }
    .center { text-align: center; }
    .mono { font-family: monospace; }
    .bold { font-weight: bold; }
    .pass { color: #166534; font-weight: 600; }
    .fail { color: #991b1b; font-weight: 600; }
    .grade-A { color: #14532d; }
    .grade-B { color: #1e40af; }
    .grade-C { color: #92400e; }
    .grade-D { color: #c2410c; }
    .grade-E { color: #b91c1c; }
    .grade-F { color: #7f1d1d; font-weight: bold; }
    .sig-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    .sig-table th { background: #e2e8f0; color: #1e293b; font-size: 8.5pt; text-align: center; padding: 4px 6px; border: 1px solid #cbd5e1; }
    .sig-table td { border: 1px solid #cbd5e1; padding: 10px 8px; font-size: 8.5pt; }
    .footer { display: flex; justify-content: space-between; font-size: 7.5pt; color: #666; margin-top: 10px; border-top: 1px solid #ddd; padding-top: 4px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>${instName}</h1>
    <p>${address}</p>
  </div>
  <div class="meta">
    <div class="meta-col"><strong>Faculty/School:</strong> ${meta.faculty}</div>
    <div class="meta-col"><strong>Department:</strong> ${meta.department}</div>
    <div class="meta-col"><strong>Session:</strong> ${meta.session}</div>
    <div class="meta-col"><strong>Semester:</strong> ${meta.semester}</div>
  </div>
  <div class="meta">
    <div class="meta-col"><strong>Course Title:</strong> ${meta.courseTitle}</div>
    <div class="meta-col"><strong>Course Code:</strong> ${meta.courseCode}</div>
  </div>
  <div class="instructions">Instructions: Fill in CA scores (max 40) and Exam scores (max 60). Total, Grade and Remarks are auto-calculated.</div>
  <table>
    <thead>
      <tr>
        <th>S/N</th><th>Student Name</th><th>Matric Number</th>
        <th class="center">CA (40)</th><th class="center">Exam (60)</th>
        <th class="center">Total (100)</th><th class="center">Grade</th><th class="center">Remarks</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
  <table class="sig-table">
    <tr>
      <th>Lecturer in Charge</th><th>HOD</th><th>Dean</th><th>Moderator</th>
    </tr>
    <tr>
      <td>Name: ${sig.lecturerName || "___________________________"}</td>
      <td>Name: ${sig.hodName || "___________________________"}</td>
      <td>Name: ${sig.deanName || "___________________________"}</td>
      <td>Name: ${sig.moderatorName || "___________________________"}</td>
    </tr>
    <tr>
      <td>Signature: ___________________</td>
      <td>Signature: ___________________</td>
      <td>Signature: ___________________</td>
      <td>Signature: ___________________</td>
    </tr>
    <tr>
      <td>Date: ${sig.lecturerDate || "___________________"}</td>
      <td>Date: ${sig.hodDate || "___________________"}</td>
      <td>Date: ${sig.deanDate || "___________________"}</td>
      <td>Date: ${sig.moderatorDate || "___________________"}</td>
    </tr>
  </table>
  <div class="footer">
    <span>Date Printed: ${datePrinted}</span>
    <span>${misName}</span>
    <span>Page 1</span>
  </div>
  <script>window.onload = function() { window.print(); }</script>
</body>
</html>`;

  const win = window.open("", "_blank");
  if (win) {
    win.document.write(html);
    win.document.close();
  }
}
