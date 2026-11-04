import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AppreciatorService {

constructor(private http:HttpClient) { }


  //insert 
  add_cardAppreciator( data:any):Observable<any> {
    const view_url = `${environment.baseURL1}${environment.HR.add_cardAppreciator}`;
    return this.http.post<any>(view_url,data);  // Returning any type
  }
//get the section 
 get_cardAppreciator(pageIndex: number,pageSize: number): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.HR.get_cardAppreciator}?pageIndex=${pageIndex}&pageSize=${pageSize}`;
    return this.http.get(view_url);
  }
  
 //delete the section 
  delete_cardAppreciator(pk_crdauthId : number): Observable<any> {
    const delete_url = `${environment.baseURL1}${environment.HR.delete_cardAppreciator}/${pk_crdauthId }`;
    return this.http.delete<any>(delete_url);  // Sending pk_id in URL
  }
//get  the section  by id
  get_cardAppreciatorByid(pk_crdauthId: number): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.HR.get_cardAppreciatorByid}/${pk_crdauthId}`;
    return this.http.get(view_url);
  }
//update the section
  update_cardAppreciator(data: any): Observable<any> {
    const url = `${environment.baseURL1}${environment.HR.update_cardAppreciator}`;
    return this.http.put<any>(url, data);  // UPDATE operation
  }
   //download the excel
   DownloadExcel():Observable<any> {
     var pageIndex =0;
     var pageSize=100000;
     const view_url = `${environment.baseURL1}${environment.HR.get_cardAppreciator}?pageIndex=${pageIndex}&pageSize=${pageSize}`;
 
     return this.http.get<any>(view_url);  // Returning any type
 
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
