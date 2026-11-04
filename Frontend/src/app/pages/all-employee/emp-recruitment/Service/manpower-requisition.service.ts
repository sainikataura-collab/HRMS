import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ManpowerRequisitionService {

  constructor(private http: HttpClient) {}

  insertManpower(data: any): Observable<any> {
    const apiUrl = `${environment.baseURL1}${environment.Requitment.insert_Manpower}`;
    return this.http.post<any>(apiUrl, data);
  }

  getAllManpower(pageIndex: number , pageSize: number): Observable<any> {
    const apiUrl = `${environment.baseURL1}${environment.Requitment.getAll_Manpower}?pageIndex=${pageIndex}&pageSize=${pageSize}`;
    return this.http.get<any>(apiUrl);
  }

getManpowerById(pk_ReqId: number): Observable<any> {
  const apiUrl = `${environment.baseURL1}${environment.Requitment.getById_Manpower}?pk_reqid=${pk_ReqId}`;
  return this.http.get<any>(apiUrl);
}
updateManpower(data: any, pk_reqid: number): Observable<any> {
  const apiUrl = `${environment.baseURL1}${environment.Requitment.update_Manpower}?pk_reqid=${pk_reqid}`;
  return this.http.put<any>(apiUrl, data);
}


deleteManpower(pk_ReqId: number): Observable<any> {
  const apiUrl = `${environment.baseURL1}${environment.Requitment.delete_Manpower}?pk_reqid=${pk_ReqId}`;
  return this.http.delete<any>(apiUrl);
}
  getDropdownData(fieldName: string): Observable<any> {
    const apiUrl = `${environment.baseURL1}${environment.payroll.DropdownList}/${fieldName}`;
    return this.http.get(apiUrl);
  }

  downloadExcel(): Observable<any> {
    const pageIndex = 0;
    const pageSize = 100000;
    const apiUrl = `${environment.baseURL1}${environment.Requitment.getAll_Manpower}?pageIndex=${pageIndex}&pageSize=${pageSize}`;
    return this.http.get<any>(apiUrl);
  }
}
