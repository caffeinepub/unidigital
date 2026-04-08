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
import { getLocalStudents, saveLocalStudents } from "../../utils/sampleData";

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
}

function confidenceColor(score: number): string {
  if (score >= 0.85) return "text-green-700 bg-green-50";
  if (score >= 0.65) return "text-amber-700 bg-amber-50";
  return "text-red-700 bg-red-50";
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

  const existingMatrics = getLocalStudents().map((s) => s.matricNumber);
  void existingMatrics;

  const handleFile = (file: File) => {
    setFileName(file.name);
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
        setMappings(detectedMappings);
        setProcessing(false);
        setPhase("mapping");
      }, 1200);
    };
    reader.readAsText(file);
  };

  const applyMappings = () => {
    const mappedHeaders = mappings.map((m) => m.mapped);
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

    void mappedHeaders;
    setPreviewRows(rows);
    setPhase("preview");
  };

  const handleImport = async () => {
    setProcessing(true);
    await new Promise((r) => setTimeout(r, 600));
    const batchId = generateBatchId();
    const students = getLocalStudents();
    let imported = 0;
    let dups = 0;

    for (const row of previewRows) {
      if (row.isDuplicate) {
        dups++;
        continue;
      }
      if (row.errors.some((e) => e !== "Duplicate")) continue;
      const matric = row.fields.matric_number;
      const student = {
        matricNumber: matric,
        name:
          row.fields.name ||
          `${row.fields.first_name || ""} ${row.fields.last_name || ""}`.trim(),
        email: (row.fields.email || "").toLowerCase(),
        level: row.fields.level || "100",
        department: row.fields.department || "",
        subCombination: row.fields.subject_combination || undefined,
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

    setResult({ imported, batchId, duplicates: dups });
    setProcessing(false);
    setPhase("done");
    toast.success(`${imported} students imported via AI Bulk Upload`);
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          AI Bulk Upload Registration
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Upload CSV/Excel files — AI detects and maps columns automatically
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
              className={`w-full border-2 border-dashed rounded-xl p-12 text-center transition-colors ${dragging ? "border-blue-400 bg-blue-50" : "border-slate-200 hover:border-blue-300"}`}
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
              <p className="font-medium text-slate-700">
                Drag & drop CSV/Excel file here or click to select
              </p>
              <p className="text-xs text-slate-400 mt-1">
                AI will auto-detect column headers and map them
              </p>
            </button>
            <input
              ref={fileRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
            />
            {processing && (
              <div className="flex items-center gap-3 text-blue-700 bg-blue-50 rounded-lg p-4">
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin shrink-0" />
                <span className="text-sm font-medium">
                  AI analyzing column structure...
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
            <p className="text-sm text-slate-500 mt-1">
              AI detected {mappings.length} columns in "{fileName}". Review and
              correct mappings below.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
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
                          {CANONICAL_FIELDS.map((f) => (
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
                className="bg-blue-600 hover:bg-blue-700"
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
              <Badge className="bg-red-100 text-red-700 border-0">
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
                            ? "bg-red-50"
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
                      <TableCell className="text-xs text-slate-600">
                        {row.fields.department || "—"}
                      </TableCell>
                      <TableCell className="text-xs">
                        {row.fields.level || "—"}
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
              className="bg-blue-600 hover:bg-blue-700"
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
            {result.duplicates > 0 && (
              <Badge className="bg-orange-100 text-orange-700 border-0">
                ⚠️ {result.duplicates} duplicates skipped
              </Badge>
            )}
            <Badge className="bg-blue-100 text-blue-700 border-0">
              Batch: {result.batchId}
            </Badge>
          </div>
          <Button
            className="mt-4 bg-blue-600 hover:bg-blue-700"
            onClick={() => {
              setPhase("upload");
              setResult(null);
              setPreviewRows([]);
              setMappings([]);
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
          className="text-slate-400"
          onClick={() =>
            downloadCSV("export_preview.csv", [
              ["matric_number", "name", "email", "department", "level"],
              ...previewRows.map((r) => [
                r.fields.matric_number,
                r.fields.name,
                r.fields.email,
                r.fields.department,
                r.fields.level,
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
