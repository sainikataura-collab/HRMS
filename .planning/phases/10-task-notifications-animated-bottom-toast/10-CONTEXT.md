# Phase 10 Context: Task Event Stakeholder Notifications & Animated Bottom Toast

## Phase Goal
Deliver end-to-end task event notifications for all key stakeholders (Creator, Assignee, Target Department HOD, and Reporting Manager) across both in-app persistent notifications (bell icon) and an animated floating bottom toast popup with subtle audio feedback and an actionable "View Ticket" button.

---

## Decisions Locked Through Discussion

### 1. Delivery Channels
- **In-App Persistent Notifications:**
  - Recorded in the database (`LMS_Notification_Mst` and `LMS_Notification_Employee_Map` or task notification mapping).
  - Populates the user's top notification bell menu with unread badges.
- **Animated Bottom Toast Notification:**
  - Floating toast component rendered at the bottom (bottom-center / bottom-right).
  - Enters with a smooth slide-up animation (`translateY(100%) -> translateY(0)` with gentle ease-out/bounce).
  - Sleek design with a glowing accent border matching status/priority (e.g., emerald for creation, amber for on-hold, blue for update, red for urgent).
  - Includes an actionable **"View Ticket"** button.
  - Automatically fades out and slides down after 5 seconds (or dismisses on click).
- **Audio Feedback:**
  - Plays a subtle audio chime/ding sound upon toast appearance using Web Audio API synthesis (self-contained, 0 external asset dependency, instant playback).

### 2. Stakeholders & Target Audience
When a task event occurs, notifications are routed to:
1. **Assigned Employee:** Immediate alert of newly assigned task or reassignment.
2. **Department HOD:** Alert of tasks created for or within their department.
3. **Reporting Manager:** Alert for direct report's task assignments/status changes.
4. **Task Creator:** Confirmation toast and notification of status updates made by others.

### 3. Trigger Events
1. **Task Created:** Dispatched immediately upon saving a new task (including self-tasks and non-self tasks).
2. **Status Transitioned:** Dispatched when a task is moved to `OPEN`, `ON_HOLD`, or `CLOSED`.
3. **Task Reassigned:** Dispatched when the assignee changes.

### 4. User Interaction
- Clicking the **"View Ticket"** button on the bottom toast:
  - If already on the Task Manager board: directly focuses the card and slides open the Task Detail & History drawer.
  - If on another portal/page: navigates to `/dash/hr/hrdashboard/task-manager?taskId={id}` (or employee taskbox) and opens the drawer.

---

## Technical Architecture

### Backend & Database
- Stored procedure or repository method `dbo.usp_HR_Task_DispatchNotification`:
  - Resolves stakeholder employee IDs (Assignee, Target Dept HOD, Assignee's Reporting Manager, Creator).
  - Deduplicates IDs so a user never receives redundant notifications if they hold multiple roles (e.g. Creator is also HOD).
  - Inserts notification records with title, summary, `TaskId`, and timestamp into notification tables.
- Invoked seamlessly inside `TaskManagerController` or repository upon:
  - `CreateTaskAsync`
  - `UpdateStatusAndRemarksAsync`
  - `UpdateTaskDetailsAsync`

### Frontend UI
- **Animated Toast Service & Component:**
  - `TaskToastNotificationComponent`: standalone or singleton overlay at bottom-center.
  - CSS animations: `@keyframes toastSlideUp` and `@keyframes toastFadeDown`.
  - Audio synthesizer: `AudioContext` 2-tone melodic chime (440Hz -> 880Hz sine wave, soft decay).
  - Action button: `View Ticket` with task code badge.

