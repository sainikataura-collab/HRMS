import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import {
  TaskManagerService,
  DepartmentLookupItem,
  EmployeeLookupItem,
  TaskCreateRequestDto
} from '../../../../shared/services/task-manager.service';

@Component({
  selector: 'app-create-task-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, NgSelectModule],
  templateUrl: './create-task-modal.component.html',
  styleUrls: ['./create-task-modal.component.scss']
})
export class CreateTaskModalComponent {
  @Input() isOpen = false;
  @Input() departments: DepartmentLookupItem[] = [];
  @Input() employees: EmployeeLookupItem[] = [];

  @Output() taskCreated = new EventEmitter<any>();
  @Output() cancelled = new EventEmitter<void>();

  isSubmitting = false;
  isUploadingAttachment = false;
  errorMessage = '';

  // Form Fields
  subject = '';
  description = '';
  departmentId: string | null = null;
  assignedToEmpId: string | null = null;
  isAssignToSelf = false;
  priority = 'MEDIUM';
  deadlineDate = '';

  // Recurrence
  isRecurring = false;
  recurrencePattern = 'WEEKLY';
  recurrenceInterval = 1;
  recurrenceEndDate = '';

  // Attachment
  attachmentFileName = '';
  attachmentUrl = '';

  readonly priorityOptions = [
    { id: 'HIGH', label: 'High Priority' },
    { id: 'MEDIUM', label: 'Medium Priority' },
    { id: 'LOW', label: 'Low Priority' }
  ];

  readonly recurrenceOptions = [
    { id: 'DAILY', label: 'Daily' },
    { id: 'WEEKLY', label: 'Weekly' },
    { id: 'MONTHLY', label: 'Monthly' },
    { id: 'YEARLY', label: 'Yearly' }
  ];

  constructor(public taskManagerService: TaskManagerService) {}

  onAssignToSelfChange(): void {
    if (this.isAssignToSelf) {
      const currentId = this.taskManagerService.currentUserId;
      if (currentId) {
        this.assignedToEmpId = currentId;
      }
    } else {
      this.assignedToEmpId = null;
    }
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

    const payload: TaskCreateRequestDto = {
      subject: trimmedSubject,
      description: (this.description || '').trim() || undefined,
      departmentId: this.departmentId || undefined,
      assignedToEmpId: this.assignedToEmpId || undefined,
      priority: this.priority || 'MEDIUM',
      deadlineDate: this.deadlineDate || undefined,
      isRecurring: this.isRecurring,
      recurrencePattern: this.isRecurring ? this.recurrencePattern : undefined,
      recurrenceInterval: this.isRecurring ? Number(this.recurrenceInterval) || 1 : undefined,
      recurrenceEndDate: (this.isRecurring && this.recurrenceEndDate) ? this.recurrenceEndDate : undefined,
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
        this.errorMessage = 'Could not create task. Please try again.';
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
    this.deadlineDate = '';
    this.isRecurring = false;
    this.recurrencePattern = 'WEEKLY';
    this.recurrenceInterval = 1;
    this.recurrenceEndDate = '';
    this.attachmentFileName = '';
    this.attachmentUrl = '';
    this.errorMessage = '';
    this.isSubmitting = false;
    this.isUploadingAttachment = false;
  }
}

