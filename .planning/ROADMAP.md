# Roadmap: HR Task Manager & Interactive Kanban Module

## Overview

This roadmap delivers the complete HR Task Manager & Interactive Kanban Module inside HRBook across 3 focused phases: Backend & SQL Engine (Phase 5), Interactive Kanban Board + Multi-Filter + Drag-and-Drop Remarks UI (Phase 6), and Task Creation + Attachment + Full History Detail Drawer + Dual Portal Navigation (Phase 7).

---

## Phases

- [ ] **Phase 5: Task Manager Backend Architecture & Database Engine** - SQL Server tables (`HR_TaskMaster`, `HR_TaskHistory`), stored procedures (`usp_HR_Task_...`), role/HOD visibility engine, attachment upload support, recurring task generator (`DAILY`, `WEEKLY`, `MONTHLY`, `YEARLY`), and WebAPI controller.
- [ ] **Phase 6: Interactive Drag-and-Drop Kanban Board, KPI Filter Cards & Remarks Workflow** - Top clickable KPI summary cards (`Open`, `Closed`, `On Hold`, `Unassigned`, `Overdue`), multi-filter bar, 3-column CDK drag-and-drop Kanban board matching reference screenshot, and mandatory transition remarks popup modal.
- [ ] **Phase 7: Task Creation Modal, Attachment & Full History Drawer & Dual Portal Routing** - Create Task modal with recurrence & file attachment, slide-out/modal Task Detail & Full History timeline view, and navigation integration in both HR Module and Employee Task-Box.

---

## Phase Details

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
- [ ] 05-01-PLAN.md — SQL schema (`HR_TaskMaster`, `HR_TaskHistory`), stored procedures (`usp_HR_Task_*`), and C# DTO/domain models.

**Wave 2** *(blocked on Wave 1 completion)*
- [ ] 05-02-PLAN.md — Dapper repository, attachment upload handling, recurring task hosted service, and `TaskManagerController` endpoints.

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
- 06-01: Task Manager board layout, KPI filter cards, multi-filter bar, 3-column CDK drag-and-drop board, and drop remarks modal.

---

### Phase 7: Task Creation Modal, Attachment & Full History Drawer & Dual Portal Routing

**Goal**: Deliver the Create Task modal (with recurrence, department/employee selection, self-task toggle, and attachment upload), the full Task Detail & Chronological History modal/drawer, and dual navigation in HR Module and Employee Task-Box.
**Depends on**: Phase 6
**Requirements**: DETAILS-01, DETAILS-02, DETAILS-03
**Success Criteria**:
  1. Create Task modal supports Subject, Description, Attachment upload, Deadline, Priority, Department, Assignee (or Unassigned / Assign to Self), and Recurrence (`None`, `Daily`, `Weekly`, `Monthly`, `Yearly`).
  2. Clicking any card opens the Full Detail & History view showing task metadata, attachment download/preview, status/assignee update controls with remarks, and the chronological `HR_TaskHistory` audit log.
  3. Task Manager is accessible from both `/dash/hr/hrdashboard/task-manager` (HR Sidebar) and `/dash/taskbox/taskboxdashboard` (Employee Task-Box).

**Plans**: 1 plan
- 07-01: Create Task modal, Task Detail & History drawer, attachment preview/download, and HR + Employee Task-Box routing.

---
*Roadmap updated: 2026-11-04*
