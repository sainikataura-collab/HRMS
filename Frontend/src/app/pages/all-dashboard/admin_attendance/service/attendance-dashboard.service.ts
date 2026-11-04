import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

export interface AttendanceDashboardFilterRequest {
  fk_DepartmentId?: string;
  fk_LocationId?: string;
  fk_MonthId?: number;
  fk_YearId?: number;
  selectedDate?: string;
  statusFilter?: string;
  dayFilter?: number;
  searchTerm?: string;
  pageNo?: number;
  pageSize?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AttendanceDashboardService {

  constructor(private http: HttpClient) { }

  getKPIs(payload: AttendanceDashboardFilterRequest): Observable<any> {
    const url = `${environment.baseURL1}${environment.AttendanceDashboard.GetKPIs}`;
    return this.http.post<any>(url, payload);
  }

  getEmployeeGrid(payload: AttendanceDashboardFilterRequest): Observable<any> {
    const url = `${environment.baseURL1}${environment.AttendanceDashboard.GetEmployeeGrid}`;
    return this.http.post<any>(url, payload);
  }

  exportToExcel(payload: AttendanceDashboardFilterRequest): Observable<Blob> {
    const url = `${environment.baseURL1}${environment.AttendanceDashboard.ExportToExcel}`;
    return this.http.post(url, payload, { responseType: 'blob' });
  }

  getEmployeeOccurrences(empCode: string, empId: string, monthId: number, yearId: number, statusFilter: string = ''): Observable<any> {
    const url = `${environment.baseURL1}${environment.AttendanceDashboard.GetEmployeeOccurrences}?empCode=${encodeURIComponent(empCode || '')}&empId=${encodeURIComponent(empId || '')}&monthId=${monthId}&yearId=${yearId}&statusFilter=${encodeURIComponent(statusFilter || '')}`;
    return this.http.get<any>(url);
  }

  exportOccurrencesPdf(payload: any): Observable<Blob> {
    const url = `${environment.baseURL1}${environment.AttendanceDashboard.ExportEmployeeOccurrencesPdf}`;
    return this.http.post(url, payload, { responseType: 'blob' });
  }

  getImage(imageName: string): Observable<Blob> {
    const view_url = `${environment.baseURL1}${environment.AttendanceDashboard.GetImage}/${imageName}`;
    return this.http.get(view_url, { responseType: 'blob' });
  }
}
