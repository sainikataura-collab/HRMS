import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LodgingBoardingService {

 constructor(private http:HttpClient) { }
 
      //insert 
   add_lodging_Boarding( data:any):Observable<any> {
     const view_url = `${environment.baseURL1}${environment.Travel_expense.add_lodging_Boarding}`;
     return this.http.post<any>(view_url,data);  // Returning any type
   }
   //get the section 
    // get_lodging_Boarding(pageIndex: number,pageSize: number): Observable<any> {
    //    const view_url = `${environment.baseURL1}${environment.Travel_expense.get_lodging_Boarding}?pageIndex=${pageIndex}&pageSize=${pageSize}`;
    //    return this.http.get(view_url);
    //  }
     
     get_lodging_Boarding(): Observable<any> {
        const view_url = `${environment.baseURL1}${environment.Travel_expense.get_lodging_Boarding}`;
        return this.http.get<any>(view_url);
      }
    //delete the section 
     delete_lodging_Boarding(pk_lodgingboardingId : number): Observable<any> {
       const delete_url = `${environment.baseURL1}${environment.Travel_expense.delete_lodging_Boarding}/${pk_lodgingboardingId }`;
       return this.http.delete<any>(delete_url);  // Sending pk_id in URL
     }
   //get  the section  by id
     get_lodging_Boarding_ById(pk_lodgingboardingId: number): Observable<any> {
       const view_url = `${environment.baseURL1}${environment.Travel_expense.get_lodging_Boarding_ById}/${pk_lodgingboardingId}`;
       return this.http.get(view_url);
     }
   //update the section
     update_lodging_Boarding(data: any): Observable<any> {
       const url = `${environment.baseURL1}${environment.Travel_expense.update_lodging_Boarding}`;
       return this.http.put<any>(url, data);  // UPDATE operation
     }
      //download the excel
      DownloadExcel():Observable<any> {
        var pageIndex =0;
        var pageSize=100000;
        const view_url = `${environment.baseURL1}${environment.Travel_expense.get_lodging_Boarding}?pageIndex=${pageIndex}&pageSize=${pageSize}`;
    
        return this.http.get<any>(view_url);  // Returning any type
    
        }
 
        getGrade(fieldName: string): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.DropdownList}/${fieldName}`;
    return this.http.get(view_url);
  }
}
