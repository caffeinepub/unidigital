import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useState } from "react";

interface FundDrive {
  id: string;
  title: string;
  target: number;
  raised: number;
  deadline: string;
  description: string;
}

interface Pledge {
  driveId: string;
  amount: number;
  date: string;
}

const initialDrives: FundDrive[] = [
  {
    id: "d1",
    title: "Library Fund 2024",
    target: 5000000,
    raised: 1850000,
    deadline: "2024-12-31",
    description:
      "Expand the university library with modern books and digital resources for all faculties.",
  },
  {
    id: "d2",
    title: "Scholarship Endowment",
    target: 10000000,
    raised: 4200000,
    deadline: "2025-03-31",
    description:
      "Provide full scholarships to 10 outstanding students from underprivileged backgrounds annually.",
  },
  {
    id: "d3",
    title: "Sports Complex",
    target: 20000000,
    raised: 7500000,
    deadline: "2025-06-30",
    description:
      "Build a multi-purpose sports complex for student recreation and competitive sports training.",
  },
];

export function AlumniDonations() {
  const [drives, setDrives] = useState<FundDrive[]>(initialDrives);
  const [pledges, setPledges] = useState<Pledge[]>([]);
  const [amounts, setAmounts] = useState<Record<string, string>>({});

  const handlePledge = (driveId: string) => {
    const amount = Number.parseFloat(amounts[driveId] ?? "0");
    if (!amount || amount <= 0) return;
    setDrives((prev) =>
      prev.map((d) =>
        d.id === driveId ? { ...d, raised: d.raised + amount } : d,
      ),
    );
    setPledges((prev) => [
      ...prev,
      { driveId, amount, date: new Date().toISOString().split("T")[0] },
    ]);
    setAmounts((prev) => ({ ...prev, [driveId]: "" }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Alumni Donations</h1>
        <p className="text-slate-500 text-sm mt-1">
          Support your alma mater through active fund drives
        </p>
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
                <p className="text-sm text-slate-500">{drive.description}</p>
                <div>
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>₦{drive.raised.toLocaleString()} raised</span>
                    <span>{pct}%</span>
                  </div>
                  <Progress value={pct} />
                  <p className="text-xs text-slate-400 mt-1">
                    Target: ₦{drive.target.toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Enter amount ₦"
                    value={amounts[drive.id] ?? ""}
                    onChange={(e) =>
                      setAmounts((p) => ({ ...p, [drive.id]: e.target.value }))
                    }
                    data-ocid={`donations.input.${idx + 1}`}
                  />
                  <Button
                    size="sm"
                    onClick={() => handlePledge(drive.id)}
                    data-ocid={`donations.primary_button.${idx + 1}`}
                  >
                    Pledge
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>My Pledges</CardTitle>
        </CardHeader>
        <CardContent>
          {pledges.length === 0 ? (
            <p
              className="text-slate-400 text-sm text-center py-6"
              data-ocid="donations.empty_state"
            >
              You have not made any pledges yet.
            </p>
          ) : (
            <div className="space-y-2">
              {pledges.map((p, idx) => {
                const drive = drives.find((d) => d.id === p.driveId);
                return (
                  <div
                    key={`${p.driveId}-${p.date}-${p.amount}`}
                    className="flex justify-between items-center border rounded-lg px-4 py-2"
                    data-ocid={`donations.pledge.item.${idx + 1}`}
                  >
                    <span className="text-sm font-medium">{drive?.title}</span>
                    <span className="text-sm text-green-600 font-bold">
                      ₦{p.amount.toLocaleString()}
                    </span>
                    <span className="text-xs text-slate-400">{p.date}</span>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
