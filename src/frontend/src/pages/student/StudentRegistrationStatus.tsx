import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import {
  type ExtendedStudentRecord,
  getExtendedStudents,
} from "../../utils/registrationUtils";
import { getLocalStudents } from "../../utils/sampleData";
import { ManualRegistration } from "../admin/ManualRegistration";

const STATUS_COLORS: Record<string, string> = {
  pending_approval: "bg-amber-100 text-amber-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};
const STATUS_LABELS: Record<string, string> = {
  pending_approval: "Pending Approval",
  approved: "Approved",
  rejected: "Rejected",
};

interface StudentRegistrationStatusProps {
  studentMatric?: string;
}

export function StudentRegistrationStatus({
  studentMatric,
}: StudentRegistrationStatusProps) {
  const [view, setView] = useState<"status" | "register">("status");

  // Find this student's extended record
  const extended = getExtendedStudents();
  const base = getLocalStudents();
  const student = base.find((s) => s.matricNumber === studentMatric);
  const extStudent: ExtendedStudentRecord | undefined =
    extended.find((s) => s.matricNumber === studentMatric) ||
    (student ? { ...student } : undefined);

  const status = extStudent?.registrationStatus || "pending_approval";
  const regId = extStudent?.registrationId;
  const source = extStudent?.registrationSource;
  const registeredAt = extStudent?.registeredAt;

  if (view === "register") {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={() => setView("status")}>
          ← Back to Registration Status
        </Button>
        <ManualRegistration />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Registration Status
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Track your registration application and approval progress
        </p>
      </div>

      {!extStudent || !regId ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center space-y-4">
            <div className="text-5xl">📋</div>
            <h3 className="text-lg font-semibold text-slate-700">
              Not Registered Yet
            </h3>
            <p className="text-slate-500 text-sm">
              You haven't submitted a registration application. Start the
              registration process below.
            </p>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => setView("register")}
              data-ocid="student_reg.start_button"
            >
              Start Registration
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Status card */}
          <Card
            className={`border-2 ${status === "approved" ? "border-green-200 bg-green-50/30" : status === "rejected" ? "border-red-200 bg-red-50/30" : "border-amber-200 bg-amber-50/30"}`}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-lg text-slate-800">
                  Registration Application
                </h2>
                <Badge
                  className={`border-0 text-sm px-3 py-1 ${STATUS_COLORS[status]}`}
                >
                  {STATUS_LABELS[status] || status}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-400 text-xs">Registration ID</p>
                  <p className="font-mono font-bold text-blue-700 mt-0.5">
                    {regId}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs">Method</p>
                  <p className="font-medium mt-0.5 capitalize">
                    {source?.replace(/_/g, " ") || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs">Submitted On</p>
                  <p className="mt-0.5">
                    {registeredAt
                      ? new Date(registeredAt).toLocaleDateString()
                      : "—"}
                  </p>
                </div>
                {extStudent?.approvedAt && (
                  <div>
                    <p className="text-slate-400 text-xs">Approved On</p>
                    <p className="mt-0.5">
                      {new Date(extStudent.approvedAt).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {extStudent?.approvedBy && (
                  <div>
                    <p className="text-slate-400 text-xs">Approved By</p>
                    <p className="mt-0.5">{extStudent.approvedBy}</p>
                  </div>
                )}
              </div>

              {status === "rejected" && extStudent?.rejectionReason && (
                <div className="mt-4 p-3 bg-red-100 border border-red-200 rounded-lg">
                  <p className="text-xs font-semibold text-red-700">
                    Rejection Reason:
                  </p>
                  <p className="text-sm text-red-600 mt-1">
                    {extStudent.rejectionReason}
                  </p>
                </div>
              )}

              {status === "approved" && (
                <div className="mt-4 p-3 bg-green-100 border border-green-200 rounded-lg flex items-center gap-3">
                  <span className="text-2xl">🎉</span>
                  <div>
                    <p className="text-sm font-semibold text-green-700">
                      Your registration has been approved!
                    </p>
                    <p className="text-xs text-green-600">
                      You now have full access to all student modules.
                    </p>
                  </div>
                </div>
              )}

              {status === "pending_approval" && (
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-xs text-amber-700">
                    ⏳ Your application is under review by the Admin/HOD. You
                    will be notified when it's processed.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Progress tracker */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Application Progress</CardTitle>
            </CardHeader>
            <CardContent>
              {[
                { label: "Application Submitted", done: true },
                {
                  label: "Under Admin Review",
                  done: status !== "pending_approval",
                },
                { label: "HOD Verification", done: status === "approved" },
                { label: "Registration Approved", done: status === "approved" },
              ].map((step, i) => (
                <div key={step.label} className="flex items-center gap-3 mb-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${step.done ? "bg-green-500 text-white" : "bg-slate-200 text-slate-400"}`}
                  >
                    {step.done ? "✓" : i + 1}
                  </div>
                  <span
                    className={`text-sm ${step.done ? "text-slate-800 font-medium" : "text-slate-400"}`}
                  >
                    {step.label}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Student details card */}
          {student && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Your Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {[
                    ["Full Name", student.name],
                    ["Matric Number", student.matricNumber],
                    ["Email", student.email],
                    ["Department", student.department],
                    ["Level", student.level],
                    ["Phone", extStudent?.phone || "—"],
                  ].map(([label, val]) => (
                    <div key={label} className="bg-slate-50 rounded-lg p-3">
                      <p className="text-xs text-slate-400">{label}</p>
                      <p className="font-medium mt-0.5 text-slate-800 truncate">
                        {val}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
