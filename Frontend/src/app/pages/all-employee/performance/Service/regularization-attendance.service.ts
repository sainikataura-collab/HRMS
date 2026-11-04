import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RegularizationAttendanceService {

  constructor(private http: HttpClient) { }

  insertRegulariseAttendance(data: any): Observable<any> {
    const url = `${environment.baseURL1}${environment.Leave.insert_RegulariseAttendance}`;
    return this.http.post<any>(url, data);
  }

  getAllRegulariseAttendance(): Observable<any> {
    const url = `${environment.baseURL1}${environment.Leave.getAll_RegulariseAttendance}`;
    return this.http.get<any>(url);
  }

    RegulariseAttendanceddl(): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.Leave.DdlRegulariseAttendance}`;
    return this.http.get(view_url);
  }

 getInOutTimeByInOutId(pk_inoutid: string): Observable<any> {
  const url = `${environment.baseURL1}${environment.Leave.getInOutTime}?pk_inoutid=${pk_inoutid}`;
  return this.http.get<any>(url);
}

}
