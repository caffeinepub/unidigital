import { Activity, AlertCircle, CheckCircle, Clock, Info } from "lucide-react";
import { Badge } from "../../../components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Progress } from "../../../components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { DEMO_COURSE_ACCESS } from "./DLTypes";

const MIN_HOURS = 10; // minimum hours per course for "adequate"

function statusIcon(status: string) {
  if (status === "adequate")
    return <CheckCircle size={14} className="text-green-500 shrink-0" />;
  if (status === "at-risk")
    return <AlertCircle size={14} className="text-amber-500 shrink-0" />;
  return <AlertCircle size={14} className="text-red-500 shrink-0" />;
}

function statusBadge(status: string) {
  if (status === "adequate")
    return (
      <Badge className="bg-green-100 text-green-700 border-0 text-xs">
        Adequate
      </Badge>
    );
  if (status === "at-risk")
    return (
      <Badge className="bg-amber-100 text-amber-700 border-0 text-xs">
        At Risk
      </Badge>
    );
  return (
    <Badge className="bg-red-100 text-red-700 border-0 text-xs">
      Insufficient
    </Badge>
  );
}

export function DLAttendance() {
  const totalHours = DEMO_COURSE_ACCESS.reduce((s, c) => s + c.hoursOnline, 0);
  const adequate = DEMO_COURSE_ACCESS.filter(
    (c) => c.status === "adequate",
  ).length;
  const atRisk = DEMO_COURSE_ACCESS.filter(
    (c) => c.status === "at-risk",
  ).length;
  const insufficient = DEMO_COURSE_ACCESS.filter(
    (c) => c.status === "insufficient",
  ).length;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-foreground">
          Distance Learning Attendance Record
        </h2>
        <p className="text-sm text-muted-foreground">
          Online access log — 2024/2025 First Semester &bull; Minimum 10 hours
          online per course required
        </p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: "Total Hours Online",
            value: `${totalHours}h`,
            color: "text-primary",
          },
          {
            label: "Courses Adequate",
            value: String(adequate),
            color: "text-green-600",
          },
          {
            label: "Courses At Risk",
            value: String(atRisk),
            color: "text-amber-600",
          },
          {
            label: "Courses Insufficient",
            value: String(insufficient),
            color: "text-red-600",
          },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-3 text-center">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Info */}
      <div className="flex items-start gap-3 bg-muted/30 border border-border rounded-lg p-4 text-sm">
        <Info size={15} className="mt-0.5 shrink-0 text-primary" />
        <div className="text-muted-foreground text-xs leading-relaxed">
          Online attendance is tracked by your course material access on this
          portal. A minimum of <strong>10 hours</strong> online engagement per
          course is required each semester. Saturday live sessions also count
          toward your attendance record. Students marked "Insufficient" may be
          barred from end-of-semester exams for the affected course.
        </div>
      </div>

      {/* Access log table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Activity size={15} className="text-primary" />
            Course Access Log
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course</TableHead>
                  <TableHead>Course Title</TableHead>
                  <TableHead>Last Accessed</TableHead>
                  <TableHead className="text-center">Hours Online</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {DEMO_COURSE_ACCESS.map((c) => {
                  const pct = Math.min(
                    100,
                    Math.round((c.hoursOnline / MIN_HOURS) * 100),
                  );
                  return (
                    <TableRow key={c.courseCode}>
                      <TableCell className="font-mono font-semibold text-primary text-xs">
                        {c.courseCode}
                      </TableCell>
                      <TableCell className="text-sm">{c.courseTitle}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock size={11} />
                          {new Date(c.lastAccessed).toLocaleDateString(
                            "en-NG",
                            { day: "2-digit", month: "short" },
                          )}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="flex items-center justify-center gap-1">
                          {statusIcon(c.status)}
                          <span className="font-semibold">
                            {c.hoursOnline}h
                          </span>
                        </span>
                      </TableCell>
                      <TableCell className="min-w-[100px]">
                        <div className="flex items-center gap-2">
                          <Progress value={pct} className="h-1.5 flex-1" />
                          <span className="text-xs text-muted-foreground w-8">
                            {pct}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{statusBadge(c.status)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
