import { Calendar, Download, Info, Printer } from "lucide-react";
import { useRef } from "react";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";

const TIMETABLE_SLOTS = [
  "9:00am–11:00am",
  "11:00am–1:00pm",
  "2:00pm–4:00pm",
  "4:00pm–6:00pm",
];

const WEEKLY_TIMETABLE: Record<
  string,
  Record<string, { code: string; title: string } | null>
> = {
  Monday: {
    "9:00am–11:00am": null,
    "11:00am–1:00pm": null,
    "2:00pm–4:00pm": null,
    "4:00pm–6:00pm": null,
  },
  Tuesday: {
    "9:00am–11:00am": null,
    "11:00am–1:00pm": null,
    "2:00pm–4:00pm": null,
    "4:00pm–6:00pm": null,
  },
  Wednesday: {
    "9:00am–11:00am": null,
    "11:00am–1:00pm": null,
    "2:00pm–4:00pm": null,
    "4:00pm–6:00pm": null,
  },
  Thursday: {
    "9:00am–11:00am": null,
    "11:00am–1:00pm": null,
    "2:00pm–4:00pm": null,
    "4:00pm–6:00pm": null,
  },
  Friday: {
    "9:00am–11:00am": null,
    "11:00am–1:00pm": null,
    "2:00pm–4:00pm": null,
    "4:00pm–6:00pm": null,
  },
  Saturday: {
    "9:00am–11:00am": {
      code: "ENT 211",
      title: "Entrepreneurship & Innovation",
    },
    "11:00am–1:00pm": { code: "COS 201", title: "Computer Programming I" },
    "2:00pm–4:00pm": {
      code: "EDU 201",
      title: "Curriculum & Teaching Methods",
    },
    "4:00pm–6:00pm": { code: "SED 203", title: "Mathematics Subject Method" },
  },
};

const ASYNC_COURSES = [
  {
    code: "ENT 211",
    title: "Entrepreneurship & Innovation",
    note: "Video lectures available Mon–Sun, access any time",
  },
  {
    code: "EDU 201",
    title: "Curriculum & Teaching Methods",
    note: "Lecture notes + recorded sessions; quiz on Week 6",
  },
  {
    code: "EDU 203",
    title: "Educational Technology & AI",
    note: "Fully async; materials updated weekly",
  },
  {
    code: "COS 201",
    title: "Computer Programming I",
    note: "Code labs available on portal; live help Saturdays",
  },
  {
    code: "MTH 201",
    title: "Mathematical Methods I",
    note: "Lecture notes + worked examples; practicals Saturdays",
  },
  {
    code: "SED 203",
    title: "Mathematics Subject Method",
    note: "Case studies & discussions; submission portal open",
  },
];

export function DLTimetable() {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const content = printRef.current;
    if (!content) return;
    const win = window.open("", "_blank", "width=900,height=700");
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html><head>
      <title>DL Timetable</title>
      <style>
        body { font-family: Arial, sans-serif; font-size: 10pt; padding: 15mm; }
        table { width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 9pt; }
        th, td { border: 1px solid #999; padding: 6px 8px; }
        th { background: #003087; color: #fff; font-weight: bold; }
        @media print { body { padding: 10mm; } }
      </style></head><body>${content.innerHTML}</body></html>`);
    win.document.close();
    win.focus();
    setTimeout(() => {
      win.print();
      win.close();
    }, 300);
  };

  const days = Object.keys(WEEKLY_TIMETABLE);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-lg font-bold text-foreground">
            Timetable — Distance Learning
          </h2>
          <p className="text-sm text-muted-foreground">
            2024/2025 First Semester &bull; Live Sessions: Saturdays 9am–6pm
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handlePrint}
            className="gap-1.5"
            data-ocid="dl.timetable.print"
          >
            <Printer size={14} /> Print
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5"
            data-ocid="dl.timetable.download"
          >
            <Download size={14} /> Download
          </Button>
        </div>
      </div>

      {/* DL notice */}
      <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
        <Info size={16} className="mt-0.5 shrink-0 text-blue-600" />
        <div>
          <p className="font-semibold">Distance Learning Delivery Mode</p>
          <p className="mt-0.5 text-blue-700">
            Courses are available <strong>asynchronously</strong> — access
            lecture notes, videos, and materials any time via the Course
            Materials portal.{" "}
            <strong>Live sessions are held every Saturday 9am–6pm</strong> at
            study centres in Kontagora, Minna, and Abuja. End-of-semester exams
            are on-campus at FUEK, Kontagora.
          </p>
        </div>
      </div>

      <div ref={printRef} className="space-y-4">
        {/* Weekly grid */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Calendar size={15} className="text-primary" />
              Weekly Schedule Grid
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr>
                    <th className="border border-border bg-muted/60 p-2 text-left font-semibold text-muted-foreground w-24">
                      Day
                    </th>
                    {TIMETABLE_SLOTS.map((slot) => (
                      <th
                        key={slot}
                        className="border border-border bg-muted/60 p-2 text-center font-semibold text-muted-foreground text-xs"
                      >
                        {slot}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {days.map((day) => (
                    <tr
                      key={day}
                      className={day === "Saturday" ? "bg-[#003087]/5" : ""}
                    >
                      <td className="border border-border p-2 font-semibold text-foreground text-xs">
                        {day}
                        {day === "Saturday" && (
                          <Badge className="ml-1 bg-[#FFD700]/20 text-[#003087] border-[#FFD700]/40 text-[10px]">
                            Live
                          </Badge>
                        )}
                      </td>
                      {TIMETABLE_SLOTS.map((slot) => {
                        const entry = WEEKLY_TIMETABLE[day]?.[slot];
                        return (
                          <td
                            key={slot}
                            className="border border-border p-2 text-center"
                          >
                            {entry ? (
                              <div>
                                <p className="font-mono text-xs font-semibold text-primary">
                                  {entry.code}
                                </p>
                                <p className="text-[10px] text-muted-foreground leading-tight">
                                  {entry.title}
                                </p>
                              </div>
                            ) : (
                              <span className="text-[11px] text-muted-foreground/50">
                                {day === "Saturday" ? (
                                  "—"
                                ) : (
                                  <span className="italic">Async</span>
                                )}
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Async delivery schedule */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">
              Asynchronous Course Access Schedule
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {ASYNC_COURSES.map((c) => (
              <div
                key={c.code}
                className="flex items-start justify-between gap-3 p-3 rounded-lg border border-border bg-muted/20"
              >
                <div>
                  <p className="font-mono text-xs font-semibold text-primary">
                    {c.code}
                  </p>
                  <p className="text-sm font-medium text-foreground">
                    {c.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {c.note}
                  </p>
                </div>
                <Badge className="bg-blue-100 text-blue-700 border-0 text-xs shrink-0">
                  Async
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
