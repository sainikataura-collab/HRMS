import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RosterMasterService {

  constructor(private http: HttpClient) { }

  // Get All Paginated
  getAll(pageIndex: number = 0, pageSize: number = 10, searchTerm: string = ''): Observable<any> {
    let params = new HttpParams()
      .set('pageIndex', pageIndex.toString())
      .set('pageSize', pageSize.toString())
      .set('searchTerm', searchTerm);
    const url = `${environment.baseURL1}${environment.payroll.ShiftRoster_GetAll}`;
    return this.http.get<any>(url, { params });
  }

  // Get By ID
  getById(id: number | string): Observable<any> {
    const url = `${environment.baseURL1}${environment.payroll.ShiftRoster_GetById}/${id}`;
    return this.http.get<any>(url);
  }

  // Insert Record
  insert(data: any): Observable<any> {
    const url = `${environment.baseURL1}${environment.payroll.ShiftRoster_Insert}`;
    return this.http.post<any>(url, data);
  }

  // Update Record
  update(data: any): Observable<any> {
    const url = `${environment.baseURL1}${environment.payroll.ShiftRoster_Update}`;
    return this.http.put<any>(url, data);
  }

  // Delete Record
  delete(id: number | string): Observable<any> {
    const url = `${environment.baseURL1}${environment.payroll.ShiftRoster_Delete}/${id}`;
    return this.http.delete<any>(url);
  }

  // Bulk Upload Validation & Insert
  bulkInsert(items: any[]): Observable<any> {
    const url = `${environment.baseURL1}${environment.payroll.ShiftRoster_BulkInsert}`;
    return this.http.post<any>(url, items);
  }

  // Get Employees matching Leave Transaction (Employee_GetAll_Ddlfor100)
  getEmployees(filters: any = {}): Observable<any> {
    const url = `${environment.baseURL1}${environment.payroll.Employee_GetAll_Ddlfor100}`;
    const requestBody = {
      empCode: filters.empCode || '',
      empCodeManual: filters.empCodeManual || '',
      empName: filters.empName || '',
      selectedDepartments: filters.selectedDepartments || [],
      selectedDesignation: filters.selectedDesignation || '',
      selectedLocations: filters.selectedLocations || [],
      selectedNature: filters.selectedNature || '',
      selectedCity: filters.selectedCity || '',
      sortBy: filters.sortBy || '',
      empStatus: filters.empStatus || 'B',
      search: filters.search || '',
      pageNo: filters.pageNo || 1,
      pageSize: filters.pageSize || 100
    };
    return this.http.post<any>(url, requestBody);
  }

  // Get Shifts from Shift Master
  getShifts(): Observable<any> {
    const url = `${environment.baseURL1}${environment.payroll.ShiftRoster_GetShifts}`;
    return this.http.get<any>(url);
  }

  // Get Week Days from General Master (LSP_Master_General, CodeTypeId = 21)
  getWeekDays(): Observable<any> {
    const url = `${environment.baseURL1}${environment.payroll.GetDdlListBasedOnCodeType}?codeTypeId=21`;
    return this.http.get<any>(url);
  }
}