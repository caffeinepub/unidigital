import { Paperclip, Save } from "lucide-react";
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
import { useResultProcessing } from "../../contexts/ResultProcessingContext";
import { useActor } from "../../hooks/useActor";
import { useInternetIdentity } from "../../hooks/useInternetIdentity";
import {
  type CAScore,
  getLocalCourses,
  getLocalStudents,
} from "../../utils/sampleData";
import { useFileUpload } from "../../utils/useFileUpload";

export function CAEntry() {
  const { caScores, setCAScores } = useResultProcessing();
  const courses = getLocalCourses();
  const students = getLocalStudents();
  const [selectedCourse, setSelectedCourse] = useState("");
  const [scannerOpen, setScannerOpen] = useState(false);
  const [attachedDocs, setAttachedDocs] = useState<
    Record<string, { file: File; previewUrl: string }[]>
  >({});
  const [saving, setSaving] = useState(false);
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const { uploadFile } = useFileUpload();

  // Load existing scores from backend on mount / course change
  useEffect(() => {
    if (!actor || !selectedCourse) return;
    (actor as any)
      .listCAScoresByCourse(selectedCourse)
      .then((backendScores) => {
        if (backendScores.length === 0) return;
        const converted: CAScore[] = backendScores.map((bs) => ({
          id: bs.id,
          courseCode: bs.courseCode,
          studentMatric: bs.studentMatric,
          assignmentScore: Number(bs.assignmentScore),
          quizScore: Number(bs.quizScore),
          testScore: Number(bs.testScore),
          totalCA: Number(bs.totalCA),
        }));
        setCAScores(converted);
      })
      .catch(() => {}); // silently fallback to local
  }, [actor, selectedCourse, setCAScores]);

  const course = courses.find((c) => c.code === selectedCourse);
  const enrolledStudents = students;

  const getCA = (matric: string): CAScore | undefined =>
    caScores.find(
      (c) => c.courseCode === selectedCourse && c.studentMatric === matric,
    );

  const updateScore = (
    matric: string,
    field: keyof Pick<CAScore, "assignmentScore" | "quizScore" | "testScore">,
    val: number,
  ) => {
    const existing = getCA(matric);
    const assign =
      field === "assignmentScore" ? val : (existing?.assignmentScore ?? 0);
    const quiz = field === "quizScore" ? val : (existing?.quizScore ?? 0);
    const test = field === "testScore" ? val : (existing?.testScore ?? 0);
    const updated: CAScore = {
      id: existing?.id ?? `CA-${selectedCourse}-${matric}`,
      courseCode: selectedCourse,
      studentMatric: matric,
      assignmentScore: assign,
      quizScore: quiz,
      testScore: test,
      totalCA: Math.min(30, Math.round(((assign + quiz + test) / 3) * 3)),
    };
    const rest = caScores.filter(
      (c) => !(c.courseCode === selectedCourse && c.studentMatric === matric),
    );
    setCAScores([...rest, updated]);
  };

  const saveAll = async () => {
    setSaving(true);
    try {
      if (actor) {
        // Persist scores to backend
        const courseScores = caScores.filter(
          (c) => c.courseCode === selectedCourse,
        );
        await Promise.all(
          courseScores.map((ca) =>
            (actor as any).createCAScore({
              id: ca.id,
              courseCode: ca.courseCode,
              studentMatric: ca.studentMatric,
              assignmentScore: BigInt(ca.assignmentScore),
              quizScore: BigInt(ca.quizScore),
              testScore: BigInt(ca.testScore),
              attendanceScore: BigInt(0),
              totalCA: BigInt(ca.totalCA),
              semester: "2023/2024 First",
              session: "2023/2024",
              lecturerName: "Lecturer",
              createdAt: BigInt(Date.now()),
            }),
          ),
        );
      }
      toast.success("CA scores saved successfully");
    } catch (err) {
      console.error(err);
      toast.error("Scores saved locally (backend unavailable)");
    } finally {
      setSaving(false);
    }
  };

  const handleScanCapture = async (file: File, previewUrl: string) => {
    setScannerOpen(false);
    if (!actor) {
      toast.success("Score sheet attached (demo mode)");
      return;
    }
    try {
      const blobId = await uploadFile(file);
      const principal = identity?.getPrincipal().toString() ?? "anonymous";
      await (actor as any).createDocumentRecord({
        id: `DOC-CA-${Date.now()}`,
        title: `CA Score Sheet – ${selectedCourse} (${new Date().toLocaleDateString()})`,
        documentType: "ca-score",
        blobId,
        uploaderPrincipal: principal,
        uploaderName: "Lecturer",
        linkedRecordId: selectedCourse,
        linkedRecordType: "ca-score",
        uploadedAt: BigInt(Date.now()),
        notes: `Scanned score sheet for ${selectedCourse}`,
      });
      const key = selectedCourse;
      setAttachedDocs((prev) => ({
        ...prev,
        [key]: [...(prev[key] ?? []), { file, previewUrl }],
      }));
      toast.success("Score sheet attached and saved");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save document");
    }
  };

  const attachedCount = attachedDocs[selectedCourse]?.length ?? 0;

  const totals = enrolledStudents.map(
    (s) => getCA(s.matricNumber)?.totalCA ?? 0,
  );
  const avg = totals.length
    ? Math.round(totals.reduce((a, b) => a + b, 0) / totals.length)
    : 0;
  const highest = totals.length ? Math.max(...totals) : 0;
  const lowest = totals.length ? Math.min(...totals) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">CA Score Entry</h1>
        <p className="text-slate-500 text-sm mt-1">
          Enter continuous assessment scores for enrolled students.
        </p>
      </div>

      <div className="flex flex-wrap items-end gap-4">
        <div className="w-72">
          <Label>Select Course</Label>
          <Select value={selectedCourse} onValueChange={setSelectedCourse}>
            <SelectTrigger className="mt-1" data-ocid="ca.select">
              <SelectValue placeholder="Choose a course..." />
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
        {selectedCourse && (
          <>
            <Button
              onClick={saveAll}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700"
              data-ocid="ca.save_button"
            >
              {saving ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <Save size={16} className="mr-2" />
              )}
              {saving ? "Saving..." : "Save Scores"}
            </Button>
            <Button
              variant="outline"
              onClick={() => setScannerOpen(true)}
              data-ocid="ca.upload_button"
            >
              <Paperclip size={16} className="mr-2" />
              Attach Score Sheet
              {attachedCount > 0 && (
                <Badge className="ml-2 bg-blue-100 text-blue-700 border-0">
                  {attachedCount}
                </Badge>
              )}
            </Button>
          </>
        )}
      </div>

      {selectedCourse && (
        <>
          <div className="grid grid-cols-3 gap-4">
            {[
              {
                label: "Average CA",
                value: `${avg}/30`,
                color: "text-blue-600",
              },
              {
                label: "Highest CA",
                value: `${highest}/30`,
                color: "text-green-600",
              },
              {
                label: "Lowest CA",
                value: `${lowest}/30`,
                color: "text-red-600",
              },
            ].map((s) => (
              <Card key={s.label}>
                <CardContent className="p-4">
                  <p className="text-xs text-slate-500">{s.label}</p>
                  <p className={`text-2xl font-bold mt-1 ${s.color}`}>
                    {s.value}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {course?.title} – CA Scores
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px]">
                  <thead className="bg-slate-50 border-b">
                    <tr>
                      {[
                        "Matric",
                        "Name",
                        "Assignment (0-10)",
                        "Quiz (0-10)",
                        "Test (0-10)",
                        "CA Total (/30)",
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
                    {enrolledStudents.map((s, i) => {
                      const ca = getCA(s.matricNumber);
                      const total = ca?.totalCA ?? 0;
                      return (
                        <tr
                          key={s.matricNumber}
                          className="border-b last:border-0 hover:bg-slate-50"
                          data-ocid={`ca.item.${i + 1}`}
                        >
                          <td className="px-4 py-3 text-xs font-mono text-blue-600">
                            {s.matricNumber}
                          </td>
                          <td className="px-4 py-3 text-sm font-medium">
                            {s.name}
                          </td>
                          {(
                            [
                              "assignmentScore",
                              "quizScore",
                              "testScore",
                            ] as const
                          ).map((field) => (
                            <td key={field} className="px-4 py-3">
                              <Input
                                type="number"
                                min={0}
                                max={10}
                                className="w-20 h-8 text-sm"
                                value={ca?.[field] ?? 0}
                                onChange={(e) =>
                                  updateScore(
                                    s.matricNumber,
                                    field,
                                    Math.min(10, Math.max(0, +e.target.value)),
                                  )
                                }
                                data-ocid="ca.input"
                              />
                            </td>
                          ))}
                          <td className="px-4 py-3">
                            <Badge
                              className={
                                total >= 24
                                  ? "bg-green-100 text-green-700"
                                  : total >= 15
                                    ? "bg-blue-100 text-blue-700"
                                    : "bg-red-100 text-red-700"
                              }
                            >
                              {total}/30
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {!selectedCourse && (
        <Card>
          <CardContent
            className="p-12 text-center text-slate-400"
            data-ocid="ca.empty_state"
          >
            Select a course above to begin entering CA scores.
          </CardContent>
        </Card>
      )}

      <DocumentScanner
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onCapture={handleScanCapture}
        title="Attach CA Score Sheet"
      />
    </div>
  );
}
