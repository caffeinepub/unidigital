import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

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

function getInstitutionName(): string {
  try {
    const s = JSON.parse(localStorage.getItem("institutionSettings") ?? "{}");
    return s.name ?? "Federal University of Education Kontagora";
  } catch {
    return "Federal University of Education Kontagora";
  }
}

function getSession(): string {
  try {
    const s = JSON.parse(localStorage.getItem("institutionSettings") ?? "{}");
    return s.currentSession ?? "2023/2024";
  } catch {
    return "2023/2024";
  }
}

export function ClearanceLetterStudent({
  studentName = "Alice Johnson",
  matric = "2020/1/01",
  department = "Computer Science",
}: { studentName?: string; matric?: string; department?: string }) {
  const institutionName = getInstitutionName();
  const session = getSession();
  const misName = getMisName();

  // Simulate: student has clearance
  const hasCleared = true;

  const handlePrint = () => {
    const content = `
      <html><head><title>Clearance Letter</title><style>body{font-family:serif;padding:40px;max-width:680px;margin:auto}h1,h2{text-align:center}p{line-height:1.8}</style></head><body>
      <div style="text-align:center;border-bottom:2px solid #000;padding-bottom:12px;margin-bottom:20px">
        <h1>${institutionName}</h1><h2>LETTER OF CLEARANCE</h2>
      </div>
      <p>This is to certify that <strong>${studentName}</strong>, Matric No <strong>${matric}</strong>, Department of <strong>${department}</strong>, has satisfactorily completed all clearance requirements for the <strong>${session}</strong> academic session.</p>
      <p>This letter is issued for all official purposes.</p>
      <div style="margin-top:60px"><p>____________________________</p><p>Registrar</p><p>Date: ${new Date().toLocaleDateString()}</p></div>
      <p style="margin-top:40px;text-align:center;font-size:0.8em;color:#555;border-top:1px solid #ccc;padding-top:8px">${misName}</p>
      </body></html>`;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(content);
    w.document.close();
    w.print();
  };

  if (!hasCleared) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-slate-500">
            Your clearance is not yet complete. Please resolve all pending
            clearance steps.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          My Clearance Letter
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Your formal clearance letter for the {session} session
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="border-b-2 border-slate-800 pb-4 mb-6 text-center">
            <h2 className="text-lg font-bold">{institutionName}</h2>
            <h3 className="text-base font-semibold mt-1">
              LETTER OF CLEARANCE
            </h3>
          </div>
          <p className="leading-relaxed text-sm text-slate-700">
            This is to certify that <strong>{studentName}</strong>, Matric No{" "}
            <strong>{matric}</strong>, Department of{" "}
            <strong>{department}</strong>, has satisfactorily completed all
            clearance requirements for the <strong>{session}</strong> academic
            session.
          </p>
          <p className="mt-4 text-sm text-slate-700">
            This letter is issued for all official purposes.
          </p>
          <div className="mt-12">
            <p className="text-sm">____________________________</p>
            <p className="text-sm">Registrar</p>
            <p className="text-sm">Date: {new Date().toLocaleDateString()}</p>
          </div>
          <p className="mt-8 text-center text-xs text-slate-400 border-t pt-3">
            {misName}
          </p>
        </CardContent>
      </Card>

      <Button
        onClick={handlePrint}
        data-ocid="clearance_student.primary_button"
      >
        🖨 Print Letter
      </Button>
    </div>
  );
}
