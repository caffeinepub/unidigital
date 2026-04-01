import { ClipboardCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { Card, CardContent } from "../../components/ui/card";
import {
  type ExamEntry,
  getLocalExamEntries,
  getLocalStudents,
} from "../../utils/sampleData";

interface Props {
  userEmail: string;
}

export function ExamSchedule({ userEmail }: Props) {
  const [exams, setExams] = useState<ExamEntry[]>([]);
  const [dept, setDept] = useState("");

  useEffect(() => {
    const students = getLocalStudents();
    const student = students.find((s) => s.email === userEmail) || students[0];
    setDept(student?.department ?? "");
    setExams(getLocalExamEntries());
  }, [userEmail]);

  const myExams = [
    ...exams.filter(
      (e) => !dept || e.department === dept || e.department === "All",
    ),
  ].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">My Exam Schedule</h1>
        <p className="text-slate-500 text-sm">
          {myExams.length} upcoming exams
        </p>
      </div>
      <div className="space-y-3" data-ocid="exam-schedule.list">
        {myExams.length === 0 && (
          <Card data-ocid="exam-schedule.empty_state">
            <CardContent className="p-8 text-center text-slate-400">
              <ClipboardCheck size={40} className="mx-auto mb-3 opacity-30" />
              No exams scheduled for your department.
            </CardContent>
          </Card>
        )}
        {myExams.map((ex, idx) => (
          <Card key={ex.id} data-ocid={`exam-schedule.item.${idx + 1}`}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-blue-600 font-bold text-sm">
                      {ex.courseCode}
                    </span>
                    <span className="font-semibold text-slate-800">
                      {ex.courseTitle}
                    </span>
                  </div>
                  <div className="flex gap-4 mt-2 text-sm text-slate-600">
                    <span>📅 {ex.date}</span>
                    <span>🕐 {ex.time}</span>
                    <span>📍 {ex.venue}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Invigilator: {ex.invigilator}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
