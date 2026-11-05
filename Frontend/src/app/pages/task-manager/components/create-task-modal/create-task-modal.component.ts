import { Component, EventEmitter, Input, Output, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import {
  TaskManagerService,
  DepartmentLookupItem,
  EmployeeLookupItem,
  TaskTypeLookupItem,
  TaskCreateRequestDto
} from '../../../../shared/services/task-manager.service';

interface WeekDayItem {
  id: string;
  label: string;
  selected: boolean;
}

@Component({
  selector: 'app-create-task-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, NgSelectModule],
  templateUrl: './create-task-modal.component.html',
  styleUrls: ['./create-task-modal.component.scss']
})
export class CreateTaskModalComponent implements OnInit, OnChanges {
  @Input() isOpen = false;
  @Input() defaultRecurring = false;
  @Input() departments: DepartmentLookupItem[] = [];
  @Input() employees: EmployeeLookupItem[] = [];
  @Input() taskTypes: TaskTypeLookupItem[] = [];

  @Output() taskCreated = new EventEmitter<any>();
  @Output() cancelled = new EventEmitter<void>();

  isSubmitting = false;
  isUploadingAttachment = false;
  isSearchingEmployees = false;
  errorMessage = '';

  // Core Form Fields
  subject = '';
  description = '';
  departmentId: string | null = null;
  assignedToEmpId: string | null = null;
  isAssignToSelf = false;
  priority = 'MEDIUM';
  taskTypeId: number = 1;
  deadlineDate = '';

  // Dynamic filtered employee dropdown options (starts with top 10)
  displayEmployees: EmployeeLookupItem[] = [];

  // Advanced Recurrence Controls
  isRecurring = false;
  recurrencePattern: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY' = 'WEEKLY';
  recurrenceInterval = 1;
  recurrenceDaysOfWeek: WeekDayItem[] = [
    { id: 'MON', label: 'Mon', selected: true },
    { id: 'TUE', label: 'Tue', selected: false },
    { id: 'WED', label: 'Wed', selected: false },
    { id: 'THU', label: 'Thu', selected: false },
    { id: 'FRI', label: 'Fri', selected: false },
    { id: 'SAT', label: 'Sat', selected: false },
    { id: 'SUN', label: 'Sun', selected: false }
  ];
  recurrenceDayOfMonth = 1;
  recurrenceEndType: 'NEVER' | 'ON_DATE' | 'AFTER_COUNT' = 'NEVER';
  recurrenceEndDate = '';
  recurrenceOccurrencesTotal = 10;

  // Recurrence SLA Duration (How much time after generation the task is due)
  recurrenceDueOffsetValue = 1;
  recurrenceDueOffsetUnit: 'HOURS' | 'DAYS' = 'DAYS';

  // Attachment
  attachmentFileName = '';
  attachmentUrl = '';

  readonly priorityOptions = [
    { id: 'HIGH', label: 'High Priority', icon: 'fa-solid fa-arrow-up text-danger', badgeClass: 'bg-soft-danger text-danger' },
    { id: 'MEDIUM', label: 'Medium Priority', icon: 'fa-solid fa-minus text-warning', badgeClass: 'bg-soft-warning text-warning' },
    { id: 'LOW', label: 'Low Priority', icon: 'fa-solid fa-arrow-down text-info', badgeClass: 'bg-soft-info text-info' }
  ];

  readonly dayOfMonthOptions: number[] = Array.from({ length: 28 }, (_, i) => i + 1);

  constructor(public taskManagerService: TaskManagerService) {}

  ngOnInit(): void {
    this.setDefaultDeadline();
    this.initEmployees();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['employees'] && this.employees) {
      this.initEmployees();
    }
    if (changes['taskTypes'] && this.taskTypes && this.taskTypes.length > 0) {
      if (!this.taskTypeId) {
        this.taskTypeId = this.taskTypes[0].id;
      }
    }
    if (changes['isOpen'] && this.isOpen) {
      if (this.defaultRecurring) {
        this.isRecurring = true;
      }
    }
  }

  private initEmployees(): void {
    if (this.employees && this.employees.length > 0) {
      this.displayEmployees = this.employees.slice(0, 10);
    }
  }

  /**
   * When user selects a Department, dynamically fetch employees belonging to that department
   */
  onDepartmentChange(): void {
    this.isSearchingEmployees = true;
    const dept = this.departmentId || undefined;
    this.taskManagerService.searchEmployees(dept, undefined, 25).subscribe({
      next: (res) => {
        if (res && res.employees) {
          this.displayEmployees = res.employees;
        }
        this.isSearchingEmployees = false;
      },
      error: () => {
        this.isSearchingEmployees = false;
      }
    });
  }

  /**
   * On-demand type-ahead search for employees inside ng-select
   */
  onEmployeeSearch(event: { term: string; items: any[] }): void {
    const term = (event.term || '').trim();
    if (term.length < 2) return;

    this.isSearchingEmployees = true;
    this.taskManagerService.searchEmployees(this.departmentId || undefined, term, 20).subscribe({
      next: (res) => {
        if (res && res.employees) {
          this.displayEmployees = res.employees;
        }
        this.isSearchingEmployees = false;
      },
      error: () => {
        this.isSearchingEmployees = false;
      }
    });
  }

  private setDefaultDeadline(): void {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    nextWeek.setHours(18, 0, 0, 0);
    const pad = (n: number) => n.toString().padStart(2, '0');
    this.deadlineDate = `${nextWeek.getFullYear()}-${pad(nextWeek.getMonth() + 1)}-${pad(nextWeek.getDate())}T${pad(nextWeek.getHours())}:${pad(nextWeek.getMinutes())}`;
  }

  setDeadlinePreset(preset: 'TOMORROW' | '3DAYS' | 'NEXT_WEEK' | 'END_OF_MONTH'): void {
    const d = new Date();
    d.setHours(18, 0, 0, 0);

    if (preset === 'TOMORROW') {
      d.setDate(d.getDate() + 1);
    } else if (preset === '3DAYS') {
      d.setDate(d.getDate() + 3);
    } else if (preset === 'NEXT_WEEK') {
      d.setDate(d.getDate() + 7);
    } else if (preset === 'END_OF_MONTH') {
      d.setMonth(d.getMonth() + 1, 0);
    }

    const pad = (n: number) => n.toString().padStart(2, '0');
    this.deadlineDate = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  toggleAssignToSelf(): void {
    this.isAssignToSelf = !this.isAssignToSelf;
    if (this.isAssignToSelf) {
      const currentId = this.taskManagerService.currentUserId;
      if (currentId) {
        this.assignedToEmpId = currentId;
        // Ensure current user is in displayEmployees
        if (!this.displayEmployees.some(e => e.id === currentId)) {
          this.displayEmployees.unshift({
            id: currentId,
            name: this.taskManagerService.currentUserName,
            isHod: false
          });
        }
      }
    } else {
      this.assignedToEmpId = null;
    }
  }

  selectTaskType(typeId: number): void {
    this.taskTypeId = typeId;
  }

  get selectedTaskTypeName(): string {
    const found = this.taskTypes.find(t => t.id === this.taskTypeId);
    return found ? found.name : 'Compliance';
  }

  get selectedTaskTypeDescription(): string {
    const found = this.taskTypes.find(t => t.id === this.taskTypeId);
    return found?.description || 'Statutory, legal and operational workflow mandate';
  }

  get selectedDepartmentName(): string {
    if (!this.departmentId) return 'Cross-Department / General';
    const found = this.departments.find(d => d.id === this.departmentId);
    return found ? found.name : this.departmentId;
  }

  get selectedEmployeeName(): string {
    if (this.isAssignToSelf) {
      return `${this.taskManagerService.currentUserName} (Self)`;
    }
    if (!this.assignedToEmpId) return 'Unassigned (Open Queue)';
    const found = this.displayEmployees.find(e => e.id === this.assignedToEmpId)
      || this.employees.find(e => e.id === this.assignedToEmpId);
    return found ? found.name : this.assignedToEmpId;
  }

  getTaskTypeIcon(typeName?: string): string {
    const t = (typeName || '').toUpperCase();
    if (t.includes('COMPLIANCE')) return 'fa-solid fa-shield-halved text-success';
    if (t.includes('AUDIT')) return 'fa-solid fa-magnifying-glass-chart text-primary';
    if (t.includes('OPERAT')) return 'fa-solid fa-gears text-warning';
    if (t.includes('PAYROLL')) return 'fa-solid fa-money-check-dollar text-info';
    return 'fa-solid fa-folder-tree text-secondary';
  }

  setRecurrencePattern(pattern: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY'): void {
    this.recurrencePattern = pattern;
  }

  toggleDayOfWeek(day: WeekDayItem): void {
    day.selected = !day.selected;
    if (!this.recurrenceDaysOfWeek.some(d => d.selected)) {
      day.selected = true;
    }
  }

  setEndType(endType: 'NEVER' | 'ON_DATE' | 'AFTER_COUNT'): void {
    this.recurrenceEndType = endType;
  }

  setRecurrenceSlaPreset(val: number, unit: 'HOURS' | 'DAYS'): void {
    this.recurrenceDueOffsetValue = val;
    this.recurrenceDueOffsetUnit = unit;
  }

  get recurrenceSummary(): string {
    if (!this.isRecurring) return '';

    let freqText = '';
    const interval = Math.max(1, Number(this.recurrenceInterval) || 1);

    if (this.recurrencePattern === 'DAILY') {
      freqText = interval === 1 ? 'Repeats every day' : `Repeats every ${interval} days`;
    } else if (this.recurrencePattern === 'WEEKLY') {
      const selectedDays = this.recurrenceDaysOfWeek.filter(d => d.selected).map(d => d.label);
      const daysStr = selectedDays.length > 0 ? selectedDays.join(', ') : 'every week';
      freqText = interval === 1 ? `Repeats weekly on ${daysStr}` : `Repeats every ${interval} weeks on ${daysStr}`;
    } else if (this.recurrencePattern === 'MONTHLY') {
      freqText = interval === 1 
        ? `Repeats on day ${this.recurrenceDayOfMonth} of every month` 
        : `Repeats on day ${this.recurrenceDayOfMonth} every ${interval} months`;
    } else if (this.recurrencePattern === 'YEARLY') {
      freqText = interval === 1 ? 'Repeats yearly' : `Repeats every ${interval} years`;
    }

    let endText = '';
    if (this.recurrenceEndType === 'ON_DATE' && this.recurrenceEndDate) {
      endText = ` until ${this.recurrenceEndDate}`;
    } else if (this.recurrenceEndType === 'AFTER_COUNT' && this.recurrenceOccurrencesTotal) {
      endText = ` for ${this.recurrenceOccurrencesTotal} occurrences`;
    }

    const offsetVal = Math.max(1, Number(this.recurrenceDueOffsetValue) || 1);
    const slaText = this.recurrenceDueOffsetUnit === 'HOURS'
      ? `Each generated task is due within ${offsetVal} hour${offsetVal > 1 ? 's' : ''}`
      : `Each generated task is due within ${offsetVal} day${offsetVal > 1 ? 's' : ''}`;

    return `${freqText}${endText}. ${slaText}.`;
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files?.[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      this.errorMessage = 'Attachment file size exceeds 20MB limit.';
      return;
    }

    this.isUploadingAttachment = true;
    this.errorMessage = '';

    this.taskManagerService.uploadAttachment(file).subscribe({
      next: (res) => {
        this.attachmentFileName = res.fileName || file.name;
        this.attachmentUrl = res.fileUrl;
        this.isUploadingAttachment = false;
      },
      error: (err) => {
        console.error('Attachment upload failed', err);
        this.errorMessage = 'Failed to upload attachment. Please try again.';
        this.isUploadingAttachment = false;
      }
    });
  }

  removeAttachment(): void {
    this.attachmentFileName = '';
    this.attachmentUrl = '';
  }

  onSubmit(): void {
    const trimmedSubject = (this.subject || '').trim();
    if (!trimmedSubject) {
      this.errorMessage = 'Please enter a task subject / title.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const selectedDays = this.recurrenceDaysOfWeek
      .filter(d => d.selected)
      .map(d => d.id)
      .join(',');

    const selectedTypeObj = this.taskTypes.find(t => t.id === this.taskTypeId);

    const offsetHours = this.isRecurring
      ? (this.recurrenceDueOffsetUnit === 'HOURS'
          ? Math.max(1, Number(this.recurrenceDueOffsetValue) || 1)
          : Math.max(1, Number(this.recurrenceDueOffsetValue) || 1) * 24)
      : undefined;

    const payload: TaskCreateRequestDto = {
      subject: trimmedSubject,
      description: (this.description || '').trim() || undefined,
      departmentId: this.departmentId || undefined,
      assignedToEmpId: this.assignedToEmpId || undefined,
      priority: this.priority || 'MEDIUM',
      taskTypeId: this.taskTypeId || 1,
      taskTypeName: selectedTypeObj ? selectedTypeObj.name : 'Compliance',
      deadlineDate: this.deadlineDate || undefined,
      isRecurring: this.isRecurring,
      recurrencePattern: this.isRecurring ? this.recurrencePattern : undefined,
      recurrenceInterval: this.isRecurring ? Math.max(1, Number(this.recurrenceInterval) || 1) : undefined,
      recurrenceDays: (this.isRecurring && this.recurrencePattern === 'WEEKLY') ? selectedDays : undefined,
      recurrenceDayOfMonth: (this.isRecurring && this.recurrencePattern === 'MONTHLY') ? this.recurrenceDayOfMonth : undefined,
      recurrenceEndType: this.isRecurring ? this.recurrenceEndType : undefined,
      recurrenceEndDate: (this.isRecurring && this.recurrenceEndType === 'ON_DATE' && this.recurrenceEndDate) ? this.recurrenceEndDate : undefined,
      recurrenceOccurrencesTotal: (this.isRecurring && this.recurrenceEndType === 'AFTER_COUNT') ? Number(this.recurrenceOccurrencesTotal) || 10 : undefined,
      recurrenceDueOffsetHours: offsetHours,
      recurrenceDueOffsetUnit: this.isRecurring ? this.recurrenceDueOffsetUnit : undefined,
      attachmentUrl: this.attachmentUrl || undefined,
      attachmentFileName: this.attachmentFileName || undefined
    };

    this.taskManagerService.createTask(payload).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        this.resetForm();
        this.taskCreated.emit(res);
      },
      error: (err) => {
        console.error('Failed to create task', err);
        this.errorMessage = 'Could not create task. Please verify your connection.';
        this.isSubmitting = false;
      }
    });
  }

  onClose(): void {
    this.resetForm();
    this.cancelled.emit();
  }

  private resetForm(): void {
    this.subject = '';
    this.description = '';
    this.departmentId = null;
    this.assignedToEmpId = null;
    this.isAssignToSelf = false;
    this.priority = 'MEDIUM';
    this.setDefaultDeadline();
    this.isRecurring = false;
    this.recurrencePattern = 'WEEKLY';
    this.recurrenceInterval = 1;
    this.recurrenceDaysOfWeek.forEach((d, idx) => d.selected = idx === 0);
    this.recurrenceDayOfMonth = 1;
    this.recurrenceEndType = 'NEVER';
    this.recurrenceEndDate = '';
    this.recurrenceOccurrencesTotal = 10;
    this.recurrenceDueOffsetValue = 1;
    this.recurrenceDueOffsetUnit = 'DAYS';
    this.attachmentFileName = '';
    this.attachmentUrl = '';
    this.errorMessage = '';
    this.isSubmitting = false;
    this.isUploadingAttachment = false;
    this.initEmployees();
  }
}
