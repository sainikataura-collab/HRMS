import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AttendanceAdjustmentService {

  constructor(private http:HttpClient) { }
 
 
  
 
  
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
  
      //get month list
getMonthlist(fieldName: string): Observable<any> {
  const view_url = `${environment.baseURL1}${environment.payroll.DropdownList}/${fieldName}`;
  return this.http.get(view_url);
}

getYear(fieldName: string): Observable<any> {
  const view_url = `${environment.baseURL1}${environment.payroll.DropdownList}/${fieldName}`;
  return this.http.get(view_url);
}

//get all


get_AttendanceAdjustment(filters: any, pageIndex: number, pageSize: number,pageIndex1: number, pageSize1: number): Observable<any> {
  const view_url = `${environment.baseURL1}${environment.payroll.get_AttendanceAdjustment}?pageIndex=${pageIndex}&pageSize=${pageSize}&pageIndex1=${pageIndex1}&pageSize1=${pageSize1}`;

  return this.http.post(view_url, filters); // Send filters as a POST request
}

update_Attendance(data:any):Observable<any> {
  const view_url = `${environment.baseURL1}${environment.payroll.update_Attendance}`;
  return this.http.put<any>(view_url,data);  // Returning any type
}
 
   
  
    
}
