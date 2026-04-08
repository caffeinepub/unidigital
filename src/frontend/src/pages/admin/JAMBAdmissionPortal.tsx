import { useEffect, useMemo, useRef, useState } from "react";
import {
  DEPARTMENTS,
  type DepartmentInfo,
  type JambStudent,
  getAllJambStudents,
  getDeptStudents,
  getJambStats,
  initJambStudents,
} from "../../utils/jambData";

function useToast() {
  const [msg, setMsg] = useState<string | null>(null);
  const show = (m: string) => {
    setMsg(m);
    setTimeout(() => setMsg(null), 3500);
  };
  return { msg, show };
}

const DEPT_HEADER_COLORS: Record<string, string> = {
  BIO: "bg-emerald-700",
  CHE: "bg-sky-700",
  MTH: "bg-violet-700",
  PHY: "bg-orange-700",
  CSC: "bg-blue-700",
  ENT: "bg-amber-700",
  HED: "bg-rose-700",
  HKE: "bg-teal-700",
};

const DEPT_CARD_COLORS: Record<string, string> = {
  BIO: "border-emerald-400 bg-emerald-50 text-emerald-900",
  CHE: "border-sky-400 bg-sky-50 text-sky-900",
  MTH: "border-violet-400 bg-violet-50 text-violet-900",
  PHY: "border-orange-400 bg-orange-50 text-orange-900",
  CSC: "border-blue-400 bg-blue-50 text-blue-900",
  ENT: "border-amber-400 bg-amber-50 text-amber-900",
  HED: "border-rose-400 bg-rose-50 text-rose-900",
  HKE: "border-teal-400 bg-teal-50 text-teal-900",
};

const DEPT_TAB_ACTIVE: Record<string, string> = {
  BIO: "bg-emerald-700 text-white",
  CHE: "bg-sky-700 text-white",
  MTH: "bg-violet-700 text-white",
  PHY: "bg-orange-700 text-white",
  CSC: "bg-blue-700 text-white",
  ENT: "bg-amber-700 text-white",
  HED: "bg-rose-700 text-white",
  HKE: "bg-teal-700 text-white",
};

const PRINT_STYLE = `
@media print {
  .no-print { display: none !important; }
  @page { size: A4 landscape; margin: 12mm; }
  table { border-collapse: collapse; width: 100%; font-size: 10pt; }
  th, td { border: 1px solid #000; padding: 3px 6px; }
  thead { background: #1e3a5f !important; color: #fff !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .dept-header-row td { background: #2563eb !important; color: #fff !important; font-weight: bold; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
}
`;

function StudentRow({
  student,
  idx,
  showDept,
}: {
  student: JambStudent;
  idx: number;
  showDept: boolean;
}) {
  return (
    <tr className={idx % 2 === 0 ? "bg-white" : "bg-slate-50"}>
      <td className="px-3 py-2 text-sm text-slate-500 text-center w-10">
        {student.sn}
      </td>
      <td className="px-3 py-2 text-sm font-mono font-semibold text-blue-700 whitespace-nowrap">
        {student.matricNumber}
      </td>
      <td className="px-3 py-2 text-sm font-mono text-slate-600 whitespace-nowrap">
        {student.jambRegNo}
      </td>
      <td className="px-3 py-2 text-sm font-medium text-slate-800">
        {student.fullName}
      </td>
      {showDept && (
        <td className="px-3 py-2 text-xs text-slate-600">
          {student.department}
        </td>
      )}
      <td className="px-3 py-2 text-sm text-slate-600">{student.state}</td>
      <td className="px-3 py-2 text-sm text-slate-600">{student.lga}</td>
      <td className="px-3 py-2 text-sm text-center">
        <span
          className={
            student.sex === "F"
              ? "text-pink-600 font-semibold"
              : "text-blue-600 font-semibold"
          }
        >
          {student.sex}
        </span>
      </td>
      <td className="px-3 py-2 text-sm text-center">
        <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full font-medium">
          {student.status}
        </span>
      </td>
    </tr>
  );
}

function DeptGroup({
  dept,
  students,
  search,
}: {
  dept: DepartmentInfo;
  students: JambStudent[];
  search: string;
}) {
  const filtered = students.filter(
    (s) =>
      !search ||
      s.fullName.toLowerCase().includes(search.toLowerCase()) ||
      s.jambRegNo.toLowerCase().includes(search.toLowerCase()),
  );
  if (filtered.length === 0) return null;

  return (
    <tbody>
      <tr
        className={`${DEPT_HEADER_COLORS[dept.code]} text-white dept-header-row`}
      >
        <td colSpan={9} className="px-3 py-2 text-sm font-bold tracking-wide">
          {dept.fullName} — {filtered.length} student
          {filtered.length !== 1 ? "s" : ""}
        </td>
      </tr>
      {filtered.map((s, i) => (
        <StudentRow key={s.id} student={s} idx={i} showDept={false} />
      ))}
    </tbody>
  );
}

function exportCSV(students: JambStudent[], filename: string) {
  const headers = [
    "S/N",
    "Matric Number",
    "JAMB Reg No",
    "Full Name",
    "Department",
    "State",
    "LGA",
    "Sex",
    "Status",
    "Session",
    "Level",
    "Email",
  ];
  const rows = students.map((s) => [
    s.sn,
    s.matricNumber,
    s.jambRegNo,
    `"${s.fullName}"`,
    `"${s.department}"`,
    s.state,
    s.lga,
    s.sex,
    s.status,
    s.session,
    s.level,
    s.email,
  ]);
  const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function JAMBAdmissionPortal() {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [search, setSearch] = useState("");
  const { msg: toastMsg, show: showToast } = useToast();
  const printStyleRef = useRef(false);

  useEffect(() => {
    if (printStyleRef.current) return;
    printStyleRef.current = true;
    const style = document.createElement("style");
    style.id = "jamb-print-style";
    style.textContent = PRINT_STYLE;
    document.head.appendChild(style);
    return () => {
      document.getElementById("jamb-print-style")?.remove();
    };
  }, []);

  const stats = useMemo(() => getJambStats(), []);

  const displayedStudents = useMemo(() => {
    const base =
      activeTab === "all" ? getAllJambStudents() : getDeptStudents(activeTab);
    if (!search.trim()) return base;
    const q = search.toLowerCase();
    return base.filter(
      (s) =>
        s.fullName.toLowerCase().includes(q) ||
        s.jambRegNo.toLowerCase().includes(q),
    );
  }, [activeTab, search]);

  const handleSync = () => {
    initJambStudents();
    showToast(
      `✅ ${stats.total} JAMB students synced to Student Records successfully!`,
    );
  };

  const handlePrint = () => window.print();

  const handleExportCSV = () => {
    const filename =
      activeTab === "all"
        ? "FUEK_JAMB_2025_All_Departments.csv"
        : `FUEK_JAMB_2025_${activeTab}.csv`;
    exportCSV(displayedStudents, filename);
    showToast("CSV exported successfully!");
  };

  const activeDept = DEPARTMENTS.find((d) => d.code === activeTab);
  const tableHeaders = [
    "S/N",
    "Matric Number",
    "JAMB Reg No",
    "Full Name",
    ...(activeTab === "all" ? ["Department"] : []),
    "State",
    "LGA",
    "Sex",
    "Status",
  ];

  return (
    <div className="space-y-5">
      {/* Toast */}
      {toastMsg && (
        <div className="no-print fixed top-4 right-4 z-50 bg-green-700 text-white px-5 py-3 rounded-lg shadow-xl text-sm font-medium">
          {toastMsg}
        </div>
      )}

      {/* Print-only header */}
      <div className="hidden print:block mb-4 text-center">
        <p className="text-base font-bold uppercase">
          Federal University of Education, Kontagora
        </p>
        <p className="text-sm font-semibold">Faculty of Science Education</p>
        <p className="text-sm">
          Admitted Students List — 2025/2026 Academic Session
        </p>
        {activeDept && (
          <p className="text-sm font-semibold mt-1">{activeDept.fullName}</p>
        )}
        <hr className="my-2" />
      </div>

      {/* Screen header */}
      <div className="no-print">
        <div className="bg-gradient-to-r from-blue-900 to-blue-700 rounded-xl p-5 text-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold tracking-tight">
                JAMB Admission Portal — 2025/2026 Academic Session
              </h1>
              <p className="text-blue-200 text-sm mt-0.5">
                Federal University of Education, Kontagora &nbsp;|&nbsp; Faculty
                of Science Education
              </p>
            </div>
            <button
              type="button"
              onClick={handleSync}
              className="flex-shrink-0 bg-green-500 hover:bg-green-400 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
              data-ocid="jamb-sync-btn"
            >
              🔄 Sync to Student Records
            </button>
          </div>
          <div className="grid grid-cols-3 gap-3 mt-4">
            {[
              { label: "Total Admitted", value: stats.total },
              { label: "Departments", value: DEPARTMENTS.length },
              { label: "Academic Session", value: "2025/2026" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-white/10 rounded-lg p-3 text-center"
              >
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-blue-200">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Department Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 mt-4">
          {DEPARTMENTS.map((dept) => (
            <button
              type="button"
              key={dept.code}
              onClick={() => {
                setActiveTab(dept.code);
                setSearch("");
              }}
              className={`border-2 rounded-lg p-2 text-center cursor-pointer transition-all hover:shadow-md ${DEPT_CARD_COLORS[dept.code]} ${activeTab === dept.code ? "ring-2 ring-offset-1 ring-blue-500 shadow-lg scale-105" : ""}`}
              data-ocid={`dept-card-${dept.code.toLowerCase()}`}
            >
              <p className="text-xl font-bold">
                {stats.perDept[dept.code] ?? 0}
              </p>
              <p className="text-xs font-semibold leading-tight mt-0.5">
                {dept.code}
              </p>
              <p className="text-xs leading-tight opacity-80 mt-0.5">
                {dept.name}
              </p>
            </button>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-1 mt-4 border-b border-slate-200">
          <button
            type="button"
            onClick={() => {
              setActiveTab("all");
              setSearch("");
            }}
            className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${activeTab === "all" ? "bg-blue-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
            data-ocid="tab-all"
          >
            All Departments
            <span className="ml-1.5 text-xs opacity-80">({stats.total})</span>
          </button>
          {DEPARTMENTS.map((dept) => (
            <button
              type="button"
              key={dept.code}
              onClick={() => {
                setActiveTab(dept.code);
                setSearch("");
              }}
              className={`px-3 py-2 rounded-t-lg text-sm font-medium transition-colors ${activeTab === dept.code ? DEPT_TAB_ACTIVE[dept.code] : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
              data-ocid={`tab-${dept.code.toLowerCase()}`}
            >
              {dept.code}
              <span className="ml-1 text-xs opacity-80">
                ({stats.perDept[dept.code]})
              </span>
            </button>
          ))}
        </div>

        {/* Search + Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-3">
          <input
            type="text"
            placeholder="Search by name or JAMB Reg No..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            data-ocid="jamb-search"
          />
          <p className="text-sm text-slate-500 whitespace-nowrap">
            Showing{" "}
            <span className="font-semibold text-slate-800">
              {displayedStudents.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-slate-800">{stats.total}</span>{" "}
            students
          </p>
          <button
            type="button"
            onClick={handleExportCSV}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-3 py-2 rounded-lg transition-colors whitespace-nowrap"
            data-ocid="jamb-export-csv"
          >
            ⬇ Export CSV
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="bg-slate-700 hover:bg-slate-800 text-white text-sm font-medium px-3 py-2 rounded-lg transition-colors whitespace-nowrap"
            data-ocid="jamb-print"
          >
            🖨 Print
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead className="bg-blue-900 text-white">
              <tr>
                {tableHeaders.map((h) => (
                  <th
                    key={h}
                    className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            {activeTab === "all" ? (
              DEPARTMENTS.map((dept) => (
                <DeptGroup
                  key={dept.code}
                  dept={dept}
                  students={getDeptStudents(dept.code)}
                  search={search}
                />
              ))
            ) : (
              <tbody>
                {displayedStudents.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-8 text-center text-slate-400 text-sm"
                    >
                      No students found matching your search.
                    </td>
                  </tr>
                ) : (
                  displayedStudents.map((s, i) => (
                    <StudentRow
                      key={s.id}
                      student={s}
                      idx={i}
                      showDept={false}
                    />
                  ))
                )}
              </tbody>
            )}
          </table>
        </div>
      </div>

      {/* Print footer */}
      <div className="hidden print:block mt-4 text-xs text-center text-slate-500 border-t pt-2">
        FUEK MIS &nbsp;|&nbsp; Date Printed:{" "}
        {new Date().toLocaleDateString("en-NG")} &nbsp;|&nbsp; 2025/2026
        Academic Session
      </div>

      {/* Per-dept action bar */}
      {activeTab !== "all" && activeDept && (
        <div className="no-print flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 text-sm">
          <span className="font-semibold text-slate-700">
            {activeDept.fullName} — {getDeptStudents(activeTab).length} admitted
            student
            {getDeptStudents(activeTab).length !== 1 ? "s" : ""}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleExportCSV}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
              data-ocid="jamb-dept-export"
            >
              Export {activeDept.code} CSV
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="bg-slate-700 hover:bg-slate-800 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
              data-ocid="jamb-dept-print"
            >
              Print {activeDept.code} List
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
