import {
  ChevronDown,
  ChevronUp,
  FileText,
  Play,
  PlusCircle,
  Wallet,
} from "lucide-react";
import { useEffect, useState } from "react";
import { StatCard } from "../../components/StatCard";
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
import { Separator } from "../../components/ui/separator";
import {
  type PayrollRecord,
  getLocalPayroll,
  getLocalStaff,
  saveLocalPayroll,
} from "../../utils/sampleData";

function formatNaira(n: number) {
  return `₦${n.toLocaleString()}`;
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// CONTISS Salary Grade Reference
const CONTISS_GRADES: { level: number; gross: number }[] = [
  { level: 1, gross: 45000 },
  { level: 2, gross: 60000 },
  { level: 3, gross: 75000 },
  { level: 4, gross: 92500 },
  { level: 5, gross: 110000 },
  { level: 6, gross: 135000 },
  { level: 7, gross: 160000 },
  { level: 8, gross: 210000 },
  { level: 9, gross: 247500 },
  { level: 10, gross: 285000 },
  { level: 11, gross: 332500 },
  { level: 12, gross: 380000 },
  { level: 13, gross: 450000 },
  { level: 14, gross: 520000 },
  { level: 15, gross: 650000 },
];

function computeBreakdown(gross: number) {
  const basic = Math.round(gross * 0.6);
  const housing = Math.round(basic * 0.2);
  const transport = Math.round(basic * 0.15);
  const medical = Math.round(basic * 0.05);
  const pension = Math.round(basic * 0.08);
  const tax = Math.round(gross * 0.15);
  const nhf = Math.round(basic * 0.025);
  const union = 2000;
  const totalDeductions = pension + tax + nhf + union;
  const netPay = gross - totalDeductions;
  return {
    basic,
    housing,
    transport,
    medical,
    pension,
    tax,
    nhf,
    union,
    totalDeductions,
    netPay,
  };
}

function blank(): Omit<PayrollRecord, "id"> {
  return {
    staffId: "",
    staffName: "",
    month: "January",
    year: new Date().getFullYear(),
    gross: 0,
    deductions: 0,
    net: 0,
  };
}

export function Payroll() {
  const [records, setRecords] = useState<PayrollRecord[]>([]);
  const [staff, setStaff] = useState(getLocalStaff());
  const [dialog, setDialog] = useState(false);
  const [form, setForm] = useState(blank());
  const [gradeLevel, setGradeLevel] = useState<number | "">("");

  // Salary grade reference
  const [gradeRefOpen, setGradeRefOpen] = useState(false);

  // Payslip dialog
  const [payslipDialog, setPayslipDialog] = useState(false);
  const [payslipRecord, setPayslipRecord] = useState<PayrollRecord | null>(
    null,
  );

  // Batch payroll
  const [batchDialog, setBatchDialog] = useState(false);
  const [batchMonth, setBatchMonth] = useState(MONTHS[new Date().getMonth()]);
  const [batchYear, setBatchYear] = useState(new Date().getFullYear());

  useEffect(() => {
    setRecords(getLocalPayroll());
    setStaff(getLocalStaff());
  }, []);

  const handleStaffChange = (staffId: string) => {
    const found = staff.find((s) => s.staffId === staffId);
    setForm((f) => ({ ...f, staffId, staffName: found?.name ?? "" }));
  };

  const handleGradeLevelChange = (level: string) => {
    const lvl = Number(level);
    setGradeLevel(lvl);
    const entry = CONTISS_GRADES.find((g) => g.level === lvl);
    if (entry) {
      const { totalDeductions, netPay } = computeBreakdown(entry.gross);
      setForm((f) => ({
        ...f,
        gross: entry.gross,
        deductions: totalDeductions,
        net: netPay,
      }));
    }
  };

  const save = () => {
    const bd = computeBreakdown(form.gross);
    const entry: PayrollRecord = {
      id: `PAY${Date.now()}`,
      ...form,
      deductions: bd.totalDeductions,
      net: bd.netPay,
    };
    const updated = [entry, ...records];
    saveLocalPayroll(updated);
    setRecords(updated);
    setDialog(false);
    setForm(blank());
    setGradeLevel("");
  };

  // Batch payroll
  const batchEligibleCount = staff.filter(
    (s) =>
      !records.some(
        (r) =>
          r.staffId === s.staffId &&
          r.month === batchMonth &&
          r.year === batchYear,
      ),
  ).length;

  const runBatchPayroll = () => {
    const defaultGross = 160000; // GL 7
    const newEntries: PayrollRecord[] = staff
      .filter(
        (s) =>
          !records.some(
            (r) =>
              r.staffId === s.staffId &&
              r.month === batchMonth &&
              r.year === batchYear,
          ),
      )
      .map((s) => {
        const { totalDeductions, netPay } = computeBreakdown(defaultGross);
        return {
          id: `PAY-BATCH-${Date.now()}-${s.staffId}`,
          staffId: s.staffId,
          staffName: s.name,
          month: batchMonth,
          year: batchYear,
          gross: defaultGross,
          deductions: totalDeductions,
          net: netPay,
        };
      });
    const updated = [...records, ...newEntries];
    saveLocalPayroll(updated);
    setRecords(updated);
    setBatchDialog(false);
  };

  const totalGross = records.reduce((s, r) => s + r.gross, 0);
  const totalDeductions = records.reduce((s, r) => s + r.deductions, 0);
  const totalNet = records.reduce((s, r) => s + r.net, 0);

  // Derived breakdown for dialog
  const dialogBD = computeBreakdown(form.gross);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Staff Payroll</h1>
          <p className="text-slate-500 text-sm">
            {records.length} payroll records
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setBatchDialog(true)}
            data-ocid="payroll.secondary_button"
          >
            <Play size={15} className="mr-2" /> Run Month Payroll
          </Button>
          <Button
            onClick={() => setDialog(true)}
            className="bg-blue-600 hover:bg-blue-700"
            data-ocid="payroll.primary_button"
          >
            <PlusCircle size={16} className="mr-2" /> Add Entry
          </Button>
        </div>
      </div>

      {/* CONTISS Salary Grade Reference (collapsible) */}
      <Card>
        <CardHeader
          className="py-3 px-4 cursor-pointer select-none"
          onClick={() => setGradeRefOpen((o) => !o)}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold text-slate-700">
              CONTISS Salary Grade Reference
            </CardTitle>
            {gradeRefOpen ? (
              <ChevronUp size={16} className="text-slate-400" />
            ) : (
              <ChevronDown size={16} className="text-slate-400" />
            )}
          </div>
        </CardHeader>
        {gradeRefOpen && (
          <CardContent className="pt-0 pb-3 px-4">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b">
                    <th className="py-1.5 text-left text-slate-500 font-semibold uppercase tracking-wide w-20">
                      Grade Level
                    </th>
                    <th className="py-1.5 text-left text-slate-500 font-semibold uppercase tracking-wide">
                      Indicative Monthly Gross
                    </th>
                    <th className="py-1.5 text-left text-slate-500 font-semibold uppercase tracking-wide">
                      Basic (60%)
                    </th>
                    <th className="py-1.5 text-left text-slate-500 font-semibold uppercase tracking-wide">
                      Total Deductions
                    </th>
                    <th className="py-1.5 text-left text-slate-500 font-semibold uppercase tracking-wide">
                      Estimated Net
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {CONTISS_GRADES.map((g) => {
                    const bd = computeBreakdown(g.gross);
                    return (
                      <tr
                        key={g.level}
                        className="border-b last:border-0 hover:bg-slate-50"
                      >
                        <td className="py-1.5 font-bold text-slate-700">
                          GL {g.level}
                        </td>
                        <td className="py-1.5 font-semibold text-slate-800">
                          {formatNaira(g.gross)}
                        </td>
                        <td className="py-1.5 text-slate-600">
                          {formatNaira(bd.basic)}
                        </td>
                        <td className="py-1.5 text-red-600">
                          {formatNaira(bd.totalDeductions)}
                        </td>
                        <td className="py-1.5 text-green-600 font-semibold">
                          {formatNaira(bd.netPay)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        )}
      </Card>

      <div className="grid grid-cols-3 gap-4">
        <StatCard
          title="Total Gross"
          value={formatNaira(totalGross)}
          icon={<Wallet size={22} />}
          color="blue"
        />
        <StatCard
          title="Total Deductions"
          value={formatNaira(totalDeductions)}
          icon={<Wallet size={22} />}
          color="amber"
        />
        <StatCard
          title="Total Net Pay"
          value={formatNaira(totalNet)}
          icon={<Wallet size={22} />}
          color="green"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b">
                <tr>
                  {[
                    "Staff Name",
                    "Staff ID",
                    "Month",
                    "Year",
                    "Gross (₦)",
                    "Deductions (₦)",
                    "Net Pay (₦)",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {records.map((r, idx) => (
                  <tr
                    key={r.id}
                    className="border-b last:border-0 hover:bg-slate-50"
                    data-ocid={`payroll.item.${idx + 1}`}
                  >
                    <td className="px-4 py-3 text-sm font-medium">
                      {r.staffName}
                    </td>
                    <td className="px-4 py-3 text-sm font-mono text-slate-500">
                      {r.staffId}
                    </td>
                    <td className="px-4 py-3 text-sm">{r.month}</td>
                    <td className="px-4 py-3 text-sm">{r.year}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">
                      {formatNaira(r.gross)}
                    </td>
                    <td className="px-4 py-3 text-sm text-red-600">
                      {formatNaira(r.deductions)}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-green-600">
                      {formatNaira(r.net)}
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 px-2 text-xs"
                        onClick={() => {
                          setPayslipRecord(r);
                          setPayslipDialog(true);
                        }}
                        data-ocid={`payroll.edit_button.${idx + 1}`}
                      >
                        <FileText size={12} className="mr-1" /> Payslip
                      </Button>
                    </td>
                  </tr>
                ))}
                {records.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-8 text-center text-slate-400"
                      data-ocid="payroll.empty_state"
                    >
                      No payroll records yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add Entry Dialog */}
      <Dialog open={dialog} onOpenChange={setDialog}>
        <DialogContent className="max-w-lg" data-ocid="payroll.dialog">
          <DialogHeader>
            <DialogTitle>Add Payroll Entry</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Label>Staff Member</Label>
                <Select value={form.staffId} onValueChange={handleStaffChange}>
                  <SelectTrigger className="mt-1" data-ocid="payroll.select">
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
                <Label>Month</Label>
                <Select
                  value={form.month}
                  onValueChange={(v) => setForm((f) => ({ ...f, month: v }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MONTHS.map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Year</Label>
                <Input
                  className="mt-1"
                  type="number"
                  value={form.year}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, year: +e.target.value }))
                  }
                />
              </div>
              <div>
                <Label>Grade Level (CONTISS)</Label>
                <Select
                  value={String(gradeLevel)}
                  onValueChange={handleGradeLevelChange}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select grade" />
                  </SelectTrigger>
                  <SelectContent>
                    {CONTISS_GRADES.map((g) => (
                      <SelectItem key={g.level} value={String(g.level)}>
                        GL {g.level} — {formatNaira(g.gross)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Gross Salary (₦)</Label>
                <Input
                  className="mt-1"
                  type="number"
                  value={form.gross}
                  onChange={(e) => {
                    setGradeLevel("");
                    const gross = +e.target.value;
                    const { totalDeductions, netPay } = computeBreakdown(gross);
                    setForm((f) => ({
                      ...f,
                      gross,
                      deductions: totalDeductions,
                      net: netPay,
                    }));
                  }}
                  data-ocid="payroll.input"
                />
              </div>
            </div>

            {form.gross > 0 && (
              <>
                <Separator />
                <div className="rounded-lg bg-slate-50 p-3 space-y-2">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                    Computed Salary Breakdown
                  </p>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs">
                    <div>
                      <p className="text-slate-500 font-medium mb-1">
                        Earnings
                      </p>
                      <div className="space-y-0.5">
                        <div className="flex justify-between">
                          <span className="text-slate-600">Basic (60%)</span>
                          <span className="font-medium">
                            {formatNaira(dialogBD.basic)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">
                            Housing (20% basic)
                          </span>
                          <span className="font-medium">
                            {formatNaira(dialogBD.housing)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">
                            Transport (15% basic)
                          </span>
                          <span className="font-medium">
                            {formatNaira(dialogBD.transport)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">
                            Medical (5% basic)
                          </span>
                          <span className="font-medium">
                            {formatNaira(dialogBD.medical)}
                          </span>
                        </div>
                        <div className="flex justify-between border-t pt-0.5 mt-0.5">
                          <span className="font-bold text-slate-700">
                            Gross Total
                          </span>
                          <span className="font-bold text-blue-700">
                            {formatNaira(form.gross)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="text-slate-500 font-medium mb-1">
                        Deductions
                      </p>
                      <div className="space-y-0.5">
                        <div className="flex justify-between">
                          <span className="text-slate-600">
                            Pension (8% basic)
                          </span>
                          <span className="font-medium text-red-600">
                            {formatNaira(dialogBD.pension)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">
                            Tax/PAYE (15% gross)
                          </span>
                          <span className="font-medium text-red-600">
                            {formatNaira(dialogBD.tax)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">
                            NHF (2.5% basic)
                          </span>
                          <span className="font-medium text-red-600">
                            {formatNaira(dialogBD.nhf)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">
                            Union Dues (flat)
                          </span>
                          <span className="font-medium text-red-600">
                            {formatNaira(dialogBD.union)}
                          </span>
                        </div>
                        <div className="flex justify-between border-t pt-0.5 mt-0.5">
                          <span className="font-bold text-slate-700">
                            Total Deductions
                          </span>
                          <span className="font-bold text-red-600">
                            {formatNaira(dialogBD.totalDeductions)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center rounded bg-green-50 border border-green-200 px-3 py-2 mt-2">
                    <span className="font-bold text-slate-800">Net Pay</span>
                    <span className="text-xl font-black text-green-700">
                      {formatNaira(dialogBD.netPay)}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDialog(false);
                setGradeLevel("");
              }}
              data-ocid="payroll.cancel_button"
            >
              Cancel
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={save}
              disabled={!form.staffId || form.gross === 0}
              data-ocid="payroll.submit_button"
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payslip Dialog */}
      {payslipRecord && (
        <Dialog open={payslipDialog} onOpenChange={setPayslipDialog}>
          <DialogContent className="max-w-xl" data-ocid="payroll.dialog">
            <DialogHeader>
              <DialogTitle>Payslip — {payslipRecord.staffName}</DialogTitle>
            </DialogHeader>
            <div
              className="border rounded-lg p-6 bg-white text-sm space-y-4 print:border-0"
              id="payslip-print-area"
            >
              {/* Institution header */}
              <div className="text-center border-b pb-4">
                <h2 className="font-bold text-base text-slate-800 uppercase">
                  Federal University of Technology, Minna
                </h2>
                <p className="text-slate-500 text-xs">
                  Bursary &amp; Finance Division
                </p>
                <p className="font-bold text-slate-700 mt-2 tracking-widest uppercase text-xs">
                  PAYSLIP — CONFIDENTIAL
                </p>
              </div>
              {/* Staff details */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-500">Staff Name:</span>{" "}
                  <span className="font-semibold">
                    {payslipRecord.staffName}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">Staff ID:</span>{" "}
                  <span className="font-semibold">{payslipRecord.staffId}</span>
                </div>
                <div>
                  <span className="text-slate-500">Month/Year:</span>{" "}
                  <span className="font-semibold">
                    {payslipRecord.month} {payslipRecord.year}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">Pay Date:</span>{" "}
                  <span className="font-semibold">
                    {new Date().toLocaleDateString("en-GB")}
                  </span>
                </div>
              </div>
              <Separator />
              {/* Two-column layout */}
              {(() => {
                const bd = computeBreakdown(payslipRecord.gross);
                return (
                  <div className="grid grid-cols-2 gap-6 text-xs">
                    <div>
                      <p className="font-bold text-slate-700 mb-2 uppercase tracking-wide">
                        Earnings
                      </p>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span>Basic Salary</span>
                          <span className="font-medium">
                            {formatNaira(bd.basic)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Housing Allowance</span>
                          <span className="font-medium">
                            {formatNaira(bd.housing)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Transport Allowance</span>
                          <span className="font-medium">
                            {formatNaira(bd.transport)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Medical Allowance</span>
                          <span className="font-medium">
                            {formatNaira(bd.medical)}
                          </span>
                        </div>
                        <div className="flex justify-between border-t pt-1 mt-1 font-bold">
                          <span>Gross Total</span>
                          <span className="text-blue-700">
                            {formatNaira(payslipRecord.gross)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="font-bold text-slate-700 mb-2 uppercase tracking-wide">
                        Deductions
                      </p>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span>Pension (8%)</span>
                          <span className="font-medium text-red-600">
                            {formatNaira(bd.pension)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>PAYE Tax (15%)</span>
                          <span className="font-medium text-red-600">
                            {formatNaira(bd.tax)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>NHF (2.5%)</span>
                          <span className="font-medium text-red-600">
                            {formatNaira(bd.nhf)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Union Dues</span>
                          <span className="font-medium text-red-600">
                            {formatNaira(bd.union)}
                          </span>
                        </div>
                        <div className="flex justify-between border-t pt-1 mt-1 font-bold">
                          <span>Total Deductions</span>
                          <span className="text-red-600">
                            {formatNaira(bd.totalDeductions)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
              <Separator />
              <div className="flex justify-between items-center rounded bg-green-50 border border-green-200 px-4 py-3">
                <span className="font-bold text-slate-800 text-sm">
                  NET PAY
                </span>
                <span className="text-2xl font-black text-green-700">
                  {formatNaira(computeBreakdown(payslipRecord.gross).netPay)}
                </span>
              </div>
              <div className="pt-4 border-t mt-4">
                <div className="text-xs text-slate-500">
                  <p className="font-semibold text-slate-700">
                    Authorized Signatory
                  </p>
                  <p className="mt-4 border-t border-dashed border-slate-300 pt-1 w-48">
                    Bursary Officer
                  </p>
                  <p className="mt-0.5">
                    Federal University of Technology, Minna
                  </p>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setPayslipDialog(false)}
                data-ocid="payroll.cancel_button"
              >
                Close
              </Button>
              <Button
                onClick={() => window.print()}
                data-ocid="payroll.primary_button"
              >
                Print Payslip
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Batch Payroll Dialog */}
      <Dialog open={batchDialog} onOpenChange={setBatchDialog}>
        <DialogContent data-ocid="payroll.dialog">
          <DialogHeader>
            <DialogTitle>Run Month Payroll</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-slate-500">
              Generates payroll entries for all staff who don&apos;t already
              have one for the selected month/year. Default gross will be GL 7 —{" "}
              {formatNaira(160000)}.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Month</Label>
                <Select value={batchMonth} onValueChange={setBatchMonth}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MONTHS.map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Year</Label>
                <Input
                  className="mt-1"
                  type="number"
                  value={batchYear}
                  onChange={(e) => setBatchYear(+e.target.value)}
                />
              </div>
            </div>
            <div className="rounded-lg bg-blue-50 border border-blue-200 px-4 py-3">
              <p className="text-sm font-semibold text-blue-700">
                {batchEligibleCount} staff record
                {batchEligibleCount !== 1 ? "s" : ""} will be generated
              </p>
              <p className="text-xs text-blue-600 mt-0.5">
                {staff.length - batchEligibleCount} already have entries for{" "}
                {batchMonth} {batchYear}.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setBatchDialog(false)}
              data-ocid="payroll.cancel_button"
            >
              Cancel
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={runBatchPayroll}
              disabled={batchEligibleCount === 0}
              data-ocid="payroll.confirm_button"
            >
              Generate {batchEligibleCount} Record
              {batchEligibleCount !== 1 ? "s" : ""}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
