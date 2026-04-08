import {
  Calendar,
  CheckCircle,
  PlusCircle,
  UserCheck,
  Users,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { StatCard } from "../../components/StatCard";
import { StaffRequests } from "../../components/hr/StaffRequests";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Textarea } from "../../components/ui/textarea";
import {
  type LeaveRequest,
  type StaffRecord,
  getLocalLeaves,
  getLocalStaff,
  saveLocalLeaves,
  saveLocalStaff,
} from "../../utils/sampleData";
import { MemoAcknowledgment } from "../shared/MemoAcknowledgment";
import { StaffDirectory } from "../shared/StaffDirectory";
import { StudentRecordsList } from "../shared/StudentRecordsList";
import { Appraisals } from "./Appraisals";
import { Payroll } from "./Payroll";
import { StaffTraining } from "./StaffTraining";
import { TrainingApprovalHR } from "./TrainingApprovalHR";

type Page =
  | "dashboard"
  | "staff"
  | "leaves"
  | "attendance"
  | "reports"
  | "requests"
  | "payroll"
  | "appraisals"
  | "student-records"
  | "staff-training"
  | "training-approval-hr"
  | "staff-directory"
  | "memos";
interface Props {
  activePage: Page;
}

function blankStaff(): StaffRecord {
  return {
    staffId: "",
    name: "",
    designation: "lecturer",
    email: "",
    department: "",
  };
}

export function HRDashboard({ activePage }: Props) {
  const [staff, setStaff] = useState<StaffRecord[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [attendance, setAttendance] = useState<
    { id: string; staffId: string; date: string; status: string }[]
  >([]);

  const [staffDialog, setStaffDialog] = useState(false);
  const [editStaff, setEditStaff] = useState<StaffRecord | null>(null);
  const [staffForm, setStaffForm] = useState<StaffRecord>(blankStaff());

  const [leaveDialog, setLeaveDialog] = useState(false);
  const [leaveForm, setLeaveForm] = useState({
    staffId: "",
    staffName: "",
    leaveType: "Annual",
    startDate: "",
    endDate: "",
    reason: "",
  });

  const [attDialog, setAttDialog] = useState(false);
  const [attForm, setAttForm] = useState({
    staffId: "",
    date: "",
    status: "present",
  });

  // biome-ignore lint/correctness/useExhaustiveDependencies: activePage is intentional refresh trigger
  useEffect(() => {
    setStaff(getLocalStaff());
    setLeaves(getLocalLeaves());
    setAttendance(
      JSON.parse(localStorage.getItem("unidigital_attendance") || "[]"),
    );
  }, [activePage]);

  const pending = leaves.filter((l) => l.status === "pending").length;

  const saveStaffRecord = () => {
    let updated: StaffRecord[];
    if (editStaff)
      updated = staff.map((s) =>
        s.staffId === editStaff.staffId ? staffForm : s,
      );
    else updated = [...staff, staffForm];
    saveLocalStaff(updated);
    setStaff(updated);
    setStaffDialog(false);
  };

  const updateLeave = (id: string, status: "approved" | "rejected") => {
    const updated = leaves.map((l) => (l.id === id ? { ...l, status } : l));
    saveLocalLeaves(updated);
    setLeaves(updated);
  };

  const saveLeave = () => {
    const newLeave: LeaveRequest = {
      id: `LV${Date.now()}`,
      ...leaveForm,
      status: "pending",
    };
    const updated = [...leaves, newLeave];
    saveLocalLeaves(updated);
    setLeaves(updated);
    setLeaveDialog(false);
  };

  const saveAttendance = () => {
    const rec = { id: `ATT${Date.now()}`, ...attForm };
    const updated = [...attendance, rec];
    localStorage.setItem("unidigital_attendance", JSON.stringify(updated));
    setAttendance(updated);
    setAttDialog(false);
  };

  const leaveStatusColor: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700",
    approved: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
  };

  if (activePage === "dashboard")
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">HR Dashboard</h1>
          <p className="text-slate-500 text-sm">
            Staff management & HR operations
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <StatCard
            title="Total Staff"
            value={staff.length}
            icon={<Users size={22} />}
            color="blue"
          />
          <StatCard
            title="Pending Leaves"
            value={pending}
            icon={<Calendar size={22} />}
            color="amber"
          />
          <StatCard
            title="Attendance Records"
            value={attendance.length}
            icon={<UserCheck size={22} />}
            color="green"
          />
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Staff by Department</CardTitle>
            </CardHeader>
            <CardContent>
              {[...new Set(staff.map((s) => s.department))].map((dept) => (
                <div
                  key={dept}
                  className="flex justify-between py-2 border-b last:border-0"
                >
                  <span className="text-sm">{dept}</span>
                  <span className="text-sm font-semibold">
                    {staff.filter((s) => s.department === dept).length}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Pending Leave Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              {leaves
                .filter((l) => l.status === "pending")
                .slice(0, 4)
                .map((l) => (
                  <div
                    key={l.id}
                    className="flex items-center justify-between py-2 border-b last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium">{l.staffName}</p>
                      <p className="text-xs text-slate-500">
                        {l.leaveType} &bull; {l.startDate}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-green-600"
                        onClick={() => updateLeave(l.id, "approved")}
                      >
                        <CheckCircle size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500"
                        onClick={() => updateLeave(l.id, "rejected")}
                      >
                        <XCircle size={16} />
                      </Button>
                    </div>
                  </div>
                ))}
              {pending === 0 && (
                <p className="text-sm text-slate-400">No pending requests.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );

  if (activePage === "staff")
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-slate-800">
            Staff Management
          </h1>
          <Button
            onClick={() => {
              setEditStaff(null);
              setStaffForm(blankStaff());
              setStaffDialog(true);
            }}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <PlusCircle size={16} className="mr-2" /> Add Staff
          </Button>
        </div>
        <Card>
          <CardContent className="p-0">
            <table className="w-full">
              <thead className="bg-slate-50 border-b">
                <tr>
                  {[
                    "Staff ID",
                    "Name",
                    "Designation",
                    "Department",
                    "Email",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {staff.map((s) => (
                  <tr
                    key={s.staffId}
                    className="border-b last:border-0 hover:bg-slate-50"
                  >
                    <td className="px-4 py-3 text-sm font-mono text-blue-600">
                      {s.staffId}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium">{s.name}</td>
                    <td className="px-4 py-3">
                      <Badge className="capitalize text-xs">
                        {s.designation}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm">{s.department}</td>
                    <td className="px-4 py-3 text-sm text-slate-500">
                      {s.email}
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditStaff(s);
                          setStaffForm({ ...s });
                          setStaffDialog(true);
                        }}
                      >
                        Edit
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Dialog open={staffDialog} onOpenChange={setStaffDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editStaff ? "Edit Staff" : "Add Staff"}
              </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Staff ID</Label>
                <Input
                  className="mt-1"
                  value={staffForm.staffId}
                  onChange={(e) =>
                    setStaffForm((f) => ({ ...f, staffId: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label>Full Name</Label>
                <Input
                  className="mt-1"
                  value={staffForm.name}
                  onChange={(e) =>
                    setStaffForm((f) => ({ ...f, name: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  className="mt-1"
                  value={staffForm.email}
                  onChange={(e) =>
                    setStaffForm((f) => ({ ...f, email: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label>Designation</Label>
                <Select
                  value={staffForm.designation}
                  onValueChange={(v) =>
                    setStaffForm((f) => ({ ...f, designation: v }))
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["lecturer", "admin", "hr", "bursary", "support"].map(
                      (d) => (
                        <SelectItem key={d} value={d}>
                          {d}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label>Department</Label>
                <Input
                  className="mt-1"
                  value={staffForm.department}
                  onChange={(e) =>
                    setStaffForm((f) => ({ ...f, department: e.target.value }))
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setStaffDialog(false)}>
                Cancel
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700"
                onClick={saveStaffRecord}
              >
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );

  if (activePage === "leaves")
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-slate-800">Leave Requests</h1>
          <Button
            onClick={() => setLeaveDialog(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <PlusCircle size={16} className="mr-2" /> New Request
          </Button>
        </div>
        <Card>
          <CardContent className="p-0">
            <table className="w-full">
              <thead className="bg-slate-50 border-b">
                <tr>
                  {[
                    "Staff",
                    "Type",
                    "Start",
                    "End",
                    "Reason",
                    "Status",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {leaves.map((l) => (
                  <tr
                    key={l.id}
                    className="border-b last:border-0 hover:bg-slate-50"
                  >
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium">{l.staffName}</p>
                      <p className="text-xs text-slate-500">{l.staffId}</p>
                    </td>
                    <td className="px-4 py-3 text-sm">{l.leaveType}</td>
                    <td className="px-4 py-3 text-sm">{l.startDate}</td>
                    <td className="px-4 py-3 text-sm">{l.endDate}</td>
                    <td className="px-4 py-3 text-sm text-slate-500 max-w-xs truncate">
                      {l.reason}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${leaveStatusColor[l.status]}`}
                      >
                        {l.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {l.status === "pending" && (
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-green-600 hover:text-green-800"
                            onClick={() => updateLeave(l.id, "approved")}
                          >
                            <CheckCircle size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-700"
                            onClick={() => updateLeave(l.id, "rejected")}
                          >
                            <XCircle size={16} />
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Dialog open={leaveDialog} onOpenChange={setLeaveDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Submit Leave Request</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Staff ID</Label>
                  <Input
                    className="mt-1"
                    value={leaveForm.staffId}
                    onChange={(e) =>
                      setLeaveForm((f) => ({ ...f, staffId: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <Label>Staff Name</Label>
                  <Input
                    className="mt-1"
                    value={leaveForm.staffName}
                    onChange={(e) =>
                      setLeaveForm((f) => ({
                        ...f,
                        staffName: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              <div>
                <Label>Leave Type</Label>
                <Select
                  value={leaveForm.leaveType}
                  onValueChange={(v) =>
                    setLeaveForm((f) => ({ ...f, leaveType: v }))
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      "Annual",
                      "Medical",
                      "Maternity",
                      "Paternity",
                      "Study",
                    ].map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Start Date</Label>
                  <Input
                    className="mt-1"
                    type="date"
                    value={leaveForm.startDate}
                    onChange={(e) =>
                      setLeaveForm((f) => ({
                        ...f,
                        startDate: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label>End Date</Label>
                  <Input
                    className="mt-1"
                    type="date"
                    value={leaveForm.endDate}
                    onChange={(e) =>
                      setLeaveForm((f) => ({ ...f, endDate: e.target.value }))
                    }
                  />
                </div>
              </div>
              <div>
                <Label>Reason</Label>
                <Textarea
                  className="mt-1"
                  rows={3}
                  value={leaveForm.reason}
                  onChange={(e) =>
                    setLeaveForm((f) => ({ ...f, reason: e.target.value }))
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setLeaveDialog(false)}>
                Cancel
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700"
                onClick={saveLeave}
              >
                Submit
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );

  if (activePage === "attendance")
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-slate-800">
            Attendance Records
          </h1>
          <Button
            onClick={() => setAttDialog(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <PlusCircle size={16} className="mr-2" /> Record
          </Button>
        </div>
        <Card>
          <CardContent className="p-0">
            <table className="w-full">
              <thead className="bg-slate-50 border-b">
                <tr>
                  {["Staff ID", "Date", "Status"].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {attendance.map(
                  (a: {
                    id: string;
                    staffId: string;
                    date: string;
                    status: string;
                  }) => (
                    <tr
                      key={a.id}
                      className="border-b last:border-0 hover:bg-slate-50"
                    >
                      <td className="px-4 py-3 text-sm font-mono">
                        {a.staffId}
                      </td>
                      <td className="px-4 py-3 text-sm">{a.date}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${a.status === "present" ? "bg-green-100 text-green-700" : a.status === "late" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}
                        >
                          {a.status}
                        </span>
                      </td>
                    </tr>
                  ),
                )}
                {attendance.length === 0 && (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-4 py-8 text-center text-slate-400"
                    >
                      No records yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Dialog open={attDialog} onOpenChange={setAttDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Record Attendance</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Staff</Label>
                <Select
                  value={attForm.staffId}
                  onValueChange={(v) =>
                    setAttForm((f) => ({ ...f, staffId: v }))
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select staff" />
                  </SelectTrigger>
                  <SelectContent>
                    {staff.map((s) => (
                      <SelectItem key={s.staffId} value={s.staffId}>
                        {s.name} ({s.staffId})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Date</Label>
                <Input
                  className="mt-1"
                  type="date"
                  value={attForm.date}
                  onChange={(e) =>
                    setAttForm((f) => ({ ...f, date: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label>Status</Label>
                <Select
                  value={attForm.status}
                  onValueChange={(v) =>
                    setAttForm((f) => ({ ...f, status: v }))
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["present", "absent", "late"].map((s) => (
                      <SelectItem key={s} value={s} className="capitalize">
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAttDialog(false)}>
                Cancel
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700"
                onClick={saveAttendance}
              >
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );

  if (activePage === "reports")
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-slate-800">HR Reports</h1>
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Leave by Type</CardTitle>
            </CardHeader>
            <CardContent>
              {[...new Set(leaves.map((l) => l.leaveType))].map((t) => (
                <div
                  key={t}
                  className="flex justify-between py-2 border-b last:border-0"
                >
                  <span className="text-sm">{t}</span>
                  <span className="text-sm font-semibold">
                    {leaves.filter((l) => l.leaveType === t).length}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Leave Status Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {(["pending", "approved", "rejected"] as const).map((s) => (
                <div key={s} className="flex justify-between">
                  <span className="text-sm capitalize">{s}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-bold ${leaveStatusColor[s]}`}
                  >
                    {leaves.filter((l) => l.status === s).length}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    );

  if (activePage === "requests")
    return <StaffRequests userName="HR Manager" userRole="hr" />;
  if (activePage === "payroll") return <Payroll />;
  if (activePage === "appraisals") return <Appraisals />;
  if (activePage === "student-records")
    return <StudentRecordsList userRole="hr" />;
  if (activePage === "staff-training") return <StaffTraining />;
  if (activePage === "training-approval-hr") return <TrainingApprovalHR />;
  if (activePage === "staff-directory") return <StaffDirectory />;
  if (activePage === "memos") return <MemoAcknowledgment userRole="hr" />;

  return null;
}
