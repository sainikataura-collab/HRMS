import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class EmployeeReportService {

   private baseUrl = `${environment.baseURL1}`;

  constructor(private http: HttpClient) { }

 

  // Get employees with pagination and filters (Now using POST method)
  get_Employees(pageIndex: number, pageSize: number, filters: any = {}): Observable<any> {
   const url = `${this.baseUrl}${environment.payroll.Employee_GetAll}?pageIndex=${pageIndex}&pageSize=${pageSize}`;
    
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
      empStatus: filters.empStatus || ""
    };

    return this.http.post<any>(url, requestBody);
  }
  ViewEmployeeReportlist(requestBody:any){
    const url= `${this.baseUrl}${environment.payroll.ViewEmployeeReportlist}`;
    return this.http.post<any>(url, requestBody);
  
  }

   downloadViewEmployeeReportlist(body: any): Observable<Blob> {
  const view_url = `${environment.baseURL1}${environment.payroll.downloadViewEmployeeReportlist}`;
  return this.http.post(view_url, body, { responseType: 'blob' });
}

}
