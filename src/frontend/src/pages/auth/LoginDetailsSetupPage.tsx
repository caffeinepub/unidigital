import {
  AlertCircle,
  Building2,
  CheckCircle2,
  ChevronRight,
  Eye,
  EyeOff,
  HelpCircle,
  KeyRound,
  ShieldCheck,
} from "lucide-react";
import { useId, useState } from "react";
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
  passwordStrength,
  saveLocalPassword,
  saveSecurityQA,
  validatePasswordStrength,
} from "../../utils/authUtils";

interface LoginDetailsSetupPageProps {
  onSetupComplete: () => void;
}

type Step = 1 | 2;

const SECURITY_QUESTIONS = [
  "What was the name of your first school?",
  "What is your mother's maiden name?",
  "What was the name of your childhood pet?",
  "What city were you born in?",
  "What was your childhood nickname?",
  "What is your oldest sibling's middle name?",
];

const SETUP_DONE_KEY = "unidigital_setup_done";

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
  const s = passwordStrength(pw);
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
            className={`h-1.5 flex-1 rounded-full transition-colors ${i <= s ? colors[s] : "bg-muted"}`}
          />
        ))}
      </div>
      {pw && (
        <p className="text-xs text-muted-foreground">
          Strength:{" "}
          <span
            className={
              s <= 1
                ? "text-destructive"
                : s === 2
                  ? "text-amber-500"
                  : "text-green-600"
            }
          >
            {labels[s] ?? ""}
          </span>
        </p>
      )}
    </div>
  );
}

export function LoginDetailsSetupPage({
  onSetupComplete,
}: LoginDetailsSetupPageProps) {
  const [step, setStep] = useState<Step>(1);

  // Step 1 fields
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwError, setPwError] = useState("");

  // Step 2 fields
  const [selectedQuestion, setSelectedQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [confirmAnswer, setConfirmAnswer] = useState("");
  const [sqError, setSqError] = useState("");

  const pwId = useId();
  const confirmPwId = useId();
  const answerFieldId = useId();
  const confirmAnswerFieldId = useId();

  const isStep1Valid =
    !validatePasswordStrength(password) &&
    password === confirmPassword &&
    password.length >= 6;

  function handleStep1Next() {
    setPwError("");
    const err = validatePasswordStrength(password);
    if (err) {
      setPwError(err);
      return;
    }
    if (password !== confirmPassword) {
      setPwError("Passwords do not match.");
      return;
    }
    setStep(2);
  }

  function handleCompleteSetup() {
    setSqError("");
    if (!selectedQuestion) {
      setSqError("Please select a security question.");
      return;
    }
    if (!answer.trim()) {
      setSqError("Please enter your answer.");
      return;
    }
    if (answer.trim().toLowerCase() !== confirmAnswer.trim().toLowerCase()) {
      setSqError("Answers do not match. Please re-enter.");
      return;
    }
    // Persist
    saveLocalPassword(password);
    try {
      saveSecurityQA(selectedQuestion, answer);
      localStorage.setItem(SETUP_DONE_KEY, "true");
      // Mark setup completed in profile settings
      const existing = JSON.parse(
        localStorage.getItem("unidigital_profile_settings") || "{}",
      );
      localStorage.setItem(
        "unidigital_profile_settings",
        JSON.stringify({
          ...existing,
          hasCompletedSetup: true,
        }),
      );
    } catch (_) {
      /* ignore */
    }
    onSetupComplete();
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
        <div className="w-full max-w-md space-y-5">
          {/* Progress indicator */}
          <div className="flex items-center justify-center gap-3">
            <div className="flex items-center gap-1.5">
              <span
                className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center ${
                  step === 1
                    ? "bg-blue-500 text-white"
                    : "bg-green-500 text-white"
                }`}
              >
                {step === 1 ? "1" : "✓"}
              </span>
              <span
                className={`text-xs ${step === 1 ? "text-white font-semibold" : "text-slate-400"}`}
              >
                Set Password
              </span>
            </div>
            <div className="w-12 h-px bg-slate-600" />
            <div className="flex items-center gap-1.5">
              <span
                className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center ${
                  step === 2
                    ? "bg-blue-500 text-white"
                    : "bg-slate-700 text-slate-400"
                }`}
              >
                2
              </span>
              <span
                className={`text-xs ${step === 2 ? "text-white font-semibold" : "text-slate-400"}`}
              >
                Security Question
              </span>
            </div>
          </div>

          {/* ── Step 1: Set Password ── */}
          {step === 1 && (
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-11 h-11 bg-blue-500/20 rounded-xl flex items-center justify-center">
                    <KeyRound size={22} className="text-blue-300" />
                  </div>
                  <div>
                    <CardTitle className="text-white text-lg">
                      Create Your Login Password
                    </CardTitle>
                    <p className="text-slate-400 text-xs mt-0.5">
                      Step 1 of 2 — Set a secure password for your UniDigital
                      portal access
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-1.5">
                  <Label htmlFor={pwId} className="text-slate-300 text-sm">
                    New Password
                  </Label>
                  <PasswordInputField
                    id={pwId}
                    value={password}
                    onChange={(v) => {
                      setPassword(v);
                      setPwError("");
                    }}
                    placeholder="At least 6 characters"
                    data-ocid="setup.password-input"
                    autoFocus
                  />
                  {password && <StrengthBar pw={password} />}
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor={confirmPwId}
                    className="text-slate-300 text-sm"
                  >
                    Confirm Password
                  </Label>
                  <PasswordInputField
                    id={confirmPwId}
                    value={confirmPassword}
                    onChange={(v) => {
                      setConfirmPassword(v);
                      setPwError("");
                    }}
                    placeholder="Re-enter your password"
                    data-ocid="setup.confirm-password-input"
                  />
                </div>

                {/* Match indicator */}
                {confirmPassword && password && (
                  <p
                    className={`text-xs flex items-center gap-1.5 ${
                      password === confirmPassword
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >
                    {password === confirmPassword ? (
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
                  onClick={handleStep1Next}
                  disabled={!isStep1Valid}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold gap-2"
                  data-ocid="setup.next-btn"
                >
                  <ChevronRight size={16} />
                  Next: Set Security Question
                </Button>

                <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-xs text-slate-400 space-y-1">
                  <p className="font-semibold text-slate-300">
                    Password requirements
                  </p>
                  <p>• Minimum 6 characters</p>
                  <p>
                    • Use uppercase, numbers, and symbols for a stronger
                    password
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ── Step 2: Security Question ── */}
          {step === 2 && (
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-11 h-11 bg-purple-500/20 rounded-xl flex items-center justify-center">
                    <HelpCircle size={22} className="text-purple-300" />
                  </div>
                  <div>
                    <CardTitle className="text-white text-lg">
                      Set Your Security Question
                    </CardTitle>
                    <p className="text-slate-400 text-xs mt-0.5">
                      Step 2 of 2 — This will help you recover your account if
                      you forget your password
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-1.5">
                  <Label className="text-slate-300 text-sm">
                    Security Question
                  </Label>
                  <select
                    value={selectedQuestion}
                    onChange={(e) => {
                      setSelectedQuestion(e.target.value);
                      setSqError("");
                    }}
                    className="w-full h-10 px-3 rounded-md border border-white/20 bg-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    data-ocid="setup.security-question-select"
                  >
                    <option value="" className="bg-slate-800">
                      — Select a security question —
                    </option>
                    {SECURITY_QUESTIONS.map((q) => (
                      <option key={q} value={q} className="bg-slate-800">
                        {q}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor={answerFieldId}
                    className="text-slate-300 text-sm"
                  >
                    Your Answer
                  </Label>
                  <PasswordInputField
                    id={answerFieldId}
                    value={answer}
                    onChange={(v) => {
                      setAnswer(v);
                      setSqError("");
                    }}
                    placeholder="Enter your answer"
                    data-ocid="setup.security-answer-input"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor={confirmAnswerFieldId}
                    className="text-slate-300 text-sm"
                  >
                    Confirm Answer
                  </Label>
                  <PasswordInputField
                    id={confirmAnswerFieldId}
                    value={confirmAnswer}
                    onChange={(v) => {
                      setConfirmAnswer(v);
                      setSqError("");
                    }}
                    placeholder="Re-enter your answer"
                    data-ocid="setup.confirm-answer-input"
                  />
                </div>

                {/* Answer match indicator */}
                {answer && confirmAnswer && (
                  <p
                    className={`text-xs flex items-center gap-1.5 ${
                      answer.trim().toLowerCase() ===
                      confirmAnswer.trim().toLowerCase()
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >
                    {answer.trim().toLowerCase() ===
                    confirmAnswer.trim().toLowerCase() ? (
                      <>
                        <CheckCircle2 size={12} /> Answers match
                      </>
                    ) : (
                      <>
                        <AlertCircle size={12} /> Answers do not match
                      </>
                    )}
                  </p>
                )}

                {sqError && (
                  <div className="flex items-start gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2.5">
                    <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                    {sqError}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-xs text-slate-400 hover:text-slate-200 transition-colors underline"
                    data-ocid="setup.back-btn"
                  >
                    ← Back
                  </button>

                  <Button
                    type="button"
                    onClick={handleCompleteSetup}
                    disabled={
                      !selectedQuestion ||
                      !answer.trim() ||
                      !confirmAnswer.trim() ||
                      answer.trim().toLowerCase() !==
                        confirmAnswer.trim().toLowerCase()
                    }
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold gap-2"
                    data-ocid="setup.complete-btn"
                  >
                    <ShieldCheck size={16} />
                    Complete Setup
                  </Button>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-xs text-slate-400 space-y-1">
                  <p className="font-semibold text-slate-300">
                    Keep your answer safe
                  </p>
                  <p>
                    • Your answer is stored locally and is case-insensitive.
                  </p>
                  <p>
                    • This answer is needed for password recovery — remember it.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
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
