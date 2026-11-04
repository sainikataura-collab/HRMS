import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CategoryMasterServiceService {

  constructor(private http:HttpClient) { }

  add_categoryMaster(data:any):Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.Insert_CategoryMaster }`;
    return this.http.post<any>(view_url,data);  // Returning any type
  }
  get_categoryMaster(pageIndex: number , pageSize: number):Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.Get_CategoryMaster}?pageIndex=${pageIndex}&pageSize=${pageSize}`;
    return this.http.get(view_url);  // Returning any type
  }
 
  update_categoryMaster(data:any):Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.Update_CategoryMaster}`;
    return this.http.put<any>(view_url,data);  // Returning any type
  }


  getById_categoryMaster(pk_Catid:string):Observable<any>{
    const view_url = `${environment.baseURL1}${environment.payroll.GetById_CategoryMaster}/${pk_Catid}`;
    return  this.http.get<any[]>(view_url);
    }

  delete_categoryMaster(pk_Catid: string): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.Delete_CategoryMaster}/${pk_Catid}`;
    return this.http.delete<any>(view_url);
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
    const view_url = `${environment.baseURL1}${environment.payroll.Get_CategoryMaster}?pageIndex=${pageIndex}&pageSize=${pageSize}`;

    return this.http.get<any>(view_url);  // Returning any type

    }

}


