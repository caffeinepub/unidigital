import { BookOpen, Edit2, List, Plus, Trash2, Users } from "lucide-react";
import { useState } from "react";
import {
  type AnswerKey,
  type Exam,
  type Question,
  useCBT,
} from "../../contexts/CBTContext";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

const statusColor: Record<Exam["status"], string> = {
  draft: "bg-slate-100 text-slate-600",
  active: "bg-green-100 text-green-700",
  closed: "bg-red-100 text-red-700",
};

const emptyQForm = () => ({
  text: "",
  A: "",
  B: "",
  C: "",
  D: "",
  correct: "A" as AnswerKey,
  marks: 10,
});

export function LecturerCBT({ courseCodes }: { courseCodes: string[] }) {
  const {
    exams,
    submissions,
    createExam,
    addQuestion,
    editQuestion,
    deleteQuestion,
    setStatus,
  } = useCBT();

  const [createDialog, setCreateDialog] = useState(false);
  const [addQDialog, setAddQDialog] = useState(false);
  const [resultsExamId, setResultsExamId] = useState<string | null>(null);
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);

  // Question bank view
  const [questionBankExamId, setQuestionBankExamId] = useState<string | null>(
    null,
  );
  // Edit question dialog
  const [editQDialog, setEditQDialog] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(
    null,
  );
  const [editQForm, setEditQForm] = useState(emptyQForm());

  const [examForm, setExamForm] = useState({
    title: "",
    courseCode: "",
    duration: 30,
  });
  const [qForm, setQForm] = useState(emptyQForm());

  const myExams = exams.filter(
    (e) => courseCodes.includes(e.courseCode) || courseCodes.length === 0,
  );

  const handleCreateExam = () => {
    const exam: Exam = {
      id: `exam${Date.now()}`,
      title: examForm.title,
      courseCode: examForm.courseCode,
      duration: examForm.duration,
      totalMarks: 0,
      status: "draft",
      questions: [],
      resitEligible: true,
      passThreshold: 50,
    };
    createExam(exam);
    setCreateDialog(false);
    setExamForm({ title: "", courseCode: "", duration: 30 });
  };

  const handleAddQuestion = () => {
    if (!selectedExamId) return;
    const q: Question = {
      id: `q${Date.now()}`,
      text: qForm.text,
      options: { A: qForm.A, B: qForm.B, C: qForm.C, D: qForm.D },
      correct: qForm.correct,
      marks: qForm.marks,
      difficulty: "medium",
      topic: "General",
    };
    addQuestion(selectedExamId, q);
    setAddQDialog(false);
    setQForm(emptyQForm());
  };

  const handleOpenEditQ = (examId: string, q: Question) => {
    setSelectedExamId(examId);
    setEditingQuestionId(q.id);
    setEditQForm({
      text: q.text,
      A: q.options.A,
      B: q.options.B,
      C: q.options.C,
      D: q.options.D,
      correct: q.correct,
      marks: q.marks,
    });
    setEditQDialog(true);
  };

  const handleSaveEditQ = () => {
    if (!selectedExamId || !editingQuestionId) return;
    const updated: Question = {
      id: editingQuestionId,
      text: editQForm.text,
      options: {
        A: editQForm.A,
        B: editQForm.B,
        C: editQForm.C,
        D: editQForm.D,
      },
      correct: editQForm.correct,
      marks: editQForm.marks,
      difficulty: "medium",
      topic: "General",
    };
    editQuestion(selectedExamId, editingQuestionId, updated);
    setEditQDialog(false);
    setEditingQuestionId(null);
    setEditQForm(emptyQForm());
  };

  const handleDeleteQ = (
    examId: string,
    questionId: string,
    questionText: string,
  ) => {
    if (
      window.confirm(
        `Delete this question?\n\n"${questionText.slice(0, 80)}..."\n\nThis cannot be undone.`,
      )
    ) {
      deleteQuestion(examId, questionId);
    }
  };

  const resultsExam = resultsExamId
    ? exams.find((e) => e.id === resultsExamId)
    : null;
  const examSubmissions = resultsExamId
    ? submissions.filter((s) => s.examId === resultsExamId)
    : [];

  // --- Question Bank View ---
  if (questionBankExamId) {
    const qbExam = exams.find((e) => e.id === questionBankExamId);
    if (!qbExam) {
      setQuestionBankExamId(null);
      return null;
    }
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setQuestionBankExamId(null)}
            data-ocid="cbt.secondary_button"
          >
            ← Back to Exams
          </Button>
          <div>
            <h2 className="text-xl font-bold text-slate-800">{qbExam.title}</h2>
            <p className="text-sm text-slate-500">
              {qbExam.courseCode} &bull; {qbExam.questions.length} questions
              &bull; {qbExam.totalMarks} total marks
            </p>
          </div>
          <div className="ml-auto flex gap-2">
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => {
                setSelectedExamId(qbExam.id);
                setAddQDialog(true);
              }}
              data-ocid="cbt.open_modal_button"
            >
              <Plus size={14} className="mr-1" /> Add Question
            </Button>
          </div>
        </div>

        {qbExam.questions.length === 0 ? (
          <Card>
            <CardContent
              className="p-8 text-center text-slate-400"
              data-ocid="cbt.empty_state"
            >
              <BookOpen size={36} className="mx-auto text-slate-300 mb-3" />
              No questions yet. Add questions to this exam.
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Question Bank ({qbExam.questions.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-8">#</TableHead>
                      <TableHead>Question</TableHead>
                      <TableHead>Options (A/B/C/D)</TableHead>
                      <TableHead>Correct</TableHead>
                      <TableHead>Marks</TableHead>
                      <TableHead className="w-28">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {qbExam.questions.map((q, idx) => (
                      <TableRow key={q.id} data-ocid={`cbt.item.${idx + 1}`}>
                        <TableCell className="text-slate-400 text-xs">
                          {idx + 1}
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <p className="text-sm font-medium text-slate-800 line-clamp-2">
                            {q.text}
                          </p>
                        </TableCell>
                        <TableCell>
                          <div className="text-xs text-slate-500 space-y-0.5">
                            <p>
                              <span className="font-bold text-slate-700">
                                A:
                              </span>{" "}
                              {q.options.A}
                            </p>
                            <p>
                              <span className="font-bold text-slate-700">
                                B:
                              </span>{" "}
                              {q.options.B}
                            </p>
                            <p>
                              <span className="font-bold text-slate-700">
                                C:
                              </span>{" "}
                              {q.options.C}
                            </p>
                            <p>
                              <span className="font-bold text-slate-700">
                                D:
                              </span>{" "}
                              {q.options.D}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-green-100 text-green-700 border-0 font-bold">
                            {q.correct}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="font-semibold text-blue-700">
                            {q.marks}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 px-2"
                              onClick={() => handleOpenEditQ(qbExam.id, q)}
                              data-ocid={`cbt.edit_button.${idx + 1}`}
                            >
                              <Edit2 size={12} className="mr-1" /> Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="h-7 px-2"
                              onClick={() =>
                                handleDeleteQ(qbExam.id, q.id, q.text)
                              }
                              data-ocid={`cbt.delete_button.${idx + 1}`}
                            >
                              <Trash2 size={12} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Add Question Dialog (shared) */}
        <Dialog open={addQDialog} onOpenChange={setAddQDialog}>
          <DialogContent className="max-w-lg" data-ocid="cbt.dialog">
            <DialogHeader>
              <DialogTitle>Add MCQ Question</DialogTitle>
            </DialogHeader>
            <QuestionForm form={qForm} setForm={setQForm} />
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setAddQDialog(false)}
                data-ocid="cbt.cancel_button"
              >
                Cancel
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700"
                onClick={handleAddQuestion}
                disabled={!qForm.text}
                data-ocid="cbt.submit_button"
              >
                Add Question
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Question Dialog */}
        <Dialog open={editQDialog} onOpenChange={setEditQDialog}>
          <DialogContent className="max-w-lg" data-ocid="cbt.dialog">
            <DialogHeader>
              <DialogTitle>Edit Question</DialogTitle>
            </DialogHeader>
            <QuestionForm form={editQForm} setForm={setEditQForm} />
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setEditQDialog(false)}
                data-ocid="cbt.cancel_button"
              >
                Cancel
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700"
                onClick={handleSaveEditQ}
                disabled={!editQForm.text}
                data-ocid="cbt.save_button"
              >
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // --- Results View ---
  if (resultsExam) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setResultsExamId(null)}
          >
            ← Back
          </Button>
          <h2 className="text-xl font-bold text-slate-800">
            {resultsExam.title} — Results
          </h2>
        </div>
        {examSubmissions.length === 0 ? (
          <Card>
            <CardContent
              className="p-8 text-center text-slate-400"
              data-ocid="cbt.empty_state"
            >
              No submissions yet.
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Percentage</TableHead>
                      <TableHead>Time Taken</TableHead>
                      <TableHead>Submitted</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {examSubmissions.map((s, i) => {
                      const pct = Math.round((s.score / s.totalMarks) * 100);
                      const mins = Math.floor(s.timeTaken / 60);
                      const secs = s.timeTaken % 60;
                      return (
                        <TableRow
                          key={`${s.studentId}-${i}`}
                          data-ocid={`cbt.item.${i + 1}`}
                        >
                          <TableCell className="font-medium">
                            {s.studentName}{" "}
                            <span className="text-slate-400 text-xs">
                              ({s.studentId})
                            </span>
                          </TableCell>
                          <TableCell>
                            {s.score} / {s.totalMarks}
                          </TableCell>
                          <TableCell>
                            <span
                              className={`px-2 py-0.5 rounded text-xs font-bold ${
                                pct >= 70
                                  ? "bg-green-100 text-green-700"
                                  : pct >= 50
                                    ? "bg-amber-100 text-amber-700"
                                    : "bg-red-100 text-red-700"
                              }`}
                            >
                              {pct}%
                            </span>
                          </TableCell>
                          <TableCell className="text-slate-500">
                            {mins}m {secs}s
                          </TableCell>
                          <TableCell className="text-slate-500">
                            {s.submittedAt.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // --- Main Exam List ---
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">CBT Exams</h1>
          <p className="text-slate-500 text-sm">
            Create and manage computer-based tests
          </p>
        </div>
        <Button
          onClick={() => setCreateDialog(true)}
          className="bg-blue-600 hover:bg-blue-700"
          data-ocid="cbt.open_modal_button"
        >
          <Plus size={16} className="mr-1" /> Create Exam
        </Button>
      </div>

      {myExams.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center" data-ocid="cbt.empty_state">
            <BookOpen size={40} className="mx-auto text-slate-300 mb-3" />
            <p className="text-slate-400">
              No exams created yet. Create your first CBT exam.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {myExams.map((exam, i) => (
            <Card key={exam.id} data-ocid={`cbt.item.${i + 1}`}>
              <CardContent className="p-4">
                <div className="flex flex-wrap gap-3 items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-slate-800">
                        {exam.title}
                      </h3>
                      <Badge className={`border-0 ${statusColor[exam.status]}`}>
                        {exam.status}
                      </Badge>
                      {/* Question count badge */}
                      <Badge className="bg-blue-50 text-blue-600 border-blue-200">
                        {exam.questions.length} Q
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-500">
                      {exam.courseCode} &bull; {exam.duration} mins &bull;{" "}
                      {exam.totalMarks} marks
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {/* Questions / Question Bank button */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setQuestionBankExamId(exam.id)}
                      data-ocid={`cbt.tab.${i + 1}`}
                    >
                      <List size={14} className="mr-1" /> Questions (
                      {exam.questions.length})
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedExamId(exam.id);
                        setAddQDialog(true);
                      }}
                      data-ocid={`cbt.edit_button.${i + 1}`}
                    >
                      <Plus size={14} className="mr-1" /> Add Question
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setResultsExamId(exam.id)}
                      data-ocid={`cbt.secondary_button.${i + 1}`}
                    >
                      <Users size={14} className="mr-1" /> Results (
                      {submissions.filter((s) => s.examId === exam.id).length})
                    </Button>
                    {exam.status === "draft" && (
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => setStatus(exam.id, "active")}
                        data-ocid={`cbt.primary_button.${i + 1}`}
                      >
                        Activate
                      </Button>
                    )}
                    {exam.status === "active" && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => setStatus(exam.id, "closed")}
                        data-ocid={`cbt.delete_button.${i + 1}`}
                      >
                        Close Exam
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Exam Dialog */}
      <Dialog open={createDialog} onOpenChange={setCreateDialog}>
        <DialogContent data-ocid="cbt.dialog">
          <DialogHeader>
            <DialogTitle>Create New Exam</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Exam Title</Label>
              <Input
                className="mt-1"
                placeholder="e.g. CSC 101 Mid-Term Exam"
                value={examForm.title}
                onChange={(e) =>
                  setExamForm((f) => ({ ...f, title: e.target.value }))
                }
                data-ocid="cbt.input"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Course Code</Label>
                {courseCodes.length > 0 ? (
                  <Select
                    value={examForm.courseCode}
                    onValueChange={(v) =>
                      setExamForm((f) => ({ ...f, courseCode: v }))
                    }
                  >
                    <SelectTrigger className="mt-1" data-ocid="cbt.select">
                      <SelectValue placeholder="Select course" />
                    </SelectTrigger>
                    <SelectContent>
                      {courseCodes.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    className="mt-1"
                    placeholder="CSC101"
                    value={examForm.courseCode}
                    onChange={(e) =>
                      setExamForm((f) => ({ ...f, courseCode: e.target.value }))
                    }
                  />
                )}
              </div>
              <div>
                <Label>Duration (minutes)</Label>
                <Input
                  className="mt-1"
                  type="number"
                  min={5}
                  value={examForm.duration}
                  onChange={(e) =>
                    setExamForm((f) => ({ ...f, duration: +e.target.value }))
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreateDialog(false)}
              data-ocid="cbt.cancel_button"
            >
              Cancel
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={handleCreateExam}
              disabled={!examForm.title || !examForm.courseCode}
              data-ocid="cbt.submit_button"
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Question Dialog */}
      <Dialog open={addQDialog} onOpenChange={setAddQDialog}>
        <DialogContent className="max-w-lg" data-ocid="cbt.dialog">
          <DialogHeader>
            <DialogTitle>Add MCQ Question</DialogTitle>
          </DialogHeader>
          <QuestionForm form={qForm} setForm={setQForm} />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAddQDialog(false)}
              data-ocid="cbt.cancel_button"
            >
              Cancel
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={handleAddQuestion}
              disabled={!qForm.text}
              data-ocid="cbt.submit_button"
            >
              Add Question
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Question Dialog (also accessible from main list) */}
      <Dialog open={editQDialog} onOpenChange={setEditQDialog}>
        <DialogContent className="max-w-lg" data-ocid="cbt.dialog">
          <DialogHeader>
            <DialogTitle>Edit Question</DialogTitle>
          </DialogHeader>
          <QuestionForm form={editQForm} setForm={setEditQForm} />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditQDialog(false)}
              data-ocid="cbt.cancel_button"
            >
              Cancel
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={handleSaveEditQ}
              disabled={!editQForm.text}
              data-ocid="cbt.save_button"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Shared question form component
function QuestionForm({
  form,
  setForm,
}: {
  form: ReturnType<typeof emptyQForm>;
  setForm: React.Dispatch<React.SetStateAction<ReturnType<typeof emptyQForm>>>;
}) {
  return (
    <div className="space-y-3">
      <div>
        <Label>Question Text</Label>
        <Input
          className="mt-1"
          placeholder="Enter your question"
          value={form.text}
          onChange={(e) => setForm((f) => ({ ...f, text: e.target.value }))}
        />
      </div>
      {(["A", "B", "C", "D"] as const).map((opt) => (
        <div key={opt}>
          <Label>Option {opt}</Label>
          <Input
            className="mt-1"
            placeholder={`Option ${opt}`}
            value={form[opt]}
            onChange={(e) => setForm((f) => ({ ...f, [opt]: e.target.value }))}
          />
        </div>
      ))}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Correct Answer</Label>
          <RadioGroup
            value={form.correct}
            onValueChange={(v) =>
              setForm((f) => ({ ...f, correct: v as AnswerKey }))
            }
            className="flex gap-4 mt-1"
          >
            {(["A", "B", "C", "D"] as AnswerKey[]).map((opt) => (
              <div key={opt} className="flex items-center gap-1.5">
                <RadioGroupItem value={opt} id={`correct-edit-${opt}`} />
                <Label htmlFor={`correct-edit-${opt}`}>{opt}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>
        <div>
          <Label>Marks</Label>
          <Input
            className="mt-1"
            type="number"
            min={1}
            value={form.marks}
            onChange={(e) => setForm((f) => ({ ...f, marks: +e.target.value }))}
          />
        </div>
      </div>
    </div>
  );
}
