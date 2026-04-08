import {
  AlertCircle,
  BadgeDollarSign,
  ChevronDown,
  ChevronUp,
  Download,
  FileText,
  PlusCircle,
  Settings2,
  Trash2,
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
import { Label } from "../../components/ui/label";
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

export interface FeeStructureItem {
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
  // seed defaults
  const defaults: FeeStructureItem[] = [
    {
      id: "FS001",
      category: "Tuition",
      level: "100L",
      department: "All",
      session: "2024/2025",
      amount: 150000,
      description: "First year tuition fee",
    },
    {
      id: "FS002",
      category: "Tuition",
      level: "200L",
      department: "All",
      session: "2024/2025",
      amount: 140000,
      description: "Second year tuition fee",
    },
    {
      id: "FS003",
      category: "Tuition",
      level: "300L",
      department: "All",
      session: "2024/2025",
      amount: 140000,
      description: "Third year tuition fee",
    },
    {
      id: "FS004",
      category: "Tuition",
      level: "400L",
      department: "All",
      session: "2024/2025",
      amount: 145000,
      description: "Fourth year tuition fee",
    },
    {
      id: "FS005",
      category: "Accommodation",
      level: "All",
      department: "All",
      session: "2024/2025",
      amount: 35000,
      description: "Hostel accommodation fee",
    },
    {
      id: "FS006",
      category: "Registration",
      level: "All",
      department: "All",
      session: "2024/2025",
      amount: 15000,
      description: "Course registration fee",
    },
    {
      id: "FS007",
      category: "Late Fee",
      level: "All",
      department: "All",
      session: "2024/2025",
      amount: 5000,
      description: "Late registration penalty",
    },
    {
      id: "FS008",
      category: "Miscellaneous",
      level: "All",
      department: "All",
      session: "2024/2025",
      amount: 10000,
      description: "Student union & miscellaneous",
    },
  ];
  localStorage.setItem(LS_KEY, JSON.stringify(defaults));
  return defaults;
}

function saveLocalFeeStructure(items: FeeStructureItem[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(items));
}

const CATEGORIES: FeeStructureItem["category"][] = [
  "Tuition",
  "Accommodation",
  "Registration",
  "Late Fee",
  "Miscellaneous",
];
const LEVELS = ["All", "100L", "200L", "300L", "400L", "500L"];
const SESSIONS = ["2024/2025", "2023/2024", "2022/2023"];
const DEPARTMENTS = [
  "All",
  "Computer Science",
  "Engineering",
  "Medicine",
  "Law",
  "Business Administration",
];

const categoryColor: Record<string, string> = {
  Tuition: "bg-blue-100 text-blue-700",
  Accommodation: "bg-purple-100 text-purple-700",
  Registration: "bg-green-100 text-green-700",
  "Late Fee": "bg-red-100 text-red-700",
  Miscellaneous: "bg-amber-100 text-amber-700",
};

function blankItem(): FeeStructureItem {
  return {
    id: "",
    category: "Tuition",
    level: "All",
    department: "All",
    session: "2024/2025",
    amount: 0,
    description: "",
  };
}

export function FeeManagement() {
  const [structure, setStructure] = useState<FeeStructureItem[]>([]);
  const [dialog, setDialog] = useState(false);
  const [editItem, setEditItem] = useState<FeeStructureItem | null>(null);
  const [form, setForm] = useState<FeeStructureItem>(blankItem());
  const [filterSession, setFilterSession] = useState("2024/2025");
  const [sortCol, setSortCol] = useState<keyof FeeStructureItem>("category");
  const [sortAsc, setSortAsc] = useState(true);

  const students = getLocalStudents();
  const invoices = getLocalInvoices();
  const payments = getLocalPayments();

  useEffect(() => {
    setStructure(getLocalFeeStructure());
  }, []);

  const openAdd = () => {
    setEditItem(null);
    setForm(blankItem());
    setDialog(true);
  };
  const openEdit = (item: FeeStructureItem) => {
    setEditItem(item);
    setForm({ ...item });
    setDialog(true);
  };

  const save = () => {
    const entry: FeeStructureItem = {
      ...form,
      id: editItem ? form.id : `FS${Date.now()}`,
    };
    const updated = editItem
      ? structure.map((s) => (s.id === editItem.id ? entry : s))
      : [...structure, entry];
    saveLocalFeeStructure(updated);
    setStructure(updated);
    setDialog(false);
  };

  const del = (id: string) => {
    const updated = structure.filter((s) => s.id !== id);
    saveLocalFeeStructure(updated);
    setStructure(updated);
  };

  const toggleSort = (col: keyof FeeStructureItem) => {
    if (sortCol === col) setSortAsc((a) => !a);
    else {
      setSortCol(col);
      setSortAsc(true);
    }
  };

  const SortIcon = ({ col }: { col: keyof FeeStructureItem }) =>
    sortCol === col ? (
      sortAsc ? (
        <ChevronUp size={14} />
      ) : (
        <ChevronDown size={14} />
      )
    ) : null;

  const filtered = structure
    .filter((s) => s.session === filterSession)
    .sort((a, b) => {
      const av = String(a[sortCol]);
      const bv = String(b[sortCol]);
      return sortAsc ? av.localeCompare(bv) : bv.localeCompare(av);
    });

  // Payment analytics
  const totalExpected = invoices.reduce((s, i) => s + i.amount, 0);
  const totalCollected = payments.reduce((s, p) => s + p.amountPaid, 0);
  const totalOutstanding = totalExpected - totalCollected;
  const fullyPaid = invoices.filter((i) => i.paid >= i.amount).length;
  const partial = invoices.filter(
    (i) => i.paid > 0 && i.paid < i.amount,
  ).length;
  const unpaid = invoices.filter((i) => i.paid === 0).length;

  return (
    <div className="space-y-6" data-ocid="fee_management.root">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Fee Management</h1>
          <p className="text-sm text-muted-foreground">
            Define fee structures, monitor collections, and generate reports
          </p>
        </div>
        <Button onClick={openAdd} data-ocid="fee_management.add_button">
          <PlusCircle size={16} className="mr-2" /> Add Fee Item
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Total Expected",
            value: `₦${totalExpected.toLocaleString()}`,
            icon: BadgeDollarSign,
            color: "text-blue-600",
          },
          {
            label: "Total Collected",
            value: `₦${totalCollected.toLocaleString()}`,
            icon: FileText,
            color: "text-green-600",
          },
          {
            label: "Outstanding",
            value: `₦${totalOutstanding.toLocaleString()}`,
            icon: AlertCircle,
            color: "text-red-600",
          },
          {
            label: "Students",
            value: `${students.length} total`,
            icon: Settings2,
            color: "text-purple-600",
          },
        ].map((kpi) => (
          <Card key={kpi.label} data-ocid="fee_management.kpi_card">
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

      <Tabs defaultValue="structure">
        <TabsList>
          <TabsTrigger value="structure">Fee Structure</TabsTrigger>
          <TabsTrigger value="collections">Collection Report</TabsTrigger>
          <TabsTrigger value="students">Student Balances</TabsTrigger>
        </TabsList>

        {/* Fee Structure Tab */}
        <TabsContent value="structure" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Fee Structure</CardTitle>
                <Select value={filterSession} onValueChange={setFilterSession}>
                  <SelectTrigger
                    className="w-40"
                    data-ocid="fee_management.session_filter"
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
              <Table data-ocid="fee_management.structure_table">
                <TableHeader>
                  <TableRow>
                    {(
                      [
                        "category",
                        "level",
                        "department",
                        "amount",
                        "description",
                      ] as (keyof FeeStructureItem)[]
                    ).map((col) => (
                      <TableHead
                        key={col}
                        className="cursor-pointer select-none"
                        onClick={() => toggleSort(col)}
                      >
                        <div className="flex items-center gap-1 capitalize">
                          {col} <SortIcon col={col} />
                        </div>
                      </TableHead>
                    ))}
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center text-muted-foreground py-8"
                      >
                        No fee items for {filterSession}.
                      </TableCell>
                    </TableRow>
                  )}
                  {filtered.map((item) => (
                    <TableRow
                      key={item.id}
                      data-ocid={`fee_management.row.${item.id}`}
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
                      <TableCell className="text-right font-mono">
                        ₦{item.amount.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {item.description}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEdit(item)}
                            data-ocid={`fee_management.edit.${item.id}`}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive"
                            onClick={() => del(item.id)}
                            data-ocid={`fee_management.delete.${item.id}`}
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Collection Report Tab */}
        <TabsContent value="collections" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">
                  Fee Collection Summary
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.print()}
                  data-ocid="fee_management.print_report"
                >
                  <Download size={14} className="mr-1" /> Export
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                {[
                  {
                    label: "Fully Paid",
                    count: fullyPaid,
                    color: "bg-green-50 border-green-200 text-green-700",
                  },
                  {
                    label: "Partial Payment",
                    count: partial,
                    color: "bg-amber-50 border-amber-200 text-amber-700",
                  },
                  {
                    label: "No Payment",
                    count: unpaid,
                    color: "bg-red-50 border-red-200 text-red-700",
                  },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className={`rounded-lg border p-4 text-center ${stat.color}`}
                  >
                    <p className="text-2xl font-bold">{stat.count}</p>
                    <p className="text-sm">{stat.label}</p>
                  </div>
                ))}
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student Matric</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Paid</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((inv) => {
                    const balance = inv.amount - inv.paid;
                    const status =
                      balance <= 0
                        ? "Paid"
                        : inv.paid > 0
                          ? "Partial"
                          : "Unpaid";
                    return (
                      <TableRow
                        key={inv.id}
                        data-ocid={`fee_management.collection.${inv.id}`}
                      >
                        <TableCell className="font-mono text-sm">
                          {inv.studentMatric}
                        </TableCell>
                        <TableCell>{inv.description}</TableCell>
                        <TableCell className="text-right font-mono">
                          ₦{inv.amount.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right font-mono text-green-600">
                          ₦{inv.paid.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right font-mono text-red-600">
                          ₦{balance.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              status === "Paid"
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

        {/* Student Balances Tab */}
        <TabsContent value="students" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                Outstanding Balances by Student
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Matric No</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead className="text-right">Amount Due</TableHead>
                    <TableHead className="text-right">Amount Paid</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => {
                    const studentInvoices = invoices.filter(
                      (i) => i.studentMatric === student.matricNumber,
                    );
                    const totalDue = studentInvoices.reduce(
                      (s, i) => s + i.amount,
                      0,
                    );
                    const totalPaid = studentInvoices.reduce(
                      (s, i) => s + i.paid,
                      0,
                    );
                    const balance = totalDue - totalPaid;
                    const status =
                      balance <= 0
                        ? "Cleared"
                        : totalPaid > 0
                          ? "Partial"
                          : "Unpaid";
                    return (
                      <TableRow
                        key={student.matricNumber}
                        data-ocid={`fee_management.student_balance.${student.matricNumber}`}
                      >
                        <TableCell className="font-medium">
                          {student.name}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {student.matricNumber}
                        </TableCell>
                        <TableCell>{student.level}L</TableCell>
                        <TableCell>{student.department}</TableCell>
                        <TableCell className="text-right font-mono">
                          ₦{totalDue.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right font-mono text-green-600">
                          ₦{totalPaid.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right font-mono text-red-600">
                          ₦{balance.toLocaleString()}
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

      {/* Add/Edit Dialog */}
      <Dialog open={dialog} onOpenChange={setDialog}>
        <DialogContent data-ocid="fee_management.dialog">
          <DialogHeader>
            <DialogTitle>
              {editItem ? "Edit Fee Item" : "Add Fee Item"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Category</Label>
                <Select
                  value={form.category}
                  onValueChange={(v) =>
                    setForm((f) => ({
                      ...f,
                      category: v as FeeStructureItem["category"],
                    }))
                  }
                >
                  <SelectTrigger
                    className="mt-1"
                    data-ocid="fee_management.category_select"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Level</Label>
                <Select
                  value={form.level}
                  onValueChange={(v) => setForm((f) => ({ ...f, level: v }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LEVELS.map((l) => (
                      <SelectItem key={l} value={l}>
                        {l}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Department</Label>
                <Select
                  value={form.department}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, department: v }))
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPARTMENTS.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Session</Label>
                <Select
                  value={form.session}
                  onValueChange={(v) => setForm((f) => ({ ...f, session: v }))}
                >
                  <SelectTrigger className="mt-1">
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
            <div>
              <Label>Amount (₦)</Label>
              <Input
                className="mt-1"
                type="number"
                min={0}
                value={form.amount}
                onChange={(e) =>
                  setForm((f) => ({ ...f, amount: Number(e.target.value) }))
                }
                data-ocid="fee_management.amount_input"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Input
                className="mt-1"
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                data-ocid="fee_management.description_input"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialog(false)}
              data-ocid="fee_management.cancel_button"
            >
              Cancel
            </Button>
            <Button onClick={save} data-ocid="fee_management.save_button">
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
