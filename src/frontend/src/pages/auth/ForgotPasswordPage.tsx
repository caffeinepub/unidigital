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
  saveLocalPassword,
  validatePasswordStrength,
  verifySecurityAnswer,
} from "../../utils/authUtils";

export interface ForgotPasswordPageProps {
  onBack: () => void;
  /** Called after a successful reset so caller can navigate to sign-in. */
  onResetComplete: () => void;
}

type Stage = "verify-identity" | "set-password" | "success";

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
}: ForgotPasswordPageProps) {
  const [stage, setStage] = useState<Stage>("verify-identity");
  const [answer, setAnswer] = useState("");
  const [answerError, setAnswerError] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwError, setPwError] = useState("");
  const [loading, setLoading] = useState(false);
  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const securityQuestion = getSecurityQuestion();
  const hasSQ = hasSecurityQuestion();

  const answerInputId = useId();
  const newPwInputId = useId();
  const confirmPwInputId = useId();

  function handleVerifyIdentity() {
    setAnswerError("");
    if (!answer.trim()) {
      setAnswerError("Please enter your security answer.");
      return;
    }
    setLoading(true);
    // Simulate slight delay for realism
    setTimeout(() => {
      const correct = verifySecurityAnswer(answer);
      if (correct) {
        logPasswordReset("success");
        setStage("set-password");
      } else {
        logPasswordReset("failed");
        setAnswerError(
          "Incorrect answer. Please try again or contact your system administrator.",
        );
      }
      setLoading(false);
    }, 600);
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
      saveLocalPassword(newPassword);
      setStage("success");
      setLoading(false);
      // Auto-redirect after 3 seconds
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
          {/* ── Stage: Verify Identity ── */}
          {stage === "verify-identity" && (
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-11 h-11 bg-amber-500/20 rounded-xl flex items-center justify-center">
                    <HelpCircle size={22} className="text-amber-300" />
                  </div>
                  <div>
                    <CardTitle className="text-white text-lg">
                      Forgot Password
                    </CardTitle>
                    <p className="text-slate-400 text-xs mt-0.5">
                      Verify your identity to reset your portal password
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                {!hasSQ ? (
                  /* No security question set */
                  <div className="text-center py-6 space-y-4">
                    <div className="w-14 h-14 bg-destructive/20 rounded-full flex items-center justify-center mx-auto">
                      <Lock size={24} className="text-red-400" />
                    </div>
                    <div>
                      <p className="text-white font-semibold">
                        No recovery method found
                      </p>
                      <p className="text-slate-400 text-sm mt-1 leading-relaxed">
                        You haven't set up a security question yet. Please
                        contact your system administrator to reset your account,
                        or sign in with Internet Identity and update your
                        security settings.
                      </p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-left text-xs text-slate-400 space-y-1">
                      <p className="font-semibold text-slate-300">
                        To set up a recovery method:
                      </p>
                      <p>
                        1. Sign in using Internet Identity (your primary
                        credential)
                      </p>
                      <p>
                        2. Go to{" "}
                        <strong className="text-white">My Profile</strong> →{" "}
                        <strong className="text-white">Security</strong> tab
                      </p>
                      <p>3. Set a security question and answer</p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onBack}
                      className="w-full border-white/20 text-white hover:bg-white/10 gap-2"
                      data-ocid="forgot-pw.back-to-login.btn"
                    >
                      <ArrowLeft size={15} />
                      Back to Sign In
                    </Button>
                  </div>
                ) : (
                  /* Security question form */
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
                      onClick={onBack}
                      className="w-full flex items-center justify-center gap-1.5 text-slate-400 text-xs hover:text-slate-200 transition-colors"
                      data-ocid="forgot-pw.back-link"
                    >
                      <ArrowLeft size={13} />
                      Back to Sign In
                    </button>
                  </>
                )}
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
                      Identity verified — set your new portal password
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Verified banner */}
                <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2.5 text-green-300 text-xs">
                  <CheckCircle2 size={14} className="flex-shrink-0" />
                  Identity verified successfully. You can now set a new
                  password.
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

                {/* Match indicator */}
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

      {/* Footer */}
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
