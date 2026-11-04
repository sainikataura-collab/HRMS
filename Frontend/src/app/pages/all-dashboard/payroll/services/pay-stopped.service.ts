import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SalaryPayStoppedService {

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

  Pay_Salary(data:any):Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.Pay_Salary}`;
    return this.http.post<any>(view_url,data);  // Returning any type
  }


  

    // //get employee for filter'
    // get_Employees_Ddl(filters: any = {}): Observable<any> {
    //     const url = `${environment.baseURL1}${environment.payroll.Employee_GetAll_Ddl}`;
         
    //      // Construct request body based on filters
    //      const requestBody = {
    //        empCode: filters.empCode || "",
    //        empCodeManual: filters.empCodeManual || "",
    //        empName: filters.empName || "",
    //        selectedDepartments: filters.selectedDepartments || [],
    //        selectedDesignation: filters.selectedDesignation || "",
    //        selectedLocations: filters.selectedLocations || [],
    //        selectedNature: filters.selectedNature || "",
    //        selectedCity: filters.selectedCity || "",
    //        sortBy: filters.sortBy || "",
    //       // userId: filters.userId || "",
    //        empStatus: filters.empStatus || "B"
    //      };
    //      return this.http.post<any>(url, requestBody);
    // }


    // get_StopNpaidSalaryList(filters: any): Observable<any> {
    //     const view_url = `${environment.baseURL1}${environment.payroll.get_SalaryStopPaidList}`;
    //     return this.http.post(view_url, filters); // Send filters as a POST request
    // }

    get_paidSalaryList(filters: any): Observable<any> {
        const view_url = `${environment.baseURL1}${environment.payroll.get_SalaryPaidList}`;
        return this.http.post(view_url, filters); // Send filters as a POST request
    }



    


}