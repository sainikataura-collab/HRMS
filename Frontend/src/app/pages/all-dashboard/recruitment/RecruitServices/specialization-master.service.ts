import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SpecializationMasterService {

  constructor(private http: HttpClient) {}

  add_SpecializationMaster(data: any): Observable<any> {
    const apiUrl = `${environment.baseURL1}${environment.Requitment.Specialization_insert}`;
    return this.http.post<any>(apiUrl, data);
  }

  getAllSpecialization(pageIndex: number, pageSize: number): Observable<any> {
    const url = `${environment.baseURL1}${environment.Requitment.Specialization_getall}?pageIndex=${pageIndex}&pageSize=${pageSize}`;
    return this.http.get<any>(url);
  }

  updateSpecialization(pk_SpecializationId: any): Observable<any> {
    const apiUrl = `${environment.baseURL1}${environment.Requitment.Specialization_update}`;
    return this.http.put<any>(apiUrl, pk_SpecializationId);
  }

  getSpecializationById(pk_SpecializationId: string): Observable<any> {
    const apiUrl = `${environment.baseURL1}${environment.Requitment.Specialization_getbyId}/${pk_SpecializationId}`;
    return this.http.get<any>(apiUrl);
  }

  deleteSpecialization(pk_SpecializationId: string): Observable<any> {
    const apiUrl = `${environment.baseURL1}${environment.Requitment.Specialization_delete}/${pk_SpecializationId}`;
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
    const view_url = `${environment.baseURL1}${environment.Requitment.Specialization_getall}?pageIndex=${pageIndex}&pageSize=${pageSize}`;
    return this.http.get<any>(view_url);
  }
}