import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HolidaysMasterServiceService {

  constructor(private http:HttpClient) { }

  add_HolidayMaster( data:any):Observable<any> {
   const view_url = `${environment.baseURL1}${environment.payroll.Insert_holidayMaster }`;
   return this.http.post<any>(view_url,data);  // Returning any type
 }
 
 get_HolidayMaster(fk_yearid: number | null, pageIndex: number, pageSize: number): Observable<any> {
   let view_url = `${environment.baseURL1}${environment.payroll.Get_holidayMaster}?pageIndex=${pageIndex}&pageSize=${pageSize}`;
 
   if (fk_yearid !== null) {
     view_url += `&fk_yearid=${fk_yearid}`;
   }
 
   return this.http.get(view_url);
 }
 
 
 
 getById_HolidayMaster(pk_holidayid:string):Observable<any>{
   const view_url = `${environment.baseURL1}${environment.payroll.GetById_holidayMaster}/${pk_holidayid}`;
   return  this.http.get<any[]>(view_url);
   }
 
 update_HolidayMaster(data:any):Observable<any> {
   const view_url = `${environment.baseURL1}${environment.payroll.Update_holidayMaster}`;
   return this.http.put<any>(view_url,data);  // Returning any type
 }
 
 delete_HolidayMaster(pk_holidayid:string): Observable<any> {
   const view_url = `${environment.baseURL1}${environment.payroll.Delete_holidayMaster}/${pk_holidayid}`;
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
 CheckDuplicateValue(fieldName: string, fieldValue: string, generalId?: string): Observable<any> {
   let view_url = `${environment.baseURL1}${environment.payroll.IsValueAvailable}/${fieldName}?fieldValue=${fieldValue}`;
   if (generalId) {
     view_url += `&generalId=${generalId}`;
   }
 
   return this.http.get(view_url);
 }
  DownloadExcel():Observable<any> {
     var pageIndex =0;
     var pageSize=100000;
     const view_url = `${environment.baseURL1}${environment.payroll.Get_holidayMaster}?pageIndex=${pageIndex}&pageSize=${pageSize}`;
 
     return this.http.get<any>(view_url);  // Returning any type
 
     }

     // for working day
     InsertWorkingDayMasterAsync( data:any):Observable<any> {
   const view_url = `${environment.baseURL1}${environment.payroll.InsertWorkingDayMasterAsync }`;
   return this.http.post<any>(view_url,data);  // Returning any type
 }
 
 WorkingDayMasterGetAll(fk_yearid: number | null, pageIndex: number, pageSize: number): Observable<any> {
   let view_url = `${environment.baseURL1}${environment.payroll.WorkingDayMasterGetAll}?pageIndex=${pageIndex}&pageSize=${pageSize}`;
 
   if (fk_yearid !== null) {
     view_url += `&fk_yearid=${fk_yearid}`;
   }
 
   return this.http.get(view_url);
 }
 
 
 
 GetWorkingDayMasterByIdAsync(pk_holidayid:string):Observable<any>{
   const view_url = `${environment.baseURL1}${environment.payroll.GetWorkingDayMasterByIdAsync}/${pk_holidayid}`;
   return  this.http.get<any[]>(view_url);
   }
 
 UpdateWorkingDayMasterAsync(data:any):Observable<any> {
   const view_url = `${environment.baseURL1}${environment.payroll.UpdateWorkingDayMasterAsync}`;
   return this.http.put<any>(view_url,data);  // Returning any type
 }
 
 DeleteWorkingDayMasterAsync(pk_holidayid:string): Observable<any> {
   const view_url = `${environment.baseURL1}${environment.payroll.DeleteWorkingDayMasterAsync}/${pk_holidayid}`;
   return this.http.delete<any>(view_url);
 }
 DownloadExcelforworkingDay ():Observable<any> {
     var pageIndex =0;
     var pageSize=100000;
     const view_url = `${environment.baseURL1}${environment.payroll.WorkingDayMasterGetAll}?pageIndex=${pageIndex}&pageSize=${pageSize}`;
 
     return this.http.get<any>(view_url);  // Returning any type
 
     }

 }
 
 
 