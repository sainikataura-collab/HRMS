import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ExitFormAutorityService {

  constructor(private http: HttpClient) { }

  saveExitAuthority(payload: any): Observable<any> {
    const apiUrl = `${environment.baseURL1}${environment.Exit.SaveExitAuthority}`;
    return this.http.post<any>(apiUrl, payload);
  }

  getAllAdminHodExitInterviews(pageIndex: number, pageSize: number): Observable<any> {
    const apiUrl =
      `${environment.baseURL1}${environment.Exit.ExitInterviewAdminHodGetAll}?pageIndex=${pageIndex}&pageSize=${pageSize}`;

    return this.http.get<any>(apiUrl);
  }

  getAdminHodExitInterviewByEmpId(empId: string): Observable<any> {
    const apiUrl =
      `${environment.baseURL1}${environment.Exit.ExitInterviewAdminHodView}/${empId}`;

    return this.http.get<any>(apiUrl);
  }

  downloadExitInterviewReportPdf(exitInterviewId: number) {
    return this.http.get(
      `${environment.baseURL1}${environment.Exit.ExitInterviewReportPdf}/${exitInterviewId}`,
      { responseType: 'blob' }
    );
  }

  GetExitDashboard(payload: any) {
    return this.http.post<any>(
      `${environment.baseURL1}${environment.Exit.ExitDashBoard}`,
      payload
    );
  }

}
