import { BookOpen, Filter, GraduationCap, Search } from "lucide-react";
import { useState } from "react";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Separator } from "../../components/ui/separator";
import {
  FUEK_BIO_COURSES,
  FUEK_CSC_COURSES,
  type FuekCourse,
} from "../../utils/fuekCourseData";
import { getLocalCourses, getLocalStaff } from "../../utils/sampleData";

const DEPARTMENTS = [
  "Computer Science",
  "Biology",
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

// ── Department Curriculum Tab ─────────────────────────────────────────────────

const LEVELS = [100, 200, 300, 400] as const;
const SEMESTERS = ["First", "Second"] as const;

interface CurriculumTableProps {
  courses: FuekCourse[];
  dept: "Computer Science" | "Biology";
}

function CurriculumSemesterTable({
  courses,
  level,
  semester,
}: {
  courses: FuekCourse[];
  level: number;
  semester: string;
}) {
  const filtered = courses.filter(
    (c) =>
      c.level === level && (c.semester === semester || c.semester === "Both"),
  );
  if (filtered.length === 0) return null;
  const totalCU = filtered.reduce((s, c) => s + c.creditUnits, 0);
  const compulsory = filtered.filter((c) => c.type === "compulsory");
  const elective = filtered.filter((c) => c.type === "elective");

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-semibold text-sm text-foreground">
          {level} Level — {semester} Semester
        </h4>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{compulsory.length} compulsory</span>
          {elective.length > 0 && <span>· {elective.length} elective</span>}
          <Badge className="bg-primary/10 text-primary border-0 text-xs">
            {totalCU} CU total
          </Badge>
        </div>
      </div>
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/40">
              <th className="text-left px-3 py-2 text-xs text-muted-foreground font-medium w-8">
                S/N
              </th>
              <th className="text-left px-3 py-2 text-xs text-muted-foreground font-medium">
                Code
              </th>
              <th className="text-left px-3 py-2 text-xs text-muted-foreground font-medium">
                Title
              </th>
              <th className="text-center px-3 py-2 text-xs text-muted-foreground font-medium">
                CU
              </th>
              <th className="text-center px-3 py-2 text-xs text-muted-foreground font-medium">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c, i) => (
              <tr
                key={c.id}
                className="border-b last:border-0 hover:bg-muted/20"
                data-ocid={`curriculum.row.${c.code}`}
              >
                <td className="px-3 py-2 text-xs text-muted-foreground">
                  {i + 1}
                </td>
                <td className="px-3 py-2 font-mono font-semibold text-xs text-primary">
                  {c.code}
                </td>
                <td className="px-3 py-2 text-sm text-foreground">{c.title}</td>
                <td className="px-3 py-2 text-center font-bold text-sm">
                  {c.creditUnits}
                </td>
                <td className="px-3 py-2 text-center">
                  <Badge
                    className={`text-xs border-0 ${
                      c.type === "compulsory"
                        ? "bg-green-100 text-green-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {c.type === "compulsory" ? "Core" : "Elective"}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-muted/30 border-t">
              <td
                colSpan={3}
                className="px-3 py-2 text-xs font-semibold text-foreground text-right"
              >
                TOTAL
              </td>
              <td className="px-3 py-2 text-center font-bold text-sm text-primary">
                {totalCU}
              </td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

function DepartmentCurriculum({ courses, dept }: CurriculumTableProps) {
  const [selectedLevel, setSelectedLevel] = useState<number | "all">("all");

  const totalCU = courses.reduce((s, c) => s + c.creditUnits, 0);
  const totalCompulsory = courses.filter((c) => c.type === "compulsory").length;
  const totalElective = courses.filter((c) => c.type === "elective").length;

  const levelsToShow =
    selectedLevel === "all" ? LEVELS : ([selectedLevel] as const);

  return (
    <div className="space-y-4">
      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card>
          <CardContent className="pt-3 pb-3 text-center">
            <p className="text-xl font-bold text-foreground">
              {courses.length}
            </p>
            <p className="text-xs text-muted-foreground">Total Courses</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-3 pb-3 text-center">
            <p className="text-xl font-bold text-primary">{totalCU}</p>
            <p className="text-xs text-muted-foreground">Total Credit Units</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-3 pb-3 text-center">
            <p className="text-xl font-bold text-green-700">
              {totalCompulsory}
            </p>
            <p className="text-xs text-muted-foreground">Compulsory</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-3 pb-3 text-center">
            <p className="text-xl font-bold text-blue-700">{totalElective}</p>
            <p className="text-xs text-muted-foreground">Elective</p>
          </CardContent>
        </Card>
      </div>

      {/* Level filter */}
      <div className="flex gap-2 flex-wrap">
        <Button
          size="sm"
          variant={selectedLevel === "all" ? "default" : "outline"}
          onClick={() => setSelectedLevel("all")}
        >
          All Levels
        </Button>
        {LEVELS.map((l) => (
          <Button
            key={l}
            size="sm"
            variant={selectedLevel === l ? "default" : "outline"}
            onClick={() => setSelectedLevel(l)}
          >
            {l}L
          </Button>
        ))}
      </div>

      {/* Curriculum tables */}
      <div>
        <p className="text-xs text-muted-foreground mb-4 bg-muted/30 rounded-lg px-3 py-2 border border-border">
          <strong>Faculty of Science Education, FUEK</strong> · Department of{" "}
          {dept} · Min 15 / Max 24 CU per semester · 120 CU min to graduate
          (UTME) · 90 CU (DE)
        </p>
        {levelsToShow.map((level) =>
          SEMESTERS.map((sem) => (
            <CurriculumSemesterTable
              key={`${level}-${sem}`}
              courses={courses}
              level={level}
              semester={sem}
            />
          )),
        )}
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export function CourseCatalog() {
  const courses = getLocalCourses();
  const staff = getLocalStaff();

  const [search, setSearch] = useState("");
  const [filterDept, setFilterDept] = useState("all");
  const [filterSem, setFilterSem] = useState("all");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [expandedCode, setExpandedCode] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"catalog" | "csc" | "bio">(
    "catalog",
  );

  // Get unique semesters
  const semesters = Array.from(new Set(courses.map((c) => c.semester))).sort();

  const filtered = courses.filter((c) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      c.code.toLowerCase().includes(q) ||
      c.title.toLowerCase().includes(q) ||
      c.department.toLowerCase().includes(q);
    const matchDept = filterDept === "all" || c.department === filterDept;
    const matchSem = filterSem === "all" || c.semester === filterSem;
    return matchSearch && matchDept && matchSem;
  });

  // Group by department for grid view
  const byDept = DEPARTMENTS.reduce<Record<string, typeof filtered>>(
    (acc, d) => {
      const dCourses = filtered.filter((c) => c.department === d);
      if (dCourses.length > 0) acc[d] = dCourses;
      return acc;
    },
    {},
  );

  const totalCU = filtered.reduce((sum, c) => sum + c.creditUnits, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Course Catalog</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Browse all registered courses, credit units, departments, and assigned
          lecturers.
        </p>
      </div>

      {/* Tab selector */}
      <div className="flex gap-2 border-b border-border pb-3 flex-wrap">
        <Button
          size="sm"
          variant={activeTab === "catalog" ? "default" : "outline"}
          onClick={() => setActiveTab("catalog")}
          data-ocid="course-catalog.tab_catalog"
        >
          <BookOpen size={14} className="mr-1.5" />
          Full Catalog
        </Button>
        <Button
          size="sm"
          variant={activeTab === "csc" ? "default" : "outline"}
          onClick={() => setActiveTab("csc")}
          data-ocid="course-catalog.tab_csc"
        >
          <GraduationCap size={14} className="mr-1.5" />
          B.Sc (Ed) Computer Science
        </Button>
        <Button
          size="sm"
          variant={activeTab === "bio" ? "default" : "outline"}
          onClick={() => setActiveTab("bio")}
          data-ocid="course-catalog.tab_bio"
        >
          <GraduationCap size={14} className="mr-1.5" />
          B.Sc (Ed) Biology
        </Button>
      </div>

      {/* CSC Curriculum */}
      {activeTab === "csc" && (
        <div>
          <div className="mb-4">
            <h2 className="text-lg font-bold text-foreground">
              B.Sc (Ed) Computer Science — Official FUEK Curriculum
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Department of Computer Science · Faculty of Science Education ·
              Federal University of Education, Kontagora
            </p>
          </div>
          <DepartmentCurriculum
            courses={FUEK_CSC_COURSES}
            dept="Computer Science"
          />
        </div>
      )}

      {/* BIO Curriculum */}
      {activeTab === "bio" && (
        <div>
          <div className="mb-4">
            <h2 className="text-lg font-bold text-foreground">
              B.Sc (Ed) Biology — Official FUEK Curriculum
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Department of Biology · Faculty of Science Education · Federal
              University of Education, Kontagora
            </p>
          </div>
          <DepartmentCurriculum courses={FUEK_BIO_COURSES} dept="Biology" />
        </div>
      )}

      {/* Full Catalog */}
      {activeTab === "catalog" && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-4 pb-4 text-center">
                <p className="text-2xl font-bold text-foreground">
                  {courses.length}
                </p>
                <p className="text-sm text-muted-foreground">Total Courses</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-4 text-center">
                <p className="text-2xl font-bold text-primary">
                  {filtered.length}
                </p>
                <p className="text-sm text-muted-foreground">Showing</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-4 text-center">
                <p className="text-2xl font-bold text-foreground">
                  {Object.keys(byDept).length}
                </p>
                <p className="text-sm text-muted-foreground">Departments</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-4 text-center">
                <p className="text-2xl font-bold text-green-700">{totalCU}</p>
                <p className="text-sm text-muted-foreground">
                  Total Credit Units
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Search & filters */}
          <div className="flex gap-3 flex-wrap items-end">
            <div className="relative flex-1 min-w-[200px]">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                className="pl-9"
                placeholder="Search by course code, title, or department..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                data-ocid="course-catalog.search_input"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter size={14} className="text-muted-foreground" />
              <select
                className="border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none"
                value={filterDept}
                onChange={(e) => setFilterDept(e.target.value)}
                data-ocid="course-catalog.filter_dept"
              >
                <option value="all">All Departments</option>
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
              <select
                className="border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none"
                value={filterSem}
                onChange={(e) => setFilterSem(e.target.value)}
                data-ocid="course-catalog.filter_semester"
              >
                <option value="all">All Semesters</option>
                {semesters.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant={viewMode === "table" ? "default" : "outline"}
                onClick={() => setViewMode("table")}
                data-ocid="course-catalog.view_table"
              >
                Table
              </Button>
              <Button
                size="sm"
                variant={viewMode === "grid" ? "default" : "outline"}
                onClick={() => setViewMode("grid")}
                data-ocid="course-catalog.view_grid"
              >
                By Dept
              </Button>
            </div>
          </div>

          {filtered.length === 0 && (
            <div
              className="py-16 text-center text-muted-foreground border rounded-xl bg-muted/20"
              data-ocid="course-catalog.empty_state"
            >
              <BookOpen size={48} className="mx-auto mb-3 opacity-30" />
              <p className="font-medium">No courses match your filters.</p>
              <Button
                variant="ghost"
                size="sm"
                className="mt-3"
                onClick={() => {
                  setSearch("");
                  setFilterDept("all");
                  setFilterSem("all");
                }}
              >
                Clear filters
              </Button>
            </div>
          )}

          {/* TABLE VIEW */}
          {viewMode === "table" && filtered.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  All Courses ({filtered.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/40">
                        <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                          Code
                        </th>
                        <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                          Title
                        </th>
                        <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                          Department
                        </th>
                        <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                          Semester
                        </th>
                        <th className="text-center px-4 py-3 font-medium text-muted-foreground">
                          CU
                        </th>
                        <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                          Lecturer
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((c, i) => {
                        const lecturer = staff.find(
                          (s) => s.staffId === c.lecturerId,
                        );
                        const isExpanded = expandedCode === c.code;
                        return (
                          <>
                            <tr
                              key={c.code}
                              className={`border-b hover:bg-muted/20 cursor-pointer transition-colors ${isExpanded ? "bg-muted/30" : ""}`}
                              onClick={() =>
                                setExpandedCode(isExpanded ? null : c.code)
                              }
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ")
                                  setExpandedCode(isExpanded ? null : c.code);
                              }}
                              data-ocid={`course-catalog.row.${i + 1}`}
                            >
                              <td className="px-4 py-3 font-mono font-semibold text-primary">
                                {c.code}
                              </td>
                              <td className="px-4 py-3 font-medium text-foreground">
                                {c.title}
                              </td>
                              <td className="px-4 py-3 text-xs text-muted-foreground">
                                {c.department}
                              </td>
                              <td className="px-4 py-3 text-xs text-muted-foreground">
                                {c.semester}
                              </td>
                              <td className="px-4 py-3 text-center font-bold text-foreground">
                                {c.creditUnits}
                              </td>
                              <td className="px-4 py-3 text-sm text-muted-foreground">
                                {lecturer ? (
                                  lecturer.name
                                ) : (
                                  <span className="text-amber-600 text-xs">
                                    Not assigned
                                  </span>
                                )}
                              </td>
                            </tr>
                            {isExpanded && (
                              <tr
                                key={`${c.code}-detail`}
                                className="bg-muted/20"
                              >
                                <td colSpan={6} className="px-4 py-3">
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                    <div>
                                      <p className="text-xs text-muted-foreground font-medium">
                                        Course Code
                                      </p>
                                      <p className="font-mono font-bold">
                                        {c.code}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-muted-foreground font-medium">
                                        Credit Units
                                      </p>
                                      <p className="font-bold text-primary">
                                        {c.creditUnits} units
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-muted-foreground font-medium">
                                        Assigned Lecturer
                                      </p>
                                      <p>
                                        {lecturer
                                          ? lecturer.name
                                          : "Unassigned"}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-muted-foreground font-medium">
                                        Lecturer Email
                                      </p>
                                      <p className="text-xs">
                                        {lecturer ? lecturer.email : "—"}
                                      </p>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* GRID VIEW — grouped by department */}
          {viewMode === "grid" && filtered.length > 0 && (
            <div className="space-y-6">
              {Object.entries(byDept).map(([dept, deptCourses]) => {
                const deptCU = deptCourses.reduce(
                  (s, c) => s + c.creditUnits,
                  0,
                );
                return (
                  <Card key={dept}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base flex items-center gap-2">
                          <BookOpen size={16} className="text-primary" />
                          {dept}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-muted text-muted-foreground border-0">
                            {deptCourses.length} courses
                          </Badge>
                          <Badge className="bg-primary/10 text-primary border-0">
                            {deptCU} CU
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <Separator />
                    <CardContent className="pt-3 p-0">
                      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x">
                        {deptCourses.map((c, i) => {
                          const lecturer = staff.find(
                            (s) => s.staffId === c.lecturerId,
                          );
                          return (
                            <div
                              key={c.code}
                              className={`px-4 py-3 ${i % 2 === 1 ? "md:border-l border-border" : ""} hover:bg-muted/20 transition-colors`}
                              data-ocid={`course-catalog.grid_item.${c.code}`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-mono font-bold text-sm text-primary">
                                      {c.code}
                                    </span>
                                    <Badge className="bg-muted text-muted-foreground border-0 text-xs">
                                      {c.creditUnits} CU
                                    </Badge>
                                  </div>
                                  <p className="text-sm font-medium text-foreground mt-0.5 truncate">
                                    {c.title}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-0.5">
                                    {c.semester}
                                  </p>
                                  {lecturer && (
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                      👤 {lecturer.name}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
