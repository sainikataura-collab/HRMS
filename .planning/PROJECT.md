# HRBook - HR Task Manager & Interactive Kanban Module

## What This Is

An enterprise Task Management & Interactive Kanban system built inside HRBook and accessible from both the HR Module (`/dash/hr/hrdashboard/task-manager`) and the Employee Portal Task-Box (`/dash/taskbox/taskboxdashboard`). It supports role-aware task visibility (Admin, HOD, Reporting Manager, and Employee), department & employee assignment, file attachments, scheduled recurring task generation (`DAILY`, `WEEKLY`, `MONTHLY`, `YEARLY`), top clickable KPI filter cards (`Open`, `Closed`, `On Hold`, `Unassigned`, `Overdue`), a multi-filter bar, a 3-column drag-and-drop Kanban board (`OPEN`, `CLOSED`, `ON HOLD`) with mandatory status-transition remarks, and a complete chronological task history & audit drawer.

## Core Value

Admins, HODs, Managers, and Employees can create, assign, track, filter, and transition operational or personal tasks on an interactive visual Kanban board with full lifecycle history, attachment support, department-level oversight, overdue tracking, and automated recurring task generation.

## Visual Design Reference

The Kanban board and surrounding controls follow the user's reference screenshot and `.planning/codebase/DESIGN.md`:
- **Top Clickable KPI Filter Cards**: Interactive summary cards showing counts for `All Tasks`, `Open`, `Closed`, `On Hold`, `Unassigned`, and `Overdue` — clicking any card filters the board immediately.
- **Multi-Filter Bar**: Compact `28px` `.custom-ng-select` dropdowns and search inputs for Scope (`All Accessible`, `My Assigned Tasks`, `Created By Me`, `My Department / Team`), Target Department, Assigned Employee, Created By, Priority (`HIGH`, `MEDIUM`, `LOW`), Recurrence, and Overdue toggle.
- **3 Dynamic Kanban Columns**:
  - `● OPEN` (Corporate Blue `#3080e8` dot + count pill)
  - `● CLOSED` (Slate `#475569` dot + count pill)
  - `● ON HOLD` (Warning Orange `#d97706` / `#f59e0b` dot + count pill)
- **Card Hierarchy**:
  - Top Row: Ticket Code (e.g., `HR_TSK-2026-1001`), Overdue Warning Badge (`⚠️ Overdue by 15.3h` in soft red pill `#fee2e2` / `#dc2626`), Priority Pill (`HIGH`, `MEDIUM`, `LOW`), and recurring/attachment indicators.
  - Middle Row: Task Subject/Title (`Work Sans` 600 weight) + Department/Entity icon & name with relative age (`2 day(s) ago`).
  - Footer Row: `● BY: <Creator>` (purple pill `#7c3aed`) and `● TO: <Assignee>` (blue pill `#3b6998`, or `● TO: Unassigned` when unassigned).
- **Drag-and-Drop Remarks Popup**: Dragging a card from one status column to another opens a mandatory Remarks popup modal before committing the status transition.
- **Full Detail & History Drawer/Modal**: Clicking any card opens the full task details view with description, attachment download/preview, status/assignee update controls, and the complete chronological `HR_TaskHistory` log.

## Role & Visibility Hierarchy

1. **Admin / HR Admin (`fk_roleId IN (1, 2, 7)` or Admin User)**:
   - Sees all tasks across the entire organization; can create, assign to any department/employee, reassign, or transition any task.
2. **Task Creator (`CreatedByEmpId = @EmpId` or `CreatedByUserId = @UserId`)**:
   - Always sees every task they created, regardless of which department or employee it is assigned to.
3. **Head of Department (HOD)**:
   - Auto-detected via `Department_Mst.fk_depHodid = @EmpId` OR `SAL_Employee_Mst.fk_FunctionalHODempid = @EmpId` OR `SAL_Employee_Mst.fk_AdministrativeHODempid = @EmpId` OR `SAL_Employee_Mst.isHod = '1'`.
   - Sees their own tasks, all tasks targeted to their department(s) (`TargetDeptId`), AND all tasks created by or assigned to employees belonging to their department(s).
4. **Reporting Manager (`fk_rmanagerid = @EmpId` or `fk_imanagerid = @EmpId` or `fk_FunctionalRepempid = @EmpId` or `fk_AdministrativeRepempid = @EmpId`)**:
   - Sees their own tasks plus all tasks assigned to or created by their direct reports.
5. **Employee (`SAL_Employee_Mst.pk_empid`)**:
   - Sees all tasks assigned to them (`AssignedToEmpId = @EmpId`) and tasks they created (`CreatedByEmpId = @EmpId`), including personal self-reminder tasks (`CreatedByEmpId = AssignedToEmpId`).

## Requirements

### Validated (System Foundation)
- ✓ [Enterprise ASP.NET Core 8.0 Web API with Dapper (`DataBaseFactory.ConnString()`) and SQL Server (`HRBook`)]
- ✓ [Live Employee & Department schema: `SAL_Employee_Mst` (`pk_empid` VARCHAR, `fk_deptid` VARCHAR) & `Department_Mst` (`pk_deptid` VARCHAR, `fk_depHodid` VARCHAR)]
- ✓ [Angular 18 Frontend with `@angular/cdk/drag-drop`, `@ng-select/ng-select`, and Bootstrap 5.3.6]
- ✓ [Corporate UI Theme documented in `.planning/codebase/DESIGN.md` (`Work Sans`, `#3080e8`, `28px` controls)]

### Active (Task Manager Milestone)
- [ ] **TASK-01 (Database Schema & Full History Engine)**: Tables `HR_TaskMaster` and `HR_TaskHistory` using `VARCHAR(50)` employee/department keys compatible with `SAL_Employee_Mst` and `Department_Mst`, plus stored procedures (`usp_HR_Task_...`).
- [ ] **TASK-02 (Backend API, Attachment Upload & Recurrence Engine)**: ASP.NET Core controller, Dapper repository, file attachment upload handler, role/HOD visibility scoping, and background recurring task generator (`DAILY`, `WEEKLY`, `MONTHLY`, `YEARLY`).
- [ ] **TASK-03 (KPI Summary Cards, Multi-Filter Bar & 3-Column Kanban Board)**: Clickable status/unassigned counter cards, multi-filter bar, and responsive 3-column CDK drag-and-drop board matching the reference screenshot.
- [ ] **TASK-04 (Drag-and-Drop Transition Remarks Modal)**: Intercepts column drops, prompts for mandatory remarks, logs to `HR_TaskHistory`, or reverts card on cancel.
- [ ] **TASK-05 (Task Detail Drawer & Full Lifecycle History Timeline)**: Full detail view on card click with attachment preview/download, inline status/assignee update with remarks, and complete chronological audit trail.
- [ ] **TASK-06 (Task Creation Modal & Dual Portal Navigation)**: Creation form with Subject, Description, Attachment, Deadline, Priority, Department, Assignee (or Unassigned), and Recurrence (`None`, `Daily`, `Weekly`, `Monthly`, `Yearly`), wired into both HR and Employee Task-Box navigation.

## Key Decisions

| Decision | Rationale | Outcome |
|---|---|---|
| Shared Component across HR & Employee Task-Box | Both Admin/HR (`User` mode) and HODs/Employees (`Employee` mode) need seamless access without switching login modes | Approved |
| Unassigned Tasks as Filterable State on 3-Column Board | Preserves the clean 3-column status board (`OPEN`, `CLOSED`, `ON HOLD`) with `● TO: Unassigned` badge while top `Unassigned` KPI card filters them with one click | Approved |
| Multi-Source HOD & Manager Resolution | `HRBook` stores hierarchy across `Department_Mst.fk_depHodid` and `SAL_Employee_Mst` (`fk_FunctionalHODempid`, `fk_AdministrativeHODempid`, `fk_rmanagerid`, `isHod`); checking all guarantees zero missed permissions | Approved |
| Full Event Audit Table (`HR_TaskHistory`) | Tracks not just status transitions, but creation, assignment/reassignment, priority/deadline edits, attachments, and remarks | Approved |

---
*Last updated: 2026-11-04 after Phase 5 discussion*
