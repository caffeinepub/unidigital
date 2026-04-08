import {
  AlertTriangle,
  CheckCircle,
  Clock,
  PlusCircle,
  RotateCcw,
  Trash2,
  Zap,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
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
const ROOMS = [
  "LT-1",
  "LT-2",
  "LT-3",
  "ENG-A",
  "ENG-B",
  "MED-LAB",
  "LAW-1",
  "AUD-1",
  "SCI-A",
  "SCI-B",
];
const SEMESTER = "2023/2024 First";

interface ConflictEntry {
  id: string;
  type: "Room" | "Lecturer";
  courseA: string;
  courseB: string;
  day: string;
  timeOverlap: string;
  roomOrLecturer: string;
  resolvedAt?: string;
  resolutionType?: string;
}

interface ConflictHistoryEntry extends ConflictEntry {
  resolvedAt: string;
  resolutionType: string;
}

function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + (m || 0);
}

function overlaps(
  a: TimetableSlot,
  b: TimetableSlot,
): false | { overlap: string } {
  if (a.day !== b.day || a.id === b.id) return false;
  const aStart = timeToMinutes(a.startTime);
  const aEnd = timeToMinutes(a.endTime);
  const bStart = timeToMinutes(b.startTime);
  const bEnd = timeToMinutes(b.endTime);
  if (aStart < bEnd && bStart < aEnd) {
    const oStart = Math.max(aStart, bStart);
    const oEnd = Math.min(aEnd, bEnd);
    const fmt = (m: number) =>
      `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
    return { overlap: `${fmt(oStart)}–${fmt(oEnd)}` };
  }
  return false;
}

function detectConflicts(slots: TimetableSlot[]): ConflictEntry[] {
  const conflicts: ConflictEntry[] = [];
  const seen = new Set<string>();
  for (let i = 0; i < slots.length; i++) {
    for (let j = i + 1; j < slots.length; j++) {
      const a = slots[i];
      const b = slots[j];
      const ov = overlaps(a, b);
      if (!ov) continue;
      // Room conflict
      if (a.venue && b.venue && a.venue === b.venue) {
        const key = `room-${[a.id, b.id].sort().join("-")}`;
        if (!seen.has(key)) {
          seen.add(key);
          conflicts.push({
            id: `CF-${Date.now()}-${conflicts.length}`,
            type: "Room",
            courseA: `${a.courseCode} (${a.day} ${a.startTime}–${a.endTime})`,
            courseB: `${b.courseCode} (${b.day} ${b.startTime}–${b.endTime})`,
            day: a.day,
            timeOverlap: ov.overlap,
            roomOrLecturer: a.venue,
          });
        }
      }
      // Lecturer conflict
      if (a.lecturerId && b.lecturerId && a.lecturerId === b.lecturerId) {
        const key = `lec-${[a.id, b.id].sort().join("-")}`;
        if (!seen.has(key)) {
          seen.add(key);
          conflicts.push({
            id: `CF-${Date.now()}-${conflicts.length}`,
            type: "Lecturer",
            courseA: `${a.courseCode} (${a.day} ${a.startTime}–${a.endTime})`,
            courseB: `${b.courseCode} (${b.day} ${b.startTime}–${b.endTime})`,
            day: a.day,
            timeOverlap: ov.overlap,
            roomOrLecturer: a.lecturerName,
          });
        }
      }
    }
  }
  return conflicts;
}

function generateAlternativeSlots(
  slot: TimetableSlot,
  existingSlots: TimetableSlot[],
): Array<{ day: string; startTime: string; endTime: string }> {
  const suggestions: Array<{
    day: string;
    startTime: string;
    endTime: string;
  }> = [];
  const duration = timeToMinutes(slot.endTime) - timeToMinutes(slot.startTime);
  const candidateTimes = [
    "08:00",
    "09:00",
    "10:00",
    "11:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
  ];
  for (const day of DAYS) {
    if (suggestions.length >= 3) break;
    for (const startTime of candidateTimes) {
      if (suggestions.length >= 3) break;
      const start = timeToMinutes(startTime);
      const end = start + duration;
      const endTime = `${String(Math.floor(end / 60)).padStart(2, "0")}:${String(end % 60).padStart(2, "0")}`;
      const testSlot = { ...slot, day, startTime, endTime };
      const hasConflict = existingSlots
        .filter((s) => s.id !== slot.id)
        .some((s) => {
          const ov = overlaps(testSlot, s);
          if (!ov) return false;
          return (
            (s.venue === slot.venue && slot.venue) ||
            (s.lecturerId === slot.lecturerId && slot.lecturerId)
          );
        });
      if (!hasConflict) {
        suggestions.push({ day, startTime, endTime });
      }
    }
  }
  return suggestions;
}

function getConflictHistory(): ConflictHistoryEntry[] {
  return JSON.parse(
    localStorage.getItem("unidigital_conflict_history") || "[]",
  );
}
function saveConflictHistory(data: ConflictHistoryEntry[]) {
  localStorage.setItem("unidigital_conflict_history", JSON.stringify(data));
}

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

export function TimetableConflictManager() {
  const [slots, setSlots] = useState<TimetableSlot[]>(getLocalTimetable);
  const [courses] = useState(getLocalCourses());
  const [staff] = useState(getLocalStaff());
  const [form, setForm] = useState<Omit<TimetableSlot, "id">>(blank());
  const [conflictAlert, setConflictAlert] = useState<ConflictEntry[]>([]);
  const [resolveTarget, setResolveTarget] = useState<TimetableSlot | null>(
    null,
  );
  const [altSlots, setAltSlots] = useState<
    Array<{ day: string; startTime: string; endTime: string }>
  >([]);
  const [history, setHistory] =
    useState<ConflictHistoryEntry[]>(getConflictHistory);
  const [showHistory, setShowHistory] = useState(false);

  const activeConflicts = useMemo(() => detectConflicts(slots), [slots]);

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

  const handleSave = () => {
    if (
      !form.courseCode ||
      !form.startTime ||
      !form.endTime ||
      !form.venue ||
      !form.lecturerId
    ) {
      toast.error("Please fill all required fields");
      return;
    }
    if (timeToMinutes(form.endTime) <= timeToMinutes(form.startTime)) {
      toast.error("End time must be after start time");
      return;
    }
    const newSlot: TimetableSlot = { ...form, id: `TT-${Date.now()}` };
    const testSlots = [...slots, newSlot];
    const newConflicts = detectConflicts(testSlots).filter(
      (c) =>
        c.courseA.startsWith(form.courseCode) ||
        c.courseB.startsWith(form.courseCode),
    );
    if (newConflicts.length > 0) {
      setConflictAlert(newConflicts);
      toast.warning(
        `${newConflicts.length} conflict(s) detected! Review below.`,
      );
    } else {
      toast.success("Timetable slot added — no conflicts");
    }
    const updated = testSlots;
    setSlots(updated);
    saveLocalTimetable(updated);
    setForm(blank());
  };

  const handleAutoResolve = (conflict: ConflictEntry) => {
    // Find the second course's slot and generate alternatives
    const match = conflict.courseB.match(/^(\S+)/);
    const code = match?.[1];
    const targetSlot = slots.find((s) => s.courseCode === code);
    if (!targetSlot) return;
    const alternatives = generateAlternativeSlots(targetSlot, slots);
    setResolveTarget(targetSlot);
    setAltSlots(alternatives);
  };

  const applyAlternative = (alt: {
    day: string;
    startTime: string;
    endTime: string;
  }) => {
    if (!resolveTarget) return;
    const updated = slots.map((s) =>
      s.id === resolveTarget.id
        ? { ...s, day: alt.day, startTime: alt.startTime, endTime: alt.endTime }
        : s,
    );
    setSlots(updated);
    saveLocalTimetable(updated);

    // Log to history
    const histEntry: ConflictHistoryEntry = {
      id: `CH-${Date.now()}`,
      type: "Room",
      courseA: resolveTarget.courseCode,
      courseB: "—",
      day: resolveTarget.day,
      timeOverlap: `${resolveTarget.startTime}–${resolveTarget.endTime}`,
      roomOrLecturer: resolveTarget.venue,
      resolvedAt: new Date().toISOString().split("T")[0],
      resolutionType: `Moved to ${alt.day} ${alt.startTime}–${alt.endTime}`,
    };
    const updatedHistory = [histEntry, ...history];
    setHistory(updatedHistory);
    saveConflictHistory(updatedHistory);
    setConflictAlert([]);
    setResolveTarget(null);
    setAltSlots([]);
    toast.success(
      `Moved ${resolveTarget.courseCode} to ${alt.day} ${alt.startTime}–${alt.endTime}`,
    );
  };

  const dismissConflicts = () => setConflictAlert([]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Zap size={22} className="text-primary" />
            Timetable Conflict Manager
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Add schedule entries and auto-detect room/lecturer conflicts
          </p>
        </div>
        <div className="flex gap-2">
          <Badge
            className={`border-0 ${activeConflicts.length > 0 ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}
          >
            {activeConflicts.length > 0
              ? `${activeConflicts.length} Active Conflict${activeConflicts.length > 1 ? "s" : ""}`
              : "No Conflicts"}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowHistory(!showHistory)}
            data-ocid="timetable-conflicts.toggle_history"
          >
            <RotateCcw size={14} className="mr-1" />
            {showHistory ? "Hide History" : "Conflict History"}
          </Button>
        </div>
      </div>

      {/* Conflict Alert Banner */}
      {conflictAlert.length > 0 && (
        <div
          className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-3"
          data-ocid="timetable-conflicts.alert_banner"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-semibold text-red-700">
              <AlertTriangle size={16} />
              {conflictAlert.length} Conflict(s) Detected
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="text-red-600 hover:bg-red-100 h-7"
              onClick={dismissConflicts}
            >
              Dismiss
            </Button>
          </div>
          <div className="space-y-2">
            {conflictAlert.map((c, i) => (
              <div
                key={`conflict-alert-${c.type}-${c.day}-${i}`}
                className="bg-white border border-red-100 rounded p-3 text-sm"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Badge className="bg-red-100 text-red-700 border-0 text-xs">
                    {c.type} Conflict
                  </Badge>
                  <span className="text-muted-foreground text-xs">
                    {c.day} — {c.timeOverlap}
                  </span>
                </div>
                <p>
                  <strong>{c.courseA}</strong>
                </p>
                <p className="text-muted-foreground">conflicts with</p>
                <p>
                  <strong>{c.courseB}</strong>
                </p>
                <p className="text-xs text-red-600 mt-1">
                  {c.type === "Room" ? "Room" : "Lecturer"}: {c.roomOrLecturer}
                </p>
                <Button
                  size="sm"
                  className="mt-2 bg-amber-500 hover:bg-amber-600 text-white h-7 text-xs"
                  onClick={() => handleAutoResolve(c)}
                  data-ocid={`timetable-conflicts.auto_resolve.${i}`}
                >
                  <CheckCircle size={12} className="mr-1" />
                  Move to next available slot
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Alternative Slots Dialog */}
      <Dialog
        open={!!resolveTarget && altSlots.length > 0}
        onOpenChange={(o) => {
          if (!o) {
            setResolveTarget(null);
            setAltSlots([]);
          }
        }}
      >
        <DialogContent data-ocid="timetable-conflicts.alternatives_dialog">
          <DialogHeader>
            <DialogTitle>
              Alternative Slots for {resolveTarget?.courseCode}
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Select an available time slot. All suggestions avoid room and
            lecturer conflicts.
          </p>
          <div className="space-y-2">
            {altSlots.map((alt, i) => (
              <button
                type="button"
                key={`alt-${alt.day}-${alt.startTime}-${i}`}
                className="w-full text-left border border-border rounded-lg p-3 hover:bg-muted/50 transition-colors"
                onClick={() => applyAlternative(alt)}
                data-ocid={`timetable-conflicts.alt_slot.${i + 1}`}
              >
                <div className="flex items-center gap-3">
                  <Clock size={16} className="text-primary" />
                  <div>
                    <p className="text-sm font-medium">{alt.day}</p>
                    <p className="text-xs text-muted-foreground">
                      {alt.startTime} – {alt.endTime}
                    </p>
                  </div>
                  <Badge className="ml-auto bg-green-100 text-green-700 border-0 text-xs">
                    No Conflict
                  </Badge>
                </div>
              </button>
            ))}
            {altSlots.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No conflict-free slots found. Please reschedule manually.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setResolveTarget(null);
                setAltSlots([]);
              }}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Schedule Entry Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <PlusCircle size={16} className="text-primary" />
            Add Schedule Entry
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <Label>
                Course <span className="text-red-500">*</span>
              </Label>
              <Select value={form.courseCode} onValueChange={setCourseField}>
                <SelectTrigger
                  className="mt-1"
                  data-ocid="timetable-conflicts.course_select"
                >
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
            <div>
              <Label>
                Lecturer <span className="text-red-500">*</span>
              </Label>
              <Select value={form.lecturerId} onValueChange={setLecturerField}>
                <SelectTrigger
                  className="mt-1"
                  data-ocid="timetable-conflicts.lecturer_select"
                >
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
            <div>
              <Label>
                Room / Venue <span className="text-red-500">*</span>
              </Label>
              <Select
                value={form.venue}
                onValueChange={(v) => setForm((f) => ({ ...f, venue: v }))}
              >
                <SelectTrigger
                  className="mt-1"
                  data-ocid="timetable-conflicts.room_select"
                >
                  <SelectValue placeholder="Select room" />
                </SelectTrigger>
                <SelectContent>
                  {ROOMS.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>
                Day <span className="text-red-500">*</span>
              </Label>
              <Select
                value={form.day}
                onValueChange={(v) => setForm((f) => ({ ...f, day: v }))}
              >
                <SelectTrigger
                  className="mt-1"
                  data-ocid="timetable-conflicts.day_select"
                >
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
              <Label>
                Start Time <span className="text-red-500">*</span>
              </Label>
              <Input
                type="time"
                className="mt-1"
                value={form.startTime}
                onChange={(e) =>
                  setForm((f) => ({ ...f, startTime: e.target.value }))
                }
                data-ocid="timetable-conflicts.start_time_input"
              />
            </div>
            <div>
              <Label>
                End Time <span className="text-red-500">*</span>
              </Label>
              <Input
                type="time"
                className="mt-1"
                value={form.endTime}
                onChange={(e) =>
                  setForm((f) => ({ ...f, endTime: e.target.value }))
                }
                data-ocid="timetable-conflicts.end_time_input"
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button
              className="bg-primary hover:bg-primary/90"
              onClick={handleSave}
              data-ocid="timetable-conflicts.save_button"
            >
              <PlusCircle size={14} className="mr-2" />
              Add & Check Conflicts
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Active Conflicts Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <AlertTriangle
              size={16}
              className={
                activeConflicts.length > 0 ? "text-red-500" : "text-green-500"
              }
            />
            Active Conflicts ({activeConflicts.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table data-ocid="timetable-conflicts.table">
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Course A</TableHead>
                <TableHead>Course B</TableHead>
                <TableHead>Day</TableHead>
                <TableHead>Time Overlap</TableHead>
                <TableHead>Room / Lecturer</TableHead>
                <TableHead>Resolve</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeConflicts.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-10"
                    data-ocid="timetable-conflicts.empty_state"
                  >
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <CheckCircle size={28} className="text-green-500" />
                      <p className="text-sm">
                        No conflicts detected. Schedule is clean.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                activeConflicts.map((c, i) => (
                  <TableRow
                    key={c.id}
                    className="bg-red-50/40"
                    data-ocid={`timetable-conflicts.conflict_row.${i + 1}`}
                  >
                    <TableCell>
                      <Badge
                        className={`border-0 text-xs ${
                          c.type === "Room"
                            ? "bg-red-100 text-red-700"
                            : "bg-orange-100 text-orange-700"
                        }`}
                      >
                        {c.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs max-w-32">
                      {c.courseA}
                    </TableCell>
                    <TableCell className="text-xs max-w-32">
                      {c.courseB}
                    </TableCell>
                    <TableCell className="text-sm">{c.day}</TableCell>
                    <TableCell className="text-sm font-mono text-red-600">
                      {c.timeOverlap}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {c.roomOrLecturer}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        className="bg-amber-500 hover:bg-amber-600 text-white h-7 text-xs"
                        onClick={() => handleAutoResolve(c)}
                        data-ocid={`timetable-conflicts.resolve_button.${i + 1}`}
                      >
                        Resolve
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Conflict History */}
      {showHistory && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <RotateCcw size={16} className="text-muted-foreground" />
              Conflict Resolution History ({history.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table data-ocid="timetable-conflicts.history_table">
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Day / Time</TableHead>
                  <TableHead>Room / Lecturer</TableHead>
                  <TableHead>Resolution</TableHead>
                  <TableHead>Resolved At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center text-muted-foreground py-8 text-sm"
                    >
                      No resolved conflicts yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  history.map((h, i) => (
                    <TableRow
                      key={h.id}
                      data-ocid={`timetable-conflicts.history_row.${i + 1}`}
                    >
                      <TableCell>
                        <Badge className="bg-muted text-muted-foreground border-0 text-xs">
                          {h.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm font-medium">
                        {h.courseA}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {h.day} {h.timeOverlap}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {h.roomOrLecturer}
                      </TableCell>
                      <TableCell className="text-xs text-green-700">
                        {h.resolutionType}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {h.resolvedAt}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Delete existing slots quick view */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm">
            Current Schedule ({slots.length} slots)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-64 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Day</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Room</TableHead>
                  <TableHead>Lecturer</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {slots.map((slot, i) => (
                  <TableRow
                    key={slot.id}
                    data-ocid={`timetable-conflicts.slot_row.${i + 1}`}
                  >
                    <TableCell>
                      <Badge className="bg-blue-100 text-blue-700 border-0 text-xs">
                        {slot.day}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs font-mono">
                      {slot.startTime}–{slot.endTime}
                    </TableCell>
                    <TableCell>
                      <p className="text-sm font-medium">{slot.courseCode}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {slot.courseTitle}
                      </p>
                    </TableCell>
                    <TableCell className="text-sm">{slot.venue}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {slot.lecturerName}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 text-red-500 hover:bg-red-50"
                        onClick={() => {
                          const updated = slots.filter((s) => s.id !== slot.id);
                          setSlots(updated);
                          saveLocalTimetable(updated);
                          toast.success("Slot removed");
                        }}
                        data-ocid={`timetable-conflicts.delete_slot.${i + 1}`}
                      >
                        <Trash2 size={12} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
