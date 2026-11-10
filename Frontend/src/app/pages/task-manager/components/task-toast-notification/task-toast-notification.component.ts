import { Component, EventEmitter, OnDestroy, OnInit, Output, NgZone, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { TaskToastItem, TaskToastService } from '../../../../shared/services/task-toast.service';

interface ActiveToast {
  data: TaskToastItem;
  timerId: any;
  remainingMs: number;
  timerStart: number;
  isPaused: boolean;
  isDismissing?: boolean;
}

@Component({
  selector: 'app-task-toast-notification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './task-toast-notification.component.html',
  styleUrls: ['./task-toast-notification.component.scss']
})
export class TaskToastNotificationComponent implements OnInit, OnDestroy {
  @Output() viewTicketRequested = new EventEmitter<number>();

  activeToasts: ActiveToast[] = [];
  private sub: Subscription | null = null;
  private readonly DEFAULT_DURATION = 5000;

  constructor(
    private toastService: TaskToastService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.sub = this.toastService.toast$.subscribe(item => {
      this.ngZone.run(() => {
        this.addToast(item);
        this.cdr.detectChanges();
      });
    });
  }

  ngOnDestroy(): void {
    if (this.sub) {
      this.sub.unsubscribe();
    }
    this.activeToasts.forEach(t => clearTimeout(t.timerId));
    this.activeToasts = [];
  }

  addToast(item: TaskToastItem): void {
    // Keep max 3 toasts stacked at once
    if (this.activeToasts.length >= 3) {
      const oldest = this.activeToasts[0];
      this.dismiss(oldest);
    }

    const toast: ActiveToast = {
      data: item,
      timerId: null,
      remainingMs: this.DEFAULT_DURATION,
      timerStart: Date.now(),
      isPaused: false
    };

    toast.timerId = setTimeout(() => {
      this.ngZone.run(() => {
        this.dismiss(toast);
      });
    }, this.DEFAULT_DURATION);

    this.activeToasts.push(toast);
    this.cdr.detectChanges();
  }

  pauseTimer(toast: ActiveToast): void {
    if (toast.isPaused || toast.isDismissing) return;
    clearTimeout(toast.timerId);
    toast.remainingMs -= (Date.now() - toast.timerStart);
    if (toast.remainingMs < 500) toast.remainingMs = 500;
    toast.isPaused = true;
    this.cdr.detectChanges();
  }

  resumeTimer(toast: ActiveToast): void {
    if (!toast.isPaused || toast.isDismissing) return;
    toast.isPaused = false;
    toast.timerStart = Date.now();
    toast.timerId = setTimeout(() => {
      this.ngZone.run(() => {
        this.dismiss(toast);
      });
    }, toast.remainingMs);
    this.cdr.detectChanges();
  }

  dismiss(toast: ActiveToast): void {
    if (toast.isDismissing) return;
    toast.isDismissing = true;
    clearTimeout(toast.timerId);
    this.cdr.detectChanges();

    // Allow CSS slide down and fade out animation
    setTimeout(() => {
      this.ngZone.run(() => {
        this.activeToasts = this.activeToasts.filter(t => t !== toast);
        this.cdr.detectChanges();
      });
    }, 280);
  }

  onViewTicket(toast: ActiveToast): void {
    this.viewTicketRequested.emit(toast.data.taskId);
    this.dismiss(toast);
  }

  getEventTitle(item: TaskToastItem): string {
    switch (item.eventType) {
      case 'CREATED':
        return 'New Task Created';
      case 'STATUS_CHANGED':
        return `Status: ${item.status || 'Updated'}`;
      case 'REASSIGNED':
        return 'Task Reassigned';
      case 'RECURRENCE':
        return 'Scheduled Task Spawned';
      default:
        return 'Task Updated';
    }
  }

  getEventIcon(item: TaskToastItem): string {
    switch (item.eventType) {
      case 'CREATED':
        return 'fa-solid fa-sparkles text-emerald-600';
      case 'STATUS_CHANGED':
        return 'fa-solid fa-arrows-rotate text-blue-600';
      case 'REASSIGNED':
        return 'fa-solid fa-user-tag text-purple-600';
      case 'RECURRENCE':
        return 'fa-solid fa-repeat text-indigo-600';
      default:
        return 'fa-solid fa-bell text-amber-600';
    }
  }
}

