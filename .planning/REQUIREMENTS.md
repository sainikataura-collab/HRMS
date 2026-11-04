# Requirements: HR Task Manager & Interactive Kanban Module

## Overview

The HR Task Manager allows any employee to create operational tasks, assign them to peers, set scheduled recurrences (Daily, Weekly, Monthly), and manage tasks on an interactive 3-column drag-and-drop Kanban board (`OPEN`, `CLOSED`, `ON HOLD`). Every status change requires a mandatory remarks log, and clicking any card displays a complete detail and audit timeline.

## Scoped Requirements

### 1. Database & Domain Models (DB)
- **DB-01**: Create table `HR_TaskManager`:
  - `TaskId` (INT IDENTITY Primary Key)
  - `TaskCode` (NVARCHAR(50), e.g., `TASK-2026-1001`)
  - `Title` (NVARCHAR(250) NOT NULL)
  - `Description` (NVARCHAR(MAX))
  - `EntityName` (NVARCHAR(150), Client/Company/Department)
  - `Priority` (NVARCHAR(20) NOT NULL, `HIGH`, `MEDIUM`, `LOW`)
  - `Status` (NVARCHAR(20) NOT NULL, `OPEN`, `CLOSED`, `ON_HOLD`, default `OPEN`)
  - `CreatedByEmpId` (INT NOT NULL, references `tbl_Employee_Mst.Emp_Id`)
  - `AssignedToEmpId` (INT NULL, references `tbl_Employee_Mst.Emp_Id`)
  - `DueDate` (DATETIME NOT NULL)
  - `IsRecurring` (BIT NOT NULL DEFAULT 0)
  - `RecurrencePattern` (NVARCHAR(20) NULL, `DAILY`, `WEEKLY`, `MONTHLY`)
  - `NextRecurrenceDate` (DATETIME NULL)
  - `ParentTaskId` (INT NULL, tracks originating template task)
  - `CreatedAt` (DATETIME DEFAULT GETDATE()), `UpdatedAt` (DATETIME DEFAULT GETDATE()), `IsActive` (BIT DEFAULT 1)
- **DB-02**: Create table `HR_TaskRemarks`:
  - `RemarkId` (INT IDENTITY Primary Key)
  - `TaskId` (INT NOT NULL, FK to `HR_TaskManager`)
  - `PreviousStatus` (NVARCHAR(20) NULL)
  - `NewStatus` (NVARCHAR(20) NOT NULL)
  - `Remarks` (NVARCHAR(MAX) NOT NULL)
  - `CreatedByEmpId` (INT NOT NULL)
  - `CreatedAt` (DATETIME DEFAULT GETDATE())
- **DB-03**: Create Stored Procedures / Dapper queries:
  - `HR_Task_GetBoardData` (fetches tasks partitioned by status, with overdue flags, employee names, and counts)
  - `HR_Task_CreateOrUpdate` (creates tasks, handles code generation, schedules recurrence)
  - `HR_Task_TransitionStatus` (atomic status transition + remark recording in single transaction)
  - `HR_Task_ProcessRecurring` (generates new instances for due recurring schedules)

### 2. Backend WebAPI (API)
- **API-01**: `TaskManagerController` at `/api/v1/TaskManager`:
  - `GET /board`: Returns Kanban board items grouped into `open`, `closed`, `onHold` with count summaries.
  - `GET /{id}`: Returns complete task details along with chronological remarks audit timeline.
  - `POST /create`: Validates and saves new task (with optional recurrence parameters).
  - `POST /transition`: Updates task status (`OPEN`, `CLOSED`, `ON_HOLD`) and records the mandatory remarks.
  - `GET /employees`: Returns employee dropdown list (`Emp_Id`, `Full_Name`, `Emp_Code`, `Department`) for assignment.
- **API-02**: Automated / Scheduled Recurrence Handler:
  - Background HostedService / endpoint to evaluate recurring schedules and create distinct task instances.

### 3. Frontend Interactive Kanban Board (UI-KANBAN)
- **KANBAN-01**: 3-column layout matching approved screenshot:
  - Column 1: `● OPEN` (Header with count badge, `#3080e8`)
  - Column 2: `● CLOSED` (Header with count badge, `#475569`)
  - Column 3: `● ON HOLD` (Header with count badge, `#f59e0b`)
- **KANBAN-02**: Ticket Card Component:
  - Ticket Code (e.g. `TASK-2026-1083`)
  - Overdue warning pill (`⚠️ Overdue by X h/d` in soft red badge when current date > `DueDate` and status != `CLOSED`)
  - Priority badge (`HIGH` red, `MEDIUM` yellow/orange, `LOW` gray)
  - Task title
  - Entity / Client Name with relative age (`2 day(s) ago`)
  - Footer badges: `● BY: <Creator>` (purple pill) and `● TO: <Assignee>` (blue pill or `Unassigned`)
- **KANBAN-03**: Angular CDK Drag and Drop (`cdkDropList`, `cdkDrag`):
  - Connected drop lists allowing cards to be dragged freely across the 3 columns.

### 4. Transition Remarks Modal (UI-MODAL)
- **MODAL-01**: Drop Interceptor:
  - When card is dropped into a new column, the card position freeze/awaits user confirmation.
  - A clean modal pops up showing:
    - Task title & code
    - Status change pill (e.g., `OPEN` ➔ `CLOSED` or `OPEN` ➔ `ON HOLD`)
    - Mandatory textarea for remarks / reasons
    - Confirm button (`.btn-primary-action`) & Cancel button
  - If user cancels or closes modal, card reverts to its origin column without server call.
  - If user confirms, remarks are sent with the transition request, status updates immediately with toast notification.

### 5. Task Detail Drawer & Universal Creator (UI-DETAILS)
- **DETAILS-01**: Card Click opens Detail Modal / Slide-out Drawer:
  - Shows complete task info, description, assigner, assignee, recurrence info, and creation dates.
  - Timeline component displaying all historical remarks with author name and timestamp.
  - Direct status update dropdown and quick add remark input.
- **DETAILS-02**: Create Task Modal:
  - Form matching `.custom-ng-select` and `.form-control-sm` design standards:
    - Title & Entity / Department
    - Assign To (Employee search dropdown)
    - Priority (`HIGH`, `MEDIUM`, `LOW`)
    - Due Date picker
    - Recurrence toggle: `None`, `Daily`, `Weekly`, `Monthly`
    - Initial Remarks / Description

## Non-Functional Requirements
- **Performance**: Kanban board loads in < 500ms; drag-and-drop operations feel instant with optimistic UI updates on confirmation.
- **Consistency**: Strictly conforms to `.planning/codebase/DESIGN.md` (Work Sans font, `#3080e8` corporate blue, 28px inputs/dropdowns, bento cards).
