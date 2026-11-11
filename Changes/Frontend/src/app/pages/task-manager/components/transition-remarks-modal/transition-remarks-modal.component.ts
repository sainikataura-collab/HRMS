import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskCardDto } from '../../../../shared/services/task-manager.service';

@Component({
  selector: 'app-transition-remarks-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './transition-remarks-modal.component.html',
  styleUrls: ['./transition-remarks-modal.component.scss']
})
export class TransitionRemarksModalComponent {
  @Input() isOpen = false;
  @Input() task: TaskCardDto | null = null;
  @Input() fromStatus = '';
  @Input() toStatus = '';
  @Input() isSubmitting = false;

  @Output() confirmed = new EventEmitter<{ remarks: string }>();
  @Output() cancelled = new EventEmitter<void>();

  remarks = '';
  errorMessage = '';

  get isRemarksRequired(): boolean {
    const target = (this.toStatus || '').toUpperCase().trim();
    return target === 'CLOSED' || target === 'ON HOLD' || target === 'ON_HOLD';
  }

  get fromStatusBadgeClass(): string {
    return this.getStatusBadgeClass(this.fromStatus);
  }

  get toStatusBadgeClass(): string {
    return this.getStatusBadgeClass(this.toStatus);
  }

  private getStatusBadgeClass(status: string): string {
    const s = (status || '').toUpperCase().trim();
    if (s === 'OPEN') return 'badge-status-open';
    if (s === 'CLOSED') return 'badge-status-closed';
    if (s === 'ON HOLD' || s === 'ON_HOLD') return 'badge-status-onhold';
    return 'badge-status-default';
  }

  onConfirm(): void {
    const trimmed = (this.remarks || '').trim();
    if (this.isRemarksRequired && !trimmed) {
      this.errorMessage = `Remarks are mandatory when setting status to "${this.toStatus}".`;
      return;
    }

    this.errorMessage = '';
    this.confirmed.emit({ remarks: trimmed });
  }

  onCancel(): void {
    this.remarks = '';
    this.errorMessage = '';
    this.cancelled.emit();
  }
}

