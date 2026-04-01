import Array "mo:core/Array";
import Iter "mo:core/Iter";
import List "mo:core/List";
import Map "mo:core/Map";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import Nat "mo:core/Nat";
import Int "mo:core/Int";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import MixinStorage "blob-storage/Mixin";


actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  // User Profile Management
  public type UserProfile = {
    name : Text;
    role : Text; // "admin", "lecturer", "student", "bursary", "hr"
    email : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Helper function to check if caller has a specific role
  func hasRole(caller : Principal, role : Text) : Bool {
    switch (userProfiles.get(caller)) {
      case (?profile) { profile.role == role };
      case null { false };
    };
  };

  func hasAnyRole(caller : Principal, roles : [Text]) : Bool {
    switch (userProfiles.get(caller)) {
      case (?profile) {
        roles.find<Text>(func(r) { r == profile.role }) != null;
      };
      case null { false };
    };
  };

  module Student {
    public type StudentProfile = {
      name : Text;
      matricNumber : Text;
      department : Text;
      level : Text;
      email : Text;
    };

    public func compareByMatricNumber(a : StudentProfile, b : StudentProfile) : Order.Order {
      Text.compare(a.matricNumber, b.matricNumber);
    };

    public func compare(a : StudentProfile, b : StudentProfile) : Order.Order {
      switch (Text.compare(a.name, b.name)) {
        case (#equal) { compareByMatricNumber(a, b) };
        case (order) { order };
      };
    };
  };

  type StudentProfile = Student.StudentProfile;

  let students = Map.empty<Text, StudentProfile>();

  type Course = {
    code : Text;
    title : Text;
    creditUnits : Nat;
    department : Text;
    semester : Text;
    lecturerId : Text;
  };

  let courses = Map.empty<Text, Course>();

  module Staff {
    type Designation = {
      #lecturer;
      #admin;
      #bursary;
      #hr;
      #support;
    };

    public type StaffProfile = {
      name : Text;
      staffId : Text;
      department : Text;
      designation : Designation;
      email : Text;
    };

    public func compareByStaffId(a : StaffProfile, b : StaffProfile) : Order.Order {
      Text.compare(a.staffId, b.staffId);
    };

    public func compare(a : StaffProfile, b : StaffProfile) : Order.Order {
      switch (Text.compare(a.name, b.name)) {
        case (#equal) { compareByStaffId(a, b) };
        case (order) { order };
      };
    };
  };

  type StaffProfile = Staff.StaffProfile;

  let staff = Map.empty<Text, StaffProfile>();

  type Memo = {
    title : Text;
    body : Text;
    senderName : Text;
    targetAudience : Text;
    createdAt : Int;
  };

  let memos = Map.empty<Text, Memo>();

  // ==================== ASSIGNMENTS ====================

  public type Assignment = {
    id : Text;
    title : Text;
    description : Text;
    dueDate : Int;
    courseCode : Text;
    createdByLecturerId : Text;
    createdAt : Int;
  };

  public type Submission = {
    id : Text;
    assignmentId : Text;
    studentPrincipal : Text;
    studentMatric : Text;
    fileIds : [Text];
    submittedAt : Int;
    grade : ?Text;
    feedback : ?Text;
  };

  let assignments = Map.empty<Text, Assignment>();
  let submissions = Map.empty<Text, Submission>();

  public shared ({ caller }) func createAssignment(assignment : Assignment) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized");
    };
    if (not (AccessControl.isAdmin(accessControlState, caller) or hasRole(caller, "lecturer"))) {
      Runtime.trap("Unauthorized: Only lecturers can create assignments");
    };
    let id = (assignments.size() + 1).toText();
    let a = { assignment with id = id };
    assignments.add(id, a);
    id;
  };

  public query ({ caller }) func listAssignmentsByCourse(courseCode : Text) : async [Assignment] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized");
    };
    assignments.values().toArray().filter(func(a) { a.courseCode == courseCode });
  };

  public query ({ caller }) func listAllAssignments() : async [Assignment] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized");
    };
    assignments.values().toArray();
  };

  public shared ({ caller }) func submitAssignment(submission : Submission) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized");
    };
    let id = (submissions.size() + 1).toText();
    let s = { submission with id = id };
    submissions.add(id, s);
    id;
  };

  public query ({ caller }) func listSubmissionsByAssignment(assignmentId : Text) : async [Submission] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized");
    };
    if (not (AccessControl.isAdmin(accessControlState, caller) or hasAnyRole(caller, ["lecturer", "hr"]))) {
      Runtime.trap("Unauthorized: Only lecturers can view submissions");
    };
    submissions.values().toArray().filter(func(s) { s.assignmentId == assignmentId });
  };

  public query ({ caller }) func listMySubmissions(studentPrincipal : Text) : async [Submission] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized");
    };
    submissions.values().toArray().filter(func(s) { s.studentPrincipal == studentPrincipal });
  };

  public shared ({ caller }) func gradeSubmission(submissionId : Text, grade : Text, feedback : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized");
    };
    if (not (AccessControl.isAdmin(accessControlState, caller) or hasRole(caller, "lecturer"))) {
      Runtime.trap("Unauthorized: Only lecturers can grade submissions");
    };
    switch (submissions.get(submissionId)) {
      case (?s) {
        submissions.add(submissionId, { s with grade = ?grade; feedback = ?feedback });
      };
      case null { Runtime.trap("Submission not found") };
    };
  };

  // ==================== INVOICES ====================

  public type InvoiceStatus = { #pending; #paid };

  public type Invoice = {
    id : Text;
    studentMatric : Text;
    semester : Text;
    amount : Nat;
    status : InvoiceStatus;
    paidAt : ?Int;
  };

  let invoices = Map.empty<Text, Invoice>();

  public shared ({ caller }) func createInvoice(invoice : Invoice) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized");
    };
    if (not (AccessControl.isAdmin(accessControlState, caller) or hasRole(caller, "bursary"))) {
      Runtime.trap("Unauthorized: Only bursary or admin can create invoices");
    };
    let id = (invoices.size() + 1).toText();
    let inv = { invoice with id = id };
    invoices.add(id, inv);
    id;
  };

  public query ({ caller }) func listInvoicesByStudent(studentMatric : Text) : async [Invoice] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized");
    };
    invoices.values().toArray().filter(func(i) { i.studentMatric == studentMatric });
  };

  public query ({ caller }) func listAllInvoices() : async [Invoice] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized");
    };
    if (not (AccessControl.isAdmin(accessControlState, caller) or hasRole(caller, "bursary"))) {
      Runtime.trap("Unauthorized: Only bursary or admin can list all invoices");
    };
    invoices.values().toArray();
  };

  public shared ({ caller }) func markInvoicePaid(invoiceId : Text, paidAt : Int) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized");
    };
    if (not (AccessControl.isAdmin(accessControlState, caller) or hasRole(caller, "bursary"))) {
      Runtime.trap("Unauthorized: Only bursary or admin can mark invoices as paid");
    };
    switch (invoices.get(invoiceId)) {
      case (?inv) {
        invoices.add(invoiceId, { inv with status = #paid; paidAt = ?paidAt });
      };
      case null { Runtime.trap("Invoice not found") };
    };
  };

  // ==================== STAFF REQUESTS ====================

  public type RequestType = { #leave; #travel; #training };
  public type RequestStatus = { #pending; #approved; #rejected };
  public type ApprovalStage = { #hod; #dean; #dvc; #vc };

  public type StageRecord = {
    stage : Text;
    decision : Text;
    comment : Text;
    decidedBy : Text;
    decidedAt : Int;
  };

  public type StaffRequest = {
    id : Text;
    submittedBy : Principal;
    submittedByName : Text;
    requestType : RequestType;
    description : Text;
    status : RequestStatus;
    currentStage : ApprovalStage;
    stageHistory : [StageRecord];
    createdAt : Int;
  };

  let staffRequests = Map.empty<Text, StaffRequest>();

  public shared ({ caller }) func submitStaffRequest(req : StaffRequest) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized");
    };
    let id = (staffRequests.size() + 1).toText();
    let r = { req with id = id; submittedBy = caller; status = #pending; currentStage = #hod; stageHistory = [] };
    staffRequests.add(id, r);
    id;
  };

  public query ({ caller }) func listMyStaffRequests() : async [StaffRequest] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized");
    };
    staffRequests.values().toArray().filter(func(r) { r.submittedBy == caller });
  };

  public query ({ caller }) func listAllStaffRequests() : async [StaffRequest] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized");
    };
    if (not (AccessControl.isAdmin(accessControlState, caller) or hasRole(caller, "hr"))) {
      Runtime.trap("Unauthorized: Only admin or HR can list all requests");
    };
    staffRequests.values().toArray();
  };

  public query ({ caller }) func getStaffRequest(requestId : Text) : async ?StaffRequest {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized");
    };
    switch (staffRequests.get(requestId)) {
      case (?req) {
        if (req.submittedBy != caller and not (AccessControl.isAdmin(accessControlState, caller) or hasRole(caller, "hr"))) {
          Runtime.trap("Unauthorized: Can only view your own requests");
        };
        ?req;
      };
      case null { null };
    };
  };

  public shared ({ caller }) func processStaffRequest(requestId : Text, decision : Text, comment : Text, decidedBy : Text, decidedAt : Int) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized");
    };
    if (not (AccessControl.isAdmin(accessControlState, caller) or hasAnyRole(caller, ["hr", "admin", "lecturer"]))) {
      Runtime.trap("Unauthorized: Only authorized approvers can process requests");
    };
    switch (staffRequests.get(requestId)) {
      case (?req) {
        let stageText = switch (req.currentStage) {
          case (#hod) { "hod" };
          case (#dean) { "dean" };
          case (#dvc) { "dvc" };
          case (#vc) { "vc" };
        };
        let newRecord : StageRecord = {
          stage = stageText;
          decision = decision;
          comment = comment;
          decidedBy = decidedBy;
          decidedAt = decidedAt;
        };
        let newHistory = req.stageHistory.vals().concat([newRecord].vals()).toArray();
        if (decision == "rejected") {
          staffRequests.add(requestId, { req with status = #rejected; stageHistory = newHistory });
        } else {
          // advance to next stage or mark approved
          let (newStatus, newStage) : (RequestStatus, ApprovalStage) = switch (req.currentStage) {
            case (#hod) { (#pending, #dean) };
            case (#dean) { (#pending, #dvc) };
            case (#dvc) { (#pending, #vc) };
            case (#vc) { (#approved, #vc) };
          };
          staffRequests.add(requestId, { req with status = newStatus; currentStage = newStage; stageHistory = newHistory });
        };
      };
      case null { Runtime.trap("Request not found") };
    };
  };

  // ==================== ALUMNI MANAGEMENT ====================

  public type AlumniProfile = {
    name : Text;
    matricNumber : Text;
    department : Text;
    graduationYear : Nat;
    employer : Text;
    jobTitle : Text;
    location : Text;
    linkedIn : Text;
    email : Text;
  };

  let alumni = Map.empty<Text, AlumniProfile>();
  let alumniOwnership = Map.empty<Text, Principal>();

  public shared ({ caller }) func createAlumniProfile(profile : AlumniProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create alumni profiles");
    };
    if (alumni.containsKey(profile.matricNumber)) {
      Runtime.trap("Alumni profile already exists");
    };
    alumni.add(profile.matricNumber, profile);
    alumniOwnership.add(profile.matricNumber, caller);
  };

  public shared ({ caller }) func updateAlumniProfile(matricNumber : Text, profile : AlumniProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can update alumni profiles");
    };
    if (not alumni.containsKey(matricNumber)) {
      Runtime.trap("Alumni profile does not exist");
    };
    switch (alumniOwnership.get(matricNumber)) {
      case (?owner) {
        if (owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Alumni can only update their own profile");
        };
      };
      case null {
        if (not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Alumni can only update their own profile");
        };
      };
    };
    alumni.add(matricNumber, profile);
  };

  public query ({ caller }) func getAlumniProfile(matricNumber : Text) : async ?AlumniProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view alumni profiles");
    };
    alumni.get(matricNumber);
  };

  public query ({ caller }) func listAllAlumni() : async [AlumniProfile] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can list all alumni");
    };
    alumni.values().toArray();
  };

  // ==================== STAFF APPRAISAL ====================

  public type AppraisalCycle = { #annual; #midYear };
  public type AppraisalStatus = { #draft; #submitted; #reviewed; #finalized };

  public type StaffAppraisal = {
    id : Text;
    staffPrincipal : Principal;
    staffName : Text;
    department : Text;
    cycle : AppraisalCycle;
    period : Text;
    selfAppraisalText : Text;
    kpis : Text;
    achievements : Text;
    targetsNextPeriod : Text;
    submittedAt : Int;
    reviewerName : Text;
    reviewScore : ?Text;
    reviewComment : ?Text;
    status : AppraisalStatus;
  };

  let appraisals = Map.empty<Text, StaffAppraisal>();

  public shared ({ caller }) func submitSelfAppraisal(appraisal : StaffAppraisal) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized");
    };
    let id = (appraisals.size() + 1).toText();
    let a = {
      appraisal with
      id = id;
      staffPrincipal = caller;
      status = #submitted;
      reviewScore = null;
      reviewComment = null;
    };
    appraisals.add(id, a);
    id;
  };

  public query ({ caller }) func getAppraisal(id : Text) : async ?StaffAppraisal {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view appraisals");
    };
    switch (appraisals.get(id)) {
      case (?appraisal) {
        if (appraisal.staffPrincipal != caller and not (AccessControl.isAdmin(accessControlState, caller) or hasRole(caller, "hr"))) {
          Runtime.trap("Unauthorized: Can only view your own appraisals");
        };
        ?appraisal;
      };
      case null { null };
    };
  };

  public query ({ caller }) func listAppraisalsByStaff(staffPrincipal : Principal) : async [StaffAppraisal] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized");
    };
    if (staffPrincipal != caller and not (AccessControl.isAdmin(accessControlState, caller) or hasRole(caller, "hr"))) {
      Runtime.trap("Unauthorized: Can only view your own appraisals");
    };
    appraisals.values().toArray().filter(func(a) { a.staffPrincipal == staffPrincipal });
  };

  public query ({ caller }) func listAllAppraisals() : async [StaffAppraisal] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized");
    };
    if (not (AccessControl.isAdmin(accessControlState, caller) or hasRole(caller, "hr"))) {
      Runtime.trap("Unauthorized: Only HR or admin can view all appraisals");
    };
    appraisals.values().toArray();
  };

  public shared ({ caller }) func reviewAppraisal(appraisalId : Text, reviewerName : Text, reviewScore : Text, reviewComment : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized");
    };
    if (not (AccessControl.isAdmin(accessControlState, caller) or hasAnyRole(caller, ["hr", "lecturer"]))) {
      Runtime.trap("Unauthorized: Only HR, admin, or HOD can review appraisals");
    };
    switch (appraisals.get(appraisalId)) {
      case (?a) {
        appraisals.add(appraisalId, {
          a with
          reviewerName;
          reviewScore = ?reviewScore;
          reviewComment = ?reviewComment;
          status = #reviewed;
        });
      };
      case null { Runtime.trap("Appraisal not found") };
    };
  };

  public shared ({ caller }) func finalizeAppraisal(appraisalId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized");
    };
    if (not (AccessControl.isAdmin(accessControlState, caller) or hasRole(caller, "hr"))) {
      Runtime.trap("Unauthorized: Only HR can finalize appraisals");
    };
    switch (appraisals.get(appraisalId)) {
      case (?a) {
        appraisals.add(appraisalId, { a with status = #finalized });
      };
      case null { Runtime.trap("Appraisal not found") };
    };
  };

  // ==================== ACADEMIC PROGRESSION ====================

  public type ProgressionStage = {
    stageName : Text;
    status : Text; // "in progress", "completed"
    completedAt : Int;
    details : Text;
  };

  public type AcademicProgression = {
    studentMatric : Text;
    stages : [ProgressionStage];
  };

  let progression = Map.empty<Text, AcademicProgression>();

  public shared ({ caller }) func createProgressionRecord(studentMatric : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can create progression records");
    };
    if (progression.containsKey(studentMatric)) {
      Runtime.trap("Progression record already exists");
    };
    let newRecord : AcademicProgression = {
      studentMatric;
      stages = [];
    };
    progression.add(studentMatric, newRecord);
  };

  public shared ({ caller }) func addProgressionStage(studentMatric : Text, stage : ProgressionStage) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can add progression stages");
    };
    switch (progression.get(studentMatric)) {
      case (?record) {
        let newStages = record.stages.vals().concat([stage].vals()).toArray();
        let updatedRecord : AcademicProgression = {
          record with
          stages = newStages;
        };
        progression.add(studentMatric, updatedRecord);
      };
      case null { Runtime.trap("Progression record not found") };
    };
  };

  public query ({ caller }) func getProgressionRecord(studentMatric : Text) : async ?AcademicProgression {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view progression records");
    };
    switch (userProfiles.get(caller)) {
      case (?profile) {
        switch (students.get(studentMatric)) {
          case (?student) {
            if (student.email != profile.email and not AccessControl.isAdmin(accessControlState, caller)) {
              Runtime.trap("Unauthorized: Students can only view their own progression");
            };
          };
          case null {
            if (not AccessControl.isAdmin(accessControlState, caller)) {
              Runtime.trap("Unauthorized: Students can only view their own progression");
            };
          };
        };
      };
      case null {
        if (not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Students can only view their own progression");
        };
      };
    };
    progression.get(studentMatric);
  };

  public query ({ caller }) func listAllProgressionRecords() : async [AcademicProgression] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can list all progression records");
    };
    progression.values().toArray();
  };

  // ==================== EXISTING FUNCTIONS ====================

  // Student Query Functions - Require authenticated user
  public query ({ caller }) func getStudentByMatricNumber(matricNumber : Text) : async ?StudentProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view student profiles");
    };
    students.get(matricNumber);
  };

  public query ({ caller }) func getStudentByEmail(email : Text) : async ?StudentProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view student profiles");
    };
    students.values().toArray().find(func(student) { student.email == email });
  };

  public query ({ caller }) func listAllStudents() : async [StudentProfile] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can list students");
    };
    students.values().toArray().sort();
  };

  public query ({ caller }) func listAllStudentsByMatricNumber() : async [StudentProfile] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can list students");
    };
    students.values().toArray().sort(Student.compareByMatricNumber);
  };

  // Course Query Functions - Require authenticated user
  public query ({ caller }) func getCourse(code : Text) : async ?Course {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view courses");
    };
    courses.get(code);
  };

  public query ({ caller }) func listAllCourses() : async [Course] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can list courses");
    };
    courses.values().toArray();
  };

  // Staff Query Functions - Require authenticated user
  public query ({ caller }) func getStaff(staffId : Text) : async ?StaffProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view staff profiles");
    };
    staff.get(staffId);
  };

  public query ({ caller }) func listAllStaff() : async [StaffProfile] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can list staff");
    };
    staff.values().toArray().sort();
  };

  public query ({ caller }) func listAllStaffByStaffId() : async [StaffProfile] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can list staff");
    };
    staff.values().toArray().sort(Staff.compareByStaffId);
  };

  // Memo Query Functions - Require authenticated user
  public query ({ caller }) func getMemo(id : Text) : async ?Memo {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view memos");
    };
    memos.get(id);
  };

  public query ({ caller }) func listAllMemos() : async [Memo] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can list memos");
    };
    memos.values().toArray();
  };

  // Student Mutation Functions - Admin only
  public shared ({ caller }) func createStudent(student : StudentProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create students");
    };
    if (students.containsKey(student.matricNumber)) {
      Runtime.trap("Student already exists");
    };
    students.add(student.matricNumber, student);
  };

  public shared ({ caller }) func updateStudent(matricNumber : Text, student : StudentProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update students");
    };
    if (not students.containsKey(matricNumber)) {
      Runtime.trap("Student does not exist");
    };
    students.add(matricNumber, student);
  };

  // Course Mutation Functions - Admin or Lecturer
  public shared ({ caller }) func createCourse(course : Course) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create courses");
    };
    if (not (AccessControl.isAdmin(accessControlState, caller) or hasRole(caller, "lecturer"))) {
      Runtime.trap("Unauthorized: Only admins or lecturers can create courses");
    };
    if (courses.containsKey(course.code)) {
      Runtime.trap("Course already exists");
    };
    courses.add(course.code, course);
  };

  public shared ({ caller }) func updateCourse(code : Text, course : Course) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can update courses");
    };
    if (not (AccessControl.isAdmin(accessControlState, caller) or hasRole(caller, "lecturer"))) {
      Runtime.trap("Unauthorized: Only admins or lecturers can update courses");
    };
    if (not courses.containsKey(code)) {
      Runtime.trap("Course does not exist");
    };
    courses.add(code, course);
  };

  // Staff Mutation Functions - Admin or HR
  public shared ({ caller }) func createStaff(staffProfile : StaffProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create staff");
    };
    if (not (AccessControl.isAdmin(accessControlState, caller) or hasRole(caller, "hr"))) {
      Runtime.trap("Unauthorized: Only admins or HR can create staff");
    };
    if (staff.containsKey(staffProfile.staffId)) {
      Runtime.trap("Staff already exists");
    };
    staff.add(staffProfile.staffId, staffProfile);
  };

  public shared ({ caller }) func updateStaff(staffId : Text, staffProfile : StaffProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can update staff");
    };
    if (not (AccessControl.isAdmin(accessControlState, caller) or hasRole(caller, "hr"))) {
      Runtime.trap("Unauthorized: Only admins or HR can update staff");
    };
    if (not staff.containsKey(staffId)) {
      Runtime.trap("Staff does not exist");
    };
    staff.add(staffId, staffProfile);
  };

  // Memo Mutation Functions - Admin or authorized staff roles
  public shared ({ caller }) func createMemo(memo : Memo) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create memos");
    };
    if (not (AccessControl.isAdmin(accessControlState, caller) or hasAnyRole(caller, ["lecturer", "hr", "bursary"]))) {
      Runtime.trap("Unauthorized: Only admins or authorized staff can create memos");
    };
    let id = (memos.size() + 1).toText();
    memos.add(id, memo);
    id;
  };

  // ==================== CA SCORES ====================

  public type CAScore = {
    id : Text;
    courseCode : Text;
    studentMatric : Text;
    assignmentScore : Nat;
    quizScore : Nat;
    testScore : Nat;
    attendanceScore : Nat;
    totalCA : Nat;
    semester : Text;
    session : Text;
    lecturerName : Text;
    createdAt : Int;
  };

  let caScores = Map.empty<Text, CAScore>();

  public shared ({ caller }) func createCAScore(score : CAScore) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized");
    };
    if (not (AccessControl.isAdmin(accessControlState, caller) or hasRole(caller, "lecturer"))) {
      Runtime.trap("Unauthorized: Only lecturers can create CA scores");
    };
    let id = (caScores.size() + 1).toText();
    let s = { score with id = id };
    caScores.add(id, s);
    id;
  };

  public shared ({ caller }) func updateCAScore(id : Text, score : CAScore) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized");
    };
    if (not (AccessControl.isAdmin(accessControlState, caller) or hasRole(caller, "lecturer"))) {
      Runtime.trap("Unauthorized: Only lecturers can update CA scores");
    };
    if (not caScores.containsKey(id)) {
      Runtime.trap("CA Score not found");
    };
    caScores.add(id, { score with id = id });
  };

  public query ({ caller }) func getCAScore(id : Text) : async ?CAScore {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized");
    };
    caScores.get(id);
  };

  public query ({ caller }) func listCAScoresByCourse(courseCode : Text) : async [CAScore] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized");
    };
    caScores.values().toArray().filter(func(s) { s.courseCode == courseCode });
  };

  public query ({ caller }) func listCAScoresByStudent(studentMatric : Text) : async [CAScore] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized");
    };
    caScores.values().toArray().filter(func(s) { s.studentMatric == studentMatric });
  };

  // ==================== EXAM RESULTS ====================

  public type ExamResult = {
    id : Text;
    courseCode : Text;
    courseTitle : Text;
    creditUnits : Nat;
    studentMatric : Text;
    examScore : Nat;
    caScore : Nat;
    totalScore : Nat;
    grade : Text;
    gradePoints : Nat;
    remark : Text;
    semester : Text;
    session : Text;
    status : Text;
    approvalLevel : Text;
    rejectionReason : Text;
    createdAt : Int;
    updatedAt : Int;
  };

  let examResults = Map.empty<Text, ExamResult>();

  public shared ({ caller }) func createExamResult(result : ExamResult) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized");
    };
    if (not (AccessControl.isAdmin(accessControlState, caller) or hasRole(caller, "lecturer"))) {
      Runtime.trap("Unauthorized: Only lecturers can create exam results");
    };
    let id = (examResults.size() + 1).toText();
    let r = { result with id = id; status = "draft"; approvalLevel = "lecturer" };
    examResults.add(id, r);
    id;
  };

  public shared ({ caller }) func updateExamResult(id : Text, result : ExamResult) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized");
    };
    if (not (AccessControl.isAdmin(accessControlState, caller) or hasRole(caller, "lecturer"))) {
      Runtime.trap("Unauthorized: Only lecturers can update exam results");
    };
    if (not examResults.containsKey(id)) {
      Runtime.trap("Exam result not found");
    };
    examResults.add(id, { result with id = id });
  };

  public shared ({ caller }) func submitResultForApproval(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized");
    };
    switch (examResults.get(id)) {
      case (?r) {
        examResults.add(id, { r with status = "submitted" });
      };
      case null { Runtime.trap("Result not found") };
    };
  };

  public shared ({ caller }) func approveResult(id : Text, approverName : Text, level : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized");
    };
    if (not (AccessControl.isAdmin(accessControlState, caller) or hasAnyRole(caller, ["hod", "lecturer"]))) {
      Runtime.trap("Unauthorized: Only authorized approvers can approve results");
    };
    switch (examResults.get(id)) {
      case (?r) {
        examResults.add(id, { r with status = "approved"; approvalLevel = level; rejectionReason = "" });
      };
      case null { Runtime.trap("Result not found") };
    };
  };

  public shared ({ caller }) func rejectResult(id : Text, reason : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized");
    };
    if (not (AccessControl.isAdmin(accessControlState, caller) or hasAnyRole(caller, ["hod", "lecturer"]))) {
      Runtime.trap("Unauthorized");
    };
    switch (examResults.get(id)) {
      case (?r) {
        examResults.add(id, { r with status = "rejected"; rejectionReason = reason });
      };
      case null { Runtime.trap("Result not found") };
    };
  };

  public shared ({ caller }) func publishResult(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can publish results");
    };
    switch (examResults.get(id)) {
      case (?r) {
        examResults.add(id, { r with status = "published" });
      };
      case null { Runtime.trap("Result not found") };
    };
  };

  public query ({ caller }) func getExamResult(id : Text) : async ?ExamResult {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized");
    };
    examResults.get(id);
  };

  public query ({ caller }) func listResultsByStudent(studentMatric : Text) : async [ExamResult] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized");
    };
    examResults.values().toArray().filter(func(r) { r.studentMatric == studentMatric });
  };

  public query ({ caller }) func listResultsByCourse(courseCode : Text) : async [ExamResult] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized");
    };
    examResults.values().toArray().filter(func(r) { r.courseCode == courseCode });
  };

  public query ({ caller }) func listResultsByStatus(status : Text) : async [ExamResult] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized");
    };
    if (not (AccessControl.isAdmin(accessControlState, caller) or hasAnyRole(caller, ["lecturer", "hod"]))) {
      Runtime.trap("Unauthorized");
    };
    examResults.values().toArray().filter(func(r) { r.status == status });
  };

  public query ({ caller }) func listResultsBySemester(semester : Text, session : Text) : async [ExamResult] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized");
    };
    examResults.values().toArray().filter(func(r) { r.semester == semester and r.session == session });
  };

  // ==================== COURSE REGISTRATIONS ====================

  public type CourseRegistration = {
    id : Text;
    studentMatric : Text;
    courseCode : Text;
    courseTitle : Text;
    creditUnits : Nat;
    semester : Text;
    session : Text;
    registeredAt : Int;
    status : Text;
  };

  let courseRegistrations = Map.empty<Text, CourseRegistration>();

  public shared ({ caller }) func registerCourse(reg : CourseRegistration) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized");
    };
    let id = (courseRegistrations.size() + 1).toText();
    let r = { reg with id = id; status = "registered" };
    courseRegistrations.add(id, r);
    id;
  };

  public shared ({ caller }) func dropCourse(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized");
    };
    switch (courseRegistrations.get(id)) {
      case (?r) {
        courseRegistrations.add(id, { r with status = "dropped" });
      };
      case null { Runtime.trap("Registration not found") };
    };
  };

  public shared ({ caller }) func approveRegistration(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can approve registrations");
    };
    switch (courseRegistrations.get(id)) {
      case (?r) {
        courseRegistrations.add(id, { r with status = "approved" });
      };
      case null { Runtime.trap("Registration not found") };
    };
  };

  public query ({ caller }) func listRegistrationsByStudent(studentMatric : Text) : async [CourseRegistration] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized");
    };
    courseRegistrations.values().toArray().filter(func(r) { r.studentMatric == studentMatric });
  };

  public query ({ caller }) func listRegistrationsByCourse(courseCode : Text) : async [CourseRegistration] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized");
    };
    courseRegistrations.values().toArray().filter(func(r) { r.courseCode == courseCode });
  };

  public query ({ caller }) func getAllRegistrations() : async [CourseRegistration] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can view all registrations");
    };
    courseRegistrations.values().toArray();
  };

  // ==================== ANNOUNCEMENTS ====================

  public type Announcement = {
    id : Text;
    title : Text;
    body : Text;
    targetRoles : [Text];
    priority : Text;
    createdBy : Text;
    createdAt : Int;
    expiresAt : Int;
    isActive : Bool;
  };

  let announcements = Map.empty<Text, Announcement>();

  public shared ({ caller }) func createAnnouncement(ann : Announcement) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can create announcements");
    };
    let id = (announcements.size() + 1).toText();
    let a = { ann with id = id };
    announcements.add(id, a);
    id;
  };

  public shared ({ caller }) func updateAnnouncement(id : Text, ann : Announcement) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can update announcements");
    };
    if (not announcements.containsKey(id)) {
      Runtime.trap("Announcement not found");
    };
    announcements.add(id, { ann with id = id });
  };

  public shared ({ caller }) func deleteAnnouncement(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can delete announcements");
    };
    switch (announcements.get(id)) {
      case (?a) {
        announcements.add(id, { a with isActive = false });
      };
      case null { Runtime.trap("Announcement not found") };
    };
  };

  public query ({ caller }) func getAnnouncement(id : Text) : async ?Announcement {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized");
    };
    announcements.get(id);
  };

  public query ({ caller }) func listActiveAnnouncements() : async [Announcement] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized");
    };
    announcements.values().toArray().filter(func(a) { a.isActive });
  };

  public query ({ caller }) func listAllAnnouncements() : async [Announcement] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can list all announcements");
    };
    announcements.values().toArray();
  };

  // ==================== HOSTEL APPLICATIONS ====================

  public type HostelApplication = {
    id : Text;
    studentMatric : Text;
    studentName : Text;
    department : Text;
    level : Text;
    roomType : Text;
    preferredBlock : Text;
    specialNeeds : Text;
    applicationDate : Int;
    status : Text;
    assignedRoom : Text;
    adminComment : Text;
    processedAt : Int;
  };

  let hostelApplications = Map.empty<Text, HostelApplication>();

  public shared ({ caller }) func applyForHostel(app : HostelApplication) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized");
    };
    let id = (hostelApplications.size() + 1).toText();
    let a = { app with id = id; status = "pending"; assignedRoom = ""; adminComment = ""; processedAt = 0 };
    hostelApplications.add(id, a);
    id;
  };

  public shared ({ caller }) func processHostelApplication(id : Text, status : Text, assignedRoom : Text, comment : Text, processedAt : Int) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can process hostel applications");
    };
    switch (hostelApplications.get(id)) {
      case (?app) {
        hostelApplications.add(id, { app with status = status; assignedRoom = assignedRoom; adminComment = comment; processedAt = processedAt });
      };
      case null { Runtime.trap("Hostel application not found") };
    };
  };

  public query ({ caller }) func getHostelApplication(id : Text) : async ?HostelApplication {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized");
    };
    hostelApplications.get(id);
  };

  public query ({ caller }) func listHostelApplicationsByStudent(studentMatric : Text) : async [HostelApplication] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized");
    };
    hostelApplications.values().toArray().filter(func(a) { a.studentMatric == studentMatric });
  };

  public query ({ caller }) func listAllHostelApplications() : async [HostelApplication] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can list all hostel applications");
    };
    hostelApplications.values().toArray();
  };

  public query ({ caller }) func listHostelApplicationsByStatus(status : Text) : async [HostelApplication] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can filter hostel applications");
    };
    hostelApplications.values().toArray().filter(func(a) { a.status == status });
  };

  // ==================== DOCUMENT RECORDS ====================

  public type DocumentRecord = {
    id : Text;
    title : Text;
    documentType : Text;
    blobId : Text;
    uploaderPrincipal : Text;
    uploaderName : Text;
    linkedRecordId : Text;
    linkedRecordType : Text;
    uploadedAt : Int;
    notes : Text;
  };

  let documentRecords = Map.empty<Text, DocumentRecord>();

  public shared ({ caller }) func createDocumentRecord(doc : DocumentRecord) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized");
    };
    let id = (documentRecords.size() + 1).toText();
    let d = { doc with id = id };
    documentRecords.add(id, d);
    id;
  };

  public query ({ caller }) func getDocumentRecord(id : Text) : async ?DocumentRecord {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized");
    };
    documentRecords.get(id);
  };

  public query ({ caller }) func listDocumentsByUploader(uploaderPrincipal : Text) : async [DocumentRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized");
    };
    documentRecords.values().toArray().filter(func(d) { d.uploaderPrincipal == uploaderPrincipal });
  };

  public query ({ caller }) func listDocumentsByLinkedRecord(linkedRecordId : Text) : async [DocumentRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized");
    };
    documentRecords.values().toArray().filter(func(d) { d.linkedRecordId == linkedRecordId });
  };

  public query ({ caller }) func listDocumentsByType(documentType : Text) : async [DocumentRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized");
    };
    documentRecords.values().toArray().filter(func(d) { d.documentType == documentType });
  };

  public query ({ caller }) func listAllDocuments() : async [DocumentRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can list all documents");
    };
    documentRecords.values().toArray();
  };
};
