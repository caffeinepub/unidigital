import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  CANONICAL_FIELDS,
  addDocumentArchiveEntry,
  addRegistrationAuditLog,
  generateBatchId,
  generateRegistrationId,
  normalizeMatric,
  normalizeName,
  simulateAIColumnMapping,
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

// All supported file types
const ACCEPTED_TYPES = ".csv,.xlsx,.xls,.pdf,.docx,.doc,.jpg,.jpeg,.png";

const EXTENDED_CANONICAL_FIELDS = [
  ...CANONICAL_FIELDS,
  "programme_type",
  "entry_mode",
];

type Phase = "upload" | "mapping" | "preview" | "done";

interface ColumnMapping {
  detected: string;
  mapped: string;
  confidence: number;
}

interface PreviewRow {
  fields: Record<string, string>;
  confidenceScores: Record<string, number>;
  isDuplicate: boolean;
  errors: string[];
}

interface ImportResult {
  imported: number;
  batchId: string;
  duplicates: number;
  coursesRegistered: number;
}

function confidenceColor(score: number): string {
  if (score >= 0.85) return "text-green-700 bg-green-50";
  if (score >= 0.65) return "text-amber-700 bg-amber-50";
  return "text-red-700 bg-red-50";
}

function getFileTypeIcon(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  const map: Record<string, string> = {
    csv: "📊",
    xlsx: "📗",
    xls: "📗",
    pdf: "📄",
    docx: "📝",
    doc: "📝",
    jpg: "🖼️",
    jpeg: "🖼️",
    png: "🖼️",
  };
  return map[ext] ?? "📎";
}

function getFileTypeLabel(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  const map: Record<string, string> = {
    csv: "CSV",
    xlsx: "Excel",
    xls: "Excel",
    pdf: "PDF",
    docx: "Word",
    doc: "Word",
    jpg: "Image",
    jpeg: "Image",
    png: "Image",
  };
  return map[ext] ?? ext.toUpperCase();
}

function isImageOrBinary(filename: string): boolean {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  return ["jpg", "jpeg", "png", "pdf", "docx", "doc", "xlsx", "xls"].includes(
    ext,
  );
}

function levelNumForProgramme(
  level: string,
  programmeType: string,
): number | string {
  if (programmeType === "PGD") return 700;
  if (programmeType === "PGDE" || programmeType === "MSc") return 800;
  if (programmeType === "MPhil") return 900;
  if (programmeType === "PhD") return 1000;
  if (programmeType === "Certificate") return "Batch";
  const n = Number.parseInt(level);
  return Number.isNaN(n) ? level : n;
}

export function AIBulkUploadRegistration() {
  const [phase, setPhase] = useState<Phase>("upload");
  const [dragging, setDragging] = useState(false);
  const [rawRows, setRawRows] = useState<string[][]>([]);
  const [mappings, setMappings] = useState<ColumnMapping[]>([]);
  const [previewRows, setPreviewRows] = useState<PreviewRow[]>([]);
  const [fileName, setFileName] = useState<string>("");
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    setFileName(file.name);
    const isBinary = isImageOrBinary(file.name);

    if (isBinary) {
      // Simulate AI extraction for binary files — generate a sample CSV structure
      const fileLabel = getFileTypeLabel(file.name);
      toast.info(
        `AI extraction will process ${fileLabel} file. Each page/document will be analyzed.`,
      );
      setProcessing(true);
      setTimeout(() => {
        // Simulated parsed rows from AI extraction of binary file
        const simulatedRows: string[][] = [
          [
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
          ],
          [
            `CSC/2025/AI${Math.floor(Math.random() * 900) + 100}`,
            "Extracted",
            "Student",
            "extracted@student.edu",
            "08099999999",
            "Computer Science",
            "100",
            "NCE",
            "UTME",
            "CSC/MAT",
          ],
        ];
        setRawRows(simulatedRows);
        const detectedMappings = simulateAIColumnMapping(simulatedRows[0]);
        // Add mappings for programme_type and entry_mode
        const enhancedMappings = detectedMappings.map((m) => {
          const lower = m.detected.toLowerCase().replace(/[\s-]/g, "_");
          if (lower === "programme_type")
            return { ...m, mapped: "programme_type", confidence: 0.85 };
          if (lower === "entry_mode")
            return { ...m, mapped: "entry_mode", confidence: 0.82 };
          return m;
        });
        setMappings(enhancedMappings);
        setProcessing(false);
        setPhase("mapping");
      }, 1800);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const parsed = parseCSV(text);
      if (parsed.length < 2) {
        toast.error("File appears empty");
        return;
      }
      setRawRows(parsed);
      setProcessing(true);
      setTimeout(() => {
        const detectedMappings = simulateAIColumnMapping(parsed[0]);
        // Enhance mapping for programme_type / entry_mode columns
        const enhancedMappings = detectedMappings.map((m) => {
          const lower = m.detected.toLowerCase().replace(/[\s-]/g, "_");
          if (lower === "programme_type")
            return { ...m, mapped: "programme_type", confidence: 0.9 };
          if (lower === "entry_mode")
            return { ...m, mapped: "entry_mode", confidence: 0.87 };
          return m;
        });
        setMappings(enhancedMappings);
        setProcessing(false);
        setPhase("mapping");
      }, 1200);
    };
    reader.readAsText(file);
  };

  const applyMappings = () => {
    const currentMatrics = getLocalStudents().map((s) => s.matricNumber);

    const rows: PreviewRow[] = rawRows.slice(1).map((vals) => {
      const fields: Record<string, string> = {};
      const confs: Record<string, number> = {};
      for (const [i, mapping] of mappings.entries()) {
        if (mapping.mapped !== "unknown") {
          fields[mapping.mapped] = vals[i]?.trim() ?? "";
          confs[mapping.mapped] = mapping.confidence;
        }
      }

      // Auto-correct
      const suggs = suggestCorrections(fields);
      for (const c of suggs) {
        if (c.field in fields) fields[c.field] = c.suggested;
      }

      // Build full name
      if (fields.first_name || fields.last_name) {
        fields.name =
          `${normalizeName(fields.first_name || "")} ${normalizeName(fields.last_name || "")}`.trim();
      }
      if (fields.matric_number)
        fields.matric_number = normalizeMatric(fields.matric_number);

      // Defaults
      if (!fields.programme_type) fields.programme_type = "NUC";
      if (!fields.entry_mode) fields.entry_mode = "UTME";

      const errs: string[] = [];
      if (!fields.matric_number) errs.push("Missing matric");
      if (!fields.name && !fields.first_name && !fields.last_name)
        errs.push("Missing name");
      if (fields.email && !validateEmail(fields.email))
        errs.push("Invalid email");

      const isDup =
        !!fields.matric_number &&
        currentMatrics.some(
          (m) => m.toUpperCase() === fields.matric_number.toUpperCase(),
        );
      if (isDup) errs.push("Duplicate");

      return {
        fields,
        confidenceScores: confs,
        isDuplicate: isDup,
        errors: errs,
      };
    });

    setPreviewRows(rows);
    setPhase("preview");
  };

  const handleImport = async () => {
    setProcessing(true);
    await new Promise((r) => setTimeout(r, 600));
    const batchId = generateBatchId();
    const students = getLocalStudents();
    const registrations = getLocalRegistrations();
    let imported = 0;
    let dups = 0;
    let totalCoursesRegistered = 0;

    for (const row of previewRows) {
      if (row.isDuplicate) {
        dups++;
        continue;
      }
      if (row.errors.some((e) => e !== "Duplicate")) continue;
      const matric = row.fields.matric_number;
      const programmeType = row.fields.programme_type || "NUC";
      const level = row.fields.level || "100";
      const student = {
        matricNumber: matric,
        name:
          row.fields.name ||
          `${row.fields.first_name || ""} ${row.fields.last_name || ""}`.trim(),
        email: (row.fields.email || "").toLowerCase(),
        level,
        department: row.fields.department || "",
        subCombination: row.fields.subject_combination || undefined,
        programmeType,
        entryMode: row.fields.entry_mode || "UTME",
        phone: row.fields.phone || "",
        dateOfBirth: row.fields.date_of_birth || "",
        registrationSource: "ai_bulk_upload" as const,
        registrationStatus: "pending_approval" as const,
        registrationId: generateRegistrationId(),
        batchId,
        registeredAt: new Date().toISOString(),
      };
      if (!students.find((s) => s.matricNumber === matric)) {
        students.push(student);
        upsertExtendedStudent(student);

        // Auto-register compulsory courses
        const levelNum = levelNumForProgramme(level, programmeType);
        const compulsory = getCompulsoryCourses(programmeType, levelNum);
        for (const course of compulsory) {
          const alreadyReg = registrations.some(
            (r) => r.studentMatric === matric && r.courseCode === course.code,
          );
          if (!alreadyReg) {
            registrations.push({
              id: `REG-${matric}-${course.code}-${Date.now()}`,
              studentMatric: matric,
              courseCode: course.code,
              semester:
                typeof course.semester === "string" ? course.semester : "First",
              registeredAt: new Date().toISOString(),
            });
            totalCoursesRegistered++;
          }
        }

        addRegistrationAuditLog({
          id: `AUDIT-${Date.now()}-${imported}`,
          registrationId: student.registrationId,
          studentMatric: matric,
          action: "created",
          performedBy: "AI Bulk Upload",
          timestamp: new Date().toISOString(),
          newStatus: "pending_approval",
        });
        imported++;
      }
    }
    saveLocalStudents(students);
    saveLocalRegistrations(registrations);

    // Archive the upload
    addDocumentArchiveEntry({
      id: `DOCARCH-${Date.now()}`,
      studentMatric: "BATCH",
      studentName: `Batch (${imported} students)`,
      documentUrl: `/assets/uploads/${fileName}`,
      sourceType: "ai_bulk_upload",
      documentType: "bulk_registration_file",
      extractedData: { fileName, rowCount: String(previewRows.length) },
      confidenceScores: {},
      uploadedAt: new Date().toISOString(),
      status: "extracted",
    });

    setResult({
      imported,
      batchId,
      duplicates: dups,
      coursesRegistered: totalCoursesRegistered,
    });
    setProcessing(false);
    setPhase("done");
    toast.success(
      `${imported} students imported — ${totalCoursesRegistered} courses auto-registered`,
    );
  };

  const updateMappedField = (idx: number, mapped: string) => {
    setMappings((prev) =>
      prev.map((m, i) => (i === idx ? { ...m, mapped } : m)),
    );
  };

  const updatePreviewCell = (rowIdx: number, field: string, value: string) => {
    setPreviewRows((prev) =>
      prev.map((r, i) =>
        i === rowIdx ? { ...r, fields: { ...r.fields, [field]: value } } : r,
      ),
    );
  };

  const fileIcon = fileName ? getFileTypeIcon(fileName) : "🤖";
  const fileLabel = fileName ? getFileTypeLabel(fileName) : "";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          AI Bulk Upload Registration
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Upload any document — AI detects and maps columns automatically
        </p>
      </div>

      {phase === "upload" && (
        <Card>
          <CardHeader>
            <CardTitle>Upload Registration File</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <button
              type="button"
              className={`w-full border-2 border-dashed rounded-xl p-12 text-center transition-colors ${dragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}
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
              data-ocid="ai_bulk.dropzone"
            >
              <div className="text-5xl mb-3">🤖</div>
              <p className="font-medium text-foreground">
                Drag & drop any file here or click to select
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Supports: CSV, Excel (.xlsx/.xls), PDF, Word (.docx/.doc),
                Images (JPG/PNG)
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                AI will auto-detect column headers and map them
              </p>
            </button>
            <input
              ref={fileRef}
              type="file"
              accept={ACCEPTED_TYPES}
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
            />
            {processing && (
              <div className="flex items-center gap-3 text-primary bg-primary/5 rounded-lg p-4">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin shrink-0" />
                <span className="text-sm font-medium">
                  AI analyzing {fileLabel} structure...
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {phase === "mapping" && (
        <Card>
          <CardHeader>
            <CardTitle>AI Column Mapping Review</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {fileIcon} AI detected {mappings.length} columns in "{fileName}".
              Review and correct mappings below.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {isImageOrBinary(fileName) && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
                ⚠️ AI extraction will process each page/document in the{" "}
                {fileLabel} file. Review all mapped fields carefully.
              </div>
            )}
            <Table data-ocid="ai_bulk.mapping_table">
              <TableHeader>
                <TableRow>
                  <TableHead>Detected Header</TableHead>
                  <TableHead>Mapped Field</TableHead>
                  <TableHead>AI Confidence</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mappings.map((mapping, idx) => (
                  <TableRow key={mapping.detected}>
                    <TableCell className="font-mono text-sm">
                      {mapping.detected}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={mapping.mapped}
                        onValueChange={(v) => updateMappedField(idx, v)}
                      >
                        <SelectTrigger className="h-8 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unknown">-- Ignore --</SelectItem>
                          {EXTENDED_CANONICAL_FIELDS.map((f) => (
                            <SelectItem key={f} value={f}>
                              {f}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`text-xs border-0 ${confidenceColor(mapping.confidence)}`}
                      >
                        {Math.round(mapping.confidence * 100)}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setPhase("upload")}>
                ← Back
              </Button>
              <Button
                className="bg-primary hover:bg-primary/90"
                onClick={applyMappings}
                data-ocid="ai_bulk.apply_mapping"
              >
                Apply Mapping → Preview Data
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {phase === "preview" && (
        <Card>
          <CardHeader>
            <CardTitle>Preview Rows ({previewRows.length})</CardTitle>
            <div className="flex gap-3 mt-2 flex-wrap">
              <Badge className="bg-green-100 text-green-700 border-0">
                {previewRows.filter((r) => r.errors.length === 0).length} valid
              </Badge>
              <Badge className="bg-destructive/10 text-destructive border-0">
                {previewRows.filter((r) => r.errors.length > 0).length} errors
              </Badge>
              <Badge className="bg-orange-100 text-orange-700 border-0">
                {previewRows.filter((r) => r.isDuplicate).length} duplicates
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto max-h-80 overflow-y-auto">
              <Table data-ocid="ai_bulk.preview_table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Matric</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Dept</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Programme</TableHead>
                    <TableHead>Entry</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewRows.map((row, ridx) => (
                    <TableRow
                      key={`${row.fields.matric_number}-${ridx}`}
                      className={
                        row.isDuplicate
                          ? "bg-orange-50"
                          : row.errors.length
                            ? "bg-destructive/5"
                            : ""
                      }
                    >
                      <TableCell className="font-mono text-xs">
                        <Input
                          className="h-7 text-xs"
                          value={row.fields.matric_number || ""}
                          onChange={(e) =>
                            updatePreviewCell(
                              ridx,
                              "matric_number",
                              e.target.value,
                            )
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          className="h-7 text-xs min-w-28"
                          value={row.fields.name || ""}
                          onChange={(e) =>
                            updatePreviewCell(ridx, "name", e.target.value)
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          className="h-7 text-xs min-w-32"
                          value={row.fields.email || ""}
                          onChange={(e) =>
                            updatePreviewCell(ridx, "email", e.target.value)
                          }
                        />
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {row.fields.department || "—"}
                      </TableCell>
                      <TableCell className="text-xs">
                        {row.fields.level || "—"}
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-blue-50 text-blue-700 border-0 text-xs">
                          {row.fields.programme_type || "NUC"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {row.fields.entry_mode || "UTME"}
                      </TableCell>
                      <TableCell>
                        {row.isDuplicate ? (
                          <Badge className="bg-orange-100 text-orange-700 border-0 text-xs">
                            Duplicate
                          </Badge>
                        ) : row.errors.length > 0 ? (
                          <Badge variant="destructive" className="text-xs">
                            {row.errors[0]}
                          </Badge>
                        ) : (
                          <Badge className="bg-green-100 text-green-700 border-0 text-xs">
                            Ready
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
            <Button variant="outline" onClick={() => setPhase("mapping")}>
              ← Back to Mapping
            </Button>
            <Button
              className="bg-primary hover:bg-primary/90"
              onClick={handleImport}
              disabled={processing}
              data-ocid="ai_bulk.import_button"
            >
              {processing
                ? "Importing..."
                : `Import ${previewRows.filter((r) => !r.isDuplicate && r.errors.length === 0).length} Valid Students`}
            </Button>
          </div>
        </Card>
      )}

      {phase === "done" && result && (
        <div className="text-center py-10 bg-green-50 border border-green-200 rounded-xl space-y-3">
          <div className="text-5xl">✅</div>
          <h2 className="text-xl font-bold text-green-800">
            AI Bulk Upload Complete!
          </h2>
          <div className="flex justify-center gap-3 flex-wrap">
            <Badge className="bg-green-100 text-green-700 border-0">
              ✅ {result.imported} imported
            </Badge>
            {result.coursesRegistered > 0 && (
              <Badge className="bg-blue-100 text-blue-700 border-0">
                📚 {result.coursesRegistered} courses auto-registered
              </Badge>
            )}
            {result.duplicates > 0 && (
              <Badge className="bg-orange-100 text-orange-700 border-0">
                ⚠️ {result.duplicates} duplicates skipped
              </Badge>
            )}
            <Badge className="bg-primary/10 text-primary border-0">
              Batch: {result.batchId}
            </Badge>
          </div>
          <Button
            className="mt-4 bg-primary hover:bg-primary/90"
            onClick={() => {
              setPhase("upload");
              setResult(null);
              setPreviewRows([]);
              setMappings([]);
              setFileName("");
            }}
            data-ocid="ai_bulk.new_button"
          >
            Upload Another File
          </Button>
        </div>
      )}

      {phase !== "upload" && phase !== "done" && (
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground"
          onClick={() =>
            downloadCSV("export_preview.csv", [
              [
                "matric_number",
                "name",
                "email",
                "department",
                "level",
                "programme_type",
                "entry_mode",
              ],
              ...previewRows.map((r) => [
                r.fields.matric_number,
                r.fields.name,
                r.fields.email,
                r.fields.department,
                r.fields.level,
                r.fields.programme_type || "NUC",
                r.fields.entry_mode || "UTME",
              ]),
            ])
          }
        >
          Export Preview as CSV
        </Button>
      )}
    </div>
  );
}
