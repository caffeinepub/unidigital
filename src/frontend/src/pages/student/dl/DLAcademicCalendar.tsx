import { Calendar, CheckCircle, Info } from "lucide-react";
import { Badge } from "../../../components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { ACADEMIC_CALENDAR_EVENTS } from "./DLTypes";

export function DLAcademicCalendar() {
  const today = new Date();

  const sortedEvents = [...ACADEMIC_CALENDAR_EVENTS].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  const upcoming = sortedEvents.filter((e) => new Date(e.date) >= today);
  const past = sortedEvents.filter((e) => new Date(e.date) < today);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-foreground">Academic Calendar</h2>
        <p className="text-sm text-muted-foreground">
          2024/2025 First Semester — Distance Learning Programme, FUEK
        </p>
      </div>

      {/* DL note */}
      <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
        <Info size={15} className="mt-0.5 shrink-0 text-blue-600" />
        <div>
          <p className="font-semibold">Distance Learning Schedule</p>
          <p className="mt-0.5 text-blue-700 text-xs leading-relaxed">
            DL-specific events are marked in blue. Study materials are released
            at the start of each semester. Live Saturday sessions run throughout
            teaching weeks. All end-of-semester exams are held on-campus at
            FUEK, Kontagora.
          </p>
        </div>
      </div>

      {/* Upcoming events */}
      {upcoming.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Calendar size={15} className="text-primary" />
              Upcoming Events
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {upcoming.map((ev) => (
              <div
                key={ev.date + ev.event}
                className={`flex items-start justify-between gap-3 p-3 rounded-lg border ${
                  ev.type === "dl"
                    ? "border-blue-200 bg-blue-50/40"
                    : "border-border bg-muted/20"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${ev.type === "dl" ? "bg-blue-500" : "bg-primary"}`}
                  />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {ev.event}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {new Date(ev.date).toLocaleDateString("en-NG", {
                        weekday: "long",
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <Badge
                  className={`text-xs shrink-0 ${ev.type === "dl" ? "bg-blue-100 text-blue-700 border-0" : "bg-primary/10 text-primary border-0"}`}
                >
                  {ev.type === "dl" ? "DL" : "Academic"}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Past events */}
      {past.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-muted-foreground">
              <CheckCircle size={15} className="text-green-500" />
              Past Events
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {past.map((ev) => (
              <div
                key={ev.date + ev.event}
                className="flex items-start justify-between gap-3 p-2 rounded-lg opacity-60"
              >
                <div className="flex items-start gap-3">
                  <CheckCircle
                    size={14}
                    className="text-green-500 mt-0.5 shrink-0"
                  />
                  <div>
                    <p className="text-sm text-muted-foreground line-through">
                      {ev.event}
                    </p>
                    <p className="text-xs text-muted-foreground/70 mt-0.5">
                      {new Date(ev.date).toLocaleDateString("en-NG", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <Badge className="text-xs bg-muted text-muted-foreground border-0 shrink-0">
                  Completed
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
