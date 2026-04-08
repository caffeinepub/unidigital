import {
  AlertCircle,
  Award,
  BarChart3,
  CheckCircle2,
  Download,
  FileText,
  Search,
} from "lucide-react";
import { useEffect, useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Separator } from "../../components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import {
  getLocalInvoices,
  getLocalPayments,
  getLocalStudents,
} from "../../utils/sampleData";

const INSTITUTION_NAME = "Federal University of Education, Kontagora";
const INSTITUTION_ABBR = "FUEK";

interface FeeStructureItem {
  id: string;
  category:
    | "Tuition"
    | "Accommodation"
    | "Registration"
    | "Late Fee"
    | "Miscellaneous";
  level: string;
  department: string;
  session: string;
  amount: number;
  description: string;
}

const LS_KEY = "unidigital_fee_structure";

function getLocalFeeStructure(): FeeStructureItem[] {
  try {
    const data = localStorage.getItem(LS_KEY);
    if (data) return JSON.parse(data) as FeeStructureItem[];
  } catch {
    /* empty */
  }
  return [];
}

const SESSIONS = ["2024/2025", "2023/2024", "2022/2023"];

const categoryColor: Record<string, string> = {
  Tuition: "bg-blue-100 text-blue-700",
  Accommodation: "bg-purple-100 text-purple-700",
  Registration: "bg-green-100 text-green-700",
  "Late Fee": "bg-destructive/10 text-destructive",
  Miscellaneous: "bg-amber-100 text-amber-700",
};

export function FeeStructure() {
  const [structure, setStructure] = useState<FeeStructureItem[]>([]);
  const [filterSession, setFilterSession] = useState("2024/2025");
  const [search, setSearch] = useState("");
  const [clearanceStudent, setClearanceStudent] = useState<string | null>(null);

  const students = getLocalStudents();
  const invoices = getLocalInvoices();
  const payments = getLocalPayments();

  useEffect(() => {
    setStructure(getLocalFeeStructure());
  }, []);

  const filtered = structure.filter(
    (s) =>
      s.session === filterSession &&
      (s.description.toLowerCase().includes(search.toLowerCase()) ||
        s.category.toLowerCase().includes(search.toLowerCase()) ||
        s.level.toLowerCase().includes(search.toLowerCase())),
  );

  const totalExpected = invoices.reduce((s, i) => s + i.amount, 0);
  const totalCollected = payments.reduce((s, p) => s + p.amountPaid, 0);
  const totalOutstanding = totalExpected - totalCollected;
  const collectionRate =
    totalExpected > 0 ? Math.round((totalCollected / totalExpected) * 100) : 0;

  const fullyPaid = invoices.filter((i) => i.paid >= i.amount).length;
  const partial = invoices.filter(
    (i) => i.paid > 0 && i.paid < i.amount,
  ).length;
  const unpaid = invoices.filter((i) => i.paid === 0).length;

  const getStudentStatus = (matric: string) => {
    const si = invoices.filter((i) => i.studentMatric === matric);
    const due = si.reduce((s, i) => s + i.amount, 0);
    const paid = si.reduce((s, i) => s + i.paid, 0);
    const bal = due - paid;
    return {
      due,
      paid,
      bal,
      status: bal <= 0 && due > 0 ? "Cleared" : paid > 0 ? "Partial" : "Unpaid",
    };
  };

  const clearanceStudentData = clearanceStudent
    ? students.find((s) => s.matricNumber === clearanceStudent)
    : null;
  const clearanceStatus = clearanceStudent
    ? getStudentStatus(clearanceStudent)
    : null;

  return (
    <div className="space-y-6" data-ocid="fee_structure.root">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Fee Structure &amp; Collections
          </h1>
          <p className="text-sm text-muted-foreground">
            View institutional fee schedule and collection status
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => window.print()}
          data-ocid="fee_structure.export_button"
        >
          <Download size={14} className="mr-1" /> Export Report
        </Button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Total Expected",
            value: `₦${totalExpected.toLocaleString()}`,
            icon: FileText,
            color: "text-primary",
          },
          {
            label: "Total Collected",
            value: `₦${totalCollected.toLocaleString()}`,
            icon: CheckCircle2,
            color: "text-green-600",
          },
          {
            label: "Outstanding",
            value: `₦${totalOutstanding.toLocaleString()}`,
            icon: AlertCircle,
            color: "text-destructive",
          },
          {
            label: "Collection Rate",
            value: `${collectionRate}%`,
            icon: BarChart3,
            color: "text-purple-600",
          },
        ].map((kpi) => (
          <Card key={kpi.label} data-ocid="fee_structure.kpi_card">
            <CardContent className="p-4 flex items-center gap-3">
              <kpi.icon className={`${kpi.color} flex-shrink-0`} size={28} />
              <div>
                <p className="text-xs text-muted-foreground">{kpi.label}</p>
                <p className="text-lg font-bold text-foreground">{kpi.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Progress bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">
              Collection Progress ({filterSession})
            </span>
            <span className="text-sm font-bold text-green-600">
              {collectionRate}%
            </span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all"
              style={{ width: `${collectionRate}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>Collected: ₦{totalCollected.toLocaleString()}</span>
            <span>Target: ₦{totalExpected.toLocaleString()}</span>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="schedule">
        <TabsList>
          <TabsTrigger value="schedule">Fee Schedule</TabsTrigger>
          <TabsTrigger value="students">Student Payments</TabsTrigger>
          <TabsTrigger value="clearance">Clearance Certificates</TabsTrigger>
        </TabsList>

        <TabsContent value="schedule" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <CardTitle className="text-base">
                  Approved Fee Schedule
                </CardTitle>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search
                      size={14}
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                    />
                    <Input
                      className="pl-8 w-48"
                      placeholder="Search items..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                  <Select
                    value={filterSession}
                    onValueChange={setFilterSession}
                  >
                    <SelectTrigger
                      className="w-40"
                      data-ocid="fee_structure.session_filter"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SESSIONS.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table data-ocid="fee_structure.schedule_table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center text-muted-foreground py-8"
                        data-ocid="fee_structure.schedule_empty"
                      >
                        No fee schedule for {filterSession}.
                      </TableCell>
                    </TableRow>
                  )}
                  {filtered.map((item) => (
                    <TableRow
                      key={item.id}
                      data-ocid={`fee_structure.row.${item.id}`}
                    >
                      <TableCell>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${categoryColor[item.category] ?? "bg-muted text-foreground"}`}
                        >
                          {item.category}
                        </span>
                      </TableCell>
                      <TableCell>{item.level}</TableCell>
                      <TableCell>{item.department}</TableCell>
                      <TableCell className="text-right font-mono font-semibold">
                        ₦{item.amount.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {item.description}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="students" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">
                  Student Payment Status
                </CardTitle>
                <div className="flex gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                    {fullyPaid} paid
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                    {partial} partial
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-destructive inline-block" />
                    {unpaid} unpaid
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table data-ocid="fee_structure.students_table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Matric No</TableHead>
                    <TableHead>Dept / Level</TableHead>
                    <TableHead className="text-right">Expected</TableHead>
                    <TableHead className="text-right">Paid</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => {
                    const { due, paid, bal, status } = getStudentStatus(
                      student.matricNumber,
                    );
                    return (
                      <TableRow
                        key={student.matricNumber}
                        data-ocid={`fee_structure.student.${student.matricNumber}`}
                      >
                        <TableCell className="font-medium">
                          {student.name}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {student.matricNumber}
                        </TableCell>
                        <TableCell className="text-sm">
                          {student.department} / {student.level}L
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          ₦{due.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right font-mono text-green-600">
                          ₦{paid.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right font-mono text-destructive">
                          ₦{bal.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              status === "Cleared"
                                ? "default"
                                : status === "Partial"
                                  ? "secondary"
                                  : "destructive"
                            }
                          >
                            {status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {status === "Cleared" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                setClearanceStudent(student.matricNumber)
                              }
                              data-ocid={`fee_structure.clearance.${student.matricNumber}`}
                            >
                              <Award size={12} className="mr-1" /> Certificate
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clearance" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                Fee Clearance Certificates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table data-ocid="fee_structure.clearance_table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Matric No</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead className="text-right">Total Paid</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Certificate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students
                    .filter((s) => {
                      const { status } = getStudentStatus(s.matricNumber);
                      return status === "Cleared";
                    })
                    .map((student) => {
                      const { paid } = getStudentStatus(student.matricNumber);
                      return (
                        <TableRow
                          key={student.matricNumber}
                          data-ocid={`fee_structure.cleared.${student.matricNumber}`}
                        >
                          <TableCell className="font-medium">
                            {student.name}
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {student.matricNumber}
                          </TableCell>
                          <TableCell>{student.department}</TableCell>
                          <TableCell className="text-right font-mono text-green-600">
                            ₦{paid.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <span className="text-green-600 text-xs font-medium flex items-center gap-1">
                              <CheckCircle2 size={12} /> Fully Paid
                            </span>
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                setClearanceStudent(student.matricNumber)
                              }
                              data-ocid={`fee_structure.issue_cert.${student.matricNumber}`}
                            >
                              <Award size={12} className="mr-1" /> Issue
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  {students.filter((s) => {
                    const { status } = getStudentStatus(s.matricNumber);
                    return status === "Cleared";
                  }).length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center text-muted-foreground py-8"
                        data-ocid="fee_structure.clearance_empty"
                      >
                        No students have fully cleared their fees yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Clearance Certificate Dialog */}
      <Dialog
        open={!!clearanceStudent}
        onOpenChange={() => setClearanceStudent(null)}
      >
        <DialogContent
          className="max-w-lg"
          data-ocid="fee_structure.clearance_dialog"
        >
          <DialogHeader>
            <DialogTitle>Fee Clearance Certificate</DialogTitle>
          </DialogHeader>
          {clearanceStudentData && clearanceStatus && (
            <div
              className="border rounded-lg p-6 space-y-4 text-sm"
              id="bursary-clearance-cert"
            >
              <div className="text-center border-b pb-4 space-y-1">
                <p className="font-bold text-base text-foreground uppercase">
                  {INSTITUTION_NAME}
                </p>
                <p className="text-muted-foreground text-xs">
                  Bursary &amp; Finance Division
                </p>
                <p className="font-semibold text-foreground uppercase tracking-wide mt-2">
                  Fee Clearance Certificate
                </p>
              </div>
              <p>
                This is to certify that{" "}
                <strong>{clearanceStudentData.name}</strong>, Matric Number{" "}
                <strong>{clearanceStudentData.matricNumber}</strong>, Department
                of <strong>{clearanceStudentData.department}</strong>,{" "}
                {clearanceStudentData.level}L, has fully paid all outstanding
                school fees and is financially cleared.
              </p>
              <Separator />
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-muted-foreground">Total Amount Paid</p>
                  <p className="font-bold text-foreground">
                    ₦{clearanceStatus.paid.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Clearance Date</p>
                  <p className="font-bold text-foreground">
                    {new Date().toLocaleDateString("en-GB")}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Issued By</p>
                  <p className="font-bold text-foreground">Bursary Office</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Certificate No</p>
                  <p className="font-mono text-foreground">
                    {INSTITUTION_ABBR}/FCC/{new Date().getFullYear()}/
                    {Math.floor(Math.random() * 9000) + 1000}
                  </p>
                </div>
              </div>
              <div className="border-t pt-4 flex justify-between text-xs">
                <div>
                  <p className="font-semibold text-foreground">
                    Bursar's Signature
                  </p>
                  <div className="border-b border-foreground w-32 mt-4" />
                  <p className="text-muted-foreground mt-1">
                    Date: _______________
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-foreground">
                    {INSTITUTION_ABBR} MIS
                  </p>
                  <p className="text-muted-foreground mt-1">
                    Printed: {new Date().toLocaleDateString("en-GB")}
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setClearanceStudent(null)}>
              Close
            </Button>
            <Button
              onClick={() => window.print()}
              data-ocid="fee_structure.print_clearance"
            >
              <Download size={14} className="mr-2" /> Print Certificate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
