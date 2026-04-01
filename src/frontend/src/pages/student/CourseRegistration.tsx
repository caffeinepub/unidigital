import { AlertCircle, BookOpen, CheckCircle, Info, X } from "lucide-react";
import { useState } from "react";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { getInstitutionSettings } from "../../hooks/useInstitutionSettings";
import {
  type CourseRecord,
  type CourseRegistration as CourseRegistrationData,
  getLocalCourses,
  getLocalRegistrations,
  isRegistrationOpen,
  saveLocalRegistrations,
} from "../../utils/sampleData";

interface Props {
  studentMatric: string;
}

const SEMESTER = "2023/2024 First";

export function CourseRegistration({ studentMatric }: Props) {
  const [courses] = useState<CourseRecord[]>(getLocalCourses());
  const [registrations, setRegistrations] = useState<CourseRegistrationData[]>(
    getLocalRegistrations(),
  );
  const [open] = useState(isRegistrationOpen());

  const settings = getInstitutionSettings();

  const myRegs = registrations.filter(
    (r) => r.studentMatric === studentMatric && r.semester === SEMESTER,
  );
  const myCourseCodes = new Set(myRegs.map((r) => r.courseCode));

  const register = (code: string) => {
    if (!open || !settings.toggles.courseRegistrationOpen) return;
    if (myCourseCodes.has(code)) return;
    const newReg: CourseRegistrationData = {
      id: `REG-${Date.now()}`,
      studentMatric,
      courseCode: code,
      semester: SEMESTER,
      registeredAt: new Date().toISOString().split("T")[0],
    };
    const updated = [...registrations, newReg];
    setRegistrations(updated);
    saveLocalRegistrations(updated);
  };

  const drop = (code: string) => {
    if (!open || !settings.toggles.courseRegistrationOpen) return;
    const updated = registrations.filter(
      (r) =>
        !(
          r.studentMatric === studentMatric &&
          r.courseCode === code &&
          r.semester === SEMESTER
        ),
    );
    setRegistrations(updated);
    saveLocalRegistrations(updated);
  };

  return (
    <div className="space-y-6">
      {/* System-level registration closed banner */}
      {!settings.toggles.courseRegistrationOpen && (
        <div
          className="flex items-start gap-3 bg-yellow-50 border border-yellow-300 rounded-lg p-4 text-yellow-800"
          data-ocid="registration.info_banner"
        >
          <Info size={18} className="mt-0.5 flex-shrink-0 text-yellow-600" />
          <div>
            <p className="font-semibold text-sm">
              Course Registration Currently Closed
            </p>
            <p className="text-sm mt-0.5">
              Course registration is currently closed by the system
              administrator. Please check back later or contact the Academic
              Office for assistance.
            </p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">
          Course Registration
        </h1>
        <Badge
          className={
            open && settings.toggles.courseRegistrationOpen
              ? "bg-green-100 text-green-700 border-0"
              : "bg-red-100 text-red-700 border-0"
          }
        >
          {open && settings.toggles.courseRegistrationOpen
            ? "Registration Open"
            : "Registration Closed"}
        </Badge>
      </div>

      {!open && settings.toggles.courseRegistrationOpen && (
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3 text-amber-700 text-sm">
          <AlertCircle size={16} />
          <span>
            Course registration is currently closed. Contact the registry for
            assistance.
          </span>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <CheckCircle size={18} className="text-green-600" />
            My Registered Courses ({myRegs.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {myRegs.length === 0 ? (
            <p
              className="text-sm text-slate-400 text-center py-4"
              data-ocid="registration.empty_state"
            >
              You have not registered for any courses this semester.
            </p>
          ) : (
            <div className="space-y-2" data-ocid="registration.list">
              {myRegs.map((reg, i) => {
                const course = courses.find((c) => c.code === reg.courseCode);
                return (
                  <div
                    key={reg.id}
                    className="flex items-center justify-between bg-green-50 border border-green-100 rounded-lg px-4 py-3"
                    data-ocid={`registration.item.${i + 1}`}
                  >
                    <div>
                      <p className="font-medium text-sm text-slate-800">
                        {course?.title ?? reg.courseCode}
                      </p>
                      <p className="text-xs text-slate-500">
                        {reg.courseCode} &bull; {course?.creditUnits ?? "?"}{" "}
                        units
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className="bg-green-100 text-green-700 border-0 text-xs">
                        {reg.semester}
                      </Badge>
                      {open && settings.toggles.courseRegistrationOpen && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-600 hover:bg-red-50 h-8 w-8 p-0"
                          onClick={() => drop(reg.courseCode)}
                          data-ocid={`registration.delete_button.${i + 1}`}
                        >
                          <X size={14} />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <BookOpen size={18} className="text-blue-600" />
            Available Courses — {SEMESTER}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-3">
            {courses.map((course, i) => {
              const registered = myCourseCodes.has(course.code);
              return (
                <div
                  key={course.code}
                  className={`border rounded-lg p-4 transition-colors ${
                    registered
                      ? "bg-green-50 border-green-200"
                      : "bg-white border-slate-200"
                  }`}
                  data-ocid={`registration.item.${i + 1}`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-slate-800 truncate">
                        {course.title}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {course.code} &bull; {course.department}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {course.creditUnits} credit units
                      </p>
                    </div>
                    <div className="ml-3 flex-shrink-0">
                      {registered ? (
                        <Badge className="bg-green-100 text-green-700 border-0 text-xs">
                          Registered
                        </Badge>
                      ) : (
                        <Button
                          size="sm"
                          disabled={
                            !open || !settings.toggles.courseRegistrationOpen
                          }
                          className="bg-blue-600 hover:bg-blue-700 h-7 text-xs"
                          onClick={() => register(course.code)}
                          data-ocid={`registration.primary_button.${i + 1}`}
                        >
                          Register
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
