# Phase 08: Task Visibility & Role Scoping — Context

**Gathered:** 2026-11-05
**Status:** Ready for planning

## Phase Boundary
Fix who sees which tasks on the Task Manager board (`usp_HR_Task_GetBoard`) and harden viewer identity. Changes go only in stored procedures and the controller's identity resolution. No new UI features.

## Visibility Rules (LOCKED)

| Viewer | Sees |
|---|---|
| **Admin** (`fk_roleId` IN 1, 2) | ALL tasks in company |
| **HOD** (`Department_Mst.fk_depHodid = me`) | Created by me + Assigned to me + Tasks assigned TO my dept (`TargetDeptId` in my depts, incl. unassigned pool) + Tasks CREATED by my dept employees (`CreatorDeptId` in my depts) + Tasks assigned to ANY employee belonging to my dept + direct reports' tasks |
| **Reporting Manager** | Created by me + Assigned to me + tasks assigned to my direct reports (`fk_FunctionalRepempid` / `fk_AdministrativeRepempid`) |
| **Employee** | Created by me + Assigned to me |

## Decisions
- **D-01:** Keep reporting-manager visibility over direct reports' tasks.
- **D-02:** HOD "my department" = BOTH tasks created by dept employees AND tasks assigned to dept employees (plus tasks targeted at the dept).
- **D-03:** Admin = role 1 (ADMINISTRATOR) + role 2 (SUPER ADMIN) only. HR Manager (7) is NOT admin.
- **D-04:** Unassigned department-pool tasks visible only to that dept's HOD + Admin + creator (not to every dept employee).
- **D-05:** Unknown/unresolvable viewer sees NOTHING (remove admin fallback, lines 62–64 of current SP).
- **D-06:** Viewer identity comes ONLY from JWT (`HttpContext.Items["DecryptedUserId"]`); ignore client-sent `viewerEmpId`.
- **D-07:** Employee logins (ViewerId = `pk_empid`) must resolve the role via linked `UM_Users_Mst.fk_empId` → `fk_roleId`, so employee-linked admins (e.g. GU-2) get Admin scope.
- **D-08:** "My Department" chip (`DEPT_TASKS`) must return dept tasks for Admin (all dept-targeted) and HOD; for plain employees show empty/hide chip.

## Known Data Issues (to handle in plan)
- Only 1 department has `fk_depHodid` set → HOD scope won't apply to others until data is filled (master-data task, not code).
- Task #19 has NULL `CreatedByEmpId` and NULL `CreatedByUserId` → `usp_HR_Task_Create` must always persist creator (user or emp).

## Constraints
- Stored procedures only; no inline SQL.
- No hardcoded menu/HTML changes.

## Canonical Refs
- `usp_HR_Task_GetBoard` (current def: scratch/getboard.sql, role scoping lines 155–173)
- `WebAPI/Controllers/TaskManagerController.cs` — `ResolveViewerId`, `HandleGetBoard`
- `usp_HR_Task_Create` — creator persistence
- `UM_Role_Mst`, `Department_Mst.fk_depHodid`, `SAL_Employee_Mst.fk_deptid / fk_FunctionalRepempid / fk_AdministrativeRepempid`

## Deferred
- Configurable admin flag on `UM_Role_Mst` (instead of hardcoded 1, 2).

