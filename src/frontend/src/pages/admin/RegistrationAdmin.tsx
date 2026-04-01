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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  getLocalCourses,
  getLocalRegistrations,
  getLocalStudents,
  isRegistrationOpen,
  setRegistrationOpen,
} from "../../utils/sampleData";

export function RegistrationAdmin() {
  const [open, setOpen] = useState(isRegistrationOpen());
  const [registrations] = useState(getLocalRegistrations());
  const [students] = useState(getLocalStudents());
  const [courses] = useState(getLocalCourses());
  const [filterCourse, setFilterCourse] = useState("");
  const [filterStudent, setFilterStudent] = useState("");

  const toggle = () => {
    const next = !open;
    setOpen(next);
    setRegistrationOpen(next);
  };

  const filtered = registrations.filter((r) => {
    const matchCourse =
      filterCourse === "" ||
      r.courseCode.toLowerCase().includes(filterCourse.toLowerCase());
    const matchStudent =
      filterStudent === "" ||
      r.studentMatric.toLowerCase().includes(filterStudent.toLowerCase());
    return matchCourse && matchStudent;
  });

  const totalStudents = new Set(registrations.map((r) => r.studentMatric)).size;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">
          Course Registrations
        </h1>
        <div className="flex items-center gap-3">
          <Badge
            className={
              open
                ? "bg-green-100 text-green-700 border-0"
                : "bg-red-100 text-red-700 border-0"
            }
          >
            {open ? "Registration Open" : "Registration Closed"}
          </Badge>
          <Button
            variant="outline"
            onClick={toggle}
            className={
              open
                ? "border-red-300 text-red-700 hover:bg-red-50"
                : "border-green-300 text-green-700 hover:bg-green-50"
            }
            data-ocid="registration.toggle"
          >
            {open ? "Close Registration" : "Open Registration"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          ["Total Registrations", registrations.length],
          ["Students Registered", totalStudents],
          [
            "Courses with Registrations",
            new Set(registrations.map((r) => r.courseCode)).size,
          ],
        ].map(([label, val]) => (
          <Card key={label as string}>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-slate-800">{val}</p>
              <p className="text-sm text-slate-500 mt-1">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Registrations</CardTitle>
          <div className="flex gap-3 mt-2">
            <Input
              placeholder="Filter by course code..."
              value={filterCourse}
              onChange={(e) => setFilterCourse(e.target.value)}
              className="max-w-xs"
              data-ocid="registration.search_input"
            />
            <Input
              placeholder="Filter by matric number..."
              value={filterStudent}
              onChange={(e) => setFilterStudent(e.target.value)}
              className="max-w-xs"
              data-ocid="registration.input"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table data-ocid="registration.table">
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Matric</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Semester</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center text-slate-400 py-8"
                      data-ocid="registration.empty_state"
                    >
                      No registrations found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((reg, i) => {
                    const student = students.find(
                      (s) => s.matricNumber === reg.studentMatric,
                    );
                    const course = courses.find(
                      (c) => c.code === reg.courseCode,
                    );
                    return (
                      <TableRow
                        key={reg.id}
                        data-ocid={`registration.row.${i + 1}`}
                      >
                        <TableCell className="font-medium">
                          {student?.name ?? reg.studentMatric}
                        </TableCell>
                        <TableCell className="text-slate-500 font-mono text-xs">
                          {reg.studentMatric}
                        </TableCell>
                        <TableCell>{course?.title ?? reg.courseCode}</TableCell>
                        <TableCell>
                          <Badge className="bg-blue-100 text-blue-700 border-0 text-xs">
                            {reg.courseCode}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-500 text-sm">
                          {reg.semester}
                        </TableCell>
                        <TableCell className="text-slate-500 text-sm">
                          {reg.registeredAt}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
