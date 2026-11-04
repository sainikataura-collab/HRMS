import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import {
  TaskManagerService,
  DepartmentLookupItem,
  EmployeeLookupItem,
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
export class CreateTaskModalComponent implements OnInit {
  @Input() isOpen = false;
  @Input() departments: DepartmentLookupItem[] = [];
  @Input() employees: EmployeeLookupItem[] = [];

  @Output() taskCreated = new EventEmitter<any>();
  @Output() cancelled = new EventEmitter<void>();

  isSubmitting = false;
  isUploadingAttachment = false;
  errorMessage = '';

  // Core Form Fields
  subject = '';
  description = '';
  departmentId: string | null = null;
  assignedToEmpId: string | null = null;
  isAssignToSelf = false;
  priority = 'MEDIUM';
  deadlineDate = '';

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

  // Attachment
  attachmentFileName = '';
  attachmentUrl = '';

  readonly priorityOptions = [
    { id: 'HIGH', label: 'High Priority', icon: 'fa-solid fa-arrow-up text-danger' },
    { id: 'MEDIUM', label: 'Medium Priority', icon: 'fa-solid fa-minus text-warning' },
    { id: 'LOW', label: 'Low Priority', icon: 'fa-solid fa-arrow-down text-info' }
  ];

  readonly dayOfMonthOptions: number[] = Array.from({ length: 28 }, (_, i) => i + 1);

  constructor(public taskManagerService: TaskManagerService) {}

  ngOnInit(): void {
    this.setDefaultDeadline();
  }

  private setDefaultDeadline(): void {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    nextWeek.setHours(18, 0, 0, 0);
    // Format YYYY-MM-DDTHH:mm
    const pad = (n: number) => n.toString().padStart(2, '0');
    this.deadlineDate = `${nextWeek.getFullYear()}-${pad(nextWeek.getMonth() + 1)}-${pad(nextWeek.getDate())}T${pad(nextWeek.getHours())}:${pad(nextWeek.getMinutes())}`;
  }

  toggleAssignToSelf(): void {
    this.isAssignToSelf = !this.isAssignToSelf;
    if (this.isAssignToSelf) {
      const currentId = this.taskManagerService.currentUserId;
      if (currentId) {
        this.assignedToEmpId = currentId;
      }
    } else {
      this.assignedToEmpId = null;
    }
  }

  setRecurrencePattern(pattern: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY'): void {
    this.recurrencePattern = pattern;
  }

  toggleDayOfWeek(day: WeekDayItem): void {
    day.selected = !day.selected;
    // Ensure at least one day is selected
    if (!this.recurrenceDaysOfWeek.some(d => d.selected)) {
      day.selected = true;
    }
  }

  setEndType(endType: 'NEVER' | 'ON_DATE' | 'AFTER_COUNT'): void {
    this.recurrenceEndType = endType;
  }

  /**
   * Human-friendly live natural language summary of recurrence settings
   */
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

    return `${freqText}${endText}.`;
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
      this.errorMessage = 'Please enter a task subject.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const selectedDays = this.recurrenceDaysOfWeek
      .filter(d => d.selected)
      .map(d => d.id)
      .join(',');

    const payload: TaskCreateRequestDto = {
      subject: trimmedSubject,
      description: (this.description || '').trim() || undefined,
      departmentId: this.departmentId || undefined,
      assignedToEmpId: this.assignedToEmpId || undefined,
      priority: this.priority || 'MEDIUM',
      deadlineDate: this.deadlineDate || undefined,
      isRecurring: this.isRecurring,
      recurrencePattern: this.isRecurring ? this.recurrencePattern : undefined,
      recurrenceInterval: this.isRecurring ? Math.max(1, Number(this.recurrenceInterval) || 1) : undefined,
      recurrenceDays: (this.isRecurring && this.recurrencePattern === 'WEEKLY') ? selectedDays : undefined,
      recurrenceDayOfMonth: (this.isRecurring && this.recurrencePattern === 'MONTHLY') ? this.recurrenceDayOfMonth : undefined,
      recurrenceEndType: this.isRecurring ? this.recurrenceEndType : undefined,
      recurrenceEndDate: (this.isRecurring && this.recurrenceEndType === 'ON_DATE' && this.recurrenceEndDate) ? this.recurrenceEndDate : undefined,
      recurrenceOccurrencesTotal: (this.isRecurring && this.recurrenceEndType === 'AFTER_COUNT') ? Number(this.recurrenceOccurrencesTotal) || 10 : undefined,
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
    this.attachmentFileName = '';
    this.attachmentUrl = '';
    this.errorMessage = '';
    this.isSubmitting = false;
    this.isUploadingAttachment = false;
  }
}
