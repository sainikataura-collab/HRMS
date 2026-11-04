import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UpdateEmployeeEmailService {
 constructor(private http:HttpClient) { }
 
 get_employeeEmail(  filters: any = {}):Observable<any> {
    
  const view_url = `${environment.baseURL1}${environment.payroll.Get_employeeEmail}`;
  const requestBody = {
   empCode: filters.empCode || "",
   empCodeManual: filters.empCodeManual || "",
   empName: filters.empName || "",
   selectedDepartments: filters.selectedDepartments || [],
   selectedDesignation: filters.selectedDesignation || "",
   selectedLocations: filters.selectedLocations || [],
   selectedNature: filters.selectedNature || "",
   selectedCity: filters.selectedCity || "",
   sortBy: filters.sortBy || "empCode",
  // userId: filters.userId || "",
   empStatus: filters.empStatus || ""
 };


  return this.http.post<any>(view_url,requestBody);  // Returning any type
}

update_employeeEmail(data:any):Observable<any> {
  const view_url = `${environment.baseURL1}${environment.payroll.Update_employeeeEmail}`;
  return this.http.put<any>(view_url,data);  // Returning any type
}
}

