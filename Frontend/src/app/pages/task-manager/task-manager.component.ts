import { Component, EventEmitter, OnInit, Output, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
  transferArrayItem
} from '@angular/cdk/drag-drop';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import {
  TaskManagerService,
  TaskBoardFilterDto,
  TaskBoardResponseDto,
  TaskCardDto,
  TaskSummaryCountDto,
  DepartmentLookupItem,
  EmployeeLookupItem,
  TaskTypeLookupItem
} from '../../shared/services/task-manager.service';
import { TransitionRemarksModalComponent } from './components/transition-remarks-modal/transition-remarks-modal.component';
import { CreateTaskModalComponent } from './components/create-task-modal/create-task-modal.component';
import { TaskDetailDrawerComponent } from './components/task-detail-drawer/task-detail-drawer.component';

@Component({
  selector: 'app-task-manager',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgSelectModule,
    DragDropModule,
    TransitionRemarksModalComponent,
    CreateTaskModalComponent,
    TaskDetailDrawerComponent
  ],
  templateUrl: './task-manager.component.html',
  styleUrls: ['./task-manager.component.scss']
})
export class TaskManagerComponent implements OnInit, OnDestroy {
  @Output() taskSelected = new EventEmitter<TaskCardDto>();
  @Output() openCreateModal = new EventEmitter<void>();

  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  // View Mode: KANBAN or TABLE Directory
  viewMode: 'KANBAN' | 'TABLE' = 'KANBAN';

  // Loading states
  isLoading = false;
  isLookupsLoading = false;
  isUpdatingStatus = false;
  isSearchingBoardEmployees = false;

  // KPI Summary Counts
  counts: TaskSummaryCountDto = {
    allTasks: 0,
    openTasks: 0,
    closedTasks: 0,
    onHoldTasks: 0,
    unassignedTasks: 0,
    overdueTasks: 0
  };

  // Active KPI Filter Card
  activeFilterCard: string = 'ALL';

  // Multi-Filter Bar Models
  selectedScope: string = 'ALL';
  selectedDepartmentId: string | null = null;
  selectedAssigneeId: string | null = null;
  selectedPriority: string | null = null;
  selectedRecurrence: string | null = null;
  selectedTaskTypeId: number | null = null;
  searchKeyword: string = '';

  // Lookups data
  departments: DepartmentLookupItem[] = [];
  employees: EmployeeLookupItem[] = [];
  boardEmployees: EmployeeLookupItem[] = [];
  taskTypes: TaskTypeLookupItem[] = [];
  viewerContext: any = null;

  readonly scopeOptions = [
    { id: 'ALL', label: 'All Viewable', icon: 'fa-solid fa-globe' },
    { id: 'MY_ASSIGNED', label: 'Assigned to Me', icon: 'fa-solid fa-user-check' },
    { id: 'MY_DEPT', label: 'My Department', icon: 'fa-solid fa-building-user' },
    { id: 'CREATED_BY_ME', label: 'Created by Me', icon: 'fa-solid fa-pen-nib' },
    { id: 'RECURRING', label: 'Recurring Cadences', icon: 'fa-solid fa-arrows-rotate' }
  ];

  get visibleScopeOptions() {
    return this.scopeOptions.filter(s => {
      if (s.id === 'MY_DEPT') {
        return !!(this.viewerContext?.isAdmin || this.viewerContext?.isHod);
      }
      return true;
    });
  }

  readonly priorityOptions = [
    { id: 'HIGH', label: 'High Priority' },
    { id: 'MEDIUM', label: 'Medium Priority' },
    { id: 'LOW', label: 'Low Priority' }
  ];

  readonly recurrenceOptions = [
    { id: 'DAILY', label: 'Daily Recurring' },
    { id: 'WEEKLY', label: 'Weekly Recurring' },
    { id: 'MONTHLY', label: 'Monthly Recurring' },
    { id: 'YEARLY', label: 'Yearly Recurring' }
  ];

  // Dedicated Recurring Cadences View & Filter Models
  recurringFrequencyFilter: string = 'ALL';
  recurringSearchKeyword: string = '';
  recurringViewMode: 'CARDS' | 'LIST' = 'LIST';

  readonly recurringFrequencyOptions = [
    { id: 'ALL', label: 'All' },
    { id: 'DAILY', label: 'Daily' },
    { id: 'WEEKLY', label: 'Weekly' },
    { id: 'MONTHLY', label: 'Monthly' },
    { id: 'YEARLY', label: 'Yearly' }
  ];

  get filteredRecurringTasks(): TaskCardDto[] {
    return (this.recurringTasks || []).filter((task: TaskCardDto) => {
      if (this.recurringFrequencyFilter !== 'ALL') {
        if ((task.recurrencePattern || '').toUpperCase() !== this.recurringFrequencyFilter) {
          return false;
        }
      }
      if (this.recurringSearchKeyword && this.recurringSearchKeyword.trim()) {
        const kw = this.recurringSearchKeyword.trim().toLowerCase();
        const sub = (task.subject || '').toLowerCase();
        const code = (task.taskCode || '').toLowerCase();
        const emp = (task.assignedToEmpName || '').toLowerCase();
        const dept = (task.departmentName || '').toLowerCase();
        if (!sub.includes(kw) && !code.includes(kw) && !emp.includes(kw) && !dept.includes(kw)) {
          return false;
        }
      }
      return true;
    });
  }

  get dailyCount(): number {
    return (this.recurringTasks || []).filter(t => (t.recurrencePattern || '').toUpperCase() === 'DAILY').length;
  }

  get weeklyCount(): number {
    return (this.recurringTasks || []).filter(t => (t.recurrencePattern || '').toUpperCase() === 'WEEKLY').length;
  }

  get monthlyCount(): number {
    return (this.recurringTasks || []).filter(t => (t.recurrencePattern || '').toUpperCase() === 'MONTHLY').length;
  }

  get yearlyCount(): number {
    return (this.recurringTasks || []).filter(t => (t.recurrencePattern || '').toUpperCase() === 'YEARLY').length;
  }

  setRecurringFrequency(freq: string): void {
    this.recurringFrequencyFilter = freq;
  }

  toggleRecurringViewMode(): void {
    this.recurringViewMode = this.recurringViewMode === 'LIST' ? 'CARDS' : 'LIST';
  }

  // 3 Execution Kanban Columns + 1 Dedicated Recurring Cadence Pane
  openTasks: TaskCardDto[] = [];
  closedTasks: TaskCardDto[] = [];
  onHoldTasks: TaskCardDto[] = [];
  recurringTasks: TaskCardDto[] = [];
  isTriggeringRecurrence = false;
  createModalDefaultRecurring = false;

  // Per-column pagination & infinite scroll state
  readonly pageSize = 10;
  openPage = 1;
  closedPage = 1;
  onHoldPage = 1;

  isLoadingMoreOpen = false;
  isLoadingMoreClosed = false;
  isLoadingMoreOnHold = false;

  hasMoreOpen = true;
  hasMoreClosed = true;
  hasMoreOnHold = true;

  // Drag and Drop / Quick Action Remarks Modal State
  isRemarksModalOpen = false;
  pendingDropEvent: CdkDragDrop<TaskCardDto[]> | null = null;
  pendingTask: TaskCardDto | null = null;
  pendingFromStatus = '';
  pendingToStatus = '';

  // Create Task Modal State
  isCreateModalOpen = false;
  editingTask: TaskCardDto | null = null;

  // Detail Drawer State
  isDetailDrawerOpen = false;
  selectedTaskId: number | null = null;

  constructor(public taskManagerService: TaskManagerService) {}

  ngOnInit(): void {
    this.loadLookups();
    this.loadBoard();

    // Debounce search input
    this.searchSubject.pipe(
      debounceTime(350),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.loadBoard();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get allFilteredTasks(): TaskCardDto[] {
    return [...this.openTasks, ...this.onHoldTasks, ...this.closedTasks, ...this.recurringTasks];
  }

  get hasActiveFilters(): boolean {
    return (
      this.activeFilterCard !== 'ALL' ||
      this.selectedScope !== 'ALL' ||
      !!this.selectedDepartmentId ||
      !!this.selectedAssigneeId ||
      !!this.selectedPriority ||
      !!this.selectedRecurrence ||
      !!this.selectedTaskTypeId ||
      !!(this.searchKeyword || '').trim()
    );
  }

  /**
   * Load departments, top 10 initial employees, and General Master task types
   */
  loadLookups(): void {
    this.isLookupsLoading = true;
    this.taskManagerService.getLookups()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.departments = res.departments || [];
          this.employees = (res.employees || []).slice(0, 10);
          this.boardEmployees = [...this.employees];
          this.taskTypes = res.taskTypes || [];
          this.viewerContext = res.viewerContext || res.data?.viewerContext || null;
          this.isLookupsLoading = false;
        },
        error: (err) => {
          console.error('Failed to load task lookups', err);
          this.isLookupsLoading = false;
        }
      });
  }

  /**
   * When Department filter changes on board, dynamically load that department's employees & reload board
   */
  onBoardDepartmentChange(): void {
    this.loadBoard();
    this.isSearchingBoardEmployees = true;
    this.taskManagerService.searchEmployees(this.selectedDepartmentId || undefined, undefined, 20)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (res && res.employees) {
            this.boardEmployees = res.employees;
          }
          this.isSearchingBoardEmployees = false;
        },
        error: () => {
          this.isSearchingBoardEmployees = false;
        }
      });
  }

  /**
   * Type-ahead employee search on the main board toolbar
   */
  onBoardEmployeeSearch(event: { term: string; items: any[] }): void {
    const term = (event.term || '').trim();
    if (term.length < 2) return;

    this.isSearchingBoardEmployees = true;
    this.taskManagerService.searchEmployees(this.selectedDepartmentId || undefined, term, 20)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (res && res.employees) {
            this.boardEmployees = res.employees;
          }
          this.isSearchingBoardEmployees = false;
        },
        error: () => {
          this.isSearchingBoardEmployees = false;
        }
      });
  }

  /**
   * Load board columns and KPI counts matching active filters
   */
  loadBoard(): void {
    this.isLoading = true;
    this.openPage = 1;
    this.closedPage = 1;
    this.onHoldPage = 1;
    this.isLoadingMoreOpen = false;
    this.isLoadingMoreClosed = false;
    this.isLoadingMoreOnHold = false;
    this.hasMoreOpen = true;
    this.hasMoreClosed = true;
    this.hasMoreOnHold = true;

    const filterScope = this.selectedScope === 'RECURRING' ? 'ALL' : (this.selectedScope || 'ALL');
    const filter: TaskBoardFilterDto = {
      scope: filterScope,
      departmentId: this.selectedDepartmentId || undefined,
      assignedToEmpId: this.selectedAssigneeId || undefined,
      priority: this.selectedPriority || undefined,
      recurrencePattern: this.selectedRecurrence || undefined,
      taskTypeId: this.selectedTaskTypeId || undefined,
      searchKeyword: (this.searchKeyword || '').trim() || undefined,
      filterCard: this.activeFilterCard || 'ALL',
      pageSize: this.pageSize
    };

    this.taskManagerService.getBoard(filter)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: TaskBoardResponseDto) => {
          this.viewerContext = res.viewer || this.viewerContext;
          this.counts = res.counts || {
            allTasks: 0,
            openTasks: 0,
            closedTasks: 0,
            onHoldTasks: 0,
            unassignedTasks: 0,
            overdueTasks: 0
          };
          // Filter 3 Kanban execution columns for standard/instance tasks
          this.openTasks = (res.openTasks || []).filter(t => !t.isRecurring);
          this.closedTasks = (res.closedTasks || []).filter(t => !t.isRecurring);
          this.onHoldTasks = (res.onHoldTasks || []).filter(t => !t.isRecurring);

          // Track whether more pages exist for each column
          this.hasMoreOpen = (res.openTasks || []).length >= this.pageSize;
          this.hasMoreClosed = (res.closedTasks || []).length >= this.pageSize;
          this.hasMoreOnHold = (res.onHoldTasks || []).length >= this.pageSize;

          // Dedicated 4th pane for Recurring Cadences / Automation rules
          const all: TaskCardDto[] = res.allTasks || [
            ...(res.openTasks || []),
            ...(res.closedTasks || []),
            ...(res.onHoldTasks || [])
          ];
          this.recurringTasks = all.filter((t: TaskCardDto) => t.isRecurring);
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Failed to load task board', err);
          this.isLoading = false;
        }
      });
  }

  /**
   * Independent Column Scroll event handler - triggers lazy-loading next 10 tasks when nearing bottom
   */
  onColumnScroll(column: 'OPEN' | 'CLOSED' | 'ON_HOLD', event: Event): void {
    const el = event.target as HTMLElement;
    if (!el) return;

    const threshold = 40;
    const reachedBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - threshold;
    if (!reachedBottom) return;

    if (column === 'OPEN') {
      if (this.isLoadingMoreOpen || !this.hasMoreOpen || this.isLoading) return;
      this.loadMoreColumnTasks('OPEN');
    } else if (column === 'ON_HOLD') {
      if (this.isLoadingMoreOnHold || !this.hasMoreOnHold || this.isLoading) return;
      this.loadMoreColumnTasks('ON_HOLD');
    } else if (column === 'CLOSED') {
      if (this.isLoadingMoreClosed || !this.hasMoreClosed || this.isLoading) return;
      this.loadMoreColumnTasks('CLOSED');
    }
  }

  /**
   * Fetch next page of tasks for a specific column and append
   */
  loadMoreColumnTasks(column: 'OPEN' | 'CLOSED' | 'ON_HOLD'): void {
    let nextPage = 1;
    if (column === 'OPEN') {
      this.isLoadingMoreOpen = true;
      nextPage = this.openPage + 1;
    } else if (column === 'ON_HOLD') {
      this.isLoadingMoreOnHold = true;
      nextPage = this.onHoldPage + 1;
    } else if (column === 'CLOSED') {
      this.isLoadingMoreClosed = true;
      nextPage = this.closedPage + 1;
    }

    const filterScope = this.selectedScope === 'RECURRING' ? 'ALL' : (this.selectedScope || 'ALL');
    const filter: TaskBoardFilterDto = {
      scope: filterScope,
      departmentId: this.selectedDepartmentId || undefined,
      assignedToEmpId: this.selectedAssigneeId || undefined,
      priority: this.selectedPriority || undefined,
      recurrencePattern: this.selectedRecurrence || undefined,
      taskTypeId: this.selectedTaskTypeId || undefined,
      searchKeyword: (this.searchKeyword || '').trim() || undefined,
      filterCard: this.activeFilterCard || 'ALL',
      targetStatus: column,
      pageIndex: nextPage,
      pageSize: this.pageSize
    };

    this.taskManagerService.getColumnTasks(filter)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: { isSuccess: boolean; tasks: TaskCardDto[]; pageIndex: number; pageSize: number; hasMore: boolean }) => {
          const nonRecurring: TaskCardDto[] = (res?.tasks || []).filter((t: TaskCardDto) => !t.isRecurring);
          const hasMore: boolean = res?.hasMore !== undefined ? res.hasMore : (nonRecurring.length >= this.pageSize);

          if (column === 'OPEN') {
            this.openPage = nextPage;
            this.isLoadingMoreOpen = false;
            const existingIds = new Set(this.openTasks.map(t => t.taskId));
            const newTasks = nonRecurring.filter((t: TaskCardDto) => !existingIds.has(t.taskId));
            this.openTasks = [...this.openTasks, ...newTasks];
            this.hasMoreOpen = hasMore;
          } else if (column === 'ON_HOLD') {
            this.onHoldPage = nextPage;
            this.isLoadingMoreOnHold = false;
            const existingIds = new Set(this.onHoldTasks.map(t => t.taskId));
            const newTasks = nonRecurring.filter((t: TaskCardDto) => !existingIds.has(t.taskId));
            this.onHoldTasks = [...this.onHoldTasks, ...newTasks];
            this.hasMoreOnHold = hasMore;
          } else if (column === 'CLOSED') {
            this.closedPage = nextPage;
            this.isLoadingMoreClosed = false;
            const existingIds = new Set(this.closedTasks.map(t => t.taskId));
            const newTasks = nonRecurring.filter((t: TaskCardDto) => !existingIds.has(t.taskId));
            this.closedTasks = [...this.closedTasks, ...newTasks];
            this.hasMoreClosed = hasMore;
          }
        },
        error: (err: any) => {
          console.error(`Failed to load more ${column} tasks`, err);
          if (column === 'OPEN') this.isLoadingMoreOpen = false;
          if (column === 'ON_HOLD') this.isLoadingMoreOnHold = false;
          if (column === 'CLOSED') this.isLoadingMoreClosed = false;
        }
      });
  }

  /**
   * KPI Card 1-click filter toggle
   */
  onSelectKpiCard(cardKey: string): void {
    if (this.activeFilterCard === cardKey && cardKey !== 'ALL') {
      this.activeFilterCard = 'ALL';
    } else {
      this.activeFilterCard = cardKey;
    }
    this.loadBoard();
  }

  selectTaskTypeChip(typeId: number | null): void {
    this.selectedTaskTypeId = this.selectedTaskTypeId === typeId ? null : typeId;
    this.loadBoard();
  }

  selectScopeChip(scopeId: string): void {
    this.selectedScope = scopeId;
    this.loadBoard();
  }

  setScope(scopeId: string): void {
    this.selectScopeChip(scopeId);
  }

  isDueToday(deadlineStr?: string): boolean {
    if (!deadlineStr) return false;
    const due = new Date(deadlineStr);
    if (isNaN(due.getTime())) return false;
    const today = new Date();
    return (
      due.getFullYear() === today.getFullYear() &&
      due.getMonth() === today.getMonth() &&
      due.getDate() === today.getDate()
    );
  }

  isBreachingToday(task: TaskCardDto): boolean {
    if (!task || task.status === 'CLOSED') return false;
    return this.isDueToday(task.deadlineDate);
  }

  getTaskTypeIcon(typeName?: string): string {
    const t = (typeName || '').toUpperCase();
    if (t.includes('COMPLIANCE')) return 'fa-solid fa-shield-halved text-success';
    if (t.includes('AUDIT')) return 'fa-solid fa-magnifying-glass-chart text-primary';
    if (t.includes('OPERAT')) return 'fa-solid fa-gears text-warning';
    if (t.includes('PAYROLL')) return 'fa-solid fa-money-check-dollar text-info';
    return 'fa-solid fa-folder-tree text-secondary';
  }

  getInitials(name?: string): string {
    if (!name || !name.trim()) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return parts[0].substring(0, 2).toUpperCase();
  }

  onSearchChange(): void {
    this.searchSubject.next(this.searchKeyword);
  }

  onFilterChange(): void {
    this.loadBoard();
  }

  resetFilters(): void {
    this.selectedScope = 'ALL';
    this.selectedDepartmentId = null;
    this.selectedAssigneeId = null;
    this.selectedPriority = null;
    this.selectedRecurrence = null;
    this.selectedTaskTypeId = null;
    this.searchKeyword = '';
    this.activeFilterCard = 'ALL';
    this.boardEmployees = [...this.employees];
    this.loadBoard();
  }

  /**
   * CDK Drag and Drop handler for columns
   */
  onCardDrop(event: CdkDragDrop<TaskCardDto[]>, targetStatus: string): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      return;
    }

    const movedTask = event.previousContainer.data[event.previousIndex];
    if (!movedTask) return;

    this.pendingDropEvent = event;
    this.pendingTask = movedTask;
    this.pendingFromStatus = movedTask.status || 'OPEN';
    this.pendingToStatus = targetStatus;
    this.isRemarksModalOpen = true;
  }

  /**
   * 1-Click Quick Status Transition from Card or Table Action Button
   */
  quickTransition(task: TaskCardDto, targetStatus: string, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    if (!task || task.status === targetStatus) return;

    this.pendingDropEvent = null;
    this.pendingTask = task;
    this.pendingFromStatus = task.status || 'OPEN';
    this.pendingToStatus = targetStatus;
    this.isRemarksModalOpen = true;
  }

  /**
   * Confirmed transition from remarks modal
   */
  onRemarksConfirmed(result: { remarks: string }): void {
    if (!this.pendingTask) {
      this.closeRemarksModal();
      return;
    }

    this.isUpdatingStatus = true;
    const req = {
      taskId: this.pendingTask.taskId,
      newStatus: this.pendingToStatus,
      remarks: result.remarks,
      updatedByEmpId: this.taskManagerService.currentUserId,
      updatedByName: this.taskManagerService.currentUserName
    };

    this.taskManagerService.updateStatusAndRemarks(req)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          if (this.pendingDropEvent) {
            transferArrayItem(
              this.pendingDropEvent.previousContainer.data,
              this.pendingDropEvent.container.data,
              this.pendingDropEvent.previousIndex,
              this.pendingDropEvent.currentIndex
            );
          }
          if (this.pendingTask) {
            this.pendingTask.status = this.pendingToStatus;
            this.pendingTask.lastRemarks = result.remarks;
          }
          this.isUpdatingStatus = false;
          this.closeRemarksModal();
          this.loadBoard();
        },
        error: (err) => {
          console.error('Failed to update task status', err);
          alert('Could not update task status. Please try again.');
          this.isUpdatingStatus = false;
          this.closeRemarksModal();
        }
      });
  }

  /**
   * Cancel transition: keep card in original column
   */
  onRemarksCancelled(): void {
    this.closeRemarksModal();
  }

  private closeRemarksModal(): void {
    this.isRemarksModalOpen = false;
    this.pendingDropEvent = null;
    this.pendingTask = null;
    this.pendingFromStatus = '';
    this.pendingToStatus = '';
  }

  /**
   * Card click to open details drawer
   */
  onTaskClick(task: TaskCardDto): void {
    this.selectedTaskId = task.taskId;
    this.isDetailDrawerOpen = true;
    this.taskSelected.emit(task);
  }

  onDetailDrawerClosed(): void {
    this.isDetailDrawerOpen = false;
    this.selectedTaskId = null;
  }

  onDetailTaskUpdated(): void {
    this.loadBoard();
  }

  /**
   * Open task creation modal (standard one-time task)
   */
  onCreateTaskClick(): void {
    this.editingTask = null;
    this.createModalDefaultRecurring = false;
    this.isCreateModalOpen = true;
    this.openCreateModal.emit();
  }

  /**
   * Open task creation modal with recurring studio pre-activated
   */
  onCreateRecurringClick(): void {
    this.editingTask = null;
    this.createModalDefaultRecurring = true;
    this.isCreateModalOpen = true;
    this.openCreateModal.emit();
  }

  /**
   * Open task editor for a recurring task or standard task
   */
  onEditTaskClick(task: TaskCardDto, event?: Event): void {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    this.isDetailDrawerOpen = false;
    this.selectedTaskId = null;
    this.editingTask = { ...task };
    this.createModalDefaultRecurring = !!task.isRecurring;
    this.isCreateModalOpen = true;
  }

  /**
   * Trigger manual execution for a recurring schedule immediately
   */
  onRunRecurringNow(task: TaskCardDto, event?: Event): void {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    this.isTriggeringRecurrence = true;
    this.taskManagerService.processRecurringTasks(task.taskId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isTriggeringRecurrence = false;
          this.loadBoard();
        },
        error: (err) => {
          console.error('Failed to trigger recurring task', err);
          this.isTriggeringRecurrence = false;
          this.loadBoard();
        }
      });
  }

  onTaskCreated(event: any): void {
    this.isCreateModalOpen = false;
    this.editingTask = null;
    this.createModalDefaultRecurring = false;
    this.loadBoard();
  }

  onCreateModalCancelled(): void {
    this.isCreateModalOpen = false;
    this.editingTask = null;
    this.createModalDefaultRecurring = false;
  }
}
