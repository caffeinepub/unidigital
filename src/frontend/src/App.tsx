import { useActor, useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useEffect, useRef, useState } from "react";
import { createActor } from "./backend";
import { AppLayout } from "./components/AppLayout";
import { AssignmentProvider } from "./contexts/AssignmentContext";
import { CBTProvider } from "./contexts/CBTContext";
import { ModuleGatingProvider } from "./contexts/ModuleGatingContext";
import { NotificationsProvider } from "./contexts/NotificationsContext";
import { ResultProcessingProvider } from "./contexts/ResultProcessingContext";
import { StaffRequestProvider } from "./contexts/StaffRequestContext";
import { LoginPage } from "./pages/LoginPage";
import { OnboardingPage } from "./pages/OnboardingPage";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { LoginAuditLog } from "./pages/admin/LoginAuditLog";
import { AlumniDashboard } from "./pages/alumni/AlumniDashboard";
import type { AlumniPage } from "./pages/alumni/AlumniDashboard";
import { BursaryDashboard } from "./pages/bursary/BursaryDashboard";
import { HODDashboard } from "./pages/hod/HODDashboard";
import { HRDashboard } from "./pages/hr/HRDashboard";
import { LecturerDashboard } from "./pages/lecturer/LecturerDashboard";
import { ParentDashboard } from "./pages/parent/ParentDashboard";
import { LoginActivityDashboard } from "./pages/shared/LoginActivityDashboard";
import { PublicVerification } from "./pages/shared/PublicVerification";
import { StaffSelfService } from "./pages/shared/StaffSelfService";
import { StudentProfilePortal } from "./pages/shared/StudentProfilePortal";
import { UserProfileSettings } from "./pages/shared/UserProfileSettings";
import { StudentDashboard } from "./pages/student/StudentDashboard";
import { initSampleData, initV6, initV9, initV19 } from "./utils/sampleData";
import {
  recordSessionEnd,
  recordSessionStart,
  seedDemoSessions,
} from "./utils/sessionUtils";

initSampleData();
initV6();
initV9();
initV19();
seedDemoSessions();

type AppState = "loading" | "login" | "onboarding" | "app";

interface UserProfile {
  name: string;
  email: string;
  role: string;
}

export default function App() {
  const { identity, login, clear, isInitializing } = useInternetIdentity();
  const { actor } = useActor(createActor);
  const isAuthenticated = !!identity;

  const [appState, setAppState] = useState<AppState>("loading");
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [activePage, setActivePage] = useState("dashboard");

  const sessionStartedRef = useRef(false);

  useEffect(() => {
    if (isInitializing) return;
    if (!isAuthenticated) {
      setAppState("login");
      sessionStartedRef.current = false;
      return;
    }
    if (actor) {
      (
        actor as unknown as {
          getCallerUserProfile: () => Promise<{
            name: string;
            email: string;
            role: string;
          } | null>;
        }
      )
        .getCallerUserProfile()
        .then(
          (profile: { name: string; email: string; role: string } | null) => {
            if (profile?.role) {
              setUserProfile({
                name: profile.name,
                email: profile.email,
                role: profile.role,
              });
              setActivePage("dashboard");
              setAppState("app");
              if (!sessionStartedRef.current) {
                sessionStartedRef.current = true;
                recordSessionStart(profile.email || profile.name, profile.role);
              }
            } else {
              setAppState("onboarding");
            }
          },
        )
        .catch(() => setAppState("onboarding"));
    }
  }, [isAuthenticated, actor, isInitializing]);

  const handleOnboarding = async (profile: UserProfile) => {
    setUserProfile(profile);
    if (actor) {
      try {
        await (
          actor as unknown as {
            saveCallerUserProfile: (p: UserProfile) => Promise<void>;
          }
        ).saveCallerUserProfile({
          name: profile.name,
          email: profile.email,
          role: profile.role,
        });
      } catch (e) {
        console.error("Failed to save profile", e);
      }
    }
    setActivePage("dashboard");
    setAppState("app");
    if (!sessionStartedRef.current) {
      sessionStartedRef.current = true;
      recordSessionStart(profile.email || profile.name, profile.role);
    }
  };

  const handleLogout = () => {
    recordSessionEnd();
    sessionStartedRef.current = false;
    clear();
    setUserProfile(null);
    setAppState("login");
  };

  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has("verify")) return <PublicVerification />;

  if (appState === "loading" || isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white text-sm">Loading UniDigital...</p>
        </div>
      </div>
    );
  }

  if (appState === "login") return <LoginPage onLogin={login} />;
  if (appState === "onboarding")
    return <OnboardingPage onComplete={handleOnboarding} />;

  const role = userProfile?.role ?? "admin";
  const userId = userProfile?.email ?? userProfile?.name ?? "user";
  const userName = userProfile?.name ?? "User";

  const wrapInLayout = (children: React.ReactNode) => (
    <ModuleGatingProvider>
      <NotificationsProvider>
        <ResultProcessingProvider>
          <CBTProvider>
            <AssignmentProvider>
              <StaffRequestProvider>
                <AppLayout
                  role={role}
                  userName={userName}
                  activePage={activePage}
                  onNavigate={setActivePage}
                  onLogout={handleLogout}
                >
                  {children}
                </AppLayout>
              </StaffRequestProvider>
            </AssignmentProvider>
          </CBTProvider>
        </ResultProcessingProvider>
      </NotificationsProvider>
    </ModuleGatingProvider>
  );

  if (activePage === "login-activity") {
    return wrapInLayout(
      <LoginActivityDashboard
        userId={userId}
        userName={userName}
        role={role}
      />,
    );
  }

  if (activePage === "my-profile") {
    return wrapInLayout(
      <UserProfileSettings
        currentName={userProfile?.name ?? ""}
        currentEmail={userProfile?.email ?? ""}
        currentRole={userProfile?.role ?? ""}
        onProfileUpdated={(updated) => {
          setUserProfile(updated);
        }}
      />,
    );
  }

  if (activePage === "student-profiles" || activePage === "student-profile") {
    const portalRole =
      role === "student" ||
      role === "admin" ||
      role === "lecturer" ||
      role === "hod" ||
      role === "hr" ||
      role === "bursary"
        ? (role as "admin" | "student" | "lecturer" | "hod" | "hr" | "bursary")
        : "admin";
    return wrapInLayout(
      <StudentProfilePortal
        userRole={portalRole}
        userEmail={userProfile?.email}
      />,
    );
  }

  if (activePage === "staff-profile") {
    return wrapInLayout(
      <StaffSelfService userRole={role} userName={userProfile?.name} />,
    );
  }

  type AdminPage =
    | "dashboard"
    | "students"
    | "courses"
    | "staff"
    | "admissions"
    | "memos"
    | "reports"
    | "registration-admin"
    | "timetable-admin"
    | "attendance-admin"
    | "documents-admin"
    | "hostel-admin"
    | "library-admin"
    | "academic-calendar"
    | "exam-schedule-admin"
    | "announcements-admin"
    | "grade-config"
    | "result-approval-admin"
    | "result-publication"
    | "academic-status"
    | "graduation-clearance"
    | "analytics-v2"
    | "data-import"
    | "ai-dashboard"
    | "progression-admin"
    | "appraisal-admin"
    | "alumni-admin"
    | "documents-scans-admin"
    | "combination-courses"
    | "score-audit-log"
    | "result-sheet-admin"
    | "transcript-management"
    | "dept-analytics"
    | "faculty-results"
    | "senate-presentation"
    | "student-records"
    | "pass-fail-lists"
    | "hostel-room-inventory"
    | "donations-admin"
    | "complaints-admin"
    | "clearance-letter"
    | "staff-directory"
    | "document-verification"
    | "disciplinary-records"
    | "senate-minutes"
    | "internal-memos"
    | "data-export"
    | "hostel-allocation"
    | "hostel-transfers"
    | "timetable-conflicts"
    | "cbt-analytics"
    | "cbt-resit"
    | "registration-management"
    | "manual-registration"
    | "bulk-registration"
    | "ai-scan-registration"
    | "ai-bulk-registration"
    | "registration-doc-archive"
    | "settings"
    | "promotion-results"
    | "analytics-dashboard"
    | "jamb-portal"
    | "fee-management"
    | "academic-calendar-admin"
    | "course-management"
    | "examination-management"
    | "staff-management"
    | "budget-management"
    | "scholarship-management"
    | "notice-board"
    | "transfer-management"
    | "deferment-management"
    | "result-verification"
    | "advanced-analytics"
    | "system-admin"
    | "course-catalog"
    | "announcement-view"
    | "communication-center-admin"
    | "malpractice-reports"
    | "id-cards"
    | "student-profiles";

  const renderContent = () => {
    if (role === "admin" && activePage === "login-audit-log")
      return <LoginAuditLog />;

    switch (role) {
      case "admin":
        return <AdminDashboard activePage={activePage as AdminPage} />;
      case "student":
        return (
          <StudentDashboard
            activePage={
              activePage as
                | "dashboard"
                | "courses"
                | "results"
                | "fees"
                | "assignments"
                | "exams"
                | "notices"
                | "profile"
                | "registration"
                | "timetable"
                | "attendance"
                | "documents"
                | "hostel"
                | "library"
                | "academic-calendar"
                | "exam-schedule"
                | "announcements"
                | "result-slip"
                | "gpa-summary"
                | "academic-status-student"
                | "graduation-status"
                | "progression"
                | "academic-transcript"
                | "academic-record"
                | "course-materials"
                | "course-history"
                | "payment-history"
                | "complaints"
                | "clearance-letter-student"
                | "disciplinary-record"
                | "reg-status"
                | "fee-payment"
                | "fee-clearance"
                | "transcript-request"
                | "scholarship-application"
                | "department-transfer"
                | "deferment"
                | "course-catalog"
                | "announcements-view"
                | "communication-center"
                | "my-certificates"
            }
            userEmail={userProfile?.email ?? ""}
            userName={userName}
          />
        );
      case "lecturer":
        return (
          <LecturerDashboard
            activePage={
              activePage as
                | "dashboard"
                | "courses"
                | "results"
                | "assignments"
                | "cbt"
                | "students"
                | "memos"
                | "timetable"
                | "attendance-mgmt"
                | "academic-calendar"
                | "exam-schedule-lecturer"
                | "ca-entry"
                | "result-entry"
                | "result-approval-lecturer"
                | "appraisal-self"
                | "combined-results"
                | "student-records"
                | "score-bulk-upload"
                | "training-registration"
                | "training-application"
                | "staff-directory"
                | "course-catalog"
                | "announcement-view"
                | "communication-center"
            }
          />
        );
      case "bursary":
        return (
          <BursaryDashboard
            activePage={
              activePage as
                | "dashboard"
                | "invoices"
                | "payments"
                | "students"
                | "reports"
                | "receipts"
                | "reconciliation"
                | "student-records"
                | "debt-aging"
                | "installment-plans"
                | "fee-waivers"
                | "bursary-reconciliation"
                | "fee-structure"
                | "communication-center"
            }
          />
        );
      case "hr":
        return (
          <HRDashboard
            activePage={
              activePage as
                | "dashboard"
                | "staff"
                | "leaves"
                | "attendance"
                | "reports"
                | "requests"
                | "payroll"
                | "appraisals"
                | "student-records"
                | "staff-training"
                | "training-approval-hr"
                | "staff-directory"
                | "memos"
                | "staff-onboarding"
                | "communication-center"
            }
          />
        );
      case "hod":
        return (
          <HODDashboard
            activePage={
              activePage as
                | "dashboard"
                | "result-approval-hod"
                | "hod-students"
                | "academic-calendar"
                | "dept-analytics"
                | "dept-results"
                | "student-records"
                | "pass-fail-lists"
                | "result-entry-review"
                | "appraisal-review"
                | "complaints-hod"
                | "staff-directory"
                | "training-approval-hod"
                | "disciplinary-records"
                | "memos"
                | "budget-request"
                | "course-catalog"
                | "communication-center"
                | "announcement-view"
                | "curriculum-management"
                | "certificate-courses"
            }
          />
        );
      case "alumni":
        return <AlumniDashboard activePage={activePage as AlumniPage} />;
      case "parent":
        return <ParentDashboard />;
      default:
        return <AdminDashboard activePage={activePage as AdminPage} />;
    }
  };

  return wrapInLayout(renderContent());
}
