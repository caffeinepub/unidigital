# UniDigital v21

## Current State
UniDigital v20 is deployed with the following key modules live across all roles:
- Role-based dashboards (Admin, Lecturer, Student, Bursary, HR, HOD, Alumni)
- Full result chain (Lecturer entry → HOD review → Faculty/Exam Officer → Senate Presentation)
- Student Academic Records (adaptive: NCE/Undergraduate/ND-HND), Department Results, Faculty Results, Promotion Results, Pass/Fail Lists
- CBT exams with question bank, timer, auto-submit, analytics
- Payroll (CONTISS), Bursary (bulk invoicing, debt tracking), Notifications, Module Gating
- Settings module (institution profile, confirmation, system toggles)
- Graduation Clearance workflow, Course History, Course Materials, Biometric Attendance simulation
- Appraisal (self-assessment + HOD review), Analytics Dashboard (KPI charts)
- Alumni Portal (directory, jobs, events), Admission Application Portal
- Research & Publications, Conference Room Booking, Staff Leave Balance Dashboard
- Accreditation/Audit Report Generator, Student Records (all roles), Hostel Admin (application management)
- Timetable Admin (manual CRUD), Result Slip (student), Graduation Status (student)
- 19 real seeded students with institution-adaptive academic records

## Requested Changes (Diff)

### Add
- **Hostel Room Inventory** (Admin): Room/bed management page with block/room/bed-count, bed allocation per student, occupancy heatmap, hostel fee ledger per room, and room transfer request approval
- **Timetable Conflict Detection** (Admin): On slot save, detect conflicts (same room+time, same lecturer+time, same course+time), show conflict warnings inline; "Auto-Fix" button suggests non-overlapping time slots
- **Student Fee Payment History** (Student): Dedicated payment history page showing all invoices, amounts paid, balance, receipt number, and print receipt per payment
- **Alumni Donation/Fund Drive Tracker** (Alumni + Admin): Alumni can pledge/donate to fund drives; Admin can create fund drives, view pledges/amounts, track targets
- **Staff Training & Development Module** (HR + Staff/Lecturer): HR creates training programs; Staff/Lecturers register for workshops; HR tracks attendance and issues completion certificates
- **Score Sheet Bulk Upload** (Lecturer/Admin): Downloadable CSV template per course; bulk upload scores from CSV with validation (CA max 40, Exam max 60); error rows flagged inline
- **Student Complaints & Feedback Module** (Student + Admin/HOD): Students submit complaints or feedback with category (academic, facility, staff, other), urgency, and description; Admin/HOD views all complaints, updates status (open/in-review/resolved), responds
- **Clearance Letter Generation** (Admin + Student): For students who pass all clearance checks, generate a printable institution-branded clearance letter with student details, MIS footer, authorized signature block
- **Staff Directory** (All roles): Searchable staff profiles with name, department, designation, qualifications, contact (email), date joined; Admin can add/edit staff profiles

### Modify
- **Hostel Admin**: Extend existing HostelAdmin page to include Room Inventory tab alongside Applications tab
- **TimetableAdmin**: Add conflict detection logic on slot create/edit
- **AlumniDashboard**: Add "Donations" page to existing alumni pages
- **AppLayout sidebar**: Add new pages to relevant role sidebars
- **App.tsx**: Register new page keys for all roles

### Remove
- Nothing removed; all previous components preserved

## Implementation Plan
1. Add `HostelRoomInventory.tsx` - room/bed management, occupancy table, transfer requests, hostel fees per room
2. Add conflict detection to `TimetableAdmin.tsx` - detect on save, show inline warnings
3. Add `PaymentHistory.tsx` (student page) - invoice list, paid amounts, receipt print
4. Add `AlumniDonations.tsx` - fund drives, pledge/donate flow, progress bars
5. Add admin-side `DonationsAdmin.tsx` or extend AlumniAdmin
6. Add `StaffTraining.tsx` (HR page) and `TrainingRegistration.tsx` (Lecturer/Staff)
7. Add `ScoreBulkUpload.tsx` (Lecturer) - CSV template download, upload, validation
8. Add `StudentComplaints.tsx` (Student) and `ComplaintsAdmin.tsx` (Admin/HOD)
9. Add `ClearanceLetter.tsx` - institution-branded printable letter for cleared students
10. Add `StaffDirectory.tsx` (shared, all roles) - searchable, Admin editable
11. Wire new pages into App.tsx page key types and role dashboards
12. Add sidebar entries in AppLayout for all new pages per role
