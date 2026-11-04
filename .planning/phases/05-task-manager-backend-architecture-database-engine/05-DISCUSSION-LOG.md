# Phase 5: Task Manager Backend Architecture & Database Engine - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in `05-CONTEXT.md` — this log preserves the alternatives considered.

**Date:** 2026-11-04
**Phase:** 05-task-manager-backend-architecture-database-engine
**Areas discussed:** Task fields & attachments, Recurrence schedules, Role/HOD/Manager/Employee visibility hierarchy, Top KPI filter cards & Unassigned state, Dual portal navigation

---

## Gray Areas & Decisions

### Area 1: Portal Navigation Access
- **Options considered:**
  1. Both HR Module (`/dash/hr/hrdashboard/task-manager`) AND Employee Task-Box (`/dash/taskbox/taskboxdashboard`) sharing the same component.
  2. Only inside HR Module (`/dash/hr/hrdashboard/task-manager`).
  3. Replace both Admin Taskbox and Employee Task-Box dashboards entirely.
- **Selected:** Both HR Module (`/dash/hr/hrdashboard/task-manager`) AND Employee Task-Box (`/dash/taskbox/taskboxdashboard`) sharing the same component (plus link in Admin Taskbox).

### Area 2: Unassigned Tasks Behavior
- **Options considered:**
  1. Unassigned tasks have Status = `'OPEN'` (or `'ON_HOLD'`) and appear on the 3-column Kanban board with a `'● TO: Unassigned'` badge, while clicking the top `'Unassigned'` KPI card filters the board to show only unassigned tasks.
  2. Add a 4th Kanban column specifically for `'UNASSIGNED'`.
- **Selected:** Option 1 — keeps the 3-column Kanban board (`OPEN`, `CLOSED`, `ON HOLD`) matching the screenshot while top KPI card filters `Unassigned`.

### Area 3: HOD & Manager Resolution
- **Options considered:**
  1. Auto-detect HOD & Manager status from both `Department_Mst` (`fk_depHodid`) AND `SAL_Employee_Mst` hierarchy columns (`fk_FunctionalHODempid`, `fk_AdministrativeHODempid`, `fk_rmanagerid`, `isHod`).
  2. Use only `Department_Mst.fk_depHodid` and `SAL_Employee_Mst.fk_rmanagerid`.
- **Selected:** Option 1 — comprehensive multi-column hierarchy resolution.
