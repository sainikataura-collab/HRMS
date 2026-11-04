import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class StopSalaryService {

  constructor(private http: HttpClient) { }

  //get month list
  getMonthlist(fieldName: string): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.DropdownList}/${fieldName}`;
    return this.http.get(view_url);
  }
  
  getYear(fieldName: string): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.DropdownList}/${fieldName}`;
    return this.http.get(view_url);
  }

  stop_Salary(data:any):Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.Stop_Salary}`;
    return this.http.post<any>(view_url,data);  // Returning any type
  }

  unstop_Salary(data:any):Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.Upstop_SalaryList}`;
    return this.http.post<any>(view_url,data);  // Returning any type
  }


  

    //get employee for filter'
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


    get_processNstopSalaryList(filters: any): Observable<any> {
        const view_url = `${environment.baseURL1}${environment.payroll.get_SalaryList}`;
        return this.http.post(view_url, filters); // Send filters as a POST request
    }

    get_Salary_Stop_Paid_List(): Observable<any> {
      const view_url = `${environment.baseURL1}${environment.payroll.get_All_Shift}`;
      return this.http.get(view_url);
    }




    


}