import {
  BookOpen,
  Download,
  ExternalLink,
  FileText,
  Trash2,
  Upload,
} from "lucide-react";
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
import { Textarea } from "../../components/ui/textarea";
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

function saveMaterials(data: CourseMaterial[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(data));
}

const typeIcon: Record<string, React.ReactNode> = {
  pdf: <FileText size={16} className="text-red-500" />,
  doc: <FileText size={16} className="text-blue-500" />,
  video: <ExternalLink size={16} className="text-purple-500" />,
  link: <ExternalLink size={16} className="text-green-500" />,
  note: <BookOpen size={16} className="text-amber-500" />,
};

export function CourseMaterials() {
  const courses = getLocalCourses();
  const [materials, setMaterials] = useState<CourseMaterial[]>(getMaterials);
  const [filter, setFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    courseCode: "",
    title: "",
    type: "pdf" as CourseMaterial["type"],
    url: "",
    description: "",
    fileSize: "",
  });

  const filtered =
    filter === "all"
      ? materials
      : materials.filter((m) => m.courseCode === filter);

  const handleAdd = () => {
    if (!form.courseCode || !form.title) {
      toast.error("Course and title required");
      return;
    }
    const newMat: CourseMaterial = {
      id: `MAT${Date.now()}`,
      ...form,
      uploadedAt: new Date().toISOString().split("T")[0],
      fileSize: form.fileSize || "–",
    };
    const updated = [...materials, newMat];
    setMaterials(updated);
    saveMaterials(updated);
    setDialogOpen(false);
    setForm({
      courseCode: "",
      title: "",
      type: "pdf",
      url: "",
      description: "",
      fileSize: "",
    });
    toast.success("Material uploaded successfully");
  };

  const handleDelete = (id: string) => {
    const updated = materials.filter((m) => m.id !== id);
    setMaterials(updated);
    saveMaterials(updated);
    toast.success("Material removed");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Course Materials
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Upload lecture notes, PDFs, videos and links for your students.
          </p>
        </div>
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white"
          onClick={() => setDialogOpen(true)}
          data-ocid="materials.open_modal_button"
        >
          <Upload size={16} className="mr-2" /> Upload Material
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant={filter === "all" ? "default" : "outline"}
          onClick={() => setFilter("all")}
          data-ocid="materials.tab"
        >
          All Courses
        </Button>
        {courses.map((c) => (
          <Button
            key={c.code}
            size="sm"
            variant={filter === c.code ? "default" : "outline"}
            onClick={() => setFilter(c.code)}
            data-ocid="materials.tab"
          >
            {c.code}
          </Button>
        ))}
      </div>

      {filtered.length === 0 && (
        <Card>
          <CardContent
            className="p-12 text-center text-slate-400"
            data-ocid="materials.empty_state"
          >
            No materials uploaded for this course yet.
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {filtered.map((m, i) => (
          <Card key={m.id} data-ocid={`materials.item.${i + 1}`}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-slate-100 rounded">
                  {typeIcon[m.type]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{m.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {m.courseCode} &bull; {m.type.toUpperCase()} &bull;{" "}
                    {m.fileSize}
                  </p>
                  <p className="text-xs text-slate-600 mt-1">{m.description}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Uploaded: {m.uploadedAt}
                  </p>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0"
                    data-ocid={`materials.secondary_button.${i + 1}`}
                  >
                    <Download size={13} />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0 text-red-500 hover:text-red-700"
                    onClick={() => handleDelete(m.id)}
                    data-ocid={`materials.delete_button.${i + 1}`}
                  >
                    <Trash2 size={13} />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent data-ocid="materials.dialog">
          <DialogHeader>
            <DialogTitle>Upload Course Material</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Course</Label>
              <Select
                value={form.courseCode}
                onValueChange={(v) => setForm((p) => ({ ...p, courseCode: v }))}
              >
                <SelectTrigger className="mt-1" data-ocid="materials.select">
                  <SelectValue placeholder="Select course..." />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      {c.code} – {c.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Title</Label>
              <Input
                className="mt-1"
                value={form.title}
                onChange={(e) =>
                  setForm((p) => ({ ...p, title: e.target.value }))
                }
                placeholder="e.g. Week 3 Lecture Notes"
                data-ocid="materials.input"
              />
            </div>
            <div>
              <Label>Type</Label>
              <Select
                value={form.type}
                onValueChange={(v) =>
                  setForm((p) => ({ ...p, type: v as CourseMaterial["type"] }))
                }
              >
                <SelectTrigger className="mt-1" data-ocid="materials.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="doc">Document</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="link">External Link</SelectItem>
                  <SelectItem value="note">Text Note</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>URL / Link</Label>
              <Input
                className="mt-1"
                value={form.url}
                onChange={(e) =>
                  setForm((p) => ({ ...p, url: e.target.value }))
                }
                placeholder="https://..."
                data-ocid="materials.input"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                className="mt-1"
                value={form.description}
                onChange={(e) =>
                  setForm((p) => ({ ...p, description: e.target.value }))
                }
                data-ocid="materials.textarea"
              />
            </div>
            <div>
              <Label>File Size (optional)</Label>
              <Input
                className="mt-1"
                value={form.fileSize}
                onChange={(e) =>
                  setForm((p) => ({ ...p, fileSize: e.target.value }))
                }
                placeholder="e.g. 2.4 MB"
                data-ocid="materials.input"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              data-ocid="materials.cancel_button"
            >
              Cancel
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleAdd}
              data-ocid="materials.submit_button"
            >
              Upload
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
