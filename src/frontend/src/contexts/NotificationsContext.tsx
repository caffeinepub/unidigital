import {
  type ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

export type NotificationType = "info" | "success" | "warning" | "urgent";

export interface Notification {
  id: string;
  role: string;
  message: string;
  type: NotificationType;
  timestamp: Date;
  read: boolean;
  link?: string;
}

interface NotificationsContextValue {
  notifications: Notification[];
  unreadCount: (role: string) => number;
  addNotification: (
    roles: string[],
    message: string,
    type: NotificationType,
    link?: string,
  ) => void;
  markRead: (id: string) => void;
  markAllRead: (role: string) => void;
}

const NotificationsContext = createContext<NotificationsContextValue | null>(
  null,
);

const STORAGE_KEY = "unidigital_notifications";

function makeId(): string {
  return `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function buildSeedNotifications(): Notification[] {
  const now = Date.now();
  const mins = (m: number) => new Date(now - m * 60 * 1000);
  const hrs = (h: number) => new Date(now - h * 60 * 60 * 1000);
  const days = (d: number) => new Date(now - d * 24 * 60 * 60 * 1000);

  return [
    // Admin notifications
    {
      id: "seed-admin-1",
      role: "admin",
      message:
        "5 new admission applications are pending review in the admissions queue.",
      type: "info",
      timestamp: hrs(2),
      read: false,
    },
    {
      id: "seed-admin-2",
      role: "admin",
      message:
        "Dr. Chukwu Adaora submitted a leave request — awaiting your approval.",
      type: "info",
      timestamp: hrs(5),
      read: false,
    },
    {
      id: "seed-admin-3",
      role: "admin",
      message:
        "Result approval queue: 12 exam results are awaiting HOD review before senate submission.",
      type: "warning",
      timestamp: hrs(8),
      read: false,
    },
    {
      id: "seed-admin-4",
      role: "admin",
      message:
        "Senate meeting scheduled for Friday 10:00 AM — Room 101, Main Admin Block.",
      type: "info",
      timestamp: days(1),
      read: true,
    },
    {
      id: "seed-admin-5",
      role: "admin",
      message:
        "System maintenance window: tonight 02:00 – 04:00 AM. Portal will be briefly unavailable.",
      type: "urgent",
      timestamp: days(2),
      read: true,
    },
    {
      id: "seed-admin-6",
      role: "admin",
      message:
        "Institution profile updated successfully. All module toggles are active.",
      type: "success",
      timestamp: days(3),
      read: true,
    },

    // Lecturer notifications
    {
      id: "seed-lecturer-1",
      role: "lecturer",
      message:
        "CSC 101 Mid-Term CBT: 35 out of 40 students have submitted. 5 are still in progress.",
      type: "success",
      timestamp: hrs(1),
      read: false,
    },
    {
      id: "seed-lecturer-2",
      role: "lecturer",
      message:
        "HOD requires you to resubmit results for PHY 201 — review rejection reason in Result Status.",
      type: "warning",
      timestamp: hrs(4),
      read: false,
    },
    {
      id: "seed-lecturer-3",
      role: "lecturer",
      message:
        "12 students submitted the MTH 202 assignment. Review and grade before the deadline.",
      type: "info",
      timestamp: hrs(6),
      read: false,
    },
    {
      id: "seed-lecturer-4",
      role: "lecturer",
      message:
        "Result entry deadline for 2023/2024 First Semester: June 15th. Please submit all results.",
      type: "urgent",
      timestamp: days(1),
      read: true,
    },
    {
      id: "seed-lecturer-5",
      role: "lecturer",
      message:
        "CA scores for CSC 302 were saved successfully and are visible to students.",
      type: "success",
      timestamp: days(2),
      read: true,
    },

    // Student notifications
    {
      id: "seed-student-1",
      role: "student",
      message:
        "CSC 101 Mid-Term CBT is now active — you have 30 minutes to complete the exam.",
      type: "urgent",
      timestamp: hrs(1),
      read: false,
    },
    {
      id: "seed-student-2",
      role: "student",
      message:
        "Your MTH 201 exam result has been published. Log in to view your result slip.",
      type: "success",
      timestamp: hrs(3),
      read: false,
    },
    {
      id: "seed-student-3",
      role: "student",
      message:
        "Outstanding tuition fee balance of ₦75,000 is due by June 30th. Pay via the Fees portal.",
      type: "warning",
      timestamp: hrs(7),
      read: false,
    },
    {
      id: "seed-student-4",
      role: "student",
      message:
        "Your lecture timetable has been updated. Check the Timetable page for changes.",
      type: "info",
      timestamp: days(1),
      read: true,
    },
    {
      id: "seed-student-5",
      role: "student",
      message:
        "Course registration for 2024/2025 First Semester is now open. Register before the deadline.",
      type: "info",
      timestamp: days(2),
      read: true,
    },

    // Bursary notifications
    {
      id: "seed-bursary-1",
      role: "bursary",
      message:
        "₦2.5M in outstanding fee balances for 2024/2025 session — 15 students overdue.",
      type: "warning",
      timestamp: hrs(2),
      read: false,
    },
    {
      id: "seed-bursary-2",
      role: "bursary",
      message:
        "Payment received: Alice Obi (CSC/2021/001) paid ₦150,000 — account now cleared.",
      type: "success",
      timestamp: hrs(5),
      read: false,
    },
    {
      id: "seed-bursary-3",
      role: "bursary",
      message:
        "Monthly payroll processing is due in 3 days. Ensure all payroll entries are confirmed.",
      type: "info",
      timestamp: hrs(9),
      read: false,
    },
    {
      id: "seed-bursary-4",
      role: "bursary",
      message:
        "Bulk invoice generation completed: 120 invoices created for 2024/2025 First Semester.",
      type: "success",
      timestamp: days(1),
      read: true,
    },
    {
      id: "seed-bursary-5",
      role: "bursary",
      message:
        "Finance reconciliation report for Q1 2025 is ready. Collection rate: 78%.",
      type: "info",
      timestamp: days(2),
      read: true,
    },

    // HR notifications
    {
      id: "seed-hr-1",
      role: "hr",
      message:
        "New staff leave request: Dr. Adewale requests 5 days from April 7. Pending your approval.",
      type: "info",
      timestamp: hrs(2),
      read: false,
    },
    {
      id: "seed-hr-2",
      role: "hr",
      message:
        "Q1 Staff Appraisals submission deadline is March 31st. 18 of 35 staff have submitted.",
      type: "warning",
      timestamp: hrs(4),
      read: false,
    },
    {
      id: "seed-hr-3",
      role: "hr",
      message:
        "3 staff members recorded unexcused absences this week. Review in the Attendance module.",
      type: "urgent",
      timestamp: hrs(8),
      read: false,
    },
    {
      id: "seed-hr-4",
      role: "hr",
      message:
        "New hire confirmed: Dr. Fatima Aliyu joins the Engineering Department on April 1st.",
      type: "success",
      timestamp: days(1),
      read: true,
    },
    {
      id: "seed-hr-5",
      role: "hr",
      message:
        "Travel request from Prof. Bello approved for the NANS conference — March 28-30.",
      type: "success",
      timestamp: days(2),
      read: true,
    },

    // HOD notifications
    {
      id: "seed-hod-1",
      role: "hod",
      message:
        "12 exam results from your department are pending your approval before senate submission.",
      type: "urgent",
      timestamp: hrs(1),
      read: false,
    },
    {
      id: "seed-hod-2",
      role: "hod",
      message:
        "Department analytics Q1 2025 report is ready. Pass rate: 82%. Click Dept. Analytics to view.",
      type: "success",
      timestamp: hrs(3),
      read: false,
    },
    {
      id: "seed-hod-3",
      role: "hod",
      message:
        "CSC 401 exam results submitted by Lecturer Emeka Nwosu — ready for your review.",
      type: "info",
      timestamp: hrs(6),
      read: false,
    },
    {
      id: "seed-hod-4",
      role: "hod",
      message:
        "Senate requires departmental student enrollment report by Friday COB. Please prepare.",
      type: "warning",
      timestamp: days(1),
      read: true,
    },
    {
      id: "seed-hod-5",
      role: "hod",
      message:
        "Result for MTH 201 approved and forwarded to Faculty Dean for further review.",
      type: "success",
      timestamp: days(2),
      read: true,
    },

    // Alumni notifications
    {
      id: "seed-alumni-1",
      role: "alumni",
      message:
        "New job posted: DevOps Engineer at Microsoft Nigeria — apply before April 15.",
      type: "info",
      timestamp: mins(30),
      read: false,
    },
    {
      id: "seed-alumni-2",
      role: "alumni",
      message:
        "Alumni Gala 2026 — May 15th, Abuja Sheraton. Register now to secure your seat.",
      type: "info",
      timestamp: days(2),
      read: false,
    },
    {
      id: "seed-alumni-3",
      role: "alumni",
      message:
        "Keep your profile up to date so fellow alumni and recruiters can connect with you.",
      type: "info",
      timestamp: days(3),
      read: true,
    },
  ];
}

function serializeNotifications(notifications: Notification[]): string {
  return JSON.stringify(
    notifications.map((n) => ({ ...n, timestamp: n.timestamp.toISOString() })),
  );
}

function deserializeNotifications(raw: string): Notification[] {
  try {
    const parsed = JSON.parse(raw);
    return parsed.map(
      (n: Omit<Notification, "timestamp"> & { timestamp: string }) => ({
        ...n,
        timestamp: new Date(n.timestamp),
      }),
    );
  } catch {
    return [];
  }
}

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) return deserializeNotifications(stored);
    return buildSeedNotifications();
  });

  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, serializeNotifications(notifications));
  }, [notifications]);

  const unreadCount = (role: string): number =>
    notifications.filter(
      (n) => (n.role === role || n.role === "all") && !n.read,
    ).length;

  const addNotification = (
    roles: string[],
    message: string,
    type: NotificationType,
    link?: string,
  ) => {
    const newOnes: Notification[] = roles.map((role) => ({
      id: makeId(),
      role,
      message,
      type,
      timestamp: new Date(),
      read: false,
      link,
    }));
    setNotifications((prev) => [...newOnes, ...prev]);
  };

  const markRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  };

  const markAllRead = (role: string) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.role === role || n.role === "all" ? { ...n, read: true } : n,
      ),
    );
  };

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markRead,
        markAllRead,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications(): NotificationsContextValue {
  const ctx = useContext(NotificationsContext);
  if (!ctx)
    throw new Error(
      "useNotifications must be used within NotificationsProvider",
    );
  return ctx;
}
