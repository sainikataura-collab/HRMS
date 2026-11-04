import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SeparationRequestService {

  constructor(private http: HttpClient) { }

  // Insert
  insert(data: any): Observable<any> {
    const apiUrl = `${environment.baseURL}${environment.Exit.SeparationRequestInsert}`;
    return this.http.post<any>(apiUrl, data);
  }

  // Get All
  getAll(
    pageIndex: number = 0,
    pageSize: number = 10
  ): Observable<any> {
    const apiUrl = `${environment.baseURL}${environment.Exit.SeparationRequestGetAll}?pageIndex=${pageIndex}&pageSize=${pageSize}`;
    return this.http.get<any>(apiUrl);
  }

  // Get By Id
  getById(id: number): Observable<any> {
    const apiUrl = `${environment.baseURL}${environment.Exit.SeparationRequestGetById}/${id}`;
    return this.http.get<any>(apiUrl);
  }

  // Update
  update(data: any): Observable<any> {
    const apiUrl = `${environment.baseURL}${environment.Exit.SeparationRequestUpdate}`;
    return this.http.put<any>(apiUrl, data);
  }

  // Delete
  delete(id: number): Observable<any> {
    const apiUrl = `${environment.baseURL}${environment.Exit.SeparationRequestDelete}/${id}`;
    return this.http.delete<any>(apiUrl);
  }

  getNoticePeriod(): Observable<any> {
    const apiUrl = `${environment.baseURL}${environment.Exit.SeparationRequestNoticePeriod}`;
    return this.http.get(apiUrl);
  }

  getApprovalList(): Observable<any> {
    const apiUrl = `${environment.baseURL}${environment.Exit.SeparationRequestApprovalList}`;
    return this.http.get(apiUrl);
  }

  approveResignation(payload: any): Observable<any> {
    const apiUrl = `${environment.baseURL}${environment.Exit.SeparationRequestApproval}`;
    return this.http.put(apiUrl, payload);
  }

  downloadPdf(id: number): Observable<any> {
    const apiUrl = `${environment.baseURL}${environment.Exit.SeparationRequestDownloadPdf}/${id}`;
    return this.http.get(apiUrl, { responseType: 'blob' });
  }

  withdrawResignation(model: any): Observable<any> {
    const apiUrl = `${environment.baseURL}${environment.Exit.SeparationRequestWithdraw}`;
    return this.http.put<any>(apiUrl, model);
  }

  withdraw(id: number): Observable<any> {
    return this.withdrawResignation({ pkSepRequestId: id });
  }

  getAdminList(pageIndex: number, pageSize: number, searchTerm: string = ''): Observable<any> {
    const apiUrl = `${environment.baseURL}${environment.Exit.SeparationRequestAdminList}?pageIndex=${pageIndex}&pageSize=${pageSize}&searchTerm=${searchTerm}`;
    return this.http.get<any>(apiUrl);
  }

  getAdminReportList(pageIndex: number, pageSize: number, searchTerm: string = ''): Observable<any> {
    const apiUrl = `${environment.baseURL}${environment.Exit.SeparationRequestAdminReportList}?pageIndex=${pageIndex}&pageSize=${pageSize}&searchTerm=${searchTerm}`;
    return this.http.get<any>(apiUrl);
  }

  

  getDashboardCount(): Observable<any> {
    const apiUrl = `${environment.baseURL}${environment.Exit.SeparationRequestDashboardCount}`;
    return this.http.get<any>(apiUrl);
  }

  getLetterData(id: number): Observable<any> {
    const apiUrl = `${environment.baseURL}${environment.Exit.SeparationRequestLetterData}/${id}`;
    return this.http.get<any>(apiUrl);
  }

  downloadRelievingLetter(id: number): Observable<any> {
    const apiUrl = `${environment.baseURL}${environment.Exit.SeparationRequestRelievingLetter}/${id}`;
    return this.http.get(apiUrl, { responseType: 'blob' });
  }

  downloadExperienceLetter(id: number): Observable<any> {
    const apiUrl = `${environment.baseURL}${environment.Exit.SeparationRequestExperienceLetter}/${id}`;
    return this.http.get(apiUrl, { responseType: 'blob' });
  }
}