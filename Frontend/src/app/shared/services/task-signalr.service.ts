import { Injectable, OnDestroy } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { Subject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TaskToastService } from './task-toast.service';

export interface SignalRTaskNotificationPayload {
  taskId: number;
  taskCode: string;
  subject: string;
  eventType: 'CREATED' | 'STATUS_CHANGED' | 'REASSIGNED' | 'RECURRENCE';
  priority?: string;
  status?: string;
  actorName?: string;
  timestamp?: string;
}

export interface SignalRBoardChangedPayload {
  taskId: number;
  eventType: string;
  newStatus?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TaskSignalRService implements OnDestroy {
  private hubConnection: signalR.HubConnection | null = null;
  private currentEmpId: string | null = null;
  private isConnecting = false;

  private boardChangedSubject = new Subject<SignalRBoardChangedPayload>();
  public boardChanged$: Observable<SignalRBoardChangedPayload> = this.boardChangedSubject.asObservable();

  constructor(private toastService: TaskToastService) {}

  public startConnection(empId: string): void {
    if (!empId) return;
    this.currentEmpId = empId;

    if (this.hubConnection && this.hubConnection.state === signalR.HubConnectionState.Connected) {
      // Re-register group if already connected
      this.joinWorkspaceGroup(empId);
      return;
    }

    if (this.isConnecting) return;
    this.isConnecting = true;

    // Resolve Hub URL dynamically
    const baseHub = environment.chatHub || 'http://localhost:5128/ChatHub';
    const taskHubUrl = baseHub.replace(/ChatHub/i, 'taskHub');

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(taskHubUrl, {
        skipNegotiation: false,
        transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 20000])
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    this.registerHandlers();

    this.hubConnection
      .start()
      .then(() => {
        this.isConnecting = false;
        console.log('[TaskSignalR] Connected to TaskHub successfully');
        this.joinWorkspaceGroup(empId);
      })
      .catch(err => {
        this.isConnecting = false;
        console.warn('[TaskSignalR] Initial connection failed, automatic reconnect will retry:', err);
      });

    this.hubConnection.onreconnected(() => {
      console.log('[TaskSignalR] Reconnected to TaskHub');
      if (this.currentEmpId) {
        this.joinWorkspaceGroup(this.currentEmpId);
      }
    });
  }

  private joinWorkspaceGroup(empId: string): void {
    if (!this.hubConnection || this.hubConnection.state !== signalR.HubConnectionState.Connected) return;

    this.hubConnection
      .invoke('JoinTaskWorkspace', empId)
      .catch(err => console.warn('[TaskSignalR] JoinTaskWorkspace invoke warning:', err));
  }

  private registerHandlers(): void {
    if (!this.hubConnection) return;

    // 1. Live Task Notification received specifically for this stakeholder
    this.hubConnection.on('TaskNotificationReceived', (payload: SignalRTaskNotificationPayload) => {
      console.log('[TaskSignalR] Received live task notification:', payload);
      this.toastService.show({
        taskId: payload.taskId,
        taskCode: payload.taskCode,
        subject: payload.subject,
        eventType: payload.eventType || 'STATUS_CHANGED',
        priority: payload.priority || 'MEDIUM',
        status: payload.status,
        actorName: payload.actorName
      });
    });

    // 2. Silent Board Sync Signal
    this.hubConnection.on('TaskBoardChanged', (payload: SignalRBoardChangedPayload) => {
      console.log('[TaskSignalR] Received board sync signal:', payload);
      this.boardChangedSubject.next(payload);
    });
  }

  public stopConnection(): void {
    if (this.hubConnection) {
      if (this.currentEmpId && this.hubConnection.state === signalR.HubConnectionState.Connected) {
        this.hubConnection.invoke('LeaveTaskWorkspace', this.currentEmpId).catch(() => {});
      }
      this.hubConnection.stop().catch(() => {});
      this.hubConnection = null;
    }
    this.currentEmpId = null;
    this.isConnecting = false;
  }

  ngOnDestroy(): void {
    this.stopConnection();
  }
}
