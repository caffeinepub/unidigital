import {
  AlertCircle,
  BarChart3,
  CheckCircle2,
  Download,
  FileText,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
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
  "Late Fee": "bg-red-100 text-red-700",
  Miscellaneous: "bg-amber-100 text-amber-700",
};

export function FeeStructure() {
  const [structure, setStructure] = useState<FeeStructureItem[]>([]);
  const [filterSession, setFilterSession] = useState("2024/2025");

  const students = getLocalStudents();
  const invoices = getLocalInvoices();
  const payments = getLocalPayments();

  useEffect(() => {
    setStructure(getLocalFeeStructure());
  }, []);

  const filtered = structure.filter((s) => s.session === filterSession);

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

  return (
    <div className="space-y-6" data-ocid="fee_structure.root">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Fee Structure & Collections
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
            color: "text-blue-600",
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
            color: "text-red-600",
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
        </TabsList>

        <TabsContent value="schedule" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">
                  Approved Fee Schedule
                </CardTitle>
                <Select value={filterSession} onValueChange={setFilterSession}>
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
                    <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
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
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => {
                    const si = invoices.filter(
                      (i) => i.studentMatric === student.matricNumber,
                    );
                    const due = si.reduce((s, i) => s + i.amount, 0);
                    const paid = si.reduce((s, i) => s + i.paid, 0);
                    const bal = due - paid;
                    const status =
                      bal <= 0 ? "Cleared" : paid > 0 ? "Partial" : "Unpaid";
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
                        <TableCell className="text-right font-mono text-red-600">
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
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
