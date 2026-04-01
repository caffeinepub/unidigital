import { CalendarDays, Pencil, PlusCircle, Trash2 } from "lucide-react";
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
import { Textarea } from "../../components/ui/textarea";
import {
  type AcademicCalendarEvent,
  getLocalCalendarEvents,
  saveLocalCalendarEvents,
} from "../../utils/sampleData";

interface Props {
  isAdmin?: boolean;
}

const typeColors: Record<string, string> = {
  Holiday: "bg-green-100 text-green-700",
  Exam: "bg-red-100 text-red-700",
  Lecture: "bg-blue-100 text-blue-700",
  Deadline: "bg-amber-100 text-amber-700",
  Semester: "bg-purple-100 text-purple-700",
};

function blank(): AcademicCalendarEvent {
  return {
    id: "",
    title: "",
    date: "",
    endDate: "",
    type: "Lecture",
    description: "",
  };
}

export function AcademicCalendar({ isAdmin = false }: Props) {
  const [events, setEvents] = useState<AcademicCalendarEvent[]>([]);
  const [dialog, setDialog] = useState(false);
  const [editing, setEditing] = useState<AcademicCalendarEvent | null>(null);
  const [form, setForm] = useState<AcademicCalendarEvent>(blank());
  const [filter, setFilter] = useState<string>("All");

  useEffect(() => {
    setEvents(getLocalCalendarEvents());
  }, []);

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

  const types = ["All", "Holiday", "Exam", "Lecture", "Deadline", "Semester"];
  const filtered =
    filter === "All" ? events : events.filter((e) => e.type === filter);
  const sorted = [...filtered].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Academic Calendar
          </h1>
          <p className="text-slate-500 text-sm">
            {events.length} events scheduled
          </p>
        </div>
        {isAdmin && (
          <Button
            onClick={openAdd}
            className="bg-blue-600 hover:bg-blue-700"
            data-ocid="calendar.primary_button"
          >
            <PlusCircle size={16} className="mr-2" /> Add Event
          </Button>
        )}
      </div>

      <div className="flex gap-2 flex-wrap">
        {types.map((t) => (
          <button
            key={t}
            type="button"
            data-ocid="calendar.tab"
            onClick={() => setFilter(t)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              filter === t
                ? "bg-blue-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="space-y-3" data-ocid="calendar.list">
        {sorted.length === 0 && (
          <Card data-ocid="calendar.empty_state">
            <CardContent className="p-8 text-center text-slate-400">
              <CalendarDays size={40} className="mx-auto mb-3 opacity-30" />
              No events found.
            </CardContent>
          </Card>
        )}
        {sorted.map((event, idx) => (
          <Card key={event.id} data-ocid={`calendar.item.${idx + 1}`}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-slate-800">
                      {event.title}
                    </h3>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${typeColors[event.type] ?? "bg-slate-100 text-slate-600"}`}
                    >
                      {event.type}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 mt-1">
                    {event.date}
                    {event.endDate && event.endDate !== event.date
                      ? ` — ${event.endDate}`
                      : ""}
                  </p>
                  {event.description && (
                    <p className="text-sm text-slate-600 mt-1">
                      {event.description}
                    </p>
                  )}
                </div>
                {isAdmin && (
                  <div className="flex gap-1 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEdit(event)}
                      data-ocid={`calendar.edit_button.${idx + 1}`}
                    >
                      <Pencil size={14} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700"
                      onClick={() => del(event.id)}
                      data-ocid={`calendar.delete_button.${idx + 1}`}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={dialog} onOpenChange={setDialog}>
        <DialogContent data-ocid="calendar.dialog">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit Event" : "Add Calendar Event"}
            </DialogTitle>
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
                data-ocid="calendar.input"
              />
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
                />
              </div>
            </div>
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
                  {["Holiday", "Exam", "Lecture", "Deadline", "Semester"].map(
                    (t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
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
              className="bg-blue-600 hover:bg-blue-700"
              onClick={save}
              data-ocid="calendar.save_button"
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
