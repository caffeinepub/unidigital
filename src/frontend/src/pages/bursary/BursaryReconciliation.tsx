import { Download, Printer, TrendingDown, TrendingUp } from "lucide-react";
import { useMemo } from "react";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { getLocalInvoices, getLocalStudents } from "../../utils/sampleData";

const formatNaira = (n: number) => `₦${n.toLocaleString()}`;

interface DeptRow {
  department: string;
  totalStudents: number;
  totalExpected: number;
  totalPaid: number;
  balance: number;
  collectionPct: number;
}

export function BursaryReconciliation() {
  const students = getLocalStudents();
  const invoices = getLocalInvoices();

  const totals = useMemo(() => {
    const totalInvoiced = invoices.reduce((s, i) => s + i.amount, 0);
    const totalCollected = invoices.reduce((s, i) => s + i.paid, 0);
    const outstanding = totalInvoiced - totalCollected;
    const collectionPct = totalInvoiced
      ? Math.round((totalCollected / totalInvoiced) * 100)
      : 0;
    return { totalInvoiced, totalCollected, outstanding, collectionPct };
  }, [invoices]);

  const deptRows = useMemo<DeptRow[]>(() => {
    const departments = [...new Set(students.map((s) => s.department))].sort();
    return departments.map((dept) => {
      const deptStudents = students.filter((s) => s.department === dept);
      const deptMatrics = new Set(deptStudents.map((s) => s.matricNumber));
      const deptInvoices = invoices.filter((i) =>
        deptMatrics.has(i.studentMatric),
      );
      const totalExpected = deptInvoices.reduce((s, i) => s + i.amount, 0);
      const totalPaid = deptInvoices.reduce((s, i) => s + i.paid, 0);
      const balance = totalExpected - totalPaid;
      const collectionPct = totalExpected
        ? Math.round((totalPaid / totalExpected) * 100)
        : 0;
      return {
        department: dept,
        totalStudents: deptStudents.length,
        totalExpected,
        totalPaid,
        balance,
        collectionPct,
      };
    });
  }, [students, invoices]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Bursary Reconciliation
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Fee collection summary across departments for 2023/2024
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            data-ocid="reconciliation.print_button"
          >
            <Printer size={14} className="mr-2" /> Print
          </Button>
          <Button
            variant="outline"
            size="sm"
            data-ocid="reconciliation.export_button"
          >
            <Download size={14} className="mr-2" /> Export Report
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-blue-50 border-0">
          <CardContent className="p-4">
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
              Total Invoiced
            </p>
            <p className="text-2xl font-bold text-blue-700 mt-1">
              {formatNaira(totals.totalInvoiced)}
            </p>
            <p className="text-xs text-blue-500 mt-0.5">
              {invoices.length} invoices
            </p>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-0">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-green-600 uppercase tracking-wide">
                  Total Collected
                </p>
                <p className="text-2xl font-bold text-green-700 mt-1">
                  {formatNaira(totals.totalCollected)}
                </p>
                <p className="text-xs text-green-500 mt-0.5">
                  {totals.collectionPct}% collected
                </p>
              </div>
              <TrendingUp className="text-green-400 mt-1" size={20} />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-red-50 border-0">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-red-600 uppercase tracking-wide">
                  Outstanding
                </p>
                <p className="text-2xl font-bold text-red-700 mt-1">
                  {formatNaira(totals.outstanding)}
                </p>
                <p className="text-xs text-red-500 mt-0.5">
                  {100 - totals.collectionPct}% unpaid
                </p>
              </div>
              <TrendingDown className="text-red-400 mt-1" size={20} />
            </div>
          </CardContent>
        </Card>
        <Card
          className={`border-0 ${totals.collectionPct >= 75 ? "bg-emerald-50" : totals.collectionPct >= 50 ? "bg-amber-50" : "bg-orange-50"}`}
        >
          <CardContent className="p-4">
            <p
              className={`text-xs font-semibold uppercase tracking-wide ${totals.collectionPct >= 75 ? "text-emerald-600" : totals.collectionPct >= 50 ? "text-amber-600" : "text-orange-600"}`}
            >
              Collection Rate
            </p>
            <p
              className={`text-3xl font-bold mt-1 ${totals.collectionPct >= 75 ? "text-emerald-700" : totals.collectionPct >= 50 ? "text-amber-700" : "text-orange-700"}`}
            >
              {totals.collectionPct}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Donut Summary */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Paid vs Outstanding</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              {/* Pseudo-donut */}
              <div
                className="relative flex-shrink-0"
                style={{ width: 120, height: 120 }}
              >
                <svg
                  viewBox="0 0 36 36"
                  className="w-full h-full -rotate-90"
                  aria-label={`Collection rate: ${totals.collectionPct}%`}
                >
                  <title>Collection rate: {totals.collectionPct}%</title>
                  <circle
                    cx="18"
                    cy="18"
                    r="15.915"
                    fill="none"
                    stroke="#f1f5f9"
                    strokeWidth="4"
                  />
                  <circle
                    cx="18"
                    cy="18"
                    r="15.915"
                    fill="none"
                    stroke="#22c55e"
                    strokeWidth="4"
                    strokeDasharray={`${totals.collectionPct} ${100 - totals.collectionPct}`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-bold text-slate-700">
                    {totals.collectionPct}%
                  </span>
                  <span className="text-[10px] text-slate-400">paid</span>
                </div>
              </div>
              <div className="space-y-3 flex-1">
                <div>
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />{" "}
                      Paid
                    </span>
                    <span className="font-semibold text-green-600">
                      {formatNaira(totals.totalCollected)}
                    </span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full">
                    <div
                      className="h-2 bg-green-500 rounded-full"
                      style={{ width: `${totals.collectionPct}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-red-400 inline-block" />{" "}
                      Outstanding
                    </span>
                    <span className="font-semibold text-red-600">
                      {formatNaira(totals.outstanding)}
                    </span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full">
                    <div
                      className="h-2 bg-red-400 rounded-full"
                      style={{ width: `${100 - totals.collectionPct}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bar Chart by Department */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Collection Rate by Department
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {deptRows
                .filter((d) => d.totalExpected > 0)
                .map((row) => (
                  <div key={row.department}>
                    <div className="flex justify-between text-xs text-slate-600 mb-1">
                      <span className="font-medium truncate max-w-[160px]">
                        {row.department}
                      </span>
                      <span
                        className={`font-semibold ${row.collectionPct >= 75 ? "text-green-600" : row.collectionPct >= 50 ? "text-amber-600" : "text-red-600"}`}
                      >
                        {row.collectionPct}%
                      </span>
                    </div>
                    <div className="h-2.5 bg-slate-100 rounded-full">
                      <div
                        className={`h-2.5 rounded-full transition-all ${row.collectionPct >= 75 ? "bg-green-500" : row.collectionPct >= 50 ? "bg-amber-400" : "bg-red-400"}`}
                        style={{ width: `${row.collectionPct}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {formatNaira(row.totalPaid)} of{" "}
                      {formatNaira(row.totalExpected)}
                    </p>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reconciliation Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Department Reconciliation Table
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b">
                <tr>
                  {[
                    "Department",
                    "Students",
                    "Total Expected",
                    "Total Paid",
                    "Balance",
                    "Collection %",
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
                {deptRows.map((row, i) => (
                  <tr
                    key={row.department}
                    className="border-b last:border-0 hover:bg-slate-50"
                    data-ocid={`reconciliation.row.${i + 1}`}
                  >
                    <td className="px-4 py-3 font-medium text-slate-800">
                      {row.department}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {row.totalStudents}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {formatNaira(row.totalExpected)}
                    </td>
                    <td className="px-4 py-3 text-right text-green-600 font-medium">
                      {formatNaira(row.totalPaid)}
                    </td>
                    <td className="px-4 py-3 text-right text-red-600">
                      {formatNaira(row.balance)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-slate-100 rounded-full">
                          <div
                            className={`h-2 rounded-full ${row.collectionPct >= 75 ? "bg-green-500" : row.collectionPct >= 50 ? "bg-amber-400" : "bg-red-400"}`}
                            style={{ width: `${row.collectionPct}%` }}
                          />
                        </div>
                        <span
                          className={`text-xs font-semibold w-8 text-right ${row.collectionPct >= 75 ? "text-green-600" : row.collectionPct >= 50 ? "text-amber-600" : "text-red-600"}`}
                        >
                          {row.collectionPct}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-800 text-white font-bold">
                  <td className="px-4 py-3">Grand Total</td>
                  <td className="px-4 py-3 text-center">{students.length}</td>
                  <td className="px-4 py-3 text-right">
                    {formatNaira(totals.totalInvoiced)}
                  </td>
                  <td className="px-4 py-3 text-right text-green-300">
                    {formatNaira(totals.totalCollected)}
                  </td>
                  <td className="px-4 py-3 text-right text-red-300">
                    {formatNaira(totals.outstanding)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {totals.collectionPct}%
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
