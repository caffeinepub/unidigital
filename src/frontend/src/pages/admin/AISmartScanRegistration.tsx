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
import { useState } from "react";
import { toast } from "sonner";
import { DocumentScanner } from "../../components/DocumentScanner";
import { getCompulsoryCourses } from "../../utils/fuekCourseData";
import {
  DEPARTMENTS,
  INSTITUTION_CATEGORIES,
  LEVELS,
  addDocumentArchiveEntry,
  addRegistrationAuditLog,
  generateRegistrationId,
  normalizeMatric,
  normalizeName,
  simulateAIExtraction,
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

type Phase = "upload" | "extracting" | "review" | "done";

interface ExtractedField {
  value: string;
  confidence: number;
}

interface ExtractedForm {
  name: ExtractedField;
  matric_number: ExtractedField;
  email: ExtractedField;
  phone: ExtractedField;
  department: ExtractedField;
  level: ExtractedField;
  programme_type: ExtractedField;
  entry_mode: ExtractedField;
}

const PROGRAMME_TYPES = [
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
const ENTRY_MODES = ["UTME", "DE", "Direct"];

const ACCEPTED_ALL =
  "image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/plain";

function getFileTypeLabel(name: string): string {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (["jpg", "jpeg", "png", "gif", "bmp"].includes(ext)) return "Image";
  if (ext === "pdf") return "PDF";
  if (["doc", "docx"].includes(ext)) return "Word document";
  if (["xls", "xlsx"].includes(ext)) return "Excel spreadsheet";
  if (ext === "txt") return "Text file";
  return "Document";
}

function getFileTypeIcon(name: string): string {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (["jpg", "jpeg", "png", "gif", "bmp"].includes(ext)) return "🖼️";
  if (ext === "pdf") return "📄";
  if (["doc", "docx"].includes(ext)) return "📝";
  if (["xls", "xlsx"].includes(ext)) return "📊";
  return "📁";
}

function confidenceColor(score: number): string {
  if (score >= 0.9) return "bg-green-100 text-green-700";
  if (score >= 0.7) return "bg-amber-100 text-amber-700";
  return "bg-red-100 text-red-700";
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

export function AISmartScanRegistration() {
  const [phase, setPhase] = useState<Phase>("upload");
  const [scannerOpen, setScannerOpen] = useState(false);
  const [capturedUrl, setCapturedUrl] = useState<string>("");
  const [capturedFileName, setCapturedFileName] = useState<string>("");
  const [extracted, setExtracted] = useState<ExtractedForm | null>(null);
  const [editedFields, setEditedFields] = useState<Record<string, string>>({});
  const [corrections, setCorrections] = useState<
    Array<{
      field: string;
      original: string;
      suggested: string;
      reason: string;
    }>
  >([]);
  const [saving, setSaving] = useState(false);
  const [regId, setRegId] = useState<string>("");
  const [coursesRegistered, setCoursesRegistered] = useState(0);

  const isNonImage = (name: string) => {
    const ext = name.split(".").pop()?.toLowerCase() ?? "";
    return !["jpg", "jpeg", "png", "gif", "bmp"].includes(ext);
  };

  const handleCapture = (file: File, previewUrl: string) => {
    setCapturedUrl(previewUrl);
    setCapturedFileName(file.name || "scanned_document");
    setPhase("extracting");

    setTimeout(() => {
      const { fields, confidenceScores } = simulateAIExtraction(
        file.name || "doc",
      );
      const suggs = suggestCorrections(fields);
      setCorrections(suggs);

      // Simulate guessing programme type from document
      const guessedProgramme =
        PROGRAMME_TYPES[file.name.length % PROGRAMME_TYPES.length];
      const guessedEntryMode =
        file.name.charCodeAt(0) % 2 === 0 ? "UTME" : "DE";

      const form: ExtractedForm = {
        name: { value: fields.name, confidence: confidenceScores.name },
        matric_number: {
          value: fields.matric_number,
          confidence: confidenceScores.matric_number,
        },
        email: { value: fields.email, confidence: confidenceScores.email },
        phone: { value: fields.phone, confidence: confidenceScores.phone },
        department: {
          value: fields.department,
          confidence: confidenceScores.department,
        },
        level: { value: fields.level, confidence: confidenceScores.level },
        programme_type: {
          value: guessedProgramme,
          confidence: 0.72 + Math.random() * 0.2,
        },
        entry_mode: {
          value: guessedEntryMode,
          confidence: 0.68 + Math.random() * 0.25,
        },
      };
      setExtracted(form);
      setEditedFields({
        name: fields.name,
        matric_number: fields.matric_number,
        email: fields.email,
        phone: fields.phone,
        department: fields.department,
        level: fields.level,
        programme_type: guessedProgramme,
        entry_mode: guessedEntryMode,
      });
      setPhase("review");
    }, 1600);
  };

  const handleRetake = () => {
    setPhase("upload");
    setExtracted(null);
    setEditedFields({});
    setCorrections([]);
    setScannerOpen(true);
  };

  const handleSave = async () => {
    if (!extracted) return;

    // Basic validation
    if (!validateEmail(editedFields.email || "")) {
      toast.error("Please enter a valid email address");
      return;
    }

    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));

    const matric = normalizeMatric(editedFields.matric_number || "");
    const name = normalizeName(editedFields.name || "");
    const id = generateRegistrationId();
    const docId = `DOCARCH-${Date.now()}`;

    const student = {
      matricNumber: matric,
      name,
      email: (editedFields.email || "").toLowerCase().trim(),
      level: editedFields.level,
      department: editedFields.department,
      phone: editedFields.phone,
      programmeType: editedFields.programme_type,
      entryMode: editedFields.entry_mode,
      registrationSource: "ai_scan" as const,
      registrationStatus: "pending_approval" as const,
      registrationId: id,
      photoUrl: capturedUrl,
      registeredAt: new Date().toISOString(),
    };

    const students = getLocalStudents();
    if (!students.find((s) => s.matricNumber === matric)) {
      students.push(student);
      saveLocalStudents(students);
    }
    upsertExtendedStudent(student);

    addDocumentArchiveEntry({
      id: docId,
      studentMatric: matric,
      studentName: name,
      documentUrl: capturedUrl,
      sourceType: "ai_scan",
      documentType: "registration_scan",
      extractedData: editedFields,
      confidenceScores: Object.fromEntries(
        Object.entries(extracted).map(([k, v]) => [
          k,
          (v as ExtractedField).confidence,
        ]),
      ),
      uploadedAt: new Date().toISOString(),
      status: "extracted",
    });

    addRegistrationAuditLog({
      id: `AUDIT-${Date.now()}`,
      registrationId: id,
      studentMatric: matric,
      action: "ai_extracted",
      performedBy: "AI Scan",
      timestamp: new Date().toISOString(),
      newStatus: "pending_approval",
      aiCorrections: corrections.map((c) => ({
        field: c.field,
        original: c.original,
        corrected: c.suggested,
      })),
    });

    // Auto-register compulsory courses
    const compulsory = getCompulsoryCourses(
      editedFields.programme_type || "NUC",
      levelToNumber(editedFields.level || "100"),
    );
    const registrations = getLocalRegistrations();
    let registered = 0;
    for (const c of compulsory) {
      const exists = registrations.some(
        (r) => r.studentMatric === matric && r.courseCode === c.code,
      );
      if (!exists) {
        registrations.push({
          id: `REG-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          studentMatric: matric,
          courseCode: c.code,
          semester: c.semester === "Both" ? "First" : c.semester,
          registeredAt: new Date().toISOString(),
        });
        registered++;
      }
    }
    saveLocalRegistrations(registrations);
    setCoursesRegistered(registered);

    setRegId(id);
    setSaving(false);
    setPhase("done");
    toast.success(
      `Student registered via AI Scan! ${registered} courses auto-registered.`,
    );
  };

  const fieldLabels: Record<string, string> = {
    name: "Full Name",
    matric_number: "Matric Number",
    email: "Email Address",
    phone: "Phone Number",
    department: "Department",
    level: "Level",
    programme_type: "Programme Type",
    entry_mode: "Entry Mode",
  };

  const dropdownFields: Record<string, string[]> = {
    department: DEPARTMENTS,
    level: LEVELS,
    programme_type: PROGRAMME_TYPES,
    entry_mode: ENTRY_MODES,
    institutionCategory: INSTITUTION_CATEGORIES.map((c) => c.value),
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          AI Smart Scan Registration
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Scan or upload any registration document — AI extracts and pre-fills
          all data
        </p>
      </div>

      {phase === "upload" && (
        <Card>
          <CardHeader>
            <CardTitle>Scan or Upload Registration Document</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center py-10 border-2 border-dashed border-border rounded-xl">
              <div className="text-5xl mb-3">🤖</div>
              <p className="text-foreground font-medium">
                AI will extract registration data from your document
              </p>
              <p className="text-muted-foreground text-sm mt-1">
                Supports: Images (JPG/PNG), PDF, Word (.docx/.doc), Excel
                (.xlsx/.xls), Text files
              </p>
              <Button
                className="mt-5 bg-primary hover:bg-primary/90"
                onClick={() => setScannerOpen(true)}
                data-ocid="ai_scan.open_scanner"
              >
                📷 Open Camera / Upload Document
              </Button>
            </div>
            <div className="grid grid-cols-5 gap-2 text-center">
              {[
                { icon: "🖼️", label: "Images" },
                { icon: "📄", label: "PDF" },
                { icon: "📝", label: "Word" },
                { icon: "📊", label: "Excel" },
                { icon: "📃", label: "Text" },
              ].map((f) => (
                <div key={f.label} className="bg-muted/40 rounded-lg py-2 px-1">
                  <div className="text-xl">{f.icon}</div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {f.label}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {phase === "extracting" && (
        <Card>
          <CardHeader>
            <CardTitle>AI Extracting Data...</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center py-10 gap-4">
              <div className="w-14 h-14 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-foreground font-medium">
                Analyzing document with AI...
              </p>
              <p className="text-muted-foreground text-sm">
                Identifying fields and confidence scores
              </p>
              {capturedFileName && (
                <div className="flex items-center gap-2 bg-muted/40 rounded-lg px-4 py-2 text-sm">
                  <span className="text-xl">
                    {getFileTypeIcon(capturedFileName)}
                  </span>
                  <span className="font-medium">{capturedFileName}</span>
                  <Badge className="bg-blue-100 text-blue-700 border-0 text-xs">
                    {getFileTypeLabel(capturedFileName)}
                  </Badge>
                </div>
              )}
              {capturedUrl?.startsWith("data:image") && (
                <img
                  src={capturedUrl}
                  alt="Captured"
                  className="max-h-32 rounded-lg border shadow object-contain"
                />
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {phase === "review" && extracted && (
        <>
          {/* Non-image notice */}
          {capturedFileName && isNonImage(capturedFileName) && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
              ⚡ AI extraction simulated for{" "}
              {getFileTypeLabel(capturedFileName)}. Review extracted data
              carefully — confidence scores reflect simulation quality.
            </div>
          )}

          {/* AI corrections banner */}
          {corrections.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-amber-800 font-semibold text-sm mb-2">
                ⚡ AI Auto-Corrections Applied ({corrections.length})
              </p>
              {corrections.map((c) => (
                <div
                  key={c.field}
                  className="flex items-center gap-2 text-xs text-amber-700"
                >
                  <Badge className="bg-amber-100 text-amber-700 border-0 text-xs">
                    {c.field}
                  </Badge>
                  <span className="line-through text-red-500">
                    {c.original}
                  </span>{" "}
                  → <span className="text-green-700">{c.suggested}</span>
                  <span className="text-muted-foreground">({c.reason})</span>
                </div>
              ))}
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Review Extracted Data</CardTitle>
              <p className="text-sm text-muted-foreground">
                Verify and edit fields before saving. Confidence scores shown
                per field.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {capturedFileName && (
                <div className="flex gap-4 items-start bg-muted/30 rounded-lg p-3">
                  <span className="text-3xl">
                    {getFileTypeIcon(capturedFileName)}
                  </span>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      {getFileTypeLabel(capturedFileName)}
                    </p>
                    <p className="text-sm font-medium text-foreground truncate max-w-xs">
                      {capturedFileName}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={handleRetake}
                      data-ocid="ai_scan.retake"
                    >
                      🔄 Retake / Re-upload
                    </Button>
                  </div>
                  {capturedUrl?.startsWith("data:image") && (
                    <img
                      src={capturedUrl}
                      alt="Captured"
                      className="w-16 h-16 object-cover rounded border ml-auto shrink-0"
                    />
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 gap-4">
                {Object.entries(extracted).map(([key, field]) => {
                  const ef = field as ExtractedField;
                  const confPct = Math.round(ef.confidence * 100);
                  const isDropdown = key in dropdownFields;

                  return (
                    <div key={key} className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Label className="text-sm">
                          {fieldLabels[key] || key}
                        </Label>
                        <Badge
                          className={`text-xs border-0 ${confidenceColor(ef.confidence)}`}
                        >
                          {confPct}% confident
                        </Badge>
                      </div>
                      {isDropdown ? (
                        <Select
                          value={editedFields[key] || ""}
                          onValueChange={(v) =>
                            setEditedFields((f) => ({ ...f, [key]: v }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {dropdownFields[key].map((opt) => (
                              <SelectItem key={opt} value={opt}>
                                {opt}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          value={editedFields[key] || ""}
                          onChange={(e) =>
                            setEditedFields((f) => ({
                              ...f,
                              [key]: e.target.value,
                            }))
                          }
                          className={
                            ef.confidence < 0.7
                              ? "border-amber-300 focus:ring-amber-400"
                              : ""
                          }
                          data-ocid={`ai_scan.field.${key}`}
                        />
                      )}
                      {!isDropdown && ef.confidence < 0.7 && (
                        <p className="text-xs text-amber-600">
                          ⚠️ Low confidence — please verify this field
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={handleRetake}
                  data-ocid="ai_scan.rescan"
                >
                  🔄 Re-scan
                </Button>
                <Button
                  className="bg-green-600 hover:bg-green-700 flex-1"
                  onClick={handleSave}
                  disabled={saving}
                  data-ocid="ai_scan.save_button"
                >
                  {saving ? "Saving..." : "✅ Save Registration"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {phase === "done" && (
        <div className="text-center py-10 bg-green-50 border border-green-200 rounded-xl space-y-2">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-xl font-bold text-green-800">
            Scan Registration Complete!
          </h2>
          <p className="text-green-700">
            Registration ID:{" "}
            <span className="font-mono font-bold">{regId}</span>
          </p>
          <p className="text-sm text-green-600">
            Document archived • Pending Admin Approval
          </p>
          {coursesRegistered > 0 && (
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 mt-2">
              <span className="text-blue-700 text-sm font-medium">
                📚 {coursesRegistered} compulsory courses auto-registered
              </span>
            </div>
          )}
          <div>
            <Button
              className="mt-4 bg-primary hover:bg-primary/90"
              onClick={() => {
                setPhase("upload");
                setRegId("");
                setCapturedUrl("");
                setCapturedFileName("");
                setCoursesRegistered(0);
              }}
              data-ocid="ai_scan.new_button"
            >
              Scan Another Student
            </Button>
          </div>
        </div>
      )}

      <DocumentScanner
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onCapture={handleCapture}
        title="Scan Registration Document"
        acceptedTypes={ACCEPTED_ALL}
      />
    </div>
  );
}
