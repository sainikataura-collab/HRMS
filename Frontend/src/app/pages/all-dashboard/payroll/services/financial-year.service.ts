import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FinancialYearService {

  constructor(private http:HttpClient) { }
    
    add_FinancialYear( data:any):Observable<any> {
       const view_url = `${environment.baseURL1}${environment.payroll.Insert_Fin_Year}`;
       return this.http.post<any>(view_url,data);  // Returning any type
     }


     get_FinancialYear(pageIndex: number,pageSize: number): Observable<any> {
      const view_url = `${environment.baseURL1}${environment.payroll.Get_Fin_Year}?pageIndex=${pageIndex}&pageSize=${pageSize}`;
      return  this.http.get<any>(view_url);
    }

    get_FinancialYearId(pk_finId: string): Observable<any> {
      const view_url = `${environment.baseURL1}${environment.payroll.GetById_Fin_Year}/${pk_finId}`;
      return this.http.get(view_url);
    }
    
    OnChange(pk_finid: string, data: any): Observable<any> {
      const view_url = `${environment.baseURL1}${environment.payroll.OnChange}/${pk_finid}`;
      return this.http.put<any>(view_url, data);
    }
    
  
     get_FinancialYearchangedata():Observable<any> {
      const view_url = `${environment.baseURL1}${environment.payroll.Forchangeyeardata}`;
      return this.http.get<any>(view_url);  // Returning any type
     }

     update_FinancialYear( id:string,data:any):Observable<any> {
       const view_url = `${environment.baseURL1}${environment.payroll.Update_Fin_Year}`;
       return this.http.put<any>(view_url,data);  // Returning any type
     }
     delete_FinancialYear(pk_finid : string): Observable<any> {
      const delete_url = `${environment.baseURL1}${environment.payroll.Delete_Fin_Year}/${pk_finid }`;
      return this.http.delete<any>(delete_url);  // Sending pk_id in URL
    }
}
