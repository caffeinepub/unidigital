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
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState } from "react";

interface FundDrive {
  id: string;
  title: string;
  target: number;
  raised: number;
  deadline: string;
  pledges: { donor: string; amount: number; date: string }[];
}

const initialDrives: FundDrive[] = [
  {
    id: "d1",
    title: "Library Fund 2024",
    target: 5000000,
    raised: 1850000,
    deadline: "2024-12-31",
    pledges: [
      { donor: "Dr. Emeka Obi", amount: 500000, date: "2024-09-01" },
      { donor: "Mrs. Fatima Bello", amount: 350000, date: "2024-09-10" },
    ],
  },
  {
    id: "d2",
    title: "Scholarship Endowment",
    target: 10000000,
    raised: 4200000,
    deadline: "2025-03-31",
    pledges: [
      { donor: "Prof. Ade Lawal", amount: 1000000, date: "2024-10-05" },
    ],
  },
  {
    id: "d3",
    title: "Sports Complex",
    target: 20000000,
    raised: 7500000,
    deadline: "2025-06-30",
    pledges: [
      { donor: "Eng. Yusuf Musa", amount: 2000000, date: "2024-08-20" },
    ],
  },
];

export function DonationsAdmin() {
  const [drives, setDrives] = useState<FundDrive[]>(initialDrives);
  const [newOpen, setNewOpen] = useState(false);
  const [selectedDrive, setSelectedDrive] = useState<FundDrive | null>(null);
  const [form, setForm] = useState({ title: "", target: "", deadline: "" });

  const handleCreate = () => {
    if (!form.title || !form.target) return;
    setDrives((prev) => [
      ...prev,
      {
        id: `d${Date.now()}`,
        title: form.title,
        target: Number(form.target),
        raised: 0,
        deadline: form.deadline,
        pledges: [],
      },
    ]);
    setForm({ title: "", target: "", deadline: "" });
    setNewOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Donations Management
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage fund drives and track alumni pledges
          </p>
        </div>
        <Button
          onClick={() => setNewOpen(true)}
          data-ocid="donations.open_modal_button"
        >
          + New Drive
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {drives.map((drive, idx) => {
          const pct = Math.min(
            100,
            Math.round((drive.raised / drive.target) * 100),
          );
          return (
            <Card key={drive.id} data-ocid={`donations.item.${idx + 1}`}>
              <CardHeader>
                <CardTitle className="text-base">{drive.title}</CardTitle>
                <Badge variant="secondary">Deadline: {drive.deadline}</Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                <Progress value={pct} />
                <div className="flex justify-between text-xs">
                  <span>
                    ₦{drive.raised.toLocaleString()} / ₦
                    {drive.target.toLocaleString()}
                  </span>
                  <span className="font-bold">{pct}%</span>
                </div>
                <p className="text-sm text-slate-500">
                  {drive.pledges.length} pledge
                  {drive.pledges.length !== 1 ? "s" : ""}
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedDrive(drive)}
                  data-ocid={`donations.secondary_button.${idx + 1}`}
                >
                  View Pledges
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogContent data-ocid="donations.dialog">
          <DialogHeader>
            <DialogTitle>Create New Fund Drive</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Title</Label>
              <Input
                value={form.title}
                onChange={(e) =>
                  setForm((p) => ({ ...p, title: e.target.value }))
                }
                data-ocid="donations.input"
              />
            </div>
            <div>
              <Label>Target Amount (₦)</Label>
              <Input
                type="number"
                value={form.target}
                onChange={(e) =>
                  setForm((p) => ({ ...p, target: e.target.value }))
                }
                data-ocid="donations.target.input"
              />
            </div>
            <div>
              <Label>Deadline</Label>
              <Input
                type="date"
                value={form.deadline}
                onChange={(e) =>
                  setForm((p) => ({ ...p, deadline: e.target.value }))
                }
                data-ocid="donations.deadline.input"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setNewOpen(false)}
              data-ocid="donations.cancel_button"
            >
              Cancel
            </Button>
            <Button onClick={handleCreate} data-ocid="donations.confirm_button">
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!selectedDrive}
        onOpenChange={(o) => {
          if (!o) setSelectedDrive(null);
        }}
      >
        <DialogContent
          className="max-w-2xl"
          data-ocid="donations.pledges.dialog"
        >
          <DialogHeader>
            <DialogTitle>Pledges — {selectedDrive?.title}</DialogTitle>
          </DialogHeader>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Donor</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(selectedDrive?.pledges ?? []).map((p, i) => (
                <TableRow
                  key={`${p.donor}-${i}`}
                  data-ocid={`donations.pledge.item.${i + 1}`}
                >
                  <TableCell>{p.donor}</TableCell>
                  <TableCell>₦{p.amount.toLocaleString()}</TableCell>
                  <TableCell>{p.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <DialogFooter>
            <Button
              onClick={() => setSelectedDrive(null)}
              data-ocid="donations.close_button"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
