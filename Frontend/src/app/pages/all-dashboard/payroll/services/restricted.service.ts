import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { ILeaveType } from '../Interface/icommon';

@Injectable({
  providedIn: 'root'
})
export class RestrictedService{
 

 
  constructor(private http:HttpClient) { }

  add_ResHolidayMaster( data:any):Observable<any> {
   const view_url = `${environment.baseURL1}${environment.payroll.Insert_resHoliday }`;
   return this.http.post<any>(view_url,data);  // Returning any type
 }
 
 get_ResHolidayMaster(fk_yearid: number | null, pageIndex: number, pageSize: number): Observable<any> {
   let view_url = `${environment.baseURL1}${environment.payroll.get_All_resHoliday}?pageIndex=${pageIndex}&pageSize=${pageSize}`;
 
   if (fk_yearid !== null) {
     view_url += `&fk_yearid=${fk_yearid}`;
   }
 
   return this.http.get(view_url);
 }
 
 
 
 getById_ResHolidayMaster(pk_holidayid:string):Observable<any>{
   const view_url = `${environment.baseURL1}${environment.payroll.get_resHoliday}/${pk_holidayid}`;
   return  this.http.get<any[]>(view_url);
   }
 
 update_ResHolidayMaster(data:any):Observable<any> {
   const view_url = `${environment.baseURL1}${environment.payroll.Update_resHoliday}`;
   return this.http.put<any>(view_url,data);  // Returning any type
 }
 
 delete_ResHolidayMaster(pk_holidayid:string): Observable<any> {
   const view_url = `${environment.baseURL1}${environment.payroll.delete_resHoliday}/${pk_holidayid}`;
   return this.http.delete<any>(view_url);
 }
 
 getYear(fieldName: string): Observable<any> {
   const view_url = `${environment.baseURL1}${environment.payroll.DropdownList}/${fieldName}`;
   return this.http.get(view_url);
 }
  
 getLocation(fieldName: string): Observable<any> {
   const view_url = `${environment.baseURL1}${environment.payroll.DropdownList}/${fieldName}`;
   return this.http.get(view_url);
 }
 
 //download excel

 downloadExcel():Observable<any> {
  var pageIndex =0;
  var pageSize=100000;
  let view_url = `${environment.baseURL1}${environment.payroll.get_All_resHoliday}?pageIndex=${pageIndex}&pageSize=${pageSize}`;
 
  return this.http.get<any>(view_url);  // Returning any type
}
                

}
