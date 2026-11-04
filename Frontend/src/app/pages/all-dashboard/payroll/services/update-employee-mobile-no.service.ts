import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UpdateEmployeeMobileNoService {
 constructor(private http:HttpClient) { }
 
   get_employeeMobile(  filters: any = {}):Observable<any> {
    
       const view_url = `${environment.baseURL1}${environment.payroll.Get_employeeMobile}`;
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
   
     update_employeeMobile(data:any):Observable<any> {
       const view_url = `${environment.baseURL1}${environment.payroll.Update_employeeMobile}`;
       return this.http.put<any>(view_url,data);  // Returning any type
     }
}
