import { Save } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  getGradeFromScore,
  useResultProcessing,
} from "../../contexts/ResultProcessingContext";
import type { GradeConfigEntry } from "../../utils/sampleData";

const gradeColors: Record<string, string> = {
  A: "bg-green-100 text-green-700",
  B: "bg-blue-100 text-blue-700",
  C: "bg-amber-100 text-amber-700",
  D: "bg-orange-100 text-orange-700",
  E: "bg-red-200 text-red-700",
  F: "bg-red-100 text-red-800",
};

export function GradeConfig() {
  const { gradeConfig, setGradeConfig } = useResultProcessing();
  const [local, setLocal] = useState<GradeConfigEntry[]>(gradeConfig);
  const [previewScore, setPreviewScore] = useState(75);

  const update = (
    index: number,
    field: keyof GradeConfigEntry,
    value: number | string,
  ) => {
    setLocal((prev) =>
      prev.map((e, i) => (i === index ? { ...e, [field]: value } : e)),
    );
  };

  const save = () => {
    setGradeConfig(local);
    toast.success("Grade configuration saved");
  };

  const preview = getGradeFromScore(previewScore, local);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Grade Configuration
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Set score boundaries and grade points for the grading system.
          </p>
        </div>
        <Button
          onClick={save}
          className="bg-blue-600 hover:bg-blue-700"
          data-ocid="grade.save_button"
        >
          <Save size={16} className="mr-2" /> Save Configuration
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Grade Scale</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b">
                <tr>
                  {[
                    "Grade",
                    "Min Score",
                    "Max Score",
                    "Grade Point",
                    "Remark",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {local.map((row, i) => (
                  <tr
                    key={row.grade}
                    className="border-b last:border-0 hover:bg-slate-50"
                    data-ocid={`grade.item.${i + 1}`}
                  >
                    <td className="px-4 py-3">
                      <Badge
                        className={
                          gradeColors[row.grade] ??
                          "bg-slate-100 text-slate-700"
                        }
                      >
                        {row.grade}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Input
                        type="number"
                        className="w-20 h-8"
                        value={row.minScore}
                        onChange={(e) => update(i, "minScore", +e.target.value)}
                        data-ocid="grade.input"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <Input
                        type="number"
                        className="w-20 h-8"
                        value={row.maxScore}
                        onChange={(e) => update(i, "maxScore", +e.target.value)}
                        data-ocid="grade.input"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <Input
                        type="number"
                        className="w-16 h-8"
                        value={row.point}
                        onChange={(e) => update(i, "point", +e.target.value)}
                        data-ocid="grade.input"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-sm font-medium ${row.remark === "Pass" ? "text-green-600" : "text-red-600"}`}
                      >
                        {row.remark}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card className="max-w-sm">
        <CardHeader>
          <CardTitle className="text-sm">Score Preview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label>Enter a score to preview</Label>
            <Input
              type="number"
              min={0}
              max={100}
              className="mt-1 w-28"
              value={previewScore}
              onChange={(e) =>
                setPreviewScore(Math.min(100, Math.max(0, +e.target.value)))
              }
              data-ocid="grade.preview_input"
            />
          </div>
          <div className="p-3 bg-slate-50 rounded-lg flex items-center gap-3">
            <Badge
              className={
                gradeColors[preview.grade] ?? "bg-slate-100 text-slate-700"
              }
            >
              {preview.grade}
            </Badge>
            <span className="text-sm text-slate-600">
              {preview.point} point(s)
            </span>
            <span
              className={`text-sm font-medium ${preview.remark === "Pass" ? "text-green-600" : "text-red-600"}`}
            >
              {preview.remark}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
