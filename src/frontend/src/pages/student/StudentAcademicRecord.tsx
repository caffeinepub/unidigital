import { useRef } from "react";
import { Button } from "../../components/ui/button";
import { getInstitutionSettings } from "../../hooks/useInstitutionSettings";
import {
  buildRecordData,
  getLevelColumnHeader,
  getLevelSummaryLabel,
  printStudentRecord,
} from "../../utils/academicRecordUtils";
import { getLocalStudents } from "../../utils/sampleData";

interface Props {
  userEmail: string;
  userName: string;
}

export function StudentAcademicRecord({ userEmail, userName }: Props) {
  const printRef = useRef<HTMLDivElement>(null);
  const settings = getInstitutionSettings();
  const institutionType = settings.profile.institutionType;
  const institutionName = settings.profile.name;

  const students = getLocalStudents();
  const student = students.find((s) => s.email === userEmail) || students[0];

  const effectiveType = student.institutionCategory ?? institutionType;
  const data = buildRecordData(student, effectiveType);
  const instType = data.institutionType;

  const isCoE =
    instType === "college_of_education" || instType === "College of Education";

  const schoolLabel = isCoE
    ? `School of ${student.department}`
    : instType === "polytechnic" || instType === "Polytechnic"
      ? `Department of ${student.department}`
      : `Faculty / Department of ${student.department}`;

  const today = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const handlePrint = () => {
    printStudentRecord(student, institutionName, effectiveType);
  };

  const maxRows = Math.max(...data.levels.map((l) => l.rows.length), 1);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">
          Student Academic Record
        </h1>
        <Button
          onClick={handlePrint}
          className="bg-blue-600 hover:bg-blue-700 print:hidden"
          data-ocid="academic-record.primary_button"
        >
          🖨️ Print / Download
        </Button>
      </div>

      <div
        ref={printRef}
        className="bg-white border border-slate-300 rounded-lg p-6 max-w-6xl mx-auto"
      >
        {/* Header */}
        <div className="text-center mb-4 space-y-0.5">
          <p className="font-bold text-sm uppercase tracking-wide">
            {institutionName}
          </p>
          <p className="text-xs uppercase">{schoolLabel}</p>
          <p className="font-bold text-base underline">
            Student Academic Record
          </p>
        </div>

        {/* Student Info */}
        <div className="grid grid-cols-2 gap-x-6 mb-3 text-xs">
          <div className="flex gap-2">
            <span className="font-semibold uppercase">Name:</span>
            <span className="border-b border-slate-400 flex-1 min-w-0">
              {student.name || userName}
            </span>
          </div>
          {isCoE && student.subCombination ? (
            <div className="flex gap-2">
              <span className="font-semibold uppercase">Sub. Comb.:</span>
              <span className="border-b border-slate-400 flex-1 min-w-0">
                {student.subCombination}
              </span>
            </div>
          ) : (
            <div className="flex gap-2">
              <span className="font-semibold uppercase">Department:</span>
              <span className="border-b border-slate-400 flex-1 min-w-0">
                {student.department}
              </span>
            </div>
          )}
          <div className="flex gap-2 mt-1">
            <span className="font-semibold uppercase">Matric No:</span>
            <span className="border-b border-slate-400 flex-1 min-w-0">
              {student.matricNumber}
            </span>
          </div>
        </div>

        {/* Main Table */}
        <div className="overflow-x-auto">
          <table
            className="w-full border-collapse text-[9px]"
            style={{ minWidth: data.levels.length * 200 }}
          >
            <thead>
              <tr>
                {data.levels.map((l, i) => (
                  <th
                    key={getLevelColumnHeader(instType, i)}
                    colSpan={6}
                    className="border border-slate-700 text-center py-1 font-bold"
                  >
                    {l.label}
                  </th>
                ))}
              </tr>
              <tr className="bg-slate-50">
                {data.levels.flatMap((l) =>
                  ["COURSES", "CREDIT", "SCORE", "GRADE", "GP", "GPA"].map(
                    (h) => (
                      <th
                        key={`${l.label}-${h}`}
                        className="border border-slate-700 px-1 py-0.5 text-center font-semibold"
                      >
                        {h}
                      </th>
                    ),
                  ),
                )}
              </tr>
              <tr>
                {data.levels.map((l) => (
                  <>
                    <td
                      key={`${l.label}-prefix`}
                      className="border border-slate-700 px-1 py-0.5 font-bold text-center"
                    >
                      {l.prefix}
                    </td>
                    {[0, 1, 2, 3, 4].map((k) => (
                      <td
                        key={`${l.label}-empty${k}`}
                        className="border border-slate-700 px-1"
                      />
                    ))}
                  </>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: maxRows }).map((_unused, rowIdx) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: row index is stable
                <tr key={rowIdx}>
                  {data.levels.flatMap((l) => {
                    const r = l.rows[rowIdx];
                    return [
                      <td
                        key={`${l.label}-${rowIdx}-code`}
                        className="border border-slate-700 px-1 py-0.5 text-center"
                      >
                        {r ? r.code : ""}
                      </td>,
                      <td
                        key={`${l.label}-${rowIdx}-credit`}
                        className="border border-slate-700 px-1 text-center"
                      >
                        {r ? r.credit : ""}
                      </td>,
                      <td
                        key={`${l.label}-${rowIdx}-score`}
                        className="border border-slate-700 px-1 text-center"
                      >
                        {r && r.score !== null ? r.score : ""}
                      </td>,
                      <td
                        key={`${l.label}-${rowIdx}-grade`}
                        className="border border-slate-700 px-1 text-center"
                      >
                        {r ? r.grade : ""}
                      </td>,
                      <td
                        key={`${l.label}-${rowIdx}-gp`}
                        className="border border-slate-700 px-1 text-center"
                      >
                        {r?.grade ? r.gp : ""}
                      </td>,
                      <td
                        key={`${l.label}-${rowIdx}-gpa`}
                        className="border border-slate-700 px-1 text-center"
                      >
                        {r && r.gpa !== null ? r.gpa : ""}
                      </td>,
                    ];
                  })}
                </tr>
              ))}
              {/* Totals row */}
              <tr className="bg-slate-50 font-semibold">
                {data.levels.flatMap((l) => [
                  <td
                    key={`${l.label}-tco`}
                    colSpan={2}
                    className="border border-slate-700 px-1 py-1 text-center"
                  >
                    {l.tco}
                  </td>,
                  <td
                    key={`${l.label}-t1`}
                    className="border border-slate-700 px-1"
                  />,
                  <td
                    key={`${l.label}-t2`}
                    className="border border-slate-700 px-1"
                  />,
                  <td
                    key={`${l.label}-t3`}
                    className="border border-slate-700 px-1"
                  />,
                  <td
                    key={`${l.label}-t4`}
                    className="border border-slate-700 px-1"
                  />,
                ])}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Summary Panels */}
        <div
          className="grid gap-4 mt-4 text-xs"
          style={{ gridTemplateColumns: `repeat(${data.levels.length}, 1fr)` }}
        >
          {data.levels.map((l, i) => {
            const summary = data.summaries[i];
            const panelLabel = getLevelSummaryLabel(instType, i);
            return (
              <div key={l.label}>
                <p className="font-bold underline text-sm mb-1">{panelLabel}</p>
                <table className="w-full border-collapse">
                  <tbody>
                    {(
                      [
                        ["TCO", summary.tco],
                        ["TCP", summary.tcp],
                        ["TGP", summary.tgp],
                        ["CGPA", summary.cgpa],
                        ["GRADE", summary.grade],
                        ["REMARK", summary.remark],
                      ] as [string, string | number][]
                    ).map(([k, v]) => (
                      <tr key={k}>
                        <td className="py-0.5 pr-1 font-semibold w-16">
                          {k} =
                        </td>
                        <td className="py-0.5 border-b border-slate-400">
                          {String(v)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>

        {/* Spacer */}
        <div className="mt-8" />

        {/* Footer */}
        <div className="grid grid-cols-3 gap-4 mt-4 text-xs border-t border-slate-300 pt-3">
          <div>
            <span className="font-semibold uppercase">Computed By: </span>
            <span className="border-b border-slate-400 inline-block w-32" />
          </div>
          <div>
            <span className="font-semibold uppercase">Signature: </span>
            <span className="border-b border-slate-400 inline-block w-28" />
          </div>
          <div>
            <span className="font-semibold uppercase">Date: </span>
            <span className="border-b border-slate-400 inline-block w-24">
              {today}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
