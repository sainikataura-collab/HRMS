# Roadmap: HR Task Manager & Interactive Kanban Module

## Overview

This roadmap delivers the complete HR Task Manager & Interactive Kanban Module inside HRBook across 3 focused phases: Backend & SQL Engine (Phase 5), Interactive Kanban Board + Multi-Filter + Drag-and-Drop Remarks UI (Phase 6), and Task Creation + Attachment + Full History Detail Drawer + Dual Portal Navigation (Phase 7).

---

## Phases

- [x] **Phase 5: Task Manager Backend Architecture & Database Engine** - SQL Server tables (`HR_TaskMaster`, `HR_TaskHistory`), stored procedures (`usp_HR_Task_...`), role/HOD visibility engine, attachment upload support, recurring task generator (`DAILY`, `WEEKLY`, `MONTHLY`, `YEARLY`), and WebAPI controller.
- [x] **Phase 6: Interactive Drag-and-Drop Kanban Board, KPI Filter Cards & Remarks Workflow** - Top clickable KPI summary cards (`Open`, `Closed`, `On Hold`, `Unassigned`, `Overdue`), multi-filter bar, 3-column CDK drag-and-drop Kanban board matching reference screenshot, and mandatory transition remarks popup modal.
- [x] **Phase 7: Task Creation Modal, Attachment & Full History Drawer & Dual Portal Routing** - Create Task modal with recurrence & file attachment, slide-out/modal Task Detail & Full History timeline view, and navigation integration in both HR Module and Employee Task-Box.
- [x] **Phase 8: Task Visibility & Role Scoping** - Shared visibility function, JWT-only identity, task-level 403 guards, creator persistence fix.
- [x] **Phase 9: Board Pagination, Column Scrolling & Midnight Recurrence Worker** - Independent column scrolling (no full-page scroll), column-level lazy pagination (10 per batch), and 12:00 AM daily recurrence worker.
- [x] **Phase 10: Task Event Stakeholder Notifications & Animated Bottom Toast** - In-app database notifications for Creator, Assignee, Target Dept HOD, and Reporting Manager on Task Creation, Status Transition, and Reassignment, plus a sleek bottom animated floating toast popup with chime and 'View Ticket' action.

---

## Phase Details

### Phase 10: Task Event Stakeholder Notifications & Animated Bottom Toast

**Goal**: Deliver in-app database notifications to Creator, Assignee, Target Department HOD, and Reporting Manager on task creation, transition, and reassignment, paired with a custom bottom animated floating toast with audio feedback and direct navigation/drawer access.
**Depends on**: Phase 9
**Requirements**: NOTIF-01, NOTIF-02, TOAST-01, TOAST-02
**Success Criteria**:
  1. Creating a task dispatches notification records to Assignee, Target Dept HOD, Assignee's Reporting Manager, and Creator (deduplicated).
  2. Transitioning task status or reassigning a task dispatches update notifications to all involved stakeholders.
  3. Animated floating toast slides up from bottom with glowing accent border, auto-fades after 5 seconds, and plays a subtle chime sound.
  4. Clicking 'View Ticket' on the toast navigates/focuses the task and slides open the Task Detail & History drawer.

**Plans**: 2 plans
- [x] 10-01-PLAN.md — Backend notification dispatch logic in stored procedure & repository (`LMS_Notification_Mst` / mapping) on task create, transition, and reassignment.
- [x] 10-02-PLAN.md — Frontend bottom animated toast component, Web Audio chime synthesis, and 'View Ticket' drawer focus integration.

---

## Phase Details

### Phase 9: Board Pagination, Column Scrolling & Midnight Recurrence Worker

**Goal**: Implement independent column scrolling in Kanban view, column-level pagination (10 per batch with infinite scroll on track), 12:00 AM daily recurrence background worker, and decoupling premature instance generation on creation.
**Depends on**: Phase 8
**Requirements**: KANBAN-SCROLL-01, KANBAN-PAGINATION-01, RECURRING-WORKER-01, RECURRING-LIFECYCLE-01
**Success Criteria**:
  1. Scrolling inside Open, Closed, or On Hold scrolls only that column; the page header, toolbar, and other columns stay locked in place.
  2. Initial board load returns 10 tasks per column; scrolling near the bottom of a column loads the next 10 tasks seamlessly.
  3. Recurring background worker runs at 12:00 AM Midnight daily (with startup catch-up check).
  4. Creating a recurring task does not prematurely dump an instance at current date/time; it awaits its scheduled date.

**Plans**: 2 plans
- [x] 09-01-PLAN.md — Independent column scrolling CSS, column-level pagination in `usp_HR_Task_GetBoard`, and frontend scroll listeners.
- [x] 09-02-PLAN.md — 12:00 AM midnight background worker in `RecurringTaskHostedService.cs` and decoupling immediate creation in `usp_HR_Task_Create`.

---

## Phase Details

### Phase 8: Task Visibility & Role Scoping

**Goal**: Role-correct task visibility (Admin / HOD / Reporting Manager / Employee) via one shared visibility function, JWT-only identity, task-level access checks, and guaranteed creator persistence.
**Depends on**: Phase 7
**Requirements**: VIS-01, VIS-02, VIS-03, VIS-04, SEC-01, SEC-02, DATA-01
**Success Criteria**:
  1. Admin (role 1/2, incl. employee-linked admins) sees all company tasks.
  2. HOD sees own + dept-targeted + dept-created + dept-assigned + direct reports' tasks; Manager sees own + direct reports'; Employee sees only created/assigned.
  3. Unknown viewer sees nothing; client-sent viewer IDs are ignored.
  4. `GET /{taskId}` and update endpoints return 403 outside visibility.
  5. No active task has a NULL creator.
  6. Every field entered in the Create Task modal (incl. self-assign, task type, SLA unit, weekly days, attachment) is saved 1:1, with the correct creator for both User and Employee logins.

**Plans**: 2 plans
**Wave 1**
- [ ] 08-01-PLAN.md — JWT login-type claim, `fn_HR_Task_VisibleTasks` + SP rewiring, controller JWT hardening, DEPT chip gating, role matrix verification.

**Wave 2** *(blocked on Wave 1)*
- [ ] 08-02-PLAN.md — Create-ticket data integrity: correct creator, all modal fields saved, recurring inheritance, atomic insert + unique TaskCode, historical data repair.

---

### Phase 5: Task Manager Backend Architecture & Database Engine

**Goal**: Build the SQL Server tables, stored procedures (`usp_HR_Task_...`), Dapper repository, attachment handler, role/HOD/department visibility engine, and recurring task background processor.
**Depends on**: Existing WebAPI & SQL Server (`HRBook`) foundation
**Requirements**: DB-01, DB-02, DB-03, API-01, API-02
**Success Criteria**:
  1. `HR_TaskMaster` and `HR_TaskHistory` tables and `usp_HR_Task_*` stored procedures are created and executed on the live `HRBook` database.
  2. Role/HOD visibility logic accurately scopes tasks for Admin, Task Creator, Creator's Dept HOD, Target Dept HOD, Reporting Manager, and Assigned Employee.
  3. `TaskManagerController` serves `/lookups`, `/board`, `/{id}`, `/create` (with file attachment), `/transition`, `/comment`, and `/process-recurring`.
  4. Recurring task engine supports `DAILY`, `WEEKLY`, `MONTHLY`, and `YEARLY` schedules and logs `RECURRENCE_GENERATED` history entries.

**Plans**: 2 plans
Plans:
**Wave 1**
- [x] 05-01-PLAN.md — SQL schema (`HR_TaskMaster`, `HR_TaskHistory`), stored procedures (`usp_HR_Task_*`), and C# DTO/domain models.

**Wave 2** *(blocked on Wave 1 completion)*
- [x] 05-02-PLAN.md — Dapper repository, attachment upload handling, recurring task hosted service, and `TaskManagerController` endpoints.

---

### Phase 6: Interactive Drag-and-Drop Kanban Board, KPI Filter Cards & Remarks Workflow

**Goal**: Build the top clickable KPI filter cards, multi-filter bar, 3-column CDK drag-and-drop Kanban board matching the user's screenshot and `.planning/codebase/DESIGN.md`, and the mandatory transition remarks modal.
**Depends on**: Phase 5
**Requirements**: KANBAN-01, KANBAN-02, KANBAN-03, MODAL-01
**Success Criteria**:
  1. Top clickable KPI cards (`All`, `Open`, `Closed`, `On Hold`, `Unassigned`, `Overdue`) display live counts and filter the board on click.
  2. Multi-filter bar supports filtering by Scope (My Tasks / Department Tasks / Created by Me), Department, Assignee, Creator, Priority, Recurrence, and Search text using `.custom-ng-select` (`28px` height).
  3. 3-column Kanban board (`● OPEN`, `● CLOSED`, `● ON HOLD`) renders cards matching the screenshot (`TaskCode`, `⚠️ Overdue by Xh`, `Priority`, `Subject`, `Department` + relative age, `● BY:` purple chip, `● TO:` blue/Unassigned chip).
  4. Dragging a card between columns opens the mandatory Remarks popup modal; confirming updates the status and logs history, while canceling reverts the card position.

**Plans**: 1 plan
- [x] 06-01: Task Manager board layout, KPI filter cards, multi-filter bar, 3-column CDK drag-and-drop board, and drop remarks modal.

---

### Phase 7: Task Creation Modal, Attachment & Full History Drawer & Dual Portal Routing

**Goal**: Deliver the Create Task modal (with recurrence, department/employee selection, self-task toggle, and attachment upload), the full Task Detail & Chronological History modal/drawer, and dual navigation in HR Module and Employee Task-Box.
**Depends on**: Phase 6
**Requirements**: DETAILS-01, DETAILS-02, DETAILS-03
**Plans**: 1 plan
- [x] 07-01: Create Task modal, attachment upload, full history drawer, and dual portal navigation.
**Success Criteria**:
  1. Create Task modal supports Subject, Description, Attachment upload, Deadline, Priority, Department, Assignee (or Unassigned / Assign to Self), and Recurrence (`None`, `Daily`, `Weekly`, `Monthly`, `Yearly`).
  2. Clicking any card opens the Full Detail & History view showing task metadata, attachment download/preview, status/assignee update controls with remarks, and the chronological `HR_TaskHistory` audit log.
  3. Task Manager is accessible from both `/dash/hr/hrdashboard/task-manager` (HR Sidebar) and `/dash/taskbox/taskboxdashboard` (Employee Task-Box).

**Plans**: 1 plan
- 07-01: Create Task modal, Task Detail & History drawer, attachment preview/download, and HR + Employee Task-Box routing.

---
*Roadmap updated: 2026-11-04*
