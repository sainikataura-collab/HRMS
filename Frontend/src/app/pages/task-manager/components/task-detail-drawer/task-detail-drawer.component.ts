import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import {
  TaskManagerService,
  TaskCardDto,
  TaskHistoryItemDto,
  TaskDetailDto
} from '../../../../shared/services/task-manager.service';

@Component({
  selector: 'app-task-detail-drawer',
  standalone: true,
  imports: [CommonModule, FormsModule, NgSelectModule],
  templateUrl: './task-detail-drawer.component.html',
  styleUrls: ['./task-detail-drawer.component.scss']
})
export class TaskDetailDrawerComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() taskId: number | null = null;

  @Output() closed = new EventEmitter<void>();
  @Output() taskUpdated = new EventEmitter<void>();

  isLoading = false;
  isUpdatingStatus = false;
  task: TaskCardDto | null = null;
  history: TaskHistoryItemDto[] = [];

  selectedNewStatus = '';
  statusRemarks = '';
  errorMessage = '';
  copySuccess = false;

  readonly statusOptions = [
    { id: 'OPEN', label: 'OPEN' },
    { id: 'CLOSED', label: 'CLOSED' },
    { id: 'ON HOLD', label: 'ON HOLD' }
  ];

  constructor(public taskManagerService: TaskManagerService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] && this.isOpen && this.taskId) {
      this.loadDetails();
    } else if (changes['taskId'] && this.isOpen && this.taskId) {
      this.loadDetails();
    }
  }

  loadDetails(): void {
    if (!this.taskId) return;
    this.isLoading = true;
    this.errorMessage = '';

    this.taskManagerService.getTaskById(this.taskId).subscribe({
      next: (res: TaskDetailDto) => {
        this.task = res.task;
        this.history = res.history || [];
        this.selectedNewStatus = this.task?.status || 'OPEN';
        this.statusRemarks = '';
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load task details', err);
        this.errorMessage = 'Could not load task details.';
        this.isLoading = false;
      }
    });
  }

  onUpdateStatus(): void {
    if (!this.task) return;

    const trimmedRemarks = (this.statusRemarks || '').trim();
    const isTargetClosedOrHold = this.selectedNewStatus === 'CLOSED' || this.selectedNewStatus === 'ON HOLD';

    if (isTargetClosedOrHold && !trimmedRemarks) {
      this.errorMessage = `Remarks are mandatory when changing status to "${this.selectedNewStatus}".`;
      return;
    }

    if (this.selectedNewStatus === this.task.status && !trimmedRemarks) {
      this.errorMessage = 'Please provide remarks to add a comment without status change.';
      return;
    }

    this.isUpdatingStatus = true;
    this.errorMessage = '';

    const req = {
      taskId: this.task.taskId,
      newStatus: this.selectedNewStatus,
      remarks: trimmedRemarks,
      updatedByEmpId: this.taskManagerService.currentUserId,
      updatedByName: this.taskManagerService.currentUserName
    };

    this.taskManagerService.updateStatusAndRemarks(req).subscribe({
      next: () => {
        this.isUpdatingStatus = false;
        this.statusRemarks = '';
        this.taskUpdated.emit();
        this.loadDetails();
      },
      error: (err) => {
        console.error('Failed to update status from drawer', err);
        this.errorMessage = 'Could not update status. Please try again.';
        this.isUpdatingStatus = false;
      }
    });
  }

  copyCode(): void {
    if (!this.task?.taskCode) return;
    navigator.clipboard.writeText(this.task.taskCode).then(() => {
      this.copySuccess = true;
      setTimeout(() => (this.copySuccess = false), 2000);
    });
  }

  onClose(): void {
    this.task = null;
    this.history = [];
    this.errorMessage = '';
    this.statusRemarks = '';
    this.closed.emit();
  }
}

