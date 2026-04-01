import {
  AlertTriangle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  XCircle,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  type AnswerKey,
  type Exam,
  type Submission,
  useCBT,
} from "../../contexts/CBTContext";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Label } from "../ui/label";
import { Progress } from "../ui/progress";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";

interface ExamTakingProps {
  exam: Exam;
  studentId: string;
  studentName: string;
  onExit: () => void;
}

function getLetterGrade(pct: number): string {
  if (pct >= 70) return "A";
  if (pct >= 60) return "B";
  if (pct >= 50) return "C";
  if (pct >= 45) return "D";
  return "F";
}

export function ExamTaking({
  exam,
  studentId,
  studentName,
  onExit,
}: ExamTakingProps) {
  const { submitExam } = useCBT();
  const [answers, setAnswers] = useState<Record<string, AnswerKey>>({});
  const [currentQ, setCurrentQ] = useState(0);
  const [timeLeft, setTimeLeft] = useState(exam.duration * 60);
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const [result, setResult] = useState<Submission | null>(null);
  const startTime = useRef(Date.now());
  const submittedRef = useRef(false);
  // Keep a ref to always-current answers for the timer auto-submit
  const answersRef = useRef<Record<string, AnswerKey>>({});

  // Keep answersRef in sync with answers state
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  const doSubmit = (finalAnswers: Record<string, AnswerKey>, auto = false) => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    const timeTaken = Math.floor((Date.now() - startTime.current) / 1000);
    let score = 0;
    for (const q of exam.questions) {
      if (finalAnswers[q.id] === q.correct) score += q.marks;
    }
    const sub: Submission = {
      examId: exam.id,
      studentId,
      studentName,
      answers: finalAnswers,
      score,
      totalMarks: exam.totalMarks,
      submittedAt: new Date(),
      timeTaken,
    };
    submitExam(sub);
    setResult(sub);
    if (!auto) setConfirmSubmit(false);
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: timer uses answersRef to avoid stale closure
  useEffect(() => {
    if (result) return;
    const id = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(id);
          // Use ref to get latest answers without making them a dependency
          doSubmit(answersRef.current, true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [result]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // Results screen
  if (result) {
    const pct = Math.round((result.score / result.totalMarks) * 100);
    const grade = getLetterGrade(pct);
    const passed = pct >= 40;

    return (
      <div className="space-y-6">
        {/* Score banner */}
        <div
          className={`rounded-xl p-6 text-white ${
            passed
              ? "bg-gradient-to-r from-green-600 to-emerald-700"
              : "bg-gradient-to-r from-red-600 to-rose-700"
          }`}
        >
          <div className="flex items-center gap-3 mb-2">
            {passed ? <CheckCircle size={28} /> : <XCircle size={28} />}
            <h2 className="text-xl font-bold">
              {passed ? "Exam Completed" : "Exam Not Passed"}
            </h2>
          </div>
          <p className="text-white/80">{exam.title}</p>

          {/* Score + Grade */}
          <div className="mt-4 grid grid-cols-2 gap-4 items-end">
            <div>
              <p className="text-white/70 text-xs uppercase tracking-wide mb-1">
                Score
              </p>
              <div className="flex items-end gap-2">
                <span className="text-5xl font-black">{result.score}</span>
                <span className="text-xl mb-1">/ {result.totalMarks}</span>
                <span className="ml-2 text-2xl font-bold">{pct}%</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white/70 text-xs uppercase tracking-wide mb-1">
                Grade
              </p>
              <span
                className={`text-6xl font-black ${
                  grade === "A"
                    ? "text-yellow-300"
                    : grade === "B"
                      ? "text-green-200"
                      : grade === "C"
                        ? "text-blue-200"
                        : grade === "D"
                          ? "text-orange-200"
                          : "text-red-200"
                }`}
              >
                {grade}
              </span>
            </div>
          </div>

          <Progress value={pct} className="mt-4 h-2 bg-white/20" />

          {/* Grade legend */}
          <div className="mt-3 flex flex-wrap gap-3 text-xs text-white/70">
            <span className={grade === "A" ? "text-yellow-300 font-bold" : ""}>
              A ≥ 70%
            </span>
            <span className={grade === "B" ? "text-green-200 font-bold" : ""}>
              B ≥ 60%
            </span>
            <span className={grade === "C" ? "text-blue-200 font-bold" : ""}>
              C ≥ 50%
            </span>
            <span className={grade === "D" ? "text-orange-200 font-bold" : ""}>
              D ≥ 45%
            </span>
            <span className={grade === "F" ? "text-red-200 font-bold" : ""}>
              F &lt; 45%
            </span>
          </div>
        </div>

        {/* Per-question breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Question Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {exam.questions.map((q, i) => {
              const given = result.answers[q.id];
              const correct = given === q.correct;
              return (
                <div
                  key={q.id}
                  className={`rounded-lg p-3 border ${
                    correct
                      ? "border-green-200 bg-green-50"
                      : "border-red-200 bg-red-50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-slate-800 flex-1">
                      {i + 1}. {q.text}
                    </p>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded flex-shrink-0 ${
                        correct
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {correct ? `+${q.marks}` : "0"} / {q.marks} marks
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-3 text-xs">
                    <span
                      className={
                        correct
                          ? "text-green-700 font-semibold"
                          : "text-red-600"
                      }
                    >
                      Your answer:{" "}
                      {given
                        ? `${given} — ${q.options[given as AnswerKey]}`
                        : "Not answered"}
                    </span>
                    {!correct && (
                      <span className="text-green-700 font-semibold">
                        Correct: {q.correct} — {q.options[q.correct]}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Button
          onClick={onExit}
          className="w-full bg-blue-600 hover:bg-blue-700"
          data-ocid="exam.close_button"
        >
          Done — Back to Exams
        </Button>
      </div>
    );
  }

  const question = exam.questions[currentQ];
  const answeredCount = Object.keys(answers).length;
  const progress = Math.round((answeredCount / exam.questions.length) * 100);
  const isLow = timeLeft <= 300; // 5 min warning

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-slate-800 text-lg">{exam.title}</h2>
          <p className="text-sm text-slate-500">
            {exam.courseCode} &bull; {exam.totalMarks} marks
          </p>
        </div>
        {/* Countdown timer */}
        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono font-bold text-lg border-2 ${
            isLow
              ? "bg-red-100 text-red-600 border-red-300 animate-pulse"
              : "bg-slate-100 text-slate-700 border-slate-200"
          }`}
          data-ocid="exam.loading_state"
        >
          <Clock size={18} />
          {formatTime(timeLeft)}
        </div>
      </div>

      <Progress value={progress} className="h-1.5" />
      <p className="text-xs text-slate-500 text-right">
        {answeredCount} / {exam.questions.length} answered
      </p>

      <div className="grid md:grid-cols-4 gap-4">
        {/* Question nav */}
        <div className="md:col-span-1">
          <Card>
            <CardContent className="p-3">
              <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">
                Questions
              </p>
              <div className="grid grid-cols-5 md:grid-cols-3 gap-1.5">
                {exam.questions.map((q, i) => (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => setCurrentQ(i)}
                    data-ocid={`exam.item.${i + 1}`}
                    className={`w-full aspect-square rounded text-xs font-bold transition-colors ${
                      i === currentQ
                        ? "bg-blue-600 text-white"
                        : answers[q.id]
                          ? "bg-green-100 text-green-700 border border-green-300"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Question card */}
        <div className="md:col-span-3">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <Badge className="bg-blue-100 text-blue-700 border-0">
                  Q{currentQ + 1}
                </Badge>
                <span className="text-xs text-slate-500">
                  {question.marks} mark{question.marks !== 1 ? "s" : ""}
                </span>
              </div>
              <p className="text-slate-800 font-medium mb-5">{question.text}</p>
              <RadioGroup
                value={answers[question.id] ?? ""}
                onValueChange={(v) =>
                  setAnswers((prev) => ({
                    ...prev,
                    [question.id]: v as AnswerKey,
                  }))
                }
                className="space-y-3"
              >
                {(["A", "B", "C", "D"] as AnswerKey[]).map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    className={`w-full flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      answers[question.id] === opt
                        ? "border-blue-500 bg-blue-50"
                        : "border-slate-200 hover:border-blue-300 hover:bg-slate-50"
                    }`}
                    onClick={() =>
                      setAnswers((prev) => ({ ...prev, [question.id]: opt }))
                    }
                  >
                    <RadioGroupItem value={opt} id={`opt-${opt}`} />
                    <Label
                      htmlFor={`opt-${opt}`}
                      className="flex-1 cursor-pointer"
                    >
                      <span className="font-bold text-blue-600 mr-2">
                        {opt}.
                      </span>
                      {question.options[opt]}
                    </Label>
                  </button>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between mt-4">
            <Button
              variant="outline"
              onClick={() => setCurrentQ((q) => Math.max(0, q - 1))}
              disabled={currentQ === 0}
              data-ocid="exam.pagination_prev"
            >
              <ChevronLeft size={16} className="mr-1" /> Previous
            </Button>
            <Button
              variant="destructive"
              onClick={() => setConfirmSubmit(true)}
              data-ocid="exam.open_modal_button"
            >
              Submit Exam
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                setCurrentQ((q) => Math.min(exam.questions.length - 1, q + 1))
              }
              disabled={currentQ === exam.questions.length - 1}
              data-ocid="exam.pagination_next"
            >
              Next <ChevronRight size={16} className="ml-1" />
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={confirmSubmit} onOpenChange={setConfirmSubmit}>
        <DialogContent data-ocid="exam.dialog">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle size={20} className="text-amber-500" /> Submit
              Exam?
            </DialogTitle>
            <DialogDescription>
              You have answered {answeredCount} of {exam.questions.length}{" "}
              questions.
              {answeredCount < exam.questions.length &&
                ` ${exam.questions.length - answeredCount} question(s) are unanswered.`}{" "}
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmSubmit(false)}
              data-ocid="exam.cancel_button"
            >
              Go Back
            </Button>
            <Button
              variant="destructive"
              onClick={() => doSubmit(answers, false)}
              data-ocid="exam.confirm_button"
            >
              Submit Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
