import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TravelRateService {

  constructor(private http:HttpClient) { }
  add_TravelRate( data:any):Observable<any> {
       const view_url = `${environment.baseURL1}${environment.Travel_expense.add_TravelRate}`;
       return this.http.post<any>(view_url,data);  // Returning any type
     }
    
       get_TravelRate(): Observable<any> {
          const view_url = `${environment.baseURL1}${environment.Travel_expense.get_TravelRate}`;
          return this.http.get<any>(view_url);
        }
      //delete the section 
       delete_TravelRate(pk_RateID : number): Observable<any> {
         const delete_url = `${environment.baseURL1}${environment.Travel_expense.delete_TravelRate}/${pk_RateID }`;
         return this.http.delete<any>(delete_url);  // Sending pk_id in URL
       }
     //get  the section  by id
       get_TravelRate_ById(pk_RateID: number): Observable<any> {
         const view_url = `${environment.baseURL1}${environment.Travel_expense.get_TravelRate_ById}/${pk_RateID}`;
         return this.http.get(view_url);
       }
     //update the section
       update_TravelRate(data: any): Observable<any> {
         const url = `${environment.baseURL1}${environment.Travel_expense.update_TravelRate}`;
         return this.http.put<any>(url, data);  // UPDATE operation
       }
        //download the excel
        DownloadExcel():Observable<any> {
          var pageIndex =0;
          var pageSize=100000;
          const view_url = `${environment.baseURL1}${environment.Travel_expense.get_TravelRate}?pageIndex=${pageIndex}&pageSize=${pageSize}`;
      
          return this.http.get<any>(view_url);  // Returning any type
      
          }
            getTravelMode(fieldName: string): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.DropdownList}/${fieldName}`;
    return this.http.get(view_url);
  }
   
}
