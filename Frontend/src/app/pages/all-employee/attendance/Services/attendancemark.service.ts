import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AttendancemarkService {

  constructor(private http:HttpClient) { }

   get_AttendanceMarkInfo():Observable<any> {
       const view_url = `${environment.baseURL1}${environment.attendance.Get_AttendanceMarkInfo}`;
       return this.http.get<any>(view_url);  // Returning any type
     }

          
  
   insert_AttendanceMarkInfo( data:any):Observable<any> {
     const view_url = `${environment.baseURL1}${environment.attendance.Insert_AttendanceMark}`;
     return this.http.post<any>(view_url,data);  // Returning any type
   }
       
}
