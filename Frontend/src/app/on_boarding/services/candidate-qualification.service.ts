import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CandidateQualificationService {

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const candidateKey = sessionStorage.getItem('candidateKey') || '';
    return new HttpHeaders({ 'X-Candidate-Key': candidateKey });
  }

  // Get all qualifications for logged-in candidate
  getCandidateQualificationList(pageIndex: number, pageSize: number): Observable<any> {
    const url = `${environment.baseURL1}/CandidateQualificationDetails?pageIndex=${pageIndex}&pageSize=${pageSize}`;
    return this.http.get<any>(url, { headers: this.getHeaders() });
  }

  // Get qualification by ID
  getCandidateQualificationById(pk_cqualid: number): Observable<any> {
    const url = `${environment.baseURL1}/CandidateQualificationDetails/${pk_cqualid}`;
    return this.http.get<any>(url, { headers: this.getHeaders() });
  }

  // Add new qualification
  add_CandidateQualificationDetails(data: FormData): Observable<any> {
    const url = `${environment.baseURL1}/CandidateQualificationDetails`;
    return this.http.post<any>(url, data, { headers: this.getHeaders() });
  }

  // Update qualification
  update_CandidateQualificationDetails(data: FormData): Observable<any> {
    const url = `${environment.baseURL1}/CandidateQualificationDetails`;
    return this.http.put<any>(url, data, { headers: this.getHeaders() });
  }

  // Delete qualification
  delete_CandidateQualification(pk_cqualid: number): Observable<any> {
    const url = `${environment.baseURL1}/CandidateQualificationDetails/${pk_cqualid}`;
    return this.http.delete<any>(url, { headers: this.getHeaders() });
  }

  getDocumentUrl(fileName: string): string {
  const candidateKey = sessionStorage.getItem('candidateKey') || '';
  return `${environment.baseURL1}/CandidateQualificationDetails/documents/${fileName}?key=${candidateKey}`;
}
}