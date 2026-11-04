import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NoService {

   constructor(private http:HttpClient) { }
   
     add_operationalMaster( data:any):Observable<any> {
         const view_url = `${environment.baseURL}${environment.payroll.BankMaster}`;
         return this.http.post<any>(view_url,data);  // Returning any type
       }
       get_operationalMaster():Observable<any> {
        const view_url = `${environment.baseURL}${environment.payroll.BankMaster}`;
        return this.http.get<any>(view_url);  // Returning any type
      }
       update_operationalMaster( id:number,data:any):Observable<any> {
         const view_url = `${environment.baseURL}${environment.payroll.BankMaster}`;
         return this.http.post<any>(view_url,data);  // Returning any type
       }
}
