# Roadmap: HR Task Manager & Interactive Kanban Module

## Overview

This roadmap delivers the HR Task Manager module within HRBook. The system features universal peer task assignment, scheduled recurrence, an interactive 3-column drag-and-drop Kanban board (`OPEN`, `CLOSED`, `ON HOLD`), mandatory transition remarks, and a full detail and audit drawer.

---

## Phases

- [ ] **Phase 5: Task Manager Backend Architecture & Database Engine** - SQL Server schema, Dapper repository, REST API endpoints for board data, task creation, status transition with remarks, and scheduled recurring task generator.
- [ ] **Phase 6: Interactive Drag-and-Drop Kanban Board UI & Remarks Workflow** - Angular CDK drag-and-drop 3-column Kanban board matching screenshot design, overdue calculation, card layout, and transition remarks interceptor modal.
- [ ] **Phase 7: Task Creation Wizard, Detail Drawer & Recurrence Automation** - Form modal with recurrence controls, full slide-out task detail & audit remarks timeline, and HR module navigation integration.

---

## Phase Details

### Phase 5: Task Manager Backend Architecture & Database Engine
**Goal**: Build a robust, scalable backend for task lifecycle management, multi-status partitioning, transition audit trails, and recurrence scheduling.
**Depends on**: Existing WebAPI foundation
**Requirements**: DB-01, DB-02, DB-03, API-01, API-02
**Success Criteria**:
  1. `HR_TaskManager` and `HR_TaskRemarks` tables created with appropriate indexes and foreign keys.
  2. `TaskManagerController` provides `/board`, `/create`, `/transition`, `/{id}`, and `/employees`.
  3. Status transitions are executed transactionally with mandatory non-empty remarks.
  4. Scheduled recurrence routine evaluates active recurring tasks and generates new instances on schedule.
**Plans**: 2 plans
- 05-01: Database schema, stored procedures, and DTO models.
- 05-02: Dapper repository, service layer, controller endpoints, and recurring task generation engine.

---

### Phase 6: Interactive Drag-and-Drop Kanban Board UI & Remarks Workflow
**Goal**: Build the responsive 3-column Kanban board adhering strictly to the user's reference screenshot and `.planning/codebase/DESIGN.md`, with drag-and-drop transition interceptor.
**Depends on**: Phase 5
**Requirements**: KANBAN-01, KANBAN-02, KANBAN-03, MODAL-01
**Success Criteria**:
  1. Kanban columns `● OPEN` (blue), `● CLOSED` (slate), `● ON HOLD` (orange) display correct header badges and ticket counts.
  2. Ticket cards display Ticket Code, Overdue Pill (`⚠️ Overdue by X`), Priority Pill, Title, Entity with relative age, Creator (`● BY:`) and Assignee (`● TO:`) chips.
  3. Dragging a card between columns prompts the Remarks Modal before applying the change.
  4. Canceling reverts the card cleanly; confirming executes the transition API and updates the board with toast feedback.
**Plans**: 1 plan
- 06-01: Kanban Board component, CDK drag-drop setup, card styling, and status transition remarks modal.

---

### Phase 7: Task Creation Wizard, Detail Drawer & Recurrence Automation
**Goal**: Deliver the task creation modal with recurrence options, full task detail drawer with historical remarks timeline, and register the route under HR.
**Depends on**: Phase 6
**Requirements**: DETAILS-01, DETAILS-02
**Success Criteria**:
  1. "Create Task" modal supports title, entity, employee search dropdown (`.custom-ng-select`), priority, due date, and recurrence pattern (Daily, Weekly, Monthly).
  2. Clicking any card opens the Detail Drawer with full metadata, editable status, and chronological audit remarks list.
  3. Route `/dash/hr/task-manager` is registered and accessible in the HR navigation sidebar.
**Plans**: 1 plan
- 07-01: Create Task modal, Task Detail Drawer with remarks timeline, and HR navigation routing.

---
*Roadmap generated: 2026-11-04*
