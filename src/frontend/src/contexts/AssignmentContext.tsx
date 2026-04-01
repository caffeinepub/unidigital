import { type ReactNode, createContext, useContext, useReducer } from "react";

export interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: number; // timestamp ms
  courseCode: string;
  createdByLecturerId: string;
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  studentMatric: string;
  studentName: string;
  fileNames: string[]; // local file names (demo)
  fileUrls: string[]; // object URLs for demo
  submittedAt: number;
  grade?: string;
  feedback?: string;
}

const SEED_ASSIGNMENTS: Assignment[] = [
  {
    id: "assign001",
    title: "Programming Fundamentals Report",
    description:
      "Write a 5-page report on programming paradigms comparing OOP and functional programming with code examples.",
    dueDate: Date.now() + 7 * 24 * 60 * 60 * 1000,
    courseCode: "CSC101",
    createdByLecturerId: "STAFF001",
  },
  {
    id: "assign002",
    title: "Database Design Project",
    description:
      "Design an ER diagram and implement a normalized database schema for a library management system.",
    dueDate: Date.now() + 14 * 24 * 60 * 60 * 1000,
    courseCode: "CSC302",
    createdByLecturerId: "STAFF001",
  },
  {
    id: "assign003",
    title: "Calculus Problem Set 3",
    description:
      "Solve all problems in Chapter 5 (Integration by Parts) and submit handwritten or typed solutions.",
    dueDate: Date.now() + 3 * 24 * 60 * 60 * 1000,
    courseCode: "MTH201",
    createdByLecturerId: "STAFF002",
  },
];

const SEED_SUBMISSIONS: AssignmentSubmission[] = [
  {
    id: "sub001",
    assignmentId: "assign001",
    studentMatric: "CSC/2021/001",
    studentName: "Adaeze Okonkwo",
    fileNames: ["programming_report.pdf"],
    fileUrls: [],
    submittedAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
    grade: "A",
    feedback: "Excellent work! Well-structured analysis.",
  },
];

type Action =
  | { type: "CREATE_ASSIGNMENT"; assignment: Assignment }
  | { type: "SUBMIT"; submission: AssignmentSubmission }
  | { type: "GRADE"; submissionId: string; grade: string; feedback: string };

interface State {
  assignments: Assignment[];
  submissions: AssignmentSubmission[];
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "CREATE_ASSIGNMENT":
      return {
        ...state,
        assignments: [...state.assignments, action.assignment],
      };
    case "SUBMIT":
      return {
        ...state,
        submissions: [...state.submissions, action.submission],
      };
    case "GRADE":
      return {
        ...state,
        submissions: state.submissions.map((s) =>
          s.id === action.submissionId
            ? { ...s, grade: action.grade, feedback: action.feedback }
            : s,
        ),
      };
    default:
      return state;
  }
}

interface AssignmentContextValue {
  assignments: Assignment[];
  submissions: AssignmentSubmission[];
  createAssignment: (a: Assignment) => void;
  submitAssignment: (s: AssignmentSubmission) => void;
  gradeSubmission: (
    submissionId: string,
    grade: string,
    feedback: string,
  ) => void;
}

const AssignmentContext = createContext<AssignmentContextValue | null>(null);

export function AssignmentProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    assignments: SEED_ASSIGNMENTS,
    submissions: SEED_SUBMISSIONS,
  });

  return (
    <AssignmentContext.Provider
      value={{
        assignments: state.assignments,
        submissions: state.submissions,
        createAssignment: (a) =>
          dispatch({ type: "CREATE_ASSIGNMENT", assignment: a }),
        submitAssignment: (s) => dispatch({ type: "SUBMIT", submission: s }),
        gradeSubmission: (submissionId, grade, feedback) =>
          dispatch({ type: "GRADE", submissionId, grade, feedback }),
      }}
    >
      {children}
    </AssignmentContext.Provider>
  );
}

export function useAssignments() {
  const ctx = useContext(AssignmentContext);
  if (!ctx)
    throw new Error("useAssignments must be used within AssignmentProvider");
  return ctx;
}
