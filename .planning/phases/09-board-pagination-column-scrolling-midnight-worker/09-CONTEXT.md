# Phase 09 Context: Board Pagination, Independent Column Scrolling & Midnight Recurrence Worker

## 1. Background & Scope

During user testing of the Task Management Kanban board and recurring tasks (Phases 06–08), two major architectural needs were identified:
1. **Board Layout & Scrolling Behavior:**
   - Currently, `.swimlane-track` expands without vertical bounds, causing long lists of tasks (especially in Open or Closed) to stretch the whole page downward.
   - Scrolling inside one column moves the entire webpage, pushing filter toolbars and other swimlanes off-screen.
   - All tasks are loaded simultaneously into memory; as tasks scale into hundreds, column-level pagination (10 per batch with scroll loading) is required.
2. **Recurring Task Lifecycle & Worker Timing:**
   - Currently, creating a recurring task immediately generates a child instance at current date/time, even if the user scheduled it for a future day (e.g. next Monday or 20th of the month).
   - The background worker currently polls every 15 minutes.
   - The requirement is to run the recurring task generator at **12:00 AM (Midnight) Daily**, so that daily, weekly, and monthly tasks due on that calendar date are generated fresh for employees when they begin their work day.

---

## 2. Locked Decisions

### D-01: Independent UI Column Scrolling (Kanban Standard)
- The outer workspace `.task-workspace-shell` maintains a clean layout with sticky command deck and filter bar.
- Each column (`.swimlane`) maintains a fixed header (`.swimlane-header`) and an independently scrollable body (`.swimlane-track` with `overflow-y: auto`, `max-height: calc(100vh - 280px)`).
- When a user scrolls inside the **Open** column, **only Open cards scroll**. The page and other columns remain fixed.

### D-02: Column-Level Pagination & Infinite Scroll (10 per Batch)
- Initial board load fetches the first page (10 tasks per column) along with full aggregate KPI counts (`COUNT(*)`).
- Each column tracks its own pagination state (`openPage`, `closedPage`, `onHoldPage`, `hasMoreOpen`, `hasMoreClosed`, `hasMoreOnHold`).
- Scrolling near the bottom of any `.swimlane-track` (threshold $\ge 85\%$) triggers loading the next page of 10 tasks for that column only.
- The Dedicated Recurring Cadences pane retains its frequency filter and search with list pagination.

### D-03: 12:00 AM Midnight Recurring Worker
- `RecurringTaskHostedService.cs` calculates the exact `TimeSpan` until the upcoming **12:00:00 AM Midnight** (local server time).
- It executes `ProcessDueTasksAsync()` at 12:00 AM and sets a 24-hour cycle (`PeriodicTimer` or `Task.Delay(TimeSpan.FromDays(1))`).
- On server startup, it executes a single catch-up check in case the server was rebooted or offline at midnight.

### D-04: Decouple Immediate Instance Generation on Save
- In `dbo.usp_HR_Task_Create`, remove the unconditional `EXEC dbo.usp_HR_Task_ProcessRecurring`.
- Saving a recurring schedule strictly saves the master template (`IsRecurring = 1`) and calculates `NextOccurrenceDate`.
- Instances are spawned at 12:00 AM on their scheduled date, or when the user explicitly clicks the **"Run Now"** button in the Recurring Studio.

---

## 3. Plan Breakdown

- **Plan 09-01:** UI Independent Column Scrolling & Lazy Pagination per Column (CSS layout fix, stored procedure pagination parameters, frontend scroll listeners).
- **Plan 09-02:** 12:00 AM Midnight Worker & Recurrence Save Decoupling (`RecurringTaskHostedService.cs` midnight scheduling, `usp_HR_Task_Create` update).
