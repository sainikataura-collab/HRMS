import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PageTypeRoleLinkService {
 constructor(private http:HttpClient) { }
    
 
  add_PageTypeRoleLink( data:any):Observable<any> {
    const view_url = `${environment.baseURL}${environment.payroll.BankMaster}`;
    return this.http.post<any>(view_url,data);  // Returning any type
  }
  get_PageTypeRoleLink(page: number, pageSize: number):Observable<any> {
    const view_url = `${environment.baseURL}${environment.payroll.BankMaster}`;
    return this.http.get<any>(view_url);  // Returning any type
  }
  update_PageTypeRoleLink(id:number,data:any):Observable<any> {
    const view_url = `${environment.baseURL}${environment.payroll.BankMaster}`;
    return this.http.post<any>(view_url,data);  // Returning any type
  }
  delete_PageTypeRoleLink(id:number):Observable<any> {
    const view_url = `${environment.baseURL}${environment.payroll.BankMaster}`;
    return this.http.delete<any>(view_url);  // Returning any type
  }
}
