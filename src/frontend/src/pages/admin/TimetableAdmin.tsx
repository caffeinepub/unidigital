import { Pencil, PlusCircle, Trash2 } from "lucide-react";
import { useState } from "react";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  type TimetableSlot,
  getLocalCourses,
  getLocalStaff,
  getLocalTimetable,
  saveLocalTimetable,
} from "../../utils/sampleData";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const SEMESTER = "2023/2024 First";

function blank(): Omit<TimetableSlot, "id"> {
  return {
    day: "Monday",
    startTime: "",
    endTime: "",
    courseCode: "",
    courseTitle: "",
    venue: "",
    lecturerId: "",
    lecturerName: "",
    semester: SEMESTER,
  };
}

export function TimetableAdmin() {
  const [slots, setSlots] = useState<TimetableSlot[]>(getLocalTimetable());
  const [courses] = useState(getLocalCourses());
  const [staff] = useState(getLocalStaff());
  const [dialog, setDialog] = useState(false);
  const [editing, setEditing] = useState<TimetableSlot | null>(null);
  const [form, setForm] = useState<Omit<TimetableSlot, "id">>(blank());

  const openNew = () => {
    setEditing(null);
    setForm(blank());
    setDialog(true);
  };
  const openEdit = (slot: TimetableSlot) => {
    setEditing(slot);
    setForm({ ...slot });
    setDialog(true);
  };

  const save = () => {
    let updated: TimetableSlot[];
    if (editing) {
      updated = slots.map((s) =>
        s.id === editing.id ? { ...form, id: editing.id } : s,
      );
    } else {
      updated = [...slots, { ...form, id: `TT-${Date.now()}` }];
    }
    setSlots(updated);
    saveLocalTimetable(updated);
    setDialog(false);
  };

  const remove = (id: string) => {
    const updated = slots.filter((s) => s.id !== id);
    setSlots(updated);
    saveLocalTimetable(updated);
  };

  const setCourseField = (code: string) => {
    const course = courses.find((c) => c.code === code);
    setForm((f) => ({
      ...f,
      courseCode: code,
      courseTitle: course?.title ?? "",
    }));
  };

  const setLecturerField = (id: string) => {
    const s = staff.find((st) => st.staffId === id);
    setForm((f) => ({ ...f, lecturerId: id, lecturerName: s?.name ?? "" }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">
          Timetable Management
        </h1>
        <Button
          className="bg-blue-600 hover:bg-blue-700"
          onClick={openNew}
          data-ocid="timetable.open_modal_button"
        >
          <PlusCircle size={16} className="mr-2" /> Add Slot
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Timetable Slots</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table data-ocid="timetable.table">
              <TableHeader>
                <TableRow>
                  <TableHead>Day</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Venue</TableHead>
                  <TableHead>Lecturer</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {slots.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center text-slate-400 py-8"
                      data-ocid="timetable.empty_state"
                    >
                      No timetable slots.
                    </TableCell>
                  </TableRow>
                ) : (
                  slots.map((slot, i) => (
                    <TableRow
                      key={slot.id}
                      data-ocid={`timetable.row.${i + 1}`}
                    >
                      <TableCell>
                        <Badge className="bg-blue-100 text-blue-700 border-0">
                          {slot.day}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {slot.startTime} – {slot.endTime}
                      </TableCell>
                      <TableCell>
                        <p className="text-sm font-medium">
                          {slot.courseTitle}
                        </p>
                        <p className="text-xs text-slate-500">
                          {slot.courseCode}
                        </p>
                      </TableCell>
                      <TableCell className="text-sm">{slot.venue}</TableCell>
                      <TableCell className="text-sm">
                        {slot.lecturerName}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            onClick={() => openEdit(slot)}
                            data-ocid={`timetable.edit_button.${i + 1}`}
                          >
                            <Pencil size={14} />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-red-600 hover:bg-red-50"
                            onClick={() => remove(slot.id)}
                            data-ocid={`timetable.delete_button.${i + 1}`}
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialog} onOpenChange={setDialog}>
        <DialogContent data-ocid="timetable.dialog">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit Slot" : "Add Timetable Slot"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label>Day</Label>
              <Select
                value={form.day}
                onValueChange={(v) => setForm((f) => ({ ...f, day: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DAYS.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Start Time</Label>
              <Input
                type="time"
                value={form.startTime}
                onChange={(e) =>
                  setForm((f) => ({ ...f, startTime: e.target.value }))
                }
                data-ocid="timetable.input"
              />
            </div>
            <div>
              <Label>End Time</Label>
              <Input
                type="time"
                value={form.endTime}
                onChange={(e) =>
                  setForm((f) => ({ ...f, endTime: e.target.value }))
                }
              />
            </div>
            <div className="col-span-2">
              <Label>Course</Label>
              <Select value={form.courseCode} onValueChange={setCourseField}>
                <SelectTrigger>
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      {c.code} — {c.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <Label>Lecturer</Label>
              <Select value={form.lecturerId} onValueChange={setLecturerField}>
                <SelectTrigger>
                  <SelectValue placeholder="Select lecturer" />
                </SelectTrigger>
                <SelectContent>
                  {staff.map((s) => (
                    <SelectItem key={s.staffId} value={s.staffId}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <Label>Venue</Label>
              <Input
                placeholder="e.g. LT-1"
                value={form.venue}
                onChange={(e) =>
                  setForm((f) => ({ ...f, venue: e.target.value }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialog(false)}
              data-ocid="timetable.cancel_button"
            >
              Cancel
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={save}
              data-ocid="timetable.save_button"
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
