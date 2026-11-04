import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DashBoardService{
 constructor(private http:HttpClient) { }

     //insert 
  add_dashboard( data:any):Observable<any> {
    const view_url = `${environment.baseURL1}${environment.HR.add_dashboard}`;
    return this.http.post<any>(view_url,data);  // Returning any type
  }
  //get the section 
   get_dashboard(pageIndex: number,pageSize: number): Observable<any> {
      const view_url = `${environment.baseURL1}${environment.HR.get_dashboard}?pageIndex=${pageIndex}&pageSize=${pageSize}`;
      return this.http.get(view_url);
    }
    
   //delete the section 
    delete_dashboard(pk_dashId : number): Observable<any> {
      const delete_url = `${environment.baseURL1}${environment.HR.delete_dashboard}/${pk_dashId }`;
      return this.http.delete<any>(delete_url);  // Sending pk_id in URL
    }
  //get  the section  by id
    get_dashboard_ById(pk_dashId: number): Observable<any> {
      const view_url = `${environment.baseURL1}${environment.HR.get_dashboard_ById}/${pk_dashId}`;
      return this.http.get(view_url);
    }
  //update the section
    update_dashboard(data: any): Observable<any> {
      const url = `${environment.baseURL1}${environment.HR.update_dashboard}`;
      return this.http.put<any>(url, data);  // UPDATE operation
    }
     //download the excel
     DownloadExcel():Observable<any> {
       var pageIndex =0;
       var pageSize=100000;
       const view_url = `${environment.baseURL1}${environment.HR.get_dashboard}?pageIndex=${pageIndex}&pageSize=${pageSize}`;
   
       return this.http.get<any>(view_url);  // Returning any type
   
       }

}
