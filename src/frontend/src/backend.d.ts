import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
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
export interface StageRecord {
    decision: string;
    comment: string;
    stage: string;
    decidedAt: bigint;
    decidedBy: string;
}
export interface StaffProfile {
    staffId: string;
    name: string;
    designation: Designation;
    email: string;
    department: string;
}
export interface ProgressionStage {
    status: string;
    completedAt: bigint;
    details: string;
    stageName: string;
}
export interface Memo {
    title: string;
    body: string;
    createdAt: bigint;
    targetAudience: string;
    senderName: string;
}
export interface Invoice {
    id: string;
    status: InvoiceStatus;
    semester: string;
    studentMatric: string;
    amount: bigint;
    paidAt?: bigint;
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
export interface AcademicProgression {
    stages: Array<ProgressionStage>;
    studentMatric: string;
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
export interface UserProfile {
    name: string;
    role: string;
    email: string;
}
// v8 new types
export interface BackendCAScore {
    id: string;
    courseCode: string;
    studentMatric: string;
    assignmentScore: bigint;
    quizScore: bigint;
    testScore: bigint;
    attendanceScore: bigint;
    totalCA: bigint;
    semester: string;
    session: string;
    lecturerName: string;
    createdAt: bigint;
}
export interface BackendExamResult {
    id: string;
    courseCode: string;
    courseTitle: string;
    creditUnits: bigint;
    studentMatric: string;
    examScore: bigint;
    caScore: bigint;
    totalScore: bigint;
    grade: string;
    gradePoints: bigint;
    remark: string;
    semester: string;
    session: string;
    status: string;
    approvalLevel: string;
    rejectionReason: string;
    createdAt: bigint;
    updatedAt: bigint;
}
export interface BackendCourseRegistration {
    id: string;
    studentMatric: string;
    courseCode: string;
    courseTitle: string;
    creditUnits: bigint;
    semester: string;
    session: string;
    registeredAt: bigint;
    status: string;
}
export interface BackendAnnouncement {
    id: string;
    title: string;
    body: string;
    targetRoles: string[];
    priority: string;
    createdBy: string;
    createdAt: bigint;
    expiresAt: bigint;
    isActive: boolean;
}
export interface BackendHostelApplication {
    id: string;
    studentMatric: string;
    studentName: string;
    department: string;
    level: string;
    roomType: string;
    preferredBlock: string;
    specialNeeds: string;
    applicationDate: bigint;
    status: string;
    assignedRoom: string;
    adminComment: string;
    processedAt: bigint;
}
export interface DocumentRecord {
    id: string;
    title: string;
    documentType: string;
    blobId: string;
    uploaderPrincipal: string;
    uploaderName: string;
    linkedRecordId: string;
    linkedRecordType: string;
    uploadedAt: bigint;
    notes: string;
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
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createAlumniProfile(profile: AlumniProfile): Promise<void>;
    createAssignment(assignment: Assignment): Promise<string>;
    createCourse(course: Course): Promise<void>;
    createInvoice(invoice: Invoice): Promise<string>;
    createMemo(memo: Memo): Promise<string>;
    createProgressionRecord(studentMatric: string): Promise<void>;
    createStaff(staffProfile: StaffProfile): Promise<void>;
    createStudent(student: StudentProfile): Promise<void>;
    finalizeAppraisal(appraisalId: string): Promise<void>;
    getAlumniProfile(matricNumber: string): Promise<AlumniProfile | null>;
    getAppraisal(id: string): Promise<StaffAppraisal | null>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCourse(code: string): Promise<Course | null>;
    getMemo(id: string): Promise<Memo | null>;
    getProgressionRecord(studentMatric: string): Promise<AcademicProgression | null>;
    getStaff(staffId: string): Promise<StaffProfile | null>;
    getStaffRequest(requestId: string): Promise<StaffRequest | null>;
    getStudentByEmail(email: string): Promise<StudentProfile | null>;
    getStudentByMatricNumber(matricNumber: string): Promise<StudentProfile | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    gradeSubmission(submissionId: string, grade: string, feedback: string): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    listAllAlumni(): Promise<Array<AlumniProfile>>;
    listAllAppraisals(): Promise<Array<StaffAppraisal>>;
    listAllAssignments(): Promise<Array<Assignment>>;
    listAllCourses(): Promise<Array<Course>>;
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
    listInvoicesByStudent(studentMatric: string): Promise<Array<Invoice>>;
    listMyStaffRequests(): Promise<Array<StaffRequest>>;
    listMySubmissions(studentPrincipal: string): Promise<Array<Submission>>;
    listSubmissionsByAssignment(assignmentId: string): Promise<Array<Submission>>;
    markInvoicePaid(invoiceId: string, paidAt: bigint): Promise<void>;
    processStaffRequest(requestId: string, decision: string, comment: string, decidedBy: string, decidedAt: bigint): Promise<void>;
    reviewAppraisal(appraisalId: string, reviewerName: string, reviewScore: string, reviewComment: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    submitAssignment(submission: Submission): Promise<string>;
    submitSelfAppraisal(appraisal: StaffAppraisal): Promise<string>;
    submitStaffRequest(req: StaffRequest): Promise<string>;
    updateAlumniProfile(matricNumber: string, profile: AlumniProfile): Promise<void>;
    updateCourse(code: string, course: Course): Promise<void>;
    updateStaff(staffId: string, staffProfile: StaffProfile): Promise<void>;
    updateStudent(matricNumber: string, student: StudentProfile): Promise<void>;
    // v8 CA Scores
    createCAScore(score: BackendCAScore): Promise<string>;
    updateCAScore(id: string, score: BackendCAScore): Promise<void>;
    getCAScore(id: string): Promise<BackendCAScore | null>;
    listCAScoresByCourse(courseCode: string): Promise<Array<BackendCAScore>>;
    listCAScoresByStudent(studentMatric: string): Promise<Array<BackendCAScore>>;
    // v8 Exam Results
    createExamResult(result: BackendExamResult): Promise<string>;
    updateExamResult(id: string, result: BackendExamResult): Promise<void>;
    submitResultForApproval(id: string): Promise<void>;
    approveResult(id: string, approverName: string, level: string): Promise<void>;
    rejectResult(id: string, reason: string): Promise<void>;
    publishResult(id: string): Promise<void>;
    getExamResult(id: string): Promise<BackendExamResult | null>;
    listResultsByStudent(studentMatric: string): Promise<Array<BackendExamResult>>;
    listResultsByCourse(courseCode: string): Promise<Array<BackendExamResult>>;
    listResultsByStatus(status: string): Promise<Array<BackendExamResult>>;
    listResultsBySemester(semester: string, session: string): Promise<Array<BackendExamResult>>;
    // v8 Course Registrations
    registerCourse(reg: BackendCourseRegistration): Promise<string>;
    dropCourse(id: string): Promise<void>;
    approveRegistration(id: string): Promise<void>;
    listRegistrationsByStudent(studentMatric: string): Promise<Array<BackendCourseRegistration>>;
    listRegistrationsByCourse(courseCode: string): Promise<Array<BackendCourseRegistration>>;
    getAllRegistrations(): Promise<Array<BackendCourseRegistration>>;
    // v8 Announcements
    createAnnouncement(ann: BackendAnnouncement): Promise<string>;
    updateAnnouncement(id: string, ann: BackendAnnouncement): Promise<void>;
    deleteAnnouncement(id: string): Promise<void>;
    getAnnouncement(id: string): Promise<BackendAnnouncement | null>;
    listActiveAnnouncements(): Promise<Array<BackendAnnouncement>>;
    listAllAnnouncements(): Promise<Array<BackendAnnouncement>>;
    // v8 Hostel Applications
    applyForHostel(app: BackendHostelApplication): Promise<string>;
    processHostelApplication(id: string, status: string, assignedRoom: string, comment: string, processedAt: bigint): Promise<void>;
    getHostelApplication(id: string): Promise<BackendHostelApplication | null>;
    listHostelApplicationsByStudent(studentMatric: string): Promise<Array<BackendHostelApplication>>;
    listAllHostelApplications(): Promise<Array<BackendHostelApplication>>;
    listHostelApplicationsByStatus(status: string): Promise<Array<BackendHostelApplication>>;
    // v8 Document Records
    createDocumentRecord(doc: DocumentRecord): Promise<string>;
    getDocumentRecord(id: string): Promise<DocumentRecord | null>;
    listDocumentsByUploader(uploaderPrincipal: string): Promise<Array<DocumentRecord>>;
    listDocumentsByLinkedRecord(linkedRecordId: string): Promise<Array<DocumentRecord>>;
    listDocumentsByType(documentType: string): Promise<Array<DocumentRecord>>;
    listAllDocuments(): Promise<Array<DocumentRecord>>;
}