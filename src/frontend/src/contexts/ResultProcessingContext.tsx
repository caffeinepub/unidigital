import { createContext, useContext, useEffect, useState } from "react";
import type {
  AcademicStatusRecord,
  ApprovalLog,
  CAScore,
  ClearanceRecord,
  ExamResult,
  GradeConfigEntry,
} from "../utils/sampleData";
import {
  DEFAULT_GRADE_CONFIG,
  getLocalAcademicStatuses,
  getLocalApprovalLogs,
  getLocalCAScores,
  getLocalClearanceRecords,
  getLocalExamResults,
  getLocalGradeConfig,
  saveLocalAcademicStatuses,
  saveLocalApprovalLogs,
  saveLocalCAScores,
  saveLocalClearanceRecords,
  saveLocalExamResults,
  saveLocalGradeConfig,
} from "../utils/sampleData";

export function computeGPAFromResults(
  results: ExamResult[],
  creditMap: Record<string, number>,
  config: GradeConfigEntry[],
): number {
  const published = results.filter((r) => r.status === "published");
  let totalPoints = 0;
  let totalUnits = 0;
  for (const r of published) {
    const units = creditMap[r.courseCode] ?? 3;
    const entry = config.find(
      (c) => r.totalScore >= c.minScore && r.totalScore <= c.maxScore,
    );
    const pts = entry ? entry.point : 0;
    totalPoints += pts * units;
    totalUnits += units;
  }
  return totalUnits === 0
    ? 0
    : Math.round((totalPoints / totalUnits) * 100) / 100;
}

export function classifyDegree(cgpa: number): string {
  if (cgpa >= 4.5) return "First Class";
  if (cgpa >= 3.5) return "Second Class Upper";
  if (cgpa >= 2.5) return "Second Class Lower";
  if (cgpa >= 1.5) return "Third Class";
  if (cgpa >= 1.0) return "Pass";
  return "Fail";
}

export function getGradeFromScore(
  score: number,
  config: GradeConfigEntry[],
): GradeConfigEntry {
  return (
    config.find((c) => score >= c.minScore && score <= c.maxScore) ??
    config[config.length - 1]
  );
}

interface ResultProcessingContextType {
  gradeConfig: GradeConfigEntry[];
  setGradeConfig: (cfg: GradeConfigEntry[]) => void;
  caScores: CAScore[];
  setCAScores: (data: CAScore[]) => void;
  examResults: ExamResult[];
  setExamResults: (data: ExamResult[]) => void;
  approvalLogs: ApprovalLog[];
  setApprovalLogs: (data: ApprovalLog[]) => void;
  academicStatuses: AcademicStatusRecord[];
  setAcademicStatuses: (data: AcademicStatusRecord[]) => void;
  clearanceRecords: ClearanceRecord[];
  setClearanceRecords: (data: ClearanceRecord[]) => void;
  computeStudentCGPA: (
    matric: string,
    creditMap: Record<string, number>,
  ) => number;
  getCarryovers: (matric: string) => ExamResult[];
  isGraduationEligible: (
    matric: string,
    creditMap: Record<string, number>,
  ) => boolean;
  refresh: () => void;
}

const ResultProcessingContext =
  createContext<ResultProcessingContextType | null>(null);

export function ResultProcessingProvider({
  children,
}: { children: React.ReactNode }) {
  const [gradeConfig, setGradeConfigState] =
    useState<GradeConfigEntry[]>(DEFAULT_GRADE_CONFIG);
  const [caScores, setCAScoresState] = useState<CAScore[]>([]);
  const [examResults, setExamResultsState] = useState<ExamResult[]>([]);
  const [approvalLogs, setApprovalLogsState] = useState<ApprovalLog[]>([]);
  const [academicStatuses, setAcademicStatusesState] = useState<
    AcademicStatusRecord[]
  >([]);
  const [clearanceRecords, setClearanceRecordsState] = useState<
    ClearanceRecord[]
  >([]);

  const load = () => {
    setGradeConfigState(getLocalGradeConfig());
    setCAScoresState(getLocalCAScores());
    setExamResultsState(getLocalExamResults());
    setApprovalLogsState(getLocalApprovalLogs());
    setAcademicStatusesState(getLocalAcademicStatuses());
    setClearanceRecordsState(getLocalClearanceRecords());
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: initial load only
  useEffect(() => {
    load();
  }, []);

  const setGradeConfig = (cfg: GradeConfigEntry[]) => {
    saveLocalGradeConfig(cfg);
    setGradeConfigState(cfg);
  };
  const setCAScores = (data: CAScore[]) => {
    saveLocalCAScores(data);
    setCAScoresState(data);
  };
  const setExamResults = (data: ExamResult[]) => {
    saveLocalExamResults(data);
    setExamResultsState(data);
  };
  const setApprovalLogs = (data: ApprovalLog[]) => {
    saveLocalApprovalLogs(data);
    setApprovalLogsState(data);
  };
  const setAcademicStatuses = (data: AcademicStatusRecord[]) => {
    saveLocalAcademicStatuses(data);
    setAcademicStatusesState(data);
  };
  const setClearanceRecords = (data: ClearanceRecord[]) => {
    saveLocalClearanceRecords(data);
    setClearanceRecordsState(data);
  };

  const computeStudentCGPA = (
    matric: string,
    creditMap: Record<string, number>,
  ): number => {
    const studentResults = examResults.filter(
      (r) => r.studentMatric === matric && r.status === "published",
    );
    return computeGPAFromResults(studentResults, creditMap, gradeConfig);
  };

  const getCarryovers = (matric: string): ExamResult[] =>
    examResults.filter(
      (r) =>
        r.studentMatric === matric &&
        r.status === "published" &&
        r.grade === "F",
    );

  const isGraduationEligible = (
    matric: string,
    creditMap: Record<string, number>,
  ): boolean => {
    const cgpa = computeStudentCGPA(matric, creditMap);
    const carryovers = getCarryovers(matric);
    return cgpa >= 1.0 && carryovers.length === 0;
  };

  return (
    <ResultProcessingContext.Provider
      value={{
        gradeConfig,
        setGradeConfig,
        caScores,
        setCAScores,
        examResults,
        setExamResults,
        approvalLogs,
        setApprovalLogs,
        academicStatuses,
        setAcademicStatuses,
        clearanceRecords,
        setClearanceRecords,
        computeStudentCGPA,
        getCarryovers,
        isGraduationEligible,
        refresh: load,
      }}
    >
      {children}
    </ResultProcessingContext.Provider>
  );
}

export function useResultProcessing() {
  const ctx = useContext(ResultProcessingContext);
  if (!ctx)
    throw new Error(
      "useResultProcessing must be used within ResultProcessingProvider",
    );
  return ctx;
}
