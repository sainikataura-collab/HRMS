import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RoleMastersService {

  constructor(private http:HttpClient) { }
   // add functional master
     add_RoleMasters(data:any):Observable<any> {
       const view_url = `${environment.baseURL1}${environment.payroll.add_RoleMasters }`;
       return this.http.post<any>(view_url,data);  // Returning any type
     }
 
     // Get Functional master
 
     get_RoleMasters(pageIndex: number , pageSize: number):Observable<any> {
       const view_url = `${environment.baseURL1}${environment.payroll.get_RoleMasters}?pageIndex=${pageIndex}&pageSize=${pageSize}`;
       return this.http.get(view_url);  // Returning any type
     }
 
     // update functional master
    
     update_RoleMasters(data:any):Observable<any> {
       const view_url = `${environment.baseURL1}${environment.payroll.update_RoleMasters}`;
       return this.http.put<any>(view_url,data);  // Returning any type
     }
   
 
     // get by id or edit in functional master
   
     getById_RoleMasters(RoleId:number):Observable<any>{
       const view_url = `${environment.baseURL1}${environment.payroll.getById_RoleMasters}/${RoleId}`;
       return  this.http.get<any[]>(view_url);
       }
 
       // delete in functional master
   
     delete_RoleMasters(RoleId:number): Observable<any> {
       const view_url = `${environment.baseURL1}${environment.payroll.delete_RoleMasters}/${RoleId}`;
       return this.http.delete<any>(view_url);
     }
   
 
     // check dublicate data entry in descrption
     CheckDuplicateValue(fieldName: string, fieldValue: string, generalId: number): Observable<any> {
       let view_url = `${environment.baseURL1}${environment.payroll.IsValueAvailable}/${fieldName}?fieldValue=${fieldValue}`;
       if (generalId) {
         view_url += `&generalId=${generalId}`;
       }
     
       return this.http.get(view_url);
     }
 
 
 
 
    
 
       DownloadExcel():Observable<any> {
         var pageIndex =0;
         var pageSize=100000;
         const view_url = `${environment.baseURL1}${environment.payroll.get_RoleMasters}?pageIndex=${pageIndex}&pageSize=${pageSize}`;
     
         return this.http.get<any>(view_url);  // Returning any type
     
         }
     
   
}
