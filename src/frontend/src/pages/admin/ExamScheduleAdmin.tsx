import { Pencil, PlusCircle, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  type ExamEntry,
  getLocalExamEntries,
  saveLocalExamEntries,
} from "../../utils/sampleData";

function blank(): ExamEntry {
  return {
    id: "",
    courseCode: "",
    courseTitle: "",
    date: "",
    time: "",
    venue: "",
    invigilator: "",
    department: "",
  };
}

export function ExamScheduleAdmin() {
  const [exams, setExams] = useState<ExamEntry[]>([]);
  const [dialog, setDialog] = useState(false);
  const [editing, setEditing] = useState<ExamEntry | null>(null);
  const [form, setForm] = useState<ExamEntry>(blank());

  useEffect(() => {
    setExams(getLocalExamEntries());
  }, []);

  const openAdd = () => {
    setEditing(null);
    setForm(blank());
    setDialog(true);
  };
  const openEdit = (e: ExamEntry) => {
    setEditing(e);
    setForm({ ...e });
    setDialog(true);
  };

  const save = () => {
    const entry: ExamEntry = {
      ...form,
      id: editing ? form.id : `EX${Date.now()}`,
    };
    const updated = editing
      ? exams.map((e) => (e.id === editing.id ? entry : e))
      : [...exams, entry];
    saveLocalExamEntries(updated);
    setExams(updated);
    setDialog(false);
  };

  const del = (id: string) => {
    const updated = exams.filter((e) => e.id !== id);
    saveLocalExamEntries(updated);
    setExams(updated);
  };

  const sorted = [...exams].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Exam Schedule</h1>
          <p className="text-slate-500 text-sm">{exams.length} exam entries</p>
        </div>
        <Button
          onClick={openAdd}
          className="bg-blue-600 hover:bg-blue-700"
          data-ocid="exam-admin.primary_button"
        >
          <PlusCircle size={16} className="mr-2" /> Add Exam
        </Button>
      </div>
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b">
                <tr>
                  {[
                    "Course",
                    "Title",
                    "Department",
                    "Date",
                    "Time",
                    "Venue",
                    "Invigilator",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sorted.map((ex, idx) => (
                  <tr
                    key={ex.id}
                    className="border-b last:border-0 hover:bg-slate-50"
                    data-ocid={`exam-admin.item.${idx + 1}`}
                  >
                    <td className="px-4 py-3 text-sm font-mono text-blue-600 font-semibold">
                      {ex.courseCode}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium">
                      {ex.courseTitle}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500">
                      {ex.department}
                    </td>
                    <td className="px-4 py-3 text-sm">{ex.date}</td>
                    <td className="px-4 py-3 text-sm">{ex.time}</td>
                    <td className="px-4 py-3 text-sm">{ex.venue}</td>
                    <td className="px-4 py-3 text-sm">{ex.invigilator}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEdit(ex)}
                          data-ocid={`exam-admin.edit_button.${idx + 1}`}
                        >
                          <Pencil size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => del(ex.id)}
                          data-ocid={`exam-admin.delete_button.${idx + 1}`}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {sorted.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-8 text-center text-slate-400"
                      data-ocid="exam-admin.empty_state"
                    >
                      No exams scheduled yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialog} onOpenChange={setDialog}>
        <DialogContent data-ocid="exam-admin.dialog">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit Exam Entry" : "Add Exam Entry"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Course Code</Label>
              <Input
                className="mt-1"
                value={form.courseCode}
                onChange={(e) =>
                  setForm((f) => ({ ...f, courseCode: e.target.value }))
                }
                data-ocid="exam-admin.input"
              />
            </div>
            <div>
              <Label>Department</Label>
              <Input
                className="mt-1"
                value={form.department}
                onChange={(e) =>
                  setForm((f) => ({ ...f, department: e.target.value }))
                }
              />
            </div>
            <div className="col-span-2">
              <Label>Course Title</Label>
              <Input
                className="mt-1"
                value={form.courseTitle}
                onChange={(e) =>
                  setForm((f) => ({ ...f, courseTitle: e.target.value }))
                }
              />
            </div>
            <div>
              <Label>Date</Label>
              <Input
                className="mt-1"
                type="date"
                value={form.date}
                onChange={(e) =>
                  setForm((f) => ({ ...f, date: e.target.value }))
                }
              />
            </div>
            <div>
              <Label>Time</Label>
              <Input
                className="mt-1"
                type="time"
                value={form.time}
                onChange={(e) =>
                  setForm((f) => ({ ...f, time: e.target.value }))
                }
              />
            </div>
            <div>
              <Label>Venue</Label>
              <Input
                className="mt-1"
                value={form.venue}
                onChange={(e) =>
                  setForm((f) => ({ ...f, venue: e.target.value }))
                }
              />
            </div>
            <div>
              <Label>Invigilator</Label>
              <Input
                className="mt-1"
                value={form.invigilator}
                onChange={(e) =>
                  setForm((f) => ({ ...f, invigilator: e.target.value }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialog(false)}
              data-ocid="exam-admin.cancel_button"
            >
              Cancel
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={save}
              data-ocid="exam-admin.save_button"
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
