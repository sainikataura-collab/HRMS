import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApprovalSecDocService {

  constructor(private http: HttpClient) { }

  insert_ApprovalSectionDoc(data: any): Observable<any> {
    const url = `${environment.baseURL1}${environment.payroll.ApprovalSectionDoc_insert}`;
    return this.http.post<any>(url, data);
  }

  ApprovalSectionDoc_GetAll(filters: any = {}): Observable<any> {
    const url = `${environment.baseURL1}${environment.payroll.ApprovalSectionDoc_GetAll}`;
  
    // Construct request body with default values
    const requestBody = {
      ecode: filters.ecode || '',
      location: filters.location || '',
      department: filters.department || '',
      ename: filters.ename || '',
      leftstatus: filters.leftstatus || '',
      fk_companyId: filters.fk_companyId || '',
      fk_empid: filters.fk_empid || '',
      fk_finid: filters.fk_finid || ''
    };
  
    return this.http.post<any>(url, requestBody);
  }

  getdropDawn(fieldName: string): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.DropdownList}/${fieldName}`;
    return this.http.get(view_url);
  }
  
  Downloadfile(filename:string): Observable<Blob> {
    const view_url = `${environment.baseURL1}${environment.Compensation.Get_RebateDoc}?filename=${filename}`;
    return this.http.get(view_url,{ responseType: 'blob' });
  }
  

}
