import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class QualificationMasterService {

  constructor(private http: HttpClient) {}

  add_QualificationMaster(data: any): Observable<any> {
    const apiUrl = `${environment.baseURL1}${environment.Requitment.Qualification_insert}`;
    return this.http.post<any>(apiUrl, data);
  }

  getAllQualification(pageIndex: number, pageSize: number): Observable<any> {
    const url = `${environment.baseURL1}${environment.Requitment.Qualification_getall}?pageIndex=${pageIndex}&pageSize=${pageSize}`;
    return this.http.get<any>(url);
  }

  updateQualification(pk_qualiId: any): Observable<any> {
    const apiUrl = `${environment.baseURL1}${environment.Requitment.Qualification_update}`;
    return this.http.put<any>(apiUrl, pk_qualiId);
  }

  getQualificationById(pk_qualiId: number): Observable<any> {
    const apiUrl = `${environment.baseURL1}${environment.Requitment.Qualification_getbyId}/${pk_qualiId}`;
    return this.http.get<any>(apiUrl);
  }

  deleteQualification(pk_qualiId: number): Observable<any> {
    const apiUrl = `${environment.baseURL1}${environment.Requitment.Qualification_delete}/${pk_qualiId}`;
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
    const view_url = `${environment.baseURL1}${environment.Requitment.Qualification_getall}?pageIndex=${pageIndex}&pageSize=${pageSize}`;
    return this.http.get<any>(view_url);
  }
}