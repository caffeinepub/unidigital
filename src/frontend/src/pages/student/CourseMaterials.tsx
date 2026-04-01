import { BookOpen, Download, ExternalLink, FileText } from "lucide-react";
import { useState } from "react";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { getLocalCourses } from "../../utils/sampleData";

interface CourseMaterial {
  id: string;
  courseCode: string;
  title: string;
  type: "pdf" | "doc" | "video" | "link" | "note";
  url: string;
  description: string;
  uploadedAt: string;
  fileSize: string;
}

const LS_KEY = "unidigital_course_materials";

const SEED: CourseMaterial[] = [
  {
    id: "MAT001",
    courseCode: "CSC201",
    title: "Introduction to Data Structures",
    type: "pdf",
    url: "#",
    description:
      "Week 1-3 lecture slides covering arrays, linked lists, and stacks.",
    uploadedAt: "2024-01-15",
    fileSize: "2.4 MB",
  },
  {
    id: "MAT002",
    courseCode: "CSC201",
    title: "Algorithm Analysis Notes",
    type: "note",
    url: "#",
    description: "Comprehensive notes on Big-O notation and time complexity.",
    uploadedAt: "2024-01-22",
    fileSize: "1.1 MB",
  },
  {
    id: "MAT003",
    courseCode: "MAT101",
    title: "Calculus Reference Sheet",
    type: "pdf",
    url: "#",
    description:
      "Quick reference for differential and integral calculus formulas.",
    uploadedAt: "2024-02-05",
    fileSize: "0.8 MB",
  },
];

function getMaterials(): CourseMaterial[] {
  try {
    const stored = localStorage.getItem(LS_KEY);
    return stored ? JSON.parse(stored) : SEED;
  } catch {
    return SEED;
  }
}

const typeIcon: Record<string, React.ReactNode> = {
  pdf: <FileText size={16} className="text-red-500" />,
  doc: <FileText size={16} className="text-blue-500" />,
  video: <ExternalLink size={16} className="text-purple-500" />,
  link: <ExternalLink size={16} className="text-green-500" />,
  note: <BookOpen size={16} className="text-amber-500" />,
};

const typeBadge: Record<string, string> = {
  pdf: "bg-red-100 text-red-700",
  doc: "bg-blue-100 text-blue-700",
  video: "bg-purple-100 text-purple-700",
  link: "bg-green-100 text-green-700",
  note: "bg-amber-100 text-amber-700",
};

interface Props {
  userEmail?: string;
}

export function StudentCourseMaterials({ userEmail: _userEmail }: Props) {
  const courses = getLocalCourses();
  const materials = getMaterials();
  const [filter, setFilter] = useState("all");

  const filtered =
    filter === "all"
      ? materials
      : materials.filter((m) => m.courseCode === filter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Course Materials</h1>
        <p className="text-slate-500 text-sm mt-1">
          Access lecture notes, PDFs, and resources shared by your lecturers.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant={filter === "all" ? "default" : "outline"}
          onClick={() => setFilter("all")}
          data-ocid="smaterials.tab"
        >
          All
        </Button>
        {courses.map((c) => (
          <Button
            key={c.code}
            size="sm"
            variant={filter === c.code ? "default" : "outline"}
            onClick={() => setFilter(c.code)}
            data-ocid="smaterials.tab"
          >
            {c.code}
          </Button>
        ))}
      </div>

      {filtered.length === 0 && (
        <Card>
          <CardContent
            className="p-12 text-center text-slate-400"
            data-ocid="smaterials.empty_state"
          >
            No materials available for this course yet.
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {filtered.map((m, i) => (
          <Card key={m.id} data-ocid={`smaterials.item.${i + 1}`}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-slate-100 rounded">
                  {typeIcon[m.type]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-sm">{m.title}</p>
                    <Badge
                      className={`${typeBadge[m.type]} text-xs flex-shrink-0`}
                    >
                      {m.type.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {m.courseCode} &bull; {m.fileSize}
                  </p>
                  <p className="text-xs text-slate-600 mt-1">{m.description}</p>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-slate-400">{m.uploadedAt}</p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs"
                      data-ocid={`smaterials.secondary_button.${i + 1}`}
                    >
                      <Download size={12} className="mr-1" /> Download
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
