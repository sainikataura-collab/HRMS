# HRBook - HR Task Manager & Interactive Kanban Module

## What This Is

An enterprise Task Management system built directly inside HRBook's HR module (`/dash/hr/task-manager`). It enables universal task creation and assignment across employees, supports scheduled recurring task generation (Daily, Weekly, Monthly), and provides a 3-column drag-and-drop Kanban board (`OPEN`, `CLOSED`, `ON HOLD`) with mandatory status-transition remarks and detailed activity audits.

## Core Value

Employees and HR operations teams can create, track, reassign, and transition operational tasks on an interactive visual Kanban board with full accountability, overdue tracking, and automated recurring generation.

## Visual Design Reference

The Kanban board follows the exact layout from the approved UI reference:
- **3 Dynamic Columns**: `● OPEN` (Corporate Blue `#3080e8`), `● CLOSED` (Slate `#475569`), `● ON HOLD` (Warning Orange `#f59e0b`) with live ticket counts.
- **Card Hierarchy**:
  - Top Bar: Ticket Code (e.g., `TASK-2026-1083`), Overdue Indicator (`⚠️ Overdue by Xh/d`), Priority Pill (`HIGH`, `MEDIUM`, `LOW`).
  - Middle: Task Title and Entity / Department / Client with relative time ago (`2 day(s) ago`).
  - Footer Badges: `● BY: <Creator>` (purple chip) and `● TO: <Assignee>` (blue chip).
- **Drag-and-Drop Interaction**: Dragging a card between columns prompts a remarks modal before saving the transition.
- **Detail View**: Clicking a card opens full task details with status update controls and an audit timeline.

## Requirements

### Validated (System Foundation)
- ✓ [Enterprise ASP.NET Core 8.0 Web API with Dapper and SQL Server]
- ✓ [Angular 18 Frontend with @angular/cdk and Bootstrap 5.3.6]
- ✓ [Work Sans typography, 28px custom-ng-select dropdowns, and .btn-primary-action buttons]

### Active (Task Manager Milestone)
- [ ] **TASK-01 (Database Schema & Audit Trail)**: Tables `HR_TaskManager` and `HR_TaskRemarks` tracking ticket code, title, description, entity, priority, status (`OPEN`, `CLOSED`, `ON_HOLD`), recurrence rules, assigner, assignee, due date, and timestamped remarks.
- [ ] **TASK-02 (Backend API & Recurrence Engine)**: ASP.NET Core controller and Dapper repository for CRUD operations, status transition with remarks, and scheduled generation of recurring task instances.
- [ ] **TASK-03 (CDK Drag-and-Drop Kanban Board)**: Responsive 3-column board matching screenshot layout with card dragging, counter chips, and overdue calculations.
- [ ] **TASK-04 (Drop Transition Remarks Modal)**: Intercepts drop events, prompts for transition remarks, persists to backend audit log, or reverts card position if canceled.
- [ ] **TASK-05 (Task Detail Drawer & Editor)**: Side drawer or modal with comprehensive metadata, timeline of remarks, and status edit controls.
- [ ] **TASK-06 (Universal Task Creation Wizard)**: Form modal using `.custom-ng-select` for employee selection, recurrence pattern configuration (Daily, Weekly, Monthly), priority, and entity mapping.

## Key Decisions

| Decision | Rationale | Outcome |
|---|---|---|
| Angular CDK Drag & Drop (`@angular/cdk/drag-drop`) | Native Angular 18 solution with zero external heavy dependencies, smooth animations, and touch support | Approved |
| Transition Interceptor with Remarks Modal | Ensures strict compliance and audit trail whenever a ticket moves between statuses | Approved |
| Scheduled Task Recurrence Generator | Automatically generates new distinct task instances when recurrence triggers rather than mutating previous history | Approved |
| Universal Peer Assignment | Any employee can assign tasks to peers, fostering operational transparency | Approved |
| Dedicated HR Route (`/dash/hr/task-manager`) | Integrates seamlessly into the HR module while adhering to the global application theme | Approved |

---
*Last updated: 2026-11-04 after milestone initialization*
