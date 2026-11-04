import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NewsPaperMasterService {

  constructor(private http: HttpClient) {}

  add_NewspaperMaster(data: any): Observable<any> {
    const apiUrl = `${environment.baseURL1}${environment.Requitment.NewsPaper_insert}`;
    return this.http.post<any>(apiUrl, data);
  }

  getAllNewsPaper(pageIndex: number, pageSize: number): Observable<any> {
    const url = `${environment.baseURL1}${environment.Requitment.NewsPaper_getall}?pageIndex=${pageIndex}&pageSize=${pageSize}`;
    return this.http.get<any>(url);
  }

  updateNewsPaper(newspaperId: string, data: any): Observable<any> {
    const apiUrl = `${environment.baseURL1}${environment.Requitment.NewsPaper_update}`;
    return this.http.put<any>(apiUrl, data);
  }

  getNewsPaperById(newspaperId: string): Observable<any> {
    const apiUrl = `${environment.baseURL1}${environment.Requitment.NewsPaper_getbyId}/${newspaperId}`;
    return this.http.get<any>(apiUrl);
  }

  deleteNewsPaper(newspaperId: string): Observable<any> {
    const apiUrl = `${environment.baseURL1}${environment.Requitment.NewsPaper_delete}/${newspaperId}`;
    return this.http.delete<any>(apiUrl);
  }

  CheckDuplicateValue(fieldName: string, fieldValue: string, generalId?: string): Observable<any> {
    let view_url = `${environment.baseURL1}${environment.payroll.IsValueAvailable}/${fieldName}?fieldValue=${fieldValue}`;
    if (generalId) {
      view_url += `&generalId=${generalId}`;
    }
    return this.http.get(view_url);
  }

  DownloadExcel(): Observable<any> {
    var pageIndex = 0;
    var pageSize = 100000;
    const view_url = `${environment.baseURL1}${environment.Requitment.NewsPaper_getall}?pageIndex=${pageIndex}&pageSize=${pageSize}`;
    return this.http.get<any>(view_url);
  }
}