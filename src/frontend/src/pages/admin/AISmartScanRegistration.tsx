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
import { getLocalStudents, saveLocalStudents } from "../../utils/sampleData";

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
}

function confidenceColor(score: number): string {
  if (score >= 0.9) return "bg-green-100 text-green-700";
  if (score >= 0.7) return "bg-amber-100 text-amber-700";
  return "bg-red-100 text-red-700";
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

  const handleCapture = (file: File, previewUrl: string) => {
    setCapturedUrl(previewUrl);
    setCapturedFileName(file.name || "scanned_document.jpg");
    setPhase("extracting");
    // Simulate AI extraction
    setTimeout(() => {
      const { fields, confidenceScores } = simulateAIExtraction(
        file.name || "doc.jpg",
      );
      const suggs = suggestCorrections(fields);
      setCorrections(suggs);
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
      };
      setExtracted(form);
      setEditedFields({
        name: fields.name,
        matric_number: fields.matric_number,
        email: fields.email,
        phone: fields.phone,
        department: fields.department,
        level: fields.level,
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

    setRegId(id);
    setSaving(false);
    setPhase("done");
    toast.success("Student registered via AI Scan!");
  };

  const fieldLabels: Record<string, string> = {
    name: "Full Name",
    matric_number: "Matric Number",
    email: "Email Address",
    phone: "Phone Number",
    department: "Department",
    level: "Level",
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          AI Smart Scan Registration
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Scan or upload a student registration form — AI extracts and pre-fills
          the data
        </p>
      </div>

      {phase === "upload" && (
        <Card>
          <CardHeader>
            <CardTitle>Scan or Upload Registration Document</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-xl">
              <div className="text-5xl mb-3">🤖</div>
              <p className="text-slate-600 font-medium">
                AI will extract registration data from your document
              </p>
              <p className="text-slate-400 text-sm mt-1">
                Supports JPG, PNG, PDF
              </p>
              <Button
                className="mt-5 bg-blue-600 hover:bg-blue-700"
                onClick={() => setScannerOpen(true)}
                data-ocid="ai_scan.open_scanner"
              >
                📷 Open Camera / Upload Document
              </Button>
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
              <div className="w-14 h-14 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-slate-600 font-medium">
                Analyzing document with AI...
              </p>
              <p className="text-slate-400 text-sm">
                Identifying fields and confidence scores
              </p>
              {capturedUrl && (
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
                  <span className="text-slate-400">({c.reason})</span>
                </div>
              ))}
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Review Extracted Data</CardTitle>
              <p className="text-sm text-slate-500">
                Verify and edit fields before saving. Confidence scores shown
                per field.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {capturedUrl && (
                <div className="flex gap-4 items-start">
                  <img
                    src={capturedUrl}
                    alt="Captured"
                    className="w-20 h-20 object-cover rounded-lg border"
                  />
                  <div>
                    <p className="text-xs text-slate-400">Scanned document</p>
                    <p className="text-sm font-medium text-slate-700 truncate max-w-xs">
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
                </div>
              )}
              <div className="grid grid-cols-1 gap-4">
                {Object.entries(extracted).map(([key, field]) => {
                  const ef = field as ExtractedField;
                  const confPct = Math.round(ef.confidence * 100);
                  const isDropdown = key === "department" || key === "level";
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
                      {key === "department" ? (
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
                            {DEPARTMENTS.map((d) => (
                              <SelectItem key={d} value={d}>
                                {d}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : key === "level" ? (
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
                            {LEVELS.map((l) => (
                              <SelectItem key={l} value={l}>
                                {l}
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
                          className={`${ef.confidence < 0.7 ? "border-amber-300 focus:ring-amber-400" : ""}`}
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
        <div className="text-center py-10 bg-green-50 border border-green-200 rounded-xl">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-xl font-bold text-green-800">
            Scan Registration Complete!
          </h2>
          <p className="text-green-700 mt-2">
            Registration ID:{" "}
            <span className="font-mono font-bold">{regId}</span>
          </p>
          <p className="text-sm text-green-600 mt-1">
            Document archived • Pending Admin Approval
          </p>
          <Button
            className="mt-6 bg-blue-600 hover:bg-blue-700"
            onClick={() => {
              setPhase("upload");
              setRegId("");
              setCapturedUrl("");
            }}
            data-ocid="ai_scan.new_button"
          >
            Scan Another Student
          </Button>
        </div>
      )}

      <DocumentScanner
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onCapture={handleCapture}
        title="Scan Registration Document"
        acceptedTypes="image/*,application/pdf"
      />
    </div>
  );
}
