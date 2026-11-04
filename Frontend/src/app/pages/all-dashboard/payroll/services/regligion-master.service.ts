import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RegligionMasterService {

  constructor(private http:HttpClient) { }

  add_RegligionMaster( data:any):Observable<any> {
      const apiUrl = `${environment.baseURL1}${environment.payroll. Regligion_insert}`;
      return this.http.post<any>(apiUrl,data);  // Returning any type
    }
    getAllRegligion(pageIndex: number , pageSize: number): Observable<any> {
      const url = `${environment.baseURL1}${environment.payroll.Regligion_getall }?pageIndex=${pageIndex}&pageSize=${pageSize}`;
      return this.http.get<any>(url);
    }
    updateRegligion(religionid:any): Observable<any> {
      const apiUrl = `${environment.baseURL1}${environment.payroll.Regligion_update }`;  // Ensure 'update' exists in environment
      return this.http.put<any>(apiUrl, religionid);
    }
     // Get account by ID
     getRegligionById(religionid: string): Observable<any> {
      const apiUrl = `${environment.baseURL1}${environment.payroll.Regligion_getbyId}/${religionid}`;
      return this.http.get<any>(apiUrl);
    }
    
    deleteRegligion(religionid: string): Observable<any> {
      const apiUrl = `${environment.baseURL1}${environment.payroll. Regligion_delete }/${religionid}`;
      return this.http.delete<any>(apiUrl);
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
      const view_url = `${environment.baseURL1}${environment.payroll.Regligion_getall}?pageIndex=${pageIndex}&pageSize=${pageSize}`;
    
      return this.http.get<any>(view_url);  // Returning any type
    
    }
  
}
