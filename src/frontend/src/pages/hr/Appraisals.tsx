import { useState } from "react";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import { Textarea } from "../../components/ui/textarea";

type AppraisalStatus = "submitted" | "reviewed" | "finalized";

interface Appraisal {
  id: string;
  staffName: string;
  department: string;
  cycle: string;
  period: string;
  status: AppraisalStatus;
  score?: number;
  comment?: string;
  reviewer?: string;
}

const initial: Appraisal[] = [
  {
    id: "AP001",
    staffName: "Dr. Chukwu Emmanuel",
    department: "Computer Science",
    cycle: "2025 Annual",
    period: "Jan–Dec 2025",
    status: "submitted",
  },
  {
    id: "AP002",
    staffName: "Prof. Adewale Obi",
    department: "Engineering",
    cycle: "2025 Annual",
    period: "Jan–Dec 2025",
    status: "reviewed",
    score: 4,
    comment: "Excellent research output and student engagement.",
    reviewer: "Head of Engineering",
  },
  {
    id: "AP003",
    staffName: "Mrs. Fatima Bello",
    department: "Business Admin",
    cycle: "2025 Mid-Year",
    period: "Jan–Jun 2025",
    status: "finalized",
    score: 3,
    comment: "Meets expectations.",
    reviewer: "HR Director",
  },
  {
    id: "AP004",
    staffName: "Mr. Emeka Osei",
    department: "Law",
    cycle: "2025 Annual",
    period: "Jan–Dec 2025",
    status: "submitted",
  },
  {
    id: "AP005",
    staffName: "Dr. Ngozi Adeleke",
    department: "Medicine",
    cycle: "2025 Annual",
    period: "Jan–Dec 2025",
    status: "reviewed",
    score: 5,
    comment: "Outstanding clinical contributions and mentorship.",
    reviewer: "Dean of Medicine",
  },
  {
    id: "AP006",
    staffName: "Mr. Babatunde Lawal",
    department: "Education",
    cycle: "2025 Mid-Year",
    period: "Jan–Jun 2025",
    status: "finalized",
    score: 4,
    comment: "Strong curriculum development.",
    reviewer: "HR Director",
  },
];

const statusStyle: Record<AppraisalStatus, string> = {
  submitted: "bg-amber-100 text-amber-700",
  reviewed: "bg-blue-100 text-blue-700",
  finalized: "bg-green-100 text-green-700",
};

const scoreLabel = ["Poor", "Below Average", "Average", "Good", "Outstanding"];

export function Appraisals() {
  const [appraisals, setAppraisals] = useState<Appraisal[]>(initial);
  const [reviewTarget, setReviewTarget] = useState<Appraisal | null>(null);
  const [reviewForm, setReviewForm] = useState({
    reviewer: "",
    score: "4",
    comment: "",
  });

  const openReview = (a: Appraisal) => {
    setReviewTarget(a);
    setReviewForm({
      reviewer: a.reviewer ?? "",
      score: String(a.score ?? 4),
      comment: a.comment ?? "",
    });
  };

  const submitReview = () => {
    if (!reviewTarget) return;
    setAppraisals((prev) =>
      prev.map((a) =>
        a.id === reviewTarget.id
          ? {
              ...a,
              status: "reviewed",
              score: +reviewForm.score,
              comment: reviewForm.comment,
              reviewer: reviewForm.reviewer,
            }
          : a,
      ),
    );
    setReviewTarget(null);
  };

  const finalize = (id: string) => {
    setAppraisals((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "finalized" } : a)),
    );
  };

  const renderTable = (rows: Appraisal[]) => (
    <Card>
      <CardContent className="p-0">
        <Table data-ocid="appraisals.table">
          <TableHeader>
            <TableRow>
              <TableHead>Staff Name</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Cycle</TableHead>
              <TableHead>Period</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-8 text-slate-400"
                  data-ocid="appraisals.empty_state"
                >
                  No appraisals in this category.
                </TableCell>
              </TableRow>
            )}
            {rows.map((a, i) => (
              <TableRow key={a.id} data-ocid={`appraisals.item.${i + 1}`}>
                <TableCell className="font-medium">{a.staffName}</TableCell>
                <TableCell className="text-slate-500">{a.department}</TableCell>
                <TableCell>{a.cycle}</TableCell>
                <TableCell className="text-slate-500 text-sm">
                  {a.period}
                </TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${statusStyle[a.status]}`}
                  >
                    {a.status}
                  </span>
                </TableCell>
                <TableCell>
                  {a.score !== undefined ? (
                    <span className="font-semibold text-blue-600">
                      {a.score}/5 — {scoreLabel[a.score - 1]}
                    </span>
                  ) : (
                    <span className="text-slate-400 text-xs">Not reviewed</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {a.status === "submitted" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openReview(a)}
                        data-ocid={`appraisals.edit_button.${i + 1}`}
                      >
                        Review
                      </Button>
                    )}
                    {a.status === "reviewed" && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openReview(a)}
                          data-ocid={`appraisals.edit_button.${i + 1}`}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => finalize(a.id)}
                          data-ocid={`appraisals.confirm_button.${i + 1}`}
                        >
                          Finalize
                        </Button>
                      </>
                    )}
                    {a.status === "finalized" && (
                      <Badge className="bg-green-100 text-green-700 border-0">
                        Done
                      </Badge>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Staff Appraisals</h1>
        <p className="text-slate-500 text-sm">
          {appraisals.length} appraisal submissions
        </p>
      </div>

      <Tabs defaultValue="all" data-ocid="appraisals.tab">
        <TabsList>
          <TabsTrigger value="all" data-ocid="appraisals.tab">
            All ({appraisals.length})
          </TabsTrigger>
          <TabsTrigger value="pending" data-ocid="appraisals.tab">
            Pending Review (
            {appraisals.filter((a) => a.status === "submitted").length})
          </TabsTrigger>
          <TabsTrigger value="finalized" data-ocid="appraisals.tab">
            Finalized (
            {appraisals.filter((a) => a.status === "finalized").length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-4">
          {renderTable(appraisals)}
        </TabsContent>
        <TabsContent value="pending" className="mt-4">
          {renderTable(appraisals.filter((a) => a.status === "submitted"))}
        </TabsContent>
        <TabsContent value="finalized" className="mt-4">
          {renderTable(appraisals.filter((a) => a.status === "finalized"))}
        </TabsContent>
      </Tabs>

      {/* Review modal */}
      <Dialog
        open={!!reviewTarget}
        onOpenChange={(open) => !open && setReviewTarget(null)}
      >
        <DialogContent data-ocid="appraisals.dialog">
          <DialogHeader>
            <DialogTitle>
              Review Appraisal — {reviewTarget?.staffName}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Reviewer Name</Label>
              <Input
                className="mt-1"
                placeholder="e.g. HR Director"
                value={reviewForm.reviewer}
                onChange={(e) =>
                  setReviewForm((f) => ({ ...f, reviewer: e.target.value }))
                }
                data-ocid="appraisals.input"
              />
            </div>
            <div>
              <Label>Score (1–5)</Label>
              <Select
                value={reviewForm.score}
                onValueChange={(v) =>
                  setReviewForm((f) => ({ ...f, score: v }))
                }
              >
                <SelectTrigger className="mt-1" data-ocid="appraisals.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n} — {scoreLabel[n - 1]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Comment</Label>
              <Textarea
                className="mt-1"
                rows={4}
                placeholder="Provide detailed feedback..."
                value={reviewForm.comment}
                onChange={(e) =>
                  setReviewForm((f) => ({ ...f, comment: e.target.value }))
                }
                data-ocid="appraisals.textarea"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setReviewTarget(null)}
              data-ocid="appraisals.cancel_button"
            >
              Cancel
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={submitReview}
              data-ocid="appraisals.submit_button"
            >
              Submit Review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
