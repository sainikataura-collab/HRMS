import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface TaskSummaryCountDto {
  allTasks: number;
  openTasks: number;
  closedTasks: number;
  onHoldTasks: number;
  unassignedTasks: number;
  overdueTasks: number;
}

export interface TaskCardDto {
  taskId: number;
  taskCode: string;
  subject: string;
  description?: string;
  departmentId?: string;
  departmentName?: string;
  assignedToEmpId?: string;
  assignedToEmpName?: string;
  createdByName: string;
  createdByEmpId: string;
  priority: string;
  status: string;
  taskTypeId?: number;
  taskTypeName?: string;
  deadlineDate?: string;
  isOverdue: boolean;
  overdueHours: number;
  relativeAgeText: string;
  isRecurring: boolean;
  recurrencePattern?: string;
  hasAttachments: boolean;
  attachmentUrl?: string;
  attachmentFileName?: string;
  createdAt: string;
  updatedAt?: string;
  lastRemarks?: string;
}

export interface TaskBoardResponseDto {
  counts: TaskSummaryCountDto;
  openTasks: TaskCardDto[];
  closedTasks: TaskCardDto[];
  onHoldTasks: TaskCardDto[];
}

export interface TaskBoardFilterDto {
  viewerEmpId?: string;
  scope?: string; // 'ALL' | 'MY_ASSIGNED' | 'MY_DEPT' | 'CREATED_BY_ME'
  departmentId?: string;
  assignedToEmpId?: string;
  createdByEmpId?: string;
  priority?: string;
  taskTypeId?: number;
  recurrencePattern?: string;
  searchKeyword?: string;
  filterCard?: string; // 'ALL' | 'OPEN' | 'CLOSED' | 'ON_HOLD' | 'UNASSIGNED' | 'OVERDUE'
  companyId?: string;
}

export interface TaskStatusUpdateRequestDto {
  taskId: number;
  newStatus: string; // 'OPEN' | 'CLOSED' | 'ON HOLD'
  remarks?: string;
  updatedByEmpId?: string;
  updatedByName?: string;
  companyId?: string;
}

export interface TaskCreateRequestDto {
  subject: string;
  description?: string;
  departmentId?: string;
  assignedToEmpId?: string;
  priority: string;
  taskTypeId?: number;
  taskTypeName?: string;
  deadlineDate?: string;
  isRecurring: boolean;
  recurrencePattern?: string;
  recurrenceInterval?: number;
  recurrenceDays?: string;
  recurrenceDayOfMonth?: number;
  recurrenceEndType?: string; // 'NEVER' | 'ON_DATE' | 'AFTER_COUNT'
  recurrenceEndDate?: string;
  recurrenceOccurrencesTotal?: number;
  recurrenceDueOffsetHours?: number;
  recurrenceDueOffsetUnit?: string;
  attachmentUrl?: string;
  attachmentFileName?: string;
  createdByEmpId?: string;
  createdByName?: string;
  companyId?: string;
}

export interface TaskHistoryItemDto {
  historyId: number;
  taskId: number;
  actionType: string;
  fromStatus?: string;
  toStatus?: string;
  remarks?: string;
  actorEmpId?: string;
  actorName: string;
  createdAt: string;
  timeAgo: string;
}

export interface TaskDetailDto {
  task: TaskCardDto;
  history: TaskHistoryItemDto[];
}

export interface DepartmentLookupItem {
  id: string;
  name: string;
}

export interface EmployeeLookupItem {
  id: string;
  name: string;
  departmentId?: string;
  departmentName?: string;
  isHod: boolean;
}

export interface TaskTypeLookupItem {
  id: number;
  name: string;
  code?: string;
  description?: string;
}

export interface TaskLookupsDto {
  departments: DepartmentLookupItem[];
  employees: EmployeeLookupItem[];
  taskTypes?: TaskTypeLookupItem[];
  viewerContext?: any;
  data?: any;
}

@Injectable({
  providedIn: 'root'
})
export class TaskManagerService {
  private baseUrl = environment.baseURL || 'http://localhost:5128/api/v1';

  constructor(private http: HttpClient) {}

  /**
   * Helper to retrieve currently authenticated user ID across available storage keys
   */
  get currentUserId(): string {
    const raw = sessionStorage.getItem('loginEmpId') ||
                sessionStorage.getItem('empid') ||
                sessionStorage.getItem('empId') ||
                sessionStorage.getItem('UserId') ||
                sessionStorage.getItem('userId') ||
                localStorage.getItem('empid') ||
                localStorage.getItem('empId') ||
                localStorage.getItem('userId') ||
                sessionStorage.getItem('loginId') || '';

    // Sanitize any redundant 'GU-' prefix for pure numerical/guid matching if required
    return raw.trim();
  }

  /**
   * Helper to retrieve current user display name
   */
  get currentUserName(): string {
    return sessionStorage.getItem('empName') ||
           sessionStorage.getItem('userName') ||
           sessionStorage.getItem('username') ||
           sessionStorage.getItem('name') ||
           localStorage.getItem('userName') ||
           localStorage.getItem('empName') || 'System User';
  }

  /**
   * Helper to retrieve currently authenticated CompanyId
   */
  get currentCompanyId(): string {
    return sessionStorage.getItem('companyId') ||
           localStorage.getItem('companyId') ||
           sessionStorage.getItem('fk_companyId') ||
           'GU-1';
  }

  /**
   * Fetch Board tasks and summary counts based on active filters
   */
  getBoard(filter: TaskBoardFilterDto): Observable<TaskBoardResponseDto> {
    const payload: TaskBoardFilterDto = {
      viewerEmpId: this.currentUserId,
      companyId: this.currentCompanyId,
      ...filter
    };
    return this.http.post<TaskBoardResponseDto>(`${this.baseUrl}/TaskManager/board`, payload);
  }

  /**
   * Fetch departments and employees dropdown lookup data scoped to current Company
   */
  getLookups(): Observable<TaskLookupsDto> {
    const companyId = this.currentCompanyId;
    return this.http.get<TaskLookupsDto>(
      `${this.baseUrl}/TaskManager/lookups?viewerId=${encodeURIComponent(this.currentUserId)}&companyId=${encodeURIComponent(companyId)}`
    );
  }

  /**
   * Search employees on demand by department and search text (prevents loading all at once)
   */
  searchEmployees(deptId?: string, search?: string, top: number = 20): Observable<{ isSuccess: boolean; employees: EmployeeLookupItem[] }> {
    const companyId = this.currentCompanyId;
    let url = `${this.baseUrl}/TaskManager/employees?companyId=${encodeURIComponent(companyId)}&top=${top}`;
    if (deptId) url += `&deptId=${encodeURIComponent(deptId)}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    return this.http.get<{ isSuccess: boolean; employees: EmployeeLookupItem[] }>(url);
  }

  /**
   * Update task status (Kanban drag drop) with remarks
   */
  updateStatusAndRemarks(request: TaskStatusUpdateRequestDto): Observable<any> {
    const payload: TaskStatusUpdateRequestDto = {
      ...request,
      companyId: this.currentCompanyId,
      updatedByEmpId: request.updatedByEmpId || this.currentUserId,
      updatedByName: request.updatedByName || this.currentUserName
    };
    return this.http.post(`${this.baseUrl}/TaskManager/update-status`, payload);
  }

  /**
   * Fetch full task details along with complete audit trail / history
   */
  getTaskById(taskId: number): Observable<TaskDetailDto> {
    const companyId = this.currentCompanyId;
    return this.http.get<TaskDetailDto>(
      `${this.baseUrl}/TaskManager/${taskId}?viewerEmpId=${encodeURIComponent(this.currentUserId)}&companyId=${encodeURIComponent(companyId)}`
    );
  }

  /**
   * Create a new task (standard or recurring)
   */
  createTask(request: TaskCreateRequestDto): Observable<any> {
    const payload: TaskCreateRequestDto = {
      ...request,
      companyId: this.currentCompanyId,
      createdByEmpId: request.createdByEmpId || this.currentUserId,
      createdByName: request.createdByName || this.currentUserName
    };
    return this.http.post(`${this.baseUrl}/TaskManager/create`, payload);
  }

  /**
   * Upload an attachment file to /Uploads/Tasks
   */
  uploadAttachment(file: File): Observable<{ fileName: string; fileUrl: string }> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    return this.http.post<{ fileName: string; fileUrl: string }>(`${this.baseUrl}/TaskManager/upload-attachment`, formData);
  }

  /**
   * Process and generate recurring task instances
   */
  processRecurringTasks(): Observable<any> {
    return this.http.post(`${this.baseUrl}/TaskManager/process-recurring`, {});
  }
}

