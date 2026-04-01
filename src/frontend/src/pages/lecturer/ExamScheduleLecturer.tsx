import { ClipboardCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { Card, CardContent } from "../../components/ui/card";
import {
  type ExamEntry,
  getLocalExamEntries,
  getLocalStaff,
} from "../../utils/sampleData";

interface Props {
  staffId?: string;
}

export function ExamScheduleLecturer({ staffId }: Props) {
  const [exams, setExams] = useState<ExamEntry[]>([]);
  const [lecturerName, setLecturerName] = useState("");

  useEffect(() => {
    const staff = getLocalStaff();
    const found = staffId ? staff.find((s) => s.staffId === staffId) : staff[0];
    setLecturerName(found?.name ?? "");
    setExams(getLocalExamEntries());
  }, [staffId]);

  const allExams = [...exams].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Exam / Invigilation Schedule
        </h1>
        <p className="text-slate-500 text-sm">
          Exams you are assigned to invigilate
        </p>
      </div>
      <div className="space-y-3" data-ocid="exam-lecturer.list">
        {allExams.length === 0 && (
          <Card data-ocid="exam-lecturer.empty_state">
            <CardContent className="p-8 text-center text-slate-400">
              <ClipboardCheck size={40} className="mx-auto mb-3 opacity-30" />
              No exam schedule published yet.
            </CardContent>
          </Card>
        )}
        {allExams.map((ex, idx) => (
          <Card key={ex.id} data-ocid={`exam-lecturer.item.${idx + 1}`}>
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
                    {lecturerName && ex.invigilator === lecturerName && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                        Your Invigilation
                      </span>
                    )}
                  </div>
                  <div className="flex gap-4 mt-2 text-sm text-slate-600">
                    <span>📅 {ex.date}</span>
                    <span>🕐 {ex.time}</span>
                    <span>📍 {ex.venue}</span>
                    <span>🏛 {ex.department}</span>
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
