import { Download, GitMerge, Info, Plus, Trash2 } from "lucide-react";
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
import { Separator } from "../../components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  FUEK_COMBINATION_PAIRS,
  type FuekCombinationPair,
} from "../../utils/fuekCourseData";
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

// ── FUEK CSC/BIO Shared Courses Panel ─────────────────────────────────────────

function FUEKCombinationPanel() {
  const [filterSubject, setFilterSubject] = useState("all");

  const subjects = Array.from(
    new Set(FUEK_COMBINATION_PAIRS.map((p) => p.subjectArea)),
  ).sort();

  const filtered =
    filterSubject === "all"
      ? FUEK_COMBINATION_PAIRS
      : FUEK_COMBINATION_PAIRS.filter((p) => p.subjectArea === filterSubject);

  const handleDownloadList = () => {
    const rows = [
      [
        "Course Code",
        "Course Title",
        "Subject Area",
        "CSC Level/Sem",
        "BIO Level/Sem",
      ],
      ...FUEK_COMBINATION_PAIRS.map((p) => [
        p.courseCode,
        p.courseTitle,
        p.subjectArea,
        `${p.cscLevel}L ${p.cscSemester} Sem`,
        `${p.bioLevel}L ${p.bioSemester} Sem`,
      ]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "FUEK_CSC_BIO_Combination_Courses.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Combination course list downloaded.");
  };

  const subjectBadge: Record<string, string> = {
    "General Studies": "bg-blue-100 text-blue-700",
    Education: "bg-green-100 text-green-700",
    Entrepreneurship: "bg-amber-100 text-amber-700",
    "Computer Science": "bg-purple-100 text-purple-700",
    Mathematics: "bg-red-100 text-red-700",
    Physics: "bg-cyan-100 text-cyan-700",
    "Science Education": "bg-orange-100 text-orange-700",
  };

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-base flex items-center gap-2">
            <GitMerge size={16} className="text-primary" />
            FUEK CSC/BIO Shared Courses ({FUEK_COMBINATION_PAIRS.length})
          </CardTitle>
          <div className="flex items-center gap-2">
            <select
              className="border border-input rounded px-2 py-1.5 text-xs bg-background"
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
            >
              <option value="all">All Subject Areas</option>
              {subjects.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <Button
              size="sm"
              variant="outline"
              onClick={handleDownloadList}
              data-ocid="fuek_combination.download_button"
            >
              <Download size={13} className="mr-1.5" />
              Download CSV
            </Button>
          </div>
        </div>
        <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-lg p-3 mt-2 text-xs text-blue-700">
          <Info size={14} className="shrink-0 mt-0.5" />
          <span>
            These are courses shared between{" "}
            <strong>B.Sc (Ed) Computer Science</strong> and{" "}
            <strong>B.Sc (Ed) Biology</strong> departments at FUEK. Students in
            both departments attend the same lecture, so score sheets are
            combined for these courses.
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead>Course Code</TableHead>
                <TableHead>Course Title</TableHead>
                <TableHead>Subject Area</TableHead>
                <TableHead>CSC (Level/Sem)</TableHead>
                <TableHead>BIO (Level/Sem)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((pair: FuekCombinationPair, i) => (
                <TableRow
                  key={pair.courseCode}
                  className="hover:bg-muted/20"
                  data-ocid={`fuek_combination.item.${i + 1}`}
                >
                  <TableCell className="font-mono text-primary font-semibold text-sm">
                    {pair.courseCode}
                  </TableCell>
                  <TableCell className="font-medium text-sm max-w-xs truncate">
                    {pair.courseTitle}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={`text-xs border-0 ${
                        subjectBadge[pair.subjectArea] ??
                        "bg-muted text-muted-foreground"
                      }`}
                    >
                      {pair.subjectArea}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {pair.cscLevel}L · {pair.cscSemester}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {pair.bioLevel}L · {pair.bioSemester}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export function CombinationCourses() {
  const [combinations, setCombinations] = useState<CombinedCourse[]>(
    getLocalCombinedCourses,
  );
  const courses = getLocalCourses();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(blankForm());
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"fuek" | "custom">("fuek");

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
          <h1 className="text-2xl font-bold text-foreground">
            Combination Courses
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            FUEK CSC/BIO shared courses and custom multi-discipline combined
            course weightings.
          </p>
        </div>
        <Button
          onClick={() => setDialogOpen(true)}
          data-ocid="combination.open_modal_button"
        >
          <Plus size={16} className="mr-2" /> Add Custom Combination
        </Button>
      </div>

      {/* Tab selector */}
      <div className="flex gap-2 border-b border-border pb-3">
        <Button
          size="sm"
          variant={activeTab === "fuek" ? "default" : "outline"}
          onClick={() => setActiveTab("fuek")}
          data-ocid="combination.tab_fuek"
        >
          FUEK CSC/BIO Shared Courses
        </Button>
        <Button
          size="sm"
          variant={activeTab === "custom" ? "default" : "outline"}
          onClick={() => setActiveTab("custom")}
          data-ocid="combination.tab_custom"
        >
          Custom Combinations ({combinations.length})
        </Button>
      </div>

      {/* FUEK CSC/BIO Panel */}
      {activeTab === "fuek" && <FUEKCombinationPanel />}

      {/* Custom combinations panel */}
      {activeTab === "custom" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <GitMerge size={16} className="text-primary" />
              Custom Defined Combinations ({combinations.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {combinations.length === 0 ? (
              <div
                className="p-12 text-center text-muted-foreground"
                data-ocid="combination.empty_state"
              >
                <GitMerge size={40} className="mx-auto mb-3 opacity-30" />
                <p className="font-medium">
                  No custom combined courses defined yet.
                </p>
                <p className="text-sm mt-1">
                  Use &ldquo;Add Custom Combination&rdquo; to define an NCE or
                  dual-subject course.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/40">
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
                        className="hover:bg-muted/20"
                        data-ocid={`combination.item.${i + 1}`}
                      >
                        <TableCell className="font-mono text-primary text-sm">
                          {c.combinationCode}
                        </TableCell>
                        <TableCell className="font-medium text-sm">
                          {c.title}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {c.componentA}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {c.componentB}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={`text-xs border-0 ${
                              programmeBadge[c.programme] ??
                              "bg-muted text-muted-foreground"
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
                            className="text-destructive hover:bg-destructive/10"
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
      )}

      <Separator />

      {/* Add Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg" data-ocid="combination.dialog">
          <DialogHeader>
            <DialogTitle>Add Custom Combination Course</DialogTitle>
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
                className="text-xs text-destructive"
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
            <Button onClick={save} data-ocid="combination.submit_button">
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
          <p className="text-sm text-muted-foreground">
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
              variant="destructive"
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
