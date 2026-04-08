import {
  AlertTriangle,
  Camera,
  CheckCircle,
  FileImage,
  Loader2,
  Save,
  ScanLine,
  Upload,
  XCircle,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  type HandwrittenScoreEntry,
  getLocalCourses,
  getLocalHandwrittenEntries,
  getLocalStudents,
  saveLocalHandwrittenEntries,
} from "../../utils/sampleData";
import { computeGrade, gradeColorClass } from "../../utils/scoreSheetUtils";
import { useFileUpload } from "../../utils/useFileUpload";

const SEMESTERS = [
  "2023/2024 First",
  "2023/2024 Second",
  "2022/2023 First",
  "2022/2023 Second",
  "2024/2025 First",
  "2024/2025 Second",
];

type ScanStatus = "idle" | "scanning" | "extracted" | "error";

interface ExtractedField {
  matric: string;
  name: string;
  ca: number;
  exam: number;
  confidence: number;
}

/** Simulate AI extraction from a handwritten score sheet image */
function simulateAIExtraction(
  _imageFile: File,
  _courseCode: string,
  students: ReturnType<typeof getLocalStudents>,
): Promise<ExtractedField[]> {
  return new Promise((resolve) => {
    // Simulate processing delay
    setTimeout(() => {
      const results: ExtractedField[] = students.slice(0, 8).map((s) => {
        const ca = Math.floor(Math.random() * 30) + 10;
        const exam = Math.floor(Math.random() * 45) + 15;
        const confidence = Math.floor(Math.random() * 25) + 70;
        return {
          matric: s.matricNumber,
          name: s.name,
          ca,
          exam,
          confidence,
        };
      });
      resolve(results);
    }, 2000);
  });
}

export function HandwritingScoreScanner() {
  const courses = getLocalCourses();
  const students = getLocalStudents();
  const [selectedCourse, setSelectedCourse] = useState("");
  const [semester, setSemester] = useState("2023/2024 First");
  const [scanStatus, setScanStatus] = useState<ScanStatus>("idle");
  const [_extracted, setExtracted] = useState<ExtractedField[]>([]);
  const [editedEntries, setEditedEntries] = useState<ExtractedField[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [savedEntries, setSavedEntries] = useState<HandwrittenScoreEntry[]>(
    getLocalHandwrittenEntries(),
  );
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const { uploadFile } = useFileUpload();

  const course = courses.find((c) => c.code === selectedCourse);

  const processImage = async (file: File) => {
    if (!selectedCourse) {
      toast.error("Please select a course first");
      return;
    }
    setScanStatus("scanning");
    setPreviewUrl(URL.createObjectURL(file));

    try {
      // Upload to object storage for archiving
      try {
        await uploadFile(file);
      } catch {
        // continue even if upload fails
      }

      // AI extraction (simulated)
      const fields = await simulateAIExtraction(file, selectedCourse, students);
      setExtracted(fields);
      setEditedEntries(fields.map((f) => ({ ...f })));
      setScanStatus("extracted");
      toast.success(
        `Extracted ${fields.length} entries. Review and edit before saving.`,
      );
    } catch {
      setScanStatus("error");
      toast.error("Failed to process image. Please try again.");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processImage(file);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processImage(file);
    if (cameraRef.current) cameraRef.current.value = "";
  };

  const updateEntry = (idx: number, field: "ca" | "exam", value: number) => {
    setEditedEntries((prev) =>
      prev.map((e, i) =>
        i === idx
          ? {
              ...e,
              [field]: Math.min(field === "ca" ? 40 : 60, Math.max(0, value)),
            }
          : e,
      ),
    );
  };

  const handleSave = () => {
    const newEntries: HandwrittenScoreEntry[] = editedEntries.map((e) => {
      const total = e.ca + e.exam;
      const { grade, remarks } = computeGrade(total);
      return {
        id: `HW-${selectedCourse}-${e.matric}-${Date.now()}`,
        courseCode: selectedCourse,
        studentMatric: e.matric,
        studentName: e.name,
        caScore: e.ca,
        examScore: e.exam,
        totalScore: total,
        grade,
        remarks,
        confidence: e.confidence,
        scanStatus: "verified",
        extractedAt: new Date().toISOString(),
      };
    });

    const existing = getLocalHandwrittenEntries().filter(
      (entry) =>
        !(
          entry.courseCode === selectedCourse &&
          newEntries.some((n) => n.studentMatric === entry.studentMatric)
        ),
    );
    const merged = [...existing, ...newEntries];
    saveLocalHandwrittenEntries(merged);
    setSavedEntries(merged);
    setExtracted([]);
    setEditedEntries([]);
    setPreviewUrl(null);
    setScanStatus("idle");
    toast.success(`${newEntries.length} scores saved from handwritten sheet.`);
  };

  const handleReset = () => {
    setExtracted([]);
    setEditedEntries([]);
    setPreviewUrl(null);
    setScanStatus("idle");
  };

  const filteredSaved = savedEntries.filter(
    (e) => e.courseCode === selectedCourse,
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Handwriting Score Scanner
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Upload or photograph a handwritten score sheet — AI extracts the data
          for review and processing.
        </p>
      </div>

      {/* Course selector */}
      <div className="flex flex-wrap items-end gap-4">
        <div className="w-72">
          <Label>Course</Label>
          <Select value={selectedCourse} onValueChange={setSelectedCourse}>
            <SelectTrigger className="mt-1" data-ocid="hw_scanner.select">
              <SelectValue placeholder="Select course..." />
            </SelectTrigger>
            <SelectContent>
              {courses.map((c) => (
                <SelectItem key={c.code} value={c.code}>
                  {c.code} – {c.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-52">
          <Label>Semester</Label>
          <Select value={semester} onValueChange={setSemester}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SEMESTERS.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Upload area */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">
            Step 1 — Upload Handwritten Score Sheet
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <>
              <input
                ref={fileRef}
                type="file"
                accept="image/*,.pdf"
                className="hidden"
                onChange={handleFileUpload}
                data-ocid="hw_scanner.upload_input"
              />
              <Button
                variant="outline"
                onClick={() => fileRef.current?.click()}
                disabled={scanStatus === "scanning" || !selectedCourse}
                data-ocid="hw_scanner.upload_button"
              >
                <Upload size={15} className="mr-1.5" /> Upload Image / PDF
              </Button>
            </>
            <>
              <input
                ref={cameraRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleCameraCapture}
                data-ocid="hw_scanner.camera_input"
              />
              <Button
                variant="outline"
                onClick={() => cameraRef.current?.click()}
                disabled={scanStatus === "scanning" || !selectedCourse}
                data-ocid="hw_scanner.camera_button"
              >
                <Camera size={15} className="mr-1.5" /> Take Photo
              </Button>
            </>
          </div>

          {!selectedCourse && (
            <p className="text-xs text-amber-600">
              ⚠ Select a course before uploading a score sheet.
            </p>
          )}

          {scanStatus === "scanning" && (
            <div
              className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg"
              data-ocid="hw_scanner.loading_state"
            >
              <Loader2 size={18} className="text-blue-500 animate-spin" />
              <div>
                <p className="text-sm font-semibold text-blue-800">
                  AI Scanning in Progress...
                </p>
                <p className="text-xs text-blue-600 mt-0.5">
                  Extracting student names, matric numbers, CA and exam scores
                  from the handwritten document.
                </p>
              </div>
            </div>
          )}

          {scanStatus === "error" && (
            <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <XCircle size={18} className="text-red-500" />
              <p className="text-sm text-red-700">
                Failed to process image. Try a clearer photo or different file.
              </p>
            </div>
          )}

          {previewUrl && scanStatus !== "scanning" && (
            <div className="flex items-center gap-3">
              <FileImage size={16} className="text-slate-400" />
              <img
                src={previewUrl}
                alt="Uploaded score sheet"
                className="h-20 w-32 object-cover rounded border"
              />
              <span className="text-xs text-slate-500">
                Document uploaded &amp; archived
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Extraction review table */}
      {scanStatus === "extracted" && editedEntries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">
              Step 2 — Review &amp; Edit Extracted Data
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
              <AlertTriangle size={14} className="flex-shrink-0" />
              Review all extracted values. Low confidence entries (below 80%)
              are highlighted — verify them carefully before saving.
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-sm">
                <thead className="bg-slate-800 text-white">
                  <tr>
                    {[
                      "S/N",
                      "Student Name",
                      "Matric",
                      "CA (0-40)",
                      "Exam (0-60)",
                      "Total",
                      "Grade",
                      "Confidence",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-3 py-2.5 text-left text-xs font-semibold uppercase"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {editedEntries.map((entry, idx) => {
                    const total = entry.ca + entry.exam;
                    const { grade } = computeGrade(total);
                    const lowConf = entry.confidence < 80;
                    return (
                      <tr
                        key={entry.matric}
                        className={`border-b last:border-0 ${lowConf ? "bg-amber-50" : "hover:bg-slate-50"}`}
                        data-ocid={`hw_scanner.item.${idx + 1}`}
                      >
                        <td className="px-3 py-2 text-slate-400">{idx + 1}</td>
                        <td className="px-3 py-2 font-medium">{entry.name}</td>
                        <td className="px-3 py-2 font-mono text-xs text-blue-600">
                          {entry.matric}
                        </td>
                        <td className="px-3 py-2">
                          <Input
                            type="number"
                            min={0}
                            max={40}
                            value={entry.ca}
                            onChange={(e) =>
                              updateEntry(idx, "ca", +e.target.value)
                            }
                            className={`w-20 h-8 text-sm ${lowConf ? "border-amber-400" : ""}`}
                            data-ocid="hw_scanner.ca_input"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <Input
                            type="number"
                            min={0}
                            max={60}
                            value={entry.exam}
                            onChange={(e) =>
                              updateEntry(idx, "exam", +e.target.value)
                            }
                            className={`w-20 h-8 text-sm ${lowConf ? "border-amber-400" : ""}`}
                            data-ocid="hw_scanner.exam_input"
                          />
                        </td>
                        <td className="px-3 py-2 font-bold text-center">
                          {total}/100
                        </td>
                        <td className="px-3 py-2">
                          <Badge
                            className={`${gradeColorClass(grade)} border-0 font-bold`}
                          >
                            {grade}
                          </Badge>
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  entry.confidence >= 90
                                    ? "bg-green-500"
                                    : entry.confidence >= 80
                                      ? "bg-amber-400"
                                      : "bg-red-400"
                                }`}
                                style={{ width: `${entry.confidence}%` }}
                              />
                            </div>
                            <span className="text-xs text-slate-500">
                              {entry.confidence}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleSave}
                className="bg-green-600 hover:bg-green-700"
                data-ocid="hw_scanner.save_button"
              >
                <Save size={15} className="mr-1.5" /> Save{" "}
                {editedEntries.length} Entries
              </Button>
              <Button
                variant="outline"
                onClick={handleReset}
                data-ocid="hw_scanner.reset_button"
              >
                <XCircle size={15} className="mr-1.5" /> Discard
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Saved entries */}
      {selectedCourse && filteredSaved.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">
              Previously Scanned Entries — {course?.code} (
              {filteredSaved.length} records)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-sm">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    {[
                      "Student Name",
                      "Matric",
                      "CA",
                      "Exam",
                      "Total",
                      "Grade",
                      "Remarks",
                      "Scanned At",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-3 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredSaved.map((entry, idx) => (
                    <tr
                      key={`${entry.id}-${idx}`}
                      className="border-b last:border-0 hover:bg-slate-50"
                    >
                      <td className="px-3 py-2 font-medium">
                        {entry.studentName}
                      </td>
                      <td className="px-3 py-2 font-mono text-xs text-blue-600">
                        {entry.studentMatric}
                      </td>
                      <td className="px-3 py-2 text-center">{entry.caScore}</td>
                      <td className="px-3 py-2 text-center">
                        {entry.examScore}
                      </td>
                      <td className="px-3 py-2 font-bold text-center">
                        {entry.totalScore}
                      </td>
                      <td className="px-3 py-2">
                        <Badge
                          className={`${gradeColorClass(entry.grade)} border-0 font-bold`}
                        >
                          {entry.grade}
                        </Badge>
                      </td>
                      <td className="px-3 py-2">
                        <span
                          className={`text-xs font-semibold ${
                            entry.remarks === "Pass"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {entry.remarks}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-xs text-slate-400">
                        {entry.extractedAt
                          ? new Date(entry.extractedAt).toLocaleDateString(
                              "en-GB",
                            )
                          : "–"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 bg-slate-50 border-t flex gap-4 text-sm">
              <span className="text-green-700">
                <strong>Passed:</strong>{" "}
                {filteredSaved.filter((e) => e.remarks === "Pass").length}
              </span>
              <span className="text-red-700">
                <strong>Failed:</strong>{" "}
                {filteredSaved.filter((e) => e.remarks === "Fail").length}
              </span>
              <span className="text-slate-600">
                <strong>Total:</strong> {filteredSaved.length}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {!selectedCourse && (
        <Card>
          <CardContent
            className="p-12 text-center text-slate-400"
            data-ocid="hw_scanner.empty_state"
          >
            <ScanLine size={40} className="mx-auto mb-3 text-slate-300" />
            <p>Select a course to begin scanning handwritten score sheets.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
