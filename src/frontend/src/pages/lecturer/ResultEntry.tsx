import { useActor, useInternetIdentity } from "@caffeineai/core-infrastructure";
import {
  AlertTriangle,
  Download,
  FileText,
  Info,
  Paperclip,
  Printer,
  Save,
  Send,
  Upload,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { createActor } from "../../backend";
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
import { getInstitutionSettings } from "../../hooks/useInstitutionSettings";
import { parseCSV } from "../../utils/csvUtils";
import {
  type ExamResult,
  addScoreAuditLog,
  getLocalCourses,
  getLocalStudents,
} from "../../utils/sampleData";
import {
  type ScoreSheetStudent,
  computeGrade,
  downloadBlankTemplate,
  downloadFilledScoreSheet,
  gradeColorClass,
  printScoreSheet,
} from "../../utils/scoreSheetUtils";
import { useFileUpload } from "../../utils/useFileUpload";

const SEMESTERS = [
  "2023/2024 First",
  "2023/2024 Second",
  "2022/2023 First",
  "2022/2023 Second",
  "2024/2025 First",
  "2024/2025 Second",
];

interface SigState {
  lecturerName: string;
  hodName: string;
  deanName: string;
  moderatorName: string;
  lecturerDate: string;
  hodDate: string;
  deanDate: string;
  moderatorDate: string;
}

export function ResultEntry() {
  const { caScores, examResults, setExamResults, gradeConfig } =
    useResultProcessing();
  const courses = getLocalCourses();
  const students = getLocalStudents();
  const [selectedCourse, setSelectedCourse] = useState("");
  const [semester, setSemester] = useState("2023/2024 First");
  const [scannerOpen, setScannerOpen] = useState(false);
  const [attachedDocs, setAttachedDocs] = useState<Record<string, number>>({});
  const [showSig, setShowSig] = useState(false);
  const [sig, setSigState] = useState<SigState>({
    lecturerName: "",
    hodName: "",
    deanName: "",
    moderatorName: "",
    lecturerDate: "",
    hodDate: "",
    deanDate: "",
    moderatorDate: "",
  });

  const { actor } = useActor(createActor);
  const { identity } = useInternetIdentity();
  const { uploadFile } = useFileUpload();
  const uploadRef = useRef<HTMLInputElement>(null);
  const settings = getInstitutionSettings();
  const course = courses.find((c) => c.code === selectedCourse);

  useEffect(() => {
    if (!actor || !selectedCourse) return;
    (
      actor as unknown as {
        listResultsByCourse: (c: string) => Promise<unknown[]>;
      }
    )
      .listResultsByCourse(selectedCourse)
      .then((res) => {
        if (!Array.isArray(res) || res.length === 0) return;
        const converted: ExamResult[] = (res as Array<Record<string, unknown>>)
          .filter((br) => br.semester === semester)
          .map((br) => ({
            id: String(br.id),
            courseCode: String(br.courseCode),
            studentMatric: String(br.studentMatric),
            examScore: Number(br.examScore),
            totalScore: Number(br.totalScore),
            grade: String(br.grade),
            point: Number(br.gradePoints),
            remark: String(br.remark),
            semester: String(br.semester),
            session: String(br.session),
            status: String(br.status) as ExamResult["status"],
          }));
        setExamResults(converted);
      })
      .catch(() => {});
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
      remark: gradeEntry.remark === "Pass" ? "Pass" : "Fail",
      semester,
      session: semester.split(" ")[0] ?? "2023/2024",
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
        await Promise.all(
          draftResults.map(async (r) => {
            const ca = getCA(r.studentMatric);
            const id = await (
              actor as unknown as {
                createExamResult: (
                  d: Record<string, unknown>,
                ) => Promise<string>;
              }
            ).createExamResult({
              id: r.id,
              courseCode: r.courseCode,
              courseTitle: course?.title ?? r.courseCode,
              creditUnits: BigInt(course?.creditUnits ?? 3),
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
            await (
              actor as unknown as {
                submitResultForApproval: (id: string) => Promise<void>;
              }
            ).submitResultForApproval(id);
          }),
        );
      } catch (err) {
        console.error("Backend submit failed:", err);
      }
    }
    toast.success("Results submitted for HOD approval");
  };

  const handleDownloadTemplate = () => {
    if (!selectedCourse || !course) return;
    downloadBlankTemplate(
      {
        faculty: "Faculty of Education",
        department: course.department,
        courseTitle: course.title,
        courseCode: course.code,
        semester,
        session: semester.split(" ")[0] ?? "2023/2024",
      },
      students.map((s) => ({ name: s.name, matricNumber: s.matricNumber })),
      sig,
    );
    addScoreAuditLog({
      id: `AUDIT-${Date.now()}`,
      action: "download_template",
      courseCode: selectedCourse,
      semester,
      performedBy: identity?.getPrincipal().toString() ?? "Lecturer",
      recordCount: students.length,
      timestamp: new Date().toISOString(),
    });
    toast.success(`Blank template downloaded for ${students.length} students.`);
  };

  const handleDownloadFilled = () => {
    if (!selectedCourse || !course) return;
    const rows: ScoreSheetStudent[] = students.map((s, i) => {
      const result = getResult(s.matricNumber);
      const ca = getCA(s.matricNumber);
      const exam = result?.examScore ?? 0;
      const total = ca + exam;
      const { grade, remarks } = computeGrade(total);
      return {
        sn: i + 1,
        name: s.name,
        matricNumber: s.matricNumber,
        ca,
        exam,
        total,
        grade: result ? result.grade : grade,
        remarks: result ? result.remark : remarks,
      };
    });
    downloadFilledScoreSheet(
      {
        faculty: "Faculty of Education",
        department: course.department,
        courseTitle: course.title,
        courseCode: course.code,
        semester,
        session: semester.split(" ")[0] ?? "2023/2024",
      },
      rows,
      sig,
    );
    toast.success("Filled score sheet downloaded.");
  };

  const handlePrint = () => {
    if (!selectedCourse || !course) return;
    const rows: ScoreSheetStudent[] = students.map((s, i) => {
      const result = getResult(s.matricNumber);
      const ca = getCA(s.matricNumber);
      const exam = result?.examScore ?? 0;
      const total = ca + exam;
      const { grade, remarks } = computeGrade(total);
      return {
        sn: i + 1,
        name: s.name,
        matricNumber: s.matricNumber,
        ca: result ? ca : "–",
        exam: result ? exam : "–",
        total: result ? total : "–",
        grade: result ? result.grade : grade,
        remarks: result ? result.remark : remarks,
      };
    });
    printScoreSheet(
      {
        faculty: "Faculty of Education",
        department: course.department,
        courseTitle: course.title,
        courseCode: course.code,
        semester,
        session: semester.split(" ")[0] ?? "2023/2024",
      },
      rows,
      sig,
    );
  };

  const handleUploadCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedCourse) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const rows = parseCSV(text);
      const dataStart = rows.findIndex(
        (r) =>
          r[0]?.trim().toLowerCase() === "s/n" ||
          r[2]?.trim().toLowerCase() === "matric number",
      );
      const dataRows =
        dataStart >= 0 ? rows.slice(dataStart + 1) : rows.slice(1);
      let imported = 0;
      for (const row of dataRows) {
        const matric = row[2]?.trim();
        const examStr = row[4]?.trim();
        if (!matric || !examStr) continue;
        const exam = Number(examStr);
        if (Number.isNaN(exam)) continue;
        updateExamScore(matric, Math.min(60, Math.max(0, exam)));
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
      await (
        actor as unknown as {
          createDocumentRecord: (d: Record<string, unknown>) => Promise<void>;
        }
      ).createDocumentRecord({
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
  const hasDraft = examResults.some(
    (r) =>
      r.courseCode === selectedCourse &&
      r.semester === semester &&
      r.status === "draft",
  );
  const courseResults = selectedCourse
    ? students.map((s) => ({
        student: s,
        result: getResult(s.matricNumber),
        ca: getCA(s.matricNumber),
      }))
    : [];
  const missing = courseResults.filter(
    (cr) => !cr.result || cr.result.examScore === undefined,
  );

  const setSigField = (key: keyof SigState, value: string) =>
    setSigState((prev) => ({ ...prev, [key]: value }));

  const sigFields: [keyof SigState, string][] = [
    ["lecturerName", "Lecturer Name"],
    ["hodName", "HOD Name"],
    ["deanName", "Dean Name"],
    ["moderatorName", "Moderator Name"],
    ["lecturerDate", "Lecturer Date"],
    ["hodDate", "HOD Date"],
    ["deanDate", "Dean Date"],
    ["moderatorDate", "Moderator Date"],
  ];

  return (
    <div className="space-y-6">
      {!settings.toggles.resultEntryEnabled && (
        <div
          className="flex items-start gap-3 bg-amber-50 border border-amber-300 rounded-lg p-4 text-amber-800"
          data-ocid="results.info_banner"
        >
          <Info size={18} className="mt-0.5 flex-shrink-0 text-amber-600" />
          <div>
            <p className="font-semibold text-sm">Result Entry Disabled</p>
            <p className="text-sm mt-0.5">
              Result entry is currently disabled by the system administrator.
            </p>
          </div>
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold text-slate-800">Score Sheet Entry</h1>
        <p className="text-slate-500 text-sm mt-1">
          Enter CA (max 40) and Exam (max 60) scores — Total, Grade and Remarks
          auto-calculate.
        </p>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="w-72">
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
              {SEMESTERS.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {selectedCourse && (
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={handleDownloadTemplate}
            data-ocid="results.download_template_button"
          >
            <Download size={15} className="mr-1.5" /> Blank Template
          </Button>
          <Button
            variant="outline"
            onClick={handleDownloadFilled}
            data-ocid="results.download_filled_button"
          >
            <FileText size={15} className="mr-1.5" /> Download Score Sheet
          </Button>
          <Button
            variant="outline"
            onClick={handlePrint}
            data-ocid="results.print_button"
          >
            <Printer size={15} className="mr-1.5" /> Print Score Sheet
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowSig((v) => !v)}
            data-ocid="results.signatures_button"
          >
            <FileText size={15} className="mr-1.5" />{" "}
            {showSig ? "Hide" : "Edit"} Signatures
          </Button>
          <>
            <input
              ref={uploadRef}
              type="file"
              accept=".csv,.xlsx"
              className="hidden"
              onChange={handleUploadCSV}
            />
            <Button
              variant="outline"
              onClick={() => uploadRef.current?.click()}
              data-ocid="results.upload_button"
            >
              <Upload size={15} className="mr-1.5" /> Upload Score Sheet
            </Button>
          </>
          {hasDraft && (
            <Button
              onClick={submitForApproval}
              className="bg-blue-600 hover:bg-blue-700"
              data-ocid="results.submit_button"
            >
              <Send size={15} className="mr-1.5" /> Submit to HOD
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => setScannerOpen(true)}
            data-ocid="results.primary_button"
          >
            <Paperclip size={15} className="mr-1.5" />
            Attach Script
            {attachedCount > 0 && (
              <Badge className="ml-2 bg-amber-100 text-amber-700 border-0">
                {attachedCount}
              </Badge>
            )}
          </Button>
        </div>
      )}

      {showSig && selectedCourse && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">
              Signature Block (for download/print)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {sigFields.map(([key, lbl]) => (
                <div key={key}>
                  <Label className="text-xs">{lbl}</Label>
                  <Input
                    className="mt-1 h-8 text-xs"
                    value={sig[key]}
                    onChange={(e) => setSigField(key, e.target.value)}
                    placeholder={lbl}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {selectedCourse && missing.length > 0 && (
        <div
          className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg"
          data-ocid="results.error_state"
        >
          <AlertTriangle size={16} className="text-amber-600 flex-shrink-0" />
          <p className="text-sm text-amber-700">
            {missing.length} student(s) have no exam score yet.
          </p>
        </div>
      )}

      {selectedCourse && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {course?.code} – {course?.title}
              <span className="ml-3 text-xs font-normal text-slate-500">
                {semester}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="px-4 pt-3 pb-2 bg-slate-50 border-b text-center">
              <p className="font-bold text-sm uppercase">
                {settings.profile.name ||
                  "Federal University of Education Kontagora"}
              </p>
              <p className="text-xs text-slate-500">
                {[
                  settings.profile.address,
                  settings.profile.city,
                  settings.profile.state,
                ]
                  .filter(Boolean)
                  .join(", ") || "P.M.B. 1039, Kontagora, Niger State"}
              </p>
              <p className="text-xs mt-0.5">
                <span className="font-semibold">Dept:</span>{" "}
                {course?.department} &bull;{" "}
                <span className="font-semibold ml-2">Session:</span>{" "}
                {semester.split(" ")[0]}
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px]">
                <thead className="bg-slate-800 text-white">
                  <tr>
                    {[
                      "S/N",
                      "Student Name",
                      "Matric Number",
                      "CA (40)",
                      "Exam (60)",
                      "Total (100)",
                      "Grade",
                      "Remarks",
                      "Status",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {courseResults.map(({ student: s, result, ca }, i) => {
                    const exam = result?.examScore ?? 0;
                    const total = ca + exam;
                    const { grade: ag, remarks: ar } = computeGrade(total);
                    const displayGrade = result
                      ? result.grade
                      : exam > 0
                        ? ag
                        : "";
                    const displayRemarks = result
                      ? result.remark
                      : exam > 0
                        ? ar
                        : "";
                    const isEditable =
                      settings.toggles.resultEntryEnabled &&
                      (result?.status === "draft" ||
                        result?.status === undefined);
                    return (
                      <tr
                        key={s.matricNumber}
                        className="border-b last:border-0 hover:bg-slate-50"
                        data-ocid={`results.item.${i + 1}`}
                      >
                        <td className="px-3 py-2 text-sm text-slate-500">
                          {i + 1}
                        </td>
                        <td className="px-3 py-2 text-sm font-medium min-w-[150px]">
                          {s.name}
                        </td>
                        <td className="px-3 py-2 text-xs font-mono text-blue-600">
                          {s.matricNumber}
                        </td>
                        <td className="px-3 py-2">
                          <span className="text-sm font-semibold text-slate-700">
                            {ca}/40
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          <Input
                            type="number"
                            min={0}
                            max={60}
                            className="w-20 h-8 text-sm"
                            value={result?.examScore ?? ""}
                            placeholder="0-60"
                            onChange={(e) =>
                              updateExamScore(
                                s.matricNumber,
                                Math.min(60, Math.max(0, +e.target.value)),
                              )
                            }
                            disabled={!isEditable}
                            data-ocid="results.input"
                          />
                        </td>
                        <td className="px-3 py-2 text-sm font-bold">
                          {result ? `${total}/100` : "–"}
                        </td>
                        <td className="px-3 py-2">
                          {displayGrade ? (
                            <Badge
                              className={`${gradeColorClass(displayGrade)} border-0 font-bold`}
                            >
                              {displayGrade}
                            </Badge>
                          ) : (
                            <span className="text-slate-300">–</span>
                          )}
                        </td>
                        <td className="px-3 py-2">
                          <span
                            className={`text-xs font-semibold ${
                              displayRemarks === "Pass"
                                ? "text-green-600"
                                : displayRemarks === "Fail"
                                  ? "text-red-600"
                                  : "text-slate-400"
                            }`}
                          >
                            {displayRemarks || "–"}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          {result?.status && (
                            <Badge
                              variant="outline"
                              className="text-xs capitalize"
                            >
                              {result.status.replace(/_/g, " ")}
                            </Badge>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {courseResults.length > 0 && (
              <div className="px-4 py-3 bg-slate-50 border-t flex flex-wrap gap-4 text-sm">
                <span className="text-slate-600">
                  <strong>Total:</strong> {courseResults.length}
                </span>
                <span className="text-green-700">
                  <strong>Passed:</strong>{" "}
                  {
                    courseResults.filter((cr) => cr.result?.remark === "Pass")
                      .length
                  }
                </span>
                <span className="text-red-700">
                  <strong>Failed:</strong>{" "}
                  {
                    courseResults.filter((cr) => cr.result?.remark === "Fail")
                      .length
                  }
                </span>
                <span className="text-slate-500">
                  <strong>Pending:</strong> {missing.length}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {!selectedCourse && (
        <Card>
          <CardContent
            className="p-12 text-center text-slate-400"
            data-ocid="results.empty_state"
          >
            <FileText size={40} className="mx-auto mb-3 text-slate-300" />
            <p>Select a course to enter scores and manage the score sheet.</p>
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
