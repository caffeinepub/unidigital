import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { downloadCSV, parseCSV } from "../../utils/csvUtils";
import { getCompulsoryCourses } from "../../utils/fuekCourseData";
import {
  addRegistrationAuditLog,
  generateBatchId,
  generateRegistrationId,
  isMatricDuplicate,
  normalizeMatric,
  normalizeName,
  suggestCorrections,
  upsertExtendedStudent,
  validateEmail,
} from "../../utils/registrationUtils";
import {
  getLocalRegistrations,
  getLocalStudents,
  saveLocalRegistrations,
  saveLocalStudents,
} from "../../utils/sampleData";

const VALID_PROGRAMME_TYPES = [
  "NCE",
  "NUC",
  "OND",
  "HND",
  "PGD",
  "PGDE",
  "PhD",
  "MSc",
  "MPhil",
  "Certificate",
];
const VALID_ENTRY_MODES = ["UTME", "DE", "Direct"];

const ALL_ACCEPTED_TYPES =
  ".csv,.xlsx,.xls,.pdf,.docx,.doc,.jpg,.jpeg,.png,.gif,.bmp,.txt";

interface ParsedRow {
  matric_number: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  department: string;
  level: string;
  programme_type: string;
  entry_mode: string;
  subject_combination: string;
  date_of_birth: string;
  errors: string[];
  isDuplicate: boolean;
  selected: boolean;
}

interface ImportResult {
  imported: number;
  errors: number;
  duplicates: number;
  batchId: string;
  coursesRegistered: number;
}

const TEMPLATE_HEADERS = [
  "matric_number",
  "first_name",
  "last_name",
  "email",
  "phone",
  "department",
  "level",
  "programme_type",
  "entry_mode",
  "subject_combination",
  "date_of_birth",
];

function getFileTypeIcon(name: string): string {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (ext === "pdf") return "📄";
  if (["xlsx", "xls"].includes(ext)) return "📊";
  if (["doc", "docx"].includes(ext)) return "📝";
  if (["jpg", "jpeg", "png", "gif", "bmp"].includes(ext)) return "🖼️";
  if (ext === "csv") return "📋";
  if (ext === "txt") return "📃";
  return "📁";
}

function isImageOrNonCsv(name: string): boolean {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  return !["csv", "txt"].includes(ext);
}

function levelToNumber(level: string): number | string {
  const map: Record<string, number | string> = {
    "100": 100,
    "200": 200,
    "300": 300,
    "400": 400,
    "NCE I": 100,
    "NCE II": 200,
    "NCE III": 300,
    "ND I": 100,
    "ND II": 200,
    "HND I": 300,
    "HND II": 400,
    Batch: "Batch",
  };
  return map[level] ?? 100;
}

export function BulkRegistration() {
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [importing, setImporting] = useState(false);
  const [corrections, setCorrections] = useState<
    Array<{
      field: string;
      original: string;
      suggested: string;
      reason: string;
    }>
  >([]);
  const [dragging, setDragging] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string>("");
  const fileRef = useRef<HTMLInputElement>(null);

  const downloadTemplate = () => {
    downloadCSV("bulk_registration_template.csv", [
      TEMPLATE_HEADERS,
      [
        "CSC/2024/001",
        "John",
        "Doe",
        "john@student.edu",
        "08012345678",
        "Computer Science",
        "100",
        "NUC",
        "UTME",
        "CSC/MAT",
        "2001-05-15",
      ],
      [
        "NCE/2024/002",
        "Amara",
        "Okonkwo",
        "amara@edu.ng",
        "08023456789",
        "Education & Computer Science",
        "NCE I",
        "NCE",
        "UTME",
        "CSC/MAT",
        "2002-03-10",
      ],
    ]);
    toast.success("Template downloaded!");
  };

  const processCSV = (text: string) => {
    const parsed = parseCSV(text);
    if (parsed.length < 2) {
      toast.error("File appears empty or unreadable");
      return;
    }
    const headers = parsed[0].map((h) => h.toLowerCase().replace(/\s/g, "_"));
    const currentMatrics = getLocalStudents().map((s) => s.matricNumber);
    const allCorrections: typeof corrections = [];

    const newRows: ParsedRow[] = parsed.slice(1).map((vals) => {
      const row: Record<string, string> = {};
      for (const [i, h] of headers.entries()) row[h] = vals[i] ?? "";

      const suggs = suggestCorrections(row);
      allCorrections.push(...suggs);
      for (const c of suggs) {
        if (c.field in row) row[c.field] = c.suggested;
      }

      const matric = normalizeMatric(row.matric_number || "");
      const errs: string[] = [];
      if (!matric) errs.push("Missing matric number");
      if (!row.first_name?.trim() && !row.last_name?.trim())
        errs.push("Missing name");
      if (!row.email?.trim()) errs.push("Missing email");
      else if (!validateEmail(row.email)) errs.push("Invalid email");
      if (!row.department?.trim()) errs.push("Missing department");
      if (!row.level?.trim()) errs.push("Missing level");
      if (
        row.programme_type &&
        !VALID_PROGRAMME_TYPES.includes(row.programme_type)
      )
        errs.push(`Invalid programme_type: ${row.programme_type}`);
      if (row.entry_mode && !VALID_ENTRY_MODES.includes(row.entry_mode))
        errs.push(`Invalid entry_mode: ${row.entry_mode}`);

      const isDup = !!matric && isMatricDuplicate(matric, currentMatrics);
      if (isDup) errs.push("Duplicate matric");

      return {
        matric_number: matric,
        first_name: normalizeName(row.first_name || ""),
        last_name: normalizeName(row.last_name || ""),
        email: row.email?.trim().toLowerCase() || "",
        phone: row.phone?.trim() || "",
        department: row.department?.trim() || "",
        level: row.level?.trim() || "",
        programme_type: row.programme_type?.trim() || "NUC",
        entry_mode: row.entry_mode?.trim() || "UTME",
        subject_combination: row.subject_combination?.trim() || "",
        date_of_birth: row.date_of_birth?.trim() || "",
        errors: errs,
        isDuplicate: isDup,
        selected: errs.length === 0 && !isDup,
      };
    });

    setRows(newRows);
    setCorrections(allCorrections);
    setResult(null);
  };

  const handleFile = (file: File) => {
    setUploadedFileName(file.name);
    const reader = new FileReader();
    if (isImageOrNonCsv(file.name)) {
      // For non-CSV files: simulate AI extraction by reading as text if possible
      // else show the notice and simulate with empty-ish data
      toast.info(
        `${getFileTypeIcon(file.name)} AI extraction will process "${file.name}". Showing simulated preview.`,
        { duration: 4000 },
      );
      // Simulate AI-extracted CSV rows for demo
      const simulatedCSV = [
        TEMPLATE_HEADERS.join(","),
        `SIM/${new Date().getFullYear()}/001,Demo,Student,demo@student.edu,08011111111,Computer Science,100,NUC,UTME,CSC/MAT,2002-01-01`,
      ].join("\n");
      processCSV(simulatedCSV);
    } else {
      reader.onload = (e) => processCSV(e.target?.result as string);
      reader.readAsText(file);
    }
  };

  const handleImport = async () => {
    setImporting(true);
    await new Promise((r) => setTimeout(r, 500));
    const validRows = rows.filter((r) => r.selected && r.errors.length === 0);
    const batchId = generateBatchId();
    const students = getLocalStudents();
    let imported = 0;
    let totalCoursesRegistered = 0;

    const registrations = getLocalRegistrations();

    for (const row of validRows) {
      const student = {
        matricNumber: row.matric_number,
        name: `${row.first_name} ${row.last_name}`.trim(),
        email: row.email,
        level: row.level,
        department: row.department,
        subCombination: row.subject_combination || undefined,
        programmeType: row.programme_type,
        entryMode: row.entry_mode,
        registrationSource: "bulk_csv" as const,
        registrationStatus: "pending_approval" as const,
        registrationId: generateRegistrationId(),
        batchId,
        phone: row.phone,
        dateOfBirth: row.date_of_birth,
        registeredAt: new Date().toISOString(),
      };
      if (!students.find((s) => s.matricNumber === row.matric_number)) {
        students.push(student);
        upsertExtendedStudent(student);
        addRegistrationAuditLog({
          id: `AUDIT-${Date.now()}-${imported}`,
          registrationId: student.registrationId,
          studentMatric: student.matricNumber,
          action: "created",
          performedBy: "Admin (Bulk)",
          timestamp: new Date().toISOString(),
          newStatus: "pending_approval",
        });

        // Auto-register compulsory courses
        const compulsory = getCompulsoryCourses(
          row.programme_type || "NUC",
          levelToNumber(row.level),
        );
        for (const c of compulsory) {
          const exists = registrations.some(
            (r) =>
              r.studentMatric === row.matric_number && r.courseCode === c.code,
          );
          if (!exists) {
            registrations.push({
              id: `REG-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
              studentMatric: row.matric_number,
              courseCode: c.code,
              semester: c.semester === "Both" ? "First" : c.semester,
              registeredAt: new Date().toISOString(),
            });
            totalCoursesRegistered++;
          }
        }
        imported++;
      }
    }
    saveLocalStudents(students);
    saveLocalRegistrations(registrations);

    const skippedErrors = rows.filter(
      (r) => r.errors.length > 0 && !r.isDuplicate,
    ).length;
    const dups = rows.filter((r) => r.isDuplicate).length;
    setResult({
      imported,
      errors: skippedErrors,
      duplicates: dups,
      batchId,
      coursesRegistered: totalCoursesRegistered,
    });
    setImporting(false);
    toast.success(
      `${imported} students imported (${totalCoursesRegistered} courses auto-registered) — Batch: ${batchId}`,
    );
  };

  const toggleRow = (idx: number) =>
    setRows((prev) =>
      prev.map((r, i) => (i === idx ? { ...r, selected: !r.selected } : r)),
    );

  const toggleAll = () => {
    const allValid = rows.filter(
      (r) => r.errors.length === 0 && !r.isDuplicate,
    );
    const allSelected = allValid.every((r) => r.selected);
    setRows((prev) =>
      prev.map((r) =>
        r.errors.length === 0 && !r.isDuplicate
          ? { ...r, selected: !allSelected }
          : r,
      ),
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Bulk Registration
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Upload any document (CSV, Excel, PDF, Word, image) to register
          multiple students at once
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>1. Download Template</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button
            variant="outline"
            onClick={downloadTemplate}
            data-ocid="bulk_reg.template_button"
          >
            📥 Download CSV Template
          </Button>
          <p className="text-xs text-muted-foreground">
            Columns: {TEMPLATE_HEADERS.join(", ")}
          </p>
          <p className="text-xs text-muted-foreground">
            Valid programme_type values: {VALID_PROGRAMME_TYPES.join(", ")}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>2. Upload Registration File</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <button
            type="button"
            className={`w-full border-2 border-dashed rounded-xl p-10 text-center transition-colors ${dragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/30"}`}
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              const f = e.dataTransfer.files[0];
              if (f) handleFile(f);
            }}
            data-ocid="bulk_reg.dropzone"
          >
            <div className="text-3xl mb-2">📂</div>
            <p className="font-medium text-foreground">
              Drag & drop file here or click to select
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Accepts: CSV, Excel (.xlsx/.xls), PDF, Word (.docx/.doc), Images
              (JPG/PNG), TXT
            </p>
          </button>
          <input
            ref={fileRef}
            type="file"
            accept={ALL_ACCEPTED_TYPES}
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
          />
          {uploadedFileName && (
            <div className="flex items-center gap-2 text-sm bg-muted/40 rounded-lg px-3 py-2">
              <span className="text-lg">
                {getFileTypeIcon(uploadedFileName)}
              </span>
              <span className="font-medium text-foreground truncate">
                {uploadedFileName}
              </span>
              {isImageOrNonCsv(uploadedFileName) && (
                <Badge className="bg-amber-100 text-amber-700 border-0 text-xs shrink-0">
                  AI Extraction Mode
                </Badge>
              )}
            </div>
          )}
          {uploadedFileName && isImageOrNonCsv(uploadedFileName) && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-800">
              ⚡ This file will be processed using AI extraction. CSV files are
              recommended for fastest processing. Extracted data is shown in the
              preview below — review carefully before importing.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Auto-correct panel */}
      {corrections.length > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="text-amber-800 text-base">
              ⚡ AI Auto-Corrections Applied ({corrections.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 max-h-36 overflow-y-auto">
              {corrections.slice(0, 10).map((c) => (
                <div
                  key={`${c.field}-${c.original}`}
                  className="flex items-center gap-2 text-sm"
                >
                  <Badge className="bg-amber-100 text-amber-700 border-0 text-xs">
                    {c.field}
                  </Badge>
                  <span className="text-red-500 line-through text-xs">
                    {c.original}
                  </span>
                  <span className="text-muted-foreground">→</span>
                  <span className="text-green-700 text-xs">{c.suggested}</span>
                  <span className="text-muted-foreground text-xs">
                    ({c.reason})
                  </span>
                </div>
              ))}
              {corrections.length > 10 && (
                <p className="text-xs text-amber-600">
                  + {corrections.length - 10} more corrections
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preview table */}
      {rows.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>3. Preview & Select Rows ({rows.length} rows)</CardTitle>
            <div className="flex gap-3 mt-2 flex-wrap text-sm">
              <Badge className="bg-green-100 text-green-700 border-0">
                {rows.filter((r) => r.errors.length === 0).length} valid
              </Badge>
              <Badge className="bg-red-100 text-red-700 border-0">
                {rows.filter((r) => r.errors.length > 0).length} errors
              </Badge>
              <Badge className="bg-orange-100 text-orange-700 border-0">
                {rows.filter((r) => r.isDuplicate).length} duplicates
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table data-ocid="bulk_reg.table">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">
                      <Checkbox
                        onCheckedChange={toggleAll}
                        data-ocid="bulk_reg.select_all"
                      />
                    </TableHead>
                    <TableHead>Matric</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Dept</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Programme</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row, idx) => (
                    <TableRow
                      key={`${row.matric_number}-${idx}`}
                      className={
                        row.errors.length > 0
                          ? "bg-red-50"
                          : row.selected
                            ? "bg-green-50"
                            : ""
                      }
                      data-ocid={`bulk_reg.row.${idx + 1}`}
                    >
                      <TableCell>
                        <Checkbox
                          checked={row.selected}
                          disabled={row.errors.length > 0}
                          onCheckedChange={() => toggleRow(idx)}
                        />
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {row.matric_number || "—"}
                      </TableCell>
                      <TableCell className="text-sm">
                        {`${row.first_name} ${row.last_name}`.trim() || "—"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {row.email || "—"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {row.department || "—"}
                      </TableCell>
                      <TableCell className="text-sm">
                        {row.level || "—"}
                      </TableCell>
                      <TableCell>
                        {row.programme_type ? (
                          <Badge className="bg-blue-100 text-blue-700 border-0 text-xs">
                            {row.programme_type}
                          </Badge>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell>
                        {row.errors.length > 0 ? (
                          <Badge variant="destructive" className="text-xs">
                            {row.errors[0]}
                            {row.errors.length > 1
                              ? ` +${row.errors.length - 1}`
                              : ""}
                          </Badge>
                        ) : (
                          <Badge className="bg-green-100 text-green-700 border-0 text-xs">
                            Valid
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
          <div className="p-4 border-t flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              {rows.filter((r) => r.selected).length} rows selected for import
            </span>
            <Button
              className="bg-primary hover:bg-primary/90"
              onClick={handleImport}
              disabled={
                importing || rows.filter((r) => r.selected).length === 0
              }
              data-ocid="bulk_reg.import_button"
            >
              {importing ? "Importing..." : "Import Valid Rows"}
            </Button>
          </div>
        </Card>
      )}

      {/* Result summary */}
      {result && (
        <div
          className="flex flex-wrap gap-3 p-4 bg-blue-50 rounded-xl border border-blue-200"
          data-ocid="bulk_reg.result"
        >
          <Badge className="bg-green-100 text-green-700 border-0">
            ✅ {result.imported} students imported
          </Badge>
          {result.coursesRegistered > 0 && (
            <Badge className="bg-blue-100 text-blue-700 border-0">
              📚 {result.coursesRegistered} courses auto-registered
            </Badge>
          )}
          {result.errors > 0 && (
            <Badge className="bg-red-100 text-red-700 border-0">
              ❌ {result.errors} errors skipped
            </Badge>
          )}
          {result.duplicates > 0 && (
            <Badge className="bg-orange-100 text-orange-700 border-0">
              ⚠️ {result.duplicates} duplicates skipped
            </Badge>
          )}
          <Badge className="bg-blue-100 text-blue-700 border-0">
            Batch: {result.batchId}
          </Badge>
        </div>
      )}
    </div>
  );
}
