import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HremployeeComplaintService {

  constructor(private http: HttpClient) { }

  addEmployeeComplaint(data: any): Observable<any> {
    const apiUrl = `${environment.baseURL1}${environment.HR.HRComplaint_insert}`;
    return this.http.post<any>(apiUrl, data);
  }

  getAllEmployeeComplaints(pageIndex: number, pageSize: number): Observable<any> {
    const url = `${environment.baseURL1}${environment.HR.HRComplaint_getall}?pageIndex=${pageIndex}&pageSize=${pageSize}`;
    return this.http.get<any>(url);
  }

  updateEmployeeComplaint(data: any): Observable<any> {
    const apiUrl = `${environment.baseURL1}${environment.HR.HRComplaint_update}`;
    return this.http.put<any>(apiUrl, data);
  }

  getEmployeeComplaintById(id: string): Observable<any> {
    const apiUrl = `${environment.baseURL1}${environment.HR.HRComplaint_getbyId}/${id}`;
    return this.http.get<any>(apiUrl);
  }

  deleteEmployeeComplaint(id: string): Observable<any> {
    const apiUrl = `${environment.baseURL1}${environment.HR.HRComplaint_delete}/${id}`;
    return this.http.delete<any>(apiUrl);
  }

  checkDuplicateValue(fieldName: string, fieldValue: string, generalId?: string): Observable<any> {
    let view_url = `${environment.baseURL1}${environment.payroll.IsValueAvailable}/${fieldName}?fieldValue=${fieldValue}`;
    if (generalId) {
      view_url += `&generalId=${generalId}`;
    }
    return this.http.get(view_url);
  }

  downloadExcel(): Observable<any> {
    const pageIndex = 0;
    const pageSize = 100000;
    const view_url = `${environment.baseURL1}${environment.HR.HRComplaint_getall}?pageIndex=${pageIndex}&pageSize=${pageSize}`;
    return this.http.get<any>(view_url);
  }

  get_Employees_Ddl(filters: any = {}): Observable<any> {
    const url = `${environment.baseURL1}${environment.payroll.Employee_GetAll_Ddl}`;
     
     // Construct request body based on filters
     const requestBody = {
       empCode: filters.empCode || "",
       empCodeManual: filters.empCodeManual || "",
       empName: filters.empName || "",
       selectedDepartments: filters.selectedDepartments || [],
       selectedDesignation: filters.selectedDesignation || "",
       selectedLocations: filters.selectedLocations || [],
       selectedNature: filters.selectedNature || "",
       selectedCity: filters.selectedCity || "",
       sortBy: filters.sortBy || "",
      // userId: filters.userId || "",
       empStatus: filters.empStatus || "B"
     };
     return this.http.post<any>(url, requestBody);
   }
  
}
