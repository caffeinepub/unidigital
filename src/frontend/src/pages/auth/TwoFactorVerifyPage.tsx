import {
  AlertCircle,
  ArrowLeft,
  Building2,
  CheckCircle2,
  Clock,
  Eye,
  EyeOff,
  KeyRound,
  LifeBuoy,
  RefreshCw,
  Shield,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
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
  disable2FAForUser,
  get2FAAttemptCount,
  get2FAConfig,
  get2FALockoutSecondsRemaining,
  getTOTPSecondsRemaining,
  is2FALockedOut,
  log2FAEvent,
  record2FAFailure,
  reset2FAAttempts,
  verify2FACode,
  verifySecurityAnswer,
} from "../../utils/authUtils";

export interface TwoFactorVerifyPageProps {
  userId: string;
  onVerified: () => void;
  onCancel: () => void;
}

export function TwoFactorVerifyPage({
  userId,
  onVerified,
  onCancel,
}: TwoFactorVerifyPageProps) {
  const [code, setCode] = useState("");
  const [useBackup, setUseBackup] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(getTOTPSecondsRemaining());
  const [lockoutSeconds, setLockoutSeconds] = useState(0);
  const [attemptCount, setAttemptCount] = useState(get2FAAttemptCount(userId));
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryMethod, setRecoveryMethod] = useState<
    "backup" | "security-question" | null
  >(null);
  const [recoveryAnswer, setRecoveryAnswer] = useState("");
  const [recoveryError, setRecoveryError] = useState("");
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const codeInputRef = useRef<HTMLInputElement>(null);

  // TOTP countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft(getTOTPSecondsRemaining());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Lockout countdown
  useEffect(() => {
    if (!is2FALockedOut(userId)) {
      setLockoutSeconds(0);
      return;
    }
    setLockoutSeconds(get2FALockoutSecondsRemaining(userId));
    const interval = setInterval(() => {
      const remaining = get2FALockoutSecondsRemaining(userId);
      setLockoutSeconds(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        reset2FAAttempts(userId);
        setAttemptCount(0);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [userId]);

  // Auto-focus code input
  useEffect(() => {
    codeInputRef.current?.focus();
  }, []);

  const isLockedOut = lockoutSeconds > 0;

  function handleVerify() {
    if (!code.trim()) {
      setError("Please enter the code.");
      return;
    }
    if (isLockedOut) return;

    setLoading(true);
    setError("");

    setTimeout(() => {
      const result = verify2FACode(userId, code.trim());
      if (result === "totp-valid" || result === "backup-valid") {
        reset2FAAttempts(userId);
        log2FAEvent(
          userId,
          "2fa-verified",
          `Verified via ${result === "backup-valid" ? "backup code" : "TOTP"}`,
        );
        onVerified();
      } else {
        record2FAFailure(userId);
        const newCount = get2FAAttemptCount(userId);
        setAttemptCount(newCount);
        const locked = is2FALockedOut(userId);
        if (locked) {
          setLockoutSeconds(get2FALockoutSecondsRemaining(userId));
          setError("Too many failed attempts. Locked for 5 minutes.");
        } else {
          const remaining = 5 - newCount;
          setError(
            result === "invalid"
              ? `Invalid code. ${remaining} attempt${remaining !== 1 ? "s" : ""} remaining before lockout.`
              : "Invalid code.",
          );
        }
        setCode("");
      }
      setLoading(false);
    }, 600);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleVerify();
  }

  function handleSecurityQuestionRecovery() {
    setRecoveryError("");
    if (!recoveryAnswer.trim()) {
      setRecoveryError("Please enter your security answer.");
      return;
    }
    setRecoveryLoading(true);
    setTimeout(() => {
      const { verifySecurityAnswer: vsq } = { verifySecurityAnswer };
      if (vsq(recoveryAnswer)) {
        // Disable 2FA and allow login
        disable2FAForUser(userId);
        reset2FAAttempts(userId);
        log2FAEvent(
          userId,
          "2fa-recovery",
          "2FA disabled via security question recovery",
        );
        setRecoveryLoading(false);
        onVerified();
      } else {
        setRecoveryError("Incorrect answer. Please try again.");
        setRecoveryLoading(false);
      }
    }, 600);
  }

  const config = get2FAConfig(userId);
  const remainingBackupCodes =
    (config?.backupCodes?.length ?? 0) - (config?.usedCodes?.length ?? 0);

  const formatLockout = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

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
          Two-Factor Authentication
        </span>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md space-y-4">
          {/* ── Lockout Screen ── */}
          {isLockedOut && (
            <Card className="bg-red-900/20 border-red-500/30 backdrop-blur-sm">
              <CardContent className="p-7 text-center space-y-4">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
                  <ShieldAlert size={32} className="text-red-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">
                    Account Temporarily Locked
                  </h2>
                  <p className="text-slate-300 text-sm mt-2">
                    Too many failed 2FA attempts. Please wait before trying
                    again.
                  </p>
                </div>
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 flex items-center justify-center gap-2 text-red-300">
                  <Clock size={16} />
                  <span className="font-mono font-bold text-lg">
                    {formatLockout(lockoutSeconds)}
                  </span>
                  <span className="text-sm">remaining</span>
                </div>
                <button
                  type="button"
                  onClick={onCancel}
                  className="w-full flex items-center justify-center gap-1.5 text-slate-400 text-xs hover:text-slate-200 transition-colors"
                >
                  <ArrowLeft size={13} />
                  Back to Sign In
                </button>
              </CardContent>
            </Card>
          )}

          {/* ── Main Verify Card ── */}
          {!isLockedOut && !showRecovery && (
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-11 h-11 bg-blue-500/20 rounded-xl flex items-center justify-center">
                    <Shield size={22} className="text-blue-300" />
                  </div>
                  <div>
                    <CardTitle className="text-white text-lg">
                      Two-Factor Authentication
                    </CardTitle>
                    <p className="text-slate-400 text-xs mt-0.5">
                      Enter the code from your authenticator app
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Mode toggle */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setUseBackup(false);
                      setCode("");
                      setError("");
                    }}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${!useBackup ? "bg-blue-500 text-white" : "bg-white/5 text-slate-400 hover:bg-white/10"}`}
                  >
                    Authenticator Code
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setUseBackup(true);
                      setCode("");
                      setError("");
                    }}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${useBackup ? "bg-blue-500 text-white" : "bg-white/5 text-slate-400 hover:bg-white/10"}`}
                  >
                    Backup Code
                  </button>
                </div>

                {/* TOTP timer (only shown for authenticator mode) */}
                {!useBackup && (
                  <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-lg px-3 py-2">
                    <span className="text-slate-400 text-xs">
                      Code refreshes in
                    </span>
                    <div className="flex items-center gap-1.5">
                      <div
                        className="w-4 h-4 relative"
                        title={`${secondsLeft}s remaining`}
                        aria-label={`TOTP code refreshes in ${secondsLeft} seconds`}
                      >
                        <svg
                          viewBox="0 0 16 16"
                          className="w-4 h-4 -rotate-90"
                          aria-hidden="true"
                        >
                          <circle
                            cx="8"
                            cy="8"
                            r="6"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="text-slate-700"
                          />
                          <circle
                            cx="8"
                            cy="8"
                            r="6"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeDasharray={`${(2 * Math.PI * 6).toFixed(1)}`}
                            strokeDashoffset={`${((1 - secondsLeft / 30) * 2 * Math.PI * 6).toFixed(1)}`}
                            className={
                              secondsLeft <= 5
                                ? "text-red-400"
                                : "text-blue-400"
                            }
                          />
                        </svg>
                      </div>
                      <span
                        className={`font-mono text-sm font-bold ${secondsLeft <= 5 ? "text-red-400" : "text-blue-300"}`}
                      >
                        {secondsLeft}s
                      </span>
                    </div>
                  </div>
                )}

                {/* Code input */}
                <div className="space-y-1.5">
                  <Label className="text-slate-300 text-sm">
                    {useBackup ? "Backup Code (8 characters)" : "6-Digit Code"}
                  </Label>
                  <Input
                    ref={codeInputRef}
                    type="text"
                    inputMode={useBackup ? "text" : "numeric"}
                    maxLength={useBackup ? 8 : 6}
                    value={code}
                    onChange={(e) => {
                      setCode(
                        e.target.value
                          .toUpperCase()
                          .replace(/[^0-9A-Z]/g, "")
                          .slice(0, useBackup ? 8 : 6),
                      );
                      setError("");
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder={useBackup ? "XXXXXXXX" : "000000"}
                    className="bg-white/5 border-white/20 text-white text-center font-mono text-2xl tracking-widest placeholder:text-slate-600 h-14"
                    data-ocid="2fa.code-input"
                    autoComplete="one-time-code"
                  />
                  {useBackup && (
                    <p className="text-xs text-slate-500">
                      {remainingBackupCodes} backup code
                      {remainingBackupCodes !== 1 ? "s" : ""} remaining
                    </p>
                  )}
                </div>

                {error && (
                  <div className="flex items-start gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2.5">
                    <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                    {error}
                  </div>
                )}

                {attemptCount > 0 && !error && (
                  <p className="text-xs text-amber-400 text-center">
                    {attemptCount} failed attempt{attemptCount !== 1 ? "s" : ""}{" "}
                    — {5 - attemptCount} remaining
                  </p>
                )}

                <Button
                  type="button"
                  onClick={handleVerify}
                  disabled={
                    loading ||
                    !code.trim() ||
                    (useBackup ? code.length < 8 : code.length < 6)
                  }
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold gap-2"
                  data-ocid="2fa.verify-btn"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Verifying…
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={16} />
                      Verify &amp; Sign In
                    </>
                  )}
                </Button>

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={onCancel}
                    className="flex items-center gap-1.5 text-slate-400 text-xs hover:text-slate-200 transition-colors"
                    data-ocid="2fa.cancel-btn"
                  >
                    <ArrowLeft size={13} />
                    Back to Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowRecovery(true)}
                    className="flex items-center gap-1.5 text-amber-400 text-xs hover:text-amber-300 transition-colors"
                    data-ocid="2fa.trouble-link"
                  >
                    <LifeBuoy size={13} />
                    Having trouble?
                  </button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ── Recovery Modal/Panel ── */}
          {!isLockedOut && showRecovery && (
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-11 h-11 bg-amber-500/20 rounded-xl flex items-center justify-center">
                    <LifeBuoy size={22} className="text-amber-300" />
                  </div>
                  <div>
                    <CardTitle className="text-white text-lg">
                      2FA Recovery
                    </CardTitle>
                    <p className="text-slate-400 text-xs mt-0.5">
                      Choose a recovery method
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                {recoveryMethod === null && (
                  <>
                    <p className="text-slate-300 text-sm">
                      If you can't access your authenticator app, you can
                      recover your account using one of the methods below.
                    </p>
                    <div className="space-y-3">
                      <button
                        type="button"
                        onClick={() => setRecoveryMethod("backup")}
                        className="w-full text-left p-4 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 transition-colors"
                      >
                        <p className="text-white font-medium text-sm flex items-center gap-2">
                          <KeyRound size={15} className="text-blue-400" />
                          Use a Backup Code
                        </p>
                        <p className="text-slate-400 text-xs mt-1">
                          Enter one of the 10 backup codes you saved when
                          setting up 2FA.
                        </p>
                      </button>
                      <button
                        type="button"
                        onClick={() => setRecoveryMethod("security-question")}
                        className="w-full text-left p-4 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 transition-colors"
                      >
                        <p className="text-white font-medium text-sm flex items-center gap-2">
                          <Shield size={15} className="text-amber-400" />
                          Answer Security Question
                        </p>
                        <p className="text-slate-400 text-xs mt-1">
                          Verify your identity via your security question to
                          disable 2FA and log in. This will be flagged in the
                          security audit log.
                        </p>
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowRecovery(false)}
                      className="w-full flex items-center justify-center gap-1.5 text-slate-400 text-xs hover:text-slate-200 transition-colors"
                    >
                      <ArrowLeft size={13} />
                      Back to Code Entry
                    </button>
                  </>
                )}

                {recoveryMethod === "backup" && (
                  <>
                    <p className="text-slate-300 text-sm">
                      Enter one of your 8-character backup codes below.
                    </p>
                    <div className="space-y-1.5">
                      <Label className="text-slate-300 text-sm">
                        Backup Code
                      </Label>
                      <Input
                        type="text"
                        maxLength={8}
                        value={code}
                        onChange={(e) => {
                          setCode(
                            e.target.value
                              .toUpperCase()
                              .replace(/[^A-Z0-9]/g, "")
                              .slice(0, 8),
                          );
                          setError("");
                        }}
                        placeholder="XXXXXXXX"
                        className="bg-white/5 border-white/20 text-white text-center font-mono text-xl tracking-widest"
                        autoFocus
                        data-ocid="2fa.recovery-backup-input"
                      />
                    </div>
                    {error && (
                      <div className="flex items-start gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2.5">
                        <AlertCircle
                          size={14}
                          className="mt-0.5 flex-shrink-0"
                        />
                        {error}
                      </div>
                    )}
                    <Button
                      type="button"
                      onClick={handleVerify}
                      disabled={loading || code.length < 8}
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold"
                    >
                      {loading ? "Verifying…" : "Use Backup Code"}
                    </Button>
                    <button
                      type="button"
                      onClick={() => {
                        setRecoveryMethod(null);
                        setCode("");
                        setError("");
                      }}
                      className="w-full flex items-center justify-center gap-1.5 text-slate-400 text-xs hover:text-slate-200 transition-colors"
                    >
                      <ArrowLeft size={13} />
                      Back to Recovery Options
                    </button>
                  </>
                )}

                {recoveryMethod === "security-question" && (
                  <>
                    <div className="flex items-start gap-2 text-xs text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2.5">
                      <AlertCircle size={12} className="mt-0.5 flex-shrink-0" />
                      This action will disable 2FA on your account and will be
                      logged as a security event.
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-slate-300 text-sm">
                        Security Answer
                      </Label>
                      <div className="relative">
                        <Input
                          type={showAnswer ? "text" : "password"}
                          value={recoveryAnswer}
                          onChange={(e) => {
                            setRecoveryAnswer(e.target.value);
                            setRecoveryError("");
                          }}
                          placeholder="Enter your security answer"
                          className="bg-white/5 border-white/20 text-white pr-10"
                          autoFocus
                          data-ocid="2fa.recovery-answer-input"
                        />
                        <button
                          type="button"
                          onClick={() => setShowAnswer((p) => !p)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                          aria-label={
                            showAnswer ? "Hide answer" : "Show answer"
                          }
                        >
                          {showAnswer ? (
                            <EyeOff size={16} />
                          ) : (
                            <Eye size={16} />
                          )}
                        </button>
                      </div>
                    </div>
                    {recoveryError && (
                      <div className="flex items-start gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2.5">
                        <AlertCircle
                          size={14}
                          className="mt-0.5 flex-shrink-0"
                        />
                        {recoveryError}
                      </div>
                    )}
                    <Button
                      type="button"
                      onClick={handleSecurityQuestionRecovery}
                      disabled={recoveryLoading || !recoveryAnswer.trim()}
                      className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold"
                      data-ocid="2fa.recovery-disable-btn"
                    >
                      {recoveryLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />{" "}
                          Verifying…
                        </>
                      ) : (
                        <>
                          <RefreshCw size={15} className="mr-1" /> Disable 2FA
                          &amp; Sign In
                        </>
                      )}
                    </Button>
                    <button
                      type="button"
                      onClick={() => {
                        setRecoveryMethod(null);
                        setRecoveryAnswer("");
                        setRecoveryError("");
                      }}
                      className="w-full flex items-center justify-center gap-1.5 text-slate-400 text-xs hover:text-slate-200 transition-colors"
                    >
                      <ArrowLeft size={13} />
                      Back to Recovery Options
                    </button>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* Hint */}
          {!isLockedOut && !showRecovery && (
            <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-xs text-slate-400 space-y-1">
              <p className="font-semibold text-slate-300">Where is my code?</p>
              <p>
                Open your authenticator app (e.g. Google Authenticator, Authy)
                and enter the 6-digit code shown for UniDigital.
              </p>
            </div>
          )}

          <p className="text-center text-slate-500 text-xs">
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
