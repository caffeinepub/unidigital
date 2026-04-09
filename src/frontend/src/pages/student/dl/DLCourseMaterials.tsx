import {
  BookOpen,
  CheckCircle,
  Download,
  FileText,
  Upload,
  Video,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";

interface CourseMaterial {
  code: string;
  title: string;
  hasNotes: boolean;
  hasVideo: boolean;
  hasPastQ: boolean;
  hasAssignment: boolean;
  assignmentDeadline?: string;
}

const MATERIALS: CourseMaterial[] = [
  {
    code: "ENT 211",
    title: "Entrepreneurship & Innovation",
    hasNotes: true,
    hasVideo: true,
    hasPastQ: true,
    hasAssignment: true,
    assignmentDeadline: "2025-04-20",
  },
  {
    code: "EDU 201",
    title: "Curriculum & Teaching Methods",
    hasNotes: true,
    hasVideo: true,
    hasPastQ: true,
    hasAssignment: true,
    assignmentDeadline: "2025-04-22",
  },
  {
    code: "EDU 203",
    title: "Educational Technology & AI",
    hasNotes: true,
    hasVideo: false,
    hasPastQ: false,
    hasAssignment: true,
    assignmentDeadline: "2025-04-25",
  },
  {
    code: "COS 201",
    title: "Computer Programming I",
    hasNotes: true,
    hasVideo: true,
    hasPastQ: true,
    hasAssignment: false,
  },
  {
    code: "MTH 201",
    title: "Mathematical Methods I",
    hasNotes: true,
    hasVideo: false,
    hasPastQ: true,
    hasAssignment: false,
  },
  {
    code: "SED 203",
    title: "Mathematics Subject Method",
    hasNotes: true,
    hasVideo: true,
    hasPastQ: false,
    hasAssignment: true,
    assignmentDeadline: "2025-04-28",
  },
];

function MaterialIndicator({
  available,
  label,
}: { available: boolean; label: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${
        available
          ? "bg-green-100 text-green-700"
          : "bg-muted text-muted-foreground"
      }`}
    >
      {available ? <CheckCircle size={10} /> : null}
      {label}
    </span>
  );
}

export function DLCourseMaterials() {
  const [uploadedCodes, setUploadedCodes] = useState<Set<string>>(new Set());

  const handleUpload = (code: string) => {
    setTimeout(() => {
      setUploadedCodes((prev) => new Set([...prev, code]));
    }, 800);
  };

  const handleDownload = (type: string, code: string) => {
    // Simulated download
    const filename = `${code.replace(" ", "_")}_${type}_DL_FUEK.pdf`;
    const blob = new Blob([`[Simulated DL Material: ${code} — ${type}]`], {
      type: "application/pdf",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-foreground">
          DL Learning Resources
        </h2>
        <p className="text-sm text-muted-foreground">
          Access lecture notes, video lectures, past questions, and upload
          assignments for your enrolled courses.
        </p>
      </div>

      <div className="space-y-4">
        {MATERIALS.map((mat) => (
          <Card key={mat.code} className="hover:shadow-sm transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <div>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <BookOpen size={15} className="text-primary" />
                    {mat.code} — {mat.title}
                  </CardTitle>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    <MaterialIndicator
                      available={mat.hasNotes}
                      label="Lecture Notes"
                    />
                    <MaterialIndicator
                      available={mat.hasVideo}
                      label="Video Lecture"
                    />
                    <MaterialIndicator
                      available={mat.hasPastQ}
                      label="Past Questions"
                    />
                    <MaterialIndicator
                      available={mat.hasAssignment}
                      label="Assignment"
                    />
                  </div>
                </div>
                {mat.hasAssignment && mat.assignmentDeadline && (
                  <Badge className="bg-amber-100 text-amber-700 border-0 text-xs">
                    Due:{" "}
                    {new Date(mat.assignmentDeadline).toLocaleDateString(
                      "en-NG",
                      { day: "2-digit", month: "short", year: "numeric" },
                    )}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {mat.hasNotes && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5 text-xs"
                    onClick={() => handleDownload("Lecture_Notes", mat.code)}
                    data-ocid={`dl.materials.notes.${mat.code.replace(" ", "_")}`}
                  >
                    <Download size={13} /> Lecture Notes
                  </Button>
                )}
                {mat.hasVideo && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5 text-xs"
                    onClick={() =>
                      window.alert(
                        `[Simulated] Playing video lecture for ${mat.code}`,
                      )
                    }
                    data-ocid={`dl.materials.video.${mat.code.replace(" ", "_")}`}
                  >
                    <Video size={13} /> Video Lecture
                  </Button>
                )}
                {mat.hasPastQ && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5 text-xs"
                    onClick={() => handleDownload("Past_Questions", mat.code)}
                    data-ocid={`dl.materials.pastq.${mat.code.replace(" ", "_")}`}
                  >
                    <FileText size={13} /> Past Questions
                  </Button>
                )}
                {mat.hasAssignment &&
                  (uploadedCodes.has(mat.code) ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5 text-xs bg-green-50 border-green-300 text-green-700"
                      disabled
                    >
                      <CheckCircle size={13} /> Assignment Submitted ✓
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      className="gap-1.5 text-xs"
                      onClick={() => handleUpload(mat.code)}
                      data-ocid={`dl.materials.upload.${mat.code.replace(" ", "_")}`}
                    >
                      <Upload size={13} /> Upload Assignment
                    </Button>
                  ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="bg-muted/30 border border-border rounded-lg p-3 text-xs text-muted-foreground">
        <p className="font-semibold text-foreground mb-1">
          Distance Learning Resources Policy
        </p>
        <p>
          All course materials are available 24/7 on this portal. Video lectures
          may require a stable internet connection. Assignment uploads are
          accepted up to 11:59 PM on the deadline date. For technical support:{" "}
          <span className="font-mono text-primary">it-support@fuek.edu.ng</span>
        </p>
      </div>
    </div>
  );
}
