import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DailyAttendanceService {

//   private apiUrl = environment.apiUrl + 'DailyAttendance/';

  constructor(private http: HttpClient) { }


//   getAttendance(body: any): Observable<any> {

//      const url =
//       `${environment.baseURL1}${environment.payroll.GetDailyAttendance}`;

//     return this.http.post<any>(url, body);
//   }

getAttendance(
  empId: string,
  monthId: number,
  yearId: number
): Observable<any> {

  const url =
    `${environment.baseURL1}${environment.payroll.GetDailyAttendance}`;

  const params = new HttpParams()
    .set('empId', empId)
    .set('monthId', monthId)
    .set('yearId', yearId);

  return this.http.post<any>(url, {}, { params });
}

  saveAttendance(body: any): Observable<any> {
    const url =
      `${environment.baseURL1}${environment.payroll.SaveDailyAttendance}`;
    return this.http.post<any>(url, body);
  }

}