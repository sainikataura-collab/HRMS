import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RecruitModeService {

  constructor(private http:HttpClient) { }
  
        add_recruitmentMaster( data:any):Observable<any> {
          const view_url = `${environment.baseURL1}${environment.Requitment.add_recruitmentMaster}`;
          return this.http.post<any>(view_url,data);  // Returning any type
        }
        
        get_recruitmentMaster(pageIndex: number , pageSize: number):Observable<any> {
          const view_url = `${environment.baseURL1}${environment.Requitment.get_recruitmentMaster}?pageIndex=${pageIndex}&pageSize=${pageSize}`;
          return this.http.get(view_url);  // Returning any type
        }
        update_recruitmentMaster(data:any):Observable<any> {
          const view_url = `${environment.baseURL1}${environment.Requitment.update_recruitmentMaster}`;
          return this.http.put<any>(view_url,data);  // Returning any type
        }
  
       get_recruitmentMaster_ById(pk_recmodeid:string):Observable<any>{
      const view_url = `${environment.baseURL1}${environment.Requitment.get_recruitmentMaster_ById}/${pk_recmodeid}`;
      return  this.http.get<any[]>(view_url);
      }

      // delete in functional master
  
      delete_recruitmentMaster(pk_recmodeid:string): Observable<any> {
      const view_url = `${environment.baseURL1}${environment.Requitment.delete_recruitmentMaster}/${pk_recmodeid}`;
      return this.http.delete<any>(view_url);
    }
  

    // check dublicate data entry in descrption
    CheckDuplicateValue(fieldName: string, fieldValue: string, generalId: string): Observable<any> {
      let view_url = `${environment.baseURL1}${environment.payroll.IsValueAvailable}/${fieldName}?fieldValue=${fieldValue}`;
      if (generalId) {
        view_url += `&generalId=${generalId}`;
      }
    
      return this.http.get(view_url);
    }

     DownloadExcel():Observable<any> {
        var pageIndex =0;
        var pageSize=100000;
        const view_url = `${environment.baseURL1}${environment.Requitment.get_recruitmentMaster}?pageIndex=${pageIndex}&pageSize=${pageSize}`;
    
        return this.http.get<any>(view_url);  // Returning any type
    
        }
    
}
