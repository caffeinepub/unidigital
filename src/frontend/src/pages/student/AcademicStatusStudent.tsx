import { AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { Badge } from "../../components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { useResultProcessing } from "../../contexts/ResultProcessingContext";
import { getLocalStudents } from "../../utils/sampleData";

interface Props {
  userEmail: string;
}

const statusConfig: Record<
  string,
  { color: string; icon: React.ReactNode; message: string; action?: string }
> = {
  active: {
    color: "bg-green-100 text-green-700",
    icon: <CheckCircle size={20} className="text-green-500" />,
    message:
      "Your academic standing is in good standing. Keep up the good work!",
  },
  probation: {
    color: "bg-amber-100 text-amber-700",
    icon: <AlertTriangle size={20} className="text-amber-500" />,
    message:
      "You are on academic probation. Your CGPA is below the minimum requirement.",
    action:
      "Improve your CGPA to at least 1.0 by the end of next semester to return to good standing. Visit your HOD for academic counselling.",
  },
  suspended: {
    color: "bg-red-100 text-red-700",
    icon: <AlertTriangle size={20} className="text-red-500" />,
    message:
      "Your registration is currently suspended. You cannot register courses this semester.",
    action:
      "Contact the Registrar's office to begin the reinstatement process.",
  },
  withdrawn: {
    color: "bg-slate-100 text-slate-600",
    icon: <Clock size={20} className="text-slate-400" />,
    message: "Your registration has been withdrawn.",
  },
  deferred: {
    color: "bg-blue-100 text-blue-700",
    icon: <Clock size={20} className="text-blue-500" />,
    message:
      "Your studies are currently deferred. You may return next academic session.",
  },
  reinstated: {
    color: "bg-teal-100 text-teal-700",
    icon: <CheckCircle size={20} className="text-teal-500" />,
    message: "Your academic registration has been reinstated. Welcome back!",
  },
};

export function AcademicStatusStudent({ userEmail }: Props) {
  const { academicStatuses } = useResultProcessing();
  const students = getLocalStudents();
  const student = students.find((s) => s.email === userEmail) ?? students[0];
  const matric = student?.matricNumber ?? "";

  const record = academicStatuses.find((s) => s.studentMatric === matric) ?? {
    studentMatric: matric,
    status: "active",
    reason: "",
    date: new Date().toISOString().slice(0, 10),
  };

  const config = statusConfig[record.status] ?? statusConfig.active;

  // History = all records for this student (just the one for now)
  const history = academicStatuses.filter((s) => s.studentMatric === matric);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Academic Status</h1>
        <p className="text-slate-500 text-sm mt-1">
          Your current academic standing and history.
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            {config.icon}
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold capitalize">
                  {record.status}
                </h2>
                <Badge className={config.color}>
                  {record.status.toUpperCase()}
                </Badge>
              </div>
              <p className="text-sm text-slate-600 mt-1">{config.message}</p>
              {record.reason && (
                <p className="text-sm text-slate-500 mt-1">
                  Reason: {record.reason}
                </p>
              )}
            </div>
          </div>
          {config.action && (
            <div
              className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg"
              data-ocid="status.error_state"
            >
              <p className="text-sm text-amber-700 font-medium">What to do:</p>
              <p className="text-sm text-amber-600 mt-1">{config.action}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Academic History</CardTitle>
        </CardHeader>
        <CardContent>
          {history.length === 0 && (
            <p
              className="text-slate-400 text-sm"
              data-ocid="status.empty_state"
            >
              No history available.
            </p>
          )}
          <div className="space-y-3">
            {history.map((h) => (
              <div
                key={h.date + h.status}
                className="flex items-center gap-3 py-2 border-b last:border-0"
                data-ocid="status.item.row"
              >
                <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium capitalize">{h.status}</p>
                  <p className="text-xs text-slate-500">
                    {h.date}
                    {h.reason ? ` – ${h.reason}` : ""}
                  </p>
                </div>
              </div>
            ))}
            {/* Default entry */}
            <div className="flex items-center gap-3 py-2">
              <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium">Enrolled</p>
                <p className="text-xs text-slate-500">
                  2021-09-01 – Admitted to program
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
