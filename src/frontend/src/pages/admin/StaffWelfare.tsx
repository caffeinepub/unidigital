import {
  AlertCircle,
  Building2,
  CheckCircle,
  Clock,
  DollarSign,
  FileText,
  Heart,
  PlusCircle,
  Shield,
  TrendingUp,
  Upload,
  Users,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import { Textarea } from "../../components/ui/textarea";

// ── Types ──────────────────────────────────────────────────────────────────

interface LoanApplication {
  id: string;
  staffId: string;
  staffName: string;
  amount: number;
  duration: number; // months
  purpose: string;
  interestRate: number;
  monthlyRepayment: number;
  status: "pending" | "approved" | "rejected" | "disbursed" | "completed";
  appliedAt: string;
  disbursedAt?: string;
  repaidSoFar: number;
}

interface CoopMember {
  id: string;
  staffId: string;
  staffName: string;
  monthlyContribution: number;
  totalContributions: number;
  dividendsEarned: number;
  joinedAt: string;
  status: "active" | "inactive" | "suspended";
}

interface MedicalClaim {
  id: string;
  staffId: string;
  staffName: string;
  claimType: string;
  amount: number;
  description: string;
  documentName: string;
  status: "pending" | "under-review" | "approved" | "rejected";
  submittedAt: string;
}

interface PensionRecord {
  id: string;
  staffId: string;
  staffName: string;
  pfaName: string;
  pin: string;
  monthlyContribution: number;
  employerContribution: number;
  totalBalance: number;
  lastContributionDate: string;
}

interface InsuranceEnrollment {
  id: string;
  staffId: string;
  staffName: string;
  policyType: string;
  provider: string;
  annualPremium: number;
  coverageAmount: number;
  startDate: string;
  expiryDate: string;
  status: "active" | "expired" | "pending";
}

// ── Sample data seeds ───────────────────────────────────────────────────────

function getLoans(): LoanApplication[] {
  const stored = localStorage.getItem("unidigital_welfare_loans");
  if (stored) return JSON.parse(stored) as LoanApplication[];
  const seed: LoanApplication[] = [
    {
      id: "LN001",
      staffId: "STF001",
      staffName: "Dr. Adebayo Ogundimu",
      amount: 500000,
      duration: 24,
      purpose: "Home renovation",
      interestRate: 6,
      monthlyRepayment: 22500,
      status: "approved",
      appliedAt: "2024-01-10",
      disbursedAt: "2024-01-20",
      repaidSoFar: 67500,
    },
    {
      id: "LN002",
      staffId: "STF003",
      staffName: "Dr. Chioma Nwachukwu",
      amount: 300000,
      duration: 12,
      purpose: "School fees for children",
      interestRate: 6,
      monthlyRepayment: 26500,
      status: "pending",
      appliedAt: "2024-02-15",
      repaidSoFar: 0,
    },
    {
      id: "LN003",
      staffId: "STF005",
      staffName: "Mrs. Blessing Okeke",
      amount: 200000,
      duration: 10,
      purpose: "Medical expenses",
      interestRate: 6,
      monthlyRepayment: 21200,
      status: "disbursed",
      appliedAt: "2024-01-05",
      disbursedAt: "2024-01-15",
      repaidSoFar: 63600,
    },
  ];
  localStorage.setItem("unidigital_welfare_loans", JSON.stringify(seed));
  return seed;
}

function getCoopMembers(): CoopMember[] {
  const stored = localStorage.getItem("unidigital_welfare_coop");
  if (stored) return JSON.parse(stored) as CoopMember[];
  const seed: CoopMember[] = [
    {
      id: "CM001",
      staffId: "STF001",
      staffName: "Dr. Adebayo Ogundimu",
      monthlyContribution: 15000,
      totalContributions: 360000,
      dividendsEarned: 28800,
      joinedAt: "2022-01-01",
      status: "active",
    },
    {
      id: "CM002",
      staffId: "STF002",
      staffName: "Prof. Yakubu Musa",
      monthlyContribution: 20000,
      totalContributions: 480000,
      dividendsEarned: 38400,
      joinedAt: "2022-01-01",
      status: "active",
    },
    {
      id: "CM003",
      staffId: "STF004",
      staffName: "Barrister Kunle Adesanya",
      monthlyContribution: 12000,
      totalContributions: 144000,
      dividendsEarned: 11520,
      joinedAt: "2023-01-01",
      status: "active",
    },
    {
      id: "CM004",
      staffId: "STF005",
      staffName: "Mrs. Blessing Okeke",
      monthlyContribution: 10000,
      totalContributions: 240000,
      dividendsEarned: 19200,
      joinedAt: "2022-01-01",
      status: "inactive",
    },
  ];
  localStorage.setItem("unidigital_welfare_coop", JSON.stringify(seed));
  return seed;
}

function getMedicalClaims(): MedicalClaim[] {
  const stored = localStorage.getItem("unidigital_welfare_medical");
  if (stored) return JSON.parse(stored) as MedicalClaim[];
  const seed: MedicalClaim[] = [
    {
      id: "MC001",
      staffId: "STF001",
      staffName: "Dr. Adebayo Ogundimu",
      claimType: "Hospitalization",
      amount: 85000,
      description: "Appendectomy surgery at UITH",
      documentName: "hospital_receipt_UITH.pdf",
      status: "approved",
      submittedAt: "2024-01-25",
    },
    {
      id: "MC002",
      staffId: "STF003",
      staffName: "Dr. Chioma Nwachukwu",
      claimType: "Dental",
      amount: 25000,
      description: "Dental extraction and crown fitting",
      documentName: "dental_invoice.pdf",
      status: "pending",
      submittedAt: "2024-02-10",
    },
    {
      id: "MC003",
      staffId: "STF006",
      staffName: "Mr. James Olatunji",
      claimType: "Optical",
      amount: 18000,
      description: "Prescription glasses",
      documentName: "optical_receipt.jpg",
      status: "under-review",
      submittedAt: "2024-02-08",
    },
  ];
  localStorage.setItem("unidigital_welfare_medical", JSON.stringify(seed));
  return seed;
}

function getPensionRecords(): PensionRecord[] {
  const stored = localStorage.getItem("unidigital_welfare_pension");
  if (stored) return JSON.parse(stored) as PensionRecord[];
  const seed: PensionRecord[] = [
    {
      id: "PR001",
      staffId: "STF001",
      staffName: "Dr. Adebayo Ogundimu",
      pfaName: "Stanbic IBTC Pension Managers",
      pin: "PEN100123456789",
      monthlyContribution: 22500,
      employerContribution: 33750,
      totalBalance: 3240000,
      lastContributionDate: "2024-02-28",
    },
    {
      id: "PR002",
      staffId: "STF002",
      staffName: "Prof. Yakubu Musa",
      pfaName: "AIICO Pension Managers",
      pin: "PEN100987654321",
      monthlyContribution: 31000,
      employerContribution: 46500,
      totalBalance: 8750000,
      lastContributionDate: "2024-02-28",
    },
    {
      id: "PR003",
      staffId: "STF005",
      staffName: "Mrs. Blessing Okeke",
      pfaName: "Access ARM Pension",
      pin: "PEN100456789123",
      monthlyContribution: 15500,
      employerContribution: 23250,
      totalBalance: 1860000,
      lastContributionDate: "2024-02-28",
    },
  ];
  localStorage.setItem("unidigital_welfare_pension", JSON.stringify(seed));
  return seed;
}

function getInsuranceEnrollments(): InsuranceEnrollment[] {
  const stored = localStorage.getItem("unidigital_welfare_insurance");
  if (stored) return JSON.parse(stored) as InsuranceEnrollment[];
  const seed: InsuranceEnrollment[] = [
    {
      id: "INS001",
      staffId: "STF001",
      staffName: "Dr. Adebayo Ogundimu",
      policyType: "Group Life",
      provider: "NICON Insurance",
      annualPremium: 48000,
      coverageAmount: 10000000,
      startDate: "2024-01-01",
      expiryDate: "2024-12-31",
      status: "active",
    },
    {
      id: "INS002",
      staffId: "STF002",
      staffName: "Prof. Yakubu Musa",
      policyType: "Group Life",
      provider: "NICON Insurance",
      annualPremium: 60000,
      coverageAmount: 15000000,
      startDate: "2024-01-01",
      expiryDate: "2024-12-31",
      status: "active",
    },
    {
      id: "INS003",
      staffId: "STF007",
      staffName: "Mrs. Grace Onyeka",
      policyType: "Health Insurance",
      provider: "Hygeia HMO",
      annualPremium: 120000,
      coverageAmount: 5000000,
      startDate: "2023-06-01",
      expiryDate: "2024-05-31",
      status: "active",
    },
  ];
  localStorage.setItem("unidigital_welfare_insurance", JSON.stringify(seed));
  return seed;
}

// ── Status badge helper ─────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const colorMap: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700",
    "under-review": "bg-blue-100 text-blue-700",
    approved: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
    disbursed: "bg-cyan-100 text-cyan-700",
    completed: "bg-slate-100 text-slate-600",
    active: "bg-green-100 text-green-700",
    inactive: "bg-slate-100 text-slate-600",
    suspended: "bg-red-100 text-red-700",
    expired: "bg-red-100 text-red-700",
  };
  return (
    <span
      className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize ${colorMap[status] ?? "bg-slate-100 text-slate-600"}`}
    >
      {status}
    </span>
  );
}

// ── Main component ──────────────────────────────────────────────────────────

export function StaffWelfare() {
  const [loans, setLoans] = useState<LoanApplication[]>(getLoans);
  const [coopMembers] = useState<CoopMember[]>(getCoopMembers);
  const [medicalClaims, setMedicalClaims] =
    useState<MedicalClaim[]>(getMedicalClaims);
  const [pensionRecords] = useState<PensionRecord[]>(getPensionRecords);
  const [insuranceEnrollments] = useState<InsuranceEnrollment[]>(
    getInsuranceEnrollments,
  );

  // Loan application dialog
  const [loanDialog, setLoanDialog] = useState(false);
  const [loanForm, setLoanForm] = useState({
    staffId: "",
    staffName: "",
    amount: "",
    duration: "12",
    purpose: "",
  });

  // Medical claim dialog
  const [claimDialog, setClaimDialog] = useState(false);
  const [claimForm, setClaimForm] = useState({
    staffId: "",
    staffName: "",
    claimType: "Hospitalization",
    amount: "",
    description: "",
  });

  const submitLoan = () => {
    const amt = Number(loanForm.amount);
    const dur = Number(loanForm.duration);
    const monthly = Math.round((amt * (1 + 0.06)) / dur);
    const newLoan: LoanApplication = {
      id: `LN${Date.now()}`,
      staffId: loanForm.staffId,
      staffName: loanForm.staffName,
      amount: amt,
      duration: dur,
      purpose: loanForm.purpose,
      interestRate: 6,
      monthlyRepayment: monthly,
      status: "pending",
      appliedAt: new Date().toISOString().split("T")[0],
      repaidSoFar: 0,
    };
    const updated = [newLoan, ...loans];
    setLoans(updated);
    localStorage.setItem("unidigital_welfare_loans", JSON.stringify(updated));
    setLoanDialog(false);
    setLoanForm({
      staffId: "",
      staffName: "",
      amount: "",
      duration: "12",
      purpose: "",
    });
  };

  const updateLoanStatus = (id: string, status: LoanApplication["status"]) => {
    const updated = loans.map((l) => (l.id === id ? { ...l, status } : l));
    setLoans(updated);
    localStorage.setItem("unidigital_welfare_loans", JSON.stringify(updated));
  };

  const submitClaim = () => {
    const newClaim: MedicalClaim = {
      id: `MC${Date.now()}`,
      staffId: claimForm.staffId,
      staffName: claimForm.staffName,
      claimType: claimForm.claimType,
      amount: Number(claimForm.amount),
      description: claimForm.description,
      documentName: "uploaded_document.pdf",
      status: "pending",
      submittedAt: new Date().toISOString().split("T")[0],
    };
    const updated = [newClaim, ...medicalClaims];
    setMedicalClaims(updated);
    localStorage.setItem("unidigital_welfare_medical", JSON.stringify(updated));
    setClaimDialog(false);
    setClaimForm({
      staffId: "",
      staffName: "",
      claimType: "Hospitalization",
      amount: "",
      description: "",
    });
  };

  const updateClaimStatus = (id: string, status: MedicalClaim["status"]) => {
    const updated = medicalClaims.map((c) =>
      c.id === id ? { ...c, status } : c,
    );
    setMedicalClaims(updated);
    localStorage.setItem("unidigital_welfare_medical", JSON.stringify(updated));
  };

  // Summary stats
  const totalLoansDisbursed = loans
    .filter((l) => ["approved", "disbursed", "completed"].includes(l.status))
    .reduce((s, l) => s + l.amount, 0);
  const totalCoopFund = coopMembers.reduce(
    (s, m) => s + m.totalContributions,
    0,
  );
  const pendingClaims = medicalClaims.filter(
    (c) => c.status === "pending",
  ).length;
  const totalPension = pensionRecords.reduce((s, p) => s + p.totalBalance, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Staff Welfare</h1>
        <p className="text-slate-500 text-sm mt-1">
          Loan fund, cooperative, medical, pension &amp; insurance management
        </p>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Loans Disbursed",
            value: `₦${(totalLoansDisbursed / 1000000).toFixed(1)}M`,
            icon: <DollarSign size={20} />,
            color: "text-blue-600 bg-blue-50",
          },
          {
            label: "Cooperative Fund",
            value: `₦${(totalCoopFund / 1000000).toFixed(1)}M`,
            icon: <Users size={20} />,
            color: "text-emerald-600 bg-emerald-50",
          },
          {
            label: "Pending Medical Claims",
            value: pendingClaims,
            icon: <Heart size={20} />,
            color: "text-rose-600 bg-rose-50",
          },
          {
            label: "Total Pension Fund",
            value: `₦${(totalPension / 1000000).toFixed(1)}M`,
            icon: <TrendingUp size={20} />,
            color: "text-purple-600 bg-purple-50",
          },
        ].map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="p-4">
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2 ${kpi.color}`}
              >
                {kpi.icon}
              </div>
              <p className="text-xl font-bold text-slate-800">{kpi.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{kpi.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabbed content */}
      <Tabs defaultValue="loans">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="loans" className="flex items-center gap-1.5">
            <DollarSign size={14} /> Loans
          </TabsTrigger>
          <TabsTrigger
            value="cooperative"
            className="flex items-center gap-1.5"
          >
            <Building2 size={14} /> Cooperative
          </TabsTrigger>
          <TabsTrigger value="medical" className="flex items-center gap-1.5">
            <Heart size={14} /> Medical Fund
          </TabsTrigger>
          <TabsTrigger value="pension" className="flex items-center gap-1.5">
            <TrendingUp size={14} /> Pension
          </TabsTrigger>
          <TabsTrigger value="insurance" className="flex items-center gap-1.5">
            <Shield size={14} /> Insurance
          </TabsTrigger>
        </TabsList>

        {/* ── Loans ── */}
        <TabsContent value="loans" className="space-y-4 mt-4">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-semibold text-slate-700">
              Loan Applications
            </h2>
            <Button
              size="sm"
              onClick={() => setLoanDialog(true)}
              className="bg-blue-600 hover:bg-blue-700"
              data-ocid="welfare.loan.apply"
            >
              <PlusCircle size={14} className="mr-1.5" /> Apply for Loan
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b">
                    <tr>
                      {[
                        "Staff",
                        "Amount",
                        "Duration",
                        "Monthly",
                        "Interest",
                        "Status",
                        "Actions",
                      ].map((h) => (
                        <th
                          key={h}
                          className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {loans.map((l) => (
                      <tr
                        key={l.id}
                        className="border-b last:border-0 hover:bg-slate-50"
                      >
                        <td className="px-4 py-3">
                          <p className="font-medium">{l.staffName}</p>
                          <p className="text-xs text-slate-500">
                            {l.staffId} &bull; {l.purpose}
                          </p>
                        </td>
                        <td className="px-4 py-3 font-semibold text-blue-600">
                          ₦{l.amount.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-slate-500">
                          {l.duration} months
                        </td>
                        <td className="px-4 py-3">
                          ₦{l.monthlyRepayment.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-slate-500">
                          {l.interestRate}%
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={l.status} />
                        </td>
                        <td className="px-4 py-3">
                          {l.status === "pending" && (
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-green-600 hover:text-green-800 h-7 px-2"
                                onClick={() =>
                                  updateLoanStatus(l.id, "approved")
                                }
                              >
                                <CheckCircle size={14} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:text-red-700 h-7 px-2"
                                onClick={() =>
                                  updateLoanStatus(l.id, "rejected")
                                }
                              >
                                <XCircle size={14} />
                              </Button>
                            </div>
                          )}
                          {l.status === "approved" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-cyan-600 text-xs h-7 px-2"
                              onClick={() =>
                                updateLoanStatus(l.id, "disbursed")
                              }
                            >
                              Disburse
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Repayment schedule info */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <p className="text-sm font-medium text-blue-800 mb-1 flex items-center gap-2">
                <AlertCircle size={14} /> Loan Policy
              </p>
              <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
                <li>Interest rate: 6% flat per annum</li>
                <li>Maximum loan: 3× monthly gross salary</li>
                <li>Maximum duration: 36 months</li>
                <li>Repayments deducted from monthly payroll automatically</li>
                <li>
                  Staff must be confirmed and have at least 6 months service
                </li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Cooperative ── */}
        <TabsContent value="cooperative" className="space-y-4 mt-4">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-semibold text-slate-700">
              Cooperative Membership
            </h2>
            <div className="flex gap-2">
              <Badge className="bg-emerald-100 text-emerald-700 text-xs">
                {coopMembers.filter((m) => m.status === "active").length} Active
                Members
              </Badge>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                label: "Total Fund",
                value: `₦${totalCoopFund.toLocaleString()}`,
                sub: "Combined contributions",
              },
              {
                label: "Total Dividends",
                value: `₦${coopMembers.reduce((s, m) => s + m.dividendsEarned, 0).toLocaleString()}`,
                sub: "Distributed this year",
              },
              {
                label: "Avg Contribution",
                value: `₦${Math.round(coopMembers.reduce((s, m) => s + m.monthlyContribution, 0) / coopMembers.length).toLocaleString()}/mo`,
                sub: "Per member per month",
              },
            ].map((stat) => (
              <Card key={stat.label}>
                <CardContent className="p-4">
                  <p className="text-lg font-bold text-emerald-600">
                    {stat.value}
                  </p>
                  <p className="text-sm font-medium text-slate-700">
                    {stat.label}
                  </p>
                  <p className="text-xs text-slate-500">{stat.sub}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    {[
                      "Member",
                      "Monthly Contribution",
                      "Total Saved",
                      "Dividends",
                      "Status",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {coopMembers.map((m) => (
                    <tr
                      key={m.id}
                      className="border-b last:border-0 hover:bg-slate-50"
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium">{m.staffName}</p>
                        <p className="text-xs text-slate-500">
                          {m.staffId} &bull; Since {m.joinedAt}
                        </p>
                      </td>
                      <td className="px-4 py-3 font-semibold">
                        ₦{m.monthlyContribution.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-emerald-600 font-semibold">
                        ₦{m.totalContributions.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-purple-600">
                        ₦{m.dividendsEarned.toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={m.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Medical Fund ── */}
        <TabsContent value="medical" className="space-y-4 mt-4">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-semibold text-slate-700">
              Medical Fund Claims
            </h2>
            <Button
              size="sm"
              onClick={() => setClaimDialog(true)}
              className="bg-rose-600 hover:bg-rose-700"
              data-ocid="welfare.medical.claim"
            >
              <PlusCircle size={14} className="mr-1.5" /> Submit Claim
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    {[
                      "Staff",
                      "Claim Type",
                      "Amount",
                      "Description",
                      "Document",
                      "Status",
                      "Actions",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {medicalClaims.map((c) => (
                    <tr
                      key={c.id}
                      className="border-b last:border-0 hover:bg-slate-50"
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium">{c.staffName}</p>
                        <p className="text-xs text-slate-500">
                          {c.submittedAt}
                        </p>
                      </td>
                      <td className="px-4 py-3">{c.claimType}</td>
                      <td className="px-4 py-3 font-semibold text-rose-600">
                        ₦{c.amount.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-slate-500 max-w-xs truncate">
                        {c.description}
                      </td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1 text-xs text-blue-600">
                          <FileText size={12} /> {c.documentName}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={c.status} />
                      </td>
                      <td className="px-4 py-3">
                        {(c.status === "pending" ||
                          c.status === "under-review") && (
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-green-600 h-7 px-2"
                              onClick={() =>
                                updateClaimStatus(c.id, "approved")
                              }
                            >
                              <CheckCircle size={14} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-500 h-7 px-2"
                              onClick={() =>
                                updateClaimStatus(c.id, "rejected")
                              }
                            >
                              <XCircle size={14} />
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          <Card className="bg-rose-50 border-rose-200">
            <CardContent className="p-4">
              <p className="text-sm font-medium text-rose-800 mb-1 flex items-center gap-2">
                <Heart size={14} /> Medical Fund Policy
              </p>
              <ul className="text-xs text-rose-700 space-y-1 list-disc list-inside">
                <li>Annual medical claim limit: ₦150,000 per staff member</li>
                <li>Dependants covered: spouse and up to 4 children</li>
                <li>Claims must be supported by valid receipts/invoices</li>
                <li>
                  Reimbursement processed within 10 working days of approval
                </li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Pension ── */}
        <TabsContent value="pension" className="space-y-4 mt-4">
          <h2 className="text-base font-semibold text-slate-700">
            Pension Fund Records
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Contribution Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  {
                    label: "Staff Total Contributions",
                    value: `₦${pensionRecords.reduce((s, p) => s + p.monthlyContribution, 0).toLocaleString()}/mo`,
                  },
                  {
                    label: "Employer Total Contributions",
                    value: `₦${pensionRecords.reduce((s, p) => s + p.employerContribution, 0).toLocaleString()}/mo`,
                  },
                  {
                    label: "Total Combined Balance",
                    value: `₦${totalPension.toLocaleString()}`,
                  },
                  {
                    label: "Average Balance per Staff",
                    value: `₦${Math.round(totalPension / pensionRecords.length).toLocaleString()}`,
                  },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="flex justify-between text-sm border-b last:border-0 pb-2 last:pb-0"
                  >
                    <span className="text-slate-500">{s.label}</span>
                    <span className="font-semibold">{s.value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card className="bg-purple-50 border-purple-200">
              <CardContent className="p-4 space-y-2">
                <p className="text-sm font-semibold text-purple-800">
                  Pension Act Compliance
                </p>
                <ul className="text-xs text-purple-700 space-y-1 list-disc list-inside">
                  <li>Employee contribution: 8% of gross salary</li>
                  <li>Employer contribution: 12% of gross salary</li>
                  <li>Remittances due by 7th of each month</li>
                  <li>All staff must register with a licensed PFA</li>
                  <li>Annual statements sent to each member in January</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    {[
                      "Staff",
                      "PFA",
                      "RSA PIN",
                      "Staff Contribution",
                      "Employer Contribution",
                      "Total Balance",
                      "Last Payment",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pensionRecords.map((p) => (
                    <tr
                      key={p.id}
                      className="border-b last:border-0 hover:bg-slate-50"
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium">{p.staffName}</p>
                        <p className="text-xs text-slate-500">{p.staffId}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{p.pfaName}</td>
                      <td className="px-4 py-3 font-mono text-xs">{p.pin}</td>
                      <td className="px-4 py-3">
                        ₦{p.monthlyContribution.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-purple-600">
                        ₦{p.employerContribution.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 font-bold text-purple-700">
                        ₦{p.totalBalance.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {p.lastContributionDate}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Insurance ── */}
        <TabsContent value="insurance" className="space-y-4 mt-4">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-semibold text-slate-700">
              Insurance Enrollments
            </h2>
            <Badge className="bg-emerald-100 text-emerald-700 text-xs">
              {insuranceEnrollments.filter((i) => i.status === "active").length}{" "}
              Active Policies
            </Badge>
          </div>

          <Card>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    {[
                      "Staff",
                      "Policy Type",
                      "Provider",
                      "Annual Premium",
                      "Coverage",
                      "Expiry",
                      "Status",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {insuranceEnrollments.map((ins) => (
                    <tr
                      key={ins.id}
                      className="border-b last:border-0 hover:bg-slate-50"
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium">{ins.staffName}</p>
                        <p className="text-xs text-slate-500">{ins.staffId}</p>
                      </td>
                      <td className="px-4 py-3">{ins.policyType}</td>
                      <td className="px-4 py-3 text-slate-600">
                        {ins.provider}
                      </td>
                      <td className="px-4 py-3 font-semibold">
                        ₦{ins.annualPremium.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-emerald-600 font-semibold">
                        ₦{ins.coverageAmount.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {ins.expiryDate}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={ins.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          <Card className="bg-slate-50 border-slate-200">
            <CardContent className="p-4 flex items-start gap-3">
              <Upload size={16} className="text-slate-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-slate-700">
                  Upload Insurance Documents
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Policy documents, certificates of insurance, and premium
                  receipts can be uploaded and archived here for audit purposes.
                </p>
                <Button size="sm" variant="outline" className="mt-2">
                  Upload Document
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Loan Application Dialog */}
      <Dialog open={loanDialog} onOpenChange={setLoanDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Loan Application</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Staff ID</Label>
                <Input
                  className="mt-1"
                  value={loanForm.staffId}
                  onChange={(e) =>
                    setLoanForm((f) => ({ ...f, staffId: e.target.value }))
                  }
                  placeholder="e.g. STF001"
                />
              </div>
              <div>
                <Label>Staff Name</Label>
                <Input
                  className="mt-1"
                  value={loanForm.staffName}
                  onChange={(e) =>
                    setLoanForm((f) => ({ ...f, staffName: e.target.value }))
                  }
                  placeholder="Full name"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Loan Amount (₦)</Label>
                <Input
                  className="mt-1"
                  type="number"
                  value={loanForm.amount}
                  onChange={(e) =>
                    setLoanForm((f) => ({ ...f, amount: e.target.value }))
                  }
                  placeholder="e.g. 300000"
                />
              </div>
              <div>
                <Label>Duration (months)</Label>
                <Select
                  value={loanForm.duration}
                  onValueChange={(v) =>
                    setLoanForm((f) => ({ ...f, duration: v }))
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[6, 12, 18, 24, 30, 36].map((d) => (
                      <SelectItem key={d} value={String(d)}>
                        {d} months
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Purpose of Loan</Label>
              <Textarea
                className="mt-1"
                rows={2}
                value={loanForm.purpose}
                onChange={(e) =>
                  setLoanForm((f) => ({ ...f, purpose: e.target.value }))
                }
                placeholder="Reason for loan request"
              />
            </div>
            {loanForm.amount && loanForm.duration && (
              <div className="bg-blue-50 rounded-lg p-3 text-xs text-blue-800">
                <p className="font-semibold">Estimated Repayment</p>
                <p>
                  Monthly: ₦
                  {Math.round(
                    (Number(loanForm.amount) * 1.06) /
                      Number(loanForm.duration),
                  ).toLocaleString()}{" "}
                  &bull; Interest: 6% flat &bull; Total: ₦
                  {Math.round(Number(loanForm.amount) * 1.06).toLocaleString()}
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLoanDialog(false)}>
              Cancel
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={submitLoan}
              disabled={
                !loanForm.staffId ||
                !loanForm.staffName ||
                !loanForm.amount ||
                !loanForm.purpose
              }
            >
              Submit Application
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Medical Claim Dialog */}
      <Dialog open={claimDialog} onOpenChange={setClaimDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Submit Medical Claim</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Staff ID</Label>
                <Input
                  className="mt-1"
                  value={claimForm.staffId}
                  onChange={(e) =>
                    setClaimForm((f) => ({ ...f, staffId: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label>Staff Name</Label>
                <Input
                  className="mt-1"
                  value={claimForm.staffName}
                  onChange={(e) =>
                    setClaimForm((f) => ({ ...f, staffName: e.target.value }))
                  }
                />
              </div>
            </div>
            <div>
              <Label>Claim Type</Label>
              <Select
                value={claimForm.claimType}
                onValueChange={(v) =>
                  setClaimForm((f) => ({ ...f, claimType: v }))
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[
                    "Hospitalization",
                    "Outpatient",
                    "Dental",
                    "Optical",
                    "Maternity",
                    "Emergency",
                    "Prescription",
                  ].map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Claim Amount (₦)</Label>
              <Input
                className="mt-1"
                type="number"
                value={claimForm.amount}
                onChange={(e) =>
                  setClaimForm((f) => ({ ...f, amount: e.target.value }))
                }
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                className="mt-1"
                rows={2}
                value={claimForm.description}
                onChange={(e) =>
                  setClaimForm((f) => ({ ...f, description: e.target.value }))
                }
              />
            </div>
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center">
              <Upload size={20} className="mx-auto text-slate-400 mb-1" />
              <p className="text-xs text-slate-500">
                Upload supporting document
              </p>
              <p className="text-xs text-slate-400">
                (PDF, JPG, PNG — max 5MB)
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setClaimDialog(false)}>
              Cancel
            </Button>
            <Button
              className="bg-rose-600 hover:bg-rose-700"
              onClick={submitClaim}
              disabled={
                !claimForm.staffId ||
                !claimForm.staffName ||
                !claimForm.amount ||
                !claimForm.description
              }
            >
              Submit Claim
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
