import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  FileText,
  QrCode,
  Search,
  Shield,
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
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";

interface VerificationCode {
  id: string;
  code: string;
  studentMatric: string;
  studentName: string;
  documentType: string;
  issuedBy: string;
  issuedAt: string;
  isRevoked: boolean;
  usageCount: number;
  lastUsed?: string;
}

interface VerificationAttempt {
  id: string;
  code: string;
  attemptedAt: string;
  result: "verified" | "not-found" | "revoked";
  ipHint: string;
}

type VerifyResult = "idle" | "verified" | "not-found" | "revoked";

function logAttempt(code: string, result: VerificationAttempt["result"]) {
  try {
    const existing: VerificationAttempt[] = JSON.parse(
      localStorage.getItem("unidigital_verification_attempts") || "[]",
    );
    const attempt: VerificationAttempt = {
      id: `va-${Date.now()}`,
      code,
      attemptedAt: new Date().toISOString(),
      result,
      ipHint: "Public",
    };
    existing.push(attempt);
    localStorage.setItem(
      "unidigital_verification_attempts",
      JSON.stringify(existing.slice(-500)),
    );
  } catch {
    /* silent */
  }
}

const DOC_TYPE_LABELS: Record<string, string> = {
  "academic-record": "Academic Record",
  transcript: "Transcript",
  "promotion-results": "Promotion Results",
  "result-slip": "Result Slip",
};

export function PublicVerification() {
  const [code, setCode] = useState(() => {
    // Check if launched with ?verify=CODE in URL
    const params = new URLSearchParams(window.location.search);
    return params.get("verify") || "";
  });
  const [status, setStatus] = useState<VerifyResult>("idle");
  const [foundRecord, setFoundRecord] = useState<VerificationCode | null>(null);
  const [loading, setLoading] = useState(false);

  function handleVerify() {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;
    setLoading(true);
    setFoundRecord(null);

    setTimeout(() => {
      try {
        const codes: VerificationCode[] = JSON.parse(
          localStorage.getItem("unidigital_verification_codes") || "[]",
        );
        const match = codes.find((c) => c.code.toUpperCase() === trimmed);

        if (!match) {
          setStatus("not-found");
          logAttempt(trimmed, "not-found");
        } else if (match.isRevoked) {
          setStatus("revoked");
          setFoundRecord(match);
          logAttempt(trimmed, "revoked");
        } else {
          // Increment usage count
          const updated = codes.map((c) =>
            c.id === match.id
              ? {
                  ...c,
                  usageCount: c.usageCount + 1,
                  lastUsed: new Date().toISOString(),
                }
              : c,
          );
          localStorage.setItem(
            "unidigital_verification_codes",
            JSON.stringify(updated),
          );
          setStatus("verified");
          setFoundRecord({ ...match, usageCount: match.usageCount + 1 });
          logAttempt(trimmed, "verified");
        }
      } catch {
        setStatus("not-found");
      }
      setLoading(false);
    }, 800);
  }

  function getInstitutionSettings() {
    try {
      return JSON.parse(
        localStorage.getItem("unidigital_institution_settings") || "{}",
      );
    } catch {
      return {};
    }
  }
  const settings = getInstitutionSettings();
  const instName = settings.name || "Federal University of Education Kontagora";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 flex flex-col items-center justify-center p-4">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Building2 size={32} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white">{instName}</h1>
        <p className="text-slate-300 mt-1 text-sm">
          Official Document Verification Portal
        </p>
      </div>

      <div className="w-full max-w-lg space-y-4">
        {/* Verification input card */}
        <Card className="bg-white shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="w-5 h-5 text-primary" />
              Verify Academic Document
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Enter the verification code printed on your official result sheet,
              transcript, or academic record to confirm its authenticity.
            </p>
            <div className="space-y-2">
              <Label>Verification Code</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <QrCode className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    className="pl-9 font-mono uppercase tracking-widest"
                    placeholder="e.g. FUEK-2025-ABCD1234"
                    value={code}
                    onChange={(e) => {
                      setCode(e.target.value.toUpperCase());
                      setStatus("idle");
                    }}
                    onKeyDown={(e) => e.key === "Enter" && handleVerify()}
                    data-ocid="verify-code-input"
                  />
                </div>
                <Button
                  onClick={handleVerify}
                  disabled={!code.trim() || loading}
                  data-ocid="verify-btn"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Verifying...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Search className="w-4 h-4" />
                      Verify
                    </span>
                  )}
                </Button>
              </div>
            </div>

            {/* Result: Verified */}
            {status === "verified" && foundRecord && (
              <div
                className="rounded-lg border-2 border-green-300 bg-green-50 p-4 space-y-3"
                data-ocid="verify-result-verified"
              >
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                  <span className="font-semibold text-sm">
                    Document Verified Successfully
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Student Name
                    </p>
                    <p className="font-semibold text-foreground">
                      {foundRecord.studentName}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Matric Number
                    </p>
                    <p className="font-semibold text-foreground">
                      {foundRecord.studentMatric}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Document Type
                    </p>
                    <p className="font-semibold text-foreground">
                      {DOC_TYPE_LABELS[foundRecord.documentType] ||
                        foundRecord.documentType}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Issued By</p>
                    <p className="font-semibold text-foreground">
                      {foundRecord.issuedBy}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Date Issued</p>
                    <p className="font-semibold text-foreground">
                      {new Date(foundRecord.issuedAt).toLocaleDateString(
                        "en-GB",
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Institution</p>
                    <p className="font-semibold text-foreground truncate">
                      {instName}
                    </p>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-2 pt-2 border-t border-green-200">
                  <Badge className="bg-green-100 text-green-700 border border-green-300 text-xs">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Authentic Document
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    Verified on {new Date().toLocaleDateString("en-GB")}
                  </span>
                </div>
              </div>
            )}

            {/* Result: Revoked */}
            {status === "revoked" && foundRecord && (
              <div
                className="rounded-lg border-2 border-red-300 bg-red-50 p-4 space-y-2"
                data-ocid="verify-result-revoked"
              >
                <div className="flex items-center gap-2 text-red-700">
                  <XCircle className="w-5 h-5 flex-shrink-0" />
                  <span className="font-semibold text-sm">
                    Verification Code Revoked
                  </span>
                </div>
                <p className="text-sm text-red-700">
                  This document's verification code has been revoked by the
                  institution. The document may be invalid or superseded. Please
                  contact the Registrar's Office for clarification.
                </p>
                <p className="text-xs text-muted-foreground">
                  Student: {foundRecord.studentName} |{" "}
                  {foundRecord.studentMatric}
                </p>
              </div>
            )}

            {/* Result: Not found */}
            {status === "not-found" && (
              <div
                className="rounded-lg border-2 border-amber-300 bg-amber-50 p-4 space-y-2"
                data-ocid="verify-result-not-found"
              >
                <div className="flex items-center gap-2 text-amber-700">
                  <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                  <span className="font-semibold text-sm">Code Not Found</span>
                </div>
                <p className="text-sm text-amber-700">
                  No document matching this verification code was found. Please
                  check the code carefully or contact the issuing institution.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Help card */}
        <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-start gap-3 text-white/80 text-sm">
              <FileText className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-white mb-1">
                  Where to find your verification code
                </p>
                <ul className="space-y-1 text-xs text-white/70 list-disc list-inside">
                  <li>
                    Printed at the footer of your official result sheet or
                    transcript
                  </li>
                  <li>
                    Displayed on your Academic Record page in the student portal
                  </li>
                  <li>
                    Format:{" "}
                    <span className="font-mono">FUEK-YYYY-XXXXXXXX</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-white/40 text-xs">
          This portal is maintained by the Registrar's Office, {instName}
        </p>
      </div>
    </div>
  );
}
