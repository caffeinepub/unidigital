import { useActor } from "@caffeineai/core-infrastructure";
import { Download, Eye, FileText, Filter, Loader2, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { createActor } from "../../backend";
import { Badge } from "../../components/ui/badge";

interface DocumentRecord {
  id: string;
  title: string;
  documentType: string;
  blobId: string;
  uploaderPrincipal: string;
  uploaderName: string;
  linkedRecordId: string;
  linkedRecordType: string;
  uploadedAt: bigint;
  notes: string;
  // legacy compat fields
  type?: string;
  studentMatric?: string;
  studentName?: string;
  fileName?: string;
  fileUrl?: string;
  status?: "pending" | "verified" | "rejected";
}
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";

const DOC_TYPE_COLORS: Record<string, string> = {
  admission: "bg-blue-100 text-blue-700",
  assignment: "bg-purple-100 text-purple-700",
  "ca-score": "bg-amber-100 text-amber-700",
  "exam-result": "bg-green-100 text-green-700",
  transcript: "bg-teal-100 text-teal-700",
  clearance: "bg-pink-100 text-pink-700",
  profile: "bg-orange-100 text-orange-700",
  other: "bg-slate-100 text-slate-600",
};

// Sample documents to show before backend loads
const SAMPLE_DOCS: DocumentRecord[] = [
  {
    id: "doc-001",
    title: "O'Level Results – Amara Okonkwo",
    documentType: "admission",
    blobId: "demo_admission_001",
    uploaderPrincipal: "2vxsx-fae",
    uploaderName: "Amara Okonkwo",
    linkedRecordId: "CSC/2021/001",
    linkedRecordType: "admission",
    uploadedAt: BigInt(Date.now() - 86400000 * 5),
    notes: "WAEC certificate scan",
  },
  {
    id: "doc-002",
    title: "CA Score Sheet – MTH 201",
    documentType: "ca-score",
    blobId: "demo_ca_002",
    uploaderPrincipal: "lecturer-principal",
    uploaderName: "Dr. Emeka Okafor",
    linkedRecordId: "MTH201-2023-first",
    linkedRecordType: "ca-score",
    uploadedAt: BigInt(Date.now() - 86400000 * 2),
    notes: "Mid-semester CA score sheet",
  },
  {
    id: "doc-003",
    title: "Exam Script – CSC 301",
    documentType: "exam-result",
    blobId: "demo_exam_003",
    uploaderPrincipal: "lecturer-principal",
    uploaderName: "Prof. Adaobi Nwosu",
    linkedRecordId: "CSC301-2023-first",
    linkedRecordType: "exam-result",
    uploadedAt: BigInt(Date.now() - 86400000),
    notes: "Final exam script scan",
  },
  {
    id: "doc-004",
    title: "Clearance Stamp – Bursary",
    documentType: "clearance",
    blobId: "demo_clearance_004",
    uploaderPrincipal: "admin-principal",
    uploaderName: "Administrator",
    linkedRecordId: "CSC/2021/001",
    linkedRecordType: "clearance",
    uploadedAt: BigInt(Date.now() - 3600000),
    notes: "Bursary clearance signed form",
  },
];

export function DocumentsScansAdmin() {
  const { actor } = useActor(createActor);
  const [docs, setDocs] = useState<DocumentRecord[]>(SAMPLE_DOCS);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  useEffect(() => {
    if (!actor) return;
    setLoading(true);
    (actor as any)
      .listAllDocuments()
      .then((result) => {
        if (result.length > 0) setDocs(result);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [actor]);

  const filtered = docs.filter((d) => {
    const matchSearch =
      !searchQuery ||
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.uploaderName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchType = typeFilter === "all" || d.documentType === typeFilter;
    return matchSearch && matchType;
  });

  const handleView = (doc: DocumentRecord) => {
    if (doc.blobId.startsWith("demo_")) {
      alert(
        "This document was uploaded in demo mode and cannot be retrieved. In production, this would open the scanned file.",
      );
      return;
    }
    window.open(doc.blobId, "_blank");
  };

  const typeCounts = docs.reduce(
    (acc, d) => {
      acc[d.documentType] = (acc[d.documentType] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Documents & Scans</h1>
        <p className="text-slate-500 text-sm mt-1">
          All uploaded and scanned documents across the institution.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          ["Total Documents", docs.length, "text-blue-600"],
          ["Admission", typeCounts.admission ?? 0, "text-purple-600"],
          [
            "Exam/CA Sheets",
            (typeCounts["ca-score"] ?? 0) + (typeCounts["exam-result"] ?? 0),
            "text-amber-600",
          ],
          ["Clearance", typeCounts.clearance ?? 0, "text-green-600"],
        ].map(([label, val, color]) => (
          <Card key={label as string}>
            <CardContent className="p-4">
              <p className="text-xs text-slate-500">{label}</p>
              <p className={`text-2xl font-bold mt-1 ${color}`}>{val}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Filter size={16} />
            Filter Documents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <Input
                placeholder="Search by title or uploader..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                data-ocid="docs.search_input"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48" data-ocid="docs.select">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="admission">Admission</SelectItem>
                <SelectItem value="assignment">Assignment</SelectItem>
                <SelectItem value="ca-score">CA Score</SelectItem>
                <SelectItem value="exam-result">Exam Result</SelectItem>
                <SelectItem value="transcript">Transcript</SelectItem>
                <SelectItem value="clearance">Clearance</SelectItem>
                <SelectItem value="profile">Profile</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Documents table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div
              className="flex items-center justify-center py-12"
              data-ocid="docs.loading_state"
            >
              <Loader2 size={24} className="animate-spin text-blue-500 mr-2" />
              <span className="text-slate-500">Loading documents...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table data-ocid="docs.table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Uploaded By</TableHead>
                    <TableHead>Linked Record</TableHead>
                    <TableHead>Uploaded</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center text-slate-400 py-10"
                        data-ocid="docs.empty_state"
                      >
                        <FileText
                          size={40}
                          className="mx-auto mb-2 opacity-30"
                        />
                        No documents found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((doc, i) => (
                      <TableRow key={doc.id} data-ocid={`docs.row.${i + 1}`}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <FileText
                              size={14}
                              className="text-slate-400 flex-shrink-0"
                            />
                            <span className="text-sm font-medium">
                              {doc.title}
                            </span>
                          </div>
                          {doc.notes && (
                            <p className="text-xs text-slate-400 mt-0.5 ml-5">
                              {doc.notes}
                            </p>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={`border-0 text-xs ${
                              DOC_TYPE_COLORS[doc.documentType] ??
                              DOC_TYPE_COLORS.other
                            }`}
                          >
                            {doc.documentType}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {doc.uploaderName}
                        </TableCell>
                        <TableCell>
                          <p className="text-xs font-mono text-slate-500">
                            {doc.linkedRecordId || "—"}
                          </p>
                          {doc.linkedRecordType && (
                            <p className="text-xs text-slate-400">
                              {doc.linkedRecordType}
                            </p>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-slate-500">
                          {new Date(Number(doc.uploadedAt)).toLocaleDateString(
                            "en-GB",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            },
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleView(doc)}
                            data-ocid={`docs.edit_button.${i + 1}`}
                          >
                            <Eye size={13} className="mr-1" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
