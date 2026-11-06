# Phase 08 — Task Visibility, Role Scoping & Ticket Creation Data Integrity Summary

**Phase:** 08-task-visibility-role-scoping  
**Executed Date:** 2026-11-06  
**Status:** Completed & Verified  

---

## 1. Executive Summary

Phase 08 delivers complete role-based ticket visibility, cryptographic IDOR protection, and end-to-end data integrity for the HRBook Task Management Module. 

Prior to Phase 08, tickets were exposed across the entire organization due to lack of role filtering, employee and user identities collided on shared IDs (such as `GU-18` representing both the Admin user and employee Rahul Upreti), and ticket creation modal fields were partially defaulted or dropped before hitting SQL Server.

Following locked Architectural **Alternative 1 (`X-User-Type` Header)**, the solution decouples identity resolution from global token structures, resolving viewer roles (`User` vs `Employee`) safely at the controller layer and enforcing access checks directly in database stored procedures via table-valued functions.

---

## 2. Key Architecture & Implemented Decisions

### A. Alternative 1: `X-User-Type` Identity Resolution (Zero Core Auth Mutation)
- **Problem Solved:** `UM_SP_Login` produces `LoginType = 'User'` for `UM_Users_Mst` and `LoginType = 'Employee'` for `SAL_Employee_Mst`. The Angular frontend stores this in `sessionStorage.getItem('usertype')`. ID sets collide (`GU-18` is both user Admin and employee Rahul upreti).
- **Implementation:**
  - `task-manager.service.ts` dynamically appends `'X-User-Type': sessionStorage.getItem('usertype') || 'Employee'` to all HTTP calls.
  - `TaskManagerController.cs` reads `Request.Headers["X-User-Type"]` and validates the user against the JWT claim `DecryptedUserId`.
  - Zero modifications to `TokenService.cs`, `TokenValidationMiddleware.cs`, or `UserController.cs` — 100% backward compatible with existing HRBook modules.

### B. Single Source of Truth for Role Visibility (`fn_HR_Task_VisibleTasks`)
Applied via `WebAPI/Scripts/HR_Task_Visibility_Phase08.sql`:
1. **`dbo.fn_HR_Task_ResolveViewer(@ViewerId, @UserType)`**:
   - Resolves identity strictly based on `@UserType`.
   - Never falls back to admin if an ID cannot be resolved; returns 0 rows.
   - Detects HOD status via `Department_Mst.fk_depHodid`.
   - Detects Manager status via `SAL_Employee_Mst.fk_AdministrativeRepempid` / `fk_FunctionalRepempid`.
   - Detects Admin status via `UM_Users_Mst.fk_roleId IN (1, 2)`.
2. **`dbo.fn_HR_Task_VisibleTasks(@ViewerId, @UserType, @CompanyId)`**:
   - **Plain Employee:** Sees only tasks where `AssignedToEmpId = @ViewerId` OR `CreatedByEmpId = @ViewerId`.
   - **HOD:** Sees tasks created by them, assigned to them, targeted to their department (`TargetDeptId = @DeptId`), created by departmental employees (`CreatorDeptId = @DeptId`), or assigned to departmental employees.
   - **Reporting Manager:** Sees tasks created by them, assigned to them, and tasks assigned to their direct reports.
   - **Company Admin (`fk_roleId IN (1, 2)`):** Sees all active tasks belonging to their company.
   - **Unknown / Unauthenticated Viewer:** Returns 0 rows.

### C. IDOR Protection on Reads and Mutations
- `dbo.usp_HR_Task_GetBoard`: Filters via `INNER JOIN dbo.fn_HR_Task_VisibleTasks(...)`. Emits Result Set 1 (Counts), Result Set 2 (Cards), and Result Set 3 (`ViewerContext`: `IsAdmin`, `IsHod`, `IsManager`, `ResolvedName`).
- `dbo.usp_HR_Task_GetDetail` & `dbo.usp_HR_Task_GetByIdWithHistory`: Guarded with `fn_HR_Task_VisibleTasks`. Returns `IsAuthorized = 0` if viewer lacks access.
- `TaskManagerController.cs`: Throws HTTP 403 Forbidden on unauthorized access to `GET /api/TaskManager/{taskId}`.
- `dbo.usp_HR_Task_UpdateStatusAndRemarks` & `dbo.usp_HR_Task_UpdateTaskDetails`: Guarded against unauthorized mutation.

### D. Creation Data Integrity & Concurrency
- `dbo.usp_HR_Task_Create`:
  - Uses `fn_HR_Task_ResolveViewer` to ensure accurate attribution (`CreatedByUserId` vs `CreatedByEmpId`, `CreatedByName`, `CreatorDeptId`).
  - Persists `IsSelfTask`, `TaskTypeId`, `TaskTypeName`, `RecurrenceDueOffsetHours`, `RecurrenceDueOffsetUnit`, and attachments.
  - Employs atomic transaction with `UPDLOCK, HOLDLOCK` on `TaskCode` generation to guarantee sequential formatting (`HR_TSK-YYYY-XXXX`) without concurrency race conditions.
- `dbo.usp_HR_Task_ProcessRecurring`:
  - Deep-copies attachments (`AttachmentName`, `AttachmentPath`), recurrence metadata, and creator attributes to generated child instances.
  - Enforces `UPDLOCK, HOLDLOCK` on code generation.
- Repaired historical task attribution: Tasks 1–13 updated to `CreatedByUserId = 'GU-18'`, `CreatedByEmpId = NULL`, `CreatedByName = 'Admin'`.

---

## 3. Frontend Role Experience
1. **Scope Filtering:** The "My Department" scope filter tab is dynamically gated via `visibleScopeOptions`. It is visible only to HODs and Admins; plain employees see only relevant scopes ("All Viewable", "Assigned to Me", "Created by Me", "Recurring Cadences").
2. **Access Feedback:** If a user navigates to an unauthorized task ID via deep link or URL, the details drawer renders a clear "Access Restricted: You do not have permission to access this task" banner.
3. **Creation Form Validation:**
   - Mandatory deadline selection for non-recurring tickets.
   - Exact task type persistence without silent fallback to "Compliance".
   - Seamless "Assign to Me" (`isSelfTask`) toggle support.

---

## 4. Verification Evidence

### SQL Matrix Verification:
- **Admin Verification (`GU-18`, User, `GU-8`):**
  - Visibility count: 12 tasks (100% of company tasks).
  - Reason: `ADMIN`.
  - ViewerContext: `IsAdmin = 1, IsHod = 0, IsManager = 0, ResolvedName = Admin`.
- **Employee Verification (`GU-23686`, Employee, `GU-8`):**
  - Visibility count: 4 tasks (only assigned to or created by Aadil).
  - ViewerContext: `IsAdmin = 0, IsHod = 0, IsManager = 0, ResolvedName = AADIL`.
- **Unknown Viewer Verification (`UNKNOWN`, Employee, `GU-8`):**
  - Visibility count: 0 tasks.
- **Backend Build:**
  - `dotnet build WebAPI` -> Succeeded with 0 errors.
  - API daemon running and listening on `http://localhost:5128`.

