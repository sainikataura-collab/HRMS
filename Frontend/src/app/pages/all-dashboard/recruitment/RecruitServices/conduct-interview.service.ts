import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ConductInterviewService {

  constructor(private http:HttpClient) { }


  
          add_ConductInterview( data:any):Observable<any> {
            const view_url = `${environment.baseURL1}${environment.Requitment.add_ConductInterview}`;
            return this.http.post<any>(view_url,data);  // Returning any type
          }
          
          get_ConductInterview(fk_recId:string):Observable<any> {
            const view_url = `${environment.baseURL1}${environment.Requitment.get_ConductInterview}/${fk_recId}`;
            return this.http.get(view_url);  // Returning any type
          }
          update_ConductInterview(data:any):Observable<any> {
            const view_url = `${environment.baseURL1}${environment.Requitment.update_ConductInterview}`;
            return this.http.put<any>(view_url,data);  // Returning any type
          }
    
         get_ConductInterview_ById(fk_recId:string):Observable<any>{
        const view_url = `${environment.baseURL1}${environment.Requitment.get_ConductInterview_ById}/${fk_recId}`;
        return  this.http.get<any[]>(view_url);
        }
  
        // delete in functional master
    
        delete_ConductInterview(fk_recId:string): Observable<any> {
        const view_url = `${environment.baseURL1}${environment.Requitment.delete_ConductInterview}/${fk_recId}`;
        return this.http.delete<any>(view_url);
      }
    
  
       //get employee details
      getEmployeeDetails(empCode: string): Observable<any> {
            const view_url = `${environment.baseURL1}${environment.payroll.getEmployeeDetails}/${empCode}`;
           
            return this.http.get<any>(view_url);
          }
      // check dublicate data entry in descrption
      CheckDuplicateValue(fieldName: string, fieldValue: string, generalId: string): Observable<any> {
        let view_url = `${environment.baseURL1}${environment.payroll.IsValueAvailable}/${fieldName}?fieldValue=${fieldValue}`;
        if (generalId) {
          view_url += `&generalId=${generalId}`;
        }
      
        return this.http.get(view_url);
      }
  
      //  DownloadExcel():Observable<any> {
      //     var pageIndex =0;
      //     var pageSize=100000;
      //     const view_url = `${environment.baseURL1}${environment.payroll.get_ConductInterview}?pageIndex=${pageIndex}&pageSize=${pageSize}`;
      
      //     return this.http.get<any>(view_url);  // Returning any type
      
      //     }
      
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
  
            getjob(fieldName: string): Observable<any> {
            const view_url = `${environment.baseURL1}${environment.payroll.DropdownList}/${fieldName}`;
            return this.http.get(view_url);
          }
  
           
          Getinterviewdropdown(jobId: string): Observable<any> {
              const view_url = `${environment.baseURL1}${environment.Requitment.Getinterviewdropdown}/${jobId}`;
            return this.http.get(view_url);
}


  GetCandidatedropdown(jobId: string): Observable<any> {
              const view_url = `${environment.baseURL1}${environment.Requitment.GetCandidatedropdown}/${jobId}`;
            return this.http.get(view_url);
}


}
