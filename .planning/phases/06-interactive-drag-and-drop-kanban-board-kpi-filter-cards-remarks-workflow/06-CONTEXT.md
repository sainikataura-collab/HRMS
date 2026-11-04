# Phase 6 Context: Interactive Drag-and-Drop Kanban Board, KPI Filter Cards & Remarks Workflow

**Phase**: 06-interactive-drag-and-drop-kanban-board-kpi-filter-cards-remarks-workflow  
**Created Date**: 2026-11-04  
**Status**: Ready for Planning & Execution  

---

## 1. Phase Objective & Overview
Phase 6 builds the complete frontend interface for the HR Task Manager, featuring:
1. **Interactive 3-Column Kanban Board** using Angular CDK Drag-and-Drop (`@angular/cdk/drag-drop`), exactly reproducing the layout, typography, indicators, and chips from the user's reference screenshot (`OPEN`, `CLOSED`, `ON HOLD`).
2. **Top Clickable KPI Summary Cards** (`All`, `Open`, `Closed`, `On Hold`, `Unassigned`, `Overdue`) that display real-time counters and filter the Kanban board on click with active state styling.
3. **Multi-Filter Bar** adhering strictly to `.planning/codebase/DESIGN.md` with `28px` inputs, `.custom-ng-select` dropdowns for Department, Assignee, Priority, Recurrence, Scope, and a quick-search textbox with Reset and Refresh actions.
4. **Drag-and-Drop Status Transition Remarks Modal**: When a user drags a task card into a new column, the action is intercepted to open a remarks dialog. Submitting confirms the transition and updates the task status in the database with historical logging; cancelling returns the card to its original position without mutation.

---

## 2. Design System Alignment (`.planning/codebase/DESIGN.md`)
- **Typography**: `"Work Sans", sans-serif !important` across all cards, badges, dropdowns, and modals.
- **Color Palette**:
  - Primary Brand Blue: `#3080e8`
  - Column Dot Indicators: Open `#3080e8`, Closed `#6c757d`, On Hold `#f59e0b`
  - Chips:
    - Creator Pill (`BY`): Purple `#7c3aed` (solid with white text and dot)
    - Assignee Pill (`TO`): Blue `#2563eb` (solid with white text and dot) / Unassigned (`TO: Unassigned`) `#475569`
  - Overdue Badge: Light red `#fee2e2` background, `#dc2626` text with warning icon
  - Priority Badges:
    - `HIGH`: Light red border, `#ef4444` text
    - `MEDIUM`: Amber border `#f59e0b`, `#d97706` text
    - `LOW`: Emerald/green border `#10b981`, `#059669` text
- **Form Controls & Dropdowns**:
  - `28px` height for textboxes and `.custom-ng-select`
  - Slate border scale (`#cbd5e1`, hover `#94a3b8`, focus `#3080e8`)
  - Primary Action Button: `#3080e8`, height `28px`, hover `#2b2b41`

---

## 3. Reference Image Breakdown (Attachment `media_1793788722738_321e37dc.jpg`)
Each card in the Kanban column renders:
- **Header Line**:
  - Left: Task Code (e.g., `CJD_CRM-2026-1083`) in muted gray text
  - Center: Overdue tag (e.g., `⚠️ Overdue by 15.3h`) if `isOverdue` is true
  - Right: Priority tag (e.g., `MEDIUM`, `HIGH`) in bordered pill
- **Subject / Title**:
  - Bold 12.5px - 13px dark title (`#1e293b`), clamp to 2 lines
- **Context Row**:
  - Left: Office / Department icon + Department/Client Name (e.g., `🏢 FLIPKART INDIA PVT L...`)
  - Right: Relative age string (e.g., `2 day(s) ago`, `7 day(s) ago`)
- **Footer Row (Chips)**:
  - Left: `● BY: [CreatorName]` in purple pill
  - Right: `● TO: [AssigneeName]` or `● TO: Unassigned` in blue/dark blue pill

---

## 4. Key Decisions & Technical Specs
- **Angular CDK Drag-and-Drop**:
  - Columns configured with `cdkDropListGroup`, `cdkDropList`, `[cdkDropListData]`, `[cdkDropListConnectedTo]`.
  - On drop event `(cdkDropListDropped)="onCardDrop($event)"`:
    - If `previousContainer === container`: re-order locally in list if desired.
    - If `previousContainer !== container`: capture source task, target status (`OPEN`, `CLOSED`, `ON HOLD`), open `TransitionRemarksModalComponent`.
    - If modal confirmed: trigger `TaskManagerService.updateStatusAndRemarks()`. On success, update item and reload counts.
    - If modal dismissed: keep card in original container.
- **Service Layer**:
  - `TaskManagerService`: Communicates with `/api/v1/TaskManager` endpoints:
    - `getBoard(filter: TaskBoardFilterDto)` -> `Observable<TaskBoardResponseDto>`
    - `getLookups()` -> `Observable<TaskLookupsDto>`
    - `updateStatusAndRemarks(req: TaskStatusUpdateRequestDto)` -> `Observable<ApiResponse>`
- **Top KPI Filter Cards**:
  - 6 KPI Cards: Total Tasks, Open, Closed, On Hold, Unassigned, Overdue.
  - Clicking any card applies the corresponding filter on the board and highlights the active card.
- **Drawer / Details trigger**:
  - Clicking any card triggers an event `(taskSelected)="onSelectTask(task)"` which connects to the Phase 7 Task Detail Drawer.

