import { ClipboardList, Download, Trash2, Upload } from "lucide-react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import type { ScoreAuditLog as ScoreAuditLogType } from "../../utils/sampleData";
import {
  getLocalScoreAuditLogs,
  saveLocalScoreAuditLogs,
} from "../../utils/sampleData";

export function ScoreAuditLog() {
  const [logs, setLogs] = useState<ScoreAuditLogType[]>(getLocalScoreAuditLogs);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);

  const handleClear = () => {
    saveLocalScoreAuditLogs([]);
    setLogs([]);
    setClearDialogOpen(false);
    toast.success("Audit log cleared.");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Score Audit Log</h1>
          <p className="text-slate-500 text-sm mt-1">
            Track all score sheet downloads and CSV upload events.
          </p>
        </div>
        {logs.length > 0 && (
          <Button
            variant="outline"
            className="text-red-600 border-red-200 hover:bg-red-50"
            onClick={() => setClearDialogOpen(true)}
            data-ocid="audit.open_modal_button"
          >
            <Trash2 size={14} className="mr-2" /> Clear Log
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ClipboardList size={16} className="text-blue-600" />
            Activity Log ({logs.length} entries)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {logs.length === 0 ? (
            <div
              className="p-12 text-center text-slate-400"
              data-ocid="audit.empty_state"
            >
              <ClipboardList size={40} className="mx-auto mb-3 opacity-30" />
              <p className="font-medium">No audit events yet.</p>
              <p className="text-sm mt-1">
                Events will appear here when lecturers download or upload score
                sheets.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Semester</TableHead>
                    <TableHead>Performed By</TableHead>
                    <TableHead className="text-center">Records</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log, i) => (
                    <TableRow
                      key={log.id}
                      className="hover:bg-slate-50"
                      data-ocid={`audit.item.${i + 1}`}
                    >
                      <TableCell className="text-xs text-slate-500 font-mono">
                        {new Date(log.timestamp).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {log.action === "upload_scores" ? (
                          <Badge className="bg-green-100 text-green-700 text-xs">
                            <Upload size={10} className="mr-1" /> Upload Scores
                          </Badge>
                        ) : (
                          <Badge className="bg-blue-100 text-blue-700 text-xs">
                            <Download size={10} className="mr-1" /> Download
                            Template
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-blue-600 text-sm">
                        {log.courseCode}
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">
                        {log.semester}
                      </TableCell>
                      <TableCell className="text-sm">
                        {log.performedBy}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="text-xs">
                          {log.recordCount}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Clear Confirmation */}
      <Dialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
        <DialogContent data-ocid="audit.modal">
          <DialogHeader>
            <DialogTitle>Clear Audit Log?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-600">
            This will permanently delete all {logs.length} audit log entries.
            This action cannot be undone.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setClearDialogOpen(false)}
              data-ocid="audit.cancel_button"
            >
              Cancel
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700"
              onClick={handleClear}
              data-ocid="audit.confirm_button"
            >
              Clear All
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
