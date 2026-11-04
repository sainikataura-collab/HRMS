import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { ILeaveType } from '../Interface/icommon';

@Injectable({
  providedIn: 'root'
})
export class seniorityLevel{
 

  constructor(private http:HttpClient) { }

  
  save_seniorityLevel( data:any):Observable<any> {
    const view_url = `${environment.baseURL}${environment.payroll.Department}`;
    return this.http.post<any>(view_url,data);  // Returning any type
  }

  getEmpList(fieldName: string): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.DropdownList}/${fieldName}`;
    return this.http.get(view_url);
  }


}
