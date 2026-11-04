import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SkpAttributeService {

  constructor(private http:HttpClient) { }
  
    
  
       //insert 
      add_skipAttribute( data:any):Observable<any> {
        const view_url = `${environment.baseURL1}${environment.HR.add_skipAttribute}`;
        return this.http.post<any>(view_url,data);  // Returning any type
      }
    //get the section 
     get_skipAttribute(pageIndex: number,pageSize: number): Observable<any> {
        const view_url = `${environment.baseURL1}${environment.HR.get_skipAttribute}?pageIndex=${pageIndex}&pageSize=${pageSize}`;
        return this.http.get(view_url);
      }
      
     //delete the section 
      delete_skipAttribute(pk_attributeId : string): Observable<any> {
        const delete_url = `${environment.baseURL1}${environment.HR.delete_skipAttribute}/${pk_attributeId }`;
        return this.http.delete<any>(delete_url);  // Sending pk_id in URL
      }
    //get  the section  by id
      get_skipAttributeBYid(pk_attributeId: string): Observable<any> {
        const view_url = `${environment.baseURL1}${environment.HR.get_skipAttributeBYid}/${pk_attributeId}`;
        return this.http.get(view_url);
      }
    //update the section
      update_skipAttribute(data: any): Observable<any> {
        const url = `${environment.baseURL1}${environment.HR.update_skipAttribute}`;
        return this.http.put<any>(url, data);  // UPDATE operation
      }
       //download the excel
       DownloadExcel():Observable<any> {
         var pageIndex =0;
         var pageSize=100000;
         const view_url = `${environment.baseURL1}${environment.HR.get_skipAttribute}?pageIndex=${pageIndex}&pageSize=${pageSize}`;
     
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
