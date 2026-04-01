import { type ReactNode, createContext, useContext, useReducer } from "react";

export type RequestType = "leave" | "travel" | "training";
export type RequestStatus = "pending" | "approved" | "rejected";
export type ApprovalStage = "hod" | "dean" | "dvc" | "vc";

export interface StageRecord {
  stage: ApprovalStage;
  decision: "approved" | "rejected";
  comment: string;
  decidedBy: string;
  decidedAt: number;
}

export interface StaffRequest {
  id: string;
  submittedByName: string;
  submittedByRole: string;
  requestType: RequestType;
  description: string;
  status: RequestStatus;
  currentStage: ApprovalStage;
  stageHistory: StageRecord[];
  createdAt: number;
}

const SEED_REQUESTS: StaffRequest[] = [
  {
    id: "req001",
    submittedByName: "Dr. Chukwuemeka Obi",
    submittedByRole: "lecturer",
    requestType: "leave",
    description:
      "Annual leave for family vacation. Requesting 2 weeks leave from April 5 to April 19.",
    status: "pending",
    currentStage: "dean",
    stageHistory: [
      {
        stage: "hod",
        decision: "approved",
        comment: "Approved. Coverage arranged.",
        decidedBy: "HOD Computer Science",
        decidedAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
      },
    ],
    createdAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
  },
  {
    id: "req002",
    submittedByName: "Mrs. Funmilayo Adeyemi",
    submittedByRole: "hr",
    requestType: "training",
    description:
      "Requesting approval to attend the 3-day HR Leadership Workshop in Abuja (March 18-20).",
    status: "approved",
    currentStage: "vc",
    stageHistory: [
      {
        stage: "hod",
        decision: "approved",
        comment: "Supported.",
        decidedBy: "HOD HR",
        decidedAt: Date.now() - 10 * 24 * 60 * 60 * 1000,
      },
      {
        stage: "dean",
        decision: "approved",
        comment: "Approved. Relevant to role.",
        decidedBy: "Dean of Administration",
        decidedAt: Date.now() - 8 * 24 * 60 * 60 * 1000,
      },
      {
        stage: "dvc",
        decision: "approved",
        comment: "Approved.",
        decidedBy: "DVC Administration",
        decidedAt: Date.now() - 6 * 24 * 60 * 60 * 1000,
      },
      {
        stage: "vc",
        decision: "approved",
        comment: "Approved. Well done.",
        decidedBy: "Vice Chancellor",
        decidedAt: Date.now() - 4 * 24 * 60 * 60 * 1000,
      },
    ],
    createdAt: Date.now() - 12 * 24 * 60 * 60 * 1000,
  },
  {
    id: "req003",
    submittedByName: "Mr. Babatunde Salami",
    submittedByRole: "lecturer",
    requestType: "travel",
    description:
      "Official travel to represent the department at the national STEM conference in Lagos.",
    status: "pending",
    currentStage: "hod",
    stageHistory: [],
    createdAt: Date.now() - 1 * 24 * 60 * 60 * 1000,
  },
];

type Action =
  | { type: "SUBMIT"; request: StaffRequest }
  | {
      type: "PROCESS";
      requestId: string;
      decision: "approved" | "rejected";
      comment: string;
      decidedBy: string;
    };

function nextStage(current: ApprovalStage): ApprovalStage | null {
  const chain: ApprovalStage[] = ["hod", "dean", "dvc", "vc"];
  const idx = chain.indexOf(current);
  return idx < chain.length - 1 ? chain[idx + 1] : null;
}

function reducer(state: StaffRequest[], action: Action): StaffRequest[] {
  switch (action.type) {
    case "SUBMIT":
      return [...state, action.request];
    case "PROCESS": {
      return state.map((r) => {
        if (r.id !== action.requestId) return r;
        const record: StageRecord = {
          stage: r.currentStage,
          decision: action.decision,
          comment: action.comment,
          decidedBy: action.decidedBy,
          decidedAt: Date.now(),
        };
        const newHistory = [...r.stageHistory, record];
        if (action.decision === "rejected") {
          return { ...r, status: "rejected", stageHistory: newHistory };
        }
        const next = nextStage(r.currentStage);
        if (!next) {
          return { ...r, status: "approved", stageHistory: newHistory };
        }
        return { ...r, currentStage: next, stageHistory: newHistory };
      });
    }
    default:
      return state;
  }
}

interface StaffRequestContextValue {
  requests: StaffRequest[];
  submitRequest: (r: StaffRequest) => void;
  processRequest: (
    requestId: string,
    decision: "approved" | "rejected",
    comment: string,
    decidedBy: string,
  ) => void;
}

const StaffRequestContext = createContext<StaffRequestContextValue | null>(
  null,
);

export function StaffRequestProvider({ children }: { children: ReactNode }) {
  const [requests, dispatch] = useReducer(reducer, SEED_REQUESTS);

  return (
    <StaffRequestContext.Provider
      value={{
        requests,
        submitRequest: (r) => dispatch({ type: "SUBMIT", request: r }),
        processRequest: (requestId, decision, comment, decidedBy) =>
          dispatch({
            type: "PROCESS",
            requestId,
            decision,
            comment,
            decidedBy,
          }),
      }}
    >
      {children}
    </StaffRequestContext.Provider>
  );
}

export function useStaffRequests() {
  const ctx = useContext(StaffRequestContext);
  if (!ctx)
    throw new Error(
      "useStaffRequests must be used within StaffRequestProvider",
    );
  return ctx;
}
