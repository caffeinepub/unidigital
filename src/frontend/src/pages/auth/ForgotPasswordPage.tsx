import {
  AlertCircle,
  ArrowLeft,
  Building2,
  CheckCircle2,
  Eye,
  EyeOff,
  HelpCircle,
  KeyRound,
  Lock,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { useId, useRef, useState } from "react";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  getSecurityQuestion,
  hasSecurityQuestion,
  logPasswordReset,
  passwordStrength,
  resetPasswordViaEmail,
  saveLocalPassword,
  validatePasswordStrength,
  verifySecurityAnswer,
} from "../../utils/authUtils";

export interface ForgotPasswordPageProps {
  onBack: () => void;
  /** Called after a successful reset so caller can navigate to sign-in. */
  onResetComplete: () => void;
  /** Default 'choose-method'. Pass 'set-password' for admin-forced reset (skip verification). */
  startStage?: Stage;
}

type Stage =
  | "choose-method"
  | "verify-identity"
  | "email-reset-request"
  | "email-reset-preview"
  | "set-password"
  | "success";

const USER_REGISTRY_KEY = "unidigital_user_registry";

interface RegistryUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

function lookupUserByEmail(email: string): RegistryUser | null {
  try {
    const registry = JSON.parse(
      localStorage.getItem(USER_REGISTRY_KEY) || "[]",
    ) as RegistryUser[];
    return (
      registry.find(
        (u) => u.email.toLowerCase() === email.trim().toLowerCase(),
      ) ?? null
    );
  } catch {
    return null;
  }
}

function PasswordInputField({
  id,
  value,
  onChange,
  placeholder,
  "data-ocid": ocid,
  autoFocus,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  "data-ocid"?: string;
  autoFocus?: boolean;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input
        id={id}
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pr-10"
        data-ocid={ocid}
        autoFocus={autoFocus}
      />
      <button
        type="button"
        aria-label={show ? "Hide password" : "Show password"}
        onClick={() => setShow((p) => !p)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
        data-ocid={ocid ? `${ocid}-eye` : undefined}
      >
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}

function StrengthBar({ pw }: { pw: string }) {
  const strength = passwordStrength(pw);
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  const colors = [
    "",
    "bg-destructive",
    "bg-amber-500",
    "bg-amber-400",
    "bg-green-500",
  ];
  return (
    <div className="space-y-1">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              i <= strength ? colors[strength] : "bg-muted"
            }`}
          />
        ))}
      </div>
      {pw && (
        <p className="text-xs text-muted-foreground">
          Strength:{" "}
          <span
            className={
              strength <= 1
                ? "text-destructive"
                : strength === 2
                  ? "text-amber-500"
                  : "text-green-600"
            }
          >
            {labels[strength] ?? ""}
          </span>
        </p>
      )}
    </div>
  );
}

export function ForgotPasswordPage({
  onBack,
  onResetComplete,
  startStage,
}: ForgotPasswordPageProps) {
  const [stage, setStage] = useState<Stage>(startStage ?? "choose-method");
  const [answer, setAnswer] = useState("");
  const [answerError, setAnswerError] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [emailError, setEmailError] = useState("");
  const [foundUser, setFoundUser] = useState<RegistryUser | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwError, setPwError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetMethod, setResetMethod] = useState<"security-question" | "email">(
    "security-question",
  );
  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const securityQuestion = getSecurityQuestion();
  const hasSQ = hasSecurityQuestion();

  const answerInputId = useId();
  const emailInputId = useId();
  const newPwInputId = useId();
  const confirmPwInputId = useId();

  function handleVerifyIdentity() {
    setAnswerError("");
    if (!answer.trim()) {
      setAnswerError("Please enter your security answer.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const correct = verifySecurityAnswer(answer);
      if (correct) {
        logPasswordReset("success", "security-question");
        setResetMethod("security-question");
        setStage("set-password");
      } else {
        logPasswordReset("failed", "security-question");
        setAnswerError(
          "Incorrect answer. Please try again or contact your system administrator.",
        );
      }
      setLoading(false);
    }, 600);
  }

  function handleEmailRequest() {
    setEmailError("");
    if (!emailInput.trim() || !emailInput.includes("@")) {
      setEmailError("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const user = lookupUserByEmail(emailInput);
      // Always show the "email sent" message for security — don't reveal if not found
      if (user) {
        setFoundUser(user);
        setStage("email-reset-preview");
      } else {
        // Still proceed to preview to not leak account existence
        setFoundUser({
          id: emailInput,
          name: "User",
          email: emailInput.trim(),
          role: "user",
        });
        setStage("email-reset-preview");
      }
      setLoading(false);
    }, 700);
  }

  function handleSetPassword() {
    setPwError("");
    const strengthErr = validatePasswordStrength(newPassword);
    if (strengthErr) {
      setPwError(strengthErr);
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError("Passwords do not match. Please re-enter.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      if (resetMethod === "email") {
        resetPasswordViaEmail(foundUser?.id ?? "", newPassword);
      } else {
        saveLocalPassword(newPassword);
      }
      setStage("success");
      setLoading(false);
      successTimerRef.current = setTimeout(() => {
        onResetComplete();
      }, 3000);
    }, 500);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-5 py-3.5 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <Building2 size={16} className="text-white" />
          </div>
          <span className="text-white font-bold text-base">UniDigital</span>
        </div>
        <span className="text-slate-400 text-xs hidden sm:block">
          Federal University of Education, Kontagora
        </span>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {/* ── Stage: Choose Method ── */}
          {stage === "choose-method" && (
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-11 h-11 bg-blue-500/20 rounded-xl flex items-center justify-center">
                    <KeyRound size={22} className="text-blue-300" />
                  </div>
                  <div>
                    <CardTitle className="text-white text-lg">
                      Reset Your Password
                    </CardTitle>
                    <p className="text-slate-400 text-xs mt-0.5">
                      How would you like to verify your identity?
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <button
                  type="button"
                  onClick={() => setStage("verify-identity")}
                  className="w-full text-left p-4 rounded-xl border-2 border-white/15 bg-white/5 hover:bg-white/10 hover:border-blue-400/60 transition-all"
                  data-ocid="forgot-pw.method-security-question"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <HelpCircle size={18} className="text-amber-300" />
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">
                        Use my Security Question
                      </p>
                      <p className="text-slate-400 text-xs mt-0.5">
                        Answer the security question you set up when creating
                        your account.
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setStage("email-reset-request")}
                  className="w-full text-left p-4 rounded-xl border-2 border-white/15 bg-white/5 hover:bg-white/10 hover:border-blue-400/60 transition-all"
                  data-ocid="forgot-pw.method-email"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Mail size={18} className="text-blue-300" />
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">
                        Send Reset Email
                      </p>
                      <p className="text-slate-400 text-xs mt-0.5">
                        Receive a password reset link at your registered email
                        address.
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={onBack}
                  className="w-full flex items-center justify-center gap-1.5 text-slate-400 text-xs hover:text-slate-200 transition-colors mt-2"
                  data-ocid="forgot-pw.back-link"
                >
                  <ArrowLeft size={13} />
                  Back to Sign In
                </button>
              </CardContent>
            </Card>
          )}

          {/* ── Stage: Verify Identity (Security Question) ── */}
          {stage === "verify-identity" && (
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-11 h-11 bg-amber-500/20 rounded-xl flex items-center justify-center">
                    <HelpCircle size={22} className="text-amber-300" />
                  </div>
                  <div>
                    <CardTitle className="text-white text-lg">
                      Security Question Verification
                    </CardTitle>
                    <p className="text-slate-400 text-xs mt-0.5">
                      Verify your identity to reset your portal password
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                {!hasSQ ? (
                  <div className="text-center py-6 space-y-4">
                    <div className="w-14 h-14 bg-destructive/20 rounded-full flex items-center justify-center mx-auto">
                      <Lock size={24} className="text-red-400" />
                    </div>
                    <div>
                      <p className="text-white font-semibold">
                        No recovery method found
                      </p>
                      <p className="text-slate-400 text-sm mt-1 leading-relaxed">
                        You haven't set up a security question yet. Try the
                        email reset method instead, or contact your system
                        administrator.
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStage("choose-method")}
                      className="w-full border-white/20 text-white hover:bg-white/10 gap-2"
                    >
                      <ArrowLeft size={15} />
                      Back to Reset Options
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-3">
                      <p className="text-xs text-slate-400 mb-1 font-medium uppercase tracking-wide">
                        Security Question
                      </p>
                      <p className="text-white text-sm font-medium">
                        {securityQuestion}
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <Label
                        htmlFor={answerInputId}
                        className="text-slate-300 text-sm"
                      >
                        Your Answer
                      </Label>
                      <PasswordInputField
                        id={answerInputId}
                        value={answer}
                        onChange={(v) => {
                          setAnswer(v);
                          setAnswerError("");
                        }}
                        placeholder="Enter your security answer"
                        data-ocid="forgot-pw.answer-input"
                        autoFocus
                      />
                      {answerError && (
                        <div className="flex items-start gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2.5 mt-1">
                          <AlertCircle
                            size={14}
                            className="mt-0.5 flex-shrink-0"
                          />
                          {answerError}
                        </div>
                      )}
                    </div>

                    <Button
                      type="button"
                      onClick={handleVerifyIdentity}
                      disabled={loading || !answer.trim()}
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold gap-2"
                      data-ocid="forgot-pw.verify-btn"
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                          Verifying…
                        </>
                      ) : (
                        <>
                          <ShieldCheck size={16} />
                          Verify Identity
                        </>
                      )}
                    </Button>

                    <button
                      type="button"
                      onClick={() => setStage("choose-method")}
                      className="w-full flex items-center justify-center gap-1.5 text-slate-400 text-xs hover:text-slate-200 transition-colors"
                      data-ocid="forgot-pw.back-link"
                    >
                      <ArrowLeft size={13} />
                      Back to Reset Options
                    </button>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* ── Stage: Email Reset Request ── */}
          {stage === "email-reset-request" && (
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-11 h-11 bg-blue-500/20 rounded-xl flex items-center justify-center">
                    <Mail size={22} className="text-blue-300" />
                  </div>
                  <div>
                    <CardTitle className="text-white text-lg">
                      Email Password Reset
                    </CardTitle>
                    <p className="text-slate-400 text-xs mt-0.5">
                      Enter your registered email address
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-1.5">
                  <Label
                    htmlFor={emailInputId}
                    className="text-slate-300 text-sm"
                  >
                    Registered Email Address
                  </Label>
                  <Input
                    id={emailInputId}
                    type="email"
                    value={emailInput}
                    onChange={(e) => {
                      setEmailInput(e.target.value);
                      setEmailError("");
                    }}
                    placeholder="you@university.edu.ng"
                    className="bg-white/5 border-white/20 text-white placeholder:text-slate-600"
                    autoFocus
                    data-ocid="forgot-pw.email-input"
                  />
                  {emailError && (
                    <div className="flex items-start gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2.5 mt-1">
                      <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                      {emailError}
                    </div>
                  )}
                </div>

                <Button
                  type="button"
                  onClick={handleEmailRequest}
                  disabled={loading || !emailInput.trim()}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold gap-2"
                  data-ocid="forgot-pw.email-submit-btn"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Processing…
                    </>
                  ) : (
                    <>
                      <Mail size={16} />
                      Send Reset Link
                    </>
                  )}
                </Button>

                <button
                  type="button"
                  onClick={() => setStage("choose-method")}
                  className="w-full flex items-center justify-center gap-1.5 text-slate-400 text-xs hover:text-slate-200 transition-colors"
                  data-ocid="forgot-pw.back-link"
                >
                  <ArrowLeft size={13} />
                  Back to Reset Options
                </button>
              </CardContent>
            </Card>
          )}

          {/* ── Stage: Email Reset Preview ── */}
          {stage === "email-reset-preview" && (
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-11 h-11 bg-blue-500/20 rounded-xl flex items-center justify-center">
                    <Mail size={22} className="text-blue-300" />
                  </div>
                  <div>
                    <CardTitle className="text-white text-lg">
                      Reset Email Preview
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Demo mode banner */}
                <div className="flex items-start gap-2 text-xs text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2.5">
                  <AlertCircle size={12} className="mt-0.5 flex-shrink-0" />
                  <span>
                    📧 <strong>Email sending is currently in demo mode.</strong>{" "}
                    In production, this email would be sent automatically. Click
                    "Continue to Reset" to proceed.
                  </span>
                </div>

                {/* Simulated email card */}
                <div className="rounded-lg border border-white/20 bg-white/5 overflow-hidden font-mono text-xs">
                  {/* Email header */}
                  <div className="bg-white/10 border-b border-white/15 px-4 py-2.5 space-y-1">
                    <div className="flex gap-2">
                      <span className="text-slate-400 w-16 flex-shrink-0">
                        FROM:
                      </span>
                      <span className="text-slate-200">
                        noreply@unidigital.edu.ng
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-slate-400 w-16 flex-shrink-0">
                        TO:
                      </span>
                      <span className="text-slate-200 break-all">
                        {foundUser?.email ?? emailInput}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-slate-400 w-16 flex-shrink-0">
                        SUBJECT:
                      </span>
                      <span className="text-white font-semibold">
                        UniDigital Password Reset Request
                      </span>
                    </div>
                  </div>
                  {/* Email body */}
                  <div className="px-4 py-4 space-y-3 font-sans text-sm text-slate-200 leading-relaxed">
                    <p>Dear {foundUser?.name ?? "User"},</p>
                    <p>
                      A password reset was requested for your UniDigital
                      account. Click the link below to reset your password:
                    </p>
                    <div className="flex justify-center my-3">
                      <span className="inline-block bg-blue-500 text-white text-xs px-5 py-2.5 rounded-lg font-semibold cursor-default">
                        Reset My Password →
                      </span>
                    </div>
                    <p className="text-slate-400 text-xs">
                      This link expires in{" "}
                      <strong className="text-white">30 minutes</strong>. If you
                      didn't request this, please contact your system
                      administrator.
                    </p>
                    <hr className="border-white/10" />
                    <p className="text-xs text-slate-500">
                      — UniDigital MIS Team
                      <br />
                      Federal University of Education, Kontagora
                    </p>
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={() => {
                    setResetMethod("email");
                    setStage("set-password");
                  }}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold gap-2"
                  data-ocid="forgot-pw.email-continue-btn"
                >
                  <KeyRound size={16} />
                  Continue to Reset →
                </Button>

                <button
                  type="button"
                  onClick={() => setStage("email-reset-request")}
                  className="w-full flex items-center justify-center gap-1.5 text-slate-400 text-xs hover:text-slate-200 transition-colors"
                >
                  <ArrowLeft size={13} />
                  Back
                </button>
              </CardContent>
            </Card>
          )}

          {/* ── Stage: Set New Password ── */}
          {stage === "set-password" && (
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-11 h-11 bg-green-500/20 rounded-xl flex items-center justify-center">
                    <KeyRound size={22} className="text-green-300" />
                  </div>
                  <div>
                    <CardTitle className="text-white text-lg">
                      Reset Password
                    </CardTitle>
                    <p className="text-slate-400 text-xs mt-0.5">
                      {resetMethod === "email"
                        ? "Email verified — set your new portal password"
                        : "Identity verified — set your new portal password"}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2.5 text-green-300 text-xs">
                  <CheckCircle2 size={14} className="flex-shrink-0" />
                  {resetMethod === "email"
                    ? "Email reset confirmed. You can now set a new password."
                    : "Identity verified successfully. You can now set a new password."}
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor={newPwInputId}
                    className="text-slate-300 text-sm"
                  >
                    New Password
                  </Label>
                  <PasswordInputField
                    id={newPwInputId}
                    value={newPassword}
                    onChange={(v) => {
                      setNewPassword(v);
                      setPwError("");
                    }}
                    placeholder="At least 6 characters"
                    data-ocid="forgot-pw.new-password-input"
                    autoFocus
                  />
                  {newPassword && <StrengthBar pw={newPassword} />}
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor={confirmPwInputId}
                    className="text-slate-300 text-sm"
                  >
                    Confirm New Password
                  </Label>
                  <PasswordInputField
                    id={confirmPwInputId}
                    value={confirmPassword}
                    onChange={(v) => {
                      setConfirmPassword(v);
                      setPwError("");
                    }}
                    placeholder="Re-enter your new password"
                    data-ocid="forgot-pw.confirm-password-input"
                  />
                </div>

                {confirmPassword && newPassword && (
                  <p
                    className={`text-xs flex items-center gap-1.5 ${
                      newPassword === confirmPassword
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >
                    {newPassword === confirmPassword ? (
                      <>
                        <CheckCircle2 size={12} /> Passwords match
                      </>
                    ) : (
                      <>
                        <AlertCircle size={12} /> Passwords do not match
                      </>
                    )}
                  </p>
                )}

                {pwError && (
                  <div className="flex items-start gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2.5">
                    <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                    {pwError}
                  </div>
                )}

                <Button
                  type="button"
                  onClick={handleSetPassword}
                  disabled={
                    loading ||
                    !newPassword ||
                    !confirmPassword ||
                    newPassword !== confirmPassword
                  }
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold gap-2"
                  data-ocid="forgot-pw.reset-btn"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Saving…
                    </>
                  ) : (
                    <>
                      <KeyRound size={16} />
                      Save New Password
                    </>
                  )}
                </Button>

                <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-xs text-slate-400 space-y-1">
                  <p className="font-semibold text-slate-300">
                    Password requirements
                  </p>
                  <p>• Minimum 6 characters</p>
                  <p>
                    • Use uppercase, numbers, and symbols for a strong password
                  </p>
                  <p>• Do not use easily guessable information</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ── Stage: Success ── */}
          {stage === "success" && (
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardContent className="p-8 text-center space-y-5">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 size={32} className="text-green-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">
                    Password Reset Successful!
                  </h2>
                  <p className="text-slate-400 text-sm mt-2 leading-relaxed">
                    Your portal password has been updated. You can now sign in
                    with your new password.
                  </p>
                </div>
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg px-4 py-3 text-xs text-green-300">
                  Redirecting to Sign In in 3 seconds…
                </div>
                <Button
                  type="button"
                  onClick={() => {
                    if (successTimerRef.current)
                      clearTimeout(successTimerRef.current);
                    onResetComplete();
                  }}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold gap-2"
                  data-ocid="forgot-pw.go-to-signin.btn"
                >
                  Go to Sign In Now
                </Button>
              </CardContent>
            </Card>
          )}

          <p className="text-center text-slate-500 text-xs mt-5">
            Need help? Contact your institution's MIS unit.
          </p>
        </div>
      </main>

      <footer className="px-5 py-3 text-center border-t border-white/10">
        <p className="text-slate-600 text-xs">
          © {new Date().getFullYear()} UniDigital · Federal University of
          Education, Kontagora · Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
