# Requirements: HR Task Manager & Interactive Kanban Module

## Overview

The HR Task Manager is an enterprise task, ticket, and personal reminder management system built into HRBook for Admins, HODs, Reporting Managers, and Employees. It supports department and employee task assignment, file attachments, recurring schedules (`DAILY`, `WEEKLY`, `MONTHLY`, `YEARLY`), role-based visibility scoping, top clickable KPI filter cards (`Open`, `Closed`, `On Hold`, `Unassigned`, `Overdue`), a multi-filter bar, an interactive 3-column drag-and-drop Kanban board (`OPEN`, `CLOSED`, `ON HOLD`) with mandatory status-transition remarks, and a complete chronological task history log.

## Scoped Requirements

### 1. Database & Stored Procedures (DB)
- **DB-01**: Create table `HR_TaskMaster` compatible with live `HRBook` `VARCHAR` keys (`SAL_Employee_Mst.pk_empid`, `Department_Mst.pk_deptid`, `UM_Users_Mst.pk_userId`):
  - `TaskId` (`INT IDENTITY(1,1) PRIMARY KEY`)
  - `TaskCode` (`VARCHAR(50) NOT NULL UNIQUE`, e.g., `HR_TSK-2026-1001`)
  - `Subject` (`NVARCHAR(250) NOT NULL`)
  - `Description` (`NVARCHAR(MAX) NULL`)
  - `Priority` (`VARCHAR(20) NOT NULL DEFAULT 'MEDIUM'` — `HIGH`, `MEDIUM`, `LOW`)
  - `Status` (`VARCHAR(20) NOT NULL DEFAULT 'OPEN'` — `OPEN`, `CLOSED`, `ON_HOLD`)
  - `TargetDeptId` (`VARCHAR(50) NULL` — links to `Department_Mst.pk_deptid`)
  - `AssignedToEmpId` (`VARCHAR(50) NULL` — links to `SAL_Employee_Mst.pk_empid`; `NULL` when Unassigned)
  - `CreatedByEmpId` (`VARCHAR(50) NULL` — links to `SAL_Employee_Mst.pk_empid`)
  - `CreatedByUserId` (`VARCHAR(50) NULL` — links to `UM_Users_Mst.pk_userId`)
  - `CreatedByName` (`NVARCHAR(150) NULL` — fallback display name for Admin/User logins)
  - `CreatorDeptId` (`VARCHAR(50) NULL` — department of creator at task creation time)
  - `DueDate` (`DATETIME NOT NULL`)
  - `AttachmentName` (`NVARCHAR(255) NULL`)
  - `AttachmentPath` (`NVARCHAR(500) NULL`)
  - `IsRecurring` (`BIT NOT NULL DEFAULT 0`)
  - `RecurrenceType` (`VARCHAR(20) NULL` — `NONE`, `DAILY`, `WEEKLY`, `MONTHLY`, `YEARLY`)
  - `RecurrenceInterval` (`INT NOT NULL DEFAULT 1`)
  - `NextOccurrenceDate` (`DATETIME NULL`)
  - `ParentTaskId` (`INT NULL` — links generated recurring instances to template task)
  - `IsSelfTask` (`BIT NOT NULL DEFAULT 0` — `1` when employee creates task for themselves)
  - `ClosedAt` (`DATETIME NULL`)
  - `CreatedAt` (`DATETIME NOT NULL DEFAULT GETDATE()`), `UpdatedAt` (`DATETIME NOT NULL DEFAULT GETDATE()`), `IsActive` (`BIT NOT NULL DEFAULT 1`)
- **DB-02**: Create table `HR_TaskHistory` (Full Chronological Lifecycle & Audit Trail):
  - `HistoryId` (`INT IDENTITY(1,1) PRIMARY KEY`)
  - `TaskId` (`INT NOT NULL`, FK to `HR_TaskMaster.TaskId`)
  - `ActionType` (`VARCHAR(50) NOT NULL` — `CREATED`, `STATUS_CHANGED`, `ASSIGNED`, `REMARK_ADDED`, `EDITED`, `ATTACHMENT_ADDED`, `RECURRENCE_GENERATED`)
  - `OldStatus` (`VARCHAR(20) NULL`)
  - `NewStatus` (`VARCHAR(20) NULL`)
  - `OldAssigneeEmpId` (`VARCHAR(50) NULL`)
  - `NewAssigneeEmpId` (`VARCHAR(50) NULL`)
  - `Remarks` (`NVARCHAR(MAX) NOT NULL`)
  - `AttachmentName` (`NVARCHAR(255) NULL`)
  - `AttachmentPath` (`NVARCHAR(500) NULL`)
  - `ActionByEmpId` (`VARCHAR(50) NULL`)
  - `ActionByUserId` (`VARCHAR(50) NULL`)
  - `ActionByName` (`NVARCHAR(150) NULL`)
  - `CreatedAt` (`DATETIME NOT NULL DEFAULT GETDATE()`)
- **DB-03**: Create SQL Stored Procedures (`usp_HR_Task_...`):
  - `usp_HR_Task_GetLookups`: Returns active departments (`pk_deptid`, `description`, `fk_depHodid`) and active employees (`pk_empid`, `empcode`, `empname`, `fk_deptid`, `dept_name`, `isHod`, plus resolved viewer role metadata: `IsAdmin`, `IsHod`, `IsManager`, `ManagedDeptIds`).
  - `usp_HR_Task_GetBoard`: Applies role-based visibility rules (Admin, Creator, Creator's Dept HOD, Target Dept HOD, Reporting Manager, Assigned Employee) and multi-filter criteria (`Scope`, `DeptId`, `AssignedToEmpId`, `CreatedByEmpId`, `Status`, `Priority`, `OnlyUnassigned`, `OnlyOverdue`, `SearchText`), returning tasks with computed `OverdueHours`, `IsOverdue`, `DepartmentName`, `CreatedByDisplayName`, `AssignedToDisplayName`, and summary KPI counts (`TotalCount`, `OpenCount`, `ClosedCount`, `OnHoldCount`, `UnassignedCount`, `OverdueCount`).
  - `usp_HR_Task_Create`: Generates sequential `TaskCode` (`HR_TSK-YYYY-NNNN`), resolves creator's department, computes initial `NextOccurrenceDate` if recurring, inserts `HR_TaskMaster`, and inserts initial `CREATED` entry in `HR_TaskHistory`.
  - `usp_HR_Task_UpdateStatusAndRemarks`: Atomically updates `Status` (and optional `AssignedToEmpId` / `Priority` / `DueDate`) and logs a mandatory remark row into `HR_TaskHistory`.
  - `usp_HR_Task_GetByIdWithHistory`: Returns single task full details + full chronological `HR_TaskHistory` list with actor names and assignee names.
  - `usp_HR_Task_ProcessRecurring`: Evaluates active recurring tasks where `NextOccurrenceDate <= GETDATE()`, spawns new child task instances with a `RECURRENCE_GENERATED` audit log, and advances `NextOccurrenceDate` (`DAILY`, `WEEKLY`, `MONTHLY`, `YEARLY`).

### 2. Backend WebAPI (API)
- **API-01**: `TaskManagerController` at `/api/v1/TaskManager`:
  - `GET /lookups`: Returns departments, employees, and the current user's resolved role/HOD/department context.
  - `GET /board`: Accepts filter query params (`empId`, `userId`, `roleId`, `scope`, `deptId`, `assignedTo`, `createdBy`, `status`, `priority`, `unassignedOnly`, `overdueOnly`, `search`) and returns partitioned board lists + top KPI summary counts.
  - `GET /{taskId}`: Returns complete task detail + full `HR_TaskHistory` timeline.
  - `POST /create`: Supports `multipart/form-data` (or JSON + file upload) to save task + attachment into `wwwroot/uploads/tasks/` and invoke `usp_HR_Task_Create`.
  - `POST /transition`: Validates non-empty `Remarks`, updates status/assignee/details, and records history via `usp_HR_Task_UpdateStatusAndRemarks`.
  - `POST /comment`: Adds a standalone remark/attachment to `HR_TaskHistory` (and optionally updates assignee/priority/deadline).
  - `POST /process-recurring`: Endpoint + background `IHostedService` timer to trigger `usp_HR_Task_ProcessRecurring`.

### 3. Frontend Top KPI Cards, Multi-Filter Bar & Kanban Board (UI-KANBAN)
- **KANBAN-01**: Top Clickable KPI Summary Cards:
  - Cards for `All Tasks`, `Open` (`#3080e8`), `Closed` (`#475569`), `On Hold` (`#d97706`), `Unassigned` (`#6366f1`), and `Overdue` (`#dc2626`).
  - Clicking any card toggles that quick filter on the board with active border/highlight styling.
  - For HODs/Managers, includes quick scope switcher pills (`All Department & My Tasks`, `My Assigned Tasks`, `Department Tasks`, `Created By Me`, `Personal Reminders`).
- **KANBAN-02**: Multi-Filter Bar:
  - Uses `.custom-ng-select` (`28px` height) and `.form-control-sm` inputs for Department, Assigned Employee, Created By, Priority, Recurrence, and Search Keyword, plus a "Reset Filters" action and "+ Create Task" primary button (`.btn-primary-action`).
- **KANBAN-03**: 3-Column Drag-and-Drop Board (`@angular/cdk/drag-drop`):
  - Columns: `● OPEN`, `● CLOSED`, `● ON HOLD` with live badge counters.
  - Cards match reference screenshot:
    - Top: `TaskCode`, `⚠️ Overdue by Xh / Xd` soft red pill, and `Priority` badge (`HIGH`, `MEDIUM`, `LOW`).
    - Middle: `Subject` title + building/department icon with `DepartmentName` and relative age (`2 day(s) ago`), plus attachment/recurring icons if present.
    - Footer: `● BY: <Creator>` (purple pill) and `● TO: <Assignee>` (blue pill, or `● TO: Unassigned`).

### 4. Drag-and-Drop Transition Remarks Modal (UI-MODAL)
- **MODAL-01**: Mandatory Remarks Popup on Drag-and-Drop:
  - Dropping a ticket into a different status column opens a clean confirmation modal displaying the ticket code/subject and status transition (`OPEN` -> `ON HOLD`, etc.).
  - Requires mandatory remarks text before saving.
  - Canceling or dismissing the modal keeps the card in its original column.

### 5. Task Creation Modal, Full Detail History Drawer & Dual Navigation (UI-DETAILS)
- **DETAILS-01**: Create Task Modal:
  - Supports Subject, Description, Attachment file upload, Deadline/Due Date, Priority (`HIGH`, `MEDIUM`, `LOW`), Target Department, Assign To Employee (filtered by department or all, optional for Unassigned, or quick "Assign to Myself / Personal Reminder" toggle), and Recurrence (`None`, `Daily`, `Weekly`, `Monthly`, `Yearly`).
- **DETAILS-02**: Task Detail & Full History Modal/Drawer:
  - Opens when clicking any task card.
  - Displays all metadata, attachment download/view link, inline controls to update Status / Assigned Employee / Priority / Due Date with remarks, and the complete chronological `HR_TaskHistory` timeline showing every event (`CREATED`, `STATUS_CHANGED`, `ASSIGNED`, `REMARK_ADDED`, `EDITED`) with actor name, timestamp, status badges, and remarks.
- **DETAILS-03**: Dual Portal Navigation Integration:
  - Accessible in HR Module (`/dash/hr/hrdashboard/task-manager`) with sidebar link under HR Management.
  - Accessible in Employee Portal Task-Box (`/dash/taskbox/taskboxdashboard`) and Admin Taskbox (`/dash/adminTaskbox/adminTaskboxdashboard/task-manager`) so Admin, HODs, Managers, and Employees all have immediate 1-click access.
