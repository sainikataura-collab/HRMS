
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SalaryDashboardService {

  constructor(private http: HttpClient) { }
  viewSalaryDashboardDetails(month: number, year: number): Observable<any> {
    //const view_url = `${environment.baseUrl}?Month=${month}&Year=${year}&EmpId=${empId}`;
    const view_url = `${environment.baseURL1}${environment.Salary.ViewSalaryDash}?Month=${month}&Year=${year}`;


    return this.http.get(view_url);
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