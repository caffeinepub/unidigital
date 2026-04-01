import { CheckCircle, XCircle } from "lucide-react";
import { Badge } from "../../components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { useResultProcessing } from "../../contexts/ResultProcessingContext";
import {
  getLocalAnnouncements,
  getLocalCourses,
  getLocalInvoices,
  getLocalStudents,
} from "../../utils/sampleData";

interface Props {
  userEmail: string;
}

export function GraduationStatus({ userEmail }: Props) {
  const { examResults, clearanceRecords, getCarryovers } =
    useResultProcessing();
  const students = getLocalStudents();
  const courses = getLocalCourses();
  const invoices = getLocalInvoices();
  const announcements = getLocalAnnouncements();

  const student = students.find((s) => s.email === userEmail) ?? students[0];
  const matric = student?.matricNumber ?? "";
  const creditMap = Object.fromEntries(
    courses.map((c) => [c.code, c.creditUnits]),
  );

  const publishedResults = examResults.filter(
    (r) =>
      r.studentMatric === matric && r.status === "published" && r.grade !== "F",
  );
  const creditsCompleted = publishedResults.reduce(
    (s, r) => s + (creditMap[r.courseCode] ?? 3),
    0,
  );
  const carryovers = getCarryovers(matric);
  const invoice = invoices.find((i) => i.studentMatric === matric);
  const feeCleared = invoice ? invoice.paid >= invoice.amount : true;
  const clearance = clearanceRecords.find(
    (r) => r.studentMatric === matric,
  ) ?? {
    studentMatric: matric,
    library: false,
    department: false,
    bursary: false,
  };

  const creditsOk = creditsCompleted >= 90;
  const carryoverOk = carryovers.length === 0;
  const eligible = creditsOk && carryoverOk && feeCleared;

  const convocationAnnouncement = announcements.find((a) =>
    a.title.toLowerCase().includes("convocation"),
  );

  const checks = [
    {
      label: "Credits Completed",
      ok: creditsOk,
      detail: `${creditsCompleted}/90 required credits`,
    },
    {
      label: "No Outstanding Courses",
      ok: carryoverOk,
      detail:
        carryovers.length > 0
          ? `${carryovers.length} carryover(s) outstanding`
          : "All courses passed",
    },
    {
      label: "Fees Fully Paid",
      ok: feeCleared,
      detail: feeCleared ? "Account cleared" : "Outstanding fee balance",
    },
    {
      label: "Library Clearance",
      ok: clearance.library,
      detail: clearance.library ? "Cleared" : "Not yet cleared",
    },
    {
      label: "Department Clearance",
      ok: clearance.department,
      detail: clearance.department ? "Cleared" : "Not yet cleared",
    },
    {
      label: "Bursary Clearance",
      ok: clearance.bursary,
      detail: clearance.bursary ? "Cleared" : "Not yet cleared",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Graduation Status</h1>
        <p className="text-slate-500 text-sm mt-1">
          Your graduation eligibility and clearance checklist.
        </p>
      </div>

      <Card
        className={
          eligible
            ? "border-green-200 bg-green-50"
            : "border-amber-200 bg-amber-50"
        }
      >
        <CardContent className="p-5 flex items-center gap-4">
          {eligible ? (
            <CheckCircle size={32} className="text-green-500" />
          ) : (
            <XCircle size={32} className="text-amber-500" />
          )}
          <div>
            <h2
              className={`text-lg font-bold ${eligible ? "text-green-700" : "text-amber-700"}`}
            >
              {eligible ? "Eligible for Graduation" : "Not Yet Eligible"}
            </h2>
            {!eligible && (
              <p className="text-sm text-amber-600 mt-1">
                Complete the remaining requirements below to qualify for
                graduation.
              </p>
            )}
          </div>
          <Badge
            className={
              eligible
                ? "bg-green-200 text-green-800 ml-auto"
                : "bg-amber-200 text-amber-800 ml-auto"
            }
            data-ocid="grad.card"
          >
            {eligible ? "Approved" : "Pending"}
          </Badge>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Graduation Checklist</CardTitle>
        </CardHeader>
        <CardContent className="divide-y">
          {checks.map((c, i) => (
            <div
              key={c.label}
              className="flex items-center gap-3 py-3"
              data-ocid={`grad.item.${i + 1}`}
            >
              {c.ok ? (
                <CheckCircle
                  size={18}
                  className="text-green-500 flex-shrink-0"
                />
              ) : (
                <XCircle size={18} className="text-red-400 flex-shrink-0" />
              )}
              <div className="flex-1">
                <p
                  className={`text-sm font-medium ${c.ok ? "text-slate-700" : "text-red-600"}`}
                >
                  {c.label}
                </p>
                <p className="text-xs text-slate-500">{c.detail}</p>
              </div>
              <Badge
                className={
                  c.ok
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-600"
                }
              >
                {c.ok ? "✓" : "✗"}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      {convocationAnnouncement && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Convocation Information</CardTitle>
          </CardHeader>
          <CardContent>
            <h3 className="font-semibold">{convocationAnnouncement.title}</h3>
            <p className="text-sm text-slate-600 mt-2">
              {convocationAnnouncement.body}
            </p>
            <p className="text-xs text-slate-400 mt-2">
              {convocationAnnouncement.date}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
