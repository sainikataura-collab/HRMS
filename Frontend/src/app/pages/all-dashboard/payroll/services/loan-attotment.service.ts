import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LoanAttotmentService {

   constructor(private http:HttpClient) { }
      
   add_LoanAllotment(data: any): Observable<any> {
    const url = `${environment.baseURL1}${environment.payroll.LoanAllotment_insert}`;
    return this.http.post<any>(url, data);
  }
  
  get_All_LoanAllotment(fk_empid: string | null, pageIndex: number, pageSize: number): Observable<any> {
    let view_url = `${environment.baseURL1}${environment.payroll.LoanAllotment_getall}?pageIndex=${pageIndex}&pageSize=${pageSize}`;
    if (fk_empid !== null && fk_empid.trim() !== '') {
      view_url += `&fk_empid=${fk_empid}`;
    }
    console.log('Loan Allotment API URL:', view_url); // Optional: Debugging URL
    return this.http.get<any>(view_url);
  }
  
  
  update_LoanAllotment(id: string, data: any): Observable<any> {
    const url = `${environment.baseURL1}${environment.payroll.LoanAllotment_update}`;
    return this.http.put<any>(url, data);
  }
  
  get_LoanAllotmentById(pk_allotid: string): Observable<any> {
    const url = `${environment.baseURL1}${environment.payroll.LoanAllotment_getbyId}/${pk_allotid}`;
    return this.http.get<any>(url);
  }
  
  delete_LoanAllotment(pk_allotid: string): Observable<any> {
    const url = `${environment.baseURL1}${environment.payroll.LoanAllotment_delete}/${pk_allotid}`;
    return this.http.delete<any>(url);
  }
  

       getEmployee(fieldName: string): Observable<any> {
         const view_url = `${environment.baseURL1}${environment.payroll.DropdownList}/${fieldName}`;
         return this.http.get(view_url);
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
