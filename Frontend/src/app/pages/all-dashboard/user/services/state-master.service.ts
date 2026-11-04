import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class StateMasterService {

   constructor(private http:HttpClient) { }
      
   
    add_StateMaster( data:any):Observable<any> {
      const view_url = `${environment.baseURL}${environment.payroll.BankMaster}`;
      return this.http.post<any>(view_url,data);  // Returning any type
    }
    get_StateMaster(page: number, pageSize: number):Observable<any> {
      const view_url = `${environment.baseURL}${environment.payroll.BankMaster}`;
      return this.http.get<any>(view_url);  // Returning any type
    }
    update_StateMaster(id:number,data:any):Observable<any> {
      const view_url = `${environment.baseURL}${environment.payroll.BankMaster}`;
      return this.http.post<any>(view_url,data);  // Returning any type
    }
    delete_StateMaster(id:number):Observable<any> {
      const view_url = `${environment.baseURL}${environment.payroll.BankMaster}`;
      return this.http.delete<any>(view_url);  // Returning any type
    }
  }
  