import { Camera, CheckCircle, Download, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { DocumentScanner } from "../../components/DocumentScanner";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Checkbox } from "../../components/ui/checkbox";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import { useResultProcessing } from "../../contexts/ResultProcessingContext";
import { useActor } from "../../hooks/useActor";
import { useInternetIdentity } from "../../hooks/useInternetIdentity";
import {
  type ClearanceRecord,
  getLocalCourses,
  getLocalInvoices,
  getLocalStudents,
} from "../../utils/sampleData";
import { useFileUpload } from "../../utils/useFileUpload";

export function GraduationClearance() {
  const { examResults, getCarryovers, clearanceRecords, setClearanceRecords } =
    useResultProcessing();
  const students = getLocalStudents();
  const courses = getLocalCourses();
  const invoices = getLocalInvoices();
  const creditMap = Object.fromEntries(
    courses.map((c) => [c.code, c.creditUnits]),
  );
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scanTarget, setScanTarget] = useState<string | null>(null);
  const [attachedClearanceDocs, setAttachedClearanceDocs] = useState<
    Record<string, number>
  >({});
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const { uploadFile } = useFileUpload();

  const getClearance = (matric: string): ClearanceRecord =>
    clearanceRecords.find((r) => r.studentMatric === matric) ?? {
      studentMatric: matric,
      library: false,
      department: false,
      bursary: false,
    };

  const updateClearance = (
    matric: string,
    field: keyof Pick<ClearanceRecord, "library" | "department" | "bursary">,
    value: boolean,
  ) => {
    const existing = getClearance(matric);
    const updated: ClearanceRecord = { ...existing, [field]: value };
    if (updated.library && updated.department && updated.bursary) {
      updated.completedAt = new Date().toISOString();
    }
    const rest = clearanceRecords.filter((r) => r.studentMatric !== matric);
    setClearanceRecords([...rest, updated]);
  };

  const getCreditsCompleted = (matric: string) => {
    const published = examResults.filter(
      (r) =>
        r.studentMatric === matric &&
        r.status === "published" &&
        r.grade !== "F",
    );
    return published.reduce(
      (sum, r) => sum + (creditMap[r.courseCode] ?? 3),
      0,
    );
  };

  const hasFeeBalance = (matric: string) => {
    const inv = invoices.find((i) => i.studentMatric === matric);
    return inv ? inv.paid < inv.amount : false;
  };

  const isEligible = (matric: string) => {
    const credits = getCreditsCompleted(matric);
    const carryovers = getCarryovers(matric);
    const feeOwing = hasFeeBalance(matric);
    return credits >= 90 && carryovers.length === 0 && !feeOwing;
  };

  const clearanceComplete = (matric: string) => {
    const c = getClearance(matric);
    return c.library && c.department && c.bursary;
  };

  const graduationList = students.filter(
    (s) => isEligible(s.matricNumber) && clearanceComplete(s.matricNumber),
  );

  const exportConvocation = () => {
    const rows = ["S/N,Matric,Name,Department,Level"];
    graduationList.forEach((s, i) =>
      rows.push(
        `${i + 1},"${s.matricNumber}","${s.name}","${s.department}",${s.level}L`,
      ),
    );
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "convocation_list.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Convocation list exported");
  };

  const openScannerForStudent = (matric: string) => {
    setScanTarget(matric);
    setScannerOpen(true);
  };

  const handleScanCapture = async (file: File, _previewUrl: string) => {
    if (!scanTarget) return;
    setScannerOpen(false);
    const matric = scanTarget;
    setScanTarget(null);

    if (!actor) {
      setAttachedClearanceDocs((prev) => ({
        ...prev,
        [matric]: (prev[matric] ?? 0) + 1,
      }));
      toast.success("Clearance document attached (demo mode)");
      return;
    }

    try {
      const blobId = await uploadFile(file);
      const principal = identity?.getPrincipal().toString() ?? "anonymous";
      const studentName =
        students.find((s) => s.matricNumber === matric)?.name ?? matric;
      await (actor as any).createDocumentRecord({
        id: `DOC-CLEAR-${Date.now()}`,
        title: `Clearance Document – ${studentName}`,
        documentType: "clearance",
        blobId,
        uploaderPrincipal: principal,
        uploaderName: "Administrator",
        linkedRecordId: matric,
        linkedRecordType: "clearance",
        uploadedAt: BigInt(Date.now()),
        notes: `Scanned clearance document for ${studentName}`,
      });
      setAttachedClearanceDocs((prev) => ({
        ...prev,
        [matric]: (prev[matric] ?? 0) + 1,
      }));
      toast.success("Clearance document saved");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save clearance document");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Graduation & Clearance
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Manage graduation eligibility, clearance workflow, and convocation
          list.
        </p>
      </div>

      <Tabs defaultValue="eligibility">
        <TabsList>
          <TabsTrigger value="eligibility" data-ocid="grad.tab">
            Eligibility Check
          </TabsTrigger>
          <TabsTrigger value="clearance" data-ocid="grad.tab">
            Clearance Workflow
          </TabsTrigger>
          <TabsTrigger value="graduation" data-ocid="grad.tab">
            Graduation List
          </TabsTrigger>
        </TabsList>

        <TabsContent value="eligibility" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px]">
                  <thead className="bg-slate-50 border-b">
                    <tr>
                      {[
                        "Matric",
                        "Name",
                        "Credits Completed",
                        "Carryovers",
                        "Fee Balance",
                        "Eligibility",
                      ].map((h) => (
                        <th
                          key={h}
                          className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((s, i) => {
                      const credits = getCreditsCompleted(s.matricNumber);
                      const carryovers = getCarryovers(s.matricNumber);
                      const feeOwing = hasFeeBalance(s.matricNumber);
                      const eligible = isEligible(s.matricNumber);
                      return (
                        <tr
                          key={s.matricNumber}
                          className="border-b last:border-0 hover:bg-slate-50"
                          data-ocid={`grad.item.${i + 1}`}
                        >
                          <td className="px-4 py-3 text-xs font-mono text-blue-600">
                            {s.matricNumber}
                          </td>
                          <td className="px-4 py-3 text-sm font-medium">
                            {s.name}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`text-sm font-semibold ${
                                credits >= 90
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {credits} / 90
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`text-sm font-semibold ${
                                carryovers.length === 0
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {carryovers.length}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {feeOwing ? (
                              <span className="text-red-600 text-sm font-medium">
                                Outstanding
                              </span>
                            ) : (
                              <span className="text-green-600 text-sm font-medium">
                                Cleared
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <Badge
                              className={
                                eligible
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                              }
                            >
                              {eligible ? "Eligible" : "Not Eligible"}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clearance" className="mt-4">
          <div className="space-y-3">
            {students
              .filter((s) => isEligible(s.matricNumber))
              .map((s, i) => {
                const cl = getClearance(s.matricNumber);
                const done = cl.library && cl.department && cl.bursary;
                const docCount = attachedClearanceDocs[s.matricNumber] ?? 0;
                return (
                  <Card
                    key={s.matricNumber}
                    data-ocid={`clearance.item.${i + 1}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="font-semibold">{s.name}</p>
                          <p className="text-sm text-slate-500">
                            {s.matricNumber}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {done && (
                            <Badge className="bg-green-100 text-green-700">
                              Cleared
                            </Badge>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              openScannerForStudent(s.matricNumber)
                            }
                            data-ocid={`clearance.upload_button.${i + 1}`}
                          >
                            <Camera size={14} className="mr-1.5" />
                            Attach Document
                            {docCount > 0 && (
                              <Badge className="ml-1.5 bg-blue-100 text-blue-700 border-0 text-xs">
                                {docCount}
                              </Badge>
                            )}
                          </Button>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-6 mt-3">
                        {(["library", "department", "bursary"] as const).map(
                          (field) => (
                            <div
                              key={field}
                              className="flex items-center gap-2 cursor-pointer"
                            >
                              <Checkbox
                                checked={cl[field]}
                                onCheckedChange={(v) =>
                                  updateClearance(s.matricNumber, field, !!v)
                                }
                                data-ocid="clearance.checkbox"
                              />
                              <span className="text-sm capitalize">
                                {field} Clearance
                              </span>
                              {cl[field] ? (
                                <CheckCircle
                                  size={14}
                                  className="text-green-500"
                                />
                              ) : (
                                <XCircle size={14} className="text-slate-300" />
                              )}
                            </div>
                          ),
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            {students.filter((s) => isEligible(s.matricNumber)).length ===
              0 && (
              <Card>
                <CardContent
                  className="p-10 text-center text-slate-400"
                  data-ocid="clearance.empty_state"
                >
                  No eligible students for clearance yet.
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="graduation" className="mt-4">
          <div className="flex items-center justify-between mb-4">
            <p className="text-slate-600 font-medium">
              {graduationList.length} student(s) cleared for graduation
            </p>
            <Button
              variant="outline"
              onClick={exportConvocation}
              data-ocid="grad.secondary_button"
            >
              <Download size={14} className="mr-2" /> Export Convocation List
            </Button>
          </div>
          <Card>
            <CardContent className="p-0">
              {graduationList.length === 0 && (
                <p
                  className="p-10 text-center text-slate-400"
                  data-ocid="grad.empty_state"
                >
                  No students have completed full clearance yet.
                </p>
              )}
              <div className="divide-y">
                {graduationList.map((s, i) => (
                  <div
                    key={s.matricNumber}
                    className="p-4 flex items-center gap-4"
                    data-ocid={`grad.list.item.${i + 1}`}
                  >
                    <div className="w-8 h-8 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-sm font-bold">
                      {i + 1}
                    </div>
                    <div>
                      <p className="font-semibold">{s.name}</p>
                      <p className="text-sm text-slate-500">
                        {s.matricNumber} &bull; {s.department}
                      </p>
                    </div>
                    <Badge className="ml-auto bg-green-100 text-green-700">
                      Graduated
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Document Scanner */}
      <DocumentScanner
        isOpen={scannerOpen}
        onClose={() => {
          setScannerOpen(false);
          setScanTarget(null);
        }}
        onCapture={handleScanCapture}
        title="Attach Clearance Document"
      />
    </div>
  );
}
