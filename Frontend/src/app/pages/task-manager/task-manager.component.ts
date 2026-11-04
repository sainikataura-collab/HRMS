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
    { id: 'CREATED_BY_ME', label: 'Created by Me', icon: 'fa-solid fa-pen-nib' }
  ];

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

  // 3 Kanban Columns
  openTasks: TaskCardDto[] = [];
  closedTasks: TaskCardDto[] = [];
  onHoldTasks: TaskCardDto[] = [];

  // Drag and Drop / Quick Action Remarks Modal State
  isRemarksModalOpen = false;
  pendingDropEvent: CdkDragDrop<TaskCardDto[]> | null = null;
  pendingTask: TaskCardDto | null = null;
  pendingFromStatus = '';
  pendingToStatus = '';

  // Create Task Modal State
  isCreateModalOpen = false;

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
    return [...this.openTasks, ...this.onHoldTasks, ...this.closedTasks];
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
    const filter: TaskBoardFilterDto = {
      scope: this.selectedScope || 'ALL',
      departmentId: this.selectedDepartmentId || undefined,
      assignedToEmpId: this.selectedAssigneeId || undefined,
      priority: this.selectedPriority || undefined,
      recurrencePattern: this.selectedRecurrence || undefined,
      taskTypeId: this.selectedTaskTypeId || undefined,
      searchKeyword: (this.searchKeyword || '').trim() || undefined,
      filterCard: this.activeFilterCard || 'ALL'
    };

    this.taskManagerService.getBoard(filter)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: TaskBoardResponseDto) => {
          this.counts = res.counts || {
            allTasks: 0,
            openTasks: 0,
            closedTasks: 0,
            onHoldTasks: 0,
            unassignedTasks: 0,
            overdueTasks: 0
          };
          this.openTasks = res.openTasks || [];
          this.closedTasks = res.closedTasks || [];
          this.onHoldTasks = res.onHoldTasks || [];
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Failed to load task board', err);
          this.isLoading = false;
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

  getTaskTypeIcon(typeName?: string): string {
    const t = (typeName || '').toUpperCase();
    if (t.includes('COMPLIANCE')) return 'fa-solid fa-shield-halved text-success';
    if (t.includes('AUDIT')) return 'fa-solid fa-magnifying-glass-chart text-primary';
    if (t.includes('OPERAT')) return 'fa-solid fa-gears text-warning';
    if (t.includes('PAYROLL')) return 'fa-solid fa-money-check-dollar text-info';
    return 'fa-solid fa-folder-tree text-secondary';
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
   * Open task creation modal
   */
  onCreateTaskClick(): void {
    this.isCreateModalOpen = true;
    this.openCreateModal.emit();
  }

  onTaskCreated(event: any): void {
    this.isCreateModalOpen = false;
    this.loadBoard();
  }

  onCreateModalCancelled(): void {
    this.isCreateModalOpen = false;
  }
}
