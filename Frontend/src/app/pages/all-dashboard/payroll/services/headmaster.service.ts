import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Idesignation } from '../Interface/icommon';

@Injectable({
  providedIn: 'root'
})
export class HeadMasterService {
 

  constructor(private http:HttpClient) { }

  add_headMaster(data:any):Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.Insert_headMaster }`;
    return this.http.post<any>(view_url,data);  // Returning any type
  }
  get_headMaster(pageIndex: number, pageSize: number, searchTerm: string = ''):Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.Get_headMaster}?pageIndex=${pageIndex}&pageSize=${pageSize}&searchTerm=${encodeURIComponent(searchTerm)}`;
    return this.http.get(view_url);
  }
 
  update_headMaster(data:any):Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.Update_headMaster}`;
    return this.http.put<any>(view_url,data);  // Returning any type
  }


  getById_headMaster(pk_headid:string):Observable<any>{
    const view_url = `${environment.baseURL1}${environment.payroll.GetById_headMaster}/${pk_headid}`;
    return  this.http.get<any[]>(view_url);
    }

  delete_headMaster(pk_headid: string): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.Delete_headMaster}/${pk_headid}`;
    return this.http.delete<any>(view_url);
  }

  CheckDuplicateValue(fieldName: string, fieldValue: string, generalId?: string): Observable<any> {
    let view_url = `${environment.baseURL1}${environment.payroll.IsValueAvailable}/${fieldName}?fieldValue=${fieldValue}`;
    if (generalId) {
      view_url += `&generalId=${generalId}`;
    }
  
    return this.http.get(view_url);
  }
  get_DropdownList(fieldName: string): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.DropdownList}/${fieldName}`;
    return this.http.get(view_url);
  }
  DownloadExcel():Observable<any> {
    var pageIndex =0;
    var pageSize=100000;
    const view_url = `${environment.baseURL1}${environment.payroll.Get_headMaster}?pageIndex=${pageIndex}&pageSize=${pageSize}`;

    return this.http.get<any>(view_url);  // Returning any type

    }


    
      // Get employees with pagination and filters (Now using POST method)
  get_Head_Employees(pageIndex: number, pageSize: number,requestBody:any): Observable<any> {
    const url = `${environment.baseURL1}${environment.payroll.get_All_HeadAssign}?pageIndex=${pageIndex}&pageSize=${pageSize}`;
     return this.http.post<any>(url, requestBody);
   }

   
      // Get employees with pagination and filters (Now using POST method)
Update_HeadAssign(requestBody:any): Observable<any> {
    const url = `${environment.baseURL1}${environment.payroll.Update_HeadAssign}`;
     return this.http.put<any>(url, requestBody);
   }
}
