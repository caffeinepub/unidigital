import { GitMerge, Plus, Trash2 } from "lucide-react";
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
import type { CombinedCourse } from "../../utils/sampleData";
import {
  getLocalCombinedCourses,
  getLocalCourses,
  saveLocalCombinedCourses,
} from "../../utils/sampleData";

function blankForm(): Omit<CombinedCourse, "id"> {
  return {
    combinationCode: "",
    title: "",
    componentA: "",
    componentB: "",
    programme: "NCE",
    level: "200",
    weightA: 50,
    weightB: 50,
  };
}

export function CombinationCourses() {
  const [combinations, setCombinations] = useState<CombinedCourse[]>(
    getLocalCombinedCourses,
  );
  const courses = getLocalCourses();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(blankForm());
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const setF = (key: keyof typeof form, val: string | number) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const save = () => {
    if (!form.combinationCode || !form.componentA || !form.componentB) {
      toast.error("Please fill all required fields.");
      return;
    }
    if (form.weightA + form.weightB !== 100) {
      toast.error("Weights must add up to 100.");
      return;
    }
    const newEntry: CombinedCourse = {
      ...form,
      id: `COMB-${Date.now()}`,
    };
    const updated = [...combinations, newEntry];
    saveLocalCombinedCourses(updated);
    setCombinations(updated);
    setDialogOpen(false);
    setForm(blankForm());
    toast.success("Combination course added.");
  };

  const confirmDelete = () => {
    if (!deleteId) return;
    const updated = combinations.filter((c) => c.id !== deleteId);
    saveLocalCombinedCourses(updated);
    setCombinations(updated);
    setDeleteId(null);
    toast.success("Combination removed.");
  };

  const programmeBadge: Record<string, string> = {
    NCE: "bg-blue-100 text-blue-700",
    Degree: "bg-green-100 text-green-700",
    HND: "bg-purple-100 text-purple-700",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Combination Courses
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage NCE and multi-discipline combined course weightings.
          </p>
        </div>
        <Button
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => setDialogOpen(true)}
          data-ocid="combination.open_modal_button"
        >
          <Plus size={16} className="mr-2" /> Add Combination
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <GitMerge size={16} className="text-blue-600" />
            Defined Combinations ({combinations.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {combinations.length === 0 ? (
            <div
              className="p-12 text-center text-slate-400"
              data-ocid="combination.empty_state"
            >
              <GitMerge size={40} className="mx-auto mb-3 opacity-30" />
              <p className="font-medium">No combined courses defined yet.</p>
              <p className="text-sm mt-1">
                Use &ldquo;Add Combination&rdquo; to define an NCE or
                dual-subject course.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Component A</TableHead>
                    <TableHead>Component B</TableHead>
                    <TableHead>Programme</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead className="text-center">Weight A%</TableHead>
                    <TableHead className="text-center">Weight B%</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {combinations.map((c, i) => (
                    <TableRow
                      key={c.id}
                      className="hover:bg-slate-50"
                      data-ocid={`combination.item.${i + 1}`}
                    >
                      <TableCell className="font-mono text-blue-600 text-sm">
                        {c.combinationCode}
                      </TableCell>
                      <TableCell className="font-medium text-sm">
                        {c.title}
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">
                        {c.componentA}
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">
                        {c.componentB}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`text-xs ${
                            programmeBadge[c.programme] ??
                            "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {c.programme}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{c.level}L</TableCell>
                      <TableCell className="text-center font-semibold text-sm">
                        {c.weightA}%
                      </TableCell>
                      <TableCell className="text-center font-semibold text-sm">
                        {c.weightB}%
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => setDeleteId(c.id)}
                          data-ocid={`combination.delete_button.${i + 1}`}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg" data-ocid="combination.dialog">
          <DialogHeader>
            <DialogTitle>Add Combination Course</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Combination Code *</Label>
                <Input
                  className="mt-1"
                  placeholder="e.g. NCE-CSC+PHY"
                  value={form.combinationCode}
                  onChange={(e) => setF("combinationCode", e.target.value)}
                  data-ocid="combination.input"
                />
              </div>
              <div>
                <Label>Programme *</Label>
                <Select
                  value={form.programme}
                  onValueChange={(v) => setF("programme", v)}
                >
                  <SelectTrigger
                    className="mt-1"
                    data-ocid="combination.select"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["NCE", "Degree", "HND"].map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Title *</Label>
              <Input
                className="mt-1"
                placeholder="e.g. Computer Science + Physics"
                value={form.title}
                onChange={(e) => setF("title", e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Component A Course *</Label>
                <Select
                  value={form.componentA}
                  onValueChange={(v) => setF("componentA", v)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select course..." />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((c) => (
                      <SelectItem key={c.code} value={c.code}>
                        {c.code} – {c.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Component B Course *</Label>
                <Select
                  value={form.componentB}
                  onValueChange={(v) => setF("componentB", v)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select course..." />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((c) => (
                      <SelectItem key={c.code} value={c.code}>
                        {c.code} – {c.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Level</Label>
                <Select
                  value={form.level}
                  onValueChange={(v) => setF("level", v)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["100", "200", "300", "400", "500"].map((l) => (
                      <SelectItem key={l} value={l}>
                        {l}L
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Weight A%</Label>
                <Input
                  className="mt-1"
                  type="number"
                  min={1}
                  max={99}
                  value={form.weightA}
                  onChange={(e) =>
                    setF("weightA", Math.max(1, Math.min(99, +e.target.value)))
                  }
                />
              </div>
              <div>
                <Label>Weight B%</Label>
                <Input
                  className="mt-1"
                  type="number"
                  min={1}
                  max={99}
                  value={form.weightB}
                  onChange={(e) =>
                    setF("weightB", Math.max(1, Math.min(99, +e.target.value)))
                  }
                />
              </div>
            </div>
            {form.weightA + form.weightB !== 100 && (
              <p
                className="text-xs text-red-500"
                data-ocid="combination.error_state"
              >
                Weights must add up to 100. Currently:{" "}
                {form.weightA + form.weightB}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              data-ocid="combination.cancel_button"
            >
              Cancel
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={save}
              data-ocid="combination.submit_button"
            >
              Save Combination
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent data-ocid="combination.modal">
          <DialogHeader>
            <DialogTitle>Delete Combination?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-600">
            This will permanently remove the combined course definition.
            Existing results won&apos;t be affected.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteId(null)}
              data-ocid="combination.cancel_button"
            >
              Cancel
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700"
              onClick={confirmDelete}
              data-ocid="combination.confirm_button"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
