import {
  BookOpen,
  Building2,
  ChevronRight,
  Clock,
  Globe,
  GraduationCap,
  Monitor,
  School,
  ScrollText,
  Telescope,
  Users,
} from "lucide-react";
import { useState } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { ForgotPasswordPage } from "./auth/ForgotPasswordPage";

interface LoginPageProps {
  onLogin: () => void;
}

const INSTITUTION_TYPES = [
  {
    key: "university",
    label: "University",
    sublabel: "B.Sc / B.Ed / B.A Programmes",
    icon: <GraduationCap size={20} />,
    iconBg: "bg-blue-500/20 text-blue-300",
    accent: "border-blue-400/60",
    badge: "NUC",
  },
  {
    key: "polytechnic",
    label: "Polytechnic",
    sublabel: "OND / HND Programmes",
    icon: <Building2 size={20} />,
    iconBg: "bg-cyan-500/20 text-cyan-300",
    accent: "border-cyan-400/60",
    badge: "NBTE",
  },
  {
    key: "college_of_education",
    label: "College of Education",
    sublabel: "NCE / B.Ed Programmes",
    icon: <School size={20} />,
    iconBg: "bg-emerald-500/20 text-emerald-300",
    accent: "border-emerald-400/60",
    badge: "NCCE",
  },
  {
    key: "postgraduate",
    label: "Postgraduate",
    sublabel: "PGD / M.Sc / Ph.D / M.Phil",
    icon: <Telescope size={20} />,
    iconBg: "bg-purple-500/20 text-purple-300",
    accent: "border-purple-400/60",
    badge: "PG",
  },
  {
    key: "certificate",
    label: "Certificate",
    sublabel: "Short courses & professional certs",
    icon: <ScrollText size={20} />,
    iconBg: "bg-amber-500/20 text-amber-300",
    accent: "border-amber-400/60",
    badge: "CERT",
  },
  {
    key: "secondary",
    label: "Secondary School",
    sublabel: "JSS / SS Programmes",
    icon: <BookOpen size={20} />,
    iconBg: "bg-rose-500/20 text-rose-300",
    accent: "border-rose-400/60",
    badge: "WAEC",
  },
  {
    key: "distance_learning",
    label: "Distance Learning",
    sublabel: "Online / blended — 10–15 credits/sem",
    icon: <Globe size={20} />,
    iconBg: "bg-indigo-500/20 text-indigo-300",
    accent: "border-indigo-400/60",
    badge: "DL",
  },
  {
    key: "part_time",
    label: "Part-Time Studies",
    sublabel: "Evening/weekend — 12–16 credits/sem",
    icon: <Clock size={20} />,
    iconBg: "bg-teal-500/20 text-teal-300",
    accent: "border-teal-400/60",
    badge: "PT",
  },
];

type Stage = "select-institution" | "sign-in" | "forgot-password";

export function LoginPage({ onLogin }: LoginPageProps) {
  const [stage, setStage] = useState<Stage>("select-institution");
  const [selectedKey, setSelectedKey] = useState<string | null>(() => {
    try {
      return localStorage.getItem("unidigital_institution_type");
    } catch {
      return null;
    }
  });

  const selected = INSTITUTION_TYPES.find((i) => i.key === selectedKey);

  const handleSelect = (key: string) => {
    setSelectedKey(key);
    try {
      localStorage.setItem("unidigital_institution_type", key);
    } catch {
      // ignore
    }
  };

  const handleProceed = () => {
    setStage("sign-in");
  };

  const handleLogin = () => {
    onLogin();
  };

  // Forgot password renders as a full-page replacement
  if (stage === "forgot-password") {
    return (
      <ForgotPasswordPage
        onBack={() => setStage("sign-in")}
        onResetComplete={() => setStage("sign-in")}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 flex flex-col">
      {/* Header bar */}
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
        {stage === "select-institution" && (
          <div className="w-full max-w-3xl">
            {/* Title */}
            <div className="text-center mb-7">
              <h2 className="text-2xl md:text-3xl font-bold text-white">
                Select Your Institution Type
              </h2>
              <p className="text-slate-400 mt-2 text-sm">
                Each programme has a dedicated portal. Choose the one that
                applies to you to access the right modules.
              </p>
            </div>

            {/* Institution type grid */}
            <div
              className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6"
              data-ocid="login.institution_grid"
            >
              {INSTITUTION_TYPES.map((inst) => (
                <button
                  key={inst.key}
                  type="button"
                  data-ocid={`login.institution.${inst.key}`}
                  onClick={() => handleSelect(inst.key)}
                  className={`relative group p-4 rounded-xl border-2 bg-white/5 hover:bg-white/10 backdrop-blur-sm text-left transition-all duration-200 ${
                    selectedKey === inst.key
                      ? `${inst.accent} bg-white/15 shadow-lg`
                      : "border-white/15 hover:border-white/30"
                  }`}
                >
                  {/* Selected checkmark */}
                  {selectedKey === inst.key && (
                    <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">✓</span>
                    </div>
                  )}
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2.5 ${inst.iconBg}`}
                  >
                    {inst.icon}
                  </div>
                  <p className="font-semibold text-white text-xs leading-tight mb-0.5">
                    {inst.label}
                  </p>
                  <p className="text-slate-400 text-[11px] leading-snug">
                    {inst.sublabel}
                  </p>
                  <span className="mt-2 inline-block text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-slate-300 font-medium">
                    {inst.badge}
                  </span>
                </button>
              ))}
            </div>

            {/* Proceed button */}
            <div className="flex flex-col items-center gap-3">
              <Button
                onClick={handleProceed}
                disabled={!selectedKey}
                className="px-8 bg-blue-500 hover:bg-blue-600 text-white font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
                size="lg"
                data-ocid="login.proceed_btn"
              >
                {selectedKey ? (
                  <>
                    Proceed to{" "}
                    {
                      INSTITUTION_TYPES.find((i) => i.key === selectedKey)
                        ?.label
                    }{" "}
                    Portal <ChevronRight size={16} className="ml-1 inline" />
                  </>
                ) : (
                  "Select an institution above to continue"
                )}
              </Button>

              {/* Skip for returning users */}
              <button
                type="button"
                onClick={handleLogin}
                className="text-slate-400 text-xs hover:text-slate-200 transition-colors underline"
                data-ocid="login.skip_to_signin"
              >
                Already have an account? Sign in directly →
              </button>
            </div>

            <p className="text-center text-slate-600 text-xs mt-6">
              Not sure which to select? Contact your institution's MIS unit for
              guidance.
            </p>
          </div>
        )}

        {stage === "sign-in" && (
          <div className="w-full max-w-md">
            {/* Selected institution confirmation */}
            {selected && (
              <div
                className={`flex items-center gap-3 bg-white/10 border ${selected.accent} rounded-xl px-4 py-3 mb-6`}
              >
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${selected.iconBg}`}
                >
                  {selected.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm">
                    {selected.label} Portal
                  </p>
                  <p className="text-slate-400 text-xs">{selected.sublabel}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setStage("select-institution")}
                  className="text-slate-400 hover:text-white text-xs underline shrink-0 ml-2"
                  data-ocid="login.change_institution"
                >
                  Change
                </button>
              </div>
            )}

            {/* Login card */}
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardContent className="p-7 space-y-5">
                {/* Brand */}
                <div className="text-center">
                  <div className="w-14 h-14 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Building2 size={28} className="text-white" />
                  </div>
                  <h1 className="text-2xl font-bold text-white">UniDigital</h1>
                  <p className="text-slate-300 mt-1 text-sm">
                    Fully Paperless University Management
                  </p>
                </div>

                {/* Feature summary */}
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    {
                      icon: <GraduationCap size={15} />,
                      label: "Student Portal",
                    },
                    { icon: <Users size={15} />, label: "Staff Portal" },
                    { icon: <BookOpen size={15} />, label: "Course Modules" },
                    { icon: <Monitor size={15} />, label: "CBT & Results" },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center gap-2 text-slate-300 text-xs bg-white/5 rounded-lg px-3 py-2"
                    >
                      <span className="text-blue-400">{item.icon}</span>
                      {item.label}
                    </div>
                  ))}
                </div>

                <Button
                  onClick={handleLogin}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 text-base font-semibold"
                  size="lg"
                  data-ocid="login.sign_in_btn"
                >
                  Sign In with Internet Identity
                </Button>

                {/* Forgot password link */}
                <div className="flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => setStage("forgot-password")}
                    className="text-xs text-blue-400 hover:text-blue-300 transition-colors underline"
                    data-ocid="login.forgot_password_link"
                  >
                    Forgot your portal password?
                  </button>
                </div>

                <p className="text-center text-slate-400 text-xs">
                  Secure, decentralized authentication on the Internet Computer
                </p>

                <button
                  type="button"
                  onClick={() => setStage("select-institution")}
                  className="w-full text-center text-xs text-slate-400 hover:text-slate-200 underline transition-colors"
                  data-ocid="login.back_to_institutions"
                >
                  ← Back to institution selector
                </button>
              </CardContent>
            </Card>

            <p className="text-center text-slate-500 text-xs mt-5">
              Academic Year 2023/2024 · All rights reserved
            </p>
          </div>
        )}
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
