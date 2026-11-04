# Phase 5: Task Manager Backend Architecture & Database Engine - Context

**Gathered:** 2026-11-04
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver the complete SQL Server schema (`HR_TaskMaster`, `HR_TaskHistory`), stored procedures (`usp_HR_Task_*`), Dapper repository, file attachment upload storage, role/HOD/manager visibility scoping engine, recurring task schedule generator (`DAILY`, `WEEKLY`, `MONTHLY`, `YEARLY`), and `TaskManagerController` REST endpoints for the HR Task Manager & Interactive Kanban Module.

</domain>

<decisions>
## Implementation Decisions

### Database Schema & Employee/Department Foreign Keys
- **D-01:** Use `VARCHAR(50)` for all employee (`pk_empid`), department (`pk_deptid`), and user (`pk_userId`) references (`CreatedByEmpId`, `AssignedToEmpId`, `TargetDeptId`, `CreatorDeptId`, `CreatedByUserId`) because `SAL_Employee_Mst.pk_empid`, `Department_Mst.pk_deptid`, and `UM_Users_Mst.pk_userId` use string identifiers like `'GU-1'`, `'GU-100'` — **Reversibility:** one-way — changing column types after table creation and data population requires schema migration.
- **D-02:** Store full lifecycle history in `HR_TaskHistory` covering every event type: `CREATED`, `STATUS_CHANGED`, `ASSIGNED`, `REMARK_ADDED`, `EDITED`, `ATTACHMENT_ADDED`, and `RECURRENCE_GENERATED`, rather than only status transitions.
- **D-03:** Prefix all SQL stored procedures with `usp_HR_Task_` (`usp_HR_Task_GetLookups`, `usp_HR_Task_GetBoard`, `usp_HR_Task_Create`, `usp_HR_Task_UpdateStatusAndRemarks`, `usp_HR_Task_GetByIdWithHistory`, `usp_HR_Task_ProcessRecurring`) and save idempotent deployment script in `WebAPI/Scripts/HR_TaskManager_Setup.sql`.

### Role, HOD, Manager & Employee Visibility Hierarchy
- **D-04:** Auto-detect HOD and Manager roles from both `Department_Mst.fk_depHodid` AND `SAL_Employee_Mst` hierarchy columns (`fk_FunctionalHODempid`, `fk_AdministrativeHODempid`, `fk_rmanagerid`, `fk_imanagerid`, `fk_FunctionalRepempid`, `fk_AdministrativeRepempid`, `isHod`).
- **D-05:** Enforce visibility scoping in `usp_HR_Task_GetBoard`:
  1. **Admin (`fk_roleId IN (1, 2, 7)` or Admin user without employee mapping)**: Sees all tasks across all departments.
  2. **Task Creator (`CreatedByEmpId = @ViewerEmpId` or `CreatedByUserId = @ViewerUserId`)**: Always sees tasks they created.
  3. **HOD**: Sees their own tasks + all tasks where `TargetDeptId` is one of their HOD departments + all tasks where `CreatorDeptId` or assignee's `fk_deptid` belongs to their HOD departments or where creator/assignee reports to them as HOD.
  4. **Reporting Manager**: Sees their own tasks + tasks created by or assigned to their direct reports.
  5. **Employee**: Sees all tasks assigned to them (`AssignedToEmpId = @ViewerEmpId`) + tasks they created (`CreatedByEmpId = @ViewerEmpId`), including self-assigned personal reminder tasks.

### Unassigned Tasks, Top Summary KPI Counts & Multi-Filter Support
- **D-06:** Unassigned tasks (`AssignedToEmpId IS NULL OR AssignedToEmpId = ''`) carry a standard workflow status (`OPEN` by default, or `ON_HOLD` / `CLOSED`) and render on the 3-column Kanban board with a `● TO: Unassigned` badge, while the top `Unassigned` KPI card acts as a 1-click filter toggle.
- **D-07:** `usp_HR_Task_GetBoard` returns task rows alongside KPI summary counts (`TotalCount`, `OpenCount`, `ClosedCount`, `OnHoldCount`, `UnassignedCount`, `OverdueCount`) and supports simultaneous filtering by `Scope` (`ALL`, `MY_TASKS`, `DEPT_TASKS`, `CREATED_BY_ME`, `SELF_TASKS`), `DeptId`, `AssignedToEmpId`, `CreatedByEmpId`, `Status`, `Priority`, `RecurrenceType`, `OnlyUnassigned`, `OnlyOverdue`, and `SearchText`.

### Recurrence & File Attachments
- **D-08:** Support `NONE`, `DAILY`, `WEEKLY`, `MONTHLY`, and `YEARLY` recurrence schedules. When `NextOccurrenceDate <= GETDATE()`, `usp_HR_Task_ProcessRecurring` generates a fresh child task instance linked via `ParentTaskId`, logs `RECURRENCE_GENERATED` in `HR_TaskHistory`, and advances `NextOccurrenceDate`.
- **D-09:** Support file attachments on task creation and history updates, saving files under `WebAPI/wwwroot/uploads/tasks/` and storing `AttachmentName` and relative URL `AttachmentPath` (`/uploads/tasks/...`).

### Dual Portal Navigation (carried into Phase 6 & 7)
- **D-10:** Expose the Task Manager Kanban component in both the HR Module (`/dash/hr/hrdashboard/task-manager`) and the Employee Portal Task-Box (`/dash/taskbox/taskboxdashboard`) as well as Admin Taskbox (`/dash/adminTaskbox/adminTaskboxdashboard/task-manager`) so Admin, HODs, Managers, and Employees can access it directly from their default portal.

### the agent's Discretion
- Exact background polling interval for `RecurringTaskHostedService` (e.g., on startup + every 15 minutes, plus on-demand trigger when loading the board).
- Ticket code format prefix (`HR_TSK-YYYY-NNNN`).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project & Design Specs
- `.planning/PROJECT.md` — Overall vision, visual design reference, and role hierarchy
- `.planning/REQUIREMENTS.md` — Detailed schema (`DB-01`..`DB-03`), API (`API-01`..`API-02`), and UI requirements
- `.planning/ROADMAP.md` — Phase breakdown and success criteria
- `.planning/codebase/DESIGN.md` — Corporate design system (`Work Sans`, `#3080e8`, `28px` `.custom-ng-select` & `.form-control-sm`)
- `.planning/codebase/CONVENTIONS.md` — Dapper, controller, and Angular coding conventions

### Existing Backend Reference Files
- `WebAPI/Program.cs` — DI registration and middleware pipeline
- `Repository/DataBaseFactory.cs` — `DataBaseFactory.ConnString()` connection factory
- `WebAPI/Controllers/HRManagementController/EmployeeMasterController.cs` — Controller pattern reference

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `DataBaseFactory.ConnString()`: Used across all repositories for `SqlConnection` instantiation with Dapper.
- `WebAPI/wwwroot/uploads/`: Static file serving is already enabled in `Program.cs` (`app.UseStaticFiles()`), making `/uploads/tasks/...` immediately downloadable in the browser.

### Established Patterns
- Dapper repositories execute stored procedures (`CommandType.StoredProcedure`) or parameterized SQL and return strongly-typed DTOs wrapped in standard JSON responses.
- Frontend user context is stored in `sessionStorage` / `localStorage`: `userid` (`UM_Users_Mst.pk_userId`), `empid` (`SAL_Employee_Mst.pk_empid`), `roleId` (`UM_Users_Mst.fk_roleId`), `usertype` (`'User'` or `'Employee'`), and `username`.

### Integration Points
- `SAL_Employee_Mst` (`pk_empid`, `empcode`, `empname`, `fk_deptid`, `active`, `employeeleftstatus`, `fk_FunctionalHODempid`, `fk_AdministrativeHODempid`, `fk_rmanagerid`, `isHod`)
- `Department_Mst` (`pk_deptid`, `description`, `fk_depHodid`, `dep_active`)
- `UM_Users_Mst` (`pk_userId`, `fk_empId`, `fk_roleId`, `name`, `loginname`)

</code_context>

<specifics>
## Specific Ideas

- Kanban cards must match the user's uploaded reference image (`C:/Users/USER/.gemini/antigravity/brain/8c7cf4b0-dcff-4b34-9a92-415e3f1490b0/.user_uploaded/media_1793788722738_321e37dc.jpg`):
  - 3 columns: `● OPEN` (blue dot), `● CLOSED` (slate dot), `● ON HOLD` (orange dot) with count badges.
  - Card top row: Ticket Code + `⚠️ Overdue by Xh` red pill + Priority badge (`HIGH`, `MEDIUM`, `LOW`).
  - Card middle: Bold Subject + Department/Entity icon & name + relative age (`2 day(s) ago`).
  - Card bottom: `● BY: <Creator>` (purple pill) and `● TO: <Assignee>` (blue pill, or `● TO: Unassigned`).
- Top of page has clickable counter cards (`All`, `Open`, `Closed`, `On Hold`, `Unassigned`, `Overdue`) + multi-filter bar.
- Dragging a card between columns opens a mandatory Remarks modal before updating status.
- Clicking a card opens full task details + complete history log + status/assignee update controls.

</specifics>

<deferred>
## Deferred Ideas

None — all user requirements are structured across Phases 5, 6, and 7.

</deferred>

---

*Phase: 05-task-manager-backend-architecture-database-engine*
*Context gathered: 2026-11-04*

