import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface DocumentRecord {
    id: string;
    title: string;
    documentType: string;
    uploaderName: string;
    uploaderPrincipal: string;
    linkedRecordType: string;
    notes: string;
    linkedRecordId: string;
    blobId: string;
    uploadedAt: bigint;
}
export interface Memo {
    title: string;
    body: string;
    createdAt: bigint;
    targetAudience: string;
    senderName: string;
}
export interface StaffProfile {
    staffId: string;
    name: string;
    designation: Designation;
    email: string;
    department: string;
}
export interface StaffAppraisal {
    id: string;
    status: AppraisalStatus;
    staffName: string;
    period: string;
    kpis: string;
    cycle: AppraisalCycle;
    submittedAt: bigint;
    reviewComment?: string;
    reviewerName: string;
    achievements: string;
    selfAppraisalText: string;
    targetsNextPeriod: string;
    staffPrincipal: Principal;
    department: string;
    reviewScore?: string;
}
export interface Course {
    title: string;
    semester: string;
    code: string;
    creditUnits: bigint;
    department: string;
    lecturerId: string;
}
export interface Assignment {
    id: string;
    title: string;
    createdAt: bigint;
    dueDate: bigint;
    description: string;
    createdByLecturerId: string;
    courseCode: string;
}
export interface Announcement {
    id: string;
    title: string;
    expiresAt: bigint;
    body: string;
    createdAt: bigint;
    createdBy: string;
    isActive: boolean;
    targetRoles: Array<string>;
    priority: string;
}
export interface ExamResult {
    id: string;
    remark: string;
    status: string;
    semester: string;
    createdAt: bigint;
    rejectionReason: string;
    gradePoints: bigint;
    examScore: bigint;
    totalScore: bigint;
    updatedAt: bigint;
    session: string;
    grade: string;
    creditUnits: bigint;
    studentMatric: string;
    courseTitle: string;
    courseCode: string;
    caScore: bigint;
    approvalLevel: string;
}
export interface Submission {
    id: string;
    studentPrincipal: string;
    submittedAt: bigint;
    feedback?: string;
    grade?: string;
    assignmentId: string;
    studentMatric: string;
    fileIds: Array<string>;
}
export interface AlumniProfile {
    linkedIn: string;
    matricNumber: string;
    name: string;
    graduationYear: bigint;
    email: string;
    employer: string;
    jobTitle: string;
    department: string;
    location: string;
}
export interface HostelApplication {
    id: string;
    status: string;
    studentName: string;
    level: string;
    processedAt: bigint;
    preferredBlock: string;
    adminComment: string;
    studentMatric: string;
    assignedRoom: string;
    department: string;
    roomType: string;
    applicationDate: bigint;
    specialNeeds: string;
}
export interface CAScore {
    id: string;
    semester: string;
    quizScore: bigint;
    testScore: bigint;
    totalCA: bigint;
    createdAt: bigint;
    assignmentScore: bigint;
    lecturerName: string;
    session: string;
    attendanceScore: bigint;
    studentMatric: string;
    courseCode: string;
}
export interface StageRecord {
    decision: string;
    comment: string;
    stage: string;
    decidedAt: bigint;
    decidedBy: string;
}
export interface CourseRegistration {
    id: string;
    status: string;
    semester: string;
    session: string;
    creditUnits: bigint;
    studentMatric: string;
    courseTitle: string;
    courseCode: string;
    registeredAt: bigint;
}
export interface ProgressionStage {
    status: string;
    completedAt: bigint;
    details: string;
    stageName: string;
}
export interface Invoice {
    id: string;
    status: InvoiceStatus;
    semester: string;
    studentMatric: string;
    amount: bigint;
    paidAt?: bigint;
}
export interface AcademicProgression {
    stages: Array<ProgressionStage>;
    studentMatric: string;
}
export interface StudentProfile {
    matricNumber: string;
    name: string;
    email: string;
    level: string;
    department: string;
}
export interface StaffRequest {
    id: string;
    status: RequestStatus;
    submittedByName: string;
    createdAt: bigint;
    submittedBy: Principal;
    description: string;
    stageHistory: Array<StageRecord>;
    currentStage: ApprovalStage;
    requestType: RequestType;
}
export interface UserProfile {
    name: string;
    role: string;
    email: string;
}
export enum AppraisalCycle {
    annual = "annual",
    midYear = "midYear"
}
export enum AppraisalStatus {
    submitted = "submitted",
    finalized = "finalized",
    reviewed = "reviewed",
    draft = "draft"
}
export enum ApprovalStage {
    vc = "vc",
    dvc = "dvc",
    hod = "hod",
    dean = "dean"
}
export enum Designation {
    hr = "hr",
    admin = "admin",
    lecturer = "lecturer",
    support = "support",
    bursary = "bursary"
}
export enum InvoiceStatus {
    pending = "pending",
    paid = "paid"
}
export enum RequestStatus {
    pending = "pending",
    approved = "approved",
    rejected = "rejected"
}
export enum RequestType {
    travel = "travel",
    leave = "leave",
    training = "training"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addProgressionStage(studentMatric: string, stage: ProgressionStage): Promise<void>;
    applyForHostel(app: HostelApplication): Promise<string>;
    approveRegistration(id: string): Promise<void>;
    approveResult(id: string, approverName: string, level: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createAlumniProfile(profile: AlumniProfile): Promise<void>;
    createAnnouncement(ann: Announcement): Promise<string>;
    createAssignment(assignment: Assignment): Promise<string>;
    createCAScore(score: CAScore): Promise<string>;
    createCourse(course: Course): Promise<void>;
    createDocumentRecord(doc: DocumentRecord): Promise<string>;
    createExamResult(result: ExamResult): Promise<string>;
    createInvoice(invoice: Invoice): Promise<string>;
    createMemo(memo: Memo): Promise<string>;
    createProgressionRecord(studentMatric: string): Promise<void>;
    createStaff(staffProfile: StaffProfile): Promise<void>;
    createStudent(student: StudentProfile): Promise<void>;
    deleteAnnouncement(id: string): Promise<void>;
    dropCourse(id: string): Promise<void>;
    finalizeAppraisal(appraisalId: string): Promise<void>;
    getAllRegistrations(): Promise<Array<CourseRegistration>>;
    getAlumniProfile(matricNumber: string): Promise<AlumniProfile | null>;
    getAnnouncement(id: string): Promise<Announcement | null>;
    getAppraisal(id: string): Promise<StaffAppraisal | null>;
    getCAScore(id: string): Promise<CAScore | null>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCourse(code: string): Promise<Course | null>;
    getDocumentRecord(id: string): Promise<DocumentRecord | null>;
    getExamResult(id: string): Promise<ExamResult | null>;
    getHostelApplication(id: string): Promise<HostelApplication | null>;
    getMemo(id: string): Promise<Memo | null>;
    getProgressionRecord(studentMatric: string): Promise<AcademicProgression | null>;
    getStaff(staffId: string): Promise<StaffProfile | null>;
    getStaffRequest(requestId: string): Promise<StaffRequest | null>;
    getStudentByEmail(email: string): Promise<StudentProfile | null>;
    getStudentByMatricNumber(matricNumber: string): Promise<StudentProfile | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    gradeSubmission(submissionId: string, grade: string, feedback: string): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    listActiveAnnouncements(): Promise<Array<Announcement>>;
    listAllAlumni(): Promise<Array<AlumniProfile>>;
    listAllAnnouncements(): Promise<Array<Announcement>>;
    listAllAppraisals(): Promise<Array<StaffAppraisal>>;
    listAllAssignments(): Promise<Array<Assignment>>;
    listAllCourses(): Promise<Array<Course>>;
    listAllDocuments(): Promise<Array<DocumentRecord>>;
    listAllHostelApplications(): Promise<Array<HostelApplication>>;
    listAllInvoices(): Promise<Array<Invoice>>;
    listAllMemos(): Promise<Array<Memo>>;
    listAllProgressionRecords(): Promise<Array<AcademicProgression>>;
    listAllStaff(): Promise<Array<StaffProfile>>;
    listAllStaffByStaffId(): Promise<Array<StaffProfile>>;
    listAllStaffRequests(): Promise<Array<StaffRequest>>;
    listAllStudents(): Promise<Array<StudentProfile>>;
    listAllStudentsByMatricNumber(): Promise<Array<StudentProfile>>;
    listAppraisalsByStaff(staffPrincipal: Principal): Promise<Array<StaffAppraisal>>;
    listAssignmentsByCourse(courseCode: string): Promise<Array<Assignment>>;
    listCAScoresByCourse(courseCode: string): Promise<Array<CAScore>>;
    listCAScoresByStudent(studentMatric: string): Promise<Array<CAScore>>;
    listDocumentsByLinkedRecord(linkedRecordId: string): Promise<Array<DocumentRecord>>;
    listDocumentsByType(documentType: string): Promise<Array<DocumentRecord>>;
    listDocumentsByUploader(uploaderPrincipal: string): Promise<Array<DocumentRecord>>;
    listHostelApplicationsByStatus(status: string): Promise<Array<HostelApplication>>;
    listHostelApplicationsByStudent(studentMatric: string): Promise<Array<HostelApplication>>;
    listInvoicesByStudent(studentMatric: string): Promise<Array<Invoice>>;
    listMyStaffRequests(): Promise<Array<StaffRequest>>;
    listMySubmissions(studentPrincipal: string): Promise<Array<Submission>>;
    listRegistrationsByCourse(courseCode: string): Promise<Array<CourseRegistration>>;
    listRegistrationsByStudent(studentMatric: string): Promise<Array<CourseRegistration>>;
    listResultsByCourse(courseCode: string): Promise<Array<ExamResult>>;
    listResultsBySemester(semester: string, session: string): Promise<Array<ExamResult>>;
    listResultsByStatus(status: string): Promise<Array<ExamResult>>;
    listResultsByStudent(studentMatric: string): Promise<Array<ExamResult>>;
    listSubmissionsByAssignment(assignmentId: string): Promise<Array<Submission>>;
    markInvoicePaid(invoiceId: string, paidAt: bigint): Promise<void>;
    processHostelApplication(id: string, status: string, assignedRoom: string, comment: string, processedAt: bigint): Promise<void>;
    processStaffRequest(requestId: string, decision: string, comment: string, decidedBy: string, decidedAt: bigint): Promise<void>;
    publishResult(id: string): Promise<void>;
    registerCourse(reg: CourseRegistration): Promise<string>;
    rejectResult(id: string, reason: string): Promise<void>;
    reviewAppraisal(appraisalId: string, reviewerName: string, reviewScore: string, reviewComment: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    submitAssignment(submission: Submission): Promise<string>;
    submitResultForApproval(id: string): Promise<void>;
    submitSelfAppraisal(appraisal: StaffAppraisal): Promise<string>;
    submitStaffRequest(req: StaffRequest): Promise<string>;
    updateAlumniProfile(matricNumber: string, profile: AlumniProfile): Promise<void>;
    updateAnnouncement(id: string, ann: Announcement): Promise<void>;
    updateCAScore(id: string, score: CAScore): Promise<void>;
    updateCourse(code: string, course: Course): Promise<void>;
    updateExamResult(id: string, result: ExamResult): Promise<void>;
    updateStaff(staffId: string, staffProfile: StaffProfile): Promise<void>;
    updateStudent(matricNumber: string, student: StudentProfile): Promise<void>;
}
