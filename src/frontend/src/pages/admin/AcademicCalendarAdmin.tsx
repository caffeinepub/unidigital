import {
  CalendarPlus,
  CheckCircle2,
  Pencil,
  PlusCircle,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import { Textarea } from "../../components/ui/textarea";
import {
  type AcademicCalendarEvent,
  getLocalCalendarEvents,
  saveLocalCalendarEvents,
} from "../../utils/sampleData";

const typeColors: Record<string, string> = {
  Holiday: "bg-green-100 text-green-700",
  Exam: "bg-red-100 text-red-700",
  Lecture: "bg-blue-100 text-blue-700",
  Deadline: "bg-amber-100 text-amber-700",
  Semester: "bg-purple-100 text-purple-700",
};

const EVENT_TYPES: AcademicCalendarEvent["type"][] = [
  "Holiday",
  "Exam",
  "Lecture",
  "Deadline",
  "Semester",
];
const SESSIONS = ["2024/2025", "2023/2024", "2025/2026"];

function blankEvent(session: string): AcademicCalendarEvent {
  return {
    id: "",
    title: "",
    date: "",
    endDate: "",
    type: "Lecture",
    description: "",
    session,
  };
}

export function AcademicCalendarAdmin() {
  const [events, setEvents] = useState<AcademicCalendarEvent[]>([]);
  const [dialog, setDialog] = useState(false);
  const [editing, setEditing] = useState<AcademicCalendarEvent | null>(null);
  const [form, setForm] = useState<AcademicCalendarEvent>(
    blankEvent("2024/2025"),
  );
  const [filterSession, setFilterSession] = useState("2024/2025");
  const [filterType, setFilterType] = useState("All");

  useEffect(() => {
    const raw = getLocalCalendarEvents();
    if (raw.length === 0) {
      const seeded: AcademicCalendarEvent[] = [
        {
          id: "CAL001",
          title: "First Semester Begins",
          date: "2024-09-16",
          endDate: "2024-09-16",
          type: "Semester",
          description: "Commencement of 2024/2025 First Semester",
          session: "2024/2025",
        },
        {
          id: "CAL002",
          title: "Course Registration Deadline",
          date: "2024-10-04",
          endDate: "2024-10-04",
          type: "Deadline",
          description: "Last day to register courses for first semester",
          session: "2024/2025",
        },
        {
          id: "CAL003",
          title: "Mid-Semester Break",
          date: "2024-11-04",
          endDate: "2024-11-08",
          type: "Holiday",
          description: "Mid-semester recess",
          session: "2024/2025",
        },
        {
          id: "CAL004",
          title: "First Semester Exams Begin",
          date: "2025-01-13",
          endDate: "2025-01-24",
          type: "Exam",
          description: "First semester examinations for all levels",
          session: "2024/2025",
        },
        {
          id: "CAL005",
          title: "Christmas & New Year Break",
          date: "2024-12-20",
          endDate: "2025-01-05",
          type: "Holiday",
          description: "Institutional holiday period",
          session: "2024/2025",
        },
        {
          id: "CAL006",
          title: "Second Semester Begins",
          date: "2025-02-17",
          endDate: "2025-02-17",
          type: "Semester",
          description: "Commencement of 2024/2025 Second Semester",
          session: "2024/2025",
        },
        {
          id: "CAL007",
          title: "Second Semester Registration Deadline",
          date: "2025-03-07",
          endDate: "2025-03-07",
          type: "Deadline",
          description: "Last day for second semester course registration",
          session: "2024/2025",
        },
        {
          id: "CAL008",
          title: "Easter Break",
          date: "2025-04-14",
          endDate: "2025-04-21",
          type: "Holiday",
          description: "Easter holiday for all staff and students",
          session: "2024/2025",
        },
        {
          id: "CAL009",
          title: "Second Semester Exams",
          date: "2025-06-09",
          endDate: "2025-06-20",
          type: "Exam",
          description: "Second semester final examinations",
          session: "2024/2025",
        },
        {
          id: "CAL010",
          title: "Long Vacation",
          date: "2025-07-01",
          endDate: "2025-09-14",
          type: "Holiday",
          description: "End of 2024/2025 academic session long vacation",
          session: "2024/2025",
        },
      ];
      saveLocalCalendarEvents(seeded);
      setEvents(seeded);
    } else {
      setEvents(raw);
    }
  }, []);

  const openAdd = () => {
    setEditing(null);
    setForm(blankEvent(filterSession));
    setDialog(true);
  };
  const openEdit = (e: AcademicCalendarEvent) => {
    setEditing(e);
    setForm({ ...e });
    setDialog(true);
  };

  const save = () => {
    const entry: AcademicCalendarEvent = {
      ...form,
      id: editing ? form.id : `CAL${Date.now()}`,
      session: form.session ?? filterSession,
    };
    const updated = editing
      ? events.map((e) => (e.id === editing.id ? entry : e))
      : [...events, entry];
    saveLocalCalendarEvents(updated);
    setEvents(updated);
    setDialog(false);
  };

  const del = (id: string) => {
    const updated = events.filter((e) => e.id !== id);
    saveLocalCalendarEvents(updated);
    setEvents(updated);
  };

  const publish = (id: string) => {
    const updated = events.map((e) =>
      e.id === id ? { ...e, published: true } : e,
    );
    saveLocalCalendarEvents(updated);
    setEvents(updated);
  };

  const filtered = events
    .filter((e) => (e.session ?? "2024/2025") === filterSession)
    .filter((e) => filterType === "All" || e.type === filterType)
    .sort((a, b) => a.date.localeCompare(b.date));

  const typeCounts = EVENT_TYPES.reduce<Record<string, number>>((acc, t) => {
    acc[t] = events.filter(
      (e) => e.type === t && (e.session ?? "2024/2025") === filterSession,
    ).length;
    return acc;
  }, {});

  return (
    <div className="space-y-6" data-ocid="cal_admin.root">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Academic Calendar Administration
          </h1>
          <p className="text-sm text-muted-foreground">
            Create, edit, and publish academic calendar events
          </p>
        </div>
        <Button onClick={openAdd} data-ocid="cal_admin.add_button">
          <PlusCircle size={16} className="mr-2" /> Add Event
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {EVENT_TYPES.map((type) => (
          <Card key={type} data-ocid={`cal_admin.stat.${type}`}>
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-foreground">
                {typeCounts[type] ?? 0}
              </p>
              <span
                className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${typeColors[type] ?? "bg-muted"}`}
              >
                {type}
              </span>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="list">
        <TabsList>
          <TabsTrigger value="list">Event List</TabsTrigger>
          <TabsTrigger value="timeline">Timeline View</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <CardTitle className="text-base">Calendar Events</CardTitle>
                <div className="flex gap-2">
                  <Select
                    value={filterSession}
                    onValueChange={setFilterSession}
                  >
                    <SelectTrigger
                      className="w-36"
                      data-ocid="cal_admin.session_filter"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SESSIONS.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger
                      className="w-36"
                      data-ocid="cal_admin.type_filter"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["All", ...EVENT_TYPES].map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table data-ocid="cal_admin.events_table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center text-muted-foreground py-8"
                      >
                        <CalendarPlus
                          size={32}
                          className="mx-auto mb-2 opacity-30"
                        />
                        No events for this session. Click "Add Event" to create
                        one.
                      </TableCell>
                    </TableRow>
                  )}
                  {filtered.map((event, idx) => (
                    <TableRow
                      key={event.id}
                      data-ocid={`cal_admin.row.${idx + 1}`}
                    >
                      <TableCell className="font-medium">
                        {event.title}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${typeColors[event.type] ?? "bg-muted"}`}
                        >
                          {event.type}
                        </span>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {event.date}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {event.endDate && event.endDate !== event.date
                          ? event.endDate
                          : "—"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-48 truncate">
                        {event.description ?? "—"}
                      </TableCell>
                      <TableCell>
                        {(
                          event as AcademicCalendarEvent & {
                            published?: boolean;
                          }
                        ).published ? (
                          <Badge variant="default" className="gap-1">
                            <CheckCircle2 size={10} /> Published
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Draft</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {!(
                            event as AcademicCalendarEvent & {
                              published?: boolean;
                            }
                          ).published && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => publish(event.id)}
                              className="text-green-600"
                              data-ocid={`cal_admin.publish.${event.id}`}
                            >
                              Publish
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEdit(event)}
                            data-ocid={`cal_admin.edit.${event.id}`}
                          >
                            <Pencil size={13} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive"
                            onClick={() => del(event.id)}
                            data-ocid={`cal_admin.delete.${event.id}`}
                          >
                            <Trash2 size={13} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                Timeline — {filterSession}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative" data-ocid="cal_admin.timeline">
                <div className="absolute left-6 top-0 bottom-0 w-px bg-border" />
                <div className="space-y-4 pl-12">
                  {filtered.length === 0 && (
                    <p className="text-muted-foreground text-sm">
                      No events found.
                    </p>
                  )}
                  {filtered.map((event) => (
                    <div
                      key={event.id}
                      className="relative"
                      data-ocid={`cal_admin.timeline_item.${event.id}`}
                    >
                      <div
                        className={`absolute -left-7 mt-1 w-4 h-4 rounded-full border-2 border-background ${typeColors[event.type]?.includes("green") ? "bg-green-500" : typeColors[event.type]?.includes("red") ? "bg-red-500" : typeColors[event.type]?.includes("blue") ? "bg-blue-500" : typeColors[event.type]?.includes("amber") ? "bg-amber-500" : "bg-purple-500"}`}
                      />
                      <div
                        className={`p-3 rounded-lg border ${typeColors[event.type] ?? "bg-muted border-border"}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-semibold text-sm">
                              {event.title}
                            </p>
                            <p className="text-xs opacity-70 mt-0.5">
                              {event.date}
                              {event.endDate && event.endDate !== event.date
                                ? ` → ${event.endDate}`
                                : ""}
                            </p>
                            {event.description && (
                              <p className="text-xs mt-1 opacity-80">
                                {event.description}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-1 flex-shrink-0">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEdit(event)}
                              className="h-7 w-7 p-0"
                            >
                              <Pencil size={11} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive h-7 w-7 p-0"
                              onClick={() => del(event.id)}
                            >
                              <Trash2 size={11} />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add/Edit Dialog */}
      <Dialog open={dialog} onOpenChange={setDialog}>
        <DialogContent data-ocid="cal_admin.dialog">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit Calendar Event" : "Add Calendar Event"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Event Title</Label>
              <Input
                className="mt-1"
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                placeholder="e.g., First Semester Begins"
                data-ocid="cal_admin.title_input"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Event Type</Label>
                <Select
                  value={form.type}
                  onValueChange={(v) =>
                    setForm((f) => ({
                      ...f,
                      type: v as AcademicCalendarEvent["type"],
                    }))
                  }
                >
                  <SelectTrigger
                    className="mt-1"
                    data-ocid="cal_admin.type_select"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EVENT_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Session</Label>
                <Select
                  value={form.session ?? filterSession}
                  onValueChange={(v) => setForm((f) => ({ ...f, session: v }))}
                >
                  <SelectTrigger
                    className="mt-1"
                    data-ocid="cal_admin.session_select"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SESSIONS.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Start Date</Label>
                <Input
                  className="mt-1"
                  type="date"
                  value={form.date}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, date: e.target.value }))
                  }
                  data-ocid="cal_admin.start_date"
                />
              </div>
              <div>
                <Label>End Date (optional)</Label>
                <Input
                  className="mt-1"
                  type="date"
                  value={form.endDate ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, endDate: e.target.value }))
                  }
                  data-ocid="cal_admin.end_date"
                />
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                className="mt-1"
                rows={3}
                value={form.description ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                placeholder="Optional description or notes…"
                data-ocid="cal_admin.description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialog(false)}
              data-ocid="cal_admin.cancel_button"
            >
              Cancel
            </Button>
            <Button onClick={save} data-ocid="cal_admin.save_button">
              <CheckCircle2 size={14} className="mr-2" />{" "}
              {editing ? "Update" : "Add"} Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
