import {
  AlertTriangle,
  Bot,
  Brain,
  CheckCircle,
  TrendingDown,
  X,
} from "lucide-react";
import { useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";

// Predictive GPA data — simulated for 6 departments over weeks 1-12
const gpaChartData = [
  {
    week: "Wk 4",
    "Comp Sci": 3.3,
    Engineering: 3.0,
    Medicine: 3.5,
    Law: 2.7,
    Education: 3.1,
    Business: 3.2,
  },
  {
    week: "Wk 6",
    "Comp Sci": 3.4,
    Engineering: 3.1,
    Medicine: 3.6,
    Law: 2.8,
    Education: 3.2,
    Business: 3.3,
  },
  {
    week: "Wk 8",
    "Comp Sci": 3.5,
    Engineering: 3.1,
    Medicine: 3.7,
    Law: 2.9,
    Education: 3.3,
    Business: 3.4,
  },
  {
    week: "Wk 10",
    "Comp Sci": 3.6,
    Engineering: 3.2,
    Medicine: 3.8,
    Law: 3.0,
    Education: 3.4,
    Business: 3.5,
  },
  {
    week: "Wk 12 (Predicted)",
    "Comp Sci": 3.6,
    Engineering: 3.2,
    Medicine: 3.8,
    Law: 3.0,
    Education: 3.4,
    Business: 3.5,
  },
];

const lineColors = [
  "#3b82f6",
  "#10b981",
  "#8b5cf6",
  "#f59e0b",
  "#ef4444",
  "#06b6d4",
];
const deptKeys = [
  "Comp Sci",
  "Engineering",
  "Medicine",
  "Law",
  "Education",
  "Business",
];

interface Anomaly {
  id: string;
  type: "bulk" | "drop";
  message: string;
  severity: "high" | "medium";
  dismissed: boolean;
}

const initialAnomalies: Anomaly[] = [
  {
    id: "ANO1",
    type: "bulk",
    message:
      "CSC401 — 8 results submitted within 2 minutes (possible bulk data entry error). Review advised.",
    severity: "high",
    dismissed: false,
  },
  {
    id: "ANO2",
    type: "drop",
    message:
      "John Doe (CSC/2021/042) — GPA dropped sharply from 3.8 to 1.2 in one semester.",
    severity: "high",
    dismissed: false,
  },
  {
    id: "ANO3",
    type: "bulk",
    message:
      "MTH301 — 3 identical scores (75) submitted for 6 students. Verify manually.",
    severity: "medium",
    dismissed: false,
  },
  {
    id: "ANO4",
    type: "drop",
    message:
      "Emeka Osei (ENG/2020/018) — Attendance dropped from 92% to 38% this semester.",
    severity: "medium",
    dismissed: false,
  },
];

interface AtRiskStudent {
  matric: string;
  name: string;
  cgpa: number;
  attendance: number;
  risk: "High" | "Medium";
}

const atRiskStudents: AtRiskStudent[] = [
  {
    matric: "CSC/2022/019",
    name: "Babatunde Lawal",
    cgpa: 1.85,
    attendance: 45,
    risk: "High",
  },
  {
    matric: "LAW/2022/031",
    name: "Segun Adeyemi",
    cgpa: 2.1,
    attendance: 58,
    risk: "High",
  },
  {
    matric: "ENG/2021/057",
    name: "Chidi Nwosu",
    cgpa: 1.6,
    attendance: 40,
    risk: "High",
  },
  {
    matric: "BUS/2022/044",
    name: "Taiwo Abiodun",
    cgpa: 2.3,
    attendance: 62,
    risk: "Medium",
  },
  {
    matric: "MED/2021/033",
    name: "Hauwa Musa",
    cgpa: 2.4,
    attendance: 55,
    risk: "Medium",
  },
];

interface Recommendation {
  studentName: string;
  matric: string;
  courses: { code: string; title: string; reason: string }[];
}

const recommendations: Recommendation[] = [
  {
    studentName: "Adaobi Okafor",
    matric: "CSC/2021/042",
    courses: [
      {
        code: "MTH201",
        title: "Calculus II",
        reason:
          "Strong performance in MTH101 (A) indicates readiness for advanced calculus.",
      },
      {
        code: "CSC405",
        title: "Machine Learning",
        reason:
          "High scores in CSC201 Data Structures & CSC307 Algorithms suggest aptitude for ML.",
      },
      {
        code: "CSC412",
        title: "Advanced Databases",
        reason:
          "Consistent A grades in database courses; elective strongly recommended.",
      },
    ],
  },
  {
    studentName: "Fatima Al-Hassan",
    matric: "MED/2021/007",
    courses: [
      {
        code: "MED501",
        title: "Clinical Pharmacology",
        reason:
          "Top performer in MED301 Anatomy; ready for advanced clinical specialization.",
      },
      {
        code: "RES401",
        title: "Medical Research Methods",
        reason:
          "High GPA and demonstrated analytical skills recommend research track.",
      },
    ],
  },
];

export function AIDashboard() {
  const [anomalies, setAnomalies] = useState<Anomaly[]>(initialAnomalies);

  const dismissAnomaly = (id: string) => {
    setAnomalies((prev) =>
      prev.map((a) => (a.id === id ? { ...a, dismissed: true } : a)),
    );
  };

  const activeAnomalies = anomalies.filter((a) => !a.dismissed);

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
          <Bot size={22} className="text-purple-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            AI & Automation Dashboard
          </h1>
          <p className="text-slate-500 text-sm">
            Predictive analytics, anomaly detection, and smart recommendations
          </p>
        </div>
      </div>

      {/* Section 1: Predictive Performance */}
      <div>
        <h2 className="text-lg font-semibold text-slate-700 mb-3 flex items-center gap-2">
          <TrendingDown size={18} className="text-blue-500" /> Predictive
          End-of-Semester GPA
        </h2>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-slate-500 font-normal">
              AI-projected GPA per department based on current CA scores and
              attendance data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart
                data={gpaChartData}
                margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="week"
                  tick={{ fontSize: 11, fill: "#64748b" }}
                />
                <YAxis
                  domain={[2.5, 4.5]}
                  tick={{ fontSize: 11, fill: "#64748b" }}
                />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                {deptKeys.map((dept, i) => (
                  <Line
                    key={dept}
                    type="monotone"
                    dataKey={dept}
                    stroke={lineColors[i]}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-4">
              {[
                ["Comp Sci", "3.6"],
                ["Engineering", "3.2"],
                ["Medicine", "3.8"],
                ["Law", "3.0"],
                ["Education", "3.4"],
                ["Business", "3.5"],
              ].map(([dept, gpa]) => (
                <div
                  key={dept}
                  className="text-center p-2 bg-slate-50 rounded-lg"
                >
                  <p className="text-sm font-bold text-blue-600">{gpa}</p>
                  <p className="text-xs text-slate-500">{dept}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Section 2: Anomaly Detection */}
      <div>
        <h2 className="text-lg font-semibold text-slate-700 mb-3 flex items-center gap-2">
          <AlertTriangle size={18} className="text-amber-500" /> Anomaly
          Detection
          {activeAnomalies.length > 0 && (
            <Badge className="bg-red-100 text-red-700 border-0">
              {activeAnomalies.length} active
            </Badge>
          )}
        </h2>
        <div className="space-y-3">
          {activeAnomalies.length === 0 && (
            <Card>
              <CardContent
                className="p-6 flex items-center gap-3 text-green-700"
                data-ocid="ai.empty_state"
              >
                <CheckCircle size={20} />
                <span className="text-sm">
                  No active anomalies detected. All results look clean.
                </span>
              </CardContent>
            </Card>
          )}
          {activeAnomalies.map((a, i) => (
            <Card
              key={a.id}
              className={`border-l-4 ${a.severity === "high" ? "border-l-red-500" : "border-l-amber-400"}`}
              data-ocid={`ai.item.${i + 1}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <AlertTriangle
                      size={16}
                      className={
                        a.severity === "high"
                          ? "text-red-500 flex-shrink-0 mt-0.5"
                          : "text-amber-500 flex-shrink-0 mt-0.5"
                      }
                    />
                    <div>
                      <Badge
                        className={`text-xs border-0 mb-1 ${a.severity === "high" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}
                      >
                        {a.severity === "high"
                          ? "High Priority"
                          : "Medium Priority"}
                      </Badge>
                      <p className="text-sm text-slate-700">{a.message}</p>
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <Button size="sm" variant="outline" className="text-xs h-7">
                      Investigate
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-slate-400 h-7 w-7 p-0"
                      onClick={() => dismissAnomaly(a.id)}
                      data-ocid={`ai.delete_button.${i + 1}`}
                    >
                      <X size={14} />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Section 3: Academic Warning List */}
      <div>
        <h2 className="text-lg font-semibold text-slate-700 mb-3 flex items-center gap-2">
          <Brain size={18} className="text-red-500" /> At-Risk Student Warnings
        </h2>
        <Card>
          <CardContent className="p-0">
            <Table data-ocid="ai.table">
              <TableHeader>
                <TableRow>
                  <TableHead>Matric</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>CGPA</TableHead>
                  <TableHead>Attendance %</TableHead>
                  <TableHead>Risk Level</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {atRiskStudents.map((s, i) => (
                  <TableRow key={s.matric} data-ocid={`ai.item.${i + 1}`}>
                    <TableCell className="font-mono text-xs text-blue-600">
                      {s.matric}
                    </TableCell>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell>
                      <span
                        className={`font-semibold ${s.cgpa < 2.0 ? "text-red-600" : "text-amber-600"}`}
                      >
                        {s.cgpa.toFixed(2)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={
                          s.attendance < 50
                            ? "text-red-600 font-semibold"
                            : "text-amber-600"
                        }
                      >
                        {s.attendance}%
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`text-xs border-0 ${
                          s.risk === "High"
                            ? "bg-red-100 text-red-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {s.risk} Risk
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-7"
                      >
                        Send Warning
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Section 4: Smart Course Recommendations */}
      <div>
        <h2 className="text-lg font-semibold text-slate-700 mb-3 flex items-center gap-2">
          <Bot size={18} className="text-purple-500" /> Smart Course
          Recommendations
        </h2>
        <div className="space-y-4">
          {recommendations.map((rec, i) => (
            <Card key={rec.matric} data-ocid={`ai.card.${i + 1}`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">
                  {rec.studentName}
                  <span className="text-xs text-slate-400 font-normal ml-2">
                    {rec.matric}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {rec.courses.map((c) => (
                  <div
                    key={c.code}
                    className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg"
                  >
                    <Badge className="bg-purple-100 text-purple-700 border-0 text-xs flex-shrink-0">
                      {c.code}
                    </Badge>
                    <div>
                      <p className="text-sm font-medium text-slate-800">
                        {c.title}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {c.reason}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
