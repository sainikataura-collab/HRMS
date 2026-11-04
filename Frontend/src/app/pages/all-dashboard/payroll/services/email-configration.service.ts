import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EmailConfigrationService {

  constructor(private http: HttpClient) { }

  // Get all email config list
  getEmailConfigList(): Observable<any> {
    const url = `${environment.baseURL1}${environment.payroll.EmailConfig_getall}`;
    return this.http.get<any>(url);
  }

  // Insert email config
  insertEmailConfig(emailConfigList: any[]): Observable<any> {
    const url = `${environment.baseURL1}${environment.payroll.EmailConfig_insert}`;
    return this.http.post<any>(url, emailConfigList);
  }

  // Update email config
  updateEmailConfig(emailConfigList: any[]): Observable<any> {
    const url = `${environment.baseURL1}${environment.payroll.EmailConfig_update}`;
    return this.http.put<any>(url, emailConfigList);
  }

}
