import { Camera, FileText, Printer } from "lucide-react";
import { useState } from "react";
import { DocumentScanner } from "../../components/DocumentScanner";
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
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Textarea } from "../../components/ui/textarea";
import {
  type DocRequest,
  getLocalDocRequests,
  saveLocalDocRequests,
} from "../../utils/sampleData";

const DOC_TYPES = [
  "Official Transcript",
  "Attestation Letter",
  "Certificate of Enrollment",
  "Recommendation Letter",
];

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  processing: "bg-blue-100 text-blue-700",
  ready: "bg-green-100 text-green-700",
  collected: "bg-slate-100 text-slate-600",
};

interface Props {
  studentMatric: string;
  studentName: string;
}

export function DocumentRequests({ studentMatric, studentName }: Props) {
  const [requests, setRequests] = useState<DocRequest[]>(getLocalDocRequests());
  const [showDialog, setShowDialog] = useState(false);
  const [printDoc, setPrintDoc] = useState<DocRequest | null>(null);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [attachedDoc, setAttachedDoc] = useState<{
    file: File;
    previewUrl: string;
  } | null>(null);
  const [form, setForm] = useState({ requestType: "", purpose: "" });

  const myRequests = requests.filter((r) => r.studentMatric === studentMatric);

  const submit = () => {
    if (!form.requestType || !form.purpose.trim()) return;
    const newReq: DocRequest = {
      id: `DOC-${Date.now()}`,
      studentMatric,
      studentName,
      requestType: form.requestType,
      purpose: form.purpose.trim(),
      status: "pending",
      submittedAt: new Date().toISOString().split("T")[0],
      note: attachedDoc
        ? `Supporting document attached: ${attachedDoc.file.name}`
        : "",
    };
    const updated = [...requests, newReq];
    setRequests(updated);
    saveLocalDocRequests(updated);
    setForm({ requestType: "", purpose: "" });
    setAttachedDoc(null);
    setShowDialog(false);
  };

  const handlePrint = (doc: DocRequest) => {
    setPrintDoc(doc);
    setTimeout(() => window.print(), 300);
  };

  const handleScanCapture = (file: File, previewUrl: string) => {
    setAttachedDoc({ file, previewUrl });
    setScannerOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Document Requests</h1>
        <Button
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => setShowDialog(true)}
          data-ocid="documents.open_modal_button"
        >
          <FileText size={16} className="mr-2" /> New Request
        </Button>
      </div>

      {myRequests.length === 0 ? (
        <Card>
          <CardContent
            className="p-8 text-center text-slate-400"
            data-ocid="documents.empty_state"
          >
            No document requests submitted yet.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {myRequests.map((req, i) => (
            <Card key={req.id} data-ocid={`documents.item.${i + 1}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-slate-800">
                      {req.requestType}
                    </p>
                    <p className="text-sm text-slate-500 mt-0.5">
                      Purpose: {req.purpose}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Submitted: {req.submittedAt}
                    </p>
                    {req.note && (
                      <p className="text-xs text-blue-600 mt-1">
                        📋 {req.note}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge className={`border-0 ${statusColors[req.status]}`}>
                      {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                    </Badge>
                    {req.status === "ready" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-green-700 border-green-300"
                        onClick={() => handlePrint(req)}
                        data-ocid={`documents.secondary_button.${i + 1}`}
                      >
                        <Printer size={14} className="mr-1" /> Print
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* New Request Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent data-ocid="documents.dialog">
          <DialogHeader>
            <DialogTitle>Request a Document</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Document Type</Label>
              <Select
                value={form.requestType}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, requestType: v }))
                }
              >
                <SelectTrigger data-ocid="documents.select">
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  {DOC_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Purpose</Label>
              <Textarea
                placeholder="State the purpose of this request..."
                value={form.purpose}
                onChange={(e) =>
                  setForm((f) => ({ ...f, purpose: e.target.value }))
                }
                rows={3}
                data-ocid="documents.textarea"
              />
            </div>

            {/* Supporting document attachment */}
            <div>
              <Label>Supporting Document (optional)</Label>
              {attachedDoc ? (
                <div className="mt-2 flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  {attachedDoc.file.type === "application/pdf" ? (
                    <FileText
                      size={20}
                      className="text-blue-500 flex-shrink-0"
                    />
                  ) : (
                    <img
                      src={attachedDoc.previewUrl}
                      alt="Attached"
                      className="w-10 h-10 object-cover rounded border"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-green-700 truncate">
                      {attachedDoc.file.name}
                    </p>
                    <p className="text-xs text-green-600">
                      {(attachedDoc.file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-500 h-7 px-2"
                    onClick={() => setAttachedDoc(null)}
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => setScannerOpen(true)}
                  data-ocid="documents.upload_button"
                >
                  <Camera size={14} className="mr-2" />
                  Scan or Upload Document
                </Button>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDialog(false)}
              data-ocid="documents.cancel_button"
            >
              Cancel
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={submit}
              disabled={!form.requestType || !form.purpose.trim()}
              data-ocid="documents.submit_button"
            >
              Submit Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Document Scanner */}
      <DocumentScanner
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onCapture={handleScanCapture}
        title="Attach Supporting Document"
      />

      {/* Print preview (hidden until print) */}
      {printDoc && (
        <div className="hidden print:block fixed inset-0 bg-white p-12 z-[9999]">
          <div className="text-center border-b-2 border-slate-800 pb-4 mb-6">
            <h1 className="text-2xl font-bold">
              Federal University UniDigital
            </h1>
            <p className="text-slate-600">Office of the Registrar</p>
          </div>
          <div className="mb-6 text-right">
            <p className="text-sm">
              Date:{" "}
              {new Date().toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
          <h2 className="text-xl font-bold text-center mb-6 uppercase underline">
            {printDoc.requestType}
          </h2>
          <div className="mb-4 space-y-1 text-sm">
            <p>
              <strong>Student Name:</strong> {printDoc.studentName}
            </p>
            <p>
              <strong>Matric Number:</strong> {printDoc.studentMatric}
            </p>
            <p>
              <strong>Purpose:</strong> {printDoc.purpose}
            </p>
          </div>
          <p className="text-sm leading-relaxed mt-4">
            This is to certify that the above-named student is a bona fide
            student of this institution. This document has been issued on
            request for the purpose stated above.
          </p>
          <div className="mt-16">
            <p className="text-sm">_________________________</p>
            <p className="text-sm font-semibold">The Registrar</p>
            <p className="text-sm text-slate-600">
              Federal University UniDigital
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
