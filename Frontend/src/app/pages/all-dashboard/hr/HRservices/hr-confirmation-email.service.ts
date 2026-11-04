import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HrConfirmationEmailService {

  constructor(private http: HttpClient) { }

  addConfirmationEmail(data: any): Observable<any> {
    const apiUrl = `${environment.baseURL1}${environment.Requitment.ConfirmationEmail_insert}`;
    return this.http.post<any>(apiUrl, data);
  }

  getAllConfirmationEmails(pageIndex: number, pageSize: number): Observable<any> {
    const url = `${environment.baseURL1}${environment.Requitment.ConfirmationEmail_getall}?pageIndex=${pageIndex}&pageSize=${pageSize}`;
    return this.http.get<any>(url);
  }

  updateConfirmationEmail(data: any): Observable<any> {
    const apiUrl = `${environment.baseURL1}${environment.Requitment.ConfirmationEmail_update}`;
    return this.http.put<any>(apiUrl, data);
  }

  getConfirmationEmailById(id: string): Observable<any> {
    const apiUrl = `${environment.baseURL1}${environment.Requitment.ConfirmationEmail_getbyId}/${id}`;
    return this.http.get<any>(apiUrl);
  }

  deleteConfirmationEmail(id: string): Observable<any> {
    const apiUrl = `${environment.baseURL1}${environment.Requitment.ConfirmationEmail_delete}/${id}`;
    return this.http.delete<any>(apiUrl);
  }

  checkDuplicateValue(fieldName: string, fieldValue: string, generalId?: string): Observable<any> {
    let view_url = `${environment.baseURL1}${environment.payroll.IsValueAvailable}/${fieldName}?fieldValue=${fieldValue}`;
    if (generalId) {
      view_url += `&generalId=${generalId}`;
    }
    return this.http.get(view_url);
  }

  downloadExcel(): Observable<any> {
    const pageIndex = 0;
    const pageSize = 100000;
    const view_url = `${environment.baseURL1}${environment.Requitment.ConfirmationEmail_getall}?pageIndex=${pageIndex}&pageSize=${pageSize}`;
    return this.http.get<any>(view_url);
  }
}

