import { FileText, Search } from "lucide-react";
import { useState } from "react";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { getLocalStudents } from "../../utils/sampleData";
import { AcademicTranscript } from "../student/AcademicTranscript";

interface TranscriptRequest {
  id: string;
  matric: string;
  requestedAt: string;
  status: "pending" | "issued";
  issuedAt?: string;
}

function loadRequests(): TranscriptRequest[] {
  return JSON.parse(localStorage.getItem("transcriptRequests") || "[]");
}
function saveRequests(data: TranscriptRequest[]) {
  localStorage.setItem("transcriptRequests", JSON.stringify(data));
}

export function TranscriptAdmin() {
  const students = getLocalStudents();
  const [search, setSearch] = useState("");
  const [selectedMatric, setSelectedMatric] = useState<string | null>(null);
  const [requests, setRequests] = useState<TranscriptRequest[]>(loadRequests);

  const updateRequests = (data: TranscriptRequest[]) => {
    saveRequests(data);
    setRequests(data);
  };

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.matricNumber.toLowerCase().includes(search.toLowerCase()),
  );

  const selectedStudent = students.find(
    (s) => s.matricNumber === selectedMatric,
  );

  const markIssued = (id: string) => {
    updateRequests(
      requests.map((r) =>
        r.id === id
          ? { ...r, status: "issued", issuedAt: new Date().toISOString() }
          : r,
      ),
    );
  };

  if (selectedStudent) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedMatric(null)}
            data-ocid="transcript.back_button"
          >
            ← Back to List
          </Button>
          <div>
            <h1 className="text-xl font-bold text-slate-800">
              Transcript: {selectedStudent.name}
            </h1>
            <p className="text-slate-500 text-sm">
              {selectedStudent.matricNumber} &bull; {selectedStudent.department}
            </p>
          </div>
        </div>
        <AcademicTranscript
          userEmail={selectedStudent.email}
          userName={selectedStudent.name}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Transcript Management
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Generate, view, and manage student official academic transcripts.
        </p>
      </div>

      {/* Student Search */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Generate Transcript</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <Input
              className="pl-9"
              placeholder="Search student by name or matric number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              data-ocid="transcript.search_input"
            />
          </div>
          {search.trim() && (
            <div className="border rounded-lg overflow-hidden">
              {filteredStudents.slice(0, 8).map((s) => (
                <div
                  key={s.matricNumber}
                  className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 border-b last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium">{s.name}</p>
                    <p className="text-xs text-slate-500">
                      {s.matricNumber} &bull; {s.department}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => {
                      setSelectedMatric(s.matricNumber);
                      setSearch("");
                    }}
                    data-ocid="transcript.primary_button"
                  >
                    <FileText size={14} className="mr-1" /> View Transcript
                  </Button>
                </div>
              ))}
              {filteredStudents.length === 0 && (
                <p className="px-4 py-3 text-sm text-slate-400">
                  No students found.
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transcript Requests */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Transcript Requests (
            {requests.filter((r) => r.status === "pending").length} pending)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {requests.length === 0 && (
            <p
              className="px-4 py-8 text-center text-slate-400 text-sm"
              data-ocid="transcript.empty_state"
            >
              No transcript requests yet.
            </p>
          )}
          <div className="divide-y">
            {requests.map((req, i) => {
              const stu = students.find((s) => s.matricNumber === req.matric);
              return (
                <div
                  key={req.id}
                  className="flex items-center justify-between px-4 py-3"
                  data-ocid={`transcript.request.item.${i + 1}`}
                >
                  <div>
                    <p className="text-sm font-medium">
                      {stu?.name || req.matric}
                    </p>
                    <p className="text-xs text-slate-500">
                      {req.matric} &bull; Requested{" "}
                      {new Date(req.requestedAt).toLocaleDateString()}
                    </p>
                    {req.issuedAt && (
                      <p className="text-xs text-green-600">
                        Issued {new Date(req.issuedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      className={
                        req.status === "issued"
                          ? "bg-green-100 text-green-700 border-0"
                          : "bg-amber-100 text-amber-700 border-0"
                      }
                    >
                      {req.status}
                    </Badge>
                    {req.status === "pending" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => markIssued(req.id)}
                        data-ocid="transcript.save_button"
                      >
                        Mark as Issued
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedMatric(req.matric)}
                      data-ocid="transcript.secondary_button"
                    >
                      View
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
