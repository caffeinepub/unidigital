import { useEffect, useState } from "react";
import { AppLayout } from "./components/AppLayout";
import { AssignmentProvider } from "./contexts/AssignmentContext";
import { CBTProvider } from "./contexts/CBTContext";
import { NotificationsProvider } from "./contexts/NotificationsContext";
import { ResultProcessingProvider } from "./contexts/ResultProcessingContext";
import { StaffRequestProvider } from "./contexts/StaffRequestContext";
import { useActor } from "./hooks/useActor";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { LoginPage } from "./pages/LoginPage";
import { OnboardingPage } from "./pages/OnboardingPage";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { AlumniDashboard } from "./pages/alumni/AlumniDashboard";
import type { AlumniPage } from "./pages/alumni/AlumniDashboard";
import { BursaryDashboard } from "./pages/bursary/BursaryDashboard";
import { HODDashboard } from "./pages/hod/HODDashboard";
import { HRDashboard } from "./pages/hr/HRDashboard";
import { LecturerDashboard } from "./pages/lecturer/LecturerDashboard";
import { StudentDashboard } from "./pages/student/StudentDashboard";
import { initSampleData, initV6, initV9, initV19 } from "./utils/sampleData";

initSampleData();
initV6();
initV9();
initV19();

type AppState = "loading" | "login" | "onboarding" | "app";

interface UserProfile {
  name: string;
  email: string;
  role: string;
}

export default function App() {
  const { identity, login, clear, isInitializing } = useInternetIdentity();
  const { actor } = useActor();
  const isAuthenticated = !!identity;

  const [appState, setAppState] = useState<AppState>("loading");
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [activePage, setActivePage] = useState("dashboard");

  useEffect(() => {
    if (isInitializing) return;
    if (!isAuthenticated) {
      setAppState("login");
      return;
    }
    if (actor) {
      actor
        .getCallerUserProfile()
        .then((profile) => {
          if (profile?.role) {
            setUserProfile({
              name: profile.name,
              email: profile.email,
              role: profile.role,
            });
            setActivePage("dashboard");
            setAppState("app");
          } else {
            setAppState("onboarding");
          }
        })
        .catch(() => setAppState("onboarding"));
    }
  }, [isAuthenticated, actor, isInitializing]);

  const handleOnboarding = async (profile: UserProfile) => {
    setUserProfile(profile);
    if (actor) {
      try {
        await actor.saveCallerUserProfile({
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
  };

  const handleLogout = () => {
    clear();
    setUserProfile(null);
    setAppState("login");
  };

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

  const renderContent = () => {
    switch (role) {
      case "admin":
        return (
          <AdminDashboard
            activePage={
              activePage as
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
                | "analytics-dashboard"
                | "hostel-room-inventory"
                | "donations-admin"
                | "complaints-admin"
                | "clearance-letter"
                | "staff-directory"
            }
          />
        );
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
            }
            userEmail={userProfile?.email ?? ""}
            userName={userProfile?.name ?? ""}
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
                | "staff-directory"
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
                | "staff-directory"
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
            }
          />
        );
      case "alumni":
        return <AlumniDashboard activePage={activePage as AlumniPage} />;
      default:
        return (
          <AdminDashboard
            activePage={
              activePage as
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
            }
          />
        );
    }
  };

  return (
    <NotificationsProvider>
      <ResultProcessingProvider>
        <CBTProvider>
          <AssignmentProvider>
            <StaffRequestProvider>
              <AppLayout
                role={role}
                userName={userProfile?.name ?? "User"}
                activePage={activePage}
                onNavigate={setActivePage}
                onLogout={handleLogout}
              >
                {renderContent()}
              </AppLayout>
            </StaffRequestProvider>
          </AssignmentProvider>
        </CBTProvider>
      </ResultProcessingProvider>
    </NotificationsProvider>
  );
}
