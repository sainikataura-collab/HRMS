import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class ExportImportLeaveService {

  constructor(private http: HttpClient) { }
  getCommonDropdown(fieldName: string): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.Leave.Emp_DropdownList}/${fieldName}`;
    return this.http.get(view_url);
  }


  ExportLeave(body: any): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.ExportImportLeave}`;
    return this.http.post<any>(view_url, body);
  }

ExportImportleaveList(body: any): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.ExportImportleaveList}`;
    return this.http.post<any>(view_url, body);
  }

  Leave_ForImport(formData: FormData): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.ImportLeave}`;
    return this.http.post<any>(view_url, formData);
  }

}
