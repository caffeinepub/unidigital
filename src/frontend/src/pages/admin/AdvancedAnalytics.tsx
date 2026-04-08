import {
  BarChart3,
  Download,
  Filter,
  GraduationCap,
  MapPin,
  Printer,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
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
import { DEPARTMENTS, getAllJambStudents } from "../../utils/jambData";
import {
  getLocalAcademicStatuses,
  getLocalInvoices,
  getLocalPayments,
  getLocalResults,
  getLocalStudents,
} from "../../utils/sampleData";

const BAR_COLORS = [
  "bg-blue-500",
  "bg-emerald-500",
  "bg-violet-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-teal-500",
  "bg-cyan-500",
  "bg-orange-500",
];

function DonutChart({
  pct,
  color,
  label,
}: { pct: number; color: string; label: string }) {
  const circ = 2 * Math.PI * 15.9;
  const filled = (pct / 100) * circ;
  return (
    <div className="relative w-28 h-28 flex-shrink-0">
      <svg
        viewBox="0 0 36 36"
        className="w-full h-full -rotate-90"
        role="img"
        aria-label={`${label} donut chart`}
      >
        <circle
          cx="18"
          cy="18"
          r="15.9"
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="3"
        />
        <circle
          cx="18"
          cy="18"
          r="15.9"
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeDasharray={`${filled} ${circ - filled}`}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-bold" style={{ color }}>
          {pct}%
        </span>
        <span className="text-[10px] text-slate-500 text-center px-1">
          {label}
        </span>
      </div>
    </div>
  );
}

function BarRow({
  label,
  value,
  max,
  color,
  suffix = "",
}: {
  label: string;
  value: number;
  max: number;
  color: string;
  suffix?: string;
}) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span
        className="text-xs text-slate-600 w-44 flex-shrink-0 truncate"
        title={label}
      >
        {label}
      </span>
      <div className="flex-1 bg-slate-100 rounded-full h-5 overflow-hidden">
        <div
          className={`h-full ${color} rounded-full flex items-center justify-end pr-2 min-w-[2rem]`}
          style={{ width: `${Math.max(pct, 4)}%` }}
        >
          <span className="text-[10px] text-white font-bold">
            {value}
            {suffix}
          </span>
        </div>
      </div>
    </div>
  );
}

export function AdvancedAnalytics() {
  const [deptFilter, setDeptFilter] = useState("all");
  const [sessionFilter, setSessionFilter] = useState("all");

  const students = getLocalStudents();
  const jambStudents = getAllJambStudents();
  const results = getLocalResults();
  const invoices = getLocalInvoices();
  const payments = getLocalPayments();
  const academicStatuses = getLocalAcademicStatuses();

  // Enrollment analytics
  const enrollment = useMemo(() => {
    const allStudents = [
      ...students,
      ...jambStudents.filter(
        (j) => !students.some((s) => s.matricNumber === j.matricNumber),
      ),
    ];
    const filtered =
      deptFilter === "all"
        ? allStudents
        : allStudents.filter(
            (s) =>
              s.department?.toLowerCase().includes(deptFilter.toLowerCase()) ||
              (s as { subCombination?: string }).subCombination === deptFilter,
          );

    const byDept: Record<string, number> = {};
    for (const s of filtered) {
      const dept = s.department || "Unknown";
      byDept[dept] = (byDept[dept] || 0) + 1;
    }

    const byLevel: Record<string, number> = {};
    for (const s of filtered) {
      const lvl = s.level || "Unknown";
      byLevel[lvl] = (byLevel[lvl] || 0) + 1;
    }

    const genderMap: Record<string, number> = {
      Male: 0,
      Female: 0,
      Unknown: 0,
    };
    for (const j of jambStudents) {
      if (j.sex === "M") genderMap.Male++;
      else if (j.sex === "F") genderMap.Female++;
      else genderMap.Unknown++;
    }
    for (const _s of students) {
      genderMap.Unknown++;
    }

    const stateMap: Record<string, number> = {};
    for (const j of jambStudents) {
      stateMap[j.state] = (stateMap[j.state] || 0) + 1;
    }
    const topStates = Object.entries(stateMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    return { total: filtered.length, byDept, byLevel, genderMap, topStates };
  }, [students, jambStudents, deptFilter]);

  // Academic performance
  const academic = useMemo(() => {
    const allStudents = [
      ...students,
      ...jambStudents.filter(
        (j) => !students.some((s) => s.matricNumber === j.matricNumber),
      ),
    ];
    const totalEnrolled = allStudents.length;

    const withdrawn = academicStatuses.filter(
      (s) => s.status === "withdrawn" || s.status === "deferred",
    ).length;
    const probation = academicStatuses.filter(
      (s) => s.status === "probation",
    ).length;
    const active = academicStatuses.filter((s) => s.status === "active").length;

    // GPA distribution from results
    const studentGpas: Record<string, number[]> = {};
    for (const r of results) {
      if (!studentGpas[r.studentMatric]) studentGpas[r.studentMatric] = [];
      studentGpas[r.studentMatric].push(r.gradePoint);
    }
    const gpaDist = {
      firstClass: 0,
      secondUpper: 0,
      secondLower: 0,
      third: 0,
      pass: 0,
      fail: 0,
    };
    for (const gps of Object.values(studentGpas)) {
      const avg = gps.reduce((a, b) => a + b, 0) / gps.length;
      if (avg >= 4.5) gpaDist.firstClass++;
      else if (avg >= 3.5) gpaDist.secondUpper++;
      else if (avg >= 2.5) gpaDist.secondLower++;
      else if (avg >= 1.5) gpaDist.third++;
      else if (avg >= 1.0) gpaDist.pass++;
      else gpaDist.fail++;
    }

    const passRate =
      results.length > 0
        ? Math.round(
            (results.filter((r) => r.grade !== "F").length / results.length) *
              100,
          )
        : 0;

    return { totalEnrolled, withdrawn, probation, active, gpaDist, passRate };
  }, [students, jambStudents, results, academicStatuses]);

  // Financial performance
  const finance = useMemo(() => {
    const filtered =
      sessionFilter === "all"
        ? invoices
        : invoices.filter((i) => i.session === sessionFilter);
    const totalExpected = filtered.reduce((s, i) => s + i.amount, 0);
    const totalCollected = filtered.reduce((s, i) => s + i.paid, 0);
    const outstanding = totalExpected - totalCollected;
    const rate =
      totalExpected > 0
        ? Math.round((totalCollected / totalExpected) * 100)
        : 0;

    const byMonth: Record<string, number> = {};
    for (const p of payments) {
      const month = p.paymentDate?.substring(0, 7) || "Unknown";
      byMonth[month] = (byMonth[month] || 0) + p.amountPaid;
    }
    const monthlyData = Object.entries(byMonth)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-6);

    const fullyPaid = filtered.filter((i) => i.paid >= i.amount).length;
    const partial = filtered.filter(
      (i) => i.paid > 0 && i.paid < i.amount,
    ).length;
    const unpaid = filtered.filter((i) => i.paid === 0).length;

    return {
      totalExpected,
      totalCollected,
      outstanding,
      rate,
      monthlyData,
      fullyPaid,
      partial,
      unpaid,
    };
  }, [invoices, payments, sessionFilter]);

  // Result analytics
  const resultAnalytics = useMemo(() => {
    const deptPassRates: { dept: string; passRate: number; total: number }[] =
      [];
    const allDepts = [...new Set(students.map((s) => s.department))];
    for (const dept of allDepts) {
      const matrics = students
        .filter((s) => s.department === dept)
        .map((s) => s.matricNumber);
      const deptRes = results.filter((r) => matrics.includes(r.studentMatric));
      const pass = deptRes.filter((r) => r.grade !== "F").length;
      const rate =
        deptRes.length > 0 ? Math.round((pass / deptRes.length) * 100) : 75;
      deptPassRates.push({ dept, passRate: rate, total: deptRes.length });
    }

    const gradeDist: Record<string, number> = {
      A: 0,
      B: 0,
      C: 0,
      D: 0,
      E: 0,
      F: 0,
    };
    for (const r of results) {
      if (r.grade in gradeDist) gradeDist[r.grade]++;
    }

    return {
      deptPassRates: deptPassRates.sort((a, b) => b.passRate - a.passRate),
      gradeDist,
    };
  }, [students, results]);

  const sessions = ["all", "2023/2024", "2024/2025", "2022/2023"];
  const deptOptions = [
    { code: "all", fullName: "All Departments" },
    ...DEPARTMENTS,
  ];

  const handlePrint = () => window.print();

  const genderTotal = Object.values(enrollment.genderMap).reduce(
    (a, b) => a + b,
    0,
  );
  const malePct =
    genderTotal > 0
      ? Math.round((enrollment.genderMap.Male / genderTotal) * 100)
      : 0;
  const femalePct =
    genderTotal > 0
      ? Math.round((enrollment.genderMap.Female / genderTotal) * 100)
      : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Advanced Analytics
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Enrollment, gender, financial, academic &amp; result analytics
          </p>
        </div>
        <div className="flex gap-2 flex-wrap items-center">
          <Select value={deptFilter} onValueChange={setDeptFilter}>
            <SelectTrigger
              className="w-44 h-8 text-xs"
              data-ocid="analytics.filter.dept"
            >
              <Filter size={12} className="mr-1" />
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              {deptOptions.map((d) => (
                <SelectItem key={d.code} value={d.code}>
                  {d.fullName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sessionFilter} onValueChange={setSessionFilter}>
            <SelectTrigger
              className="w-36 h-8 text-xs"
              data-ocid="analytics.filter.session"
            >
              <SelectValue placeholder="Session" />
            </SelectTrigger>
            <SelectContent>
              {sessions.map((s) => (
                <SelectItem key={s} value={s}>
                  {s === "all" ? "All Sessions" : s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            size="sm"
            variant="outline"
            onClick={handlePrint}
            className="h-8 text-xs gap-1"
            data-ocid="analytics.print"
          >
            <Printer size={12} /> Print Report
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs gap-1"
            data-ocid="analytics.export"
            onClick={() => {
              const csv = [
                "Section,Metric,Value",
                `Enrollment,Total Students,${enrollment.total}`,
                `Enrollment,Male %,${malePct}%`,
                `Enrollment,Female %,${femalePct}%`,
                `Academic,Pass Rate,${academic.passRate}%`,
                `Academic,On Probation,${academic.probation}`,
                `Finance,Collection Rate,${finance.rate}%`,
                `Finance,Total Collected,${finance.totalCollected}`,
                `Finance,Outstanding,${finance.outstanding}`,
              ].join("\n");
              const a = document.createElement("a");
              a.href = `data:text/csv,${encodeURIComponent(csv)}`;
              a.download = "analytics-report.csv";
              a.click();
            }}
          >
            <Download size={12} /> Export CSV
          </Button>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Students",
            value: enrollment.total,
            icon: <Users size={20} />,
            color: "text-blue-600",
            bg: "bg-blue-50",
          },
          {
            label: "Pass Rate",
            value: `${academic.passRate}%`,
            icon: <GraduationCap size={20} />,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
          },
          {
            label: "Fee Collection",
            value: `${finance.rate}%`,
            icon: <Wallet size={20} />,
            color: "text-violet-600",
            bg: "bg-violet-50",
          },
          {
            label: "On Probation",
            value: academic.probation,
            icon: <TrendingUp size={20} />,
            color: "text-amber-600",
            bg: "bg-amber-50",
          },
        ].map((k, i) => (
          <Card key={k.label} data-ocid={`adv-analytics.kpi.${i + 1}`}>
            <CardContent className="p-4">
              <div
                className={`w-10 h-10 rounded-lg ${k.bg} flex items-center justify-center mb-3 ${k.color}`}
              >
                {k.icon}
              </div>
              <p className={`text-2xl font-bold ${k.color}`}>{k.value}</p>
              <p className="text-sm text-slate-500 mt-0.5">{k.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Enrollment by Department */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 size={16} className="text-blue-500" /> Students by
              Department
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(enrollment.byDept)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 12)
                .map(([dept, count], i) => (
                  <BarRow
                    key={dept}
                    label={dept}
                    value={count}
                    max={Math.max(...Object.values(enrollment.byDept))}
                    color={BAR_COLORS[i % BAR_COLORS.length]}
                  />
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Enrollment by Level */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 size={16} className="text-violet-500" /> Students by
              Level
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(enrollment.byLevel)
                .sort((a, b) => a[0].localeCompare(b[0]))
                .map(([level, count], i) => (
                  <BarRow
                    key={level}
                    label={level}
                    value={count}
                    max={Math.max(...Object.values(enrollment.byLevel))}
                    color={BAR_COLORS[i % BAR_COLORS.length]}
                  />
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gender + State Distribution */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users size={16} className="text-rose-500" /> Gender Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div className="flex gap-4">
                <DonutChart pct={malePct} color="#3b82f6" label="Male" />
                <DonutChart pct={femalePct} color="#ec4899" label="Female" />
              </div>
              <div className="space-y-3 flex-1">
                {[
                  {
                    label: "Male",
                    count: enrollment.genderMap.Male,
                    color: "bg-blue-500",
                    pct: malePct,
                  },
                  {
                    label: "Female",
                    count: enrollment.genderMap.Female,
                    color: "bg-pink-500",
                    pct: femalePct,
                  },
                ].map((g) => (
                  <div
                    key={g.label}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${g.color}`} />
                      <span className="text-sm">{g.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold">{g.count}</span>
                      <Badge variant="secondary" className="text-xs">
                        {g.pct}%
                      </Badge>
                    </div>
                  </div>
                ))}
                <div className="pt-2 border-t text-sm text-slate-500">
                  Total:{" "}
                  <span className="font-semibold text-slate-700">
                    {genderTotal}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin size={16} className="text-emerald-500" /> Top 10 States of
              Origin
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {enrollment.topStates.map(([state, count], i) => (
                <BarRow
                  key={state}
                  label={state}
                  value={count}
                  max={enrollment.topStates[0]?.[1] ?? 1}
                  color={BAR_COLORS[i % BAR_COLORS.length]}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Academic Performance */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <GraduationCap size={16} className="text-emerald-500" /> GPA
              Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                {
                  label: "First Class (4.50–5.00)",
                  value: academic.gpaDist.firstClass,
                  color: "bg-emerald-500",
                },
                {
                  label: "2nd Class Upper (3.50–4.49)",
                  value: academic.gpaDist.secondUpper,
                  color: "bg-blue-500",
                },
                {
                  label: "2nd Class Lower (2.50–3.49)",
                  value: academic.gpaDist.secondLower,
                  color: "bg-sky-500",
                },
                {
                  label: "Third Class (1.50–2.49)",
                  value: academic.gpaDist.third,
                  color: "bg-amber-500",
                },
                {
                  label: "Pass (1.00–1.49)",
                  value: academic.gpaDist.pass,
                  color: "bg-orange-500",
                },
                {
                  label: "Fail (< 1.00)",
                  value: academic.gpaDist.fail,
                  color: "bg-red-500",
                },
              ].map((item) => (
                <BarRow
                  key={item.label}
                  label={item.label}
                  value={item.value}
                  max={Math.max(...Object.values(academic.gpaDist), 1)}
                  color={item.color}
                />
              ))}
            </div>
            <div className="mt-4 pt-3 border-t grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-lg font-bold text-amber-600">
                  {academic.probation}
                </p>
                <p className="text-xs text-slate-500">Probation</p>
              </div>
              <div>
                <p className="text-lg font-bold text-red-600">
                  {academic.withdrawn}
                </p>
                <p className="text-xs text-slate-500">Withdrawn/Deferred</p>
              </div>
              <div>
                <p className="text-lg font-bold text-emerald-600">
                  {academic.totalEnrolled}
                </p>
                <p className="text-xs text-slate-500">Total Enrolled</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 size={16} className="text-violet-500" /> Grade
              Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(resultAnalytics.gradeDist).map(
                ([grade, count], i) => (
                  <BarRow
                    key={grade}
                    label={`Grade ${grade}`}
                    value={count}
                    max={Math.max(
                      ...Object.values(resultAnalytics.gradeDist),
                      1,
                    )}
                    color={
                      grade === "F"
                        ? "bg-red-500"
                        : BAR_COLORS[i % BAR_COLORS.length]
                    }
                  />
                ),
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Wallet size={16} className="text-purple-500" /> Financial
            Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="flex flex-col items-center gap-4">
              <DonutChart
                pct={finance.rate}
                color="#8b5cf6"
                label="Collected"
              />
              <div className="w-full space-y-2">
                {[
                  {
                    label: "Total Expected",
                    val: `₦${finance.totalExpected.toLocaleString()}`,
                    color: "text-slate-700",
                  },
                  {
                    label: "Collected",
                    val: `₦${finance.totalCollected.toLocaleString()}`,
                    color: "text-emerald-600",
                  },
                  {
                    label: "Outstanding",
                    val: `₦${finance.outstanding.toLocaleString()}`,
                    color: "text-red-600",
                  },
                ].map((f) => (
                  <div key={f.label} className="flex justify-between text-sm">
                    <span className="text-slate-500">{f.label}</span>
                    <span className={`font-bold ${f.color}`}>{f.val}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-slate-600 mb-3">
                Payment Status
              </p>
              <div className="space-y-3">
                <BarRow
                  label="Fully Paid"
                  value={finance.fullyPaid}
                  max={
                    finance.fullyPaid + finance.partial + finance.unpaid || 1
                  }
                  color="bg-emerald-500"
                />
                <BarRow
                  label="Partial Payment"
                  value={finance.partial}
                  max={
                    finance.fullyPaid + finance.partial + finance.unpaid || 1
                  }
                  color="bg-amber-500"
                />
                <BarRow
                  label="Unpaid"
                  value={finance.unpaid}
                  max={
                    finance.fullyPaid + finance.partial + finance.unpaid || 1
                  }
                  color="bg-red-500"
                />
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-slate-600 mb-3">
                Monthly Collections
              </p>
              {finance.monthlyData.length === 0 ? (
                <p className="text-sm text-slate-400">
                  No monthly data available.
                </p>
              ) : (
                <div className="space-y-2">
                  {finance.monthlyData.map(([month, amt]) => (
                    <BarRow
                      key={month}
                      label={month}
                      value={amt}
                      max={Math.max(
                        ...finance.monthlyData.map(([, v]) => v),
                        1,
                      )}
                      color="bg-violet-500"
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Result Analytics by Department */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 size={16} className="text-teal-500" /> Pass Rate by
            Department
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {resultAnalytics.deptPassRates.map((d, i) => (
              <div
                key={d.dept}
                className="flex items-center gap-3"
                data-ocid={`adv-analytics.dept-pass.${i + 1}`}
              >
                <span className="text-xs text-slate-600 w-44 flex-shrink-0 truncate">
                  {d.dept}
                </span>
                <div className="flex-1 bg-slate-100 rounded-full h-5 overflow-hidden">
                  <div
                    className={`h-full ${BAR_COLORS[i % BAR_COLORS.length]} rounded-full flex items-center justify-end pr-2`}
                    style={{ width: `${Math.max(d.passRate, 4)}%` }}
                  >
                    <span className="text-[10px] text-white font-bold">
                      {d.passRate}%
                    </span>
                  </div>
                </div>
                <span className="text-xs text-slate-400 w-16 text-right">
                  {d.total} results
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
