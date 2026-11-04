import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DueclearencemasterService {

  constructor(private http: HttpClient) { }

  GetAll(pageIndex: number, pageSize: number): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.Exit.DueClearenceMasterGetAll}?pageIndex=${pageIndex}&pageSize=${pageSize}`;
    return this.http.get(view_url);  // Returning any type
  }


  addClearance(data: any): Observable<any> {
    const apiUrl = `${environment.baseURL1}${environment.Exit.DueClearenceMasterInsert}`;
    return this.http.post<any>(apiUrl, data);

  }
  updateClearance(data: any): Observable<any> {
    const url = `${environment.baseURL1}${environment.Exit.DueClearenceMasterUpdate}`;
    return this.http.put<any>(url, data);  // UPDATE operation
  }


  delete_ClaranceUser(pk_clsdeptId: number): Observable<any> {
    const url = `${environment.baseURL1}${environment.Exit.DueClearenceMasterDelete}/${pk_clsdeptId}`;
    return this.http.delete<any>(url);
  }

  getByIdClearanceUser(pk_clsdeptId: number): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.Exit.DueClearenceMasterGetById}/${pk_clsdeptId}`;
    return this.http.get<any[]>(view_url);
  }

  DownloadExcel(): Observable<any> {
    var pageIndex = 0;
    var pageSize = 100000000;
    const view_url = `${environment.baseURL1}${environment.Exit.DueClearenceMasterGetAll}?pageIndex=${pageIndex}&pageSize=${pageSize}`;

    return this.http.get<any>(view_url);  // Returning any type
  }

  GetUserClearanceList(pageIndex: number, pageSize: number): Observable<any> {
    const url = `${environment.baseURL1}${environment.Exit.DueClearanceUserGetAll}?pageIndex=${pageIndex}&pageSize=${pageSize}`;
    return this.http.get(url);
  }

  addUserClearance(data: any): Observable<any> {
    const url = `${environment.baseURL1}${environment.Exit.DueClearanceUserInsert}`;
    return this.http.post(url, data);
  }

  getUserClearanceById(id: number): Observable<any> {
    const url = `${environment.baseURL1}${environment.Exit.DueClearanceUserGetById}/${id}`;
    return this.http.get(url);
  }

  updateUserClearance(data: any): Observable<any> {
    const url = `${environment.baseURL1}${environment.Exit.DueClearanceUserUpdate}`;
    return this.http.put(url, data);
  }
}
