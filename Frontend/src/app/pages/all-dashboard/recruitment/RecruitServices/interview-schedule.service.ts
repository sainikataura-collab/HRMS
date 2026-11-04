import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ScheduleInterviewService {

  constructor(private http: HttpClient) {}

  // Insert interview schedule
  insertScheduleInterview(data: any): Observable<any> {
    const url = `${environment.baseURL1}${environment.Requitment.ScheduleInterview_insert}`;
    return this.http.post<any>(url, data);
  }

  // Get interview schedule by Job ID
  getScheduleInterviewByJobId(fk_jobid: string): Observable<any> {
    const url = `${environment.baseURL1}${environment.Requitment.ScheduleInterview_getById}/${fk_jobid}`;
    return this.http.get<any>(url);
  }

   getjob(fieldName: string): Observable<any> {
        const view_url = `${environment.baseURL1}${environment.payroll.DropdownList}/${fieldName}`;
        return this.http.get(view_url);
     }

}
