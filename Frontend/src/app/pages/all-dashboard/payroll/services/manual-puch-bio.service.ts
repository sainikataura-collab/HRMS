import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ManualPunchBio {

  constructor(private http:HttpClient) { }
  get_Manual_Details(empcode: string,month: string,year:string): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.Get_ManualPunch}?fk_empid=${empcode}&fk_monthId=${month}&fk_yearId=${year}`;
    return this.http.get(view_url);
  }

  getCommanList(fieldName: string): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.DropdownList}/${fieldName}`;
    return this.http.get(view_url);
  }

  

  getInOut_Byid(pk_inoutid: string): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.getById_InOut}/${pk_inoutid}`;
    return this.http.get(view_url);
  }
  // getMonthlist(fieldName: string): Observable<any> {
  //   const view_url = `${environment.baseURL1}${environment.payroll.GetMonthDropdown}/${fieldName}`;
  //   return this.http.get(view_url);
  // }
}
