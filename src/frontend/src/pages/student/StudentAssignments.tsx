import { Camera } from "lucide-react";
import { useRef, useState } from "react";
import { DocumentScanner } from "../../components/DocumentScanner";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { useAssignments } from "../../contexts/AssignmentContext";

interface Props {
  studentMatric: string;
  studentName: string;
  courseCodes: string[];
}

export function StudentAssignments({
  studentMatric,
  studentName,
  courseCodes,
}: Props) {
  const { assignments, submissions, submitAssignment } = useAssignments();
  const [submitOpen, setSubmitOpen] = useState(false);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<
    string | null
  >(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const myAssignments = assignments.filter((a) =>
    courseCodes.includes(a.courseCode),
  );
  const mySubmissions = submissions.filter(
    (s) => s.studentMatric === studentMatric,
  );

  const getSubmission = (assignmentId: string) =>
    mySubmissions.find((s) => s.assignmentId === assignmentId);

  const handleSubmit = async () => {
    if (!selectedAssignmentId || selectedFiles.length === 0) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 800));
    submitAssignment({
      id: `sub_${Date.now()}`,
      assignmentId: selectedAssignmentId,
      studentMatric,
      studentName,
      fileNames: selectedFiles.map((f) => f.name),
      fileUrls: selectedFiles.map((f) => URL.createObjectURL(f)),
      submittedAt: Date.now(),
    });
    setSubmitting(false);
    setSubmitOpen(false);
    setSelectedFiles([]);
    setSelectedAssignmentId(null);
  };

  const handleScanCapture = (file: File, _previewUrl: string) => {
    setSelectedFiles((prev) => [...prev, file]);
    setScannerOpen(false);
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-800">Assignments</h1>
      {myAssignments.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center text-slate-400">
            No assignments found for your courses.
          </CardContent>
        </Card>
      )}
      <div className="space-y-3">
        {myAssignments.map((a) => {
          const sub = getSubmission(a.id);
          const isPast = a.dueDate < Date.now();
          return (
            <Card key={a.id}>
              <CardContent className="p-5">
                <div className="flex flex-col sm:flex-row justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-semibold">{a.title}</h3>
                      <Badge className="bg-blue-100 text-blue-700 border-0">
                        {a.courseCode}
                      </Badge>
                      {sub ? (
                        <Badge className="bg-green-100 text-green-700 border-0">
                          Submitted
                        </Badge>
                      ) : isPast ? (
                        <Badge className="bg-red-100 text-red-700 border-0">
                          Overdue
                        </Badge>
                      ) : (
                        <Badge className="bg-amber-100 text-amber-700 border-0">
                          Pending
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 mt-1">
                      {a.description}
                    </p>
                    <p className="text-xs text-slate-400 mt-2">
                      Due:{" "}
                      {new Date(a.dueDate).toLocaleDateString("en-NG", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                    {sub && (
                      <div className="mt-3 p-3 bg-slate-50 rounded-lg space-y-1">
                        <p className="text-xs text-slate-500">
                          Submitted:{" "}
                          {new Date(sub.submittedAt).toLocaleString()}
                        </p>
                        <p className="text-xs text-slate-500">
                          Files: {sub.fileNames.join(", ")}
                        </p>
                        {sub.grade && (
                          <p className="text-sm font-semibold text-green-700">
                            Grade: {sub.grade}
                          </p>
                        )}
                        {sub.feedback && (
                          <p className="text-sm text-slate-600">
                            Feedback: {sub.feedback}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  {!sub && !isPast && (
                    <Button
                      className="bg-blue-600 hover:bg-blue-700 shrink-0 self-start"
                      onClick={() => {
                        setSelectedAssignmentId(a.id);
                        setSubmitOpen(true);
                      }}
                    >
                      Submit
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog
        open={submitOpen}
        onOpenChange={(o) => {
          if (!submitting) setSubmitOpen(o);
        }}
      >
        <DialogContent data-ocid="assignments.dialog">
          <DialogHeader>
            <DialogTitle>Submit Assignment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              {assignments.find((a) => a.id === selectedAssignmentId)?.title}
            </p>

            {/* Selected files list */}
            {selectedFiles.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedFiles.map((f, i) => (
                  <Badge
                    key={`${f.name}-${i}`}
                    className="bg-blue-50 text-blue-700 border border-blue-200 text-xs"
                  >
                    {f.name}
                  </Badge>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                className="flex-1 border-2 border-dashed border-slate-200 rounded-lg p-4 text-center cursor-pointer hover:border-blue-400 transition-colors"
                onClick={() => fileInputRef.current?.click()}
                data-ocid="assignments.dropzone"
              >
                <p className="text-sm text-slate-500">
                  {selectedFiles.length > 0
                    ? "Add more files"
                    : "Click to select files (PDF, Word, Images)"}
                </p>
              </button>
              <Button
                variant="outline"
                className="h-auto px-4"
                onClick={() => setScannerOpen(true)}
                title="Scan document with camera"
                data-ocid="assignments.upload_button"
              >
                <Camera size={18} />
              </Button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              className="hidden"
              onChange={(e) =>
                setSelectedFiles((prev) => [
                  ...prev,
                  ...Array.from(e.target.files ?? []),
                ])
              }
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setSubmitOpen(false)}
                disabled={submitting}
                data-ocid="assignments.cancel_button"
              >
                Cancel
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700"
                onClick={handleSubmit}
                disabled={selectedFiles.length === 0 || submitting}
                data-ocid="assignments.submit_button"
              >
                {submitting ? "Submitting..." : "Submit"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Document Scanner */}
      <DocumentScanner
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onCapture={handleScanCapture}
        title="Scan Assignment Document"
        acceptedTypes="image/*,application/pdf"
      />
    </div>
  );
}
