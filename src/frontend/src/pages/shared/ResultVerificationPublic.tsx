import {
  AlertTriangle,
  CheckCircle2,
  FileText,
  QrCode,
  Search,
  Shield,
  XCircle,
} from "lucide-react";
import { useState } from "react";
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
  documentType:
    | "academic-record"
    | "transcript"
    | "promotion-results"
    | "result-slip";
  issuedBy: string;
  issuedAt: string;
  isRevoked: boolean;
  usageCount: number;
  lastUsed?: string;
}

type VerifyStatus = "idle" | "verified" | "not-found" | "revoked";

const DOC_TYPE_LABELS: Record<VerificationCode["documentType"], string> = {
  "academic-record": "Academic Record",
  transcript: "Official Transcript",
  "promotion-results": "Promotion Results",
  "result-slip": "Result Slip",
};

function logAttempt(
  code: string,
  result: "verified" | "not-found" | "revoked",
) {
  const existing = localStorage.getItem("unidigital_verification_attempts");
  const attempts = existing ? JSON.parse(existing) : [];
  attempts.unshift({
    id: `va-${Date.now()}`,
    code,
    attemptedAt: new Date().toISOString(),
    result,
    ipHint: "0.0.0.***",
  });
  // Keep max 100 attempts
  localStorage.setItem(
    "unidigital_verification_attempts",
    JSON.stringify(attempts.slice(0, 100)),
  );
}

function incrementUsage(code: VerificationCode) {
  const existing = localStorage.getItem("unidigital_verification_codes");
  if (!existing) return;
  const codes: VerificationCode[] = JSON.parse(existing);
  const updated = codes.map((c) =>
    c.id === code.id
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
}

export function ResultVerificationPublic() {
  const [inputCode, setInputCode] = useState("");
  const [status, setStatus] = useState<VerifyStatus>("idle");
  const [foundCode, setFoundCode] = useState<VerificationCode | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  function handleVerify() {
    const trimmed = inputCode.trim().toUpperCase();
    if (!trimmed) return;

    setIsChecking(true);
    // Simulate a small delay for UX
    setTimeout(() => {
      const existing = localStorage.getItem("unidigital_verification_codes");
      const codes: VerificationCode[] = existing ? JSON.parse(existing) : [];
      const match = codes.find((c) => c.code === trimmed);

      if (!match) {
        logAttempt(trimmed, "not-found");
        setStatus("not-found");
        setFoundCode(null);
      } else if (match.isRevoked) {
        logAttempt(trimmed, "revoked");
        setStatus("revoked");
        setFoundCode(match);
      } else {
        logAttempt(trimmed, "verified");
        incrementUsage(match);
        setStatus("verified");
        setFoundCode(match);
      }
      setIsChecking(false);
    }, 600);
  }

  function handleReset() {
    setStatus("idle");
    setFoundCode(null);
    setInputCode("");
  }

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col items-center justify-start py-12 px-4">
      {/* Header */}
      <div className="w-full max-w-2xl mb-8 text-center">
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
            <Shield className="w-6 h-6 text-primary-foreground" />
          </div>
          <div className="text-left">
            <h1 className="text-2xl font-bold text-foreground">
              UniDigital Document Verification
            </h1>
            <p className="text-sm text-muted-foreground">
              Federal University of Education, Kontagora (FUEK)
            </p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Enter the verification code printed on an official academic document
          to confirm its authenticity.
        </p>
      </div>

      {/* Verification Card */}
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <QrCode className="w-5 h-5 text-primary" />
            Enter Verification Code
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="verify-code-input">Verification Code</Label>
            <div className="flex gap-2">
              <Input
                id="verify-code-input"
                placeholder="e.g. FUEK-2025-ABCD1234"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && handleVerify()}
                className="font-mono tracking-wide"
                data-ocid="input-verify-code"
              />
              <Button
                type="button"
                onClick={handleVerify}
                disabled={!inputCode.trim() || isChecking}
                data-ocid="btn-verify-code"
              >
                {isChecking ? (
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Verify
                  </>
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              The verification code is printed at the bottom of every official
              UniDigital document.
            </p>
          </div>

          {/* Result: Verified */}
          {status === "verified" && foundCode && (
            <div
              className="rounded-lg border-2 border-green-500 bg-green-50 p-5 space-y-4"
              data-ocid="result-verified"
            >
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-8 h-8 text-green-600 flex-shrink-0" />
                <div>
                  <p className="font-bold text-green-700 text-lg">
                    AUTHENTIC DOCUMENT
                  </p>
                  <p className="text-sm text-green-600">
                    This document has been verified as genuine and issued by
                    FUEK.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm bg-card rounded-md p-4 border border-green-200">
                {[
                  { label: "Student Name", value: foundCode.studentName },
                  { label: "Matric Number", value: foundCode.studentMatric },
                  {
                    label: "Document Type",
                    value: DOC_TYPE_LABELS[foundCode.documentType],
                  },
                  { label: "Verification Code", value: foundCode.code },
                  { label: "Issued By", value: foundCode.issuedBy },
                  {
                    label: "Issue Date",
                    value: new Date(foundCode.issuedAt).toLocaleDateString(),
                  },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="font-medium text-foreground">{value}</p>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 text-xs text-green-600 bg-green-100 rounded-md px-3 py-2">
                <FileText className="w-3 h-3" />
                Verified on {new Date().toLocaleString()} · FUEK MIS
              </div>
            </div>
          )}

          {/* Result: Revoked */}
          {status === "revoked" && foundCode && (
            <div
              className="rounded-lg border-2 border-amber-500 bg-amber-50 p-5 space-y-3"
              data-ocid="result-revoked"
            >
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-8 h-8 text-amber-600 flex-shrink-0" />
                <div>
                  <p className="font-bold text-amber-700 text-lg">
                    DOCUMENT REVOKED
                  </p>
                  <p className="text-sm text-amber-600">
                    This verification code has been revoked by the institution.
                    This document is no longer valid.
                  </p>
                </div>
              </div>
              <div className="text-sm bg-card rounded-md p-3 border border-amber-200">
                <p className="text-muted-foreground">
                  Student:{" "}
                  <span className="font-medium text-foreground">
                    {foundCode.studentName}
                  </span>
                </p>
                <p className="text-muted-foreground">
                  Code:{" "}
                  <span className="font-mono font-medium text-foreground">
                    {foundCode.code}
                  </span>
                </p>
              </div>
              <p className="text-xs text-amber-600">
                If you believe this is an error, please contact the Registrar's
                Office at FUEK.
              </p>
            </div>
          )}

          {/* Result: Not Found */}
          {status === "not-found" && (
            <div
              className="rounded-lg border-2 border-destructive bg-destructive/5 p-5 space-y-3"
              data-ocid="result-not-found"
            >
              <div className="flex items-center gap-3">
                <XCircle className="w-8 h-8 text-destructive flex-shrink-0" />
                <div>
                  <p className="font-bold text-destructive text-lg">
                    UNVERIFIED / DOCUMENT NOT FOUND
                  </p>
                  <p className="text-sm text-muted-foreground">
                    The code{" "}
                    <code className="font-mono bg-muted px-1 rounded">
                      {inputCode}
                    </code>{" "}
                    does not match any issued document in our records.
                  </p>
                </div>
              </div>
              <ul className="text-xs text-muted-foreground space-y-1 bg-muted/40 rounded-md p-3">
                <li>
                  • Double-check the code was entered exactly as printed,
                  including dashes.
                </li>
                <li>
                  • Codes are case-insensitive but must match the exact format.
                </li>
                <li>
                  • If you received this document from another institution,
                  contact them directly.
                </li>
                <li>
                  • To report a suspected forgery, contact: registry@fuek.edu.ng
                </li>
              </ul>
            </div>
          )}

          {status !== "idle" && (
            <div className="flex justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                data-ocid="btn-verify-reset"
              >
                Verify Another Code
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info section */}
      <div className="w-full max-w-2xl mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-center text-sm text-muted-foreground">
        {[
          {
            icon: Shield,
            title: "Anti-Forgery",
            desc: "Every code is unique and cryptographically bound to a specific student document.",
          },
          {
            icon: Search,
            title: "Instant Check",
            desc: "Results appear within seconds — no account required to verify a document.",
          },
          {
            icon: FileText,
            title: "Audit Trail",
            desc: "Every verification attempt is logged and monitored by the Registrar's Office.",
          },
        ].map(({ icon: Icon, title, desc }) => (
          <div
            key={title}
            className="bg-card border border-border rounded-lg p-4"
          >
            <Icon className="w-5 h-5 text-primary mx-auto mb-2" />
            <p className="font-semibold text-foreground mb-1">{title}</p>
            <p className="text-xs">{desc}</p>
          </div>
        ))}
      </div>

      <p className="mt-8 text-xs text-muted-foreground">
        © {new Date().getFullYear()} FUEK MIS · UniDigital Verification Portal
      </p>
    </div>
  );
}
