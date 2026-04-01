import { Award, GraduationCap, TrendingUp, Users } from "lucide-react";
import { StatCard } from "../../components/StatCard";
import { Badge } from "../../components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Progress } from "../../components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";

const cohortStats = [
  { year: "Year 1 (100L)", count: 1240, avgCgpa: 3.2, color: "bg-blue-500" },
  { year: "Year 2 (200L)", count: 1085, avgCgpa: 3.4, color: "bg-green-500" },
  { year: "Year 3 (300L)", count: 920, avgCgpa: 3.5, color: "bg-purple-500" },
  { year: "Year 4 (400L)", count: 810, avgCgpa: 3.6, color: "bg-amber-500" },
];

const funnelData = [
  { label: "Applied", count: 2500, pct: 100 },
  { label: "Admitted", count: 1800, pct: 72 },
  { label: "Registered", count: 1650, pct: 66 },
  { label: "Active Students", count: 4055, pct: 100 },
  { label: "Graduated (All-time)", count: 3200, pct: 79 },
];

const sampleProgressions = [
  {
    matric: "CSC/2021/042",
    name: "Adaobi Okafor",
    dept: "Computer Science",
    year: "Year 3",
    cgpa: 3.8,
    status: "On Track",
  },
  {
    matric: "ENG/2020/018",
    name: "Chukwuemeka Eze",
    dept: "Engineering",
    year: "Year 4",
    cgpa: 3.45,
    status: "On Track",
  },
  {
    matric: "MED/2021/007",
    name: "Fatima Al-Hassan",
    dept: "Medicine",
    year: "Year 3",
    cgpa: 4.1,
    status: "On Track",
  },
  {
    matric: "LAW/2022/031",
    name: "Segun Adeyemi",
    dept: "Law",
    year: "Year 2",
    cgpa: 2.1,
    status: "Probation",
  },
  {
    matric: "BUS/2021/055",
    name: "Ngozi Nwachukwu",
    dept: "Business Admin",
    year: "Year 3",
    cgpa: 3.9,
    status: "On Track",
  },
  {
    matric: "CSC/2022/019",
    name: "Babatunde Olatunji",
    dept: "Computer Science",
    year: "Year 2",
    cgpa: 1.85,
    status: "At Risk",
  },
  {
    matric: "EDU/2021/028",
    name: "Amina Suleiman",
    dept: "Education",
    year: "Year 3",
    cgpa: 3.6,
    status: "On Track",
  },
  {
    matric: "ENG/2022/044",
    name: "Emeka Okonkwo",
    dept: "Engineering",
    year: "Year 2",
    cgpa: 3.2,
    status: "On Track",
  },
];

const statusStyle: Record<string, string> = {
  "On Track": "bg-green-100 text-green-700",
  Probation: "bg-amber-100 text-amber-700",
  "At Risk": "bg-red-100 text-red-700",
  Graduated: "bg-blue-100 text-blue-700",
};

export function ProgressionAdmin() {
  const totalStudents = cohortStats.reduce((s, c) => s + c.count, 0);
  const avgCgpa = (
    cohortStats.reduce((s, c) => s + c.avgCgpa, 0) / cohortStats.length
  ).toFixed(2);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Academic Progression
        </h1>
        <p className="text-slate-500 text-sm">
          Institutional cohort tracking and progression analytics
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Students"
          value={totalStudents}
          icon={<Users size={22} />}
          color="blue"
        />
        <StatCard
          title="Avg CGPA"
          value={avgCgpa}
          icon={<Award size={22} />}
          color="green"
        />
        <StatCard
          title="Graduated (All-time)"
          value={3200}
          icon={<GraduationCap size={22} />}
          color="purple"
        />
        <StatCard
          title="At Risk"
          value={
            sampleProgressions.filter(
              (s) => s.status === "At Risk" || s.status === "Probation",
            ).length
          }
          icon={<TrendingUp size={22} />}
          color="amber"
        />
      </div>

      {/* Cohort cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cohortStats.map((c) => (
          <Card key={c.year}>
            <CardContent className="p-4">
              <p className="text-sm font-medium text-slate-600">{c.year}</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">
                {c.count.toLocaleString()}
              </p>
              <div className="mt-2">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-500">Avg CGPA</span>
                  <span className="font-semibold text-blue-600">
                    {c.avgCgpa.toFixed(1)}
                  </span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full">
                  <div
                    className={`h-1.5 rounded-full ${c.color}`}
                    style={{ width: `${(c.avgCgpa / 5) * 100}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Admissions funnel */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Admission & Progression Funnel
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {funnelData.map((f) => (
            <div key={f.label}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-600">{f.label}</span>
                <span className="font-semibold">
                  {f.count.toLocaleString()}
                </span>
              </div>
              <Progress value={f.pct} className="h-3" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Student progression table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Student Progression Status
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table data-ocid="progression.table">
            <TableHeader>
              <TableRow>
                <TableHead>Matric</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Year</TableHead>
                <TableHead>CGPA</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sampleProgressions.map((s, i) => (
                <TableRow
                  key={s.matric}
                  data-ocid={`progression.item.${i + 1}`}
                >
                  <TableCell className="font-mono text-xs text-blue-600">
                    {s.matric}
                  </TableCell>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell className="text-slate-500">{s.dept}</TableCell>
                  <TableCell>{s.year}</TableCell>
                  <TableCell className="font-semibold">
                    {s.cgpa.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyle[s.status] ?? "bg-slate-100 text-slate-600"}`}
                    >
                      {s.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
