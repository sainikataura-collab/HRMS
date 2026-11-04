import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AttendanceConfigService{

  constructor(private http: HttpClient) { }

  // Get all leave config list
  getConfigList(): Observable<any> {
    const url = `${environment.baseURL1}${environment.payroll.AttendanceConfig_getall}`;
    return this.http.get<any>(url);
  }

  // Insert leave config
  insertConfig(leaveConfigList: any[]): Observable<any> {
    const url = `${environment.baseURL1}${environment.payroll.AttendanceConfig_insert}`;
    return this.http.post<any>(url, leaveConfigList);
  }

  // Update leave config
  updateConfig(leaveConfigList: any[]): Observable<any> {
    const url = `${environment.baseURL1}${environment.payroll.AttendanceConfig_update}`;
    return this.http.put<any>(url, leaveConfigList);
  }

  getLeaveTypeNatureWise(fieldName: string): Observable<any> {
    const url = `${environment.baseURL1}${environment.payroll.DropdownList}/${fieldName}`;
    return this.http.get(url);
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
