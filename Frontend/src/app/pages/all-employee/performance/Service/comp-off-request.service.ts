import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CompOffRequestService {

  constructor(private http: HttpClient) { }

  insertCompOffRequest(data: any): Observable<any> {
  const url = `${environment.baseURL1}${environment.Leave.insert_CompOffRequest}`;
  return this.http.post<any>(url, data);
}

getAllCompOffRequests(): Observable<any> {
  const url = `${environment.baseURL1}${environment.Leave.getAll_CompOffRequest}`;
  return this.http.get<any>(url);
}


getCompOffRequestById(pk_applycompoffId: string): Observable<any> {
  const url = `${environment.baseURL1}${environment.Leave.getById_CompOffRequest}?pk_applycompoffId=${pk_applycompoffId}`;
  return this.http.get<any>(url);
}

  getCompOffAttendanceByDate(date: string): Observable<any> {
    const encodedDate = encodeURIComponent(date); // converts "2025/01/05" -> "2025%2F01%2F05"
    const url = `${environment.baseURL1}${environment.Leave.getTotalDays_CompOffRequest}?dated=${encodedDate}`;
    return this.http.get<any>(url);
  }




  DownloadExcel(): Observable<any> {
    var pageIndex = 0;
    var pageSize = 100000;
    const view_url = `${environment.baseURL1}${environment.payroll.get_All_City}?pageIndex=${pageIndex}&pageSize=${pageSize}`;

    return this.http.get<any>(view_url); // Returning any type
  }

}
