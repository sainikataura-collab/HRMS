import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ClientMasterService {

  constructor(private http: HttpClient) { }

  add_clientmaster(data: any): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.add_clientmaster}`;
    return this.http.post<any>(view_url, data);
  }

  getById_clientmaster(pk_cost_centre_id: any): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.getById_clientmaster}/${pk_cost_centre_id}`;
    return this.http.get<any>(view_url);
  }

  update_clientmaster(data: any): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.update_clientmaster}`;
    return this.http.put<any>(view_url, data);
  }



  GetDdlListBasedOnCodeType(codeTypeId: number): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.GetDdlListBasedOnCodeType}?codeTypeId=${codeTypeId}`;
    return this.http.get<any>(view_url);
  }

  get_All_clientmaster(pageIndex: number, pageSize: number, searchTerm: string = ''): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.get_All_clientmaster}?pageIndex=${pageIndex}&pageSize=${pageSize}&searchTerm=${searchTerm}`;
    return this.http.get<any>(view_url);
  }

  DownloadExcel(): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.get_All_clientmaster}?pageIndex=0&pageSize=100000`;
    return this.http.get<any>(view_url);
  }

  getDropdownList(fieldName: string): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.DropdownList}/${fieldName}`;
    return this.http.get<any>(view_url);
  }

  CheckDuplicateValue(fieldName: string, fieldValue: string, generalId?: string): Observable<any> {
    let view_url = `${environment.baseURL1}${environment.payroll.IsValueAvailable}/${fieldName}?fieldValue=${fieldValue}`;
    if (generalId) {
      view_url += `&generalId=${generalId}`;
    }
    return this.http.get<any>(view_url);
  }

  delete_clientmaster(pk_cost_centre_id: number): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.delete_clientmaster}/${pk_cost_centre_id}`;
    return this.http.delete<any>(view_url);
  }
   getModelListByClient(pk_cost_centre_id: any): Observable<any> {
    const view_url = `${environment.baseURL1}/ClientMaster/GetModelListByClient/${pk_cost_centre_id}`;
    return this.http.get<any>(view_url);
  }

  getEarningHeads(): Observable<any> {
    const view_url = `${environment.baseURL1}/ClientMaster/GetEarningHeads`;
    return this.http.get<any>(view_url);
  }

  uploadClientLogo(formData: FormData): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.UploadClientLogo}`;
    return this.http.post<any>(view_url, formData);
  }
}
