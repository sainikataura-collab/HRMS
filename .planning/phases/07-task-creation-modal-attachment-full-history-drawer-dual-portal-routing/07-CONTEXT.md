# Phase 7 Context: Task Creation Modal, Attachment & Full History Drawer & Dual Portal Routing

**Phase**: 07-task-creation-modal-attachment-full-history-drawer-dual-portal-routing  
**Created Date**: 2026-11-04  
**Status**: Ready for Planning & Execution  

---

## 1. Phase Objective & Overview
Phase 7 completes the entire end-to-end task management lifecycle in HRBook:
1. **Task Creation Modal (`CreateTaskModalComponent`)**:
   - Allows Admin, HOD, and Employees to create tasks with:
     - Subject & rich Description
     - Department selection
     - Assignee selection (with "Assign to Myself" toggle)
     - Priority selection (`HIGH`, `MEDIUM`, `LOW`)
     - Deadline date & time
     - Attachment uploader (PDF, Word, Excel, Images) saving to `/Uploads/Tasks`
     - Recurrence engine configuration (`DAILY`, `WEEKLY`, `MONTHLY`, `YEARLY`, recurrence interval, recurrence end date).
2. **Task Detail & Full Chronological History Drawer (`TaskDetailDrawerComponent`)**:
   - Slide-out / modal drawer displaying complete task metadata:
     - Task code, subject, description, priority, status, department, creator, assignee, deadline, overdue alert.
     - Attachment viewer / download link.
     - Inline quick status transition & remarks submission.
     - Chronological History Timeline: Every status move, remark, action type, actor name, and timestamp.
3. **TaskManagerComponent Integration**:
   - Wire "+ Create Task" button to open `CreateTaskModalComponent`.
   - Wire task card click `(taskSelected)` to open `TaskDetailDrawerComponent`.
   - Refresh Kanban board data on task creation or status transition.
4. **Navigation Integration**:
   - Verify HR Dashboard route `/dash/hr/hrdashboard/task-manager`.
   - Verify Employee Task-Box route `/dash/taskbox/taskboxdashboard`.
   - Update sidebar navigation menus so users can easily click into Task Manager.

---

## 2. Design Contracts (`.planning/codebase/DESIGN.md`)
- Work Sans typography
- `28px` inputs & `.custom-ng-select`
- Primary brand `#3080e8`, hover `#2b2b41`
- Timeline nodes with colored badges and audit logs

