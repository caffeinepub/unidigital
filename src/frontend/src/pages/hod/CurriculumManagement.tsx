import {
  BookOpen,
  CheckCircle,
  Clock,
  Plus,
  Printer,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Label } from "../../components/ui/label";
import { Separator } from "../../components/ui/separator";
import { getLocalCourses } from "../../utils/sampleData";

const LS_CURRICULUM = "unidigital_curriculum";

interface CurriculumEntry {
  id: string;
  department: string;
  level: string;
  semester: string;
  courseCode: string;
  type: "compulsory" | "elective";
  approvalStatus: "proposed" | "approved" | "rejected";
  proposedBy?: string;
  approvedBy?: string;
  creditMax: number;
}

function loadCurriculum(): CurriculumEntry[] {
  return JSON.parse(localStorage.getItem(LS_CURRICULUM) || "[]");
}
function saveCurriculum(data: CurriculumEntry[]) {
  localStorage.setItem(LS_CURRICULUM, JSON.stringify(data));
}

const DEPARTMENTS = [
  "Computer Science",
  "Engineering",
  "Medicine",
  "Law",
  "Business Administration",
  "General Studies",
  "Education & Biology",
  "Education & Chemistry",
  "Education & Mathematics",
  "Education & Physics",
  "Education & Computer Science",
  "Entrepreneurship Education",
  "Health Education",
  "Human Kinetics Education",
];
const LEVELS = ["100", "200", "300", "400", "500", "600"];
const SEMESTERS = [
  "2024/2025 First",
  "2024/2025 Second",
  "2023/2024 First",
  "2023/2024 Second",
];

interface Props {
  department?: string;
}

export function CurriculumManagement({ department }: Props) {
  const courses = getLocalCourses();
  const [curriculumList, setCurriculumList] =
    useState<CurriculumEntry[]>(loadCurriculum);
  const [dept, setDept] = useState(department ?? "Computer Science");
  const [level, setLevel] = useState("100");
  const [semester, setSemester] = useState("2024/2025 First");
  const [viewMode, setViewMode] = useState<"builder" | "overview">("builder");

  const updateCurriculum = (updated: CurriculumEntry[]) => {
    setCurriculumList(updated);
    saveCurriculum(updated);
  };

  const currCourses = curriculumList.filter(
    (e) =>
      e.department === dept && e.level === level && e.semester === semester,
  );

  const totalCU = currCourses.reduce((sum, e) => {
    const c = courses.find((x) => x.code === e.courseCode);
    return sum + (c?.creditUnits ?? 0);
  }, 0);

  const addCourse = (courseCode: string) => {
    if (currCourses.find((e) => e.courseCode === courseCode)) return;
    const course = courses.find((c) => c.code === courseCode);
    if (totalCU + (course?.creditUnits ?? 0) > 24) {
      alert(
        `Credit load limit (24 CU) would be exceeded. Current: ${totalCU} CU.`,
      );
      return;
    }
    updateCurriculum([
      ...curriculumList,
      {
        id: `CURR-${Date.now()}`,
        department: dept,
        level,
        semester,
        courseCode,
        type: "compulsory",
        approvalStatus: "proposed",
        proposedBy: "HOD",
        creditMax: 24,
      },
    ]);
  };

  const removeEntry = (id: string) =>
    updateCurriculum(curriculumList.filter((e) => e.id !== id));
  const approveEntry = (id: string) =>
    updateCurriculum(
      curriculumList.map((e) =>
        e.id === id
          ? { ...e, approvalStatus: "approved", approvedBy: "HOD" }
          : e,
      ),
    );

  const setType = (id: string, type: "compulsory" | "elective") =>
    updateCurriculum(
      curriculumList.map((e) => (e.id === id ? { ...e, type } : e)),
    );

  // Print curriculum
  const printCurriculum = () => {
    const lines = [
      "CURRICULUM PLAN",
      `Department: ${dept}`,
      `Level: ${level} | Semester: ${semester}`,
      `Total Credit Units: ${totalCU} / 24`,
      "=".repeat(68),
      "S/N  Code          Title                                    CU  Type       Status",
      "-".repeat(68),
      ...currCourses.map((e, i) => {
        const c = courses.find((x) => x.code === e.courseCode);
        const sn = String(i + 1).padEnd(5);
        const code = e.courseCode.padEnd(14);
        const title = (c?.title ?? "Unknown").substring(0, 40).padEnd(41);
        const cu = String(c?.creditUnits ?? 0).padEnd(4);
        const type = e.type.padEnd(11);
        return `${sn}${code}${title}${cu}${type}${e.approvalStatus}`;
      }),
      "",
      `Total: ${currCourses.length} course(s), ${totalCU} credit units`,
    ];
    const win = window.open("", "_blank");
    if (win) {
      win.document.write(
        `<html><head><title>Curriculum</title><style>body{font-family:monospace;padding:20px;font-size:13px}pre{white-space:pre-wrap}</style></head><body><pre>${lines.join("\n")}</pre></body></html>`,
      );
      win.document.close();
      win.print();
    }
  };

  // Overview: all levels for this department/semester
  const overviewData = LEVELS.map((lvl) => {
    const entries = curriculumList.filter(
      (e) =>
        e.department === dept && e.level === lvl && e.semester === semester,
    );
    const cu = entries.reduce((sum, e) => {
      const c = courses.find((x) => x.code === e.courseCode);
      return sum + (c?.creditUnits ?? 0);
    }, 0);
    return { level: lvl, entries, cu };
  }).filter((d) => d.entries.length > 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Curriculum Management
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Build and review department curriculum by level and semester.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setViewMode(viewMode === "builder" ? "overview" : "builder")
            }
            data-ocid="curriculum-mgmt.toggle_view"
          >
            {viewMode === "builder" ? "Department Overview" : "Builder View"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={printCurriculum}
            data-ocid="curriculum-mgmt.print_button"
          >
            <Printer size={14} className="mr-1.5" /> Print
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="flex gap-4 flex-wrap">
            <div>
              <Label className="text-xs">Department</Label>
              <select
                className="block w-full mt-1 border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none min-w-[200px]"
                value={dept}
                onChange={(e) => setDept(e.target.value)}
                data-ocid="curriculum-mgmt.dept_select"
              >
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label className="text-xs">Level</Label>
              <select
                className="block w-full mt-1 border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                data-ocid="curriculum-mgmt.level_select"
              >
                {LEVELS.map((l) => (
                  <option key={l} value={l}>
                    Level {l}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label className="text-xs">Semester</Label>
              <select
                className="block w-full mt-1 border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none"
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                data-ocid="curriculum-mgmt.semester_select"
              >
                {SEMESTERS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ─── Overview mode ─────────────────────────────────────── */}
      {viewMode === "overview" && (
        <div className="space-y-4">
          <h2 className="text-base font-semibold text-foreground">
            {dept} — {semester} — All Levels
          </h2>
          {overviewData.length === 0 ? (
            <Card>
              <CardContent
                className="py-10 text-center text-muted-foreground"
                data-ocid="curriculum-mgmt.overview_empty"
              >
                <BookOpen size={36} className="mx-auto mb-3 opacity-30" />
                <p>
                  No curriculum built for {dept} in {semester}.
                </p>
              </CardContent>
            </Card>
          ) : (
            overviewData.map((d) => (
              <Card key={d.level}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">
                      Level {d.level}{" "}
                      <span className="text-muted-foreground font-normal ml-2">
                        {d.cu} CU total
                      </span>
                    </CardTitle>
                    <Badge
                      className={`border-0 text-xs ${d.cu > 20 ? "bg-red-100 text-red-700" : d.cu > 15 ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"}`}
                    >
                      {d.cu} / 24 CU
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-muted/40">
                          {["Code", "Title", "CU", "Type", "Status"].map(
                            (h) => (
                              <th
                                key={h}
                                className={`px-4 py-2 font-medium text-muted-foreground ${h === "CU" ? "text-center" : "text-left"}`}
                              >
                                {h}
                              </th>
                            ),
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {d.entries.map((e) => {
                          const c = courses.find(
                            (x) => x.code === e.courseCode,
                          );
                          return (
                            <tr
                              key={e.id}
                              className="border-b last:border-0 hover:bg-muted/20"
                              data-ocid={`curriculum-mgmt.overview_row.${e.id}`}
                            >
                              <td className="px-4 py-2.5 font-mono font-medium text-foreground">
                                {e.courseCode}
                              </td>
                              <td className="px-4 py-2.5 text-foreground">
                                {c?.title ?? "Unknown"}
                              </td>
                              <td className="px-4 py-2.5 text-center font-bold text-primary">
                                {c?.creditUnits ?? "—"}
                              </td>
                              <td className="px-4 py-2.5">
                                <Badge
                                  className={`border-0 text-xs ${e.type === "elective" ? "bg-blue-100 text-blue-700" : "bg-muted text-muted-foreground"}`}
                                >
                                  {e.type}
                                </Badge>
                              </td>
                              <td className="px-4 py-2.5">
                                <Badge
                                  className={`border-0 text-xs ${e.approvalStatus === "approved" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}
                                >
                                  {e.approvalStatus === "approved" ? (
                                    <CheckCircle
                                      size={10}
                                      className="inline mr-1"
                                    />
                                  ) : (
                                    <Clock size={10} className="inline mr-1" />
                                  )}
                                  {e.approvalStatus}
                                </Badge>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* ─── Builder mode ──────────────────────────────────────── */}
      {viewMode === "builder" && (
        <div className="space-y-4">
          {/* Credit load indicator */}
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">
                  Credit Load for Level {level}
                </span>
                <span
                  className={`text-sm font-bold ${totalCU > 24 ? "text-destructive" : totalCU > 20 ? "text-amber-600" : "text-foreground"}`}
                >
                  {totalCU} / 24 CU
                </span>
              </div>
              <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${totalCU > 24 ? "bg-destructive" : totalCU > 20 ? "bg-amber-500" : totalCU > 15 ? "bg-yellow-400" : "bg-green-500"}`}
                  style={{ width: `${Math.min(100, (totalCU / 24) * 100)}%` }}
                />
              </div>
              {totalCU > 24 && (
                <p className="text-xs text-destructive mt-1">
                  ⚠ Credit load exceeds maximum of 24 units.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Current curriculum for selected scope */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">
                  Level {level} Curriculum ({currCourses.length} courses)
                </CardTitle>
                {currCourses.some((e) => e.approvalStatus === "proposed") && (
                  <Button
                    size="sm"
                    onClick={() => {
                      const toApprove = currCourses
                        .filter((e) => e.approvalStatus === "proposed")
                        .map((e) => e.id);
                      updateCurriculum(
                        curriculumList.map((e) =>
                          toApprove.includes(e.id)
                            ? { ...e, approvalStatus: "approved" }
                            : e,
                        ),
                      );
                    }}
                    data-ocid="curriculum-mgmt.approve_all_button"
                  >
                    <CheckCircle size={13} className="mr-1" /> Approve All
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {currCourses.length === 0 ? (
                <p
                  className="text-sm text-muted-foreground py-8 text-center"
                  data-ocid="curriculum-mgmt.builder_empty"
                >
                  No courses added to this curriculum yet. Add from the catalog
                  below.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/40">
                        {[
                          "Code",
                          "Title",
                          "CU",
                          "Type",
                          "Status",
                          "Actions",
                        ].map((h) => (
                          <th
                            key={h}
                            className={`px-4 py-3 font-medium text-muted-foreground ${h === "CU" || h === "Actions" ? "text-center" : "text-left"}`}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {currCourses.map((e, i) => {
                        const c = courses.find((x) => x.code === e.courseCode);
                        return (
                          <tr
                            key={e.id}
                            className="border-b last:border-0 hover:bg-muted/20"
                            data-ocid={`curriculum-mgmt.row.${i + 1}`}
                          >
                            <td className="px-4 py-3 font-mono font-medium text-foreground">
                              {e.courseCode}
                            </td>
                            <td className="px-4 py-3 text-foreground">
                              {c?.title ?? "Unknown"}
                            </td>
                            <td className="px-4 py-3 text-center font-bold text-primary">
                              {c?.creditUnits ?? "—"}
                            </td>
                            <td className="px-4 py-3">
                              <select
                                className="border border-input rounded px-2 py-1 text-xs bg-background focus:outline-none"
                                value={e.type}
                                onChange={(ev) =>
                                  setType(
                                    e.id,
                                    ev.target.value as
                                      | "compulsory"
                                      | "elective",
                                  )
                                }
                                data-ocid={`curriculum-mgmt.type_select.${i + 1}`}
                              >
                                <option value="compulsory">Compulsory</option>
                                <option value="elective">Elective</option>
                              </select>
                            </td>
                            <td className="px-4 py-3">
                              {e.approvalStatus === "proposed" ? (
                                <Badge className="bg-amber-100 text-amber-700 border-0 text-xs">
                                  <Clock size={10} className="mr-1" /> Proposed
                                </Badge>
                              ) : (
                                <Badge className="bg-green-100 text-green-700 border-0 text-xs">
                                  <CheckCircle size={10} className="mr-1" />{" "}
                                  Approved
                                </Badge>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1 justify-center">
                                {e.approvalStatus === "proposed" && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => approveEntry(e.id)}
                                    data-ocid={`curriculum-mgmt.approve.${i + 1}`}
                                  >
                                    Approve
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-destructive hover:text-destructive"
                                  onClick={() => removeEntry(e.id)}
                                  data-ocid={`curriculum-mgmt.remove.${i + 1}`}
                                >
                                  <Trash2 size={14} />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          <Separator />

          {/* Add courses from catalog */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Add from Course Catalog
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {courses.filter(
                (c) => !currCourses.find((e) => e.courseCode === c.code),
              ).length === 0 ? (
                <p className="text-sm text-muted-foreground py-6 text-center">
                  All available courses have been added to this curriculum.
                </p>
              ) : (
                <div className="overflow-hidden max-h-72 overflow-y-auto">
                  {courses
                    .filter(
                      (c) => !currCourses.find((e) => e.courseCode === c.code),
                    )
                    .map((c) => (
                      <div
                        key={c.code}
                        className="flex items-center justify-between px-4 py-2.5 border-b last:border-0 hover:bg-muted/30"
                        data-ocid={`curriculum-mgmt.catalog_row.${c.code}`}
                      >
                        <div className="min-w-0">
                          <span className="font-mono text-sm font-medium text-foreground">
                            {c.code}
                          </span>
                          <span className="text-sm text-muted-foreground ml-2 truncate">
                            {c.title}
                          </span>
                          <span className="ml-2 text-xs text-muted-foreground">
                            {c.creditUnits} CU
                          </span>
                          <span className="ml-1 text-xs text-muted-foreground">
                            • {c.department}
                          </span>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => addCourse(c.code)}
                          data-ocid={`curriculum-mgmt.add_course.${c.code}`}
                        >
                          <Plus size={13} className="mr-1" /> Add
                        </Button>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
