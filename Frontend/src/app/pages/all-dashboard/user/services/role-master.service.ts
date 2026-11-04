import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class RoleMasterService {
 constructor(private http:HttpClient) { }
    
//insert 
   add_RoleMaster( data:any):Observable<any> {
   const view_url = `${environment.baseURL1}${environment.payroll.add_RoleMaster}`;
    return this.http.post<any>(view_url,data);  // Returning any type
  }
//get the section 
  get_RoleMaster(pageIndex: number,pageSize: number): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.get_RoleMaster}?pageIndex=${pageIndex}&pageSize=${pageSize}`;
    return this.http.get(view_url);
  }
  
 //delete the section 
 delete_RoleMaster(pk_roleId : string): Observable<any> {
    const delete_url = `${environment.baseURL1}${environment.payroll.delete_RoleMaster}/${pk_roleId }`;
    return this.http.delete<any>(delete_url);  // Sending pk_id in URL
  }
//get  the section  by id
  getRoleMasterById(pk_roleId : string): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.getRoleMasterById}/${pk_roleId}`;
    return this.http.get(view_url);
  }
//update the section
  update_RoleMaster(data: any): Observable<any> {
    const url = `${environment.baseURL1}${environment.payroll.update_RoleMaster}`;
    return this.http.put<any>(url, data);  // UPDATE operation
  }

   //download the excel
   DownloadExcel():Observable<any> {
    var pageIndex =0;
    var pageSize=100000;
    const view_url = `${environment.baseURL1}${environment.payroll.get_RoleMaster}?pageIndex=${pageIndex}&pageSize=${pageSize}`;

    return this.http.get<any>(view_url);  // Returning any type

    }


    CheckDuplicateValue(fieldName: string, fieldValue: string, generalId?: string): Observable<any> {
      let view_url = `${environment.baseURL1}${environment.payroll.IsValueAvailable}/${fieldName}?fieldValue=${fieldValue}`;
      if (generalId) {
        view_url += `&generalId=${generalId}`;
      }
    
      return this.http.get(view_url);
    }
}
