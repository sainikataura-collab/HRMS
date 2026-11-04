import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class OfficeTypeMasterService {

  constructor(private http:HttpClient) { }
     
  
   add_OfficeTypeMaster( data:any):Observable<any> {
     const view_url = `${environment.baseURL1}${environment.payroll.Insert_officeTypeMaster}`;
     return this.http.post<any>(view_url,data);  // Returning any type
   }
   get_OfficeTypeMaster(page: number, pageSize: number):Observable<any> {
     const view_url = `${environment.baseURL1}${environment.payroll.Get_officeTypeMaster}`;
     return this.http.get<any>(view_url);  // Returning any type
   }

     // get by id or edit in functional master
  
     getById_OfficeTypeMaster(pk_offtypeid:number):Observable<any>{
      const view_url = `${environment.baseURL1}${environment.payroll.GetById_officeTypeMaster}/${pk_offtypeid}`;
      return  this.http.get<any[]>(view_url);
      }


   update_OfficeTypeMaster(data:any):Observable<any> {
     const view_url = `${environment.baseURL1}${environment.payroll.Update_officeTypeMaster}`;
     return this.http.put<any>(view_url,data);  // Returning any type
   }

   delete_OfficeTypeMaster(pk_offtypeid:number):Observable<any> {
     const view_url = `${environment.baseURL1}${environment.payroll.Delete_officeTypeMaster}/${pk_offtypeid}`;
     return this.http.delete<any>(view_url);  
   }

   CheckDuplicateValue(fieldName: string, fieldValue: string, generalId?: number): Observable<any> {
    let view_url = `${environment.baseURL1}${environment.payroll.IsValueAvailable}/${fieldName}?fieldValue=${fieldValue}`;
    if (generalId) {
      view_url += `&generalId=${generalId}`;
    }
  
    return this.http.get(view_url);
  }


  DownloadExcel():Observable<any> {
    var pageIndex =0;
    var pageSize=100000;
    const view_url = `${environment.baseURL1}${environment.payroll.Get_officeTypeMaster}?pageIndex=${pageIndex}&pageSize=${pageSize}`;

    return this.http.get<any>(view_url); 

    }


   
 }
 