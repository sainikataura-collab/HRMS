import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WebPageMasterService {

   constructor(private http:HttpClient) { }
      
   
    add_WebPageMaster( data:any):Observable<any> {
      const view_url = `${environment.baseURL}${environment.payroll.BankMaster}`;
      return this.http.post<any>(view_url,data);  // Returning any type
    }
    get_WebPageMaster(page: number, pageSize: number):Observable<any> {
      const view_url = `${environment.baseURL}${environment.payroll.BankMaster}`;
      return this.http.get<any>(view_url);  // Returning any type
    }
    update_WebPageMaster(id:number,data:any):Observable<any> {
      const view_url = `${environment.baseURL}${environment.payroll.BankMaster}`;
      return this.http.post<any>(view_url,data);  // Returning any type
    }
    delete_WebPageMaster(id:number):Observable<any> {
      const view_url = `${environment.baseURL}${environment.payroll.BankMaster}`;
      return this.http.delete<any>(view_url);  // Returning any type
    }
  }
  