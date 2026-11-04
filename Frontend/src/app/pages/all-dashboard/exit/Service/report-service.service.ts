import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private baseUrl = environment.baseURL;

  constructor(private http: HttpClient) { }

  Export_FnfReportlist(requestBody: any): Observable<any> {
    const url = `${this.baseUrl}${environment.Exit.ViewFnfReportlist}`;
    return this.http.post<any>(url, requestBody);
  }

  downloadFnfPdf(empId: string): Observable<Blob> {
    const url = `${this.baseUrl}${environment.Exit.DownloadFnfSettlementPdf}/${empId}`;
    return this.http.get(url, { responseType: 'blob' });
  }

  getAdminExitReportList(pageIndex: number, pageSize: number, searchTerm: string = ''): Observable<any> {
    const apiUrl = `${environment.baseURL}${environment.Exit.SeparationRequestAdminExitReportList}?pageIndex=${pageIndex}&pageSize=${pageSize}&searchTerm=${searchTerm}`;
    return this.http.get<any>(apiUrl);
  }
}
