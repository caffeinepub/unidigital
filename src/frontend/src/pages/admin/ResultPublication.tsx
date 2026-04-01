import { Globe } from "lucide-react";
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
import { Checkbox } from "../../components/ui/checkbox";
import { useResultProcessing } from "../../contexts/ResultProcessingContext";
import { getLocalCourses } from "../../utils/sampleData";

export function ResultPublication() {
  const { examResults, setExamResults } = useResultProcessing();
  const courses = getLocalCourses();
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const senatePending = examResults.filter(
    (r) => r.status === "senate_approved",
  );
  const published = examResults.filter((r) => r.status === "published");

  const groups = Object.values(
    senatePending.reduce<
      Record<
        string,
        { courseCode: string; semester: string; session: string; count: number }
      >
    >((acc, r) => {
      const key = `${r.courseCode}__${r.semester}`;
      if (!acc[key])
        acc[key] = {
          courseCode: r.courseCode,
          semester: r.semester,
          session: r.session,
          count: 0,
        };
      acc[key].count++;
      return acc;
    }, {}),
  );

  const toggle = (key: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });

  const publish = (courseCode: string, semester: string) => {
    const updated = examResults.map((r) =>
      r.courseCode === courseCode &&
      r.semester === semester &&
      r.status === "senate_approved"
        ? {
            ...r,
            status: "published" as const,
            publishedAt: new Date().toISOString(),
          }
        : r,
    );
    setExamResults(updated);
    toast.success(`${courseCode} results published successfully`);
  };

  const publishSelected = () => {
    let updated = [...examResults];
    for (const key of selected) {
      const [courseCode, semester] = key.split("__");
      updated = updated.map((r) =>
        r.courseCode === courseCode &&
        r.semester === semester &&
        r.status === "senate_approved"
          ? {
              ...r,
              status: "published" as const,
              publishedAt: new Date().toISOString(),
            }
          : r,
      );
    }
    setExamResults(updated);
    setSelected(new Set());
    toast.success(`${selected.size} result set(s) published`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Result Publication
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Publish senate-approved results for students to view.
          </p>
        </div>
        {selected.size > 0 && (
          <Button
            onClick={publishSelected}
            className="bg-green-600 hover:bg-green-700"
            data-ocid="publication.primary_button"
          >
            <Globe size={16} className="mr-2" /> Publish Selected (
            {selected.size})
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Awaiting Publication ({groups.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {groups.length === 0 && (
            <p
              className="p-8 text-center text-slate-400"
              data-ocid="publication.empty_state"
            >
              No senate-approved results to publish.
            </p>
          )}
          <div className="divide-y">
            {groups.map((g, i) => {
              const key = `${g.courseCode}__${g.semester}`;
              const course = courses.find((c) => c.code === g.courseCode);
              return (
                <div
                  key={key}
                  className="p-4 flex items-center gap-4"
                  data-ocid={`publication.item.${i + 1}`}
                >
                  <Checkbox
                    checked={selected.has(key)}
                    onCheckedChange={() => toggle(key)}
                    data-ocid="publication.checkbox"
                  />
                  <div className="flex-1">
                    <p className="font-semibold">
                      {g.courseCode} – {course?.title ?? ""}
                    </p>
                    <p className="text-sm text-slate-500">
                      {g.semester} &bull; {g.count} student(s)
                    </p>
                  </div>
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => publish(g.courseCode, g.semester)}
                    data-ocid="publication.primary_button"
                  >
                    <Globe size={14} className="mr-1" /> Publish
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Published Results (
            {published.length > 0
              ? new Set(published.map((r) => r.courseCode)).size
              : 0}{" "}
            courses)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {published.length === 0 && (
            <p className="p-8 text-center text-slate-400">
              No results published yet.
            </p>
          )}
          <div className="divide-y">
            {Object.values(
              published.reduce<
                Record<
                  string,
                  {
                    courseCode: string;
                    semester: string;
                    count: number;
                    publishedAt?: string;
                  }
                >
              >((acc, r) => {
                const key = `${r.courseCode}__${r.semester}`;
                if (!acc[key])
                  acc[key] = {
                    courseCode: r.courseCode,
                    semester: r.semester,
                    count: 0,
                    publishedAt: r.publishedAt,
                  };
                acc[key].count++;
                return acc;
              }, {}),
            ).map((g, i) => (
              <div
                key={`${g.courseCode}-${g.semester}`}
                className="p-4 flex items-center justify-between"
                data-ocid={`publication.published.item.${i + 1}`}
              >
                <div>
                  <p className="font-semibold">{g.courseCode}</p>
                  <p className="text-sm text-slate-500">
                    {g.semester} &bull; {g.count} student(s)
                  </p>
                </div>
                <div className="text-right">
                  <Badge className="bg-green-100 text-green-700">
                    Published
                  </Badge>
                  {g.publishedAt && (
                    <p className="text-xs text-slate-400 mt-1">
                      {new Date(g.publishedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
