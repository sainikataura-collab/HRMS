import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CityCategoryMasterServiceService {

  constructor(private http:HttpClient) { }
  add_cityCategoryMaster(data:any):Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.Insert_cityCategoryMaster}`;
    return this.http.post<any>(view_url,data);  // Returning any type
  }
  get_cityCategoryMaster(pageIndex: number , pageSize: number,):Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.Get_cityCategoryMaster}?pageIndex=${pageIndex}&pageSize=${pageSize}`;
    return this.http.get<any>(view_url);  // Returning any type
  }
  update_cityCategoryMaster(pk_ccid:string,data:any):Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.Update_cityCategoryMaster}`;
    return this.http.put<any>(view_url,data);  // Returning any type
  }


  getById_cityCategoryMaster(pk_ccid:string):Observable<any>{
    const view_url = `${environment.baseURL1}${environment.payroll.GetById_cityCategoryMaster}/${pk_ccid}`;
    return  this.http.get<any[]>(view_url);
    }

  delete_cityCategoryMaster(pk_ccid: string): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.Delete_cityCategoryMaster}/${pk_ccid}`;
    return this.http.delete<any>(view_url);
  }
  get_IsValueAvailable(fieldName: string , fieldValue: string,companyId:string):Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.General_IsValueAvailable }/${fieldName}?fieldValue=${fieldValue}&companyId=${companyId}`;
    return this.http.get<any>(view_url);  // Returning any type
  }
}
