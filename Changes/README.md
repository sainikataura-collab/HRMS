# Task Management System - Complete Changes Export

This directory contains all the backend, frontend, and database scripts developed and modified for the Task Management System (Kanban workspace, SLA recurrence engine, role-scoped visibility, real-time SignalR notifications & Web Audio toast chime).

---

## Database Deployment Instructions

Execute the scripts located in `Database_Scripts/` in the following sequence against your `HRBook` database:

### Step 1: Tables, Columns, Indexes & Master Lookups
* **`Database_Scripts/HR_TaskMaster_And_TaskHistory_Tables.sql`**
  * Creates or updates `dbo.HR_TaskMaster` with all 36 columns (including all recurrence, SLA offset, tenancy, and task type columns).
  * Creates or updates `dbo.HR_TaskHistory` with audit trail columns and foreign key cascade.
  * Creates all performance and filtered indexes (`UQ_HR_TaskMaster_TaskCode`, `IX_HR_TaskMaster_Recurrence`, `IX_HR_TaskMaster_Status_Active`, etc.).
  * Seeds default Task Types in `dbo.LSP_Master_General` (`CodeTypeId = 24`) for global fallback (`fk_companyId = '0'`).
  * **Safe & Idempotent:** Runs cleanly on both fresh installations and existing databases.

### Step 2: Functions & Stored Procedures
* **`Database_Scripts/All_Task_Stored_Procedures_Live_Definition.sql`**
  * Contains the complete, latest live definitions extracted directly from the database for all 10 stored procedures and 2 scalar/table-valued functions:
    1. `dbo.fn_HR_Task_ResolveViewer`
    2. `dbo.fn_HR_Task_VisibleTasks`
    3. `dbo.usp_HR_Task_GetLookups`
    4. `dbo.usp_HR_Task_GetBoard`
    5. `dbo.usp_HR_Task_Create`
    6. `dbo.usp_HR_Task_UpdateStatusAndRemarks`
    7. `dbo.usp_HR_Task_UpdateTaskDetails`
    8. `dbo.usp_HR_Task_GetByIdWithHistory`
    9. `dbo.usp_HR_Task_GetDetail`
    10. `dbo.usp_HR_Task_SearchEmployees`
    11. `dbo.usp_HR_Task_ProcessRecurring`
    12. `dbo.usp_HR_Task_DispatchNotification`
* Individual `.sql` files for each stored procedure and function are also provided in `Database_Scripts/` for modular deployment.

---

## Directory Structure

### 1. `Frontend/`
* `src/styles.scss`: Global stacking context rules ensuring modals and drawers render above top navigation bar.
* `src/app/pages/task-manager/`
  * `task-manager.component.*`: Main Kanban workspace, search, filters, static KPI counters, recurring templates tab.
  * `components/create-task-modal/`: Modal with recurrence scheduler, SLA duration calculator, live dossier preview.
  * `components/task-detail-drawer/`: Slide-over detail drawer, audit timeline, status action chips, remarks, attachments.
  * `components/transition-remarks-modal/`: Mandatory remarks modal on status transition.
  * `components/task-toast-notification/`: Modern SaaS bottom-right animated toast popup with countdown timer bar.
* `src/app/shared/services/`
  * `task-manager.service.ts`: REST API client for task operations and board fetching.
  * `task-toast.service.ts`: Toast state & Web Audio API harmonic chime synthesizer.
  * `task-signalr.service.ts`: SignalR connector for TaskHub.
  * `signalr.service.ts`: App-wide SignalR service with TaskNotificationReceived & TaskBoardChanged handlers.
* `src/app/app.component.*`: Root component with global toast component mounted and SSR guards.
* `src/app/pages/all-dashboard/taskbox/`: Admin Taskbox routes and dashboard integration.
* `src/app/pages/all-employee/task-box/`: Employee Taskbox integration.

### 2. `WebAPI/`
* `Controllers/TaskManagerController.cs`: Task REST API endpoints & multi-hub SignalR real-time broadcaster.
* `Repository/TaskManagerRepository.cs` & `ITaskManagerRepository.cs`: Data access layer with stakeholder resolution for HOD/Assignee/Creator/Managers.
* `Models/TaskManagerModels.cs`: DTO models (including RecurringTasks list and BoardData wrapper).
* `Hubs/ChatHub.cs`: Hub with role-based and bare group registration.
* `Hubs/TaskHub.cs`: Dedicated Task Hub.
* `Services/RecurringTaskHostedService.cs`: Background worker for recurrence spawning.
* `Program.cs`: Startup registrations.

### 3. `Database_Scripts/`
* Complete SQL scripts for tables, indexes, lookups, functions, and stored procedures as detailed above.
