import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ImportdaywiseAttendanceService {

  constructor(private http:HttpClient) { }

  SAL_EmpdaywiseAttendance_ForImport(formData: FormData): Observable<any> {
    debugger
    const view_url = `${environment.baseURL1}${environment.payroll.SAL_EmpdaywiseAttendance_ForImport}`;
    return this.http.post<any>(view_url, formData);
  }

   SAL_EmpdaywiseAttendance_ForExport(body: any): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.SAL_EmpdaywiseAttendance_ForExport}`;
    return this.http.post<any>(view_url, body);
  }

    SAL_EmpdaywiseAttendance_ForExportImport(body: any): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.GetAttendanceListfordaywiseImport}`;
    return this.http.post<any>(view_url, body);
  }

}

