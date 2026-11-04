import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserMasterService {

  constructor(private http: HttpClient) { }

   
 DownloadExcel(): Observable<any> {
     var pageIndex =0;
  var pageSize=100000;
    const url = `${environment.baseURL1}${environment.payroll.UserMaster_getall}?pageIndex=${pageIndex}&pageSize=${pageSize}`;
    return this.http.get<any>(url);
  }




  add_User(data: any): Observable<any> {
    const url = `${environment.baseURL1}${environment.payroll.UserMaster_insert}`;
    return this.http.post<any>(url, data);
  }

 Change_WebUser(data: any): Observable<any> {
    const url = `${environment.baseURL1}${environment.payroll.UserChangePassword}`;
    return this.http.post<any>(url, data);
  } 

  // get_User(page: number, pageSize: number): Observable<any> {
  //   const url = `${environment.baseURL1}${environment.payroll.UserMaster_getall}?pageIndex=${page}&pageSize=${pageSize}`;
  //   return this.http.get<any>(url);
  // }
  get_User(page: number, pageSize: number, searchText: string = ''): Observable<any> {
    const url = `${environment.baseURL1}${environment.payroll.UserMaster_getall}?pageIndex=${page}&pageSize=${pageSize}&searchText=${encodeURIComponent(searchText)}`;
    return this.http.get<any>(url);
  }

  update_User(data: any): Observable<any> {
    const url = `${environment.baseURL1}${environment.payroll.UserMaster_update}`;
    return this.http.put<any>(url, data);
  }

  get_UserById(pk_userId: string): Observable<any> {
    const url = `${environment.baseURL1}${environment.payroll.UserMaster_getbyId}/${pk_userId}`;
    return this.http.get<any>(url);
  }

  delete_User(pk_userId: string): Observable<any> {
    const url = `${environment.baseURL1}${environment.payroll.UserMaster_delete}/${pk_userId}`;
    return this.http.delete<any>(url);
  }

  getEmployee(fieldName: string): Observable<any> {
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

  sendUserEmails(data: any): Observable<any> {
    let baseUrl = environment.payroll.UserMaster_getall;
    if (baseUrl.includes('?')) {
        baseUrl = baseUrl.split('?')[0]; // strip if anything is appended
    }
    const url = `${environment.baseURL1}${baseUrl}/send-emails`;
    return this.http.post<any>(url, data);
  }
}