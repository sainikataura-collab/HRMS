import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LeaveConfigService {

  constructor(private http: HttpClient) { }

  // Get all leave config list
  getLeaveConfigList(): Observable<any> {
    const url = `${environment.baseURL1}${environment.payroll.LeaveConfig_getall}`;
    return this.http.get<any>(url);
  }

  // Insert leave config
  insertLeaveConfig(leaveConfigList: any[]): Observable<any> {
    const url = `${environment.baseURL1}${environment.payroll.LeaveConfig_insert}`;
    return this.http.post<any>(url, leaveConfigList);
  }

  // Update leave config
  updateLeaveConfig(leaveConfigList: any[]): Observable<any> {
    const url = `${environment.baseURL1}${environment.payroll.LeaveConfig_update}`;
    return this.http.put<any>(url, leaveConfigList);
  }

  getMonthlist(fieldName: string): Observable<any> {
    const url = `${environment.baseURL1}${environment.payroll.DropdownList}/${fieldName}`;
    return this.http.get(url);
  }

  // Get year list
  getYear(fieldName: string): Observable<any> {
    const url = `${environment.baseURL1}${environment.payroll.DropdownList}/${fieldName}`;
    return this.http.get(url);
  }

}
