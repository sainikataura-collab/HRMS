import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ShiftMasterService {
 

  constructor(private http:HttpClient) { }

  
  insert_Shift( data:any):Observable<any>{
    const view_url = `${environment.baseURL1}${environment.payroll.Insert_Shift}`;
    return this.http.post<any>(view_url,data);  // Returning any type
  }



 

  getAll_Shift(pageIndex: number,pageSize: number): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.get_All_Shift}?pageIndex=${pageIndex}&pageSize=${pageSize}`;
    return this.http.get(view_url);
  }
  
  DownloadExcel():Observable<any> {
    var pageIndex =0;
    var pageSize=100000;
    const view_url = `${environment.baseURL1}${environment.payroll.get_All_Shift}?pageIndex=${pageIndex}&pageSize=${pageSize}`;

    return this.http.get<any>(view_url);  // Returning any type

    }
  
 
  delete_Shift(pk_shiftId : string): Observable<any> {
    const delete_url = `${environment.baseURL1}${environment.payroll.delete_Shift}/${pk_shiftId }`;
    return this.http.delete<any>(delete_url);  // Sending pk_id in URL
  }

  get_ShiftById(pk_shiftId: number): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.get_ShiftById}/${pk_shiftId}`;
    return this.http.get(view_url);
  }

  update_Shift(data: any): Observable<any> {
    const url = `${environment.baseURL1}${environment.payroll.Update_Shift}`;
    return this.http.put<any>(url, data);  // UPDATE operation
  }


    // CheckDuplicateValue(fieldName: string,fieldValue: string,): Observable<any> {
    //   const view_url = `${environment.baseURL1}${environment.payroll.DropdownList}/${fieldName}`;
    //   return this.http.get(view_url);
    // }
    
    CheckDuplicateValue(fieldName: string, fieldValue: string, generalId?: number): Observable<any> {
      let view_url = `${environment.baseURL1}${environment.payroll.IsValueAvailable}/${fieldName}?fieldValue=${fieldValue}`;
      if (generalId) {
        view_url += `&generalId=${generalId}`;
      }
    
      return this.http.get(view_url);
    }
    

  


}
