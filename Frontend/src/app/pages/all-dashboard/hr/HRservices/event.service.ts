import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EventService {

constructor(private http:HttpClient) { }

  add_event( data:any):Observable<any> {
      const view_url = `${environment.baseURL1}${environment.HR.HR_event_Insert}`;
      return this.http.post<any>(view_url,data);  // Returning any type
    }
  
   
    getEvent(pageIndex: number,pageSize: number): Observable<any> {
      const view_url = `${environment.baseURL1}${environment.HR.HR_event__getall}?pageIndex=${pageIndex}&pageSize=${pageSize}`;
      return this.http.get(view_url);
    }
  
    DownloadExcel():Observable<any> {
      var pageIndex =0;
      var pageSize=100000;
      const view_url = `${environment.baseURL1}${environment.HR.HR_event__getall}?pageIndex=${pageIndex}&pageSize=${pageSize}`;
  
      return this.http.get<any>(view_url);  // Returning any type
  
      }
    
   
    deleteEvent(departmentId : Number): Observable<any> {
      const delete_url = `${environment.baseURL1}${environment.HR.HR_event_delete }/${departmentId }`;
      return this.http.delete<any>(delete_url);  // Sending pk_id in URL
    }
  
    getEventById(departmentId: Number): Observable<any> {
      const view_url = `${environment.baseURL1}${environment.HR.HR_event_getbyId }/${departmentId}`;
      return this.http.get(view_url);
    }
  
    update_event(data: any): Observable<any> {
      const url = `${environment.baseURL1}${environment.HR.HR_event_update}`;
      return this.http.put<any>(url, data);  // UPDATE operation
    }
    
}
