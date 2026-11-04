import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PayrollService {
  

  constructor(private http:HttpClient) { }

  GetAllDepartmentList(pageNumber: number, pageSize: number): Observable<any> {
  const getAllOrdersUrl = `${environment.baseURL}${environment.payroll.Department}?pageNumber=${pageNumber}&pageSize=${pageSize}`;
  return this.http.get<any>(getAllOrdersUrl);
}



Get_PayrollDashboardList(data:any): Observable<any> {
  const getAllOrdersUrl = `${environment.baseURL1}${environment.payroll.Get_payrolldashboardlist}`;
  return this.http.post<any>(getAllOrdersUrl,data);
}

 Userdash(month: number, year: number): Observable<any> {
  const view_url = `${environment.baseURL1}${environment.payroll.Userdash}?month=${month}&year=${year}`;
  return this.http.get<any>(view_url);
}

HRdash(month: number, year: number): Observable<any> {
  const view_url = `${environment.baseURL1}${environment.payroll.GetHRDashboard}?month=${month}&year=${year}`;
  return this.http.get<any>(view_url);
}

EmployeeManangementdash(month: number, year: number): Observable<any> {
  const view_url = `${environment.baseURL1}${environment.payroll.GetEmpmanagementDashboard}?month=${month}&year=${year}`;
  return this.http.get<any>(view_url);
}

Attendancedash(month: number, year: number): Observable<any> {
  const view_url = `${environment.baseURL1}${environment.payroll.Attendancedash}?month=${month}&year=${year}`;
  return this.http.get<any>(view_url);
}

Taskboxdash(month: number, year: number): Observable<any> {
  const view_url = `${environment.baseURL1}${environment.payroll.Taskboxdash}?month=${month}&year=${year}`;
  return this.http.get<any>(view_url);
}

GetleaveDashboard(month: number, year: number): Observable<any> {
  const view_url = `${environment.baseURL1}${environment.payroll.GetleaveDashboard}?month=${month}&year=${year}`;
  return this.http.get<any>(view_url);
}
}
