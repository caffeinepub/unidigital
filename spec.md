# UniDigital v20

## Current State
v19 is live with 19 real students, institution-adaptive academic record formats (NCE/Undergraduate/ND-HND), full result chain, pass/fail lists, promotion results, settings, module gating, and all previous modules.

## Requested Changes (Diff)

### Add
1. **Graduation Clearance Workflow** -- multi-step clearance checklist (Library, Bursary, Hostel, Dean sign-off) per student; Admin/HOD track clearance status per student; student sees clearance progress and graduation approval status
2. **Result Entry by Lecturers** -- online CA/exam score entry form per course (CA max 40, Exam max 60, Total auto-calculated); validation; submit to HOD for review; HOD approves/rejects
3. **Student Portal Deepening** -- fee payment history tab, registered course history, result slip download per semester, graduation status tracker
4. **Timetable/Scheduling Automation** -- conflict detection when adding courses, room assignment, auto-generate timetable from available courses/rooms/staff data
5. **Alumni Portal** -- alumni registration form, searchable alumni directory, job board (post/browse jobs), donation/fund drive tracker
6. **Staff Appraisal/Performance Review** -- annual appraisal forms with self-assessment, HOD/HR scoring and review, summary report per staff
7. **Hostel Management Depth** -- room/bed allocation per student, occupancy report, hostel fee tracking, room transfer requests
8. **e-Learning/Course Materials** -- Lecturers upload notes/resources per course; students access materials per registered course
9. **Biometric Attendance** -- simulated check-in/check-out, attendance dashboard per course/staff, absentee alert notifications
10. **Dashboard Analytics Upgrade** -- institution-wide KPI dashboard (enrollment trends, pass rates, fee collection, staff ratios, charts)

### Modify
- Student sidebar: add Graduation Clearance, Course Materials, Result Slip, Graduation Status
- Lecturer sidebar: add Result Entry, Course Materials, Biometric Attendance
- Admin sidebar: add Graduation Clearance, Alumni Portal, Staff Appraisal, Dashboard Analytics
- HOD sidebar: add Result Entry Review, Staff Appraisal
- HR sidebar: add Staff Appraisal
- Hostel module: deepen with room/bed allocation and occupancy

### Remove
Nothing removed; all previous components preserved.

## Implementation Plan
1. Add GraduationClearance component (student view + admin/HOD management view)
2. Add ResultEntry component for Lecturers with CA/Exam form and HOD approval view
3. Deepen StudentPortal with payment history, course history, result slip, graduation tracker
4. Add TimetableAutomation component with conflict detection and auto-generate
5. Add AlumniPortal component (registration, directory, job board, fund drive)
6. Add StaffAppraisal component (self-assessment form, HOD/HR review)
7. Deepen HostelManagement with room allocation, occupancy report, fee tracking
8. Add eLearning component (Lecturer upload, student access per course)
9. Add BiometricAttendance component (simulated check-in, dashboard, alerts)
10. Upgrade Dashboard with KPI analytics charts (enrollment, pass rates, fee collection, staff ratios)
11. Wire all new sidebar entries per role
