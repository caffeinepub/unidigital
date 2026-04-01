import { type ReactNode, createContext, useContext, useReducer } from "react";

export type AnswerKey = "A" | "B" | "C" | "D";

export interface Question {
  id: string;
  text: string;
  options: { A: string; B: string; C: string; D: string };
  correct: AnswerKey;
  marks: number;
}

export interface Exam {
  id: string;
  title: string;
  courseCode: string;
  duration: number; // minutes
  totalMarks: number;
  status: "active" | "closed" | "draft";
  questions: Question[];
}

export interface Submission {
  examId: string;
  studentId: string;
  studentName: string;
  answers: Record<string, AnswerKey>;
  score: number;
  totalMarks: number;
  submittedAt: Date;
  timeTaken: number; // seconds
}

const SEED_EXAMS: Exam[] = [
  {
    id: "exam001",
    title: "Introduction to Computing - Mid Term",
    courseCode: "CSC101",
    duration: 30,
    totalMarks: 50,
    status: "active",
    questions: [
      {
        id: "q1",
        text: "Which of the following is NOT a programming paradigm?",
        options: {
          A: "Object-Oriented",
          B: "Functional",
          C: "Relational",
          D: "Procedural",
        },
        correct: "C",
        marks: 10,
      },
      {
        id: "q2",
        text: "What does CPU stand for?",
        options: {
          A: "Central Processing Unit",
          B: "Computer Personal Unit",
          C: "Central Program Utility",
          D: "Core Processing Unit",
        },
        correct: "A",
        marks: 10,
      },
      {
        id: "q3",
        text: "Binary number 1010 in decimal is:",
        options: { A: "8", B: "10", C: "12", D: "14" },
        correct: "B",
        marks: 10,
      },
      {
        id: "q4",
        text: "Which storage type is volatile?",
        options: { A: "Hard Disk", B: "SSD", C: "RAM", D: "ROM" },
        correct: "C",
        marks: 10,
      },
      {
        id: "q5",
        text: "The Internet Protocol version currently in widespread use is:",
        options: { A: "IPv3", B: "IPv4", C: "IPv6", D: "IPv8" },
        correct: "B",
        marks: 10,
      },
    ],
  },
  {
    id: "exam002",
    title: "Database Systems - Final Exam",
    courseCode: "CSC302",
    duration: 45,
    totalMarks: 50,
    status: "active",
    questions: [
      {
        id: "q1",
        text: "Which SQL command is used to remove a table from a database?",
        options: {
          A: "DELETE TABLE",
          B: "DROP TABLE",
          C: "REMOVE TABLE",
          D: "TRUNCATE TABLE",
        },
        correct: "B",
        marks: 10,
      },
      {
        id: "q2",
        text: "A primary key constraint ensures:",
        options: {
          A: "No null values only",
          B: "Unique values only",
          C: "Both unique and not null",
          D: "Foreign key reference",
        },
        correct: "C",
        marks: 10,
      },
      {
        id: "q3",
        text: "ACID in database transactions stands for:",
        options: {
          A: "Atomicity, Consistency, Isolation, Durability",
          B: "Access, Control, Index, Data",
          C: "Atomicity, Concurrency, Integrity, Durability",
          D: "Access, Consistency, Isolation, Delivery",
        },
        correct: "A",
        marks: 10,
      },
      {
        id: "q4",
        text: "Which normal form eliminates transitive functional dependencies?",
        options: { A: "1NF", B: "2NF", C: "3NF", D: "BCNF" },
        correct: "C",
        marks: 10,
      },
      {
        id: "q5",
        text: "The JOIN operation that returns all rows from both tables is:",
        options: {
          A: "INNER JOIN",
          B: "LEFT JOIN",
          C: "RIGHT JOIN",
          D: "FULL OUTER JOIN",
        },
        correct: "D",
        marks: 10,
      },
    ],
  },
];

type Action =
  | { type: "CREATE_EXAM"; exam: Exam }
  | { type: "ADD_QUESTION"; examId: string; question: Question }
  | {
      type: "EDIT_QUESTION";
      examId: string;
      questionId: string;
      updated: Question;
    }
  | { type: "DELETE_QUESTION"; examId: string; questionId: string }
  | { type: "SET_STATUS"; examId: string; status: Exam["status"] }
  | { type: "SUBMIT"; submission: Submission };

interface CBTState {
  exams: Exam[];
  submissions: Submission[];
}

function reducer(state: CBTState, action: Action): CBTState {
  switch (action.type) {
    case "CREATE_EXAM":
      return { ...state, exams: [...state.exams, action.exam] };
    case "ADD_QUESTION":
      return {
        ...state,
        exams: state.exams.map((e) =>
          e.id === action.examId
            ? {
                ...e,
                questions: [...e.questions, action.question],
                totalMarks: e.totalMarks + action.question.marks,
              }
            : e,
        ),
      };
    case "EDIT_QUESTION":
      return {
        ...state,
        exams: state.exams.map((e) =>
          e.id === action.examId
            ? {
                ...e,
                questions: e.questions.map((q) =>
                  q.id === action.questionId ? action.updated : q,
                ),
                totalMarks: e.questions
                  .map((q) => (q.id === action.questionId ? action.updated : q))
                  .reduce((sum, q) => sum + q.marks, 0),
              }
            : e,
        ),
      };
    case "DELETE_QUESTION": {
      return {
        ...state,
        exams: state.exams.map((e) => {
          if (e.id !== action.examId) return e;
          const remaining = e.questions.filter(
            (q) => q.id !== action.questionId,
          );
          return {
            ...e,
            questions: remaining,
            totalMarks: remaining.reduce((sum, q) => sum + q.marks, 0),
          };
        }),
      };
    }
    case "SET_STATUS":
      return {
        ...state,
        exams: state.exams.map((e) =>
          e.id === action.examId ? { ...e, status: action.status } : e,
        ),
      };
    case "SUBMIT":
      return {
        ...state,
        submissions: [...state.submissions, action.submission],
      };
    default:
      return state;
  }
}

interface CBTContextValue {
  exams: Exam[];
  submissions: Submission[];
  createExam: (exam: Exam) => void;
  addQuestion: (examId: string, question: Question) => void;
  editQuestion: (examId: string, questionId: string, updated: Question) => void;
  deleteQuestion: (examId: string, questionId: string) => void;
  setStatus: (examId: string, status: Exam["status"]) => void;
  submitExam: (submission: Submission) => void;
}

const CBTContext = createContext<CBTContextValue | null>(null);

export function CBTProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    exams: SEED_EXAMS,
    submissions: [
      {
        examId: "exam001",
        studentId: "CSC/2021/001",
        studentName: "Adaeze Okonkwo",
        answers: { q1: "C", q2: "A", q3: "B", q4: "C", q5: "B" },
        score: 40,
        totalMarks: 50,
        submittedAt: new Date("2024-03-10T10:30:00"),
        timeTaken: 1450,
      },
      {
        examId: "exam001",
        studentId: "CSC/2021/002",
        studentName: "Emeka Nwosu",
        answers: { q1: "C", q2: "A", q3: "B", q4: "C", q5: "A" },
        score: 30,
        totalMarks: 50,
        submittedAt: new Date("2024-03-10T10:45:00"),
        timeTaken: 1800,
      },
    ],
  });

  return (
    <CBTContext.Provider
      value={{
        exams: state.exams,
        submissions: state.submissions,
        createExam: (exam) => dispatch({ type: "CREATE_EXAM", exam }),
        addQuestion: (examId, question) =>
          dispatch({ type: "ADD_QUESTION", examId, question }),
        editQuestion: (examId, questionId, updated) =>
          dispatch({ type: "EDIT_QUESTION", examId, questionId, updated }),
        deleteQuestion: (examId, questionId) =>
          dispatch({ type: "DELETE_QUESTION", examId, questionId }),
        setStatus: (examId, status) =>
          dispatch({ type: "SET_STATUS", examId, status }),
        submitExam: (submission) => dispatch({ type: "SUBMIT", submission }),
      }}
    >
      {children}
    </CBTContext.Provider>
  );
}

export function useCBT() {
  const ctx = useContext(CBTContext);
  if (!ctx) throw new Error("useCBT must be used within CBTProvider");
  return ctx;
}
