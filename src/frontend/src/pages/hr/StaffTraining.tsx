import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useRef, useState } from "react";

interface TrainingProgram {
  id: string;
  title: string;
  date: string;
  venue: string;
  maxParticipants: number;
  registrations: { staffName: string; attended: boolean }[];
}

const initialPrograms: TrainingProgram[] = [
  {
    id: "tp1",
    title: "Academic Writing & Research Methods",
    date: "2024-11-15",
    venue: "Conference Room A",
    maxParticipants: 30,
    registrations: [
      { staffName: "Dr. Emeka Obi", attended: true },
      { staffName: "Mrs. Fatima Bello", attended: false },
    ],
  },
  {
    id: "tp2",
    title: "Digital Pedagogy & e-Learning",
    date: "2024-12-05",
    venue: "ICT Lab 1",
    maxParticipants: 20,
    registrations: [{ staffName: "Prof. Ade Lawal", attended: true }],
  },
  {
    id: "tp3",
    title: "Leadership & Management Skills",
    date: "2025-01-20",
    venue: "Main Hall",
    maxParticipants: 50,
    registrations: [],
  },
];

function getMisName(): string {
  try {
    const s = JSON.parse(localStorage.getItem("institutionSettings") ?? "{}");
    const name: string = s.name ?? "UniDigital";
    return `${name
      .split(" ")
      .map((w: string) => w[0])
      .join("")
      .toUpperCase()} MIS`;
  } catch {
    return "FUEK MIS";
  }
}

export function StaffTraining() {
  const [programs, setPrograms] = useState<TrainingProgram[]>(initialPrograms);
  const [createOpen, setCreateOpen] = useState(false);
  const [viewProg, setViewProg] = useState<TrainingProgram | null>(null);
  const [certProg, setCertProg] = useState<{
    prog: TrainingProgram;
    staff: string;
  } | null>(null);
  const [form, setForm] = useState({
    title: "",
    date: "",
    venue: "",
    maxParticipants: "",
  });
  const printRef = useRef<HTMLDivElement>(null);

  const handleCreate = () => {
    if (!form.title || !form.date || !form.venue) return;
    setPrograms((prev) => [
      ...prev,
      {
        id: `tp${Date.now()}`,
        title: form.title,
        date: form.date,
        venue: form.venue,
        maxParticipants: Number(form.maxParticipants) || 20,
        registrations: [],
      },
    ]);
    setForm({ title: "", date: "", venue: "", maxParticipants: "" });
    setCreateOpen(false);
  };

  const toggleAttendance = (progId: string, staffName: string) => {
    setPrograms((prev) =>
      prev.map((p) =>
        p.id === progId
          ? {
              ...p,
              registrations: p.registrations.map((r) =>
                r.staffName === staffName ? { ...r, attended: !r.attended } : r,
              ),
            }
          : p,
      ),
    );
  };

  const handlePrintCert = () => {
    const content = printRef.current;
    if (!content) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(
      `<html><head><title>Certificate</title><style>body{font-family:serif;padding:60px;text-align:center}.border-cert{border:8px double #2563eb;padding:40px}</style></head><body><div class="border-cert">${content.innerHTML}</div></body></html>`,
    );
    w.document.close();
    w.print();
  };

  const misName = getMisName();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Staff Training & Development
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage training programs, attendance, and certifications
          </p>
        </div>
        <Button
          onClick={() => setCreateOpen(true)}
          data-ocid="training.open_modal_button"
        >
          + Create Program
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {programs.map((prog, idx) => (
          <Card key={prog.id} data-ocid={`training.item.${idx + 1}`}>
            <CardHeader>
              <CardTitle className="text-base">{prog.title}</CardTitle>
              <Badge variant="secondary">{prog.date}</Badge>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-slate-500">📍 {prog.venue}</p>
              <p className="text-sm">
                Participants: {prog.registrations.length} /{" "}
                {prog.maxParticipants}
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setViewProg(prog)}
                data-ocid={`training.secondary_button.${idx + 1}`}
              >
                View Registrations
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent data-ocid="training.dialog">
          <DialogHeader>
            <DialogTitle>Create Training Program</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Title</Label>
              <Input
                value={form.title}
                onChange={(e) =>
                  setForm((p) => ({ ...p, title: e.target.value }))
                }
                data-ocid="training.input"
              />
            </div>
            <div>
              <Label>Date</Label>
              <Input
                type="date"
                value={form.date}
                onChange={(e) =>
                  setForm((p) => ({ ...p, date: e.target.value }))
                }
                data-ocid="training.date.input"
              />
            </div>
            <div>
              <Label>Venue</Label>
              <Input
                value={form.venue}
                onChange={(e) =>
                  setForm((p) => ({ ...p, venue: e.target.value }))
                }
                data-ocid="training.venue.input"
              />
            </div>
            <div>
              <Label>Max Participants</Label>
              <Input
                type="number"
                value={form.maxParticipants}
                onChange={(e) =>
                  setForm((p) => ({ ...p, maxParticipants: e.target.value }))
                }
                data-ocid="training.max.input"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreateOpen(false)}
              data-ocid="training.cancel_button"
            >
              Cancel
            </Button>
            <Button onClick={handleCreate} data-ocid="training.confirm_button">
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!viewProg}
        onOpenChange={(o) => {
          if (!o) setViewProg(null);
        }}
      >
        <DialogContent
          className="max-w-2xl"
          data-ocid="training.registrations.dialog"
        >
          <DialogHeader>
            <DialogTitle>Registrations — {viewProg?.title}</DialogTitle>
          </DialogHeader>
          {(viewProg?.registrations.length ?? 0) === 0 ? (
            <p
              className="text-slate-400 text-sm text-center py-6"
              data-ocid="training.empty_state"
            >
              No registrations yet.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Staff Name</TableHead>
                  <TableHead>Attended</TableHead>
                  <TableHead>Certificate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {viewProg?.registrations.map((r, i) => (
                  <TableRow
                    key={`reg-${r.staffName}`}
                    data-ocid={`training.reg.item.${i + 1}`}
                  >
                    <TableCell>{r.staffName}</TableCell>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={r.attended}
                        onChange={() =>
                          viewProg && toggleAttendance(viewProg.id, r.staffName)
                        }
                        data-ocid={`training.checkbox.${i + 1}`}
                      />
                    </TableCell>
                    <TableCell>
                      {r.attended && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            viewProg &&
                            setCertProg({ prog: viewProg, staff: r.staffName })
                          }
                          data-ocid={`training.cert_button.${i + 1}`}
                        >
                          Generate Certificate
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          <DialogFooter>
            <Button
              onClick={() => setViewProg(null)}
              data-ocid="training.close_button"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!certProg}
        onOpenChange={(o) => {
          if (!o) setCertProg(null);
        }}
      >
        <DialogContent className="max-w-lg" data-ocid="training.cert.dialog">
          <DialogHeader>
            <DialogTitle>Completion Certificate</DialogTitle>
          </DialogHeader>
          <div
            ref={printRef}
            className="text-center space-y-4 p-4 border-4 border-double border-blue-600"
          >
            <p className="text-2xl font-bold">Certificate of Completion</p>
            <p className="text-slate-500">This certifies that</p>
            <p className="text-xl font-bold text-blue-700">{certProg?.staff}</p>
            <p className="text-slate-500">
              has successfully completed the training program
            </p>
            <p className="text-lg font-semibold">{certProg?.prog.title}</p>
            <p className="text-sm text-slate-400">
              held on {certProg?.prog.date} at {certProg?.prog.venue}
            </p>
            <p className="text-xs text-slate-400 mt-6">
              {misName} — {new Date().toLocaleDateString()}
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCertProg(null)}
              data-ocid="training.cert.cancel_button"
            >
              Close
            </Button>
            <Button
              onClick={handlePrintCert}
              data-ocid="training.cert.primary_button"
            >
              Print Certificate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
