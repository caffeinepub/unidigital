import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
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

const deptData = [
  { dept: "Computer Science", avgScore: 4.2, submitted: 12, finalized: 9 },
  { dept: "Engineering", avgScore: 3.8, submitted: 15, finalized: 12 },
  { dept: "Medicine", avgScore: 4.5, submitted: 20, finalized: 18 },
  { dept: "Law", avgScore: 3.5, submitted: 8, finalized: 5 },
  { dept: "Education", avgScore: 4.0, submitted: 10, finalized: 8 },
  { dept: "Business Admin", avgScore: 3.9, submitted: 11, finalized: 9 },
];

const chartData = deptData.map((d) => ({
  name: d.dept.split(" ")[0],
  score: d.avgScore,
}));

export function AppraisalAdmin() {
  const totalSubmitted = deptData.reduce((s, d) => s + d.submitted, 0);
  const totalFinalized = deptData.reduce((s, d) => s + d.finalized, 0);
  const overallAvg = (
    deptData.reduce((s, d) => s + d.avgScore, 0) / deptData.length
  ).toFixed(1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Appraisal Summary</h1>
        <p className="text-slate-500 text-sm">
          Department-level appraisal analytics
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          ["Total Submissions", totalSubmitted, "bg-blue-100 text-blue-700"],
          ["Finalized", totalFinalized, "bg-green-100 text-green-700"],
          [
            "Overall Avg Score",
            `${overallAvg}/5`,
            "bg-purple-100 text-purple-700",
          ],
        ].map(([label, val, cls]) => (
          <Card key={label as string}>
            <CardContent className="p-4 text-center">
              <p
                className={`text-2xl font-bold rounded px-3 py-1 inline-block ${cls}`}
              >
                {val}
              </p>
              <p className="text-sm text-slate-500 mt-1">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bar chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Average Score by Department
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart
              data={chartData}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#64748b" }} />
              <YAxis domain={[0, 5]} tick={{ fontSize: 12, fill: "#64748b" }} />
              <Tooltip
                formatter={(value: number) => [`${value}/5`, "Avg Score"]}
                contentStyle={{ fontSize: 12, borderRadius: 8 }}
              />
              <Bar dataKey="score" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Department Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table data-ocid="appraisals.table">
            <TableHeader>
              <TableRow>
                <TableHead>Department</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Finalized</TableHead>
                <TableHead>Avg Score</TableHead>
                <TableHead>Completion</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deptData.map((d, i) => (
                <TableRow key={d.dept} data-ocid={`appraisals.item.${i + 1}`}>
                  <TableCell className="font-medium">{d.dept}</TableCell>
                  <TableCell>{d.submitted}</TableCell>
                  <TableCell className="text-green-700 font-semibold">
                    {d.finalized}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-slate-100 rounded-full">
                        <div
                          className="h-2 bg-blue-500 rounded-full"
                          style={{ width: `${(d.avgScore / 5) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold">
                        {d.avgScore.toFixed(1)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {Math.round((d.finalized / d.submitted) * 100)}%
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
