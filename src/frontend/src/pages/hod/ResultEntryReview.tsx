import { CheckCircle, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Textarea } from "../../components/ui/textarea";
import { useResultProcessing } from "../../contexts/ResultProcessingContext";
import { getLocalCourses, getLocalStudents } from "../../utils/sampleData";

export function ResultEntryReview() {
  const { examResults, setExamResults } = useResultProcessing();
  const courses = getLocalCourses();
  const students = getLocalStudents();
  const [rejectReason, setRejectReason] = useState<Record<string, string>>({});

  const submitted = examResults.filter((r) => r.status === "submitted");

  // Group by course+semester
  const groups: Record<string, typeof submitted> = {};
  for (const r of submitted) {
    const key = `${r.courseCode}__${r.semester}`;
    groups[key] = groups[key] ?? [];
    groups[key].push(r);
  }

  const approveGroup = (key: string) => {
    const [courseCode, semester] = key.split("__");
    setExamResults(
      examResults.map((r) =>
        r.courseCode === courseCode &&
        r.semester === semester &&
        r.status === "submitted"
          ? { ...r, status: "hod_approved" as const }
          : r,
      ),
    );
    toast.success(`Results for ${courseCode} approved`);
  };

  const rejectGroup = (key: string) => {
    const [courseCode, semester] = key.split("__");
    const reason = rejectReason[key] ?? "Needs correction";
    setExamResults(
      examResults.map((r) =>
        r.courseCode === courseCode &&
        r.semester === semester &&
        r.status === "submitted"
          ? { ...r, status: "rejected" as const }
          : r,
      ),
    );
    toast.error(`Results for ${courseCode} rejected: ${reason}`);
  };

  const gradeColors: Record<string, string> = {
    A: "bg-green-100 text-green-700",
    B: "bg-blue-100 text-blue-700",
    C: "bg-amber-100 text-amber-700",
    D: "bg-orange-100 text-orange-700",
    E: "bg-red-200 text-red-700",
    F: "bg-red-100 text-red-800",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Result Entry Review
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Review and approve or reject result submissions from lecturers.
        </p>
      </div>

      {Object.keys(groups).length === 0 && (
        <Card>
          <CardContent
            className="p-12 text-center text-slate-400"
            data-ocid="result-review.empty_state"
          >
            No pending result submissions at this time.
          </CardContent>
        </Card>
      )}

      {Object.entries(groups).map(([key, results], gi) => {
        const [courseCode, semester] = key.split("__");
        const course = courses.find((c) => c.code === courseCode);
        const passCount = results.filter((r) => r.grade !== "F").length;
        const passRate =
          results.length > 0
            ? Math.round((passCount / results.length) * 100)
            : 0;
        return (
          <Card key={key} data-ocid={`result-review.item.${gi + 1}`}>
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <CardTitle className="text-base">
                    {courseCode} – {course?.title ?? courseCode}
                  </CardTitle>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {semester} &bull; {results.length} students &bull; Pass
                    Rate: {passRate}%
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-amber-100 text-amber-700">
                    Pending Review
                  </Badge>
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => approveGroup(key)}
                    data-ocid={`result-review.confirm_button.${gi + 1}`}
                  >
                    <CheckCircle size={14} className="mr-1.5" /> Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-red-300 text-red-600 hover:bg-red-50"
                    onClick={() => rejectGroup(key)}
                    data-ocid={`result-review.delete_button.${gi + 1}`}
                  >
                    <XCircle size={14} className="mr-1.5" /> Reject
                  </Button>
                </div>
              </div>
              <Textarea
                className="mt-2 text-xs h-16"
                placeholder="Rejection reason (optional)..."
                value={rejectReason[key] ?? ""}
                onChange={(e) =>
                  setRejectReason((prev) => ({
                    ...prev,
                    [key]: e.target.value,
                  }))
                }
                data-ocid="result-review.textarea"
              />
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead className="bg-slate-50 border-b">
                    <tr>
                      {[
                        "Matric",
                        "Name",
                        "CA",
                        "Exam",
                        "Total",
                        "Grade",
                        "Remark",
                      ].map((h) => (
                        <th
                          key={h}
                          className="px-4 py-2 text-left text-xs font-semibold text-slate-500 uppercase"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((r, i) => {
                      const student = students.find(
                        (s) => s.matricNumber === r.studentMatric,
                      );
                      return (
                        <tr
                          key={r.id}
                          className="border-b last:border-0 hover:bg-slate-50"
                          data-ocid={`result-review.row.${i + 1}`}
                        >
                          <td className="px-4 py-2 text-xs font-mono text-blue-600">
                            {r.studentMatric}
                          </td>
                          <td className="px-4 py-2 text-sm">
                            {student?.name ?? r.studentMatric}
                          </td>
                          <td className="px-4 py-2 text-sm">
                            {(r as any).caScore ?? "–"}
                          </td>
                          <td className="px-4 py-2 text-sm">{r.examScore}</td>
                          <td className="px-4 py-2 text-sm font-bold">
                            {r.totalScore}
                          </td>
                          <td className="px-4 py-2">
                            <Badge
                              className={
                                gradeColors[r.grade] ??
                                "bg-slate-100 text-slate-700"
                              }
                            >
                              {r.grade}
                            </Badge>
                          </td>
                          <td className="px-4 py-2">
                            <span
                              className={`text-xs font-medium ${r.remark === "Pass" ? "text-green-600" : "text-red-600"}`}
                            >
                              {r.remark}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
