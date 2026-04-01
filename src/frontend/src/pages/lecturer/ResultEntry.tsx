import {
  AlertTriangle,
  Download,
  Info,
  Paperclip,
  Send,
  Upload,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { DocumentScanner } from "../../components/DocumentScanner";
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
  getGradeFromScore,
  useResultProcessing,
} from "../../contexts/ResultProcessingContext";
import { useActor } from "../../hooks/useActor";
import { getInstitutionSettings } from "../../hooks/useInstitutionSettings";
import { useInternetIdentity } from "../../hooks/useInternetIdentity";
import { downloadCSV, parseCSV } from "../../utils/csvUtils";
import {
  type ExamResult,
  addScoreAuditLog,
  getLocalCourses,
  getLocalStudents,
} from "../../utils/sampleData";
import { useFileUpload } from "../../utils/useFileUpload";

export function ResultEntry() {
  const { caScores, examResults, setExamResults, gradeConfig } =
    useResultProcessing();
  const courses = getLocalCourses();
  const students = getLocalStudents();
  const [selectedCourse, setSelectedCourse] = useState("");
  const [semester, setSemester] = useState("2023/2024 First");
  const [scannerOpen, setScannerOpen] = useState(false);
  const [attachedDocs, setAttachedDocs] = useState<Record<string, number>>({});
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const { uploadFile } = useFileUpload();
  const uploadRef = useRef<HTMLInputElement>(null);

  const settings = getInstitutionSettings();

  const course = courses.find((c) => c.code === selectedCourse);

  // Load existing results from backend on course/semester change
  useEffect(() => {
    if (!actor || !selectedCourse) return;
    (actor as any)
      .listResultsByCourse(selectedCourse)
      .then((backendResults: any[]) => {
        if (backendResults.length === 0) return;
        const converted: ExamResult[] = backendResults
          .filter((br) => br.semester === semester)
          .map((br) => ({
            id: br.id,
            courseCode: br.courseCode,
            studentMatric: br.studentMatric,
            examScore: Number(br.examScore),
            totalScore: Number(br.totalScore),
            grade: br.grade,
            point: Number(br.gradePoints),
            remark: br.remark,
            semester: br.semester,
            session: br.session,
            status: br.status as ExamResult["status"],
          }));
        setExamResults(converted);
      })
      .catch(() => {}); // silently fallback to local
  }, [actor, selectedCourse, semester, setExamResults]);

  const getCA = (matric: string) =>
    caScores.find(
      (c) => c.courseCode === selectedCourse && c.studentMatric === matric,
    )?.totalCA ?? 0;

  const getResult = (matric: string): ExamResult | undefined =>
    examResults.find(
      (r) =>
        r.courseCode === selectedCourse &&
        r.studentMatric === matric &&
        r.semester === semester,
    );

  const updateExamScore = (matric: string, examScore: number) => {
    const ca = getCA(matric);
    const total = Math.min(100, ca + examScore);
    const gradeEntry = getGradeFromScore(total, gradeConfig);
    const existing = getResult(matric);
    const updated: ExamResult = {
      id:
        existing?.id ??
        `EXAM-${selectedCourse}-${matric}-${semester.replace(/ /g, "_")}`,
      courseCode: selectedCourse,
      studentMatric: matric,
      examScore,
      totalScore: total,
      grade: gradeEntry.grade,
      point: gradeEntry.point,
      remark:
        gradeEntry.remark === "Pass"
          ? "Pass"
          : total < 40
            ? "Carryover"
            : "Fail",
      semester,
      session: "2023/2024",
      status: existing?.status ?? "draft",
    };
    const rest = examResults.filter(
      (r) =>
        !(
          r.courseCode === selectedCourse &&
          r.studentMatric === matric &&
          r.semester === semester
        ),
    );
    setExamResults([...rest, updated]);
  };

  const submitForApproval = async () => {
    const updatedLocal = examResults.map((r) =>
      r.courseCode === selectedCourse &&
      r.semester === semester &&
      r.status === "draft"
        ? {
            ...r,
            status: "submitted" as const,
            submittedAt: new Date().toISOString(),
          }
        : r,
    );
    setExamResults(updatedLocal);

    if (actor) {
      try {
        const draftResults = examResults.filter(
          (r) =>
            r.courseCode === selectedCourse &&
            r.semester === semester &&
            r.status === "draft",
        );
        const courseData = course;
        await Promise.all(
          draftResults.map(async (r) => {
            const ca = getCA(r.studentMatric);
            const id = await (actor as any).createExamResult({
              id: r.id,
              courseCode: r.courseCode,
              courseTitle: courseData?.title ?? r.courseCode,
              creditUnits: BigInt(courseData?.creditUnits ?? 3),
              studentMatric: r.studentMatric,
              examScore: BigInt(r.examScore),
              caScore: BigInt(ca),
              totalScore: BigInt(r.totalScore),
              grade: r.grade,
              gradePoints: BigInt(Math.round(r.point)),
              remark: r.remark,
              semester: r.semester,
              session: r.session,
              status: "submitted",
              approvalLevel: "lecturer",
              rejectionReason: "",
              createdAt: BigInt(Date.now()),
              updatedAt: BigInt(Date.now()),
            });
            await (actor as any).submitResultForApproval(id);
          }),
        );
      } catch (err) {
        console.error("Backend submit failed:", err);
      }
    }

    toast.success("Results submitted for HOD approval");
  };

  // ---- Download Template ----
  const handleDownloadTemplate = () => {
    if (!selectedCourse) return;
    const headers = [
      "Matric Number",
      "Student Name",
      "CA Score (/30)",
      "Exam Score (/70)",
      "Total",
      "Grade",
      "Notes",
    ];
    const rows = students.map((s) => {
      const ca = getCA(s.matricNumber);
      return [s.matricNumber, s.name, String(ca), "", "", "", ""];
    });
    const filename = `score-template-${selectedCourse}-${semester.replace(/ /g, "-")}.csv`;
    downloadCSV(filename, [headers, ...rows]);
    addScoreAuditLog({
      id: `AUDIT-${Date.now()}`,
      action: "download_template",
      courseCode: selectedCourse,
      semester,
      performedBy: identity?.getPrincipal().toString() ?? "Lecturer",
      recordCount: students.length,
      timestamp: new Date().toISOString(),
    });
    toast.success(`Template downloaded for ${students.length} students.`);
  };

  // ---- Upload Score Sheet ----
  const handleUploadCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedCourse) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const rows = parseCSV(text);
      const dataRows = rows.slice(1);
      let imported = 0;
      for (const row of dataRows) {
        const matric = row[0]?.trim();
        const examScoreStr = row[3]?.trim();
        if (!matric || !examScoreStr) continue;
        const examScore = Number.parseFloat(examScoreStr);
        if (Number.isNaN(examScore)) continue;
        updateExamScore(matric, Math.min(70, Math.max(0, examScore)));
        imported++;
      }
      addScoreAuditLog({
        id: `AUDIT-${Date.now()}`,
        action: "upload_scores",
        courseCode: selectedCourse,
        semester,
        performedBy: identity?.getPrincipal().toString() ?? "Lecturer",
        recordCount: imported,
        timestamp: new Date().toISOString(),
      });
      toast.success(`${imported} score(s) imported from CSV.`);
    };
    reader.readAsText(file);
    if (uploadRef.current) uploadRef.current.value = "";
  };

  const handleScanCapture = async (file: File, _previewUrl: string) => {
    setScannerOpen(false);
    if (!actor) {
      toast.success("Exam script attached (demo mode)");
      const key = `${selectedCourse}-${semester}`;
      setAttachedDocs((prev) => ({ ...prev, [key]: (prev[key] ?? 0) + 1 }));
      return;
    }
    try {
      const blobId = await uploadFile(file);
      const principal = identity?.getPrincipal().toString() ?? "anonymous";
      await (actor as any).createDocumentRecord({
        id: `DOC-EXAM-${Date.now()}`,
        title: `Exam Script – ${selectedCourse} (${semester})`,
        documentType: "exam-result",
        blobId,
        uploaderPrincipal: principal,
        uploaderName: "Lecturer",
        linkedRecordId: `${selectedCourse}-${semester}`,
        linkedRecordType: "exam-result",
        uploadedAt: BigInt(Date.now()),
        notes: `Scanned exam script for ${selectedCourse} ${semester}`,
      });
      const key = `${selectedCourse}-${semester}`;
      setAttachedDocs((prev) => ({ ...prev, [key]: (prev[key] ?? 0) + 1 }));
      toast.success("Exam script attached and saved");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save document");
    }
  };

  const attachedCount = attachedDocs[`${selectedCourse}-${semester}`] ?? 0;

  const missing = students.filter(
    (s) =>
      !getResult(s.matricNumber) ||
      getResult(s.matricNumber)?.examScore === undefined,
  );
  const courseResults = selectedCourse
    ? students.map((s) => ({
        student: s,
        result: getResult(s.matricNumber),
        ca: getCA(s.matricNumber),
      }))
    : [];

  const gradeColors: Record<string, string> = {
    A: "bg-green-100 text-green-700",
    B: "bg-blue-100 text-blue-700",
    C: "bg-amber-100 text-amber-700",
    D: "bg-orange-100 text-orange-700",
    E: "bg-red-200 text-red-700",
    F: "bg-red-100 text-red-800",
  };

  const hasDraft = examResults.some(
    (r) =>
      r.courseCode === selectedCourse &&
      r.semester === semester &&
      r.status === "draft",
  );

  return (
    <div className="space-y-6">
      {/* System-level result entry disabled banner */}
      {!settings.toggles.resultEntryEnabled && (
        <div
          className="flex items-start gap-3 bg-yellow-50 border border-yellow-300 rounded-lg p-4 text-yellow-800"
          data-ocid="results.info_banner"
        >
          <Info size={18} className="mt-0.5 flex-shrink-0 text-yellow-600" />
          <div>
            <p className="font-semibold text-sm">Result Entry Disabled</p>
            <p className="text-sm mt-0.5">
              Result entry is currently disabled by the system administrator.
              Please contact the Academic Office for assistance.
            </p>
          </div>
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold text-slate-800">Result Entry</h1>
        <p className="text-slate-500 text-sm mt-1">
          Enter exam scores. CA is auto-filled from CA Entry.
        </p>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="w-64">
          <Label>Course</Label>
          <Select value={selectedCourse} onValueChange={setSelectedCourse}>
            <SelectTrigger className="mt-1" data-ocid="results.select">
              <SelectValue placeholder="Choose course..." />
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
              {[
                "2023/2024 First",
                "2023/2024 Second",
                "2022/2023 First",
                "2022/2023 Second",
              ].map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {selectedCourse && (
          <>
            <Button
              variant="outline"
              onClick={handleDownloadTemplate}
              data-ocid="results.secondary_button"
            >
              <Download size={16} className="mr-2" /> Download Template
            </Button>
            <>
              <input
                ref={uploadRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleUploadCSV}
              />
              <Button
                variant="outline"
                onClick={() => uploadRef.current?.click()}
                data-ocid="results.upload_button"
              >
                <Upload size={16} className="mr-2" /> Upload Score Sheet
              </Button>
            </>
            {hasDraft && (
              <Button
                onClick={submitForApproval}
                className="bg-blue-600 hover:bg-blue-700"
                data-ocid="results.submit_button"
              >
                <Send size={16} className="mr-2" /> Submit for Approval
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => setScannerOpen(true)}
              data-ocid="results.primary_button"
            >
              <Paperclip size={16} className="mr-2" />
              Attach Script
              {attachedCount > 0 && (
                <Badge className="ml-2 bg-amber-100 text-amber-700 border-0">
                  {attachedCount}
                </Badge>
              )}
            </Button>
          </>
        )}
      </div>

      {selectedCourse && missing.length > 0 && (
        <div
          className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg"
          data-ocid="results.error_state"
        >
          <AlertTriangle size={16} className="text-amber-600" />
          <p className="text-sm text-amber-700">
            {missing.length} student(s) have no exam score yet.
          </p>
        </div>
      )}

      {selectedCourse && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {course?.title} – Result Sheet
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[750px]">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    {[
                      "Matric",
                      "Name",
                      "CA (/30)",
                      "Exam Score (/70)",
                      "Total (/100)",
                      "Grade",
                      "Remark",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {courseResults.map(({ student: s, result, ca }, i) => (
                    <tr
                      key={s.matricNumber}
                      className="border-b last:border-0 hover:bg-slate-50"
                      data-ocid={`results.item.${i + 1}`}
                    >
                      <td className="px-4 py-3 text-xs font-mono text-blue-600">
                        {s.matricNumber}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium">
                        {s.name}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-slate-600">
                        {ca}
                      </td>
                      <td className="px-4 py-3">
                        <Input
                          type="number"
                          min={0}
                          max={70}
                          className="w-20 h-8 text-sm"
                          value={result?.examScore ?? ""}
                          onChange={(e) =>
                            updateExamScore(
                              s.matricNumber,
                              Math.min(70, Math.max(0, +e.target.value)),
                            )
                          }
                          disabled={
                            !settings.toggles.resultEntryEnabled ||
                            (result?.status !== "draft" &&
                              result?.status !== undefined &&
                              result?.examScore !== undefined)
                          }
                          data-ocid="results.input"
                        />
                      </td>
                      <td className="px-4 py-3 text-sm font-bold">
                        {result?.totalScore ?? "–"}/100
                      </td>
                      <td className="px-4 py-3">
                        {result?.grade && (
                          <Badge
                            className={
                              gradeColors[result.grade] ??
                              "bg-slate-100 text-slate-700"
                            }
                          >
                            {result.grade}
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs font-medium ${
                            result?.remark === "Pass"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {result?.remark ?? "–"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {!selectedCourse && (
        <Card>
          <CardContent
            className="p-12 text-center text-slate-400"
            data-ocid="results.empty_state"
          >
            Select a course to enter exam results.
          </CardContent>
        </Card>
      )}

      <DocumentScanner
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onCapture={handleScanCapture}
        title="Attach Exam Script Scan"
      />
    </div>
  );
}
