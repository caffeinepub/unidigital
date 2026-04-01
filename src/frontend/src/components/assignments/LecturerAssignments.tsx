import { PlusCircle } from "lucide-react";
import { useState } from "react";
import {
  type Assignment,
  useAssignments,
} from "../../contexts/AssignmentContext";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";

interface Props {
  lecturerId: string;
  courseCodes: string[];
}

export function LecturerAssignments({ lecturerId, courseCodes }: Props) {
  const { assignments, submissions, createAssignment, gradeSubmission } =
    useAssignments();
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] =
    useState<Assignment | null>(null);
  const [gradeDialogOpen, setGradeDialogOpen] = useState(false);
  const [gradingSubmissionId, setGradingSubmissionId] = useState<string | null>(
    null,
  );
  const [gradeVal, setGradeVal] = useState("");
  const [feedbackVal, setFeedbackVal] = useState("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    dueDate: "",
    courseCode: courseCodes[0] ?? "",
  });
  const [saving, setSaving] = useState(false);

  const myAssignments = assignments.filter((a) =>
    courseCodes.includes(a.courseCode),
  );

  const handleCreate = async () => {
    if (!form.title || !form.dueDate) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 400));
    createAssignment({
      id: `assign_${Date.now()}`,
      title: form.title,
      description: form.description,
      dueDate: new Date(form.dueDate).getTime(),
      courseCode: form.courseCode,
      createdByLecturerId: lecturerId,
    });
    setSaving(false);
    setCreateOpen(false);
    setForm({
      title: "",
      description: "",
      dueDate: "",
      courseCode: courseCodes[0] ?? "",
    });
  };

  const handleGrade = () => {
    if (!gradingSubmissionId || !gradeVal) return;
    gradeSubmission(gradingSubmissionId, gradeVal, feedbackVal);
    setGradeDialogOpen(false);
    setGradingSubmissionId(null);
    setGradeVal("");
    setFeedbackVal("");
  };

  const assignmentSubmissions = selectedAssignment
    ? submissions.filter((s) => s.assignmentId === selectedAssignment.id)
    : [];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Assignments</h1>
        <Button
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => setCreateOpen(true)}
        >
          <PlusCircle size={16} className="mr-2" /> Create Assignment
        </Button>
      </div>

      {myAssignments.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center text-slate-400">
            No assignments created yet.
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {myAssignments.map((a) => {
          const subCount = submissions.filter(
            (s) => s.assignmentId === a.id,
          ).length;
          return (
            <Card
              key={a.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setSelectedAssignment(a)}
            >
              <CardContent className="p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-semibold">{a.title}</h3>
                      <Badge className="bg-blue-100 text-blue-700 border-0">
                        {a.courseCode}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-500">
                      {a.description.slice(0, 100)}
                      {a.description.length > 100 ? "..." : ""}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Due: {new Date(a.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-lg font-bold text-blue-600">
                      {subCount}
                    </span>
                    <p className="text-xs text-slate-400">
                      submission{subCount !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Submissions Dialog */}
      <Dialog
        open={!!selectedAssignment}
        onOpenChange={(o) => {
          if (!o) setSelectedAssignment(null);
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedAssignment?.title} — Submissions</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
            {assignmentSubmissions.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-6">
                No submissions yet.
              </p>
            ) : (
              assignmentSubmissions.map((s) => (
                <Card key={s.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-sm">{s.studentName}</p>
                        <p className="text-xs text-slate-500">
                          {s.studentMatric}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          Submitted: {new Date(s.submittedAt).toLocaleString()}
                        </p>
                        <div className="flex gap-2 flex-wrap mt-2">
                          {s.fileNames.map((name, i) => (
                            <a
                              key={name}
                              href={s.fileUrls[i] || "#"}
                              download={name}
                              className="text-xs bg-slate-100 hover:bg-slate-200 text-blue-700 px-2 py-1 rounded"
                              onClick={(e) => {
                                if (!s.fileUrls[i]) e.preventDefault();
                              }}
                            >
                              📎 {name}
                            </a>
                          ))}
                        </div>
                        {s.grade && (
                          <p className="text-sm font-semibold text-green-700 mt-2">
                            Grade: {s.grade}{" "}
                            {s.feedback && (
                              <span className="font-normal text-slate-600">
                                — {s.feedback}
                              </span>
                            )}
                          </p>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setGradingSubmissionId(s.id);
                          setGradeVal(s.grade ?? "");
                          setFeedbackVal(s.feedback ?? "");
                          setGradeDialogOpen(true);
                        }}
                      >
                        {s.grade ? "Edit Grade" : "Grade"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Grade Dialog */}
      <Dialog open={gradeDialogOpen} onOpenChange={setGradeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Grade Submission</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Grade (e.g. A, B+, 85)</Label>
              <Input
                className="mt-1"
                value={gradeVal}
                onChange={(e) => setGradeVal(e.target.value)}
                placeholder="A"
              />
            </div>
            <div>
              <Label>Feedback (optional)</Label>
              <Textarea
                className="mt-1"
                value={feedbackVal}
                onChange={(e) => setFeedbackVal(e.target.value)}
                placeholder="Write feedback..."
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setGradeDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700"
                onClick={handleGrade}
                disabled={!gradeVal}
              >
                Save Grade
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Assignment Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Assignment</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Title</Label>
              <Input
                className="mt-1"
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                placeholder="Assignment title"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                className="mt-1"
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                rows={3}
                placeholder="Instructions..."
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Course</Label>
                <select
                  className="mt-1 w-full border rounded-md px-3 py-2 text-sm"
                  value={form.courseCode}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, courseCode: e.target.value }))
                  }
                >
                  {courseCodes.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Due Date</Label>
                <Input
                  className="mt-1"
                  type="date"
                  value={form.dueDate}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, dueDate: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700"
                onClick={handleCreate}
                disabled={!form.title || !form.dueDate || saving}
              >
                {saving ? "Creating..." : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
