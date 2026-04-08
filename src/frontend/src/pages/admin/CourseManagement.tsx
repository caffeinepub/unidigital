import {
  AlertCircle,
  BookOpen,
  CheckCircle,
  Clock,
  Edit,
  Plus,
  Printer,
  Search,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Users,
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
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Separator } from "../../components/ui/separator";
import {
  type CourseRecord,
  getLocalCourses,
  getLocalStaff,
  saveLocalCourses,
} from "../../utils/sampleData";

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

interface ExtendedCourse extends CourseRecord {
  id: string;
  level: string;
  prerequisitesText: string;
  type: "compulsory" | "elective";
  approvalStatus: "proposed" | "approved";
  available: boolean;
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
  "Environmental Education",
  "Integrated Science",
];

const LEVELS = ["100", "200", "300", "400", "500", "600"];
const SEMESTERS = [
  "2024/2025 First",
  "2024/2025 Second",
  "2023/2024 First",
  "2023/2024 Second",
];

const EMPTY_FORM: Partial<ExtendedCourse> = {
  code: "",
  title: "",
  creditUnits: 3,
  department: "Computer Science",
  semester: "2024/2025 First",
  lecturerId: "",
  level: "100",
  prerequisitesText: "",
  type: "compulsory",
  approvalStatus: "approved",
  available: true,
};

export function CourseManagement() {
  const [courses, setCourses] = useState<ExtendedCourse[]>(() =>
    getLocalCourses().map((c) => ({
      ...c,
      id: c.code,
      level: c.semester.includes("2021") ? "100" : "200",
      prerequisitesText: "",
      type: "compulsory" as const,
      approvalStatus: "approved" as const,
      available: true,
    })),
  );

  const staff = getLocalStaff();

  const [tab, setTab] = useState<"courses" | "curriculum" | "assign">(
    "courses",
  );
  const [search, setSearch] = useState("");
  const [filterDept, setFilterDept] = useState("all");
  const [filterLevel, setFilterLevel] = useState("all");
  const [filterSem, setFilterSem] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<ExtendedCourse>>(EMPTY_FORM);
  const [formError, setFormError] = useState("");

  const [curriculumList, setCurriculumList] =
    useState<CurriculumEntry[]>(loadCurriculum);
  const [currDept, setCurrDept] = useState("Computer Science");
  const [currLevel, setCurrLevel] = useState("100");
  const [currSem, setCurrSem] = useState("2024/2025 First");

  const updateCourses = (updated: ExtendedCourse[]) => {
    setCourses(updated);
    saveLocalCourses(
      updated.map(
        ({ code, title, creditUnits, department, semester, lecturerId }) => ({
          code,
          title,
          creditUnits,
          department,
          semester,
          lecturerId,
        }),
      ),
    );
  };

  const updateCurriculum = (updated: CurriculumEntry[]) => {
    setCurriculumList(updated);
    saveCurriculum(updated);
  };

  const filteredCourses = courses.filter((c) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      c.code.toLowerCase().includes(q) ||
      c.title.toLowerCase().includes(q) ||
      c.department.toLowerCase().includes(q);
    const matchDept = filterDept === "all" || c.department === filterDept;
    const matchLevel = filterLevel === "all" || c.level === filterLevel;
    const matchSem = filterSem === "all" || c.semester === filterSem;
    return matchSearch && matchDept && matchLevel && matchSem;
  });

  const openNew = () => {
    setForm(EMPTY_FORM);
    setEditId(null);
    setFormError("");
    setShowForm(true);
  };
  const openEdit = (c: ExtendedCourse) => {
    setForm({ ...c });
    setEditId(c.code);
    setFormError("");
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.code?.trim() || !form.title?.trim()) {
      setFormError("Course code and title are required.");
      return;
    }
    const cu = Number(form.creditUnits) || 0;
    if (cu < 1 || cu > 12) {
      setFormError("Credit units must be between 1 and 12.");
      return;
    }
    const entry: ExtendedCourse = {
      code: form.code.trim().toUpperCase(),
      title: form.title.trim(),
      creditUnits: cu,
      department: form.department || "Computer Science",
      semester: form.semester || "2024/2025 First",
      lecturerId: form.lecturerId || "",
      id: form.code.trim().toUpperCase(),
      level: form.level || "100",
      prerequisitesText: form.prerequisitesText || "",
      type: form.type || "compulsory",
      approvalStatus: form.approvalStatus || "approved",
      available: form.available !== false,
    };
    if (editId) {
      updateCourses(courses.map((c) => (c.code === editId ? entry : c)));
    } else {
      if (courses.find((c) => c.code === entry.code)) {
        setFormError("A course with this code already exists.");
        return;
      }
      updateCourses([...courses, entry]);
    }
    setShowForm(false);
    setFormError("");
  };

  const handleDelete = (code: string) => {
    updateCourses(courses.filter((c) => c.code !== code));
  };
  const toggleAvailability = (code: string) => {
    updateCourses(
      courses.map((c) =>
        c.code === code ? { ...c, available: !c.available } : c,
      ),
    );
  };
  const assignLecturer = (courseCode: string, staffId: string) => {
    updateCourses(
      courses.map((c) =>
        c.code === courseCode ? { ...c, lecturerId: staffId } : c,
      ),
    );
  };

  const currCourses = curriculumList.filter(
    (e) =>
      e.department === currDept &&
      e.level === currLevel &&
      e.semester === currSem,
  );
  const totalCurrCredits = currCourses.reduce((sum, e) => {
    const c = courses.find((x) => x.code === e.courseCode);
    return sum + (c?.creditUnits ?? 0);
  }, 0);

  const addToCurriculum = (courseCode: string) => {
    if (currCourses.find((e) => e.courseCode === courseCode)) return;
    const course = courses.find((c) => c.code === courseCode);
    const totalCu = currCourses.reduce((sum, e) => {
      const c = courses.find((x) => x.code === e.courseCode);
      return sum + (c?.creditUnits ?? 0);
    }, 0);
    if (totalCu + (course?.creditUnits ?? 0) > 24) {
      alert(`Credit load limit exceeded. Current: ${totalCu} / 24 units.`);
      return;
    }
    updateCurriculum([
      ...curriculumList,
      {
        id: `CURR-${Date.now()}`,
        department: currDept,
        level: currLevel,
        semester: currSem,
        courseCode,
        type: course?.type ?? "compulsory",
        approvalStatus: "proposed",
        proposedBy: "HOD",
        creditMax: 24,
      },
    ]);
  };

  const removeCurrEntry = (id: string) => {
    updateCurriculum(curriculumList.filter((e) => e.id !== id));
  };
  const approveCurrEntry = (id: string) => {
    updateCurriculum(
      curriculumList.map((e) =>
        e.id === id
          ? { ...e, approvalStatus: "approved", approvedBy: "Admin" }
          : e,
      ),
    );
  };

  const printCurriculum = () => {
    const lines = [
      `CURRICULUM — ${currDept}`,
      `Level: ${currLevel} | Semester: ${currSem}`,
      `Total Credit Units: ${totalCurrCredits} / 24`,
      "-".repeat(60),
      ...(currCourses.length === 0
        ? ["No courses added."]
        : currCourses.map((e) => {
            const c = courses.find((x) => x.code === e.courseCode);
            return `${e.courseCode.padEnd(12)} ${(c?.title ?? "Unknown").padEnd(40)} ${c?.creditUnits ?? 0} CU  [${e.type}] [${e.approvalStatus}]`;
          })),
    ];
    const win = window.open("", "_blank");
    if (win) {
      win.document.write(
        `<pre style="font-family:monospace;padding:20px">${lines.join("\n")}</pre>`,
      );
      win.print();
      win.close();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Course Management
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Create courses, assign lecturers, and configure curriculum per
            department and level.
          </p>
        </div>
        {tab === "courses" && (
          <Button onClick={openNew} data-ocid="course-mgmt.new_course_button">
            <Plus size={16} className="mr-2" /> Add Course
          </Button>
        )}
        {tab === "curriculum" && (
          <Button
            variant="outline"
            size="sm"
            onClick={printCurriculum}
            data-ocid="course-mgmt.print_curriculum_button"
          >
            <Printer size={14} className="mr-2" /> Print Curriculum
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {(
          [
            {
              key: "courses",
              label: "Course Catalog",
              icon: <BookOpen size={15} />,
            },
            {
              key: "curriculum",
              label: "Curriculum Builder",
              icon: <CheckCircle size={15} />,
            },
            {
              key: "assign",
              label: "Lecturer Assignment",
              icon: <Users size={15} />,
            },
          ] as const
        ).map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${tab === t.key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
            data-ocid={`course-mgmt.tab.${t.key}`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ─── COURSE CATALOG TAB ─────────────────────────────────── */}
      {tab === "courses" && (
        <>
          {showForm && (
            <Card className="border-primary/30 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-base">
                  {editId ? "Edit Course" : "New Course"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Course Code *</Label>
                    <Input
                      className="mt-1"
                      placeholder="e.g. CSC401"
                      value={form.code ?? ""}
                      onChange={(e) =>
                        setForm({ ...form, code: e.target.value })
                      }
                      disabled={!!editId}
                      data-ocid="course-mgmt.code_input"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Course Title *</Label>
                    <Input
                      className="mt-1"
                      placeholder="e.g. Artificial Intelligence"
                      value={form.title ?? ""}
                      onChange={(e) =>
                        setForm({ ...form, title: e.target.value })
                      }
                      data-ocid="course-mgmt.title_input"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <Label>Credit Units *</Label>
                    <Input
                      className="mt-1"
                      type="number"
                      min={1}
                      max={12}
                      value={form.creditUnits ?? 3}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          creditUnits: Number.parseInt(e.target.value) || 3,
                        })
                      }
                      data-ocid="course-mgmt.credits_input"
                    />
                  </div>
                  <div>
                    <Label>Level</Label>
                    <select
                      className="w-full mt-1 border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none"
                      value={form.level ?? "100"}
                      onChange={(e) =>
                        setForm({ ...form, level: e.target.value })
                      }
                      data-ocid="course-mgmt.level_select"
                    >
                      {LEVELS.map((l) => (
                        <option key={l} value={l}>
                          {l} Level
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label>Type</Label>
                    <select
                      className="w-full mt-1 border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none"
                      value={form.type ?? "compulsory"}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          type: e.target.value as "compulsory" | "elective",
                        })
                      }
                      data-ocid="course-mgmt.type_select"
                    >
                      <option value="compulsory">Compulsory</option>
                      <option value="elective">Elective</option>
                    </select>
                  </div>
                  <div>
                    <Label>Department</Label>
                    <select
                      className="w-full mt-1 border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none"
                      value={form.department ?? "Computer Science"}
                      onChange={(e) =>
                        setForm({ ...form, department: e.target.value })
                      }
                      data-ocid="course-mgmt.dept_select"
                    >
                      {DEPARTMENTS.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Semester</Label>
                    <select
                      className="w-full mt-1 border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none"
                      value={form.semester ?? "2024/2025 First"}
                      onChange={(e) =>
                        setForm({ ...form, semester: e.target.value })
                      }
                      data-ocid="course-mgmt.semester_select"
                    >
                      {SEMESTERS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label>Prerequisites</Label>
                    <Input
                      className="mt-1"
                      placeholder="e.g. CSC301, MTH201"
                      value={form.prerequisitesText ?? ""}
                      onChange={(e) =>
                        setForm({ ...form, prerequisitesText: e.target.value })
                      }
                      data-ocid="course-mgmt.prereq_input"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Label>Available This Semester</Label>
                  <button
                    type="button"
                    onClick={() =>
                      setForm({ ...form, available: !form.available })
                    }
                    className={`text-2xl ${form.available !== false ? "text-green-600" : "text-muted-foreground"}`}
                    data-ocid="course-mgmt.available_toggle"
                  >
                    {form.available !== false ? (
                      <ToggleRight size={28} />
                    ) : (
                      <ToggleLeft size={28} />
                    )}
                  </button>
                </div>
                {formError && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle size={14} /> {formError}
                  </p>
                )}
                <div className="flex gap-2">
                  <Button
                    onClick={handleSave}
                    data-ocid="course-mgmt.save_button"
                  >
                    {editId ? "Update Course" : "Add Course"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowForm(false);
                      setFormError("");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Filters */}
          <div className="flex gap-3 flex-wrap items-end">
            <div className="relative flex-1 min-w-[200px]">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                className="pl-9"
                placeholder="Search by code, title, department..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                data-ocid="course-mgmt.search_input"
              />
            </div>
            <select
              className="border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none"
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value)}
              data-ocid="course-mgmt.filter_dept"
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
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              data-ocid="course-mgmt.filter_level"
            >
              <option value="all">All Levels</option>
              {LEVELS.map((l) => (
                <option key={l} value={l}>
                  Level {l}
                </option>
              ))}
            </select>
            <select
              className="border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none"
              value={filterSem}
              onChange={(e) => setFilterSem(e.target.value)}
              data-ocid="course-mgmt.filter_semester"
            >
              <option value="all">All Semesters</option>
              {SEMESTERS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Courses ({filteredCourses.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {filteredCourses.length === 0 ? (
                <div
                  className="py-12 text-center text-muted-foreground"
                  data-ocid="course-mgmt.empty_state"
                >
                  <BookOpen size={40} className="mx-auto mb-3 opacity-30" />
                  <p>No courses found.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/40">
                        {[
                          "Code",
                          "Title",
                          "Department",
                          "Level",
                          "CU",
                          "Type",
                          "Lecturer",
                          "Available",
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
                      {filteredCourses.map((c, i) => {
                        const lecturer = staff.find(
                          (s) => s.staffId === c.lecturerId,
                        );
                        return (
                          <tr
                            key={c.code}
                            className="border-b hover:bg-muted/20"
                            data-ocid={`course-mgmt.row.${i + 1}`}
                          >
                            <td className="px-4 py-3 font-mono font-medium text-foreground">
                              {c.code}
                            </td>
                            <td className="px-4 py-3 text-foreground max-w-[180px]">
                              <p className="truncate">{c.title}</p>
                              {c.prerequisitesText && (
                                <p className="text-xs text-muted-foreground">
                                  Pre: {c.prerequisitesText}
                                </p>
                              )}
                            </td>
                            <td className="px-4 py-3 text-muted-foreground text-xs">
                              {c.department}
                            </td>
                            <td className="px-4 py-3 text-muted-foreground">
                              {c.level}
                            </td>
                            <td className="px-4 py-3 text-center font-bold text-primary">
                              {c.creditUnits}
                            </td>
                            <td className="px-4 py-3">
                              <Badge
                                className={`border-0 text-xs ${c.type === "elective" ? "bg-blue-100 text-blue-700" : "bg-muted text-muted-foreground"}`}
                              >
                                {c.type}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-sm text-muted-foreground">
                              {lecturer ? (
                                lecturer.name
                              ) : (
                                <span className="text-amber-600 text-xs">
                                  Unassigned
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <button
                                type="button"
                                onClick={() => toggleAvailability(c.code)}
                                className={`text-2xl ${c.available ? "text-green-600" : "text-muted-foreground"}`}
                                data-ocid={`course-mgmt.toggle_available.${i + 1}`}
                                aria-label={`Toggle availability for ${c.code}`}
                              >
                                {c.available ? (
                                  <ToggleRight size={22} />
                                ) : (
                                  <ToggleLeft size={22} />
                                )}
                              </button>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1 justify-center">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => openEdit(c)}
                                  data-ocid={`course-mgmt.edit.${i + 1}`}
                                >
                                  <Edit size={14} />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-destructive hover:text-destructive"
                                  onClick={() => handleDelete(c.code)}
                                  data-ocid={`course-mgmt.delete.${i + 1}`}
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
        </>
      )}

      {/* ─── CURRICULUM BUILDER TAB ──────────────────────────────── */}
      {tab === "curriculum" && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Curriculum Builder</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3 flex-wrap">
                <div>
                  <Label className="text-xs">Department</Label>
                  <select
                    className="block w-full mt-1 border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none"
                    value={currDept}
                    onChange={(e) => setCurrDept(e.target.value)}
                    data-ocid="course-mgmt.curr_dept_select"
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
                    value={currLevel}
                    onChange={(e) => setCurrLevel(e.target.value)}
                    data-ocid="course-mgmt.curr_level_select"
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
                    value={currSem}
                    onChange={(e) => setCurrSem(e.target.value)}
                    data-ocid="course-mgmt.curr_sem_select"
                  >
                    {SEMESTERS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <Separator />

              {/* Credit load bar */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">
                  Total Credit Load
                </span>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-32 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${totalCurrCredits > 20 ? "bg-destructive" : totalCurrCredits > 15 ? "bg-amber-500" : "bg-green-500"}`}
                      style={{
                        width: `${Math.min(100, (totalCurrCredits / 24) * 100)}%`,
                      }}
                    />
                  </div>
                  <span
                    className={`text-sm font-bold ${totalCurrCredits > 24 ? "text-destructive" : "text-foreground"}`}
                  >
                    {totalCurrCredits} / 24 CU
                  </span>
                </div>
              </div>

              {/* Current curriculum */}
              <div>
                <p className="text-sm font-medium text-foreground mb-2">
                  Current Curriculum ({currCourses.length} courses)
                </p>
                {currCourses.length === 0 ? (
                  <p
                    className="text-sm text-muted-foreground py-4 text-center border rounded-lg"
                    data-ocid="course-mgmt.curriculum_empty"
                  >
                    No courses added to this curriculum yet.
                  </p>
                ) : (
                  <div className="divide-y border rounded-lg overflow-hidden">
                    {currCourses.map((e) => {
                      const c = courses.find((x) => x.code === e.courseCode);
                      return (
                        <div
                          key={e.id}
                          className="flex items-center justify-between px-4 py-3"
                          data-ocid={`course-mgmt.curr_item.${e.id}`}
                        >
                          <div>
                            <span className="font-mono font-medium text-sm text-foreground">
                              {e.courseCode}
                            </span>
                            <span className="text-sm text-muted-foreground ml-2">
                              {c?.title}
                            </span>
                            <span className="ml-2 text-xs text-muted-foreground">
                              {c?.creditUnits} CU
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              className={`border-0 text-xs ${e.type === "elective" ? "bg-blue-100 text-blue-700" : "bg-muted text-muted-foreground"}`}
                            >
                              {e.type}
                            </Badge>
                            {e.approvalStatus === "proposed" ? (
                              <>
                                <Badge className="bg-amber-100 text-amber-700 border-0 text-xs">
                                  <Clock size={10} className="mr-1" /> Proposed
                                </Badge>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => approveCurrEntry(e.id)}
                                  data-ocid={`course-mgmt.approve_curr.${e.id}`}
                                >
                                  Approve
                                </Button>
                              </>
                            ) : (
                              <Badge className="bg-green-100 text-green-700 border-0 text-xs">
                                <CheckCircle size={10} className="mr-1" />{" "}
                                Approved
                              </Badge>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-destructive"
                              onClick={() => removeCurrEntry(e.id)}
                              data-ocid={`course-mgmt.remove_curr.${e.id}`}
                            >
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Add courses */}
              <div>
                <p className="text-sm font-medium text-foreground mb-2">
                  Add Courses from Catalog
                </p>
                <div className="border rounded-lg overflow-hidden max-h-64 overflow-y-auto">
                  {courses
                    .filter(
                      (c) => !currCourses.find((e) => e.courseCode === c.code),
                    )
                    .map((c) => (
                      <div
                        key={c.code}
                        className="flex items-center justify-between px-4 py-2.5 border-b last:border-0 hover:bg-muted/30"
                      >
                        <div>
                          <span className="font-mono text-sm font-medium text-foreground">
                            {c.code}
                          </span>
                          <span className="text-sm text-muted-foreground ml-2">
                            {c.title}
                          </span>
                          <span className="ml-2 text-xs text-muted-foreground">
                            {c.creditUnits} CU
                          </span>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => addToCurriculum(c.code)}
                          data-ocid={`course-mgmt.add_to_curr.${c.code}`}
                        >
                          <Plus size={13} className="mr-1" /> Add
                        </Button>
                      </div>
                    ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ─── LECTURER ASSIGNMENT TAB ─────────────────────────────── */}
      {tab === "assign" && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Lecturer Assignment Matrix
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/40">
                      {["Course", "Department", "CU", "Assigned Lecturer"].map(
                        (h) => (
                          <th
                            key={h}
                            className={`px-4 py-3 font-medium text-muted-foreground ${h === "CU" ? "text-center" : "text-left"}`}
                          >
                            {h}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {courses.map((c, i) => {
                      const lecturer = staff.find(
                        (s) => s.staffId === c.lecturerId,
                      );
                      return (
                        <tr
                          key={c.code}
                          className="border-b hover:bg-muted/20"
                          data-ocid={`course-mgmt.assign_row.${i + 1}`}
                        >
                          <td className="px-4 py-3">
                            <p className="font-mono font-medium text-foreground">
                              {c.code}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {c.title}
                            </p>
                          </td>
                          <td className="px-4 py-3 text-xs text-muted-foreground">
                            {c.department}
                          </td>
                          <td className="px-4 py-3 text-center font-bold text-primary">
                            {c.creditUnits}
                          </td>
                          <td className="px-4 py-3">
                            <select
                              className="border border-input rounded-md px-3 py-1.5 text-sm bg-background focus:outline-none w-full max-w-xs"
                              value={c.lecturerId}
                              onChange={(e) =>
                                assignLecturer(c.code, e.target.value)
                              }
                              data-ocid={`course-mgmt.lecturer_select.${i + 1}`}
                            >
                              <option value="">— Unassigned —</option>
                              {staff.map((s) => (
                                <option key={s.staffId} value={s.staffId}>
                                  {s.name} ({s.department})
                                </option>
                              ))}
                            </select>
                            {!lecturer && (
                              <p className="text-xs text-amber-600 mt-0.5 flex items-center gap-1">
                                <AlertCircle size={11} /> No lecturer assigned
                              </p>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-3 gap-4">
            {[
              {
                label: "Total Courses",
                value: courses.length,
                cls: "text-foreground",
              },
              {
                label: "Assigned",
                value: courses.filter((c) => c.lecturerId).length,
                cls: "text-green-700",
              },
              {
                label: "Unassigned",
                value: courses.filter((c) => !c.lecturerId).length,
                cls: "text-amber-600",
              },
            ].map((stat) => (
              <Card key={stat.label}>
                <CardContent className="pt-4 pb-4 text-center">
                  <p className={`text-2xl font-bold ${stat.cls}`}>
                    {stat.value}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {stat.label}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
