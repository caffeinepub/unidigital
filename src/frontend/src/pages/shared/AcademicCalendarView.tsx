import {
  CalendarDays,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  List,
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
  type AcademicCalendarEvent,
  getLocalCalendarEvents,
  saveLocalCalendarEvents,
} from "../../utils/sampleData";

const typeColors: Record<string, string> = {
  Holiday: "bg-green-100 text-green-800 border-green-300",
  Exam: "bg-red-100 text-red-800 border-red-300",
  Lecture: "bg-blue-100 text-blue-800 border-blue-300",
  Deadline: "bg-amber-100 text-amber-800 border-amber-300",
  Semester: "bg-purple-100 text-purple-800 border-purple-300",
};

const typeDot: Record<string, string> = {
  Holiday: "bg-green-500",
  Exam: "bg-red-500",
  Lecture: "bg-blue-500",
  Deadline: "bg-amber-500",
  Semester: "bg-purple-500",
};

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
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function firstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function getCountdown(dateStr: string): string {
  const target = new Date(dateStr);
  const now = new Date();
  const diff = Math.ceil(
    (target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (diff < 0) return "Past";
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff <= 7) return `In ${diff} days`;
  if (diff <= 30)
    return `In ${Math.ceil(diff / 7)} week${Math.ceil(diff / 7) > 1 ? "s" : ""}`;
  return `In ${Math.ceil(diff / 30)} month${Math.ceil(diff / 30) > 1 ? "s" : ""}`;
}

function isPast(dateStr: string) {
  return new Date(dateStr) < new Date();
}

const SEED_EVENTS: AcademicCalendarEvent[] = [
  {
    id: "CAL001",
    title: "First Semester Begins",
    date: "2024-09-16",
    endDate: "2024-09-16",
    type: "Semester",
    description: "Commencement of 2024/2025 First Semester lectures",
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
    description: "Mid-semester recess for all students and staff",
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
    title: "2nd Semester Registration Deadline",
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

export function AcademicCalendarView() {
  const [events, setEvents] = useState<AcademicCalendarEvent[]>([]);
  const [view, setView] = useState<"monthly" | "weekly" | "list">("monthly");
  const [filterType, setFilterType] = useState("All");

  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  useEffect(() => {
    const raw = getLocalCalendarEvents();
    if (raw.length === 0) {
      saveLocalCalendarEvents(SEED_EVENTS);
      setEvents(SEED_EVENTS);
    } else {
      setEvents(raw);
    }
  }, []);

  const types = ["All", "Holiday", "Exam", "Lecture", "Deadline", "Semester"];
  const filtered =
    filterType === "All" ? events : events.filter((e) => e.type === filterType);

  const upcomingEvents = useMemo(
    () =>
      [...events]
        .filter((e) => !isPast(e.date))
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(0, 5),
    [events],
  );

  const totalDays = daysInMonth(currentYear, currentMonth);
  const firstDay = firstDayOfMonth(currentYear, currentMonth);
  const todayStr = today.toISOString().slice(0, 10);

  const getEventsForDate = (dateStr: string) =>
    filtered.filter((e) => {
      if (!e.endDate || e.endDate === e.date) return e.date === dateStr;
      return dateStr >= e.date && dateStr <= e.endDate;
    });

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else setCurrentMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else setCurrentMonth((m) => m + 1);
  };

  const getWeekDates = () => {
    const dayOfWeek = today.getDay();
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - dayOfWeek + i);
      return d.toISOString().slice(0, 10);
    });
  };

  const weekDates = getWeekDates();

  const selectedDayEvents = selectedDay
    ? filtered.filter((e) => {
        if (!e.endDate || e.endDate === e.date) return e.date === selectedDay;
        return selectedDay >= e.date && selectedDay <= e.endDate;
      })
    : [];

  return (
    <div className="space-y-6" data-ocid="cal_view.root">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Academic Calendar
          </h1>
          <p className="text-sm text-muted-foreground">
            {events.length} events for 2024/2025 academic session
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            data-ocid="cal_view.print_button"
          >
            <Download size={14} className="mr-1" /> Export
          </Button>
          <div className="flex rounded-md border border-border overflow-hidden">
            {(["monthly", "weekly", "list"] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${view === v ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:bg-muted"}`}
                data-ocid={`cal_view.view_toggle.${v}`}
              >
                {v === "monthly" && <CalendarIcon size={14} />}
                {v === "weekly" && <CalendarDays size={14} />}
                {v === "list" && <List size={14} />}
              </button>
            ))}
          </div>
        </div>
      </div>

      {upcomingEvents.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
          {upcomingEvents.map((e) => (
            <Card
              key={e.id}
              className="border-border"
              data-ocid={`cal_view.upcoming.${e.id}`}
            >
              <CardContent className="p-3">
                <div
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium mb-2 ${typeColors[e.type] ?? "bg-muted text-foreground"}`}
                >
                  {e.type}
                </div>
                <p className="text-sm font-semibold text-foreground line-clamp-2">
                  {e.title}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{e.date}</p>
                <div className="flex items-center gap-1 mt-2 text-xs font-medium text-primary">
                  <Clock size={10} />
                  {getCountdown(e.date)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="flex gap-2 flex-wrap items-center">
        <span className="text-xs text-muted-foreground mr-1">Filter:</span>
        {types.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setFilterType(t)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${filterType === t ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/70"}`}
            data-ocid={`cal_view.filter.${t}`}
          >
            {t !== "All" && (
              <span
                className={`inline-block w-1.5 h-1.5 rounded-full mr-1 ${typeDot[t] ?? "bg-muted"}`}
              />
            )}
            {t}
          </button>
        ))}
      </div>

      {view === "monthly" && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={prevMonth}
                data-ocid="cal_view.prev_month"
              >
                <ChevronLeft size={16} />
              </Button>
              <CardTitle className="text-base">
                {MONTHS[currentMonth]} {currentYear}
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={nextMonth}
                data-ocid="cal_view.next_month"
              >
                <ChevronRight size={16} />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
              {WEEKDAYS.map((d) => (
                <div
                  key={d}
                  className="bg-muted/50 text-center text-xs font-semibold text-muted-foreground py-2"
                >
                  {d}
                </div>
              ))}
              {/* Remove extra biome-ignore comments */}
              {Array.from(
                { length: firstDay },
                (_, i) => `pad-${currentYear}-${currentMonth + 1}-${i}`,
              ).map((padKey) => (
                <div key={padKey} className="bg-background min-h-[80px]" />
              ))}
              {Array.from({ length: totalDays }).map((_, i) => {
                const day = i + 1;
                const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                const dayEvts = getEventsForDate(dateStr);
                const isToday = dateStr === todayStr;
                const isSelected = dateStr === selectedDay;
                return (
                  <button
                    type="button"
                    key={dateStr}
                    className={`bg-background min-h-[80px] p-1.5 text-left w-full hover:bg-muted/30 transition-colors ${isToday ? "ring-2 ring-primary ring-inset" : ""} ${isSelected ? "bg-primary/5" : ""}`}
                    onClick={() => setSelectedDay(isSelected ? null : dateStr)}
                    data-ocid={`cal_view.day.${dateStr}`}
                  >
                    <span
                      className={`text-xs font-medium ${isToday ? "bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center" : "text-foreground"}`}
                    >
                      {day}
                    </span>
                    <div className="space-y-0.5 mt-0.5">
                      {dayEvts.slice(0, 2).map((e) => (
                        <div
                          key={e.id}
                          className={`text-[10px] rounded px-1 truncate ${typeColors[e.type] ?? "bg-muted"}`}
                        >
                          {e.title}
                        </div>
                      ))}
                      {dayEvts.length > 2 && (
                        <div className="text-[10px] text-muted-foreground">
                          +{dayEvts.length - 2} more
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
            {selectedDay && selectedDayEvents.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-sm font-semibold text-foreground">
                  Events on {selectedDay}:
                </p>
                {selectedDayEvents.map((e) => (
                  <div
                    key={e.id}
                    className={`p-3 rounded-lg border text-sm ${typeColors[e.type] ?? "bg-muted"}`}
                  >
                    <div className="font-semibold">{e.title}</div>
                    {e.description && (
                      <div className="text-xs mt-0.5 opacity-80">
                        {e.description}
                      </div>
                    )}
                    {e.endDate && e.endDate !== e.date && (
                      <div className="text-xs mt-0.5 opacity-70">
                        Until {e.endDate}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {view === "weekly" && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">
              Week of {weekDates[0]} — {weekDates[6]}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2">
              {weekDates.map((date, i) => {
                const dayEvts = getEventsForDate(date);
                const isToday = date === todayStr;
                return (
                  <div
                    key={date}
                    className={`rounded-lg border p-2 min-h-[120px] ${isToday ? "border-primary bg-primary/5" : "border-border"}`}
                    data-ocid={`cal_view.week_day.${i}`}
                  >
                    <p
                      className={`text-xs font-semibold mb-1 ${isToday ? "text-primary" : "text-muted-foreground"}`}
                    >
                      {WEEKDAYS[i]} {date.slice(8)}
                    </p>
                    <div className="space-y-1">
                      {dayEvts.map((e) => (
                        <div
                          key={e.id}
                          className={`text-[10px] p-1 rounded ${typeColors[e.type] ?? "bg-muted"}`}
                        >
                          {e.title}
                        </div>
                      ))}
                      {dayEvts.length === 0 && (
                        <p className="text-[10px] text-muted-foreground">
                          No events
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {view === "list" && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">All Events</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2" data-ocid="cal_view.list">
            {filtered.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                <CalendarDays size={36} className="mx-auto mb-2 opacity-30" />
                No events match the selected filter.
              </div>
            )}
            {[...filtered]
              .sort((a, b) => a.date.localeCompare(b.date))
              .map((event, idx) => {
                const past = isPast(event.date);
                return (
                  <div
                    key={event.id}
                    className={`flex items-start gap-3 p-3 rounded-lg border transition-opacity ${past ? "opacity-50" : ""} ${typeColors[event.type] ?? "bg-muted border-border"}`}
                    data-ocid={`cal_view.event.${idx + 1}`}
                  >
                    <div className="flex-shrink-0 text-center w-12">
                      <p className="text-lg font-bold leading-tight">
                        {event.date.slice(8)}
                      </p>
                      <p className="text-[10px] uppercase opacity-70">
                        {MONTHS[Number(event.date.slice(5, 7)) - 1]?.slice(
                          0,
                          3,
                        )}
                      </p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">{event.title}</p>
                      {event.endDate && event.endDate !== event.date && (
                        <p className="text-xs opacity-70">
                          Until {event.endDate}
                        </p>
                      )}
                      {event.description && (
                        <p className="text-xs mt-0.5 opacity-80">
                          {event.description}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <Badge variant="outline" className="text-xs">
                        {event.type}
                      </Badge>
                      {!past && (
                        <span className="text-[10px] font-medium flex items-center gap-0.5">
                          <Clock size={10} /> {getCountdown(event.date)}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
          </CardContent>
        </Card>
      )}

      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
        {Object.entries(typeDot).map(([type, dot]) => (
          <span key={type} className="flex items-center gap-1">
            <span className={`w-2 h-2 rounded-full ${dot}`} /> {type}
          </span>
        ))}
      </div>
    </div>
  );
}
