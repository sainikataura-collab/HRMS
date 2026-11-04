import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PerquisiteMasterService {

  constructor(private http:HttpClient) { }
   
     //insert 
     add_Perquisite( data:any):Observable<any> {
       const view_url = `${environment.baseURL1}${environment.payroll.add_Perquisite}`;
       return this.http.post<any>(view_url,data);  // Returning any type
     }
   //get the section 
    get_Perquisite(pageIndex: number,pageSize: number): Observable<any> {
       const view_url = `${environment.baseURL1}${environment.payroll.get_Perquisite}?pageIndex=${pageIndex}&pageSize=${pageSize}`;
       return this.http.get(view_url);
     }
     
    //delete the section 
     delete_Perquisite(perquisiteId : string): Observable<any> {
       const delete_url = `${environment.baseURL1}${environment.payroll.delete_Perquisite}/${perquisiteId }`;
       return this.http.delete<any>(delete_url);  // Sending pk_id in URL
     }
   //get  the section  by id
     getPerquisiteById(perquisiteId: string): Observable<any> {
       const view_url = `${environment.baseURL1}${environment.payroll.getPerquisiteById}/${perquisiteId}`;
       return this.http.get(view_url);
     }
   //update the section
     update_Perquisite(data: any): Observable<any> {
       const url = `${environment.baseURL1}${environment.payroll.update_Perquisite}`;
       return this.http.put<any>(url, data);  // UPDATE operation
     }
      //download the excel
      DownloadExcel():Observable<any> {
        var pageIndex =0;
        var pageSize=100000;
        const view_url = `${environment.baseURL1}${environment.payroll.get_Perquisite}?pageIndex=${pageIndex}&pageSize=${pageSize}`;
    
        return this.http.get<any>(view_url);  // Returning any type
    
        }
}
