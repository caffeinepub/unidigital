import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Download,
  Pencil,
  PlusCircle,
  Timer,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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
import { Textarea } from "../../components/ui/textarea";
import {
  type AcademicCalendarEvent,
  getLocalCalendarEvents,
  saveLocalCalendarEvents,
} from "../../utils/sampleData";

interface Props {
  isAdmin?: boolean;
}

const EVENT_TYPES = [
  "Holiday",
  "Exam",
  "Lecture",
  "Deadline",
  "Semester",
  "Registration",
  "Event",
] as const;

const TYPE_COLORS: Record<
  string,
  { bg: string; text: string; dot: string; badge: string }
> = {
  Holiday: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    dot: "bg-blue-500",
    badge: "bg-blue-100 text-blue-700",
  },
  Exam: {
    bg: "bg-red-50",
    text: "text-red-700",
    dot: "bg-red-500",
    badge: "bg-red-100 text-red-700",
  },
  Lecture: {
    bg: "bg-indigo-50",
    text: "text-indigo-700",
    dot: "bg-indigo-500",
    badge: "bg-indigo-100 text-indigo-700",
  },
  Deadline: {
    bg: "bg-orange-50",
    text: "text-orange-700",
    dot: "bg-orange-500",
    badge: "bg-orange-100 text-orange-700",
  },
  Semester: {
    bg: "bg-purple-50",
    text: "text-purple-700",
    dot: "bg-purple-500",
    badge: "bg-purple-100 text-purple-700",
  },
  Registration: {
    bg: "bg-green-50",
    text: "text-green-700",
    dot: "bg-green-500",
    badge: "bg-green-100 text-green-700",
  },
  Event: {
    bg: "bg-pink-50",
    text: "text-pink-700",
    dot: "bg-pink-500",
    badge: "bg-pink-100 text-pink-700",
  },
};

const AUDIENCE_OPTIONS = ["All", "Students", "Staff", "HOD", "Admin"] as const;

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function daysUntil(dateStr: string): number {
  const target = new Date(dateStr);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - now.getTime()) / 86400000);
}

function blank(): AcademicCalendarEvent & { audience?: string } {
  return {
    id: "",
    title: "",
    date: "",
    endDate: "",
    type: "Event",
    description: "",
  };
}

export function AcademicCalendar({ isAdmin = false }: Props) {
  const today = new Date();
  const [events, setEvents] = useState<AcademicCalendarEvent[]>([]);
  const [view, setView] = useState<"list" | "grid">("list");
  const [filter, setFilter] = useState("All");
  const [dialog, setDialog] = useState(false);
  const [editing, setEditing] = useState<AcademicCalendarEvent | null>(null);
  const [form, setForm] = useState<
    AcademicCalendarEvent & { audience?: string }
  >(blank());
  const [gridYear, setGridYear] = useState(today.getFullYear());
  const [gridMonth, setGridMonth] = useState(today.getMonth());

  useEffect(() => {
    const raw = getLocalCalendarEvents();
    if (raw.length === 0) {
      const defaults: AcademicCalendarEvent[] = [
        {
          id: "CAL001",
          title: "First Semester Begins",
          date: "2024-09-16",
          endDate: "2024-09-16",
          type: "Semester",
          description: "Commencement of 2024/2025 First Semester",
        },
        {
          id: "CAL002",
          title: "Course Registration Deadline",
          date: "2024-10-04",
          endDate: "2024-10-04",
          type: "Deadline",
          description: "Last day to register courses for first semester",
        },
        {
          id: "CAL003",
          title: "Mid-Semester Break",
          date: "2024-11-04",
          endDate: "2024-11-08",
          type: "Holiday",
          description: "Mid-semester recess",
        },
        {
          id: "CAL004",
          title: "First Semester Exams Begin",
          date: "2025-01-13",
          endDate: "2025-01-24",
          type: "Exam",
          description: "First semester examinations for all levels",
        },
        {
          id: "CAL005",
          title: "Christmas & New Year Break",
          date: "2024-12-20",
          endDate: "2025-01-05",
          type: "Holiday",
          description: "Institutional holiday period",
        },
        {
          id: "CAL006",
          title: "Second Semester Begins",
          date: "2025-02-17",
          endDate: "2025-02-17",
          type: "Semester",
          description: "Commencement of 2024/2025 Second Semester",
        },
        {
          id: "CAL007",
          title: "Second Semester Registration",
          date: "2025-02-17",
          endDate: "2025-03-07",
          type: "Registration",
          description: "Course registration window for 2nd semester",
        },
        {
          id: "CAL008",
          title: "Final Exams (2nd Semester)",
          date: "2025-05-26",
          endDate: "2025-06-06",
          type: "Exam",
          description: "Second semester final examinations",
        },
        {
          id: "CAL009",
          title: "Assignment Submission Deadline",
          date: "2025-04-25",
          endDate: "2025-04-25",
          type: "Deadline",
          description: "Final assignments due for all courses",
        },
        {
          id: "CAL010",
          title: "Convocation Ceremony",
          date: "2025-07-18",
          endDate: "2025-07-19",
          type: "Event",
          description: "Annual convocation and graduation ceremony",
        },
      ];
      saveLocalCalendarEvents(defaults);
      setEvents(defaults);
    } else {
      setEvents(raw);
    }
  }, []);

  const types = ["All", ...EVENT_TYPES];
  const filtered =
    filter === "All" ? events : events.filter((e) => e.type === filter);
  const sorted = [...filtered].sort((a, b) => a.date.localeCompare(b.date));

  // Countdown events: upcoming within 60 days
  const countdownEvents = useMemo(
    () =>
      events
        .filter((e) => {
          const d = daysUntil(e.date);
          return (
            d >= 0 &&
            d <= 60 &&
            (e.type === "Exam" ||
              e.type === "Deadline" ||
              e.type === "Registration")
          );
        })
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(0, 4),
    [events],
  );

  // Monthly grid helpers
  const firstDay = new Date(gridYear, gridMonth, 1).getDay();
  const daysInMonth = new Date(gridYear, gridMonth + 1, 0).getDate();
  const eventsInMonth = events.filter((e) => {
    const d = new Date(e.date);
    return d.getFullYear() === gridYear && d.getMonth() === gridMonth;
  });
  function getEventsForDay(day: number) {
    return eventsInMonth.filter((e) => new Date(e.date).getDate() === day);
  }

  const openAdd = () => {
    setEditing(null);
    setForm(blank());
    setDialog(true);
  };
  const openEdit = (e: AcademicCalendarEvent) => {
    setEditing(e);
    setForm({ ...e });
    setDialog(true);
  };

  const save = () => {
    if (!form.title.trim() || !form.date) return;
    const entry: AcademicCalendarEvent = {
      ...form,
      id: editing ? form.id : `CAL${Date.now()}`,
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

  const handleExport = () => {
    const lines = [
      "ACADEMIC CALENDAR",
      `Exported: ${new Date().toLocaleDateString("en-NG")}`,
      "=".repeat(60),
      "",
      ...sorted.map((e) => {
        const dateStr =
          e.endDate && e.endDate !== e.date
            ? `${e.date} — ${e.endDate}`
            : e.date;
        return `[${e.type.toUpperCase()}] ${e.title}\nDate: ${dateStr}${e.description ? `\n${e.description}` : ""}\n`;
      }),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "academic-calendar.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Academic Calendar
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {events.length} events scheduled
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            data-ocid="calendar.export_button"
          >
            <Download size={14} className="mr-1.5" /> Export
          </Button>
          {isAdmin && (
            <Button
              size="sm"
              onClick={openAdd}
              data-ocid="calendar.primary_button"
            >
              <PlusCircle size={14} className="mr-1.5" /> Add Event
            </Button>
          )}
        </div>
      </div>

      {/* Countdown strip */}
      {countdownEvents.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {countdownEvents.map((e) => {
            const days = daysUntil(e.date);
            const c = TYPE_COLORS[e.type] ?? TYPE_COLORS.Event;
            return (
              <div
                key={e.id}
                className={`${c.bg} border rounded-xl px-4 py-3 flex items-center gap-3`}
                data-ocid={`calendar.countdown.${e.id}`}
              >
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${c.badge}`}
                >
                  <Timer size={18} />
                </div>
                <div className="min-w-0">
                  <p className={`text-xs font-semibold truncate ${c.text}`}>
                    {e.title}
                  </p>
                  <p className={`text-lg font-bold ${c.text}`}>
                    {days === 0
                      ? "Today!"
                      : days === 1
                        ? "Tomorrow"
                        : `${days} days`}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* View toggle + type filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex border border-border rounded-lg overflow-hidden mr-2">
          {(["list", "grid"] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              className={`px-3 py-1.5 text-sm font-medium capitalize transition-colors ${view === v ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted/50"}`}
              data-ocid={`calendar.view_${v}`}
            >
              {v === "list" ? "List" : "Monthly"}
            </button>
          ))}
        </div>
        {types.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setFilter(t)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${filter === t ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
            data-ocid="calendar.tab"
          >
            {t}
          </button>
        ))}
      </div>

      {/* Monthly grid view */}
      {view === "grid" && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (gridMonth === 0) {
                    setGridMonth(11);
                    setGridYear((y) => y - 1);
                  } else setGridMonth((m) => m - 1);
                }}
              >
                <ChevronLeft size={16} />
              </Button>
              <h2 className="text-base font-semibold text-foreground flex-1 text-center">
                {MONTHS[gridMonth]} {gridYear}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (gridMonth === 11) {
                    setGridMonth(0);
                    setGridYear((y) => y + 1);
                  } else setGridMonth((m) => m + 1);
                }}
              >
                <ChevronRight size={16} />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
              {DAYS.map((d) => (
                <div
                  key={d}
                  className="bg-muted/40 py-2 text-center text-xs font-semibold text-muted-foreground"
                >
                  {d}
                </div>
              ))}
              {Array.from(
                { length: firstDay },
                (_, i) => `${gridYear}-${gridMonth}-pad-${i}`,
              ).map((padKey) => (
                <div key={padKey} className="bg-card min-h-[70px]" />
              ))}
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(
                (day) => {
                  const isToday =
                    today.getFullYear() === gridYear &&
                    today.getMonth() === gridMonth &&
                    today.getDate() === day;
                  const dayEvents = getEventsForDay(day);
                  return (
                    <div
                      key={day}
                      className={`bg-card min-h-[70px] p-1.5 ${isToday ? "ring-2 ring-primary ring-inset" : ""}`}
                      data-ocid={`calendar.grid_day.${gridYear}-${gridMonth + 1}-${day}`}
                    >
                      <p
                        className={`text-xs font-bold mb-1 ${isToday ? "text-primary" : "text-foreground"}`}
                      >
                        {day}
                      </p>
                      <div className="space-y-0.5">
                        {dayEvents.slice(0, 2).map((e) => {
                          const c = TYPE_COLORS[e.type] ?? TYPE_COLORS.Event;
                          return (
                            <div
                              key={e.id}
                              className={`${c.badge} rounded px-1 py-0.5 text-xs truncate leading-tight`}
                            >
                              {e.title}
                            </div>
                          );
                        })}
                        {dayEvents.length > 2 && (
                          <div className="text-xs text-muted-foreground">
                            +{dayEvents.length - 2} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                },
              )}
            </div>
            {/* Legend */}
            <div className="flex flex-wrap gap-3 mt-4 pt-3 border-t border-border">
              {EVENT_TYPES.map((t) => {
                const c = TYPE_COLORS[t];
                return (
                  <div
                    key={t}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground"
                  >
                    <div className={`w-2.5 h-2.5 rounded-full ${c.dot}`} />
                    {t}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* List view */}
      {view === "list" && (
        <div className="space-y-3" data-ocid="calendar.list">
          {sorted.length === 0 && (
            <Card data-ocid="calendar.empty_state">
              <CardContent className="p-12 text-center text-muted-foreground">
                <CalendarDays size={40} className="mx-auto mb-3 opacity-30" />
                No events found.
              </CardContent>
            </Card>
          )}
          {sorted.map((event, idx) => {
            const c = TYPE_COLORS[event.type] ?? TYPE_COLORS.Event;
            const days = daysUntil(event.date);
            return (
              <Card
                key={event.id}
                className="hover:shadow-sm transition-shadow"
                data-ocid={`calendar.item.${idx + 1}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-1 self-stretch rounded-full shrink-0 ${c.dot}`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-foreground">
                          {event.title}
                        </h3>
                        <Badge className={`${c.badge} border-0 text-xs`}>
                          {event.type}
                        </Badge>
                        {days >= 0 && days <= 14 && (
                          <Badge className="bg-amber-100 text-amber-700 border-0 text-xs">
                            {days === 0
                              ? "Today"
                              : days === 1
                                ? "Tomorrow"
                                : `In ${days} days`}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {event.date}
                        {event.endDate && event.endDate !== event.date
                          ? ` — ${event.endDate}`
                          : ""}
                      </p>
                      {event.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {event.description}
                        </p>
                      )}
                    </div>
                    {isAdmin && (
                      <div className="flex gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEdit(event)}
                          data-ocid={`calendar.edit_button.${idx + 1}`}
                        >
                          <Pencil size={13} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => del(event.id)}
                          data-ocid={`calendar.delete_button.${idx + 1}`}
                        >
                          <Trash2 size={13} />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add/Edit dialog */}
      <Dialog open={dialog} onOpenChange={setDialog}>
        <DialogContent data-ocid="calendar.dialog" className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit Event" : "Add Calendar Event"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Title *</Label>
              <Input
                className="mt-1"
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                data-ocid="calendar.input"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Start Date *</Label>
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
                <Label>End Date</Label>
                <Input
                  className="mt-1"
                  type="date"
                  value={form.endDate ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, endDate: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Type</Label>
                <Select
                  value={form.type}
                  onValueChange={(v) =>
                    setForm((f) => ({
                      ...f,
                      type: v as AcademicCalendarEvent["type"],
                    }))
                  }
                >
                  <SelectTrigger className="mt-1">
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
                <Label>Target Audience</Label>
                <Select
                  value={(form as { audience?: string }).audience ?? "All"}
                  onValueChange={(v) => setForm((f) => ({ ...f, audience: v }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AUDIENCE_OPTIONS.map((a) => (
                      <SelectItem key={a} value={a}>
                        {a}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialog(false)}
              data-ocid="calendar.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={save}
              disabled={!form.title.trim() || !form.date}
              data-ocid="calendar.save_button"
            >
              Save Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
