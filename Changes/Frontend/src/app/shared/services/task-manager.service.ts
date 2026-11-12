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
  recurrenceInterval?: number;
  recurrenceDays?: string;
  recurrenceDayOfMonth?: number;
  recurrenceEndType?: string;
  recurrenceEndDate?: string;
  recurrenceOccurrencesTotal?: number;
  recurrenceDueOffsetHours?: number;
  recurrenceDueOffsetUnit?: string;
  nextOccurrenceDate?: string;
  hasAttachments: boolean;
  attachmentUrl?: string;
  attachmentFileName?: string;
  attachmentPath?: string;
  attachmentName?: string;
  createdAt: string;
  updatedAt?: string;
  lastRemarks?: string;
}

export interface TaskBoardResponseDto {
  counts: TaskSummaryCountDto;
  openTasks: TaskCardDto[];
  closedTasks: TaskCardDto[];
  onHoldTasks: TaskCardDto[];
  allTasks?: TaskCardDto[];
  recurringTasks?: TaskCardDto[];
  viewer?: { isAdmin: boolean; isHod: boolean; isManager: boolean };
  data?: any;
}

export interface TaskBoardFilterDto {
  viewerEmpId?: string;
  userType?: string;
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
  targetStatus?: string;
  pageIndex?: number;
  pageSize?: number;
}

export interface TaskStatusUpdateRequestDto {
  taskId: number;
  newStatus: string; // 'OPEN' | 'CLOSED' | 'ON HOLD'
  remarks?: string;
  updatedByEmpId?: string;
  updatedByName?: string;
  userType?: string;
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
  nextOccurrenceDate?: string;
  attachmentUrl?: string;
  attachmentFileName?: string;
  createdByEmpId?: string;
  createdByName?: string;
  isSelfTask?: boolean;
  userType?: string;
  initialRemarks?: string;
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

  private getStorageItem(key: string): string | null {
    if (typeof window === 'undefined') return null;
    try {
      if (typeof sessionStorage !== 'undefined') {
        const val = sessionStorage.getItem(key);
        if (val) return val;
      }
      if (typeof localStorage !== 'undefined') {
        const val = localStorage.getItem(key);
        if (val) return val;
      }
    } catch {
      // Safe fallback for restricted or SSR context
    }
    return null;
  }

  /**
   * Helper to retrieve currently authenticated user ID across available storage keys
   */
  get currentUserId(): string {
    const raw = this.getStorageItem('loginEmpId') ||
                this.getStorageItem('empid') ||
                this.getStorageItem('empId') ||
                this.getStorageItem('UserId') ||
                this.getStorageItem('userId') ||
                this.getStorageItem('loginId') || '';

    // Sanitize any redundant 'GU-' prefix for pure numerical/guid matching if required
    return raw.trim();
  }

  /**
   * Helper to retrieve current user display name
   */
  get currentUserName(): string {
    return this.getStorageItem('empName') ||
           this.getStorageItem('userName') ||
           this.getStorageItem('username') ||
           this.getStorageItem('name') || 'User';
  }

  /**
   * Helper to retrieve currently authenticated CompanyId
   */
  get currentCompanyId(): string {
    return this.getStorageItem('companyId') ||
           this.getStorageItem('companyCode') ||
           this.getStorageItem('fk_companyId') || '';
  }

  /**
   * Helper to retrieve authenticated UserType ('User' vs 'Employee')
   */
  get currentUserType(): string {
    return this.getStorageItem('usertype') ||
           this.getStorageItem('UserType') ||
           'Employee';
  }

  /**
   * Default headers for Task Manager API requests carrying identity context
   */
  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'X-User-Type': this.currentUserType
    });
  }

  /**
   * Fetch Board tasks and summary counts based on active filters
   */
  getBoard(filter: TaskBoardFilterDto): Observable<TaskBoardResponseDto> {
    const payload: TaskBoardFilterDto = {
      viewerEmpId: this.currentUserId,
      userType: this.currentUserType,
      companyId: this.currentCompanyId,
      ...filter
    };
    return this.http.post<TaskBoardResponseDto>(`${this.baseUrl}/TaskManager/board`, payload, {
      headers: this.getHeaders()
    });
  }

  /**
   * Fetch paginated tasks for a specific Kanban column status on scroll
   */
  getColumnTasks(filter: TaskBoardFilterDto): Observable<{ isSuccess: boolean; tasks: TaskCardDto[]; pageIndex: number; pageSize: number; hasMore: boolean }> {
    const payload = {
      ...filter,
      viewerEmpId: this.currentUserId,
      userType: this.currentUserType,
      companyId: this.currentCompanyId
    };
    return this.http.post<{ isSuccess: boolean; tasks: TaskCardDto[]; pageIndex: number; pageSize: number; hasMore: boolean }>(
      `${this.baseUrl}/TaskManager/column-tasks`,
      payload,
      { headers: this.getHeaders() }
    );
  }

  /**
   * Fetch departments and employees dropdown lookup data scoped to current Company
   */
  getLookups(): Observable<TaskLookupsDto> {
    const companyId = this.currentCompanyId;
    return this.http.get<TaskLookupsDto>(
      `${this.baseUrl}/TaskManager/lookups?viewerId=${encodeURIComponent(this.currentUserId)}&userType=${encodeURIComponent(this.currentUserType)}&companyId=${encodeURIComponent(companyId)}`,
      { headers: this.getHeaders() }
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
    return this.http.get<{ isSuccess: boolean; employees: EmployeeLookupItem[] }>(url, {
      headers: this.getHeaders()
    });
  }

  /**
   * Update task status (Kanban drag drop) with remarks
   */
  updateStatusAndRemarks(request: TaskStatusUpdateRequestDto): Observable<any> {
    const payload: TaskStatusUpdateRequestDto = {
      ...request,
      companyId: this.currentCompanyId,
      userType: this.currentUserType,
      updatedByEmpId: request.updatedByEmpId || this.currentUserId,
      updatedByName: request.updatedByName || this.currentUserName
    };
    return this.http.post(`${this.baseUrl}/TaskManager/update-status`, payload, {
      headers: this.getHeaders()
    });
  }

  /**
   * Fetch full task details along with complete audit trail / history
   */
  getTaskById(taskId: number): Observable<TaskDetailDto> {
    const companyId = this.currentCompanyId;
    return this.http.get<TaskDetailDto>(
      `${this.baseUrl}/TaskManager/${taskId}?viewerEmpId=${encodeURIComponent(this.currentUserId)}&companyId=${encodeURIComponent(companyId)}`,
      { headers: this.getHeaders() }
    );
  }

  /**
   * Create a new task (standard or recurring)
   */
  createTask(request: TaskCreateRequestDto): Observable<any> {
    const payload: TaskCreateRequestDto = {
      ...request,
      companyId: this.currentCompanyId,
      userType: this.currentUserType,
      createdByEmpId: request.createdByEmpId || this.currentUserId,
      createdByName: request.createdByName || this.currentUserName
    };
    return this.http.post(`${this.baseUrl}/TaskManager/create`, payload, {
      headers: this.getHeaders()
    });
  }

  /**
   * Update an existing task or recurring cadence
   */
  updateTask(request: TaskCreateRequestDto & { taskId: number }): Observable<any> {
    const payload = {
      ...request,
      companyId: this.currentCompanyId,
      userType: this.currentUserType,
      createdByEmpId: request.createdByEmpId || this.currentUserId,
      createdByName: request.createdByName || this.currentUserName
    };
    return this.http.post(`${this.baseUrl}/TaskManager/update`, payload, {
      headers: this.getHeaders()
    });
  }

  /**
   * Upload an attachment file to /Uploads/Tasks
   */
  uploadAttachment(file: File): Observable<{ fileName: string; fileUrl: string }> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    return this.http.post<{ fileName: string; fileUrl: string }>(`${this.baseUrl}/TaskManager/upload-attachment`, formData, {
      headers: this.getHeaders()
    });
  }

  /**
   * Downloads task attachment as a Blob via WebAPI using environment baseUrl (No hardcoded URLs).
   */
  downloadTaskAttachment(filePathOrName: string): Observable<Blob> {
    const rawFileName = filePathOrName.split('/').pop()?.split('\\').pop() || filePathOrName;
    const url = `${this.baseUrl}/TaskManager/attachment/${encodeURIComponent(rawFileName)}`;
    return this.http.get(url, {
      headers: this.getHeaders(),
      responseType: 'blob'
    });
  }

  /**
   * Process and generate recurring task instances (optionally immediate run for target task)
   */
  processRecurringTasks(taskId?: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/TaskManager/process-recurring`, taskId ? { taskId } : {}, {
      headers: this.getHeaders()
    });
  }
}

