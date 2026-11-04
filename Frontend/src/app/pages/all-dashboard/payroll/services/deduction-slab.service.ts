import { Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DeductionSlabService {
constructor(private http:HttpClient) { }
 
   add_deductionSlab(data:any):Observable<any> {
     const view_url = `${environment.baseURL1}${environment.payroll.Insert_deductionSlab }`;
     return this.http.post<any>(view_url,data);  // Returning any type
   }
   get_deductionSlab(personType: string | null, pageIndex: number , pageSize: number):Observable<any> {
     let view_url = `${environment.baseURL1}${environment.payroll.Get_deductionSlab}?pageIndex=${pageIndex}&pageSize=${pageSize}`;
     if (personType !== null) {
      view_url += `&personType=${personType}`;
    }
     return this.http.get(view_url);  // Returning any type
   }


    getCompoffPendingLeave(): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.GetCompoffPendingLeave}`;
    return this.http.get(view_url);
  }

  getShortLeavePendingLeave(): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.GetShortLeavePendingLeave}`;
    return this.http.get(view_url);
  }
   
  
   update_deductionSlab(data:any):Observable<any> {
     const view_url = `${environment.baseURL1}${environment.payroll.Update_deductionSlab}`;
     return this.http.put<any>(view_url,data);  // Returning any type
   }
 
 
   getById_deductionSlab(pk_slabid:string):Observable<any>{
     const view_url = `${environment.baseURL1}${environment.payroll.GetById_deductionSlab}/${pk_slabid}`;
     return  this.http.get<any[]>(view_url);
     }
 
   delete_deductionSlab(pk_slabid: string): Observable<any> {
     const view_url = `${environment.baseURL1}${environment.payroll.Delete_deductionSlab}/${pk_slabid}`;
     return this.http.delete<any>(view_url);
   }
 
 
 
   DownloadExcel():Observable<any> {
     var pageIndex =0;
     var pageSize=100000;
     const view_url = `${environment.baseURL1}${environment.payroll.Get_deductionSlab}?pageIndex=${pageIndex}&pageSize=${pageSize}`;
 
     return this.http.get<any>(view_url);  // Returning any type
 
     }
 }
 