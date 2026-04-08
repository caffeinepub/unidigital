import { Download, Filter, Printer } from "lucide-react";
import { useMemo, useState } from "react";
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
import { getLocalInvoices, getLocalStudents } from "../../utils/sampleData";

interface AgingRow {
  studentName: string;
  matric: string;
  department: string;
  level: string;
  invoiceDate: string;
  amount: number;
  paid: number;
  balance: number;
  daysOverdue: number;
  bucket: "0-30" | "31-60" | "61-90" | "90+";
}

const BUCKETS = ["0-30", "31-60", "61-90", "90+"] as const;
type Bucket = (typeof BUCKETS)[number];

const BUCKET_STYLES: Record<
  Bucket,
  { bg: string; text: string; badge: string }
> = {
  "0-30": {
    bg: "bg-yellow-50",
    text: "text-yellow-700",
    badge: "bg-yellow-100 text-yellow-700",
  },
  "31-60": {
    bg: "bg-orange-50",
    text: "text-orange-700",
    badge: "bg-orange-100 text-orange-700",
  },
  "61-90": {
    bg: "bg-red-50",
    text: "text-red-700",
    badge: "bg-red-100 text-red-700",
  },
  "90+": {
    bg: "bg-red-100",
    text: "text-red-900",
    badge: "bg-red-200 text-red-900",
  },
};

const formatNaira = (n: number) => `₦${n.toLocaleString()}`;

function getDaysOverdue(dueDateStr: string): number {
  if (!dueDateStr) return 0;
  const due = new Date(dueDateStr);
  const today = new Date();
  const diff = Math.floor(
    (today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24),
  );
  return Math.max(0, diff);
}

function getBucket(days: number): Bucket {
  if (days <= 30) return "0-30";
  if (days <= 60) return "31-60";
  if (days <= 90) return "61-90";
  return "90+";
}

export function DebtAgingReport() {
  const students = getLocalStudents();
  const invoices = getLocalInvoices();
  const departments = [...new Set(students.map((s) => s.department))].sort();
  const levels = ["100", "200", "300", "400", "500"];

  const [filterDept, setFilterDept] = useState("all");
  const [filterLevel, setFilterLevel] = useState("all");

  const agingRows = useMemo<AgingRow[]>(() => {
    return invoices
      .filter((inv) => inv.amount > inv.paid)
      .map((inv) => {
        const student = students.find(
          (s) => s.matricNumber === inv.studentMatric,
        );
        const days = getDaysOverdue(inv.dueDate);
        return {
          studentName: student?.name ?? inv.studentMatric,
          matric: inv.studentMatric,
          department: student?.department ?? "—",
          level: student?.level ?? "—",
          invoiceDate: inv.dueDate,
          amount: inv.amount,
          paid: inv.paid,
          balance: inv.amount - inv.paid,
          daysOverdue: days,
          bucket: getBucket(days),
        };
      })
      .filter((row) => {
        if (filterDept !== "all" && row.department !== filterDept) return false;
        if (filterLevel !== "all" && row.level !== filterLevel) return false;
        return true;
      })
      .sort((a, b) => b.daysOverdue - a.daysOverdue);
  }, [invoices, students, filterDept, filterLevel]);

  const bucketSummaries = useMemo(() => {
    return BUCKETS.map((bucket) => {
      const rows = agingRows.filter((r) => r.bucket === bucket);
      return {
        bucket,
        count: rows.length,
        total: rows.reduce((s, r) => s + r.balance, 0),
      };
    });
  }, [agingRows]);

  const grandTotal = agingRows.reduce((s, r) => s + r.balance, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Debt Aging Report
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Outstanding invoices grouped by overdue period
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            data-ocid="debt-aging.print_button"
          >
            <Printer size={14} className="mr-2" /> Print
          </Button>
          <Button
            variant="outline"
            size="sm"
            data-ocid="debt-aging.export_button"
          >
            <Download size={14} className="mr-2" /> Export CSV
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {bucketSummaries.map(({ bucket, count, total }) => {
          const style = BUCKET_STYLES[bucket];
          return (
            <Card key={bucket} className={`border-0 ${style.bg}`}>
              <CardContent className="p-4">
                <p
                  className={`text-xs font-semibold uppercase tracking-wider ${style.text}`}
                >
                  {bucket} days
                </p>
                <p className={`text-xl font-bold mt-1 ${style.text}`}>
                  {formatNaira(total)}
                </p>
                <p className={`text-xs mt-0.5 ${style.text} opacity-80`}>
                  {count} student{count !== 1 ? "s" : ""}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Filter size={16} className="text-slate-400" />
              Outstanding Invoices ({agingRows.length})
            </CardTitle>
            <div className="flex gap-2">
              <Select value={filterDept} onValueChange={setFilterDept}>
                <SelectTrigger
                  className="h-8 w-[180px]"
                  data-ocid="debt-aging.dept_filter"
                >
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterLevel} onValueChange={setFilterLevel}>
                <SelectTrigger
                  className="h-8 w-[120px]"
                  data-ocid="debt-aging.level_filter"
                >
                  <SelectValue placeholder="All Levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  {levels.map((l) => (
                    <SelectItem key={l} value={l}>
                      {l} Level
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b">
                <tr>
                  {[
                    "Student Name",
                    "Matric",
                    "Department",
                    "Due Date",
                    "Invoice Amt",
                    "Paid",
                    "Balance",
                    "Days Overdue",
                    "Bucket",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {BUCKETS.flatMap((bucket) => {
                  const rows = agingRows.filter((r) => r.bucket === bucket);
                  if (rows.length === 0) return [];
                  const style = BUCKET_STYLES[bucket];
                  const bucketTotal = rows.reduce((s, r) => s + r.balance, 0);
                  return [
                    ...rows.map((row, i) => (
                      <tr
                        key={`${row.matric}-${i}`}
                        className="border-b hover:bg-slate-50"
                        data-ocid={`debt-aging.row.${row.matric}`}
                      >
                        <td className="px-4 py-3 font-medium text-slate-800">
                          {row.studentName}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-blue-600">
                          {row.matric}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {row.department}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {row.invoiceDate || "—"}
                        </td>
                        <td className="px-4 py-3 text-right font-medium">
                          {formatNaira(row.amount)}
                        </td>
                        <td className="px-4 py-3 text-right text-green-600">
                          {formatNaira(row.paid)}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-red-600">
                          {formatNaira(row.balance)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`font-bold ${style.text}`}>
                            {row.daysOverdue}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={`border-0 text-xs ${style.badge}`}>
                            {bucket} days
                          </Badge>
                        </td>
                      </tr>
                    )),
                    <tr
                      key={`subtotal-${bucket}`}
                      className={`${style.bg} border-b font-semibold`}
                    >
                      <td className="px-4 py-2 text-xs" colSpan={4}>
                        Subtotal — {bucket} days overdue ({rows.length}{" "}
                        accounts)
                      </td>
                      <td className="px-4 py-2 text-right text-xs">
                        {formatNaira(rows.reduce((s, r) => s + r.amount, 0))}
                      </td>
                      <td className="px-4 py-2 text-right text-xs text-green-600">
                        {formatNaira(rows.reduce((s, r) => s + r.paid, 0))}
                      </td>
                      <td
                        className={`px-4 py-2 text-right text-sm ${style.text}`}
                      >
                        {formatNaira(bucketTotal)}
                      </td>
                      <td colSpan={2} />
                    </tr>,
                  ];
                })}
                {agingRows.length === 0 && (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-4 py-10 text-center text-slate-400"
                      data-ocid="debt-aging.empty_state"
                    >
                      No outstanding debts found for the selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
              {agingRows.length > 0 && (
                <tfoot>
                  <tr className="bg-slate-800 text-white font-bold">
                    <td className="px-4 py-3 text-sm" colSpan={4}>
                      Grand Total ({agingRows.length} accounts)
                    </td>
                    <td className="px-4 py-3 text-right text-sm">
                      {formatNaira(agingRows.reduce((s, r) => s + r.amount, 0))}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-green-300">
                      {formatNaira(agingRows.reduce((s, r) => s + r.paid, 0))}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-red-300">
                      {formatNaira(grandTotal)}
                    </td>
                    <td colSpan={2} />
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
