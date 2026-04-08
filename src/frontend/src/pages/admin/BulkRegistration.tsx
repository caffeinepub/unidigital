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
import { getLocalStudents, saveLocalStudents } from "../../utils/sampleData";

interface ParsedRow {
  matric_number: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  department: string;
  level: string;
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
}

const TEMPLATE_HEADERS = [
  "matric_number",
  "first_name",
  "last_name",
  "email",
  "phone",
  "department",
  "level",
  "subject_combination",
  "date_of_birth",
];

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
  const fileRef = useRef<HTMLInputElement>(null);

  const existingMatrics = getLocalStudents().map((s) => s.matricNumber);
  void existingMatrics;

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
        "CSC/MAT",
        "2001-05-15",
      ],
      [
        "ENG/2024/002",
        "Jane",
        "Smith",
        "jane@student.edu",
        "08023456789",
        "Engineering",
        "200",
        "",
        "2000-08-22",
      ],
    ]);
  };

  const processCSV = (text: string) => {
    const parsed = parseCSV(text);
    if (parsed.length < 2) {
      toast.error("CSV appears empty");
      return;
    }
    const headers = parsed[0].map((h) => h.toLowerCase().replace(/\s/g, "_"));
    const currentMatrics = getLocalStudents().map((s) => s.matricNumber);

    // Collect all corrections for auto-correct panel
    const allCorrections: typeof corrections = [];

    const newRows: ParsedRow[] = parsed.slice(1).map((vals) => {
      const row: Record<string, string> = {};
      for (const [i, h] of headers.entries()) {
        row[h] = vals[i] ?? "";
      }

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
    const reader = new FileReader();
    reader.onload = (e) => processCSV(e.target?.result as string);
    reader.readAsText(file);
  };

  const handleImport = async () => {
    setImporting(true);
    await new Promise((r) => setTimeout(r, 500));
    const validRows = rows.filter((r) => r.selected && r.errors.length === 0);
    const batchId = generateBatchId();
    const students = getLocalStudents();
    let imported = 0;

    for (const row of validRows) {
      const student = {
        matricNumber: row.matric_number,
        name: `${row.first_name} ${row.last_name}`.trim(),
        email: row.email,
        level: row.level,
        department: row.department,
        subCombination: row.subject_combination || undefined,
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
        imported++;
      }
    }
    saveLocalStudents(students);

    const skippedErrors = rows.filter(
      (r) => r.errors.length > 0 && !r.isDuplicate,
    ).length;
    const dups = rows.filter((r) => r.isDuplicate).length;
    setResult({ imported, errors: skippedErrors, duplicates: dups, batchId });
    setImporting(false);
    toast.success(`${imported} students imported (Batch: ${batchId})`);
  };

  const toggleRow = (idx: number) => {
    setRows((prev) =>
      prev.map((r, i) => (i === idx ? { ...r, selected: !r.selected } : r)),
    );
  };
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
        <h1 className="text-2xl font-bold text-slate-800">Bulk Registration</h1>
        <p className="text-slate-500 text-sm mt-1">
          Upload a CSV file to register multiple students at once
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>1. Download CSV Template</CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            onClick={downloadTemplate}
            data-ocid="bulk_reg.template_button"
          >
            📥 Download Template CSV
          </Button>
          <p className="text-xs text-slate-400 mt-2">
            Columns: {TEMPLATE_HEADERS.join(", ")}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>2. Upload Filled CSV</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <button
            type="button"
            className={`w-full border-2 border-dashed rounded-xl p-10 text-center transition-colors ${dragging ? "border-blue-400 bg-blue-50" : "border-slate-200 hover:border-blue-300 hover:bg-blue-50/30"}`}
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
            <p className="font-medium text-slate-700">
              Drag & drop CSV here or click to select
            </p>
            <p className="text-xs text-slate-400 mt-1">Accepts .csv files</p>
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
          />
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
                  <span className="text-slate-400">→</span>
                  <span className="text-green-700 text-xs">{c.suggested}</span>
                  <span className="text-slate-400 text-xs">({c.reason})</span>
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
                      <TableCell className="text-sm text-slate-500">
                        {row.email || "—"}
                      </TableCell>
                      <TableCell className="text-sm text-slate-500">
                        {row.department || "—"}
                      </TableCell>
                      <TableCell className="text-sm">
                        {row.level || "—"}
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
            <span className="text-sm text-slate-500">
              {rows.filter((r) => r.selected).length} rows selected for import
            </span>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
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
            ✅ {result.imported} imported
          </Badge>
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
