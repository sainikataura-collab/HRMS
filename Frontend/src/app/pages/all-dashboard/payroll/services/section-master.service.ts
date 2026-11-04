import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SectionMasterService {

    constructor(private http:HttpClient) { }
  
    //insert 
    add_section( data:any):Observable<any> {
      const view_url = `${environment.baseURL1}${environment.payroll.add_section}`;
      return this.http.post<any>(view_url,data);  // Returning any type
    }
  //get the section 
   get_section(pageIndex: number,pageSize: number): Observable<any> {
      const view_url = `${environment.baseURL1}${environment.payroll.get_section}?pageIndex=${pageIndex}&pageSize=${pageSize}`;
      return this.http.get(view_url);
    }
    
   //delete the section 
    delete_section(sectionId : string): Observable<any> {
      const delete_url = `${environment.baseURL1}${environment.payroll.delete_section}/${sectionId }`;
      return this.http.delete<any>(delete_url);  // Sending pk_id in URL
    }
  //get  the section  by id
    getsectionById(sectionId: string): Observable<any> {
      const view_url = `${environment.baseURL1}${environment.payroll.getsectionById}/${sectionId}`;
      return this.http.get(view_url);
    }
  //update the section
    update_section(data: any): Observable<any> {
      const url = `${environment.baseURL1}${environment.payroll.update_section}`;
      return this.http.put<any>(url, data);  // UPDATE operation
    }
    
 CheckDuplicateValue(fieldName: string, fieldValue: string, generalId?: string): Observable<any> {
        let view_url = `${environment.baseURL1}${environment.payroll.IsValueAvailable}/${fieldName}?fieldValue=${fieldValue}`;
        if (generalId) {
          view_url += `&generalId=${generalId}`;
        }
      
        return this.http.get(view_url);
      }

// CheckDuplicateValue(fields: { fieldName: string; fieldValue: string }[], generalId?: string): Observable<any[]> {
//   const requests = fields.map(({ fieldName, fieldValue }) => {
//     let view_url = `${environment.baseURL1}${environment.payroll.IsValueAvailable}/${fieldName}?fieldValue=${fieldValue}`;
//     if (generalId) {
//       view_url += `&generalId=${generalId}`;
//     }
//     return this.http.get(view_url);
//   });

//   return forkJoin(requests); // Runs all requests in parallel and returns an array of responses
// }

      
      //download the excel
      DownloadExcel():Observable<any> {
          var pageIndex =0;
          var pageSize=100000;
          const view_url = `${environment.baseURL1}${environment.payroll.get_section}?pageIndex=${pageIndex}&pageSize=${pageSize}`;
      
          return this.http.get<any>(view_url);  // Returning any type
      
          }
  

}
