import { BookOpen, Filter, Search } from "lucide-react";
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
import { getLocalCourses, getLocalStaff } from "../../utils/sampleData";

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

export function CourseCatalog() {
  const courses = getLocalCourses();
  const staff = getLocalStaff();

  const [search, setSearch] = useState("");
  const [filterDept, setFilterDept] = useState("all");
  const [filterSem, setFilterSem] = useState("all");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [expandedCode, setExpandedCode] = useState<string | null>(null);

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
            <p className="text-2xl font-bold text-primary">{filtered.length}</p>
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
            <p className="text-sm text-muted-foreground">Total Credit Units</p>
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
                          <tr key={`${c.code}-detail`} className="bg-muted/20">
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
                                    {lecturer ? lecturer.name : "Unassigned"}
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
            const deptCU = deptCourses.reduce((s, c) => s + c.creditUnits, 0);
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
    </div>
  );
}
