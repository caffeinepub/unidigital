import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState } from "react";
import { downloadCSV } from "../../utils/csvUtils";
import {
  type DocumentArchiveEntry,
  getDocumentArchive,
  saveDocumentArchive,
  simulateAIExtraction,
} from "../../utils/registrationUtils";

const SOURCE_LABELS: Record<string, string> = {
  ai_scan: "AI Scan",
  bulk_csv: "Bulk CSV",
  ai_bulk_upload: "AI Bulk Upload",
  manual: "Manual",
};
const SOURCE_COLORS: Record<string, string> = {
  ai_scan: "bg-purple-100 text-purple-700",
  bulk_csv: "bg-blue-100 text-blue-700",
  ai_bulk_upload: "bg-indigo-100 text-indigo-700",
  manual: "bg-green-100 text-green-700",
};
const STATUS_COLORS: Record<string, string> = {
  extracted: "bg-green-100 text-green-700",
  pending: "bg-amber-100 text-amber-700",
  failed: "bg-red-100 text-red-700",
};

export function RegistrationDocumentArchive() {
  const [archive, setArchive] = useState<DocumentArchiveEntry[]>(
    getDocumentArchive(),
  );
  const [filterSource, setFilterSource] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDept, setFilterDept] = useState("");
  const [search, setSearch] = useState("");
  const [selectedDoc, setSelectedDoc] = useState<DocumentArchiveEntry | null>(
    null,
  );
  const [reExtracting, setReExtracting] = useState<string | null>(null);

  const filtered = archive.filter((d) => {
    if (filterSource !== "all" && d.sourceType !== filterSource) return false;
    if (filterStatus !== "all" && d.status !== filterStatus) return false;
    if (
      filterDept &&
      !d.extractedData.department
        ?.toLowerCase()
        .includes(filterDept.toLowerCase())
    )
      return false;
    if (
      search &&
      !d.studentMatric.toLowerCase().includes(search.toLowerCase()) &&
      !d.studentName.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    return true;
  });

  const handleReExtract = async (entry: DocumentArchiveEntry) => {
    setReExtracting(entry.id);
    await new Promise((r) => setTimeout(r, 1400));
    const { fields, confidenceScores } = simulateAIExtraction(
      entry.documentUrl.split("/").pop() || "doc.jpg",
    );
    const updated = archive.map((d) =>
      d.id === entry.id
        ? {
            ...d,
            extractedData: fields,
            confidenceScores,
            status: "extracted" as const,
          }
        : d,
    );
    setArchive(updated);
    saveDocumentArchive(updated);
    setReExtracting(null);
    if (selectedDoc?.id === entry.id)
      setSelectedDoc({
        ...selectedDoc,
        extractedData: fields,
        confidenceScores,
      });
  };

  const handleExport = () => {
    downloadCSV("registration_document_archive.csv", [
      [
        "ID",
        "Student Matric",
        "Student Name",
        "Source",
        "Document Type",
        "Status",
        "Uploaded At",
        ...Object.keys(filtered[0]?.extractedData || {}),
      ],
      ...filtered.map((d) => [
        d.id,
        d.studentMatric,
        d.studentName,
        d.sourceType,
        d.documentType,
        d.status,
        d.uploadedAt,
        ...Object.values(d.extractedData),
      ]),
    ]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Registration Document Archive
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            All uploaded registration documents with extracted data
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleExport}
          data-ocid="doc_archive.export_button"
        >
          📥 Export CSV
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          ["Total Docs", archive.length],
          ["AI Scan", archive.filter((d) => d.sourceType === "ai_scan").length],
          [
            "Bulk Upload",
            archive.filter(
              (d) =>
                d.sourceType === "ai_bulk_upload" ||
                d.sourceType === "bulk_csv",
            ).length,
          ],
          ["Extracted", archive.filter((d) => d.status === "extracted").length],
        ].map(([label, val]) => (
          <Card key={label as string}>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-slate-800">{val}</p>
              <p className="text-xs text-slate-400 mt-1">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4 flex flex-wrap gap-3">
          <Input
            placeholder="Search matric or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-48"
            data-ocid="doc_archive.search"
          />
          <Select value={filterSource} onValueChange={setFilterSource}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              <SelectItem value="ai_scan">AI Scan</SelectItem>
              <SelectItem value="bulk_csv">Bulk CSV</SelectItem>
              <SelectItem value="ai_bulk_upload">AI Bulk Upload</SelectItem>
              <SelectItem value="manual">Manual</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="extracted">Extracted</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
          <Input
            placeholder="Filter by department..."
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
            className="max-w-48"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Documents ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div
              className="text-center py-12 text-slate-400"
              data-ocid="doc_archive.empty_state"
            >
              <p className="text-4xl mb-3">📂</p>
              <p>
                No documents yet. Register students using AI Scan or Bulk
                Upload.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table data-ocid="doc_archive.table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Reg ID / Doc ID</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Uploaded</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((doc) => (
                    <TableRow
                      key={doc.id}
                      data-ocid={`doc_archive.row.${doc.id}`}
                    >
                      <TableCell className="font-mono text-xs text-blue-600">
                        {doc.id}
                      </TableCell>
                      <TableCell>
                        <p className="font-medium text-sm">{doc.studentName}</p>
                        <p className="text-xs text-slate-400 font-mono">
                          {doc.studentMatric}
                        </p>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`border-0 text-xs ${SOURCE_COLORS[doc.sourceType] || "bg-slate-100 text-slate-700"}`}
                        >
                          {SOURCE_LABELS[doc.sourceType] || doc.sourceType}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-slate-500">
                        {doc.documentType.replace(/_/g, " ")}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`border-0 text-xs ${STATUS_COLORS[doc.status] || "bg-slate-100 text-slate-600"}`}
                        >
                          {doc.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-slate-500">
                        {new Date(doc.uploadedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedDoc(doc)}
                            data-ocid={`doc_archive.view.${doc.id}`}
                          >
                            👁 View
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={reExtracting === doc.id}
                            onClick={() => handleReExtract(doc)}
                            data-ocid={`doc_archive.reextract.${doc.id}`}
                          >
                            {reExtracting === doc.id ? "..." : "🔄"}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View modal */}
      <Dialog
        open={!!selectedDoc}
        onOpenChange={(o) => !o && setSelectedDoc(null)}
      >
        <DialogContent
          className="max-w-2xl w-full"
          data-ocid="doc_archive.view_modal"
        >
          <DialogHeader>
            <DialogTitle>Document Details: {selectedDoc?.id}</DialogTitle>
          </DialogHeader>
          {selectedDoc && (
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-slate-700">
                  Document Preview
                </h3>
                {selectedDoc.documentUrl &&
                /\.(jpg|jpeg|png|gif)/.test(
                  selectedDoc.documentUrl.toLowerCase(),
                ) ? (
                  <img
                    src={selectedDoc.documentUrl}
                    alt="Document"
                    className="w-full rounded-lg border max-h-48 object-contain bg-slate-50"
                  />
                ) : (
                  <div className="w-full h-40 bg-slate-100 rounded-lg flex items-center justify-center">
                    <p className="text-slate-400 text-sm">
                      📄 {selectedDoc.documentType}
                    </p>
                  </div>
                )}
                <div className="text-xs text-slate-500 space-y-1">
                  <p>
                    <span className="font-medium">Source:</span>{" "}
                    {SOURCE_LABELS[selectedDoc.sourceType]}
                  </p>
                  <p>
                    <span className="font-medium">Status:</span>{" "}
                    {selectedDoc.status}
                  </p>
                  <p>
                    <span className="font-medium">Uploaded:</span>{" "}
                    {new Date(selectedDoc.uploadedAt).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-slate-700">
                  Extracted Fields
                </h3>
                <div className="space-y-2">
                  {Object.entries(selectedDoc.extractedData).map(
                    ([key, val]) => {
                      const conf = selectedDoc.confidenceScores[key];
                      return (
                        <div key={key} className="bg-slate-50 rounded-lg p-2">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-slate-400 capitalize">
                              {key.replace(/_/g, " ")}
                            </span>
                            {conf !== undefined && (
                              <Badge
                                className={`border-0 text-xs ${conf >= 0.85 ? "bg-green-100 text-green-700" : conf >= 0.65 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}
                              >
                                {Math.round(conf * 100)}%
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm font-medium text-slate-800 mt-0.5">
                            {val || "—"}
                          </p>
                        </div>
                      );
                    },
                  )}
                </div>
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => handleReExtract(selectedDoc)}
                  disabled={reExtracting === selectedDoc.id}
                >
                  {reExtracting === selectedDoc.id
                    ? "Re-extracting..."
                    : "🔄 Re-extract Data"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
