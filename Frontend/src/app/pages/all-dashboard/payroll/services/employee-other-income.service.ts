import { Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class EmployeeOtherIncomeService {

  constructor(private http:HttpClient) { }
  
    //get employee
      getEmployee(fieldName: string): Observable<any> {
          const view_url = `${environment.baseURL1}${environment.payroll.DropdownList}/${fieldName}`;
          return this.http.get(view_url);
        }
        //get employee details
      getEmployeeDetails(empCode: string): Observable<any> {
          const view_url = `${environment.baseURL1}${environment.payroll.getEmployeeDetails}/${empCode}`;
         
          return this.http.get<any>(view_url);
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
    
         //inset leave
    add_Income( data:any):Observable<any> {
      const view_url = `${environment.baseURL1}${environment.payroll.add_Income}`;
      return this.http.post<any>(view_url,data);  // Returning any type
    }
    //get All
    get_All_Income(fk_finid: string | null,pageIndex: number,pageSize: number): Observable<any> {
      let view_url = `${environment.baseURL1}${environment.payroll.get_All_Income}?pageIndex=${pageIndex}&pageSize=${pageSize}`;
      if (fk_finid!== null) {
        view_url += `&fk_finid=${fk_finid}`;
        console.log('API URL:', view_url); // Debugging the URL
      }
      return this.http.get(view_url);
    }
    
    getById_Income(pk_incomeid:string):Observable<any>{
      const view_url = `${environment.baseURL1}${environment.payroll.getById_Income}/${pk_incomeid}`;
      return  this.http.get<any[]>(view_url);
      }
    
    //update leave
    update_Income(data: any): Observable<any> {
      const url = `${environment.baseURL1}${environment.payroll.update_Income}`;
      return this.http.put<any>(url, data);  // UPDATE operation
    }
    //delete  leave 
    delete_Income(pk_incomeid:string): Observable<any> {
      const view_url = `${environment.baseURL1}${environment.payroll.delete_Income}/${pk_incomeid}`;
      return this.http.delete<any>(view_url);
    }
    
     //download the excel
     DownloadExcel():Observable<any> {
      var pageIndex =0;
      var pageSize=100000;
      const view_url = `${environment.baseURL1}${environment.payroll.get_All_Income}?pageIndex=${pageIndex}&pageSize=${pageSize}`;
    
      return this.http.get<any>(view_url);  // Returning any type
    
      }
    
  
}
