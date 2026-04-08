import {
  Award,
  BookOpen,
  Calendar,
  CheckCircle,
  Printer,
  XCircle,
} from "lucide-react";
import { useState } from "react";
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

interface CertRecord {
  id: string;
  name: string;
  admissionId: string;
  programme: string;
  department: string;
  batch: string;
  year: number;
  ca: number;
  exam: number;
  attendance: number;
  feeCleared: boolean;
  certificateIssued: boolean;
  status: string;
}

const STORAGE_KEY = "unidigital_cert_students";

function loadCertStudents(): CertRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /**/
  }
  return [];
}

function getTotal(s: CertRecord) {
  return s.ca + s.exam;
}
function getCertClass(total: number): string {
  if (total >= 75) return "Distinction";
  if (total >= 60) return "Credit";
  if (total >= 50) return "Pass";
  return "Fail";
}
function getCertClassColor(cls: string): string {
  if (cls === "Distinction") return "bg-yellow-100 text-yellow-800";
  if (cls === "Credit") return "bg-blue-100 text-blue-700";
  if (cls === "Pass") return "bg-green-100 text-green-700";
  return "bg-red-100 text-red-700";
}
function isEligible(s: CertRecord) {
  return getTotal(s) >= 50 && s.feeCleared && s.attendance >= 75;
}

interface Props {
  userName: string;
  userEmail: string;
}

export function MyCertificates({ userName, userEmail }: Props) {
  const allCerts = loadCertStudents();

  // Find certs belonging to this student by name match or email match
  const myCerts = allCerts.filter(
    (c) =>
      c.name.toLowerCase() === userName.toLowerCase() ||
      (userEmail &&
        c.name.toLowerCase().includes(userName.split(" ")[0].toLowerCase())),
  );

  const [showCert, setShowCert] = useState<CertRecord | null>(null);

  function printCertificate(s: CertRecord) {
    const instRaw = localStorage.getItem("unidigital_institution_settings");
    let instName = "Federal University of Technology";
    let instMotto = "Knowledge for Service";
    try {
      const parsed = JSON.parse(instRaw ?? "{}");
      instName = parsed?.profile?.name ?? instName;
      instMotto = parsed?.profile?.motto ?? instMotto;
    } catch {
      /**/
    }
    const total = getTotal(s);
    const cls = getCertClass(total);
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
      <html><head><title>Certificate</title>
      <style>
        body{font-family:Georgia,serif;display:flex;justify-content:center;align-items:center;min-height:100vh;margin:0;background:#f5f0e8;}
        .cert{width:700px;border:8px double #8B6914;padding:48px 56px;text-align:center;background:#fffdf5;box-shadow:0 4px 32px rgba(0,0,0,.15);}
        .cert h1{font-size:28px;margin:0 0 4px;color:#1a1a1a;letter-spacing:1px;}
        .cert .motto{font-style:italic;color:#666;font-size:14px;margin-bottom:20px;}
        .cert .presents{font-size:15px;color:#555;margin-bottom:10px;}
        .cert .recipient{font-size:32px;font-weight:bold;color:#8B6914;border-bottom:2px solid #8B6914;display:inline-block;padding:0 32px 4px;margin-bottom:16px;}
        .cert .programme{font-size:18px;font-weight:bold;color:#1a1a1a;margin:8px 0;}
        .cert .class{font-size:15px;color:#7c4f00;font-weight:bold;margin-bottom:20px;}
        .cert .sigs{display:flex;justify-content:space-between;margin-top:36px;}
        .cert .sig{text-align:center;width:40%;}
        .cert .sig-line{border-top:1px solid #333;margin-bottom:4px;}
        .cert .sig-label{font-size:12px;color:#555;}
        .cert .footer{margin-top:24px;font-size:11px;color:#888;}
        @media print{body{background:white;}*{-webkit-print-color-adjust:exact;}}
      </style></head>
      <body>
        <div class="cert">
          <h1>${instName.toUpperCase()}</h1>
          <p class="motto">${instMotto}</p>
          <p class="presents">This is to certify that</p>
          <div class="recipient">${s.name}</div>
          <p style="font-size:14px;color:#444;margin-bottom:8px;">having successfully completed the requirements for the</p>
          <p class="programme">${s.programme}</p>
          <p style="font-size:13px;color:#555;margin-bottom:8px;">Admission ID: <strong>${s.admissionId}</strong> &nbsp;&bull;&nbsp; Year: ${s.year} &nbsp;&bull;&nbsp; Batch: ${s.batch}</p>
          <p class="class">Class of Award: ${cls} (${total}/100)</p>
          <div class="sigs">
            <div class="sig"><div class="sig-line"></div><div class="sig-label">Registrar</div></div>
            <div class="sig"><div class="sig-line"></div><div class="sig-label">Vice-Chancellor / Director</div></div>
          </div>
          <p class="footer">Issued: ${new Date().toLocaleDateString("en-GB")}</p>
        </div>
        <script>window.onload=()=>{window.print();}<\/script>
      </body></html>
    `);
    win.document.close();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Award size={28} className="text-yellow-600" />
        <div>
          <h1 className="text-2xl font-bold text-slate-800">My Certificates</h1>
          <p className="text-sm text-slate-500">
            View and download your certificate course achievements
          </p>
        </div>
      </div>

      {myCerts.length === 0 ? (
        <Card>
          <CardContent
            className="flex flex-col items-center justify-center py-16 text-center"
            data-ocid="cert.student.empty"
          >
            <Award size={40} className="text-slate-300 mb-3" />
            <h3 className="font-semibold text-slate-600 mb-1">
              No Certificate Courses Yet
            </h3>
            <p className="text-sm text-slate-400 max-w-sm">
              You have not been enrolled in any certificate programme. Contact
              your department head or Admin to apply.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { label: "Programmes", value: myCerts.length },
              {
                label: "Certificates Issued",
                value: myCerts.filter((c) => c.certificateIssued).length,
              },
              {
                label: "In Progress",
                value: myCerts.filter(
                  (c) => !c.certificateIssued && c.status === "admitted",
                ).length,
              },
            ].map((item) => (
              <Card key={item.label} className="p-3 text-center">
                <p className="text-2xl font-bold text-blue-600">{item.value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{item.label}</p>
              </Card>
            ))}
          </div>

          {/* Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BookOpen size={16} />
                Certificate Programme Records
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Admission ID</TableHead>
                      <TableHead>Programme</TableHead>
                      <TableHead>Batch</TableHead>
                      <TableHead>CA</TableHead>
                      <TableHead>Exam</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Attendance</TableHead>
                      <TableHead>Fee</TableHead>
                      <TableHead>Certificate</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {myCerts.map((c) => {
                      const total = getTotal(c);
                      const cls = getCertClass(total);
                      return (
                        <TableRow key={c.id} data-ocid="cert.student.row">
                          <TableCell className="font-mono text-xs">
                            {c.admissionId}
                          </TableCell>
                          <TableCell className="text-sm">
                            {c.programme}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-xs">
                              <Calendar size={11} />
                              {c.batch} Batch {c.year}
                            </div>
                          </TableCell>
                          <TableCell>{c.ca}/40</TableCell>
                          <TableCell>{c.exam}/60</TableCell>
                          <TableCell className="font-bold">{total}</TableCell>
                          <TableCell>
                            {total > 0 && (
                              <Badge
                                className={`text-[10px] ${getCertClassColor(cls)}`}
                              >
                                {cls}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <span
                              className={
                                c.attendance >= 75
                                  ? "text-green-600 font-medium"
                                  : "text-red-500"
                              }
                            >
                              {c.attendance}%
                            </span>
                          </TableCell>
                          <TableCell>
                            {c.feeCleared ? (
                              <CheckCircle
                                size={14}
                                className="text-green-500"
                              />
                            ) : (
                              <XCircle size={14} className="text-red-400" />
                            )}
                          </TableCell>
                          <TableCell>
                            {c.certificateIssued ? (
                              <Badge className="bg-yellow-100 text-yellow-800 text-[10px]">
                                Issued
                              </Badge>
                            ) : isEligible(c) ? (
                              <Badge className="bg-blue-100 text-blue-700 text-[10px]">
                                Eligible
                              </Badge>
                            ) : (
                              <Badge className="bg-slate-100 text-slate-600 text-[10px]">
                                Pending
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {c.certificateIssued && (
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 text-xs px-2"
                                  onClick={() => setShowCert(c)}
                                  data-ocid="cert.student.view"
                                >
                                  View
                                </Button>
                                <Button
                                  size="sm"
                                  className="h-7 text-xs px-2 bg-yellow-600 hover:bg-yellow-700 text-white"
                                  onClick={() => printCertificate(c)}
                                  data-ocid="cert.student.print"
                                >
                                  <Printer size={11} className="mr-1" />
                                  Print
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Certificate preview dialog */}
      <Dialog open={!!showCert} onOpenChange={() => setShowCert(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Award size={18} className="text-yellow-600" />
              Your Certificate
            </DialogTitle>
          </DialogHeader>
          {showCert &&
            (() => {
              const total = getTotal(showCert);
              const cls = getCertClass(total);
              return (
                <div className="border-4 border-double border-yellow-600 p-6 text-center rounded bg-amber-50">
                  <p className="text-xs text-amber-700 font-semibold uppercase tracking-widest mb-1">
                    Certificate of Achievement
                  </p>
                  <h2 className="text-lg font-bold text-slate-800 mb-1">
                    This is to certify that
                  </h2>
                  <p className="text-2xl font-bold text-yellow-700 border-b-2 border-yellow-600 inline-block px-4 pb-1 mb-3">
                    {showCert.name}
                  </p>
                  <p className="text-sm text-slate-600 mb-1">
                    has successfully completed
                  </p>
                  <p className="text-base font-bold text-slate-800 mb-1">
                    {showCert.programme}
                  </p>
                  <p className="text-xs text-slate-500 mb-2">
                    ID: {showCert.admissionId} &bull; Batch: {showCert.batch}{" "}
                    {showCert.year}
                  </p>
                  <Badge className={`mb-3 ${getCertClassColor(cls)}`}>
                    Class of Award: {cls} ({total}/100)
                  </Badge>
                  <p className="text-xs text-slate-400 mt-2">
                    Issued: {new Date().toLocaleDateString("en-GB")}
                  </p>
                </div>
              );
            })()}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCert(null)}>
              Close
            </Button>
            {showCert && (
              <Button
                className="bg-yellow-600 hover:bg-yellow-700 text-white"
                onClick={() => printCertificate(showCert)}
                data-ocid="cert.student.print.dialog"
              >
                <Printer size={14} className="mr-2" />
                Print Certificate
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
