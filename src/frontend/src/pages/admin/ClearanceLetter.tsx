import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getLocalStudents } from "../../utils/sampleData";

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

export function ClearanceLetter() {
  const students = getLocalStudents();
  // Simulate: first 6 students have full clearance
  const cleared = students.slice(0, 6);
  const institutionName = getInstitutionName();
  const session = getSession();
  const misName = getMisName();

  const handlePrint = (student: (typeof cleared)[0]) => {
    const content = `
      <html><head><title>Clearance Letter</title><style>body{font-family:serif;padding:40px;max-width:680px;margin:auto}h1,h2{text-align:center}p{line-height:1.8}</style></head><body>
      <div style="text-align:center;border-bottom:2px solid #000;padding-bottom:12px;margin-bottom:20px">
        <h1>${institutionName}</h1><h2>LETTER OF CLEARANCE</h2>
      </div>
      <p>This is to certify that <strong>${student.name}</strong>, Matric No <strong>${student.matricNumber}</strong>, Department of <strong>${student.department}</strong>, has satisfactorily completed all clearance requirements for the <strong>${session}</strong> academic session.</p>
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Clearance Letters</h1>
        <p className="text-slate-500 text-sm mt-1">
          Generate formal clearance letters for students who have completed all
          clearance steps
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Students with Full Clearance ({cleared.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Matric No</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cleared.map((s, idx) => (
                <TableRow
                  key={s.matricNumber}
                  data-ocid={`clearance.item.${idx + 1}`}
                >
                  <TableCell>{s.name}</TableCell>
                  <TableCell className="font-mono">{s.matricNumber}</TableCell>
                  <TableCell>{s.department}</TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      onClick={() => handlePrint(s)}
                      data-ocid={`clearance.primary_button.${idx + 1}`}
                    >
                      Generate Letter
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
