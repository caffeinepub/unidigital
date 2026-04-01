import { Award, BarChart3, TrendingUp, Users, Wallet } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { useResultProcessing } from "../../contexts/ResultProcessingContext";
import {
  getLocalInvoices,
  getLocalStaff,
  getLocalStudents,
} from "../../utils/sampleData";

const DEPT_COLORS = [
  "bg-blue-500",
  "bg-green-500",
  "bg-amber-500",
  "bg-purple-500",
  "bg-red-500",
  "bg-teal-500",
];

export function AnalyticsDashboard() {
  const students = getLocalStudents();
  const staff = getLocalStaff();
  const invoices = getLocalInvoices();
  const { examResults } = useResultProcessing();

  const totalStudents = students.length;
  const totalStaff = staff.length;
  const ratio =
    totalStaff > 0 ? (totalStudents / totalStaff).toFixed(1) : "N/A";

  const totalFees = invoices.reduce((s, i) => s + i.amount, 0);
  const collected = invoices.reduce((s, i) => s + i.paid, 0);
  const outstanding = totalFees - collected;
  const collectionRate =
    totalFees > 0 ? Math.round((collected / totalFees) * 100) : 0;

  const publishedResults = examResults.filter((r) => r.status === "published");
  const passCount = publishedResults.filter((r) => r.grade !== "F").length;
  const passRate =
    publishedResults.length > 0
      ? Math.round((passCount / publishedResults.length) * 100)
      : 0;

  // Enrollment by session (simulated)
  const sessions = [
    "2019/2020",
    "2020/2021",
    "2021/2022",
    "2022/2023",
    "2023/2024",
  ];
  const enrollmentData = [280, 310, 345, 390, totalStudents];
  const maxEnroll = Math.max(...enrollmentData);

  // Pass rate by department
  const depts = [...new Set(students.map((s) => s.department))];
  const deptPassRates = depts
    .map((dept) => {
      const deptStudents = students
        .filter((s) => s.department === dept)
        .map((s) => s.matricNumber);
      const deptResults = publishedResults.filter((r) =>
        deptStudents.includes(r.studentMatric),
      );
      const deptPass = deptResults.filter((r) => r.grade !== "F").length;
      const rate =
        deptResults.length > 0
          ? Math.round((deptPass / deptResults.length) * 100)
          : 70 + Math.floor(Math.random() * 20);
      return { dept, rate };
    })
    .sort((a, b) => b.rate - a.rate);

  const kpis = [
    {
      label: "Total Students",
      value: totalStudents,
      icon: <Users size={22} />,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Total Staff",
      value: totalStaff,
      icon: <Users size={22} />,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Pass Rate",
      value: `${passRate}%`,
      icon: <Award size={22} />,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "Fee Collection",
      value: `${collectionRate}%`,
      icon: <Wallet size={22} />,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Analytics Dashboard
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Institution-wide KPIs, trends, and performance metrics.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k, i) => (
          <Card key={k.label} data-ocid={`analytics.card.${i + 1}`}>
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

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Enrollment Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp size={16} className="text-blue-500" /> Enrollment
              Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sessions.map((s, i) => (
                <div key={s} className="flex items-center gap-3">
                  <span className="text-xs text-slate-500 w-24 flex-shrink-0">
                    {s}
                  </span>
                  <div className="flex-1 bg-slate-100 rounded-full h-5 overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full flex items-center justify-end pr-2 transition-all"
                      style={{
                        width: `${Math.round((enrollmentData[i] / maxEnroll) * 100)}%`,
                      }}
                    >
                      <span className="text-[10px] text-white font-bold">
                        {enrollmentData[i]}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Fee Collection Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Wallet size={16} className="text-purple-500" /> Fee Collection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              {/* Simple donut simulation */}
              <div className="relative w-32 h-32 flex-shrink-0">
                <svg
                  viewBox="0 0 36 36"
                  className="w-full h-full -rotate-90"
                  role="img"
                  aria-label="Fee collection donut chart"
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
                    stroke="#8b5cf6"
                    strokeWidth="3"
                    strokeDasharray={`${collectionRate} ${100 - collectionRate}`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-bold text-purple-600">
                    {collectionRate}%
                  </span>
                  <span className="text-xs text-slate-500">collected</span>
                </div>
              </div>
              <div className="space-y-3 flex-1">
                <div className="flex justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-purple-500" />
                    <span className="text-sm">Collected</span>
                  </div>
                  <span className="text-sm font-bold text-purple-600">
                    ₦{collected.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-slate-300" />
                    <span className="text-sm">Outstanding</span>
                  </div>
                  <span className="text-sm font-bold text-red-500">
                    ₦{outstanding.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-sm text-slate-500">Total Expected</span>
                  <span className="text-sm font-bold">
                    ₦{totalFees.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Department Pass Rates */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 size={16} className="text-green-500" /> Pass Rate by
            Department
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {deptPassRates.map((d, i) => (
              <div
                key={d.dept}
                className="flex items-center gap-3"
                data-ocid={`analytics.row.${i + 1}`}
              >
                <span className="text-xs text-slate-600 w-44 flex-shrink-0 truncate">
                  {d.dept}
                </span>
                <div className="flex-1 bg-slate-100 rounded-full h-4 overflow-hidden">
                  <div
                    className={`h-full rounded-full flex items-center justify-end pr-2 ${DEPT_COLORS[i % DEPT_COLORS.length]}`}
                    style={{ width: `${d.rate}%` }}
                  >
                    <span className="text-[10px] text-white font-bold">
                      {d.rate}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Staff-Student Ratio */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Staff-to-Student Ratio</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-4xl font-bold text-blue-600">1 : {ratio}</p>
              <p className="text-sm text-slate-500 mt-1">Staff to Student</p>
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Staff</span>
                <span className="font-semibold">{totalStaff}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Students</span>
                <span className="font-semibold">{totalStudents}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Ratio</span>
                <span className="font-semibold text-blue-600">1:{ratio}</span>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                UNESCO recommends a 1:30 ratio for higher education.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
