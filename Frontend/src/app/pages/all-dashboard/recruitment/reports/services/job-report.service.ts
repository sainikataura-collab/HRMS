import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class JobReportService {
  constructor(private http: HttpClient) {}

  private getCompanyId(): string {
    return sessionStorage.getItem('companyId') || localStorage.getItem('companyId') || sessionStorage.getItem('fk_companyId') || '';
  }

  getReportMasterData(): Observable<any> {
    const compId = this.getCompanyId();
    const params = compId ? `?companyId=${encodeURIComponent(compId)}` : '';
    return this.http.get<any>(`${environment.baseURL1}${environment.RecruitmentReports.JobReport_GetMasterData}${params}`);
  }

  getJobReport(payload: any): Observable<any> {
    const compId = this.getCompanyId();
    const body = { ...payload, companyId: payload?.companyId || compId };
    return this.http.post<any>(`${environment.baseURL1}${environment.RecruitmentReports.JobReport_Get}`, body);
  }

  downloadJobReportExcel(payload: any): Observable<Blob> {
    const compId = this.getCompanyId();
    const body = { ...payload, companyId: payload?.companyId || compId };
    return this.http.post(`${environment.baseURL1}${environment.RecruitmentReports.JobReport_DownloadExcel}`, body, {
      responseType: 'blob'
    });
  }
}

