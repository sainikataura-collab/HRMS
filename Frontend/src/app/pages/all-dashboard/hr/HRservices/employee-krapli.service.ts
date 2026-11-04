import { Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class EmployeeKRAPLIService {

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
           get_list(filters: any): Observable<any> {
            const view_url = `${environment.baseURL1}${environment.HR.get_list}`;
            return this.http.post(view_url, filters); // Send filters as a POST request
         }

        updateEmployeeKRA(data:any):Observable<any> {
          const view_url = `${environment.baseURL1}${environment.HR.updateEmployeeKRA}`;
          return this.http.put<any>(view_url,data);  // Returning any type
        }

          }
